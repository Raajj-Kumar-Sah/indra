import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/products - List products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { division, category, q } = req.query;
    const products = await supabase.getProducts({
      division: typeof division === 'string' ? division.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
      search: typeof q === 'string' ? q.trim() : undefined,
      activeOnly: true
    });

    res.json({
      products,
      count: products.length,
      note: 'Industrial specifications and batch availability confirmed upon RFQ.'
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Unable to retrieve product catalogue.' });
  }
});

// GET /api/products/categories - Distinct categories list
router.get('/meta/categories', async (req, res) => {
  try {
    const products = await supabase.getProducts({ activeOnly: true });
    const categoriesByDivision = {};

    products.forEach(p => {
      if (!categoriesByDivision[p.division]) {
        categoriesByDivision[p.division] = new Set();
      }
      if (p.category) {
        categoriesByDivision[p.division].add(p.category);
      }
    });

    const result = Object.entries(categoriesByDivision).map(([division, set]) => ({
      division,
      categories: Array.from(set).sort()
    }));

    res.json({ categories: result });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load categories.' });
  }
});

// GET /api/products/:idOrSlug - Single product detail
router.get('/:idOrSlug', async (req, res) => {
  try {
    const product = await supabase.getProductByIdOrSlug(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve product detail.' });
  }
});

export default router;
