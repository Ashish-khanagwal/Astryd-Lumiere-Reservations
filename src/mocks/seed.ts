import { db, nowIso, type MockDbShape } from './db';
import type {
  Addon,
  BrandSettings,
  Homepage,
  HomepageSection,
  MediaAsset,
  MenuCategory,
  MenuItem,
  Offer,
  Order,
  OrderLineItem,
  OrderPaymentMethod,
  OrderServiceType,
  OrderStatus,
  Reservation,
  ReservationAvailabilitySettings,
  ReservationStatus,
  Restaurant,
  User,
  WeekDay,
} from '../types';

export const RESTAURANT_ID = 'rest_lumiere';
export const RESTAURANT_SLUG = 'lumiere-mayfair';
/** Demo password accepted for every seeded account - mock auth only, never real. */
export const DEMO_PASSWORD = 'password123';

const GALLERY_SEED = [
  {
    id: 'media_gallery_1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8ahzV-qIr22Is_b8mUE8ZmFoYSg6UIiCOEuDGEcKRIjnUPd0mPnpt4ygBsi_JGlLMaQkItlCuNo6k36T1YYd4uaU1zoVRM3qrereIuSuADm5MQUgTpS600hMNOiLD9E6waygSgdOF2hRatW5Hh48IzFShpVgUp5ABu79zo68vOQWKv1Wy949N0PUp9CAsUJg9hiAPXAjWLbS1vB6pUebHkwNWFh_Y0BJP4kaMxcSGr1xeu1AsmF41ttCSrPao62HFMy6ihibr3Vg',
    title: 'The Vault Room',
    caption: 'Private dining vault featuring mahogany table and hand-blown amber chandelier.',
  },
  {
    id: 'media_gallery_2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ2SwfE-L4ENpw0vIUBXHTsJ5WtR_WchM-HleBOHJAKcVE2EBoTYxscGxwzwDphMvAL9Pm3bTQC8jItpGg-PcEX1N9MSqhU2utK5AyJayd_q0O_cOC9f6IAl0iRpUqomC_fV9pMHcOmnPnX0Sou3nleMjzMJkmyjHFb6knQH015fgsy3GnbPME85GyiNwRQCGkXjkwlICjSCGB3pd2zxXB7PMtsokmlyiVv3KycxRD8J9mx0S1RZFZd-YIMe1fwVXt9dw_1vBgTKw',
    title: 'Sommelier Pouring',
    caption: 'Vintage premier grand cru classé poured into thin-stemmed crystal.',
  },
  {
    id: 'media_gallery_3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqIb_Uo23kTJpPcIMURUZmNrGyhHrLA_AkoSspLoXESUeC2-QgV1mYlBTlKppD6cilp8R3RB8mMxOlfndzPvfhL7xITN5VCYtU4icw39sQMq5p_re4-y6CvplHpd7U_bLH6AjvF_5pZvgdYCleJD2VLWxbX5KPeDhLZfgMDH3IkQEynd-x99MRLYQ26FI1narcNVF049Tj7tSmABL55PD8_mGdAhJKp7Bej6eAaI1hLCiWlXN50imkpkwNu1W9aTVnGekbswD9zQY',
    title: 'Artisanal Dessert',
    caption: 'Deconstructed chocolate sphere with gold leaf on dark slate plate.',
  },
  {
    id: 'media_gallery_4',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKPss8TPGgMf-Y8MWpZq7aApZrknob0u2vlymDMLhcYuMdNgwZXhjclHHA6gkgzQufxVduxJearT4yt3PYcPW6_kCoMg0q7Xadloi5XfMwIWLeuDMtGFvIs6hX8GkP3c0chRqFDlhm8yG_KEJzVuunyyLbzxvSI0hXAkImaPxly_M4lTDgM253D1Eo_MELJl8o7Nj0GsJZ9IxdvzVSfvVXJEAaMoUvfYR0yU_-XkvTK57-T2OdVgwsdYI7iC0mFynmdmjkuKj37EE',
    title: 'Kitchen Craftsmanship',
    caption: 'Precision garnish placement in our surgical kitchen environment.',
  },
  {
    id: 'media_gallery_5',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAwGaZwXFPwj_bW2Q-244iR4HQv3BBrLRimTlG7Zx5PXvy5wVqznhfUlSVoHqhSyDjw3sgTWooyhxQlzHVkoZPXjNdHNYUz9LW5-j7EmaI-loqCuwCt0TDoFqDvdCdYKB33SIzOS5pC-4ioszmueKo3kQ6kJS7D9865nk_NxyboX_xzvl7K0jI8beUHKgkl2cUpl7fp-h1E-KgvyBznyQiMOD9UA367j8BAHJgmODDWVVestXclKfTMumQuIOpXgt0-KHRc3JAFfM',
    title: 'Main Dining Room',
    caption: 'Panoramic golden hour lighting across soaring ceilings and crisp linens.',
  },
];

