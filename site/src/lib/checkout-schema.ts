import { z } from 'zod';

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Western North',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
] as const;

/**
 * Accepts 0244123456, 024 412 3456, 233244123456 or +233244123456 and returns the
 * local 10-digit form (0244123456), or null when it is not a valid Ghana number.
 */
export function normalizeGhanaPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, '');
  let local: string | null = null;
  if (/^\+?233\d{9}$/.test(digits)) local = '0' + digits.replace(/^\+?233/, '');
  else if (/^0\d{9}$/.test(digits)) local = digits;
  return local;
}

/** 0244123456 -> 233244123456 (for wa.me links) */
export function toInternationalPhone(local: string): string {
  return '233' + local.replace(/^0/, '');
}

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} is too long`);

export const customerSchema = z.object({
  fullName: text('Full name', 2, 80),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeGhanaPhone(v) !== null, 'Enter a valid Ghana phone number, e.g. 024 412 3456')
    .transform((v) => normalizeGhanaPhone(v) as string),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120),
  region: z.enum(GHANA_REGIONS, { errorMap: () => ({ message: 'Select your region' }) }),
  city: text('Town / area', 2, 80),
  address: text('Delivery address', 5, 200),
  landmark: z.string().trim().max(120).optional().default(''),
  digitalAddress: z
    .string()
    .trim()
    .max(20)
    .optional()
    .default('')
    .refine(
      (v) => v === '' || /^[A-Za-z]{2}-?\d{3,4}-?\d{4}$/.test(v),
      'Ghana Post GPS looks like GA-123-4567'
    ),
  notes: z.string().trim().max(300).optional().default(''),
});

export const cartLineSchema = z.object({
  productId: z.string().min(1).max(80),
  size: z.string().min(1).max(10),
  /** Required for long-sleeve shirts (checked against the catalogue on the server). */
  fit: z.string().max(20).optional(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(cartLineSchema).min(1, 'Your bag is empty').max(20),
  /** Honeypot — real customers never fill this in. */
  website: z.string().max(200).optional().default(''),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerDetails = z.output<typeof customerSchema>;
export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutPayload = z.output<typeof checkoutSchema>;
