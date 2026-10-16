# Apple signing and notarization

Use for first setup, an authentication failure, or credential maintenance.
Normal releases reuse the setup. Check the installed tooling and Apple account
state before changing them. This process distributes outside the Mac App Store.

## Inspect first

Confirm the selected team belongs to the intended owner. Personal and organization
teams can coexist in one login. Inspect certificate names, team, expiration and
whether the corresponding private key is available; a downloaded certificate
alone cannot sign. Do not output private keys or secret-store contents.

Check native host architecture, the pinned Node/package manager, Xcode command-line
tools, `codesign`, `security`, `xcrun notarytool`, `xcrun stapler`, and the packager's
supported configuration. A prerequisites check is useful but does not prove that
Apple will accept the credentials; an actual signed/notarized build does.

## Signing identity

Reuse an appropriate valid Developer ID Application identity when authorized.
For new issuance, generate the private key and certificate signing request locally
using Keychain Access or the project's secure tooling. Send only the public CSR
to Apple's certificate flow. Download/import the resulting certificate and verify
it pairs with that private key and the intended team. Preserve a protected backup
according to the owner's credential policy.

Use **Developer ID Application** for the app. **Developer ID Installer** is for a
signed installer package such as PKG; a drag-to-Applications DMG is not a reason
to create that second certificate. See Apple's
[certificate types and issuance procedure](https://developer.apple.com/help/account/certificates/create-developer-id-certificates/).

For CI, export the authorized identity plus its private key as an encrypted P12
and store it and its password separately in protected secrets. Import into a
job-scoped keychain, grant only the required signing access, and clean it up.
Never treat base64 as encryption. Reuse the keychain integrations supplied by the
installed packager when suitable; do not globally loosen the user's keychain.

## Notarization authentication

Choose one method supported by the installed tooling:

- App Store Connect API key: obtain authorized API access if missing, create a
  key with the least role the notarization tooling actually supports, and record
  its key ID, issuer (for team keys) and private P8 through a secret channel.
- Apple ID with app-specific password: use the correct team and secure credential
  storage. Never use the ordinary account password in build configuration.

Team and individual API keys have different issuer/tool-version requirements.
Inspect the installed notarization library rather than applying one invocation
to both. Do not mix the two authentication methods. Apple login, two-factor checks,
agreements and API-access requests may need owner participation or explicit
account authorization; reuse authorization already provided and explain only the
actual remaining blocker. API access for notarization does not mean submitting
an app for App Store review.

The pinned library's instructions should guide configuration; see
[electron/notarize authentication](https://github.com/electron/notarize#usage).
When supported, validate credentials with its secure profile mechanism before a
large build. Store downloaded P8 material immediately in the approved secret store;
do not dump download contents or an unredacted browser page into tool output.

## Secret ownership

These are common electron-builder conventions, not required universal variable names:

| Consumer | Typical inputs | Handling |
| --- | --- | --- |
| Release signer | `CSC_LINK`, `CSC_KEY_PASSWORD`, optional `CSC_NAME` | P12/keychain in release environment only |
| Notarizer | `APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER` | P8 path at runtime; protect its source content |
| Alternate notarizer | `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | Configure only if this method is selected |
| Verification | Expected team and bundle IDs | Non-secret checked configuration |
| License issuer | App-specific proof-signing private key | Server only; ship only its public key |

If CI stores P8 content rather than a path, write it into a private temporary file
with restrictive permissions and remove it in an always-run cleanup. Mask outputs,
disable shell tracing, and avoid secret command-line values or raw diagnostics.
Inspect how the installed builder interprets `CSC_NAME`; some releases add the
certificate-type prefix themselves. Validate the identity actually selected.

If a secret is exposed, stop repeating it. Identify the affected consumers, rotate
within authorization, update each consumer securely, verify the replacement, and
invalidate the exposed credential. Do not rotate unrelated credentials by default.

## Build ordering

Sign nested native code and helpers with the required hardened runtime/entitlements,
then notarize and staple the app **before** producing its updater archive. Build the
DMG from that same app, notarize/staple it, and compute final hashes only afterward.
Let the packager own these hooks when it already implements them correctly; do not
submit twice or mutate a signed bundle after its evidence was recorded.

Use [Apple's notarization overview](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
and [custom workflow guidance](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow)
for the current service requirements. Signing, accepted notarization, attached
tickets and Gatekeeper acceptance are separate checks. Never disable Gatekeeper,
strip quarantine to make a test pass, or accept ad-hoc signing as a release result.

Routine releases need account work only when a real expiry, revocation, membership,
role or agreement problem occurs. Never revoke a shared Developer ID identity just
to simplify setup for another app; assess its other consumers first.
