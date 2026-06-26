export function vkMediaUrl(
  path: string | null | undefined,
  versions?: Record<string, number>
) {
  if (!path) return "";
  const base = path.split("?")[0];
  const version = versions?.[base];
  return version ? `${base}?v=${version}` : base;
}
