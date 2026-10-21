(() => {
  const nav = document.getElementById('mainNav');
  const menu = document.getElementById('menuToggle');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '×' : '☰';
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = '☰';
  }));
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }
  document.querySelectorAll('.enquire-product').forEach(button => {
    button.addEventListener('click', () => {
      const product = button.dataset.product || 'Product enquiry';
      const select = document.getElementById('division');
      if (select) select.value = 'IINDLUBE — Lubricants';
      const message = document.getElementById('message');
      if (message) message.value = 'I would like more information about ' + product + ', including current availability, packaging and technical documentation.';
      document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
      setTimeout(() => document.getElementById('name')?.focus({preventScroll:true}), 450);
    });
  });
  document.querySelectorAll('[data-category="lubricants"]').forEach(link => link.addEventListener('click', () => {
    const select = document.getElementById('division');
    if (select) select.value = 'IINDLUBE — Lubricants';
  }));
  const form = document.getElementById('enquiryForm');
  const status = document.getElementById('formStatus');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.classList.remove('error');
    status.textContent = '';
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit your enquiry right now.');
      status.textContent = result.message || 'Thank you. Your enquiry has been received.';
      form.reset();
    } catch (error) {
      status.classList.add('error');
      status.textContent = 'Online submission is temporarily unavailable. Please email admin@indiraindustries.co.in or call +91 78270 32808.';
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
  document.getElementById('prevProduct')?.addEventListener('click', () => showToast('You are viewing the current featured categories.'));
  document.getElementById('nextProduct')?.addEventListener('click', () => showToast('Ask our team about the full IINDLUBE range.'));
})();