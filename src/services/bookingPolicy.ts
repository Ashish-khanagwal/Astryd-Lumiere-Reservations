/** Only food venues expose seating preferences; resource IDs remain internal. */
export function supportsSeating(vertical: string | undefined) {
  return vertical === 'restaurant' || vertical === 'coffee';
}
