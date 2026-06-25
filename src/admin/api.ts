const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: isForm
      ? init?.headers
      : { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Ошибка ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  me: () => request<{ ok: boolean }>("/auth/me"),
  login: (login: string, password: string) =>
    request<{ ok: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  getContent: () => request<import("../data/contentTypes").SiteContent>("/content"),
  saveGallery: (section: string, images: string[]) =>
    request("/gallery/" + section, {
      method: "PUT",
      body: JSON.stringify({ images }),
    }),
  upload: (section: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ ok: boolean; url: string }>(`/gallery/${section}/upload`, {
      method: "POST",
      body: fd,
    });
  },
  replace: (section: string, imagePath: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", imagePath);
    return request<{ ok: boolean; url: string }>(`/gallery/${section}/replace`, {
      method: "POST",
      body: fd,
    });
  },
  deleteImage: (section: string, imagePath: string) =>
    request("/gallery/" + section, {
      method: "DELETE",
      body: JSON.stringify({ path: imagePath }),
    }),
  saveExhibition: (picks: import("../data/contentTypes").ExhibitionPick[]) =>
    request("/exhibition", { method: "PUT", body: JSON.stringify({ picks }) }),
  savePhotoStrip: (images: string[]) =>
    request("/photo-strip", { method: "PUT", body: JSON.stringify({ images }) }),
  savePrices: (priceGroups: import("../data/contentTypes").PriceGroup[]) =>
    request("/prices", { method: "PUT", body: JSON.stringify({ priceGroups }) }),
  savePaintings: (paintingsForSale: import("../data/contentTypes").PaintingForSale[]) =>
    request("/paintings", { method: "PUT", body: JSON.stringify({ paintingsForSale }) }),
};