const HERO_BG_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQbyYUDRt6Ie5sV8x34REUiRO9cxq65xZQidv0ToYVkQhSkqTUhN1V8UhO9WW-PoCz9WNOvazyBRZlgnJLmMdHLbj2VxmxZziIK3bdJCegH6dRc5gFthM3376iukAp0V3CPTrFLp4PbBE6UIQsBPk1Jq8AnESBdDkdA3s4A3s_1Y-m_26zcDI8e8-6dEEqoYx04LEWExavtkPbdqNXt_PmuZgrTFNrE1_skeUTqCvub7xleE072eCSUTlWRgEwBKCwPzo23h2zGEk';
const SEA_BASS_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAjxo7PTqnkb2ByquvTN4PSJF_aFOMai0e-66m_kY5OcMK4ScTwg9t57oCRYst1rzEc1Neh9Iga_77h8NhDXn967goGSOUgpMHysAY2CIrRlRJ3U6e1itvOO5qradubZrmmoH9PUKg-z1gvg7UrufKkcT9zCRHLBegT0IB6itGigaCDbCHmaqBzpvqf6up6BUoExydS2eQJt_XytyC1J_x5w_EPJit9xmrrqWS2zQa0ONiQUD9kIS7kzrbIZinwkH3ap4F35onxV2Y';
const CHEF_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCERWltkKVtse3b_wW36xjpnZH9THUDFygROWcQspdLRJ5HTiu6Q4NBDuP8s0kk_E5oXJtloZBVvgdvk9BSW6eZHPM0JIm2MWQi0JMbTSKmUFPHN4RR69klsdUG0fJLlQmNJl_wd_GzrcIxSvK19U9fBER_3KQL7fA0zIGK-dHc3w62l7nXnZm1R38Mognk_2XXCPih-BC_JYziLjhqu3dAC5c7svqIrWt6KOHKHronMZSMIgEaSepyrh4D-yb3FfW83BWYd5-39AA';

