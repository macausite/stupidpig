const fs = require('fs');
const path = require('path');

// Target file where games are defined
const gridFilePath = path.join(__dirname, '../components/DashboardGrid.jsx');

try {
  console.log('[Sitemap] Reading components/DashboardGrid.jsx...');
  const content = fs.readFileSync(gridFilePath, 'utf8');
  
  // Find all game ids by regex matching id: '...'
  const matches = [...content.matchAll(/id:\s*'([^']+)'/g)];
  const gameIds = [...new Set(matches.map(m => m[1]))]; // deduplicate
  
  console.log(`[Sitemap] Found ${gameIds.length} games:`, gameIds);
  
  const domain = 'https://stupidpig.com';
  const lastmod = new Date().toISOString().split('T')[0];
  
  // Base static pages
  const staticPages = [
    '',
    '/privacy',
    '/terms',
    '/contact',
    '/category/hyper_casual',
    '/category/puzzle',
    '/category/arcade',
    '/category/open_source'
  ];
  
  let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(p => {
    sitemapXml += '  <url>\n';
    sitemapXml += `    <loc>${domain}${p}</loc>\n`;
    sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`;
    sitemapXml += '    <changefreq>daily</changefreq>\n';
    sitemapXml += '    <priority>1.0</priority>\n';
    sitemapXml += '  </url>\n';
  });
  
  // Add dynamic game pages
  gameIds.forEach(id => {
    sitemapXml += '  <url>\n';
    sitemapXml += `    <loc>${domain}/play/${id}</loc>\n`;
    sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`;
    sitemapXml += '    <changefreq>weekly</changefreq>\n';
    sitemapXml += '    <priority>0.8</priority>\n';
    sitemapXml += '  </url>\n';
  });
  
  sitemapXml += '</urlset>\n';
  
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write sitemap
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  console.log('[Sitemap] Successfully wrote sitemap.xml to public/');
  
  // Write robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('[Sitemap] Successfully wrote robots.txt to public/');
  
} catch (error) {
  console.error('[Sitemap] Failed to generate sitemap:', error);
  process.exit(1);
}
