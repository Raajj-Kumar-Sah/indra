export const api = async (url, options = {}) => {
  const token = localStorage.getItem('indira_auth_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};
export const money = (paise) => Number.isSafeInteger(paise) && paise > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100) : 'Request a quote';
