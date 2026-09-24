import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurant } from "./RestaurantContext";
import { getHomepage } from "../services/homepage";
import { getBrandSettings } from "../services/website";
import { getMenu } from "../services/menu";
import { getAddons } from "../services/addons";
import { getOffers } from "../services/offers";
import { getMedia } from "../services/media";
import { getPageConfigs } from "../services/pageConfig";
import { getSiteBrandingBadge } from "../services/sites";
import {
  setMenuCatalog,
  type AddonCategory,
  type MenuItem as LegacyMenuItem,
} from "../data/menuItems";
import type {
  BrandSettings,
  HomepageSection,
  MediaAsset,
  MenuCategory,
  MenuItem,
  Addon,
  Offer,
  PageConfig,
  PlatformModule,
  TemplateVariant,
} from "../types";

interface PublicDataValue {
  isLoading: boolean;
  brand: BrandSettings | undefined;
  sections: HomepageSection[];
  mediaMap: Map<string, MediaAsset>;
  categories: MenuCategory[];
  items: MenuItem[];
  addons: Addon[];
  offers: Offer[];
  pageConfigs: PageConfig[];
  /** Multi-Vertical Platform Plan §7 - the renameable nav label for a module, falling back to its default English name. */
  getNavLabel: (module: PlatformModule, fallback: string) => string;
  /** Plan §8 - which of the 3 layouts this module should render as; defaults to Variant A. */
  getTemplateVariant: (module: PlatformModule) => TemplateVariant;
  /** Plan §5.2 - Super Admin only control; the public footer just reads this flag. */
  brandingBadgeEnabled: boolean;
}

const PublicDataContext = createContext<PublicDataValue | undefined>(undefined);

function toFoodTypeVeg(foodType: MenuItem["foodType"]) {
  return foodType === "veg" || foodType === "vegan";
}

function toPrepTimeLabel(minutes?: number) {
  return minutes ? `${minutes} min` : "—";
}

function adaptItems(
  items: MenuItem[],
  categories: MenuCategory[],
): LegacyMenuItem[] {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  return items
    .filter((i) => i.isAvailable)
    .map((i) => ({
      id: i.id,
      name: i.name,
      category: categoryName.get(i.categoryId) ?? "Other",
      price: i.price,
      description: i.description,
      image: i.imageUrl ?? "",
      rating: i.rating ?? 4.8,
      reviews: i.reviewCount ?? 0,
      prepTime: toPrepTimeLabel(i.prepTimeMinutes),
      badge: i.tags[0],
      isVeg: toFoodTypeVeg(i.foodType),
    }));
}

function adaptAddons(addons: Addon[]): AddonCategory[] {
  const groups = new Map<string, Addon[]>();
  addons
    .filter((a) => a.isAvailable)
    .forEach((a) => {
      const key = a.group ?? "Add-ons";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    });
  return Array.from(groups.entries()).map(([name, opts]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    selection: opts[0]?.groupSelection ?? "multiple",
    options: opts.map((o) => ({
      id: o.id,
      name: o.name,
      price: o.price,
      description: o.description,
      isVeg: o.isVeg,
    })),
  }));
}

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useRestaurant();
  const isPreview =
    new URLSearchParams(window.location.search).get("preview") === "true";
  const version = isPreview ? "draft" : "published";

  const homepageQuery = useQuery({
    queryKey: ["public-homepage", restaurantId, version],
    queryFn: () => getHomepage(restaurantId, version),
  });
  const brandQuery = useQuery({
    queryKey: ["public-brand", restaurantId, version],
    queryFn: () => getBrandSettings(restaurantId, version),
  });
  const menuQuery = useQuery({
    queryKey: ["public-menu", restaurantId],
    queryFn: () => getMenu(restaurantId),
  });
  const addonsQuery = useQuery({
    queryKey: ["public-addons", restaurantId],
    queryFn: () => getAddons(restaurantId),
  });
  const offersQuery = useQuery({
    queryKey: ["public-offers", restaurantId],
    queryFn: () => getOffers(restaurantId),
  });
  const mediaQuery = useQuery({
    queryKey: ["public-media", restaurantId],
    queryFn: () => getMedia(restaurantId),
  });
  const pageConfigsQuery = useQuery({
    queryKey: ["public-page-configs", restaurantId],
    queryFn: () => getPageConfigs(restaurantId),
  });
  const brandingBadgeQuery = useQuery({
    queryKey: ["public-branding-badge", restaurantId],
    queryFn: () => getSiteBrandingBadge(restaurantId),
  });

  const items = menuQuery.data?.items ?? [];
  const categories = menuQuery.data?.categories ?? [];
  const addons = addonsQuery.data ?? [];

  useEffect(() => {
    if (menuQuery.data && addonsQuery.data) {
      setMenuCatalog(
        adaptItems(menuQuery.data.items, menuQuery.data.categories),
        adaptAddons(addonsQuery.data),
      );
    }
  }, [menuQuery.data, addonsQuery.data]);

  const isLoading = homepageQuery.isLoading || brandQuery.isLoading;

  const mediaMap = new Map(
    (mediaQuery.data?.items ?? []).map((m) => [m.id, m]),
  );

  const pageConfigs = pageConfigsQuery.data ?? [];
  const getNavLabel = (module: PlatformModule, fallback: string) =>
    pageConfigs.find((p) => p.module === module)?.navLabel || fallback;
  const getTemplateVariant = (module: PlatformModule): TemplateVariant =>
    pageConfigs.find((p) => p.module === module)?.templateVariant ?? "a";

  const value: PublicDataValue = {
    isLoading,
    brand: brandQuery.data,
    sections: homepageQuery.data?.sections ?? [],
    mediaMap,
    categories,
    items,
    addons,
    offers: offersQuery.data ?? [],
    pageConfigs,
    getNavLabel,
    getTemplateVariant,
    brandingBadgeEnabled: brandingBadgeQuery.data?.enabled ?? true,
  };

  return (
    <PublicDataContext.Provider value={value}>
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  const ctx = useContext(PublicDataContext);
  if (!ctx)
    throw new Error("usePublicData must be used within PublicDataProvider");
  return ctx;
}
