// Main interactions for the Nakaveli demo store.
// Demo only: no real payments or saved orders.

let cart = [];
let activeFilter = "all";
const productsGrid = document.getElementById("productsGrid");
const cartOverlay = document.getElementById("cartOverlay");

function productArtClass(product) {
  return "product-art " +
    (product.color.includes("white") ? "white " : "") +
    (product.color.includes("hoodie") ? "hoodie" : "");
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[ch]);
}
function renderProducts() {
  const shown = products.filter(p => activeFilter === "all" || p.category === activeFilter);
  productsGrid.innerHTML = shown.map(p => `
    <article class="product-card">
      <div class="${productArtClass(p)}">
        <span class="product-tag">${escapeHTML(p.tag)}</span>
        <div class="tee"></div><div class="product-print">${escapeHTML(p.print)}</div>
      </div>
      <div class="product-info">
        <p class="product-name">${escapeHTML(p.name)}</p>
        <div class="product-desc">${escapeHTML(p.desc)}</div>
        <div class="price-row"><span class="price">K${Number(p.price).toFixed(2)}</span>
        <button class="add-btn" data-add="${p.id}">ADD +</button></div>
      </div>
    </article>`).join("");
  productsGrid.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", () => quickAdd(Number(btn.dataset.add))));
}
function quickAdd(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  // Quick-add starts at size M; the customer can change it in the cart.
  const existing = cart.find(item => item.id === id && item.size === "M");
  if (existing) existing.qty++;
  else cart.push({id, size:"M", qty:1});
  renderCart();
  showToast(`${product.name} added · Size M`);
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = count;
  const total = cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.id);
    return sum + (p ? Number(p.price) * item.qty : 0);
  }, 0);
  document.getElementById("subtotal").textContent = `K${total.toFixed(2)}`;
  const target = document.getElementById("cartItems");
  if (!cart.length) {
    target.innerHTML = '<div class="empty">Your bag is empty.<br><br>Find your next everyday piece in the collection.</div>';
    return;
  }
  target.innerHTML = cart.map((item, i) => {
    const p = products.find(product => product.id === item.id);
    if (!p) return "";
    return `<div class="cart-item"><div><strong>${escapeHTML(p.name)}</strong>
      <small>K${Number(p.price).toFixed(2)} each</small>
      <select data-size="${i}" aria-label="Choose size for ${escapeHTML(p.name)}">
      ${sizes.map(s => `<option value="${s}" ${s===item.size?"selected":""}>${s}</option>`).join("")}</select>
      <div class="qty"><button data-qty="${i}" data-change="-1" aria-label="Decrease quantity">−</button>
      <span>${item.qty}</span><button data-qty="${i}" data-change="1" aria-label="Increase quantity">+</button></div></div>
      <div><strong>K${(Number(p.price)*item.qty).toFixed(2)}</strong><br><button class="remove-btn" data-remove="${i}">Remove</button></div></div>`;
  }).join("");
  target.querySelectorAll("[data-size]").forEach(el => el.addEventListener("change", () => changeSize(Number(el.dataset.size), el.value)));
  target.querySelectorAll("[data-qty]").forEach(el => el.addEventListener("click", () => changeQty(Number(el.dataset.qty), Number(el.dataset.change))));
  target.querySelectorAll("[data-remove]").forEach(el => el.addEventListener("click", () => removeItem(Number(el.dataset.remove))));
}
function changeQty(i, delta) {
  if (!cart[i]) return;
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  renderCart();
}
function changeSize(i, size) {
  const item = cart[i];
  if (!item) return;
  const duplicate = cart.find((other, j) => j !== i && other.id === item.id && other.size === size);
  if (duplicate) { duplicate.qty += item.qty; cart.splice(i, 1); }
  else item.size = size;
  renderCart();
}
function removeItem(i) { cart.splice(i, 1); renderCart(); }
function openCart() {
  cartOverlay.classList.add("show");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartOverlay.classList.remove("show");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}
function checkoutDemo() {
  if (!cart.length) { showToast("Your bag is empty."); return; }
  alert("Demo only. Checkout and payments are not connected. Sample subtotal: " +
    document.getElementById("subtotal").textContent + ".");
}
document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
  activeFilter = btn.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("active", b === btn));
  renderProducts();
}));
document.querySelectorAll("[data-jump]").forEach(link => link.addEventListener("click", () => {
  activeFilter = link.dataset.jump;
  document.querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("active", b.dataset.filter === activeFilter));
  renderProducts();
}));
document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
document.getElementById("mobileShopBtn").addEventListener("click", () => document.getElementById("shop").scrollIntoView({behavior:"smooth"}));
document.getElementById("checkoutBtn").addEventListener("click", checkoutDemo);
cartOverlay.addEventListener("click", event => { if (event.target === cartOverlay) closeCart(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
renderProducts();
renderCart();
