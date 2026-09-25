import { createContext, useContext, useMemo, type ReactNode } from "react";
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
import { getMembershipPlans } from "../services/membership";
import { getPageContent } from "../services/pageContent";
import {
  setMenuCatalog,
  type AddonCategory,
  type MenuItem as LegacyMenuItem,
} from "../data/menuItems";
import type {
  BrandSettings,
  HomepageSection,
  MediaAsset,
  MembershipPlan,
  MenuCategory,
  MenuItem,
  Addon,
  Offer,
  PageConfig,
  PageContentMap,
  PlatformModule,
  TemplateVariant,
  Vertical,
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
  /** Whether this Site has turned a module on at all - a disabled module's nav link/page shouldn't appear. */
  isModuleEnabled: (module: PlatformModule) => boolean;
  /** Plan §3.2/§8.4 - active plans only; the public Membership page reads this. */
  membershipPlans: MembershipPlan[];
  /** Plan §5.2 - Super Admin only control; the public footer just reads this flag. */
  brandingBadgeEnabled: boolean;
  /** Plan §2/§6 - defaults-only, but the public site's own chrome (landing sections, footer) uses it to style itself distinctly per business type. */
  vertical: Vertical;
  /** Owner-edited page text/images (draft when previewing); resolve against code defaults via `usePageContent`. */
  pageContent: PageContentMap;
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
  const membershipPlansQuery = useQuery({
    queryKey: ["public-membership-plans", restaurantId],
    queryFn: () => getMembershipPlans(restaurantId),
  });
  const pageContentQuery = useQuery({
    queryKey: ["public-page-content", restaurantId, version],
    queryFn: () => getPageContent(restaurantId, version),
  });

  const items = menuQuery.data?.items ?? [];
  const categories = menuQuery.data?.categories ?? [];
  const addons = addonsQuery.data ?? [];

  // The catalog/items views read the module-level ALL_MENU_ITEMS (seeded with Lumière's dishes as a
  // fallback) during render, so it must be swapped in *before* children render - an effect would run
  // after the first paint and nothing would re-render, leaving a deep link to #/items or #/menu showing
  // another Site's items.
  useMemo(() => {
    if (menuQuery.data && addonsQuery.data) {
      setMenuCatalog(
        adaptItems(menuQuery.data.items, menuQuery.data.categories),
        adaptAddons(addonsQuery.data),
      );
    }
  }, [menuQuery.data, addonsQuery.data]);

  // Page content, vertical and the catalog gate the first paint so a Gym/Retail site never flashes the Restaurant defaults.
  const isLoading =
    homepageQuery.isLoading ||
    brandQuery.isLoading ||
    pageContentQuery.isLoading ||
    brandingBadgeQuery.isLoading ||
    menuQuery.isLoading ||
    addonsQuery.isLoading;

  const mediaMap = new Map(
    (mediaQuery.data?.items ?? []).map((m) => [m.id, m]),
  );

  const pageConfigs = pageConfigsQuery.data ?? [];
  const getNavLabel = (module: PlatformModule, fallback: string) =>
    pageConfigs.find((p) => p.module === module)?.navLabel || fallback;
  // Preview-only `?layout=<module>:<variant>` lets the admin layout picker show a layout before it's saved.
  const [layoutOverrideModule, layoutOverrideVariant] = isPreview
    ? (new URLSearchParams(window.location.search).get("layout") ?? "").split(":")
    : [];
  const getTemplateVariant = (module: PlatformModule): TemplateVariant => {
    if (module === layoutOverrideModule && ["a", "b", "c"].includes(layoutOverrideVariant)) {
      return layoutOverrideVariant as TemplateVariant;
    }
    return pageConfigs.find((p) => p.module === module)?.templateVariant ?? "a";
  };
  const isModuleEnabled = (module: PlatformModule) =>
    pageConfigs.find((p) => p.module === module)?.enabled ?? true;

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
    isModuleEnabled,
    membershipPlans: (membershipPlansQuery.data ?? []).filter((p) => p.isActive),
    brandingBadgeEnabled: brandingBadgeQuery.data?.enabled ?? true,
    vertical: brandingBadgeQuery.data?.vertical ?? 'restaurant',
    pageContent: pageContentQuery.data ?? {},
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
