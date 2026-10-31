// Content data. This is a bulk / gifting enquiry site — not a shop: no prices, no carts, a short curated range.
// Product photos (p-*) are the brand's own; festive photos are Pexels placeholders.

// "What we make" — a handful of signature pieces, each framed by how it's ordered in bulk.
export const SIGNATURES = [
  {
    id: 'truffles', name: 'Truffles', img: 'p-truffle-milk', alt: 'Milk chocolate truffles with a piped white chocolate cross',
    line: 'Milk, dark and white truffles, each finished with a hand-piped cross.',
    goodFor: ['Festive boxes', 'Corporate gifting', 'Wedding favours'],
  },
  {
    id: 'rochers', name: 'Rochers', img: 'p-rochers', alt: 'Milk chocolate almond rochers',
    line: 'Roasted almond flakes gathered in milk or dark chocolate.',
    goodFor: ['Assorted boxes', 'Client gifting', 'Diwali hampers'],
  },
  {
    id: 'mendiants', name: 'Mendiants', img: 'p-mendiants', alt: 'Dark chocolate mendiants topped with almonds, pistachios and berries',
    line: 'Chocolate discs topped with almonds, pistachios, cranberries, blueberries and seeds.',
    goodFor: ['Festive hampers', 'Return gifts', 'Sharing platters'],
  },
  {
    id: 'barks', name: 'Barks', img: 'p-barks', alt: 'Dark chocolate bark with apricots, cranberries and pistachios',
    line: 'Hand-broken bark with apricots, cranberries, pistachios and a white chocolate swirl.',
    goodFor: ['Gift jars', 'Corporate boxes', 'Christmas gifting'],
  },
  {
    id: 'hearts', name: 'Fruit & Nut Hearts', img: 'p-heart', alt: 'Faceted chocolate hearts filled with cashews, almonds and seeds',
    line: 'Faceted chocolate hearts filled with cashews, almonds, pumpkin seeds and sesame.',
    goodFor: ['Personal gifts', 'Weddings', 'Thank-you notes'],
  },
  {
    id: 'boxes', name: 'Assorted Gift Boxes', img: 'p-box', alt: 'Bees & Beans gift box of assorted chocolates tied with a branded ribbon',
    line: 'Milk, dark and white pieces under glass, tied with the Bees & Beans ribbon.',
    goodFor: ['Diwali', 'Corporate orders', 'Weddings'],
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
    copy: 'Truffles, rochers, mendiants and barks in festive boxes — for teams, secret Santas and the table on the 25th.',
    offers: [['Christmas gift boxes', 'Festive assortments, ready to give'], ['Team gifting', 'One box per person, packed and labelled'], ['Party platters', 'Mixed pieces for gatherings']],
  },
  {
    id: 'newyear', name: 'New Year', kicker: 'Here’s to what’s next', img: 'newyear',
    title: 'Begin the year on a sweet note.',
    copy: 'Celebration hampers and custom boxes for parties, clients and the people who made the year — finished with a little champagne gold.',
    offers: [['Celebration hampers', 'Generous boxes for sharing'], ['Custom gift boxes', 'Your selection, your message'], ['Client gifting', 'Bulk orders for a fresh start']],
  },
];

export const INTERESTS = ['Corporate gifting', 'Festive hampers', 'Assorted gift boxes', 'Bulk order', 'Custom assortments', 'Personalised packaging', 'Wedding / event favours', 'Something else'];
