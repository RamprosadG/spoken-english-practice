interface JsonLdProps {
  data: object | object[];
}

/**
 * A native script tag rather than next/script, because JSON-LD is data and is
 * never executed. Escaping `<` is what stops a stored `</script>` inside a
 * presentation or a sentence from closing this tag and injecting markup.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}