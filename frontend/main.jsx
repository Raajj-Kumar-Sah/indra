import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.jsx';
import './styles/theme.css';
import './styles/motion.css';
import './styles/three-world.css';
import './styles/chatbot.css';
import './styles/brand-direction.css';
import './styles/product-detail.css';
import './app.css';

createRoot(document.getElementById('root')).render(<App />);
