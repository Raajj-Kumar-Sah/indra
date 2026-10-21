(() => {
  const $ = id => document.getElementById(id);
  const escapeHtml = val => String(val ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = p => Number.isSafeInteger(p) && p >= 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p / 100) : 'Quote Only';

  let activeTab = 'products';
  let token = localStorage.getItem('indira_auth_token');
  let currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('indira_auth_user') || 'null'); } catch (_) { return null; }
  })();

  function updateAuthUI() {
    const label = $('adminUserLabel');
    if (!token) {
      if (label) label.textContent = 'Not Signed In';
      $('dataList').innerHTML = `
        <div class="admin-empty" style="color:#a33428">
          <b>Access Restricted:</b> Please sign in with an administrator account to view and manage company records.<br><br>
          <button id="quickAdminLoginBtn" class="btn btn-gold" style="padding:10px 18px">Click here to Sign in as Admin</button>
        </div>
      `;
      const quickBtn = $('quickAdminLoginBtn');
      if (quickBtn) quickBtn.addEventListener('click', doQuickAdminLogin);
      return false;
    }

    if (label) {
      label.textContent = currentUser?.email ? `Admin: ${currentUser.email}` : 'Signed in as Admin';
    }
    return true;
  }

  async function doQuickAdminLogin() {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@indiraindustries.co.in', role: 'admin' })
      });
      const data = await res.json();
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('indira_auth_token', token);
      localStorage.setItem('indira_auth_user', JSON.stringify(currentUser));
      updateAuthUI();
      loadAll();
    } catch (err) {
      alert('Login error: ' + err.message);
    }
  }

  $('adminLoginBypassBtn')?.addEventListener('click', doQuickAdminLogin);
  $('adminSignOutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('indira_auth_token');
    localStorage.removeItem('indira_auth_user');
    token = null;
    currentUser = null;
    location.replace('/login');
  });

  // Tab Switching
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      activeTab = button.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === button));
      $('productPanel').hidden = activeTab !== 'products';
      $('careerPanel').hidden = activeTab !== 'careers';
      loadData();
    });
  });

  // Load KPI Metrics
  async function loadMetrics() {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      const m = data.metrics;

      if ($('kpiPipeline')) $('kpiPipeline').textContent = m.totalPipelineFormatted;
      if ($('kpiOrders')) $('kpiOrders').textContent = m.totalOrders;
      if ($('kpiPendingOrders')) $('kpiPendingOrders').textContent = `${m.pendingOrders} Pending Review`;
      if ($('kpiProducts')) $('kpiProducts').textContent = `${m.activeProducts} / ${m.totalProducts}`;
      if ($('kpiLeads')) $('kpiLeads').textContent = `${m.newEnquiries} New (${m.totalEnquiries} Total)`;
    } catch (err) {
      console.warn('Metrics error:', err);
    }
  }

  // Load Active Tab Records
  async function loadData() {
    if (!updateAuthUI()) return;

    const dataList = $('dataList');
    dataList.innerHTML = '<div class="admin-empty">Loading records from Supabase...</div>';

    const endpoint = activeTab === 'products'
      ? '/api/admin/products'
      : activeTab === 'orders'
      ? '/api/admin/orders'
      : activeTab === 'careers'
      ? '/api/admin/careers'
      : '/api/admin/enquiries';

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.status === 401 || response.status === 403) {
        dataList.innerHTML = '<div class="admin-empty" style="color:#a33428">Administrator authorization required. Please sign in with an admin account.</div>';
        return;
      }

      const data = await response.json();
      const rows = activeTab === 'products'
        ? data.products
        : activeTab === 'orders'
        ? data.orders
        : activeTab === 'careers'
        ? data.careers
        : data.enquiries;

      $('listTitle').textContent = activeTab === 'products'
        ? 'Catalogue Products'
        : activeTab === 'orders'
        ? 'Commercial RFQs & Orders'
        : activeTab === 'careers'
        ? 'Active Career Postings'
        : 'Inbound Inquiries CRM';

      $('listDescription').textContent = `${(rows || []).length} record(s) found in database.`;

      if (!rows || !rows.length) {
        dataList.innerHTML = '<div class="admin-empty">No records found for this section.</div>';
        return;
      }

      // 1. PRODUCTS TABLE
      if (activeTab === 'products') {
        dataList.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Division</th>
                <th>Category</th>
                <th>Estimated Unit</th>
                <th>Inventory Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(p => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" style="width:36px;height:36px;object-fit:cover;border-radius:2px">` : ''}
                      <div>
                        <b>${escapeHtml(p.name)}</b><br>
                        <small style="color:#888">${escapeHtml(p.slug)}</small>
                      </div>
                    </div>
                  </td>
                  <td><span style="font-size:11px;background:#f3f0e6;padding:3px 6px;border-radius:2px">${escapeHtml(p.division)}</span></td>
                  <td>${escapeHtml(p.category)}</td>
                  <td><b>${money(p.price_paise)}</b></td>
                  <td>
                    <div style="display:flex;gap:6px;align-items:center">
                      <input data-stock-input="${escapeHtml(p.id)}" type="number" min="0" value="${escapeHtml(p.inventory_count)}" style="width:70px;padding:6px">
                      <button data-save-stock="${escapeHtml(p.id)}" style="background:#f4f0e6;border:1px solid #ddd;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">Save</button>
                    </div>
                  </td>
                  <td>
                    <select data-active-select="${escapeHtml(p.id)}" style="padding:6px">
                      <option value="true" ${p.active ? 'selected' : ''}>Active / Visible</option>
                      <option value="false" ${!p.active ? 'selected' : ''}>Hidden</option>
                    </select>
                  </td>
                  <td>
                    <button data-del-product="${escapeHtml(p.id)}" style="background:#fff0f0;color:#a33428;border:1px solid #f5c2c2;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        // Event listeners for products
        dataList.querySelectorAll('[data-save-stock]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.saveStock;
            const stockInput = dataList.querySelector(`[data-stock-input="${id}"]`);
            const activeSelect = dataList.querySelector(`[data-active-select="${id}"]`);
            btn.textContent = 'Saving...';
            try {
              const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                  inventory_count: Number(stockInput.value),
                  active: activeSelect.value === 'true'
                })
              });
              if (!res.ok) throw new Error('Update failed');
              btn.textContent = 'Saved ✓';
              setTimeout(() => { btn.textContent = 'Save'; }, 1000);
              loadMetrics();
            } catch (err) {
              alert(err.message);
              btn.textContent = 'Retry';
            }
          });
        });

        dataList.querySelectorAll('[data-active-select]').forEach(select => {
          select.addEventListener('change', async () => {
            const id = select.dataset.activeSelect;
            await fetch(`/api/admin/products/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify({ active: select.value === 'true' })
            });
            loadMetrics();
          });
        });

        dataList.querySelectorAll('[data-del-product]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.delProduct;
            if (!confirm('Are you sure you want to permanently remove this product from the Supabase catalogue?')) return;
            btn.textContent = 'Deleting...';
            try {
              const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (!res.ok) throw new Error('Delete failed');
              loadData();
              loadMetrics();
            } catch (err) {
              alert(err.message);
            }
          });
        });
      }

      // 2. ORDERS TABLE
      if (activeTab === 'orders') {
        dataList.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client / Company</th>
                <th>Contact</th>
                <th>Items in Request</th>
                <th>Estimated Total</th>
                <th>Status Workflow</th>
                <th>Carrier Tracking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(o => `
                <tr>
                  <td><b>${escapeHtml(o.order_number)}</b><br><small style="color:#888">${new Date(o.created_at).toLocaleDateString()}</small></td>
                  <td><b>${escapeHtml(o.customer_name)}</b><br><span style="color:#666">${escapeHtml(o.company_name || 'Direct')}</span></td>
                  <td>${escapeHtml(o.customer_email)}<br><small>${escapeHtml(o.phone)}</small></td>
                  <td>${(Array.isArray(o.items) ? o.items : []).map(i => `${escapeHtml(i.name)} (×${i.quantity})`).join(', ')}</td>
                  <td><b>${money(o.subtotal_paise)}</b></td>
                  <td>
                    <select data-order-status="${escapeHtml(o.id)}" style="padding:6px;font-size:12px">
                      <option value="received" ${o.status === 'received' ? 'selected' : ''}>Received</option>
                      <option value="under_review" ${o.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                      <option value="quoted" ${o.status === 'quoted' ? 'selected' : ''}>Quoted</option>
                      <option value="in_production" ${o.status === 'in_production' ? 'selected' : ''}>In Production</option>
                      <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Dispatched / Shipped</option>
                      <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <input data-carrier="${escapeHtml(o.id)}" placeholder="Carrier (e.g. BlueDart)" value="${escapeHtml(o.tracking_carrier || '')}" style="width:110px;padding:4px;font-size:11px;margin-bottom:4px"><br>
                    <input data-tracking="${escapeHtml(o.id)}" placeholder="Docket / Tracking #" value="${escapeHtml(o.tracking_number || '')}" style="width:110px;padding:4px;font-size:11px">
                  </td>
                  <td>
                    <button data-save-order="${escapeHtml(o.id)}" class="btn btn-gold" style="padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">Update</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        dataList.querySelectorAll('[data-save-order]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.saveOrder;
            const statusSelect = dataList.querySelector(`[data-order-status="${id}"]`);
            const carrierInput = dataList.querySelector(`[data-carrier="${id}"]`);
            const trackingInput = dataList.querySelector(`[data-tracking="${id}"]`);
            btn.textContent = 'Saving...';
            try {
              const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                  status: statusSelect.value,
                  tracking_carrier: carrierInput.value.trim(),
                  tracking_number: trackingInput.value.trim()
                })
              });
              if (!res.ok) throw new Error('Order update failed');
              btn.textContent = 'Saved ✓';
              setTimeout(() => { btn.textContent = 'Update'; }, 1000);
              loadMetrics();
            } catch (err) {
              alert(err.message);
              btn.textContent = 'Retry';
            }
          });
        });
      }

      // 3. ENQUIRIES CRM TABLE
      if (activeTab === 'enquiries') {
        dataList.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Lead / Contact</th>
                <th>Division</th>
                <th>Company</th>
                <th>Message / Inquiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(e => `
                <tr>
                  <td><b>${escapeHtml(e.name)}</b><br><small>${escapeHtml(e.email)} • ${escapeHtml(e.phone || '')}</small></td>
                  <td><span style="font-size:11px;background:#f3f0e6;padding:3px 6px;border-radius:2px">${escapeHtml(e.division)}</span></td>
                  <td>${escapeHtml(e.company || '—')}</td>
                  <td style="max-width:320px">${escapeHtml(e.message)}</td>
                  <td>
                    <select data-enq-status="${escapeHtml(e.id)}" style="padding:6px">
                      <option value="new" ${e.status === 'new' ? 'selected' : ''}>New Lead</option>
                      <option value="contacted" ${e.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                      <option value="qualified" ${e.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                      <option value="converted" ${e.status === 'converted' ? 'selected' : ''}>Converted</option>
                      <option value="closed" ${e.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                  </td>
                  <td>
                    <button data-save-enq="${escapeHtml(e.id)}" style="background:#f4f0e6;border:1px solid #ddd;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">Update</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        dataList.querySelectorAll('[data-save-enq]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.saveEnq;
            const statusSelect = dataList.querySelector(`[data-enq-status="${id}"]`);
            btn.textContent = 'Saving...';
            try {
              const res = await fetch(`/api/admin/enquiries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ status: statusSelect.value })
              });
              if (!res.ok) throw new Error('Update failed');
              btn.textContent = 'Saved ✓';
              setTimeout(() => { btn.textContent = 'Update'; }, 1000);
              loadMetrics();
            } catch (err) {
              alert(err.message);
              btn.textContent = 'Retry';
            }
          });
        });
      }

      // 4. CAREERS TABLE
      if (activeTab === 'careers') {
        dataList.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Type</th>
                <th>Applications Email</th>
                <th>Visibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(c => `
                <tr>
                  <td><b>${escapeHtml(c.title)}</b></td>
                  <td>${escapeHtml(c.department)}</td>
                  <td>${escapeHtml(c.location)}</td>
                  <td>${escapeHtml(c.employment_type)}</td>
                  <td>${escapeHtml(c.apply_email)}</td>
                  <td>
                    <select data-career-active="${escapeHtml(c.id)}" style="padding:6px">
                      <option value="true" ${c.active ? 'selected' : ''}>Active</option>
                      <option value="false" ${!c.active ? 'selected' : ''}>Archived</option>
                    </select>
                  </td>
                  <td>
                    <button data-del-career="${escapeHtml(c.id)}" style="background:#fff0f0;color:#a33428;border:1px solid #f5c2c2;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        dataList.querySelectorAll('[data-career-active]').forEach(select => {
          select.addEventListener('change', async () => {
            const id = select.dataset.careerActive;
            await fetch(`/api/admin/careers/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify({ active: select.value === 'true' })
            });
          });
        });

        dataList.querySelectorAll('[data-del-career]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.delCareer;
            if (!confirm('Remove this career role?')) return;
            await fetch(`/api/admin/careers/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadData();
          });
        });
      }
    } catch (err) {
      dataList.innerHTML = `<div class="admin-empty" style="color:#a33428">${escapeHtml(err.message)}</div>`;
    }
  }

  // Handle Product Form Submission with Supabase Storage File Upload
  $('productForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const statusEl = $('productStatus');
    const imageStatusEl = $('imageStatus');
    statusEl.className = 'admin-result';
    statusEl.textContent = 'Publishing product to Supabase...';

    const form = new FormData(event.currentTarget);
    const priceVal = form.get('price');
    const productPayload = {
      division: form.get('division'),
      category: form.get('category'),
      name: form.get('name'),
      slug: form.get('slug'),
      description: form.get('description'),
      inventory_count: Number(form.get('stock')),
      price_paise: priceVal === '' ? null : Math.round(Number(priceVal) * 100),
      image_alt: String(form.get('image_alt') || '')
    };

    try {
      const fileInput = $('productImage');
      if (fileInput && fileInput.files[0]) {
        const file = fileInput.files[0];
        imageStatusEl.textContent = 'Uploading asset to Supabase Storage bucket (product-images)...';
        const uploadData = new FormData();
        uploadData.append('file', file);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: uploadData
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || 'Image upload failed');
        productPayload.image_url = uploadJson.url;
        imageStatusEl.textContent = '✓ Image uploaded to Supabase Storage.';
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(productPayload)
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Product creation failed');

      statusEl.textContent = '✓ Product created and active in Supabase catalogue.';
      event.currentTarget.reset();
      loadData();
      loadMetrics();
    } catch (err) {
      statusEl.className = 'admin-result error';
      statusEl.textContent = err.message;
    }
  });

  // Handle Career Form Submission
  $('careerForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const statusEl = $('careerStatus');
    statusEl.className = 'admin-result';
    statusEl.textContent = 'Saving role...';

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.active = true;

    try {
      const res = await fetch('/api/admin/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to save career role');

      statusEl.textContent = '✓ Career posting published.';
      event.currentTarget.reset();
      loadData();
    } catch (err) {
      statusEl.className = 'admin-result error';
      statusEl.textContent = err.message;
    }
  });

  function loadAll() {
    loadMetrics();
    loadData();
  }

  $('refresh')?.addEventListener('click', loadAll);
  updateAuthUI();
  loadAll();
})();