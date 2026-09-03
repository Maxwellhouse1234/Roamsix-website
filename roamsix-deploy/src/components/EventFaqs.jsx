export default function EventFaqs({ items, eyebrow = 'Before you arrive', title = 'A few helpful details.' }) {
  return <section className="section light-section event-faqs"><div className="container">
    <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
    <div className="faq-list">{items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  </div></section>;
}
