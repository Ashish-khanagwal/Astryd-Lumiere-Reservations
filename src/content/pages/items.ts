import type { ContentPageDefinition } from '../../types';

/** Browse-only showcase (#/items). Keys prefixed `a_`/`b_`/`c_` belong to that Items layout only. */
export const itemsContent: ContentPageDefinition = {
  key: 'items',
  label: 'Menu / Items showcase',
  description: 'A view-only page for browsing everything you offer, without ordering.',
  previewHash: '#/items',
  module: 'items',
  groups: [
    {
      id: 'a_header',
      title: 'Page header',
      variants: ['a'],
      fields: [
        { key: 'a_eyebrow', label: 'Small heading above the title', type: 'text' },
        { key: 'a_title', label: 'Title', type: 'text' },
        { key: 'a_introBefore', label: 'Introduction - text before the link', type: 'text' },
        { key: 'a_introLink', label: 'Introduction - link to order online', type: 'text' },
        { key: 'a_introAfter', label: 'Introduction - text after the link', type: 'text' },
      ],
    },
    {
      id: 'a_labels',
      title: 'Filters',
      advanced: true,
      variants: ['a'],
      fields: [{ key: 'a_allFilter', label: '"All" filter', type: 'text' }],
    },
    {
      id: 'b_header',
      title: 'Page header',
      variants: ['b'],
      fields: [
        { key: 'b_eyebrow', label: 'Small heading above the title', type: 'text' },
        { key: 'b_title', label: 'Title', type: 'text' },
        { key: 'b_reserveButton', label: 'Reserve button', type: 'text' },
      ],
    },
    {
      id: 'b_labels',
      title: 'Counts',
      advanced: true,
      variants: ['b'],
      fields: [
        { key: 'b_programCount', label: 'Number of programs in a group', type: 'text', hint: '{count} is replaced with the number.' },
      ],
    },
    {
      id: 'c_header',
      title: 'Page header',
      variants: ['c'],
      fields: [
        { key: 'c_eyebrow', label: 'Small heading above the title', type: 'text' },
        { key: 'c_title', label: 'Title', type: 'text' },
      ],
    },
    {
      id: 'c_labels',
      title: 'Filters',
      advanced: true,
      variants: ['c'],
      fields: [{ key: 'c_allFilter', label: '"All" filter', type: 'text' }],
    },
  ],
  defaults: {
    a_eyebrow: 'A Curated Selection',
    a_title: 'The Menu',
    a_introBefore: 'Take a look through what we offer.',
    a_introLink: 'Order online',
    a_introAfter: "whenever you're ready.",
    a_allFilter: 'All',
    b_eyebrow: 'Explore',
    b_title: 'Our Programs',
    b_reserveButton: 'Reserve a spot',
    b_programCount: '{count} programs',
    c_eyebrow: 'Lookbook',
    c_title: 'The Collection',
    c_allFilter: 'All',
  },
  verticalDefaults: {
    gym: {
      a_eyebrow: 'What We Offer',
      a_title: 'Our Programs',
      a_introBefore: 'Explore our classes and coaching.',
      a_introLink: 'Book online',
      c_eyebrow: 'Explore',
      c_title: 'Our Programs',
    },
    retail: {
      a_eyebrow: 'Shop the Range',
      a_title: 'The Collection',
      a_introBefore: 'Browse everything we stock.',
      a_introLink: 'Shop online',
      b_eyebrow: 'Explore',
      b_title: 'Our Collections',
      b_reserveButton: 'Book an appointment',
      b_programCount: '{count} products',
    },
  },
};
