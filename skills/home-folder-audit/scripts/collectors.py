"""Optional local Docker metadata and process names, with no environments or DB rows."""
from collections import Counter
import json
import os
import shutil
import subprocess

COMMAND_TIMEOUT = 15
CONTAINER_METADATA_TEMPLATE = (
    '{"mounts":{{json .Mounts}},"health":'
    '{{if .State.Health}}{{json .State.Health.Status}}{{else}}null{{end}}}'
)
DOCKER_TEMPLATES = {
    "containers": ["ps", "-a", "--no-trunc", "--format", "{{json .}}"],
    "images": ["image", "ls", "--no-trunc", "--format", "{{json .}}"],
    "volumes": ["volume", "ls", "--format", "{{json .}}"],
    "networks": ["network", "ls", "--no-trunc", "--format", "{{json .}}"],
}
DOCKER_FIELDS = {
    "containers": ("ID", "Names", "Image", "State", "Status", "Size", "Mounts"),
    "images": ("ID", "Repository", "Tag", "Size", "Containers"),
    "volumes": ("Name", "Driver", "Mountpoint"),
    "networks": ("ID", "Name", "Driver", "Scope"),
}


def command(arguments):
    result = subprocess.run(arguments, capture_output=True, text=True, timeout=COMMAND_TIMEOUT)
    if result.returncode:
        raise ValueError(f"Command failed: {arguments[0]} {arguments[1]} (exit {result.returncode})")
    return result.stdout


def processes(root):
    try:
        output = command(["ps", "-axo", "comm="])
        names = Counter()
        for value in output.splitlines():
            if value.startswith(str(root) + "/"):
                names[value] += 1
            elif value.startswith("/Applications/") and ".app/" in value:
                names[value.split(".app/", 1)[0] + ".app"] += 1
        return {"status": "complete", "items": dict(sorted(names.items()))}
    except (OSError, ValueError, subprocess.TimeoutExpired):
        return {"status": "unavailable", "reason": "Process-name inventory could not be read"}


def docker_metadata(enabled):
    if not enabled:
        return {"status": "not_requested"}
    if not shutil.which("docker"):
        return {"status": "unavailable", "reason": "Docker CLI is not installed"}
    # Refuse an overridden host rather than accidentally querying a remote daemon.
    if os.environ.get("DOCKER_HOST"):
        return {"status": "unavailable", "reason": "DOCKER_HOST is set; effective daemon needs explicit review"}
    data = {"status": "unavailable", "collections": {}}
    try:
        context = command(["docker", "context", "show"]).strip()
        endpoint = command(["docker", "context", "inspect", context,
                            "--format", "{{.Endpoints.docker.Host}}"]).strip()
        data.update(context=context, endpoint=endpoint)
        if not endpoint.startswith("unix://"):
            data["reason"] = "Selected endpoint is not a local Unix socket; remote inspection skipped"
            return data
        prefix = ["docker", "--context", context]
        for name, args in DOCKER_TEMPLATES.items():
            records = [json.loads(line) for line in command(prefix + args).splitlines()]
            data["collections"][name] = [
                {key: record.get(key) for key in DOCKER_FIELDS[name]} for record in records
            ]
        ids = [record["ID"] for record in data["collections"]["containers"]]
        for record, identifier in zip(data["collections"]["containers"], ids):
            # Project only required fields; full inspect includes secret-bearing envs.
            metadata = json.loads(command(prefix + ["inspect", "--format", CONTAINER_METADATA_TEMPLATE, identifier]))
            record["Health"] = metadata["health"]
            record["MountDetails"] = [
                {key: mount.get(key) for key in ("Type", "Name", "Source", "Destination", "RW")}
                for mount in metadata["mounts"]
            ]
        data["space_usage"] = command(prefix + ["system", "df"])
        data["status"] = "complete"
    except (OSError, ValueError, KeyError, subprocess.TimeoutExpired) as error:
        data["reason"] = str(error)
        # Incomplete collections cannot prove any resource was removed.
    return data


def docker_changes(previous, current):
    if current.get("status") == "not_requested":
        return {"status": "not_requested"}
    if previous is None and current.get("status") == "complete":
        return {"status": "first_run"}
    if not previous or previous.get("status") != "complete" or current.get("status") != "complete":
        return {"status": "unknown", "reason": "Both Docker inventories must be complete"}
    if (previous.get("context"), previous.get("endpoint")) != (current.get("context"), current.get("endpoint")):
        return {"status": "unknown", "reason": "Docker context or endpoint changed"}
    changes = {}
    for name in DOCKER_TEMPLATES:
        def index(source):
            return {(row.get("ID") or row.get("Name"), row.get("Repository"), row.get("Tag")): row
                    for row in source["collections"][name]}
        def meaningful(row):
            # Docker's human Status string changes with elapsed uptime.
            return {key: value for key, value in row.items() if key != "Status"}
        old, new = index(previous), index(current)
        changes[name] = {
            "added": [new[key] for key in new.keys() - old.keys()],
            "removed": [old[key] for key in old.keys() - new.keys()],
            "changed": [{"before": old[key], "after": new[key]}
                        for key in old.keys() & new.keys() if meaningful(old[key]) != meaningful(new[key])],
        }
    return {"status": "compared", "collections": changes}
