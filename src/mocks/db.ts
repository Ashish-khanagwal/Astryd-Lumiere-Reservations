import type {
  Addon,
  BrandSettings,
  Homepage,
  MediaAsset,
  MenuCategory,
  MenuItem,
  Offer,
  Order,
  Reservation,
  ReservationAvailabilitySettings,
  Restaurant,
  User,
  WebsiteSettings,
} from '../types';

interface Versioned<T> {
  draft: T;
  published: T;
}

export interface MockDbShape {
  users: User[];
  restaurants: Restaurant[];
  brand: Record<string, Versioned<BrandSettings>>;
  website: Record<string, WebsiteSettings>;
  homepage: Record<string, Versioned<Homepage>>;
  media: MediaAsset[];
  categories: MenuCategory[];
  items: MenuItem[];
  addons: Addon[];
  offers: Offer[];
  orders: Order[];
  reservations: Reservation[];
  reservationAvailability: Record<string, ReservationAvailabilitySettings>;
}

const STORAGE_KEY = 'lumiere-cms-mock-db-v1';

function emptyDb(): MockDbShape {
  return {
    users: [],
    restaurants: [],
    brand: {},
    website: {},
    homepage: {},
    media: [],
    categories: [],
    items: [],
    addons: [],
    offers: [],
    orders: [],
    reservations: [],
    reservationAvailability: {},
  };
}

function load(): MockDbShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw);
    return { ...emptyDb(), ...parsed };
  } catch {
    return emptyDb();
  }
}

class MockDb {
  data: MockDbShape = load();

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore quota errors (e.g. large base64 media) - non-fatal for demo purposes
    }
  }

  reset(next: MockDbShape) {
    this.data = next;
    this.save();
  }

  isEmpty() {
    return this.data.restaurants.length === 0;
  }
}

export const db = new MockDb();

export function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}
