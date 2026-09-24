import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { DEMO_PASSWORD } from '../seed';
import type { LoginRequest, User } from '../../types';

/**
 * The mock token encodes the userId directly (`mock-token-<userId>-<issuedAt>`) rather than being
 * looked up in a server-side session map, because that map would live inside the MSW service
 * worker's memory - which the browser can and does silently restart between page navigations,
 * wiping any in-memory session state and causing a false logout on a hard reload.
 */
function issueToken(userId: string) {
  return `mock-token-${userId}-${Date.now()}`;
}

function userIdFromToken(token: string): string | undefined {
  const match = token.match(/^mock-token-(.+)-\d+$/);
  return match?.[1];
}

function userFromAuthHeader(request: Request): User | undefined {
  const auth = request.headers.get('authorization');
  const token = auth?.replace(/^Bearer\s+/i, '');
  const userId = token ? userIdFromToken(token) : undefined;
  return db.data.users.find((u) => u.id === userId);
}

export const authHandlers = [
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const org = db.data.organizations.find((o) => o.code.toLowerCase() === body.orgId?.trim().toLowerCase());
    if (!org) {
      return HttpResponse.json(
        { error: { code: 'invalid_org', message: 'Unknown Organization ID.' } },
        { status: 401 },
      );
    }
    const user = db.data.users.find(
      (u) => u.organizationId === org.id && u.email.toLowerCase() === body.email.toLowerCase(),
    );
    if (!user || body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        { error: { code: 'invalid_credentials', message: 'Incorrect email or password.' } },
        { status: 401 },
      );
    }
    const token = issueToken(user.id);
    return HttpResponse.json({
      user,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    });
  }),

  http.post('*/api/v1/auth/logout', () => HttpResponse.json({ message: 'Logged out.' })),

  http.post('*/api/v1/auth/forgot-password', () =>
    HttpResponse.json({ message: 'If that email exists, a reset link has been sent.' }),
  ),

  http.get('*/api/v1/auth/me', ({ request }) => {
    const user = userFromAuthHeader(request);
    if (!user) return HttpResponse.json({ error: { code: 'unauthorized', message: 'Not logged in.' } }, { status: 401 });
    return HttpResponse.json({ user });
  }),
];

export { userFromAuthHeader };
