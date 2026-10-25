/**
 * ENTEGRE SHOP - Agency & E-Commerce Web Server
 * Zero-dependency, production-ready Node.js HTTP server
 * Supports Gzip, REST API for checkout/leads, Admin Dashboard, and Static Assets
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function initDataFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

initDataFile(ORDERS_FILE, [
  {
    id: 'ENT-ORD-849201',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      name: 'Merve Kaya',
      company: 'Kaya Moda Butik',
      phone: '0532 999 88 77',
      email: 'merve@kayamoda.com',
      taxId: '3849201948',
      address: 'Nişantaşı, İstanbul',
      notes: 'Instagram reklamları için acil CAPI kurulumu ve 3 aylık Meta danışmanlığı istiyoruz.'
    },
    items: [
      {
        id: 'ad-meta',
        title: 'Meta Ads (Instagram & Facebook) Danışmanlığı',
        category: 'Dijital Reklam',
        price: 31875,
        billingText: '3 Aylık Peşin (-%15 İndirimli)',
        qty: 1
      },
      {
        id: 'ecom-onepage',
        title: 'OnePage E-Ticaret Paketi (Tek Ürün / Viral Satış)',
        category: 'E-Ticaret',
        price: 14500,
        billingText: 'Tek Seferlik Kurulum',
        qty: 1
      }
    ],
    discountPercent: 10,
    total: 49545,
    status: 'İletişime Geçildi'
  }
]);

initDataFile(LEADS_FILE, [
  {
    id: 'ENT-LEAD-1029',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    name: 'Serkan Demir',
    company: 'Demir İklimlendirme & Havalandırma',
    phone: '0544 555 12 34',
    website: 'https://demirhavalandirma.com',
    budget: '30.000 - 75.000 TL',
    interest: 'Google Ads & Shopping',
    status: 'Analiz Gönderildi'
  }
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('File write error:', e);
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2 * 1024 * 1024) {
        // Limit to 2MB
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. HEALTH CHECK
  if (pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'healthy',
      service: 'Entegre Shop Agency Platform',
      version: '2.0.0',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 2. CHECKOUT API (CART ORDER SUBMISSION)
  if (pathname === '/api/cart/checkout' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const orders = readJsonFile(ORDERS_FILE);
      
      const orderId = 'ENT-ORD-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: data.customer || {},
        items: data.items || [],
        discountPercent: data.discountPercent || 0,
        total: data.total || 0,
        status: 'Yeni Sipariş'
      };

      orders.unshift(newOrder);
      writeJsonFile(ORDERS_FILE, orders);

      sendJson(res, 201, {
        success: true,
        orderId: orderId,
        message: 'Siparişiniz başarıyla alındı.'
      });
    } catch (err) {
      console.error('Checkout error:', err);
      sendJson(res, 400, { success: false, error: 'Geçersiz sipariş verisi.' });
    }
    return;
  }

  // 3. LEADS API (FREE ANALYSIS SUBMISSION)
  if (pathname === '/api/leads' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const leads = readJsonFile(LEADS_FILE);

      const leadId = 'ENT-LEAD-' + Math.floor(1000 + Math.random() * 9000);
      const newLead = {
        id: leadId,
        createdAt: new Date().toISOString(),
        name: data.name || '',
        company: data.company || '',
        phone: data.phone || '',
        website: data.website || '',
        budget: data.budget || '',
        interest: data.interest || '',
        status: 'İnceleniyor'
      };

      leads.unshift(newLead);
      writeJsonFile(LEADS_FILE, leads);

      sendJson(res, 201, {
        success: true,
        leadId: leadId,
        message: 'Analiz talebiniz başarıyla kaydedildi.'
      });
    } catch (err) {
      console.error('Lead error:', err);
      sendJson(res, 400, { success: false, error: 'Geçersiz talep verisi.' });
    }
    return;
  }

  // 4. ADMIN API: GET ORDERS
  if (pathname === '/api/admin/orders' && req.method === 'GET') {
    const orders = readJsonFile(ORDERS_FILE);
    sendJson(res, 200, { success: true, count: orders.length, orders });
    return;
  }

  // 5. ADMIN API: GET LEADS
  if (pathname === '/api/admin/leads' && req.method === 'GET') {
    const leads = readJsonFile(LEADS_FILE);
    sendJson(res, 200, { success: true, count: leads.length, leads });
    return;
  }

  // 6. ADMIN API: UPDATE ORDER / LEAD STATUS
  if (pathname === '/api/admin/status' && req.method === 'POST') {
    try {
      const { type, id, status } = await parseJsonBody(req);
      if (type === 'order') {
        const orders = readJsonFile(ORDERS_FILE);
        const item = orders.find(o => o.id === id);
        if (item) {
          item.status = status;
          writeJsonFile(ORDERS_FILE, orders);
          return sendJson(res, 200, { success: true, item });
        }
      } else if (type === 'lead') {
        const leads = readJsonFile(LEADS_FILE);
        const item = leads.find(l => l.id === id);
        if (item) {
          item.status = status;
          writeJsonFile(LEADS_FILE, leads);
          return sendJson(res, 200, { success: true, item });
        }
      }
      sendJson(res, 404, { success: false, error: 'Kayıt bulunamadı' });
    } catch (e) {
      sendJson(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 7. STATIC FILES & ROUTING
  let filePath = '';
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin.html') {
    filePath = path.join(PUBLIC_DIR, 'admin.html');
  } else {
    const cleanPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    filePath = path.join(PUBLIC_DIR, cleanPath);
  }

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Fallback to index.html for SPA-like experience or error page
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFallback, (fallbackErr, data) => {
        if (!fallbackErr) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Cache control: no-cache for html, css, js during development/updates; 1 day for media assets
    const isCodeFile = ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json';
    const cacheControl = isCodeFile 
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=86400';

    // Compression support
    if (/\b(gzip)\b/.test(acceptEncoding) && (ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json')) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        'Cache-Control': cacheControl,
        'Vary': 'Accept-Encoding'
      });
      const rawStream = fs.createReadStream(filePath);
      const gzip = zlib.createGzip();
      rawStream.pipe(gzip).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': cacheControl
      });
      const rawStream = fs.createReadStream(filePath);
      rawStream.pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 ENTEGRE SHOP Agency Platform Live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin`);
  console.log(`⚡ Medusa v2 Ready | Port: ${PORT}`);
  console.log(`===================================================`);
});
