/**
 * Sends the player to the checkout page.
 *
 * PayPal's sign-in breaks when it runs inside an embedded frame (such as the
 * editor preview), because the browser blocks its cookies there. When the app
 * is framed, open PayPal in a new tab instead. Same-site simulated checkouts
 * always stay in the current tab.
 *
 * Returns true when checkout opened in a new tab.
 */
export function openCheckout(url: string): boolean {
  const external = /^https?:\/\//i.test(url) && !url.startsWith(window.location.origin);
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }
  if (external && framed) {
    const tab = window.open(url, "_blank");
    if (tab) return true;
  }
  window.location.assign(url);
  return false;
}
