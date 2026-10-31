// Content data. This is a bulk / gifting enquiry site — not a shop: no prices, no carts, a short curated range.
// `img` points at mood photography in assets/img until the brand's own product photos replace it.

// "What we make" — a handful of signature pieces, each framed by how it's ordered in bulk.
export const SIGNATURES = [
  {
    id: 'truffles', name: 'Truffles', img: 'craft-finish',
    line: 'Hand-rolled ganache in milk, dark and white chocolate, finished one by one.',
    goodFor: ['Festive hampers', 'Corporate boxes', 'Wedding favours'],
  },
  {
    id: 'bonbonnieres', name: 'Bonbonnières', img: 'pieces-milk',
    line: 'Nuts, berries and seeds set in chocolate — our most giftable piece.',
    goodFor: ['Diwali gifting', 'Client gifting', 'Assorted boxes'],
  },
  {
    id: 'dates', name: 'Chocolate Dates', img: 'texture-dark',
    line: 'Medjool dates filled with pistachio, almond or hazelnut, then dipped.',
    goodFor: ['Festive hampers', 'Diwali boxes', 'Family gifting'],
  },
  {
    id: 'hearts', name: 'Hearts & Mendiants', img: 'pieces-white',
    line: 'Ganache hearts and fruit-scattered discs, made for small, personal gifts.',
    goodFor: ['Return gifts', 'Stocking fillers', 'Thank-you notes'],
  },
  {
    id: 'bars', name: 'Bars & Bark', img: 'bar-close',
    line: 'Centre-filled and decorated bars, and hand-broken bark — up to our 1 KG signature.',
    goodFor: ['Custom bars', 'Branded gifting', 'Sharing platters'],
  },
];

export const FESTIVE = [
  {
    id: 'diwali', name: 'Diwali', kicker: 'The festival of lights', img: 'diwali',
    title: 'Gifts that glow a little longer.',
    copy: 'Hampers and gift boxes for family, friends and the whole office — packed by hand, tied with gold, and filled with the chocolates people actually finish.',
    offers: [['Festive hampers', 'Curated assortments in keepsake boxes'], ['Personalised gifting', 'Names, notes and your choice of chocolates'], ['Corporate gifting', 'Branded orders for teams and clients']],
  },
  {
    id: 'christmas', name: 'Christmas', kicker: 'Warmth, wrapped', img: 'christmas',
    title: 'A box worth waiting under the tree for.',
    copy: 'Truffles, dipped fruit and bonbonnières in festive boxes — for teams, secret Santas and the table on the 25th.',
    offers: [['Christmas gift boxes', 'Festive assortments, ready to give'], ['Team gifting', 'One box per person, packed and labelled'], ['Party platters', 'Mixed pieces for gatherings']],
  },
  {
    id: 'newyear', name: 'New Year', kicker: 'Here’s to what’s next', img: 'newyear',
    title: 'Begin the year on a sweet note.',
    copy: 'Celebration hampers and custom boxes for parties, clients and the people who made the year — finished with a little champagne gold.',
    offers: [['Celebration hampers', 'Generous boxes for sharing'], ['Custom gift boxes', 'Your selection, your message'], ['Client gifting', 'Bulk orders for a fresh start']],
  },
];

export const INTERESTS = ['Corporate gifting', 'Festive hampers', 'Bulk order', '1 KG chocolate bars', 'Custom chocolate bars', 'Personalised packaging', 'Wedding / event favours', 'Something else'];
