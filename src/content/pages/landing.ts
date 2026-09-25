import type { ContentFields, ContentPageDefinition } from '../../types';
import heroFallback from '../../assets/hero.png';

const rowFields = [
  { key: 'label', label: 'Label', type: 'text' as const },
  { key: 'value', label: 'Value', type: 'text' as const },
];

const ICON_HINT = 'Name of a Material Symbols icon, e.g. "info" or "schedule" (see fonts.google.com/icons).';

/** Restaurant copy is also the base default, matching the old fallback of the landing chrome. */
const restaurantChrome: ContentFields = {
  locationFallback: 'Mayfair, London',
  openStatus: 'Open for Dinner',
  primaryButton: 'Order Online',
  secondaryButton: 'Reserve a Table',
  card1Icon: 'concierge',
  card1Title: 'Amenities',
  card1Rows: [
    { id: 'r1', label: 'Valet Parking', value: 'Available' },
    { id: 'r2', label: 'Private Dining', value: 'Vault Room' },
    { id: 'r3', label: 'Wheelchair Access', value: 'Fully Accessible' },
    { id: 'r4', label: 'Wi-Fi', value: 'Complimentary' },
  ],
  card2Icon: 'info',
  card2Title: 'The Details',
  card2Rows: [
    { id: 'r1', label: 'Dress Code', value: 'Smart Casual' },
    { id: 'r2', label: 'Dining Style', value: 'Fine Dining' },
    { id: 'r3', label: 'Payment', value: 'Visa, MC, AMEX' },
    { id: 'r4', label: 'Corkage', value: '$50 per bottle' },
  ],
};

