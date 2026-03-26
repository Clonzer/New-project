const STORAGE_KEY = "synthix-cart";
export const CART_CHANGE_EVENT = "synthix-cart-change";

export type CartLine = { listingId: number; quantity: number };

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (row): row is CartLine =>
          row &&
          typeof row === "object" &&
          typeof (row as CartLine).listingId === "number" &&
          typeof (row as CartLine).quantity === "number",
      )
      .map((row) => ({
        listingId: row.listingId,
        quantity: Math.min(100, Math.max(1, Math.floor(row.quantity))),
      }));
  } catch {
    return [];
  }
}

export function readCart(): CartLine[] {
  if (typeof localStorage === "undefined") return [];
  return parseCart(localStorage.getItem(STORAGE_KEY));
}

export function writeCart(lines: CartLine[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function cartItemCount(): number {
  return readCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function addToCart(listingId: number, quantity: number) {
  const q = Math.min(100, Math.max(1, Math.floor(quantity)));
  const lines = readCart();
  const idx = lines.findIndex((l) => l.listingId === listingId);
  if (idx >= 0) {
    lines[idx] = { listingId, quantity: Math.min(100, lines[idx].quantity + q) };
  } else {
    lines.push({ listingId, quantity: q });
  }
  writeCart(lines);
}

export function setLineQuantity(listingId: number, quantity: number) {
  const q = Math.min(100, Math.max(1, Math.floor(quantity)));
  const lines = readCart()
    .map((l) => (l.listingId === listingId ? { ...l, quantity: q } : l))
    .filter((l) => l.quantity > 0);
  writeCart(lines);
}

export function removeFromCart(listingId: number) {
  writeCart(readCart().filter((l) => l.listingId !== listingId));
}

export function clearCart() {
  writeCart([]);
}
