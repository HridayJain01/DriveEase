// Fleet helpers shared by the Concierge, Compare, My Garage and the car pages.
// Pure functions only: they never invent a value the admin hasn't entered.

// A spec counts as known only if the admin filled it in.
export const known = (v) => v !== undefined && v !== null && v !== '';

// Photo groups for the car page gallery. `images` holds exterior shots (the first is the cover).
export const PHOTO_GROUPS = [
  { key: 'images', label: 'Exterior' },
  { key: 'interiorImages', label: 'Interior & dashboard' },
  { key: 'bootImages', label: 'Boot & luggage space' },
];

export function photoGroups(v) {
  return PHOTO_GROUPS.map((g) => ({ ...g, photos: (v?.[g.key] || []).filter(Boolean) }));
}

export const bySlug = (vehicles = [], slugs = []) => {
  const map = new Map(vehicles.map((v) => [v.slug, v]));
  return { found: slugs.map((s) => map.get(s)).filter(Boolean), missing: slugs.filter((s) => !map.has(s)) };
};
