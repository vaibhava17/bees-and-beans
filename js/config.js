// Business details — edit here; every link, form and WhatsApp message reads from this file.
export const BRAND = {
  name: 'Bees & Beans',
  tagline: 'Handmade Chocolates',
  phone: '+91 70185 05301',
  phoneHref: '+917018505301',
  whatsapp: '917018505301', // country code + number, digits only
  email: 'beesbeanschocolates@gmail.com',
  address: 'C-9/5, Eldeco Estate One, Sector 4, Panipat, Haryana 132103',
  city: 'Panipat, Haryana',
  instagram: '', // e.g. 'https://instagram.com/…' — hidden while empty
  // Optional: paste a Formspree (or similar) endpoint to also receive enquiries by email.
  // While empty, the form hands the enquiry to WhatsApp, with an email fallback.
  formEndpoint: '',
};

export const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
