const NAV_TOP = 72;

export function resolveNavDark(): boolean {
  const markers = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
  if (!markers.length) return false;

  let active: HTMLElement | null = null;
  for (const el of markers) {
    if (el.getBoundingClientRect().top <= NAV_TOP) active = el;
    else break;
  }

  return active?.dataset.navTheme === "dark";
}
