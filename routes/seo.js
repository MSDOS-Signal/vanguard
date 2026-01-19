const express = require('express');
const { Product, News } = require('../models');
const auth = require('../middleware/auth');
const { isEditor } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const CONFIG_FILE = path.join(__dirname, '../seo-config.json');

// @route   GET api/seo/config
// @desc    Get global SEO config
// @access  Public
router.get('/config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      res.json(config);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/seo/config
// @desc    Save global SEO config
// @access  Private (Admin)
router.post('/config', auth, async (req, res) => {
  try {
    const config = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.json(config);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/seo/sitemap
// @desc    Generate sitemap
// @access  Public
router.get('/sitemap', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    
    // Get all published products
    const products = await Product.findAll({
      where: { isPublished: true },
      attributes: ['slug', 'updatedAt']
    });

    // Get all published news
    const news = await News.findAll({
      where: { isPublished: true },
      attributes: ['slug', 'updatedAt']
    });

    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/about</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/products</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/news</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/contact</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;

    // Add product URLs
    products.forEach(product => {
      sitemap += `  <url>\n    <loc>${baseUrl}/products/${product.slug}</loc>\n    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Add news URLs
    news.forEach(article => {
      sitemap += `  <url>\n    <loc>${baseUrl}/news/${article.slug}</loc>\n    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    sitemap += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/seo/robots
// @desc    Generate robots.txt
// @access  Public
router.get('/robots', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  
  let robots = 'User-agent: *\n';
  robots += 'Allow: /\n\n';
  robots += 'Disallow: /admin/\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /uploads/\n\n';
  robots += `Sitemap: ${baseUrl}/api/seo/sitemap\n`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

// @route   GET api/seo/meta/:type/:id
// @desc    Get meta data for specific content
// @access  Public
router.get('/meta/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let metaData = {};

    if (type === 'product') {
      const product = await Product.findByPk(id);
      if (product) {
        metaData = {
          title: product.seoTitle || product.name,
          description: product.seoDescription || product.description.substring(0, 160),
          keywords: product.seoKeywords || [],
          image: product.mainImage,
          type: 'product',
          url: `/products/${product.slug}`
        };
      }
    } else if (type === 'news') {
      const news = await News.findByPk(id);
      if (news) {
        metaData = {
          title: news.seoTitle || news.title,
          description: news.seoDescription || news.summary.substring(0, 160),
          keywords: news.seoKeywords || [],
          image: news.featuredImage,
          type: 'article',
          url: `/news/${news.slug}`,
          publishedTime: news.publishDate,
          author: news.author
        };
      }
    }

    if (Object.keys(metaData).length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(metaData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/seo/meta/:type/:id
// @desc    Update meta data for specific content
// @access  Editor/Admin only
router.put('/meta/:type/:id', [
  auth,
  isEditor,
  body('seoTitle').optional().isLength({ max: 200 }),
  body('seoDescription').optional().isLength({ max: 500 }),
  body('seoKeywords').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, id } = req.params;
    const { seoTitle, seoDescription, seoKeywords } = req.body;

    let content;
    if (type === 'product') {
      content = await Product.findByPk(id);
    } else if (type === 'news') {
      content = await News.findByPk(id);
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update SEO fields
    await content.update({
      seoTitle: seoTitle || content.seoTitle,
      seoDescription: seoDescription || content.seoDescription,
      seoKeywords: seoKeywords || content.seoKeywords
    });

    res.json({ message: 'SEO data updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
