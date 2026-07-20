/** First paragraph of a blog post's content, trimmed for use as a meta description / excerpt. */
export function excerpt(content: string, maxLength = 160): string {
  const firstParagraph = content.split("\n\n")[0]?.trim() ?? "";
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return `${firstParagraph.slice(0, maxLength - 1).trimEnd()}…`;
}
