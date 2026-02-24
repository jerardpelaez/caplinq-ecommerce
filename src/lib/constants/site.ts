export const SITE = {
  name: 'CAPLINQ',
  tagline: 'Specialty Chemicals & Electronic Materials',
  description: 'CAPLINQ is a specialty chemicals and electronic materials supplier serving the electronics, semiconductor, and industrial manufacturing industries.',
  url: 'https://www.caplinq.com',
  email: 'info@caplinq.com',
} as const;

export const NAV_ITEMS = [
  { label: 'Products', href: '/products' },
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const INDUSTRIES = [
  'Electronics & Semiconductor',
  'Automotive',
  'Aerospace & Defense',
  'Telecommunications',
  'Medical Devices',
  'LED & Lighting',
  'Power Electronics',
  'Consumer Electronics',
  'Industrial Manufacturing',
  'Renewable Energy',
] as const;

export const APPLICATIONS = [
  'Thermal Management',
  'Die Attach',
  'Encapsulation',
  'Underfill',
  'Conformal Coating',
  'Bonding & Assembly',
  'Potting & Sealing',
  'Surface Protection',
  'EMI/RFI Shielding',
  'Wire Bonding',
] as const;