export const landingContent: ContentPageDefinition = {
  key: 'landing',
  label: 'Homepage extras',
  description:
    'The main homepage sections (hero, about, gallery, testimonials and so on) are edited under Website → Homepage. This page covers everything else on the homepage: the quick action bar, the info cards, fallback text shown when a section field is left empty, and small labels.',
  previewHash: '#/',
  groups: [
    {
      id: 'actionBar',
      title: 'Quick action bar',
      description: 'The bar under the hero banner with your location, open status and two shortcut buttons.',
      fields: [
        { key: 'locationFallback', label: 'Location text', type: 'text', hint: 'Only shown when your address in Brand settings has no neighbourhood/city.' },
        { key: 'openStatus', label: 'Open status badge', type: 'text' },
        { key: 'primaryButton', label: 'First button', type: 'text', hint: 'Opens your online menu / shop.' },
        { key: 'secondaryButton', label: 'Second button', type: 'text', hint: 'Opens your booking page.' },
      ],
    },
    {
      id: 'infoCards',
      title: 'Info cards',
      description: 'The three cards below the action bar. The third card always lists your opening hours from Brand settings.',
      fields: [
        { key: 'card1Title', label: 'First card title', type: 'text' },
        { key: 'card1Icon', label: 'First card icon', type: 'text', hint: ICON_HINT },
        { key: 'card1Rows', label: 'First card rows', type: 'list', itemFields: rowFields },
        { key: 'card2Title', label: 'Second card title', type: 'text' },
        { key: 'card2Icon', label: 'Second card icon', type: 'text', hint: ICON_HINT },
        { key: 'card2Rows', label: 'Second card rows', type: 'list', itemFields: rowFields },
        { key: 'hoursTitle', label: 'Opening hours card title', type: 'text' },
      ],
    },
    {
      id: 'hero',
      title: 'Hero banner fallbacks',
      description: 'Used only when the matching field in Website → Homepage → Hero is left empty.',
      fields: [
        { key: 'heroEyebrow', label: 'Small text above the title', type: 'text' },
        { key: 'heroHeading', label: 'Title', type: 'text', hint: '{brand} is replaced with your business name.' },
        { key: 'heroDescription', label: 'Description', type: 'textarea', hint: '{city} is replaced with the area from your address.' },
        { key: 'heroButtonText', label: 'Button text', type: 'text' },
        { key: 'heroFallbackImage', label: 'Background image', type: 'image', hint: 'Shown when no hero background image is chosen.' },
      ],
    },
    {
      id: 'about',
      title: 'About section fallbacks',
      description: 'Used only when the matching field in Website → Homepage → About is left empty.',
      fields: [
        { key: 'aboutEyebrow', label: 'Small text above the title', type: 'text' },
        { key: 'aboutHeading', label: 'Title', type: 'text' },
        { key: 'aboutDescription', label: 'Description', type: 'textarea' },
        { key: 'aboutStoryLink', label: '"Read the story" link text', type: 'text', hint: 'Shown on the photo next to the chef/owner name.' },
      ],
    },
    {
      id: 'featured',
      title: 'Featured items & offers',
      fields: [
        { key: 'featuredViewAll', label: 'Featured items "see all" link', type: 'text' },
        { key: 'offerCtaFallback', label: 'Offer button text', type: 'text', hint: 'Used when an offer has no button text of its own.' },
        { key: 'offerValidThrough', label: 'Offer expiry line', type: 'text', hint: '{date} is replaced with the offer end date.' },
      ],
    },
    {
      id: 'location',
      title: 'Location section',
      fields: [{ key: 'locationHoursTitle', label: 'Opening hours heading', type: 'text' }],
    },
    {
      id: 'offerBadges',
      title: 'Offer badges',
      description: 'The small tag on each offer card.',
      advanced: true,
      fields: [
        { key: 'offerBadgePercent', label: 'Percentage discount', type: 'text', hint: '{value} is the discount number.' },
        { key: 'offerBadgeFixed', label: 'Fixed amount discount', type: 'text', hint: '{value} is the discount amount.' },
        { key: 'offerBadgeSpecial', label: 'Special price', type: 'text', hint: '{price} is the special price.' },
        { key: 'offerBadgeBogo', label: 'Buy one get one', type: 'text' },
      ],
    },
    {
      id: 'labels',
      title: 'Hours, prices & accessibility labels',
      advanced: true,
      fields: [
        { key: 'closedLabel', label: '"Closed" label', type: 'text', hint: 'Shown for days you are closed.' },
        { key: 'hoursRange', label: 'Opening hours format', type: 'text', hint: '{open} and {close} are the opening and closing times.' },
        {
          key: 'weekdays',
          label: 'Day names',
          type: 'list',
          fixedItems: true,
          itemFields: [
            { key: 'short', label: 'Short (info card)', type: 'text' },
            { key: 'full', label: 'Full (location section)', type: 'text' },
          ],
        },
        { key: 'featuredPrice', label: 'Featured item price format', type: 'text', hint: '{price} is the item price.' },
        { key: 'mapTitle', label: 'Map description for screen readers', type: 'text' },
      ],
    },
  ],
  defaults: {
    ...restaurantChrome,
    hoursTitle: 'Opening Hours',
    heroEyebrow: 'Mayfair, London',
    heroHeading: '{brand}',
    heroDescription: 'Experience invisible excellence at our flagship dining room in {city}.',
    heroButtonText: 'Reserve a Table',
    heroFallbackImage: heroFallback,
    aboutEyebrow: 'The Philosophy',
    aboutHeading: 'A sanctuary of light and culinary precision.',
    aboutDescription: 'At {brand}, we believe the finest dining experiences are those where the service is felt but not seen.',
    aboutStoryLink: 'Read the full story',
    featuredViewAll: 'View Full Menu',
    offerCtaFallback: 'View Menu',
    offerValidThrough: 'Valid through {date}',
    locationHoursTitle: 'Opening Hours',
    offerBadgePercent: '{value}% OFF',
    offerBadgeFixed: '${value} OFF',
    offerBadgeSpecial: 'Now ${price}',
    offerBadgeBogo: 'Buy 1 Get 1',
    closedLabel: 'Closed',
    hoursRange: '{open} - {close}',
    weekdays: [
      { id: 'mon', short: 'Mon', full: 'Monday' },
      { id: 'tue', short: 'Tue', full: 'Tuesday' },
      { id: 'wed', short: 'Wed', full: 'Wednesday' },
      { id: 'thu', short: 'Thu', full: 'Thursday' },
      { id: 'fri', short: 'Fri', full: 'Friday' },
      { id: 'sat', short: 'Sat', full: 'Saturday' },
      { id: 'sun', short: 'Sun', full: 'Sunday' },
    ],
    featuredPrice: '${price}',
    mapTitle: 'Location map',
  },
  verticalDefaults: {
    restaurant: restaurantChrome,
    gym: {
      locationFallback: 'Downtown',
      openStatus: 'Open Now',
      primaryButton: 'View Programs',
      secondaryButton: 'Book a Class',
      card1Icon: 'fitness_center',
      card1Title: 'Facilities',
      card1Rows: [
        { id: 'r1', label: 'Free Parking', value: 'On-site' },
        { id: 'r2', label: 'Showers & Lockers', value: 'Available' },
        { id: 'r3', label: 'Towel Service', value: 'Included' },
        { id: 'r4', label: 'Wi-Fi', value: 'Complimentary' },
      ],
      card2Icon: 'card_membership',
      card2Title: 'Membership Info',
      card2Rows: [
        { id: 'r1', label: 'Trial Class', value: 'First one free' },
        { id: 'r2', label: 'Cancellation', value: 'Anytime, no fee' },
        { id: 'r3', label: 'Payment', value: 'Visa, MC, AMEX' },
        { id: 'r4', label: 'Guest Passes', value: '2 per month' },
      ],
    },
    retail: {
      locationFallback: 'Downtown',
      openStatus: 'Open Now',
      primaryButton: 'Shop Now',
      secondaryButton: 'Book a Fitting',
      card1Icon: 'local_shipping',
      card1Title: 'Shipping & Returns',
      card1Rows: [
        { id: 'r1', label: 'Free Shipping', value: 'Orders over $75' },
        { id: 'r2', label: 'Easy Returns', value: '30-day window' },
        { id: 'r3', label: 'Gift Wrapping', value: 'Available' },
        { id: 'r4', label: 'Curbside Pickup', value: 'Same day' },
      ],
      card2Icon: 'storefront',
      card2Title: 'Store Info',
      card2Rows: [
        { id: 'r1', label: 'Payment', value: 'Visa, MC, AMEX' },
        { id: 'r2', label: 'Loyalty Program', value: 'Points on every order' },
        { id: 'r3', label: 'Price Match', value: 'On request' },
        { id: 'r4', label: 'Gift Cards', value: 'Available in-store' },
      ],
    },
  },
};
