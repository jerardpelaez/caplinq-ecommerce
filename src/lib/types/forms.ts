import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const QuoteRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  items: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    quantity: z.number().positive('Quantity must be positive'),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  deliveryTimeline: z.enum(['urgent', '1-2-weeks', '1-month', 'flexible']).optional(),
  message: z.string().optional(),
});

export const SampleRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company name is required'),
  productSku: z.string(),
  productName: z.string(),
  application: z.string().min(1, 'Please describe your application'),
  quantity: z.string().optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type QuoteRequestData = z.infer<typeof QuoteRequestSchema>;
export type SampleRequestData = z.infer<typeof SampleRequestSchema>;
