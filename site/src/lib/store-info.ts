/** Public store details shown around the site. */
export const STORE = {
  name: 'ShapeWearFit',
  location: 'Accra, Ghana',
  /** Public WhatsApp / call number (local format). */
  phone: '0596121149',
  /** Same number in international format, for wa.me links. */
  whatsappIntl: '233596121149',
  snapchat: 'barronstack',
} as const;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${STORE.whatsappIntl}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
