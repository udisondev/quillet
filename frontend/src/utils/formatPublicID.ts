/** Formats a public ID as groups of 4 characters separated by spaces (e.g. "XXXX XXXX XXXX XXXX"). */
export function formatPublicID(id: string): string {
  const clean = id.replace(/\s/g, "").toUpperCase();
  const groups: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    groups.push(clean.substring(i, i + 4));
  }
  return groups.join(" ");
}
