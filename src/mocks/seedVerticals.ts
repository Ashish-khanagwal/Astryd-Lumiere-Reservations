import type { HomepageSection, MediaAsset, MenuCategory, MenuItem, Offer } from '../types';
import { GYM_IMAGES as GYM, RETAIL_IMAGES as RETAIL } from '../content/verticalImages';

/**
 * Full demo content for the Gym (PulseFit) and Retail (Nova Goods) tenants - media, catalog, offers and
 * all 7 homepage sections filled in and visible - so each vertical's public site is as complete as Lumière's.
 */

interface VerticalSeed {
  media: MediaAsset[];
  categories: MenuCategory[];
  items: MenuItem[];
  offers: Offer[];
  sections: HomepageSection[];
}

interface ItemSpec {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  minutes?: number;
  tag?: string;
  rating: number;
  reviews: number;
}

function buildMedia(siteId: string, now: string, entries: Array<[id: string, url: string, alt: string]>): MediaAsset[] {
  return entries.map(([id, fileUrl, altText]) => ({
    id,
    restaurantId: siteId,
    fileUrl,
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileName: `${altText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`,
    fileSizeBytes: 0,
    altText,
    folder: 'images',
    createdAt: now,
    updatedAt: now,
  }));
}

function buildCatalog(siteId: string, now: string, prefix: string, categoryNames: string[], specs: ItemSpec[]) {
  const categoryId = (name: string) => `cat_${prefix}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const categories: MenuCategory[] = categoryNames.map((name, displayOrder) => ({
    id: categoryId(name),
    restaurantId: siteId,
    name,
    displayOrder,
    isVisible: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));
  const items: MenuItem[] = specs.map((s, displayOrder) => ({
    id: s.id,
    restaurantId: siteId,
    categoryId: categoryId(s.category),
    name: s.name,
    description: s.description,
    price: s.price,
    imageMediaId: null,
    imageUrl: s.image,
    foodType: 'na',
    tags: s.tag ? [s.tag] : [],
    prepTimeMinutes: s.minutes,
    rating: s.rating,
    reviewCount: s.reviews,
    isAvailable: true,
    isFeatured: Boolean(s.tag),
    displayOrder,
    variants: [],
    addonIds: [],
    activeOfferId: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }));
  return { categories, items };
}

const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

// ---------------------------------------------------------------------------------------------- Gym

export function buildGymSeed(siteId: string, now: string, hero: HomepageSection): VerticalSeed {
  const media = buildMedia(siteId, now, [
    ['media_pf_hero', GYM.floor, 'The PulseFit training floor'],
    ['media_pf_about', GYM.studio, 'Inside the PulseFit studio'],
    ['media_pf_coach', GYM.coach, 'Head Coach Marcus Bell'],
    ['media_pf_offer', GYM.deadlift, 'New member strength session'],
    ['media_pf_g1', GYM.barbell, 'Barbell Foundations'],
    ['media_pf_g2', GYM.matClass, 'Mat Pilates Flow'],
    ['media_pf_g3', GYM.ropes, 'Battle Rope HIIT'],
    ['media_pf_g4', GYM.squat, 'Olympic Lifting Clinic'],
    ['media_pf_g5', GYM.abs, 'Core Crusher'],
    ['media_pf_g6', GYM.dumbbell, '1:1 Coaching'],
  ]);

  const { categories, items } = buildCatalog(siteId, now, 'pf', ['Strength', 'Conditioning', 'Mobility & Core', 'Personal Training'], [
    { id: 'pf_barbell', category: 'Strength', name: 'Barbell Foundations', description: 'Learn the squat, bench and deadlift with coached technique and smart progressions.', price: 25, image: GYM.barbell, minutes: 60, tag: 'Popular', rating: 4.9, reviews: 312 },
    { id: 'pf_power', category: 'Strength', name: 'Power Hour', description: 'Heavy compound lifts and accessory work for experienced lifters chasing new PRs.', price: 25, image: GYM.deadlift, minutes: 60, rating: 4.8, reviews: 198 },
    { id: 'pf_oly', category: 'Strength', name: 'Olympic Lifting Clinic', description: 'Snatch and clean & jerk drills in small groups with a certified weightlifting coach.', price: 30, image: GYM.squat, minutes: 75, tag: 'New', rating: 4.9, reviews: 87 },
    { id: 'pf_upper', category: 'Strength', name: 'Upper Body Sculpt', description: 'Dumbbell and cable supersets for stronger shoulders, back and arms.', price: 22, image: GYM.coach, minutes: 45, rating: 4.7, reviews: 143 },
    { id: 'pf_ropes', category: 'Conditioning', name: 'Battle Rope HIIT', description: 'Fast intervals with ropes, sleds and kettlebells - maximum sweat in minimum time.', price: 20, image: GYM.ropes, minutes: 45, tag: 'Popular', rating: 4.8, reviews: 256 },
    { id: 'pf_spin', category: 'Conditioning', name: 'Spin & Sprint', description: 'Bike intervals set to a big playlist, finished with a short sprint ladder.', price: 20, image: GYM.studio, minutes: 45, rating: 4.7, reviews: 221 },
    { id: 'pf_core', category: 'Mobility & Core', name: 'Core Crusher', description: 'Thirty focused minutes of anti-rotation, bracing and ab work.', price: 18, image: GYM.abs, minutes: 30, rating: 4.6, reviews: 174 },
    { id: 'pf_pilates', category: 'Mobility & Core', name: 'Mat Pilates Flow', description: 'Controlled, low-impact strength and flexibility for every level.', price: 20, image: GYM.matClass, minutes: 50, tag: 'Popular', rating: 4.9, reviews: 289 },
    { id: 'pf_mobility', category: 'Mobility & Core', name: 'Mobility Reset', description: 'Guided stretching and joint prep to recover faster and move better.', price: 18, image: GYM.core, minutes: 40, rating: 4.8, reviews: 132 },
    { id: 'pf_pt', category: 'Personal Training', name: '1:1 Coaching Session', description: 'A private session built around your goals, with a written plan to take home.', price: 75, image: GYM.dumbbell, minutes: 60, tag: 'Premium', rating: 5, reviews: 96 },
    { id: 'pf_pt5', category: 'Personal Training', name: 'Coaching 5-Pack', description: 'Five private sessions at a better rate - ideal for a focused training block.', price: 340, image: GYM.floor, minutes: 60, rating: 5, reviews: 41 },
  ]);

  const offers: Offer[] = [
    { id: 'offer_pf_newmember', restaurantId: siteId, name: 'New Member Week', type: 'percentage', discountValue: 50, startDate: now, endDate: inDays(45), isActive: true, appliesToItemIds: ['pf_barbell'], appliesToCategoryIds: [], cta: 'Claim Offer', imageMediaId: 'media_pf_offer', createdAt: now, updatedAt: now },
    { id: 'offer_pf_friend', restaurantId: siteId, name: 'Bring a Friend Fridays', type: 'bogo', startDate: now, endDate: inDays(60), isActive: true, appliesToItemIds: ['pf_ropes', 'pf_spin'], appliesToCategoryIds: [], cta: 'Book Together', imageMediaId: 'media_pf_g3', createdAt: now, updatedAt: now },
  ];

  const base = { restaurantId: siteId, updatedAt: now };
  const sections: HomepageSection[] = [
    { ...hero, content: { ...(hero.type === 'hero' ? hero.content : {}), backgroundMediaId: 'media_pf_hero' } } as HomepageSection,
    {
      ...base, id: `section_${siteId}_about`, type: 'about', order: 2, visible: true,
      content: {
        eyebrow: 'Our Approach',
        heading: 'Coaching first. Community always.',
        description: 'Small-group strength & conditioning led by certified coaches. Every session is programmed, scaled to you, and built to keep you coming back stronger.',
        imageMediaId: 'media_pf_about',
        quote: 'Strong is a skill - and skills are coached.',
        chefName: 'Coach Marcus Bell',
        chefQuote: 'Nobody gets strong alone. We build the plan, you bring the effort, and the room carries you through the hard reps.',
        chefBio: 'A former collegiate athlete and certified strength coach with 12 years on the gym floor, Marcus founded PulseFit to make real coaching the default - not a premium extra.',
        chefImageMediaId: 'media_pf_coach',
      },
    },
    { ...base, id: `section_${siteId}_featured_menu`, type: 'featured_menu', order: 3, visible: true, content: { eyebrow: 'Most Booked', heading: 'Featured Programs', description: 'The sessions our members keep coming back for.', selectedItemIds: ['pf_barbell', 'pf_ropes', 'pf_pilates', 'pf_pt'] } },
    {
      ...base, id: `section_${siteId}_gallery`, type: 'gallery', order: 4, visible: true,
      content: {
        eyebrow: 'The Studio',
        heading: 'Inside PulseFit',
        description: 'Real members, real sessions, every day of the week.',
        images: ['media_pf_g1', 'media_pf_g2', 'media_pf_g3', 'media_pf_g4', 'media_pf_g5', 'media_pf_g6'].map((mediaId, order) => ({ mediaId, order })),
      },
    },
    { ...base, id: `section_${siteId}_offers`, type: 'offers', order: 5, visible: true, content: { eyebrow: 'Limited Time', heading: 'Member Offers', description: 'Start strong with our current deals.', selectedOfferIds: ['offer_pf_newmember', 'offer_pf_friend'] } },
    {
      ...base, id: `section_${siteId}_testimonials`, type: 'testimonials', order: 6, visible: true,
      content: {
        eyebrow: 'Member Stories',
        heading: 'What Our Members Say',
        testimonials: [
          { id: 'testimonial_pf_1', customerName: 'Dana K.', quote: 'Strongest I have ever been, and I actually look forward to training.', rating: 5, order: 0 },
          { id: 'testimonial_pf_2', customerName: 'Luis M.', quote: 'The coaches know everyone by name. It feels like a team, not a gym.', rating: 5, order: 1 },
          { id: 'testimonial_pf_3', customerName: 'Priya S.', quote: 'Finally a gym where nobody is intimidating - just encouraging.', rating: 5, order: 2 },
        ],
      },
    },
    { ...base, id: `section_${siteId}_location`, type: 'location', order: 7, visible: true, content: { heading: 'Find the Studio', showHoursTable: true } },
  ];

  return { media, categories, items, offers, sections };
}

// ------------------------------------------------------------------------------------------- Retail


export function buildRetailSeed(siteId: string, now: string, hero: HomepageSection): VerticalSeed {
  const media = buildMedia(siteId, now, [
    ['media_ng_hero', RETAIL.shop, 'The Nova Goods shop floor'],
    ['media_ng_about', RETAIL.livingRoom, 'A living room styled with Nova Goods'],
    ['media_ng_founder', RETAIL.floorVase, 'Hand-thrown floor vase'],
    ['media_ng_offer', RETAIL.plates, 'Stoneware dinner set'],
    ['media_ng_g1', RETAIL.cups, 'Speckled mug trio'],
    ['media_ng_g2', RETAIL.armchair, 'Mustard accent chair'],
    ['media_ng_g3', RETAIL.vases, 'Matte bud vases'],
    ['media_ng_g4', RETAIL.tees, 'Organic cotton tees'],
    ['media_ng_g5', RETAIL.sofa, 'Terracotta lounge cushion'],
    ['media_ng_g6', RETAIL.loveseat, 'Velvet loveseat'],
  ]);

  const { categories, items } = buildCatalog(siteId, now, 'ng', ['Ceramics', 'Home & Living', 'Apparel'], [
    { id: 'ng_dinner', category: 'Ceramics', name: 'Stoneware Dinner Set', description: 'Four plates and four bowls in a soft blue glaze, fired by a two-person studio in Oakland.', price: 128, image: RETAIL.plates, tag: 'Bestseller', rating: 4.9, reviews: 214 },
    { id: 'ng_mugs', category: 'Ceramics', name: 'Speckled Mug Trio', description: 'Three hand-thrown mugs with a raw-clay foot - no two are exactly alike.', price: 42, image: RETAIL.cups, tag: 'New', rating: 4.8, reviews: 97 },
    { id: 'ng_budvases', category: 'Ceramics', name: 'Matte Bud Vases', description: 'A set of three slim vases in chalk-white matte glaze, sized for single stems.', price: 36, image: RETAIL.vases, rating: 4.7, reviews: 63 },
    { id: 'ng_floorvase', category: 'Ceramics', name: 'Hand-thrown Floor Vase', description: 'A statement piece in natural stoneware, big enough for branches and dried grasses.', price: 95, image: RETAIL.floorVase, rating: 4.9, reviews: 38 },
    { id: 'ng_cushion', category: 'Home & Living', name: 'Terracotta Lounge Cushion', description: 'Washed-linen cover in burnt terracotta with a feather-blend insert.', price: 58, image: RETAIL.sofa, rating: 4.8, reviews: 121 },
    { id: 'ng_chair', category: 'Home & Living', name: 'Mustard Accent Chair', description: 'Solid oak frame, wool-blend upholstery - made to order by a Portland workshop.', price: 420, image: RETAIL.armchair, tag: 'Limited', rating: 4.9, reviews: 44 },
    { id: 'ng_loveseat', category: 'Home & Living', name: 'Velvet Loveseat', description: 'Deep forest-green velvet on tapered walnut legs, delivered fully assembled.', price: 1190, image: RETAIL.loveseat, rating: 4.8, reviews: 29 },
    { id: 'ng_throw', category: 'Home & Living', name: 'Linen Throw Set', description: 'Two stonewashed linen throws for the sofa or the end of the bed.', price: 74, image: RETAIL.livingRoom, rating: 4.7, reviews: 88 },
    { id: 'ng_tee', category: 'Apparel', name: 'Organic Cotton Tee', description: 'Heavyweight GOTS-certified cotton, garment-dyed in small batches.', price: 38, image: RETAIL.tees, tag: 'Bestseller', rating: 4.8, reviews: 342 },
    { id: 'ng_capsule', category: 'Apparel', name: 'Weekend Capsule Set', description: 'Chinos, a boxy tee and canvas sneakers - a ready-made weekend outfit.', price: 165, image: RETAIL.capsule, rating: 4.6, reviews: 52 },
  ]);

  const offers: Offer[] = [
    { id: 'offer_ng_ceramics', restaurantId: siteId, name: 'Ceramics Week', type: 'percentage', discountValue: 15, startDate: now, endDate: inDays(30), isActive: true, appliesToItemIds: [], appliesToCategoryIds: ['cat_ng_ceramics'], cta: 'Shop Ceramics', imageMediaId: 'media_ng_offer', createdAt: now, updatedAt: now },
    { id: 'offer_ng_welcome', restaurantId: siteId, name: 'Welcome Gift', type: 'fixed', discountValue: 10, startDate: now, endDate: inDays(90), isActive: true, appliesToItemIds: [], appliesToCategoryIds: [], cta: 'Start Shopping', imageMediaId: 'media_ng_g1', createdAt: now, updatedAt: now },
  ];

  const base = { restaurantId: siteId, updatedAt: now };
  const sections: HomepageSection[] = [
    { ...hero, content: { ...(hero.type === 'hero' ? hero.content : {}), backgroundMediaId: 'media_ng_hero' } } as HomepageSection,
    {
      ...base, id: `section_${siteId}_about`, type: 'about', order: 2, visible: true,
      content: {
        eyebrow: 'Our Story',
        heading: 'Made by small makers, chosen with care.',
        description: 'Every piece in the shop comes from an independent maker we know by name - ceramics, textiles and everyday objects built to last, not to trend.',
        imageMediaId: 'media_ng_about',
        quote: 'Buy fewer things. Choose them well.',
        chefName: 'Priya Nair, Founder',
        chefQuote: 'I started Nova Goods to give brilliant small studios a shop window - and to make it easier to live with fewer, better things.',
        chefBio: 'After a decade buying for big-box retailers, Priya opened Nova Goods on Valencia Street in 2019. She still visits every maker before their work goes on the shelf.',
        chefImageMediaId: 'media_ng_founder',
      },
    },
    { ...base, id: `section_${siteId}_featured_menu`, type: 'featured_menu', order: 3, visible: true, content: { eyebrow: 'Just In', heading: 'New Arrivals', description: 'Fresh from our makers this month.', selectedItemIds: ['ng_dinner', 'ng_mugs', 'ng_chair', 'ng_tee'] } },
    {
      ...base, id: `section_${siteId}_gallery`, type: 'gallery', order: 4, visible: true,
      content: {
        eyebrow: 'Lookbook',
        heading: 'Styled at Home',
        description: 'How our customers live with their Nova Goods.',
        images: ['media_ng_g1', 'media_ng_g2', 'media_ng_g3', 'media_ng_g4', 'media_ng_g5', 'media_ng_g6'].map((mediaId, order) => ({ mediaId, order })),
      },
    },
    { ...base, id: `section_${siteId}_offers`, type: 'offers', order: 5, visible: true, content: { eyebrow: 'This Month', heading: 'Current Offers', description: 'Small savings on pieces made to last.', selectedOfferIds: ['offer_ng_ceramics', 'offer_ng_welcome'] } },
    {
      ...base, id: `section_${siteId}_testimonials`, type: 'testimonials', order: 6, visible: true,
      content: {
        eyebrow: 'Customer Notes',
        heading: 'What Our Customers Say',
        testimonials: [
          { id: 'testimonial_ng_1', customerName: 'Maya R.', quote: 'Every order feels like a gift - beautifully packed and thoughtfully made.', rating: 5, order: 0 },
          { id: 'testimonial_ng_2', customerName: 'Chris D.', quote: 'My go-to shop for presents. It has never once disappointed.', rating: 5, order: 1 },
          { id: 'testimonial_ng_3', customerName: 'Ana L.', quote: 'The dinner set is even nicer in person. We use it every single day.', rating: 4, order: 2 },
        ],
      },
    },
    { ...base, id: `section_${siteId}_location`, type: 'location', order: 7, visible: true, content: { heading: 'Visit the Shop', showHoursTable: true } },
  ];

  return { media, categories, items, offers, sections };
}