const RAW_ITEMS = [
  { id: '1', name: 'Classic Lumière Burger', category: 'Burgers', price: 24.0, description: 'Wagyu beef patty, triple-cream brie, caramelized shallots, and black truffle aioli on a gilded brioche bun.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPnMW5dTzCZOu7a6PpSjOSlCybHhDHqPeFSGTMzcjnJUv6rBGE21VIhFyzDKEvu-NBMg05nyksq-Lwkw0ossPDtrDTkqTN04smGY-4x3sKpcRpyUE8PrsMcLbrCIjXOpp6V1RwY6ZU5pDEaXNjeWCcBIuvx7PnpR0JM49W-TRK9SoAU_ZaCO_ypjMtuDH3Xf74s8govIaiFKYwFqrhV7YZS2cjgTcc0kGc8goiHp9sWbD-vQoIgo8mIqtFmvkNZUdko_I4t2P0Qbc', rating: 4.9, reviews: 120, prepTime: 15, badge: 'Chef Special' },
  { id: '2', name: 'Artisanal Pepperoni Pizza', category: 'Pizza', price: 21.0, description: 'Double-fermented sourdough, spicy calabrese, hot honey, and house-made buffalo mozzarella.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkCy0cRdoW0XthbpMq-yFA-zzuU-bFP9jHg2NTv8sGh3EohO-9aYfK7Dl5-I96z6f5kVU08oYYUTuQ5DMNyTeMikuOiPCQhM8gwpUJlG_K-45ftQPkeaBpFchmd-L9eZiWkvUz6VnF4KaJunClruzOJfkpV1gQugcoan1L0cP-BUMK1NLAkC-kH78J4zOIx-RSoJhW2WfCO42O_-CCtqspXCaTOFiIrzdNbVTW7ZO-t5eMPzEMxowDQFvBi5mSgVoZDUadMLBWbuM', rating: 4.8, reviews: 340, prepTime: 12, badge: 'Popular' },
  { id: '3', name: 'Bourbon BBQ Smoke Burger', category: 'Burgers', price: 26.0, description: 'Double beef patty, maple-cured bacon, crispy tobacco onions, and house bourbon glaze.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB07yMQwR76dh5D0-v3MBWBnL3ssfCTKGyCeBFg6jCV6apKSWuJ7r4QgeWROPdFGBcTEzEMFHYZ5UuXxp7elteDC3l8djSmj-okvh33bDz6Z4pUr-ZyPp-WcmhBQc_VghB9iwogm47jb1eYg71auUezC4tyTwRaFVijmT_pdPMcEO8uGZ_j4CZFfLeo85Wn4F-zjBt4ReFBT5L5nYXZHX8Lt8gU48YRbDZcCZqRWkOJC1sSSSVhq4n3PdpMR7hDae52qOnReftxOEg', rating: 4.7, reviews: 85, prepTime: 18, badge: undefined },
  { id: '4', name: 'Spicy Buffalo Wings', category: 'Starters', price: 18.0, description: 'Sous-vide then double-fried wings tossed in aged cayenne sauce. Served with roquefort dip.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbNGfsC8gCsW8lFrJs3yS08HEqpI3QxOqmPTqDuXYiIArhpoLfT2JoIEFFqFD0PD5ANgfPbDlmuQwtg1CGoIy9uEkguffKTxkD00xaEnHp7BMIRKzxABKSsZgWTTQs-UzTYMdpp01BSBCMxUzKhq8lAKrBY6PtVxVp9Vg38jaFFY0VvlSSPvtBi8Dm2BNd2oFg92Swe-F2EIWpCL8LXByIRzzrxTHfJdHN9NvNJsf6gROQQrDf6pMibfjTWtMvwQLXAtTCz2CU9GA', rating: 4.6, reviews: 1100, prepTime: 10, badge: undefined },
  { id: '5', name: 'Sea Bass Tartare & Citrus', category: 'Starters', price: 34.0, description: 'Wild sea bass, edible gold leaf, micro-herbs, and ruby grapefruit reduction.', image: SEA_BASS_URL, rating: 4.9, reviews: 420, prepTime: 12, badge: 'Signature' },
  { id: '6', name: 'Truffle & Wild Mushroom Pasta', category: 'Pasta', price: 29.0, description: 'Handcrafted tagliatelle, black summer truffle, chanterelles, and 36-month Parmigiano Reggiano.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqIb_Uo23kTJpPcIMURUZmNrGyhHrLA_AkoSspLoXESUeC2-QgV1mYlBTlKppD6cilp8R3RB8mMxOlfndzPvfhL7xITN5VCYtU4icw39sQMq5p_re4-y6CvplHpd7U_bLH6AjvF_5pZvgdYCleJD2VLWxbX5KPeDhLZfgMDH3IkQEynd-x99MRLYQ26FI1narcNVF049Tj7tSmABL55PD8_mGdAhJKp7Bej6eAaI1hLCiWlXN50imkpkwNu1W9aTVnGekbswD9zQY', rating: 4.9, reviews: 510, prepTime: 15, badge: undefined, isVeg: true },
  { id: '7', name: 'Wagyu Ribeye Steak (300g)', category: 'Steaks', price: 65.0, description: 'A5 Japanese Wagyu steak, bone marrow butter, roasted garlic head, and smoked sea salt flakes.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8ahzV-qIr22Is_b8mUE8ZmFoYSg6UIiCOEuDGEcKRIjnUPd0mPnpt4ygBsi_JGlLMaQkItlCuNo6k36T1YYd4uaU1zoVRM3qrereIuSuADm5MQUgTpS600hMNOiLD9E6waygSgdOF2hRatW5Hh48IzFShpVgUp5ABu79zo68vOQWKv1Wy949N0PUp9CAsUJg9hiAPXAjWLbS1vB6pUebHkwNWFh_Y0BJP4kaMxcSGr1xeu1AsmF41ttCSrPao62HFMy6ihibr3Vg', rating: 5.0, reviews: 290, prepTime: 20, badge: 'Luxury' },
  { id: '8', name: 'Deconstructed Chocolate Sphere', category: 'Desserts', price: 28.0, description: 'Valrhona 70% dark chocolate, gold leaf finish, warm hazelnut praline pour over vanilla bean gelato.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqIb_Uo23kTJpPcIMURUZmNrGyhHrLA_AkoSspLoXESUeC2-QgV1mYlBTlKppD6cilp8R3RB8mMxOlfndzPvfhL7xITN5VCYtU4icw39sQMq5p_re4-y6CvplHpd7U_bLH6AjvF_5pZvgdYCleJD2VLWxbX5KPeDhLZfgMDH3IkQEynd-x99MRLYQ26FI1narcNVF049Tj7tSmABL55PD8_mGdAhJKp7Bej6eAaI1hLCiWlXN50imkpkwNu1W9aTVnGekbswD9zQY', rating: 4.9, reviews: 640, prepTime: 10, badge: 'Popular', isVeg: true },
  { id: '9', name: 'Château Margaux 2015 Premier Cru', category: 'Beverages', price: 185.0, description: 'Sommelier selected premier grand cru classé, decanted and temperature-controlled.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ2SwfE-L4ENpw0vIUBXHTsJ5WtR_WchM-HleBOHJAKcVE2EBoTYxscGxwzwDphMvAL9Pm3bTQC8jItpGg-PcEX1N9MSqhU2utK5AyJayd_q0O_cOC9f6IAl0iRpUqomC_fV9pMHcOmnPnX0Sou3nleMjzMJkmyjHFb6knQH015fgsy3GnbPME85GyiNwRQCGkXjkwlICjSCGB3pd2zxXB7PMtsokmlyiVv3KycxRD8J9mx0S1RZFZd-YIMe1fwVXt9dw_1vBgTKw', rating: 5.0, reviews: 180, prepTime: 5, badge: undefined },
];

