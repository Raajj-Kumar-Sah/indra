(() => {
  const API = '/api';
  const $ = id => document.getElementById(id);
  let products = [];
  let cart = {};

  try {
    cart = JSON.parse(localStorage.getItem('indira_request_cart') || '{}') || {};
  } catch (_) {}

  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = p => Number.isSafeInteger(p) && p >= 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p / 100) : 'Quote Required';

  function persist() {
    try { localStorage.setItem('indira_request_cart', JSON.stringify(cart)); } catch (_) {}
    renderCart();
  }

  function renderCart() {
    const totalCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const cartCountEl = $('cartCount');
    if (cartCountEl) {
      cartCountEl.textContent = totalCount + (totalCount === 1 ? ' item in request' : ' items in request');
    }

    const entries = Object.entries(cart)
      .map(([id, quantity]) => ({ product: products.find(p => p.id === id || p.slug === id), id, quantity }))
      .filter(x => x.product);

    const cartItemsEl = $('cartItems');
    if (!cartItemsEl) return;

    if (!entries.length) {
      cartItemsEl.innerHTML = '<div class="shop-message">Your commercial request drawer is empty. Select items from the catalogue above.</div>';
      return;
    }

    let estimatedTotalPaise = 0;
    const rows = entries.map(x => {
      const p = x.product;
      if (p.price_paise) estimatedTotalPaise += p.price_paise * x.quantity;
      return `
        <div class="cart-row">
          <div>
            <b>${safe(p.name)}</b><br>
            <span style="color:#777;font-size:11px">${safe(p.division)} • ${safe(p.category)}</span><br>
            <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;margin-top:6px">
              Quantity: 
              <input data-qty="${safe(x.id)}" type="number" min="1" max="10000" value="${x.quantity}" style="width:70px;padding:5px 8px;border:1px solid #ddd;border-radius:2px">
            </label>
          </div>
          <div style="text-align:right">
            <b>${money(p.price_paise ? p.price_paise * x.quantity : null)}</b><br>
            <button type="button" data-remove="${safe(x.id)}" style="background:none;border:none;color:#a33428;cursor:pointer;font-size:11px;font-weight:700;margin-top:6px">Remove ✕</button>
          </div>
        </div>
      `;
    }).join('');

    const summaryHtml = `
      <div style="border-top:1px solid #dedace;padding-top:12px;margin-top:14px;display:flex;justify-content:space-between;font-size:14px">
        <b>Estimated Total:</b>
        <b style="color:#b58b2e">${estimatedTotalPaise > 0 ? money(estimatedTotalPaise) : 'Commercial Quote Required'}</b>
      </div>
    `;

    cartItemsEl.innerHTML = rows + summaryHtml;

    cartItemsEl.querySelectorAll('[data-qty]').forEach(input => {
      input.addEventListener('change', () => {
        const qty = Number(input.value);
        if (!Number.isSafeInteger(qty) || qty < 1 || qty > 10000) {
          input.value = cart[input.dataset.qty];
          return;
        }
        cart[input.dataset.qty] = qty;
        persist();
      });
    });

    cartItemsEl.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', () => {
        delete cart[button.dataset.remove];
        persist();
      });
    });
  }

  function renderProducts() {
    const term = ($('search')?.value || '').trim().toLowerCase();
    const division = $('division')?.value || '';
    const category = $('category')?.value || '';
    const sort = $('sortProducts')?.value || 'name';

    const list = products.filter(p => {
      if (division && p.division !== division) return false;
      if (category && p.category !== category) return false;
      if (term) {
        const match = [p.name, p.category, p.description, p.division, JSON.stringify(p.specifications || {})]
          .some(v => String(v || '').toLowerCase().includes(term));
        if (!match) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sort === 'price-low') return (a.price_paise ?? Number.MAX_SAFE_INTEGER) - (b.price_paise ?? Number.MAX_SAFE_INTEGER);
      if (sort === 'price-high') return (b.price_paise ?? -1) - (a.price_paise ?? -1);
      if (sort === 'division') return String(a.division).localeCompare(String(b.division)) || String(a.name).localeCompare(String(b.name));
      return String(a.name).localeCompare(String(b.name));
    });

    if ($('catalogueCount')) {
      $('catalogueCount').textContent = `${list.length} of ${products.length} products`;
    }

    const catalogueEl = $('catalogue');
    if (!catalogueEl) return;

    if (!list.length) {
      catalogueEl.innerHTML = `
        <div class="shop-message" style="grid-column:1/-1;text-align:center;padding:45px 20px">
          ${products.length ? 'No products match your selected filters. Try adjusting your division or search terms.' : 'Catalogue records are loading...'}
        </div>
      `;
      return;
    }

    catalogueEl.innerHTML = list.map(p => `
      <article class="shop-card">
        <div class="shop-card-top">
          <span class="shop-tag" style="background:#171710;color:#f3d17a">${safe(p.division)}</span>
          <span class="shop-tag">${safe(p.category)}</span>
        </div>
        ${p.image_url ? `
          <img src="${safe(p.image_url)}" alt="${safe(p.image_alt || p.name)}" loading="lazy" style="width:100%;height:180px;object-fit:cover;margin:14px 0;background:#f6f3eb;border-radius:2px" onerror="this.style.display='none'">
        ` : `
          <div class="shop-card-visual" style="height:180px;margin:14px 0;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#3a382d,#1a1a14 70%);color:#f1d17b;font-weight:800;letter-spacing:0.12em;text-align:center;padding:12px">
            <div>
              <span>${safe(p.division)}</span>
              <small style="display:block;color:#d7d0b9;font-size:9px;margin-top:4px">LAB FORMULATION</small>
            </div>
          </div>
        `}
        <h2>${safe(p.name)}</h2>
        <p>${safe(p.description || 'Contact our team for batch analysis and product specifications.')}</p>
        <div class="shop-card-foot">
          <span class="shop-price">${money(p.price_paise)}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" data-detail="${safe(p.id)}" style="background:#f4f1e8;border:1px solid #d8d1bd;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer">Technical Specs →</button>
            <button type="button" data-add="${safe(p.id)}" class="btn-add" style="background:#b58b2e;color:#fff;border:none;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">Add to RFQ +</button>
          </div>
        </div>
      </article>
    `).join('');

    catalogueEl.querySelectorAll('[data-detail]').forEach(button => {
      button.addEventListener('click', () => openProductDetail(button.dataset.detail));
    });

    catalogueEl.querySelectorAll('[data-add]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.add;
        cart[id] = Math.min(10000, (cart[id] || 0) + 1);
        persist();
        button.textContent = 'Added ✓';
        button.style.background = '#2e6930';
        setTimeout(() => {
          button.textContent = 'Add to RFQ +';
          button.style.background = '#b58b2e';
        }, 1200);
      });
    });
  }

  async function loadCatalogue() {
    if ($('catalogue')) {
      $('catalogue').innerHTML = '<div class="shop-message">Loading Indira Industries catalogue...</div>';
    }
    try {
      const res = await fetch(API + '/products');
      if (!res.ok) throw new Error('Catalogue temporarily unavailable.');
      const data = await res.json();
      products = Array.isArray(data.products) ? data.products : [];

      const categories = [...new Set(products.map(p => String(p.category || '').trim()).filter(Boolean))].sort();
      if ($('category')) {
        $('category').innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${safe(c)}">${safe(c)}</option>`).join('');
      }

      renderProducts();
      renderCart();
    } catch (err) {
      if ($('catalogue')) {
        $('catalogue').innerHTML = '<div class="shop-message error">Unable to load product catalogue. Please check connection.</div>';
      }
    }
  }

  // Pre-fill user data if signed in
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('indira_auth_user') || 'null'); } catch (_) { return null; }
  })();

  if (savedUser && $('orderForm')) {
    const nameInput = $('orderForm').querySelector('[name="customer_name"]');
    const phoneInput = $('orderForm').querySelector('[name="phone"]');
    if (nameInput && savedUser.full_name) nameInput.value = savedUser.full_name;
    if (phoneInput && savedUser.phone) phoneInput.value = savedUser.phone;
  }

  // Submit RFQ / Order Request
  if ($('orderForm')) {
    $('orderForm').addEventListener('submit', async event => {
      event.preventDefault();
      const resultEl = $('orderResult');
      resultEl.className = 'shop-result';
      resultEl.textContent = '';

      if (!Object.keys(cart).length) {
        resultEl.classList.add('error');
        resultEl.textContent = 'Please add at least one product to your RFQ drawer first.';
        return;
      }

      const submitBtn = event.currentTarget.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';

      const form = new FormData(event.currentTarget);
      const payload = {
        customer_name: form.get('customer_name'),
        email: form.get('email') || savedUser?.email || '',
        phone: form.get('phone'),
        company_name: form.get('company_name') || '',
        address: form.get('address'),
        notes: form.get('notes'),
        items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity }))
      };

      const authToken = localStorage.getItem('indira_auth_token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;

      try {
        const response = await fetch(API + '/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit commercial request.');

        resultEl.innerHTML = `
          <div style="background:#eaf7ed;border:1px solid #b7e4c7;padding:16px;border-radius:2px;color:#1b4332">
            <b>✓ RFQ Submitted Successfully!</b><br>
            Reference Number: <b style="font-size:15px;color:#081c15">${safe(data.order.order_number)}</b><br>
            <p style="margin:8px 0 0;font-size:12px">${safe(data.message)}</p>
            <a href="/track-order/" style="display:inline-block;margin-top:8px;font-weight:700;color:#1b4332">Track live progress on Order Tracking Portal →</a>
          </div>
        `;

        cart = {};
        persist();
        event.currentTarget.reset();
      } catch (err) {
        resultEl.className = 'shop-result error';
        resultEl.textContent = err.message || 'Could not submit request. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Product Detail Modal
  const detailModal = $('productDetailModal');
  function openProductDetail(id) {
    const p = products.find(item => item.id === id || item.slug === id);
    if (!p || !detailModal) return;

    if ($('productDetailTitle')) $('productDetailTitle').textContent = p.name;
    if ($('productDetailDescription')) $('productDetailDescription').textContent = p.description;
    if ($('productDetailCategory')) $('productDetailCategory').textContent = `${p.division} • ${p.category}`;
    if ($('productDetailPrice')) $('productDetailPrice').textContent = money(p.price_paise);
    if ($('productDetailAvailability')) $('productDetailAvailability').textContent = (p.inventory_count > 0 ? 'Batch Available' : 'Custom Formulated');

    const specsSection = $('technicalSpecsSection');
    const specsList = $('technicalSpecs');
    if (specsSection && specsList) {
      const specs = p.specifications && typeof p.specifications === 'object'
        ? Object.entries(p.specifications)
        : [];

      if (specs.length) {
        specsSection.hidden = false;
        specsList.innerHTML = specs.map(([k, v]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0ecdf;font-size:13px">
            <dt style="font-weight:700;color:#555;text-transform:capitalize">${safe(k.replace(/_/g, ' '))}</dt>
            <dd style="color:#171710;margin:0">${safe(typeof v === 'object' ? JSON.stringify(v) : v)}</dd>
          </div>
        `).join('');
      } else {
        specsSection.hidden = true;
      }
    }

    detailModal.hidden = false;
    detailModal.classList.add('open');
  }

  if ($('closeDetailModal')) {
    $('closeDetailModal').addEventListener('click', () => {
      detailModal.hidden = true;
      detailModal.classList.remove('open');
    });
  }

  // Bind Listeners
  if ($('search')) $('search').addEventListener('input', renderProducts);
  if ($('division')) $('division').addEventListener('change', renderProducts);
  if ($('category')) $('category').addEventListener('change', renderProducts);
  if ($('sortProducts')) $('sortProducts').addEventListener('change', renderProducts);
  if ($('reload')) $('reload').addEventListener('click', loadCatalogue);
  if ($('year')) $('year').textContent = new Date().getFullYear();

  loadCatalogue();
})();