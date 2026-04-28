export const SHOP_COMPARE_STORAGE_KEY = "synthix_shop_compare";
export const SHOP_COMPARE_CHANGE_EVENT = "synthix:shop-compare";

export type ComparedShop = {
  id: number;
  displayName: string;
  shopName: string | null;
  location: string | null;
  rating: number | null;
  reviewCount: number;
  shopMode: string | null;
  totalPrints: number;
};

export function getComparedShops(): ComparedShop[] {
  try {
    return JSON.parse(localStorage.getItem(SHOP_COMPARE_STORAGE_KEY) || "[]") as ComparedShop[];
  } catch {
    return [];
  }
}

function writeComparedShops(shops: ComparedShop[]) {
  localStorage.setItem(SHOP_COMPARE_STORAGE_KEY, JSON.stringify(shops.slice(0, 4)));
  window.dispatchEvent(new Event(SHOP_COMPARE_CHANGE_EVENT));
}

export function isComparedShop(shopId: number) {
  return getComparedShops().some((shop) => shop.id === shopId);
}

export function toggleComparedShop(shop: ComparedShop) {
  const current = getComparedShops();
  if (current.some((item) => item.id === shop.id)) {
    writeComparedShops(current.filter((item) => item.id !== shop.id));
    return false;
  }
  writeComparedShops([...current, shop]);
  return true;
}
