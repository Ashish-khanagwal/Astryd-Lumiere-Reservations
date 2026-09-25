/** Unsplash photos (checked to load and to show their subject) used as Gym/Retail defaults for page images and demo content. */
const photo = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const GYM_IMAGES = {
  floor: photo('photo-1534438327276-14e5300c3a48', 1800),
  abs: photo('photo-1571019613454-1cb2f99b2d8b'),
  barbell: photo('photo-1517836357463-d25dfeac3438'),
  deadlift: photo('photo-1549060279-7e168fcee0c2'),
  matClass: photo('photo-1518611012118-696072aa579a'),
  studio: photo('photo-1540497077202-7c8a3999166f'),
  ropes: photo('photo-1599058917212-d750089bc07e'),
  dumbbell: photo('photo-1583454110551-21f2fa2afe61'),
  squat: photo('photo-1574680096145-d05b474e2155'),
  coach: photo('photo-1581009146145-b5ef050c2e1e'),
  core: photo('photo-1526506118085-60ce8714f8c5'),
};

export const RETAIL_IMAGES = {
  shop: photo('photo-1441986300917-64674bd600d8', 1800),
  vases: photo('photo-1565193566173-7a0ee3dbe261'),
  plates: photo('photo-1578749556568-bc2c40e68b61'),
  cups: photo('photo-1610701596007-11502861dcfa'),
  livingRoom: photo('photo-1493663284031-b7e3aefcae8e'),
  armchair: photo('photo-1586023492125-27b2c045efd7'),
  tees: photo('photo-1523381210434-271e8be1f52b'),
  sofa: photo('photo-1567016432779-094069958ea5'),
  loveseat: photo('photo-1555041469-a586c61ea9bc'),
  floorVase: photo('photo-1612196808214-b8e1d6145a8c'),
  capsule: photo('photo-1602028915047-37269d1a73f7'),
};
