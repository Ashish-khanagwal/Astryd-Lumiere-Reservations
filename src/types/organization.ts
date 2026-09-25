import type { Id, Timestamps } from './common';

/**
 * Platform tenant boundary above a Site (Multi-Vertical Platform Plan §2/§3).
 * `code` is the short, human-typed value used at login ("Org ID") - distinct from the
 * internal `id`, which stays an opaque key like every other entity in this app.
 */
export interface Organization extends Timestamps {
  id: Id;
  code: string;
  name: string;
}
