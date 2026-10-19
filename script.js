const cart = new Map();
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function cartTotal() {
  let total = 0;
  cart.forEach(item => total += item.price * item.quantity);
  return total;
}

function renderCart() {
  const items = document.querySelector('.cart-items');
  const empty = document.querySelector('.cart-empty');
  const bottom = document.querySelector('.drawer-bottom');
  const entries = Array.from(cart.values());
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('.cart-count').textContent = count;
  document.querySelector('.drawer-total').textContent = money(cartTotal());
  document.querySelector('#order-total').textContent = money(cartTotal());
  empty.hidden = entries.length > 0;
  bottom.classList.toggle('is-visible', entries.length > 0);
  items.innerHTML = entries.map(item => '<div class="cart-row"><span class="cart-row-name">' + item.name + '</span><span class="cart-row-price">' + money(item.price * item.quantity) + '</span><span class="quantity-control"><button type="button" data-cart-action="minus" data-name="' + item.name + '" aria-label="Уменьшить количество">−</button><span>' + item.quantity + '</span><button type="button" data-cart-action="plus" data-name="' + item.name + '" aria-label="Увеличить количество">+</button></span></div>').join('');
}

document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const item = cart.get(name) || { name, price: Number(button.dataset.price), quantity: 0 };
    item.quantity += 1;
    cart.set(name, item);
    renderCart();
    showToast(name + ' добавлен в корзину');
  });
});

document.querySelector('.cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const item = cart.get(button.dataset.name);
  if (!item) return;
  item.quantity += button.dataset.cartAction === 'plus' ? 1 : -1;
  if (item.quantity <= 0) cart.delete(item.name);
  renderCart();
});

const drawer = document.querySelector('.cart-drawer');
const backdrop = document.querySelector('.drawer-backdrop');
function setDrawer(open) {
  drawer.classList.toggle('is-open', open);
  backdrop.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('no-scroll', open);
}
document.querySelector('.cart-trigger').addEventListener('click', () => setDrawer(true));
document.querySelector('.drawer-close').addEventListener('click', () => setDrawer(false));
backdrop.addEventListener('click', () => setDrawer(false));
document.querySelector('.cart-empty .button').addEventListener('click', () => setDrawer(false));
document.querySelector('.drawer-checkout').addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setDrawer(false); });

document.querySelectorAll('.filter-chip').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-chip.is-active').classList.remove('is-active');
    button.classList.add('is-active');
    document.querySelectorAll('.product-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  });
});

const reviews = Array.from(document.querySelectorAll('.review-card'));
const reviewDots = Array.from(document.querySelectorAll('[data-review-index]'));
let currentReview = 0;
function showReview(index) {
  currentReview = (index + reviews.length) % reviews.length;
  reviews.forEach((review, i) => review.classList.toggle('is-current', i === currentReview));
  reviewDots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentReview));
  document.querySelector('#review-current').textContent = String(currentReview + 1).padStart(2, '0');
}
document.querySelectorAll('[data-review-step]').forEach(button => button.addEventListener('click', () => showReview(currentReview + Number(button.dataset.reviewStep))));
reviewDots.forEach(dot => dot.addEventListener('click', () => showReview(Number(dot.dataset.reviewIndex))));

const fulfillmentInputs = document.querySelectorAll('input[name="fulfillment"]');
const addressField = document.querySelector('.address-field');
const cafeField = document.querySelector('.cafe-field');
fulfillmentInputs.forEach(input => input.addEventListener('change', () => {
  const delivery = input.value === 'delivery' && input.checked;
  document.querySelectorAll('.fulfillment-choice').forEach(choice => choice.classList.toggle('is-selected', choice.querySelector('input').checked));
  addressField.hidden = !delivery;
  addressField.querySelector('input').required = delivery;
  cafeField.hidden = delivery;
  cafeField.querySelector('select').required = !delivery;
}));

document.querySelector('#order-form').addEventListener('submit', event => {
  event.preventDefault();
  if (cart.size === 0) {
    showToast('Добавьте напиток или десерт из меню');
    document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const data = new FormData(event.currentTarget);
  const name = data.get('name').trim();
  const delivery = data.get('fulfillment') === 'delivery';
  const destination = delivery ? data.get('address').trim() : data.get('cafe');
  if (!destination) {
    showToast(delivery ? 'Укажите адрес доставки' : 'Выберите кофейню для самовывоза');
    return;
  }
  const orderNumber = String(Math.floor(100 + Math.random() * 900));
  showToast('Спасибо, ' + name + '! Демо-заказ №' + orderNumber + ' заполнен.');
  cart.clear();
  renderCart();
  event.currentTarget.reset();
  addressField.hidden = false;
  addressField.querySelector('input').required = true;
  cafeField.hidden = true;
  cafeField.querySelector('select').required = false;
  document.querySelectorAll('.fulfillment-choice').forEach(choice => choice.classList.toggle('is-selected', choice.querySelector('input').checked));
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  mainNav.classList.toggle('is-open', open);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

renderCart();
