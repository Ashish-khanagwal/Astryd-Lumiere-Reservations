import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import { issueToken } from './auth';
import { buildStarterSections } from '../seed';
import { VERTICAL_TEMPLATE_VARIANT } from '../../data/onboardingDefaults';
import type {
  BrandSettings,
  Homepage,
  HomepageSection,
  ReservationAvailabilitySettings,
  SignupRequest,
  User,
  WeekDay,
} from '../../types';

const WEEK_DAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function uniqueOrgCode(name: string): string {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16) || 'ORG';
  let code = base;
  let n = 2;
  while (db.data.organizations.some((o) => o.code === code)) {
    code = `${base}${n}`;
    n += 1;
  }
  return code;
}

/** Multi-Vertical Platform Plan §14 Phase 6 / §6A - public, unauthenticated: creates the Organization + Owner User + first Site in one transaction, then signs the new Owner straight in (same session shape as /auth/login). */
export const signupHandlers = [
  http.post('*/api/v1/auth/signup', async ({ request }) => {
    const body = (await request.json()) as SignupRequest;
    const organizationName = body.organizationName?.trim();
    const siteName = body.siteName?.trim();
    const slug = body.slug?.trim().toLowerCase();
    const ownerName = body.ownerName?.trim();
    const ownerEmail = body.ownerEmail?.trim().toLowerCase();

    if (!organizationName || !siteName || !slug || !ownerName || !ownerEmail || !body.modules?.length) {
      return HttpResponse.json({ error: { code: 'invalid_body', message: 'All fields are required.' } }, { status: 400 });
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return HttpResponse.json(
        { error: { code: 'invalid_slug', message: 'Use lowercase letters, numbers, and hyphens only.' } },
        { status: 400 },
      );
    }
    if (db.data.restaurants.some((r) => r.slug === slug)) {
      return HttpResponse.json({ error: { code: 'duplicate_slug', message: 'That subdomain is already taken.' } }, { status: 409 });
    }

    const now = nowIso();
    const orgId = nextId('org');
    const orgCode = uniqueOrgCode(organizationName);
    const siteId = nextId('site');
    const userId = nextId('user');

    db.data.organizations.push({ id: orgId, code: orgCode, name: organizationName, createdAt: now, updatedAt: now });

    const owner: User = {
      id: userId,
      organizationId: orgId,
      email: ownerEmail,
      name: ownerName,
      role: 'owner',
      restaurantId: siteId,
      siteAccess: 'all',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.data.users.push(owner);

    db.data.restaurants.push({
      id: siteId,
      organizationId: orgId,
      slug,
      name: siteName,
      ownerUserId: userId,
      status: 'active',
      vertical: body.vertical,
      brandingBadgeEnabled: true,
      createdAt: now,
      updatedAt: now,
    });

    db.data.pageConfigs.push(
      ...body.modules.map((m, order) => ({
        id: `pageconfig_${siteId}_${m.module}`,
        restaurantId: siteId,
        module: m.module,
        enabled: m.enabled,
        navLabel: m.navLabel,
        order,
        templateVariant: VERTICAL_TEMPLATE_VARIANT[body.vertical] ?? 'a',
        createdAt: now,
        updatedAt: now,
      })),
    );

    const brandSettings: BrandSettings = {
      restaurantId: siteId,
      restaurantName: siteName,
      tagline: body.branding.tagline,
      logoMediaId: null,
      faviconMediaId: null,
      themePresetId: body.branding.themePresetId,
      primaryFont: 'Inter',
      headingFont: 'Playfair Display',
      fontWeight: 'regular',
      buttonStyle: 'rounded',
      borderRadius: 'md',
      socialLinks: {},
      contact: { phone: '', email: ownerEmail, address: '' },
      description: body.branding.tagline,
      cuisineType: '',
      businessHours: WEEK_DAYS.map((day) => ({ day, isClosed: false, openTime: '09:00', closeTime: '18:00' })),
      createdAt: now,
      updatedAt: now,
    };
    db.data.brand[siteId] = { draft: brandSettings, published: brandSettings };

    db.data.website[siteId] = {
      restaurantId: siteId,
      publishStatus: 'draft',
      publishedAt: null,
      seoTitle: siteName,
      seoDescription: body.branding.tagline,
      createdAt: now,
      updatedAt: now,
    };

    const heroSection: HomepageSection = {
      id: nextId('section'),
      restaurantId: siteId,
      type: 'hero',
      order: 0,
      visible: true,
      content: {
        heading: siteName,
        description: body.branding.tagline || 'Welcome to our new site - built in minutes.',
        buttonText: 'Get Started',
        buttonLink: '#/menu',
        backgroundMediaId: null,
        overlayOpacity: 40,
      },
      updatedAt: now,
    };
    const homepage: Homepage = {
      restaurantId: siteId,
      status: 'draft',
      sections: buildStarterSections(siteId, now, heroSection, {
        heroHeading: siteName,
        heroDescription: '',
        aboutEyebrow: 'Our Story',
        aboutHeading: `About ${siteName}`,
        aboutDescription: body.branding.tagline || 'Tell your customers what makes you different.',
        featuredHeading: 'Featured',
        galleryHeading: 'Gallery',
        offersHeading: 'Special Offers',
        testimonialsHeading: 'What People Say',
        testimonials: [],
      }),
    };
    db.data.homepage[siteId] = { draft: homepage, published: homepage };

    db.data.domainMappings.push({
      id: nextId('domain'),
      restaurantId: siteId,
      type: 'platform_subdomain',
      hostname: `${slug}.ourplatform.com`,
      recordType: 'CNAME',
      recordName: '@',
      recordValue: `${slug}.ourplatform.com`,
      verificationStatus: 'verified',
      sslStatus: 'issued',
      createdAt: now,
      updatedAt: now,
    });

    const availability: ReservationAvailabilitySettings = {
      restaurantId: siteId,
      days: WEEK_DAYS.map((day) => ({
        day,
        isClosed: false,
        openTime: '09:00',
        closeTime: '21:00',
        slotDurationMins: 60,
        maxPerSlot: 4,
        slots: [],
      })),
      blockedDates: [],
    };
    db.data.reservationAvailability[siteId] = availability;

    db.save();

    return HttpResponse.json(
      {
        user: owner,
        token: issueToken(userId),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
        orgCode,
      },
      { status: 201 },
    );
  }),
];