const RAW_ADDONS = [
  { id: 'addon-sparkling-water', name: 'San Pellegrino (750ml)', price: 6.0, description: 'Chilled sparkling mineral water', isVeg: true, group: 'Beverages', groupSelection: 'multiple' as const },
  { id: 'addon-house-lemonade', name: 'Yuzu House Lemonade', price: 8.0, description: 'Fresh yuzu, mint, and sparkling soda', isVeg: true, group: 'Beverages', groupSelection: 'multiple' as const },
  { id: 'addon-espresso-martini', name: 'Espresso Martini', price: 16.0, description: 'Vodka, coffee liqueur, fresh espresso', group: 'Beverages', groupSelection: 'multiple' as const },
  { id: 'addon-champagne-flute', name: 'Champagne Flute', price: 22.0, description: 'Glass of house champagne', isVeg: true, group: 'Beverages', groupSelection: 'multiple' as const },
  { id: 'addon-truffle-fries', name: 'Truffle Parmesan Fries', price: 9.0, description: 'Hand-cut fries, shaved truffle, aged parmesan', isVeg: true, group: 'Add-on Items', groupSelection: 'multiple' as const },
  { id: 'addon-foie-gras', name: 'Seared Foie Gras', price: 28.0, description: 'Pan-seared with cherry gastrique', group: 'Add-on Items', groupSelection: 'multiple' as const },
  { id: 'addon-extra-wagyu', name: 'Extra Wagyu Patty', price: 14.0, description: 'Additional A5 wagyu beef patty', group: 'Add-on Items', groupSelection: 'multiple' as const },
  { id: 'addon-gold-leaf', name: 'Edible Gold Leaf Finish', price: 12.0, description: 'Chef signature gold leaf garnish', isVeg: true, group: 'Add-on Items', groupSelection: 'multiple' as const },
  { id: 'addon-side-salad', name: 'Heritage Leaf Salad', price: 8.0, description: 'Seasonal greens, citrus vinaigrette', isVeg: true, group: 'Add-on Items', groupSelection: 'multiple' as const },
  { id: 'addon-combo-soup', name: 'Amuse-Bouche Soup Shot', price: 7.0, description: 'Seasonal bisque tasting pour', isVeg: true, group: 'In Combination With', groupSelection: 'single' as const },
  { id: 'addon-combo-dessert', name: 'Petit Four Duo', price: 11.0, description: 'Two chef choice bite-sized desserts', isVeg: true, group: 'In Combination With', groupSelection: 'single' as const },
  { id: 'addon-combo-cheese', name: 'Artisan Cheese Nibble', price: 13.0, description: 'Selection of three aged cheeses', isVeg: true, group: 'In Combination With', groupSelection: 'single' as const },
];

const CATEGORY_NAMES = ['Burgers', 'Pizza', 'Starters', 'Pasta', 'Steaks', 'Desserts', 'Beverages'];

