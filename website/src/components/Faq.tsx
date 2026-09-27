import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { faqs } from "@/lib/site";

export default function Faq() {
  return <Accordion type="single" collapsible className="faq-list">{faqs.map((faq, index) => <AccordionItem key={faq.question} value={`question-${index}`}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}</Accordion>;
}
