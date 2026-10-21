import { lazy, Suspense, useEffect } from 'react';

const Home = lazy(() => import('./HomePage.jsx'));
const Careers = lazy(() => import('./CareersPage.jsx'));
const Shop = lazy(() => import('./ShopPage.jsx'));
const Login = lazy(() => import('./LoginPage.jsx'));
const AccountOrders = lazy(() => import('./AccountOrdersPage.jsx'));
const TrackOrder = lazy(() => import('./TrackOrderPage.jsx'));
const Legal = lazy(() => import('./LegalPage.jsx'));
const Admin = lazy(() => import('./AdminPage.jsx'));

export default function App() {
  const path = (location.pathname.replace(/\/+$/,'') || '/').replace(/\/index\.html$/,'') || '/';
  useEffect(() => {
    const titles = {'/':'Indira Industries | The Name of Trust','/shop':'Catalogue | Indira Industries','/login':'Customer & Partner Access | Indira Industries','/login.html':'Customer & Partner Access | Indira Industries','/account':'My Requests | Indira Industries','/account/orders':'My Requests | Indira Industries','/track-order':'Track Order | Indira Industries','/admin':'Admin | Indira Industries','/careers':'Careers | Indira Industries','/legal/privacy':'Privacy | Indira Industries','/legal/terms':'Terms | Indira Industries'};
    document.title = titles[path] || titles['/'];
    let robots = document.querySelector('meta[name=robots]');
    if (['/admin','/login','/account','/account/orders'].includes(path)) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex,nofollow';
    } else if (robots) robots.remove();
  }, [path]);
  const pages = {'/': Home, '/careers': Careers, '/shop': Shop, '/login': Login, '/login.html': Login, '/account': AccountOrders, '/account/orders': AccountOrders, '/track-order': TrackOrder, '/admin': Admin, '/legal/privacy': Legal, '/legal/terms': Legal};
  const Page = pages[path] || Home;
  return <Suspense fallback={<div className="page-loading" role="status">Loading page?</div>}><Page terms={path === '/legal/terms'} /></Suspense>;
}