function buildSeed(): MockDbShape {
  const now = nowIso();

  const restaurant: Restaurant = {
    id: RESTAURANT_ID,
    slug: RESTAURANT_SLUG,
    name: 'Lumière',
    ownerUserId: 'user_owner',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const users: User[] = [
    { id: 'user_super', email: 'admin@platform.com', name: 'Platform Admin', role: 'super_admin', restaurantId: null, isActive: true, createdAt: now, updatedAt: now },
    { id: 'user_owner', email: 'owner@lumiere.com', name: 'Ava Whitfield', role: 'owner', restaurantId: RESTAURANT_ID, isActive: true, createdAt: now, updatedAt: now },
    { id: 'user_staff', email: 'staff@lumiere.com', name: 'Jordan Reyes', role: 'staff', restaurantId: RESTAURANT_ID, isActive: true, createdAt: now, updatedAt: now },
  ];

  const media: MediaAsset[] = [
    { id: 'media_hero_bg', restaurantId: RESTAURANT_ID, fileUrl: HERO_BG_URL, fileType: 'image', mimeType: 'image/jpeg', fileName: 'hero-background.jpg', fileSizeBytes: 0, altText: 'Lumière dining room at golden hour', folder: 'images', createdAt: now, updatedAt: now },
    { id: 'media_about', restaurantId: RESTAURANT_ID, fileUrl: SEA_BASS_URL, fileType: 'image', mimeType: 'image/jpeg', fileName: 'sea-bass-tartare.jpg', fileSizeBytes: 0, altText: 'Sea Bass Tartare with Citrus Gel', folder: 'images', createdAt: now, updatedAt: now },
    { id: 'media_chef', restaurantId: RESTAURANT_ID, fileUrl: CHEF_URL, fileType: 'image', mimeType: 'image/jpeg', fileName: 'chef-marcelle-vignon.jpg', fileSizeBytes: 0, altText: 'Chef Marcelle Vignon', folder: 'images', createdAt: now, updatedAt: now },
    ...GALLERY_SEED.map((g) => ({
      id: g.id,
      restaurantId: RESTAURANT_ID,
      fileUrl: g.src,
      fileType: 'image' as const,
      mimeType: 'image/jpeg',
      fileName: `${g.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      fileSizeBytes: 0,
      altText: g.title,
      folder: 'images' as const,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  const categories: MenuCategory[] = CATEGORY_NAMES.map((name, idx) => ({
    id: `cat_${name.toLowerCase()}`,
    restaurantId: RESTAURANT_ID,
    name,
    displayOrder: idx,
    isVisible: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const addonAssignments: Record<string, string[]> = {
    '1': ['addon-truffle-fries', 'addon-extra-wagyu', 'addon-gold-leaf'],
    '2': ['addon-truffle-fries'],
    '7': ['addon-foie-gras', 'addon-gold-leaf'],
  };

  const items: MenuItem[] = RAW_ITEMS.map((raw, idx) => ({
    id: raw.id,
    restaurantId: RESTAURANT_ID,
    categoryId: `cat_${raw.category.toLowerCase()}`,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    imageMediaId: null,
    imageUrl: raw.image,
    foodType: raw.category === 'Beverages' ? 'na' : raw.isVeg ? 'veg' : 'non_veg',
    tags: raw.badge ? [raw.badge] : [],
    prepTimeMinutes: raw.prepTime,
    rating: raw.rating,
    reviewCount: raw.reviews,
    isAvailable: true,
    isFeatured: Boolean(raw.badge),
    displayOrder: idx,
    variants: [],
    addonIds: addonAssignments[raw.id] ?? [],
    activeOfferId: raw.id === '1' ? 'offer_burger_special' : null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  const addons: Addon[] = RAW_ADDONS.map((raw) => ({
    id: raw.id,
    restaurantId: RESTAURANT_ID,
    name: raw.name,
    price: raw.price,
    description: raw.description,
    isVeg: raw.isVeg,
    isAvailable: true,
    group: raw.group,
    groupSelection: raw.groupSelection,
    createdAt: now,
    updatedAt: now,
  }));

  const offers: Offer[] = [
    {
      id: 'offer_burger_special',
      restaurantId: RESTAURANT_ID,
      name: 'Weekday Burger Special',
      type: 'percentage',
      discountValue: 20,
      startDate: now,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
      isActive: true,
      appliesToItemIds: ['1'],
      appliesToCategoryIds: [],
      cta: 'Order Now',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();

  const buildOrderItem = (item: MenuItem, quantity: number, addonList: Addon[] = []): OrderLineItem => {
    const addonsTotal = addonList.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + addonsTotal;
    return {
      itemId: item.id,
      name: item.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      addons: addonList.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    };
  };

  const buildOrder = (opts: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    service: OrderServiceType;
    paymentMethod?: OrderPaymentMethod;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address?: string;
    items: OrderLineItem[];
    placedMinutesAgo: number;
    statusUpdatedMinutesAgo?: number;
  }): Order => {
    const subtotal = opts.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const taxes = Math.round(subtotal * 0.085 * 100) / 100;
    const deliveryFee = opts.service === 'delivery' ? 15 : 0;
    const total = subtotal + taxes + deliveryFee;
    const placedAt = minutesAgo(opts.placedMinutesAgo);
    const statusUpdatedAt = minutesAgo(opts.statusUpdatedMinutesAgo ?? opts.placedMinutesAgo);
    return {
      id: opts.id,
      restaurantId: RESTAURANT_ID,
      orderNumber: opts.orderNumber,
      status: opts.status,
      service: opts.service,
      paymentMethod: opts.paymentMethod ?? 'card',
      customerName: opts.customerName,
      customerPhone: opts.customerPhone,
      customerEmail: opts.customerEmail,
      address: opts.address,
      items: opts.items,
      subtotal,
      taxes,
      deliveryFee,
      total,
      placedAt,
      statusUpdatedAt,
      createdAt: placedAt,
      updatedAt: statusUpdatedAt,
    };
  };

  const orders: Order[] =
    items.length >= 4
      ? [
          buildOrder({
            id: 'order_1', orderNumber: '1042', status: 'pending', service: 'pickup',
            customerName: 'Sarah Chen', customerPhone: '+44 7700 900001', customerEmail: 'sarah.chen@example.com',
            items: [buildOrderItem(items[0], 2), buildOrderItem(items[2], 1)],
            placedMinutesAgo: 3,
          }),
          buildOrder({
            id: 'order_2', orderNumber: '1041', status: 'confirmed', service: 'delivery',
            customerName: 'Marcus Reid', customerPhone: '+44 7700 900002', customerEmail: 'marcus.reid@example.com',
            address: '22 Berkeley Square, Mayfair, London',
            items: [buildOrderItem(items[1], 1, addons.slice(0, 1))],
            placedMinutesAgo: 9, statusUpdatedMinutesAgo: 6,
          }),
          buildOrder({
            id: 'order_3', orderNumber: '1040', status: 'preparing', service: 'pickup',
            customerName: 'Aiko Tanaka', customerPhone: '+44 7700 900003', customerEmail: 'aiko.t@example.com',
            items: [buildOrderItem(items[3], 1), buildOrderItem(items[0], 1)],
            placedMinutesAgo: 18, statusUpdatedMinutesAgo: 10,
          }),
          buildOrder({
            id: 'order_4', orderNumber: '1039', status: 'preparing', service: 'delivery',
            customerName: 'Oliver Bennett', customerPhone: '+44 7700 900004', customerEmail: 'oliver.b@example.com',
            address: '5 Curzon Street, Mayfair, London',
            items: [buildOrderItem(items[2], 2)],
            placedMinutesAgo: 24, statusUpdatedMinutesAgo: 20,
          }),
          buildOrder({
            id: 'order_5', orderNumber: '1038', status: 'ready', service: 'pickup',
            customerName: 'Priya Anand', customerPhone: '+44 7700 900005', customerEmail: 'priya.a@example.com',
            items: [buildOrderItem(items[1], 1)],
            placedMinutesAgo: 16, statusUpdatedMinutesAgo: 4,
          }),
          buildOrder({
            id: 'order_6', orderNumber: '1037', status: 'completed', service: 'pickup',
            customerName: 'James Whitmore', customerPhone: '+44 7700 900006', customerEmail: 'james.w@example.com',
            items: [buildOrderItem(items[0], 3)],
            placedMinutesAgo: 65, statusUpdatedMinutesAgo: 40,
          }),
          buildOrder({
            id: 'order_7', orderNumber: '1036', status: 'cancelled', service: 'delivery',
            customerName: 'Eleanor Cross', customerPhone: '+44 7700 900007', customerEmail: 'eleanor.c@example.com',
            address: '10 Grosvenor Square, Mayfair, London',
            items: [buildOrderItem(items[3], 1)],
            placedMinutesAgo: 90, statusUpdatedMinutesAgo: 85,
          }),
        ]
      : [];

  const buildReservation = (opts: {
    id: string;
    confirmationCode: string;
    status: ReservationStatus;
    date: string;
    timeSlot: string;
    partySize: number;
    seatingPreference: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
    newsletterOptIn?: boolean;
    placedMinutesAgo: number;
  }): Reservation => {
    const placedAt = minutesAgo(opts.placedMinutesAgo);
    return {
      id: opts.id,
      restaurantId: RESTAURANT_ID,
      confirmationCode: opts.confirmationCode,
      status: opts.status,
      date: opts.date,
      timeSlot: opts.timeSlot,
      partySize: opts.partySize,
      seatingPreference: opts.seatingPreference,
      guestName: opts.guestName,
      guestEmail: opts.guestEmail,
      guestPhone: opts.guestPhone,
      specialRequests: opts.specialRequests,
      newsletterOptIn: opts.newsletterOptIn ?? false,
      placedAt,
      createdAt: placedAt,
      updatedAt: placedAt,
    };
  };

  const isoDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().slice(0, 10);
  };

  const reservations: Reservation[] = [
    buildReservation({
      id: 'reservation_1', confirmationCode: 'LUM-82910', status: 'confirmed',
      date: isoDate(2), timeSlot: '19:00', partySize: 2, seatingPreference: 'Window',
      guestName: 'Sarah Chen', guestEmail: 'sarah.chen@example.com', guestPhone: '+44 7700 900001',
      newsletterOptIn: true, placedMinutesAgo: 40,
    }),
    buildReservation({
      id: 'reservation_2', confirmationCode: 'LUM-82911', status: 'confirmed',
      date: isoDate(0), timeSlot: '20:15', partySize: 4, seatingPreference: 'Booth',
      guestName: 'Marcus Reid', guestEmail: 'marcus.reid@example.com', guestPhone: '+44 7700 900002',
      specialRequests: 'Anniversary dinner, quiet table if possible.', placedMinutesAgo: 120,
    }),
    buildReservation({
      id: 'reservation_3', confirmationCode: 'LUM-82912', status: 'seated',
      date: isoDate(0), timeSlot: '13:30', partySize: 2, seatingPreference: 'Bar',
      guestName: 'Aiko Tanaka', guestEmail: 'aiko.t@example.com', guestPhone: '+44 7700 900003',
      placedMinutesAgo: 90,
    }),
    buildReservation({
      id: 'reservation_4', confirmationCode: 'LUM-82913', status: 'completed',
      date: isoDate(-1), timeSlot: '18:30', partySize: 6, seatingPreference: 'Large Group (8+)',
      guestName: 'Oliver Bennett', guestEmail: 'oliver.b@example.com', guestPhone: '+44 7700 900004',
      placedMinutesAgo: 1600,
    }),
    buildReservation({
      id: 'reservation_5', confirmationCode: 'LUM-82914', status: 'cancelled',
      date: isoDate(-2), timeSlot: '21:00', partySize: 2, seatingPreference: 'Window',
      guestName: 'Priya Anand', guestEmail: 'priya.a@example.com', guestPhone: '+44 7700 900005',
      placedMinutesAgo: 2900,
    }),
    buildReservation({
      id: 'reservation_6', confirmationCode: 'LUM-82915', status: 'no_show',
      date: isoDate(-3), timeSlot: '19:45', partySize: 3, seatingPreference: 'Booth',
      guestName: 'James Whitmore', guestEmail: 'james.w@example.com', guestPhone: '+44 7700 900006',
      placedMinutesAgo: 4200,
    }),
    buildReservation({
      id: 'reservation_7', confirmationCode: 'LUM-82916', status: 'confirmed',
      date: isoDate(5), timeSlot: '12:00', partySize: 2, seatingPreference: 'Window',
      guestName: 'Eleanor Cross', guestEmail: 'eleanor.c@example.com', guestPhone: '+44 7700 900007',
      placedMinutesAgo: 30,
    }),
  ];

  const AFTERNOON_TIMES = ['12:00', '13:30', '14:45', '15:30'];
  const EVENING_TIMES = ['18:30', '19:00', '20:15', '21:00', '21:45', '22:30'];
  const WEEK_DAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const reservationAvailabilitySettings: ReservationAvailabilitySettings = {
    restaurantId: RESTAURANT_ID,
    days: WEEK_DAYS.map((day) => ({
      day,
      slots: [...AFTERNOON_TIMES, ...EVENING_TIMES].map((time) => ({ time, isOpen: true })),
    })),
  };

  const brandSettings: BrandSettings = {
    restaurantId: RESTAURANT_ID,
    restaurantName: 'Lumière',
    tagline: 'Modern French, Mayfair',
    logoMediaId: null,
    faviconMediaId: null,
    themePresetId: 'dusty-gold',
    primaryFont: 'Geist',
    headingFont: 'Cormorant Garamond',
    fontWeight: 'regular',
    buttonStyle: 'rounded',
    borderRadius: 'lg',
    navPosition: 'right',
    socialLinks: { instagram: '', facebook: '', whatsapp: '' },
    contact: {
      phone: '+44 (0) 20 7123 4567',
      email: 'hello@lumiere-dining.com',
      address: '12 Berkeley Square, Mayfair, London',
    },
    description:
      'Experience the invisible excellence of modern French cuisine in the heart of Mayfair. Part of the Haute-Cuisine Group.',
    cuisineType: 'Modern French',
    businessHours: [
      { day: 'mon', isClosed: false, openTime: '18:00', closeTime: '23:00' },
      { day: 'tue', isClosed: false, openTime: '18:00', closeTime: '23:00' },
      { day: 'wed', isClosed: false, openTime: '18:00', closeTime: '23:00' },
      { day: 'thu', isClosed: false, openTime: '18:00', closeTime: '23:00' },
      { day: 'fri', isClosed: false, openTime: '12:00', closeTime: '00:00' },
      { day: 'sat', isClosed: false, openTime: '12:00', closeTime: '00:00' },
      { day: 'sun', isClosed: false, openTime: '12:00', closeTime: '21:00' },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const homepageSections: HomepageSection[] = [
    {
      id: 'section_hero', restaurantId: RESTAURANT_ID, type: 'hero', order: 1, visible: true, updatedAt: now,
      content: {
        eyebrow: 'Mayfair, London',
        heading: 'Lumière',
        description: 'Experience invisible excellence at our flagship dining room in Mayfair.',
        buttonText: 'Reserve a Table',
        buttonLink: '/reservations',
        secondaryButtonText: 'View Menu',
        secondaryButtonLink: '/menu',
        backgroundMediaId: 'media_hero_bg',
        overlayOpacity: 50,
      },
    },
    {
      id: 'section_about', restaurantId: RESTAURANT_ID, type: 'about', order: 2, visible: true, updatedAt: now,
      content: {
        eyebrow: 'The Philosophy',
        heading: 'A sanctuary of light and culinary precision.',
        description:
          'At Lumière, we believe the finest dining experiences are those where the service is felt but not seen. Every dish is a dialogue between tradition and innovation, meticulously crafted to showcase the purest essence of seasonal ingredients.',
        imageMediaId: 'media_about',
        quote: 'The intersection of high-end hospitality and technical precision.',
        chefName: 'Chef Marcelle Vignon',
        chefQuote:
          'Culinary art is not found in complexity, but in the radical simplification of a flavor until its soul is revealed. At Lumière, we strip away the noise to let the ingredient speak.',
        chefBio:
          'With three Michelin stars and a career spanning the finest kitchens of Lyon and Paris, Chef Vignon brings a technical rigor to Mayfair that is unmatched. Her vision for Lumière was to create a space where diners could lose track of time, anchored only by the rhythm of the season.',
        chefImageMediaId: 'media_chef',
      },
    },
    {
      id: 'section_featured_menu', restaurantId: RESTAURANT_ID, type: 'featured_menu', order: 3, visible: true, updatedAt: now,
      content: {
        eyebrow: 'Chef Selection',
        heading: 'Featured Dishes',
        description: 'A curated selection from our kitchen, chosen by Chef Vignon.',
        selectedItemIds: [],
      },
    },
    {
      id: 'section_gallery', restaurantId: RESTAURANT_ID, type: 'gallery', order: 4, visible: true, updatedAt: now,
      content: {
        eyebrow: 'Visual Atmosphere',
        heading: 'The Lumière Gallery',
        description: 'Captured moments of invisible excellence',
        images: GALLERY_SEED.map((g, idx) => ({ mediaId: g.id, caption: g.caption, order: idx })),
      },
    },
    {
      id: 'section_offers', restaurantId: RESTAURANT_ID, type: 'offers', order: 5, visible: true, updatedAt: now,
      content: {
        eyebrow: 'Limited Time',
        heading: 'Special Offers',
        description: 'Seasonal promotions from the kitchen and cellar.',
        selectedOfferIds: ['offer_burger_special'],
      },
    },
    {
      id: 'section_testimonials', restaurantId: RESTAURANT_ID, type: 'testimonials', order: 6, visible: true, updatedAt: now,
      content: {
        eyebrow: 'Guest Experiences',
        heading: 'What Our Guests Say',
        testimonials: [
          { id: 'testimonial_1', customerName: 'Eleanor Cross', quote: 'The most refined dining experience in Mayfair - every detail considered.', rating: 5, order: 0 },
          { id: 'testimonial_2', customerName: 'James Whitmore', quote: 'Chef Vignon’s tasting menu is a masterclass in restraint and flavor.', rating: 5, order: 1 },
          { id: 'testimonial_3', customerName: 'Priya Anand', quote: 'Impeccable service and a wine list to match. Our go-to for anniversaries.', rating: 4, order: 2 },
        ],
      },
    },
    {
      id: 'section_location', restaurantId: RESTAURANT_ID, type: 'location', order: 7, visible: true, updatedAt: now,
      content: { heading: 'Find Us', showHoursTable: true },
    },
  ];

  const homepagePublished: Homepage = { restaurantId: RESTAURANT_ID, status: 'published', sections: homepageSections };
  const homepageDraft: Homepage = { restaurantId: RESTAURANT_ID, status: 'draft', sections: homepageSections.map((s) => ({ ...s })) };

  return {
    users,
    restaurants: [restaurant],
    brand: { [RESTAURANT_ID]: { draft: { ...brandSettings }, published: { ...brandSettings } } },
    website: {
      [RESTAURANT_ID]: {
        restaurantId: RESTAURANT_ID,
        publishStatus: 'published',
        publishedAt: now,
        seoTitle: 'Lumière | Fine Dining Mayfair',
        seoDescription: 'Modern French fine dining in Mayfair, London.',
        createdAt: now,
        updatedAt: now,
      },
    },
    homepage: { [RESTAURANT_ID]: { draft: homepageDraft, published: homepagePublished } },
    media,
    categories,
    items,
    addons,
    offers,
    orders,
    reservations,
    reservationAvailability: { [RESTAURANT_ID]: reservationAvailabilitySettings },
  };
}

export function ensureSeeded() {
  if (db.isEmpty()) {
    db.reset(buildSeed());
  }
}

export function resetSeed() {
  db.reset(buildSeed());
}
