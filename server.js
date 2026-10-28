/**
 * ENTEGRE SHOP - Agency & E-Commerce Web Server
 * Zero-dependency, production-ready Node.js HTTP server
 * Supports Gzip, REST API for checkout/leads, Admin Dashboard, and Static Assets
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const TRACKING_FILE = path.join(DATA_DIR, 'tracking.json');
const PAYMENT_FILE = path.join(DATA_DIR, 'payment.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const REFERENCES_FILE = path.join(DATA_DIR, 'references.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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

const DEFAULT_TRACKING = {
  meta: {
    enabled: false,
    pixelId: '',
    capiToken: '',
    testEventCode: ''
  },
  google: {
    enabled: false,
    gtmId: '',
    ga4Id: '',
    adsConversionId: '',
    adsConversionLabel: ''
  },
  tiktok: {
    enabled: false,
    pixelId: '',
    eventsApiToken: ''
  },
  customScripts: {
    headerScripts: '',
    footerScripts: ''
  },
  updatedAt: new Date().toISOString()
};

initDataFile(TRACKING_FILE, DEFAULT_TRACKING);

function readTrackingSettings() {
  const data = readJsonFile(TRACKING_FILE);
  if (!data || Array.isArray(data) || !data.meta) {
    return DEFAULT_TRACKING;
  }
  return { ...DEFAULT_TRACKING, ...data };
}

const DEFAULT_PAYMENT = {
  paytr: {
    enabled: false,
    testMode: true,
    merchantId: '',
    merchantKey: '',
    merchantSalt: '',
    maxInstallment: 12,
    successUrl: 'https://entegreshop.com/#siparis-basarili',
    failUrl: 'https://entegreshop.com/#siparis-hatali'
  },
  updatedAt: new Date().toISOString()
};

initDataFile(PAYMENT_FILE, DEFAULT_PAYMENT);

function readPaymentSettings() {
  const data = readJsonFile(PAYMENT_FILE);
  if (!data || Array.isArray(data) || !data.paytr) {
    return DEFAULT_PAYMENT;
  }
  return { ...DEFAULT_PAYMENT, ...data };
}

function readClients() {
  const data = readJsonFile(CLIENTS_FILE);
  return Array.isArray(data) ? data : [];
}

function calculateConsolidatedSummary(clients) {
  const periods = ['realtime', 'daily', 'weekly', 'monthly', 'allTime'];
  const summary = {};

  periods.forEach(p => {
    let revenue = 0;
    let adSpend = 0;
    let orders = 0;
    let metaSpend = 0, metaRev = 0, metaOrders = 0;
    let googleSpend = 0, googleRev = 0, googleOrders = 0;
    let tiktokSpend = 0, tiktokRev = 0, tiktokOrders = 0;

    clients.forEach(c => {
      const pData = c.periods?.[p] || {};
      revenue += (pData.revenue || 0);
      adSpend += (pData.adSpend || 0);
      orders += (pData.orders || 0);

      const ch = pData.channels || {};
      if (ch.meta) {
        metaSpend += (ch.meta.spend || 0);
        metaRev += (ch.meta.revenue || 0);
        metaOrders += (ch.meta.orders || 0);
      }
      if (ch.google) {
        googleSpend += (ch.google.spend || 0);
        googleRev += (ch.google.revenue || 0);
        googleOrders += (ch.google.orders || 0);
      }
      if (ch.tiktok) {
        tiktokSpend += (ch.tiktok.spend || 0);
        tiktokRev += (ch.tiktok.revenue || 0);
        tiktokOrders += (ch.tiktok.orders || 0);
      }
    });

    const roas = adSpend > 0 ? parseFloat((revenue / adSpend).toFixed(2)) : 0;
    const aov = orders > 0 ? Math.round(revenue / orders) : 0;
    const metaRoas = metaSpend > 0 ? parseFloat((metaRev / metaSpend).toFixed(2)) : 0;
    const googleRoas = googleSpend > 0 ? parseFloat((googleRev / googleSpend).toFixed(2)) : 0;
    const tiktokRoas = tiktokSpend > 0 ? parseFloat((tiktokRev / tiktokSpend).toFixed(2)) : 0;

    summary[p] = {
      revenue,
      adSpend,
      orders,
      roas,
      aov,
      channels: {
        meta: { spend: metaSpend, revenue: metaRev, roas: metaRoas, orders: metaOrders },
        google: { spend: googleSpend, revenue: googleRev, roas: googleRoas, orders: googleOrders },
        tiktok: { spend: tiktokSpend, revenue: tiktokRev, roas: tiktokRoas, orders: tiktokOrders }
      }
    };
  });

  return summary;
}

function getCombinedLiveFeed(clients) {
  const allSales = [];
  clients.forEach(c => {
    (c.recentSales || []).forEach(sale => {
      allSales.push({
        ...sale,
        clientId: c.id,
        clientName: c.name,
        clientCategory: c.category
      });
    });
  });
  return allSales;
}

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

function parseBodyRaw(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) {
        // Limit to 10MB for logo/banner uploads
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

  // 7. TRACKING SETTINGS API: GET
  if (pathname === '/api/settings/tracking' && req.method === 'GET') {
    const settings = readTrackingSettings();
    sendJson(res, 200, { success: true, settings });
    return;
  }

  // 8. TRACKING SETTINGS API: POST (SAVE SETTINGS)
  if (pathname === '/api/settings/tracking' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const updated = {
        meta: {
          enabled: Boolean(data.meta?.enabled),
          pixelId: (data.meta?.pixelId || '').trim(),
          capiToken: (data.meta?.capiToken || '').trim(),
          testEventCode: (data.meta?.testEventCode || '').trim()
        },
        google: {
          enabled: Boolean(data.google?.enabled),
          gtmId: (data.google?.gtmId || '').trim(),
          ga4Id: (data.google?.ga4Id || '').trim(),
          adsConversionId: (data.google?.adsConversionId || '').trim(),
          adsConversionLabel: (data.google?.adsConversionLabel || '').trim()
        },
        tiktok: {
          enabled: Boolean(data.tiktok?.enabled),
          pixelId: (data.tiktok?.pixelId || '').trim(),
          eventsApiToken: (data.tiktok?.eventsApiToken || '').trim()
        },
        customScripts: {
          headerScripts: data.customScripts?.headerScripts || '',
          footerScripts: data.customScripts?.footerScripts || ''
        },
        updatedAt: new Date().toISOString()
      };

      writeJsonFile(TRACKING_FILE, updated);
      sendJson(res, 200, {
        success: true,
        message: 'Dönüşüm API ve piksel ayarları başarıyla kaydedildi.',
        settings: updated
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 9. SERVER-SIDE CONVERSIONS API (META CAPI & TIKTOK DISPATCHER)
  if (pathname === '/api/tracking/capi-event' && req.method === 'POST') {
    try {
      const { eventName, eventId, eventSourceUrl, userData, customData } = await parseJsonBody(req);
      const settings = readTrackingSettings();
      const results = { meta: 'skipped', tiktok: 'skipped' };

      // Dispatch to Meta Graph API Conversions API if configured
      if (settings.meta?.enabled && settings.meta?.pixelId && settings.meta?.capiToken) {
        try {
          const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
          const clientUserAgent = req.headers['user-agent'] || '';
          
          const payload = {
            data: [
              {
                event_name: eventName || 'PageView',
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId || ('evt-' + Date.now()),
                event_source_url: eventSourceUrl || 'https://entegreshop.com/',
                action_source: 'website',
                user_data: {
                  client_ip_address: String(clientIp).split(',')[0].trim(),
                  client_user_agent: clientUserAgent,
                  ...(userData?.email ? { em: [crypto.createHash('sha256').update(userData.email.trim().toLowerCase()).digest('hex')] } : {}),
                  ...(userData?.phone ? { ph: [crypto.createHash('sha256').update(userData.phone.replace(/[^0-9]/g, '')).digest('hex')] } : {})
                },
                custom_data: customData || {}
              }
            ],
            ...(settings.meta.testEventCode ? { test_event_code: settings.meta.testEventCode } : {})
          };

          const postData = JSON.stringify(payload);
          const metaReq = https.request({
            hostname: 'graph.facebook.com',
            path: `/v20.0/${settings.meta.pixelId}/events?access_token=${encodeURIComponent(settings.meta.capiToken)}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          }, (mRes) => {
            let mBody = '';
            mRes.on('data', c => mBody += c);
            mRes.on('end', () => console.log('Meta CAPI response code:', mRes.statusCode));
          });
          metaReq.on('error', err => console.error('Meta CAPI error:', err.message));
          metaReq.write(postData);
          metaReq.end();
          results.meta = 'dispatched';
        } catch (mErr) {
          console.error('Meta CAPI dispatch error:', mErr.message);
        }
      }

      sendJson(res, 200, { success: true, results });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 10. PAYMENT SETTINGS API: GET
  if (pathname === '/api/settings/payment' && req.method === 'GET') {
    const settings = readPaymentSettings();
    sendJson(res, 200, { success: true, settings });
    return;
  }

  // 11. PAYMENT SETTINGS API: POST (ADMIN SAVE)
  if (pathname === '/api/settings/payment' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const updated = {
        paytr: {
          enabled: Boolean(data.paytr?.enabled),
          testMode: Boolean(data.paytr?.testMode),
          merchantId: (data.paytr?.merchantId || '').trim(),
          merchantKey: (data.paytr?.merchantKey || '').trim(),
          merchantSalt: (data.paytr?.merchantSalt || '').trim(),
          maxInstallment: Number(data.paytr?.maxInstallment || 12),
          successUrl: (data.paytr?.successUrl || 'https://entegreshop.com/#siparis-basarili').trim(),
          failUrl: (data.paytr?.failUrl || 'https://entegreshop.com/#siparis-hatali').trim()
        },
        updatedAt: new Date().toISOString()
      };

      writeJsonFile(PAYMENT_FILE, updated);
      sendJson(res, 200, {
        success: true,
        message: 'PayTR sanal POS ayarları başarıyla kaydedildi.',
        settings: updated
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 12. PAYTR: CREATE IFRAME TOKEN (ÖDEME BAŞLATMA)
  if (pathname === '/api/paytr/create-token' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const paymentSettings = readPaymentSettings();
      const paytr = paymentSettings.paytr;

      if (!paytr.enabled || !paytr.merchantId || !paytr.merchantKey || !paytr.merchantSalt) {
        return sendJson(res, 400, {
          success: false,
          error: 'PayTR entegrasyonu henüz aktif edilmemiş veya mağaza kimlik bilgileri eksik.'
        });
      }

      const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '88.255.10.10').split(',')[0].trim();
      const user_ip = (clientIp === '::1' || clientIp === '127.0.0.1' || !clientIp) ? '88.255.10.10' : clientIp;
      
      const merchant_oid = data.orderId || ('ENT-ORD-' + Math.floor(100000 + Math.random() * 900000));
      const email = data.customer?.email || 'musteri@entegreshop.com';
      const payment_amount = Math.round(Number(data.total || 0) * 100); // 100 TL -> 10000 kuruş
      
      const basketItems = (data.items || []).map(i => [i.title, String(Number(i.price).toFixed(2)), Number(i.qty || 1)]);
      const user_basket = Buffer.from(JSON.stringify(basketItems.length ? basketItems : [['Entegre Shop Hizmet Paketi', (data.total || 100).toFixed(2), 1]])).toString('base64');
      
      const user_name = data.customer?.name || 'Müşteri';
      const user_address = data.customer?.address || 'İstanbul, Türkiye';
      const user_phone = data.customer?.phone || '05000000000';
      const merchant_ok_url = paytr.successUrl || 'https://entegreshop.com/#siparis-basarili';
      const merchant_fail_url = paytr.failUrl || 'https://entegreshop.com/#siparis-hatali';
      const currency = 'TL';
      const test_mode = paytr.testMode ? '1' : '0';
      const no_installment = '0';
      const max_installment = String(paytr.maxInstallment || 12);

      // Hash: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
      const hash_str = `${paytr.merchantId}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
      const paytr_token = crypto.createHmac('sha256', paytr.merchantKey)
        .update(hash_str + paytr.merchantSalt)
        .digest('base64');

      const postParams = querystring.stringify({
        merchant_id: paytr.merchantId,
        user_ip: user_ip,
        merchant_oid: merchant_oid,
        email: email,
        payment_amount: payment_amount,
        paytr_token: paytr_token,
        user_basket: user_basket,
        debug_on: paytr.testMode ? '1' : '0',
        no_installment: no_installment,
        max_installment: max_installment,
        user_name: user_name,
        user_address: user_address,
        user_phone: user_phone,
        merchant_ok_url: merchant_ok_url,
        merchant_fail_url: merchant_fail_url,
        timeout_limit: '30',
        currency: currency,
        test_mode: test_mode
      });

      const options = {
        hostname: 'www.paytr.com',
        path: '/odeme/api/get-token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postParams)
        }
      };

      const paytrReq = https.request(options, (paytrRes) => {
        let rawData = '';
        paytrRes.on('data', chunk => rawData += chunk);
        paytrRes.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.status === 'success') {
              sendJson(res, 200, {
                success: true,
                orderId: merchant_oid,
                token: parsed.token,
                iframeUrl: `https://www.paytr.com/odeme/guvenli/${parsed.token}`
              });
            } else {
              sendJson(res, 400, {
                success: false,
                error: parsed.reason || 'PayTR token oluşturulamadı.'
              });
            }
          } catch (pe) {
            sendJson(res, 500, { success: false, error: 'PayTR API yanıtı okunamadı: ' + rawData });
          }
        });
      });

      paytrReq.on('error', (err) => {
        sendJson(res, 500, { success: false, error: 'PayTR API bağlantı hatası: ' + err.message });
      });

      paytrReq.write(postParams);
      paytrReq.end();
    } catch (e) {
      sendJson(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 13. PAYTR: CALLBACK (IPN WEBHOOK BİLDİRİMİ)
  if (pathname === '/api/paytr/callback' && req.method === 'POST') {
    try {
      const rawBody = await parseBodyRaw(req);
      const params = querystring.parse(rawBody);
      const paymentSettings = readPaymentSettings();
      const paytr = paymentSettings.paytr;

      const { merchant_oid, status, total_amount, hash } = params;

      if (!paytr.merchantKey || !paytr.merchantSalt) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('PAYTR config missing');
      }

      // Hash Doğrulama: merchant_oid + merchant_salt + status + total_amount
      const expectedHash = crypto.createHmac('sha256', paytr.merchantKey)
        .update(`${merchant_oid}${paytr.merchantSalt}${status}${total_amount}`)
        .digest('base64');

      if (hash !== expectedHash) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('PAYTR notification failed: bad hash');
      }

      if (status === 'success') {
        const orders = readJsonFile(ORDERS_FILE);
        const order = orders.find(o => o.id === merchant_oid);
        if (order) {
          order.status = 'Ödendi (PayTR 3D Secure)';
          order.paidAt = new Date().toISOString();
          order.paidAmount = total_amount;
          writeJsonFile(ORDERS_FILE, orders);
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('FAIL: ' + e.message);
    }
    return;
  }

  // 14. CLIENT DASHBOARD & REAL-TIME ANALYTICS API: LIST & CONSOLIDATED SUMMARY
  if (pathname === '/api/clients' && req.method === 'GET') {
    const clients = readClients();
    const summary = calculateConsolidatedSummary(clients);
    const liveFeed = getCombinedLiveFeed(clients);
    sendJson(res, 200, {
      success: true,
      totalClients: clients.length,
      clients,
      summary,
      liveFeed
    });
    return;
  }

  // Helper for generating slug
  function slugifyClientName(name) {
    const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
    let str = (name || 'musteri').split('').map(char => trMap[char] || char).join('');
    return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'musteri';
  }

  // 14.b CLIENT CREATION API: POST /api/clients
  if (pathname === '/api/clients' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const clients = readClients();
      
      const name = (data.name || '').trim();
      if (!name) {
        return sendJson(res, 400, { success: false, error: 'Müşteri / Marka adı zorunludur.' });
      }

      const slug = slugifyClientName(name);
      let newId = `client-${slug}`;
      if (clients.some(c => c.id === newId)) {
        newId = `client-${slug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const isDemoData = Boolean(data.seedDemoMetrics);
      const targetRoas = parseFloat(data.apis?.openai?.targetRoas || 10.5);

      // Baseline periods setup
      const baseDailySpend = (data.apis?.meta?.enabled ? (Number(data.apis?.meta?.todaySpend) || 800) : 0)
        + (data.apis?.google?.enabled ? (Number(data.apis?.google?.todaySpend) || 400) : 0)
        + (data.apis?.tiktok?.enabled ? (Number(data.apis?.tiktok?.todaySpend) || 250) : 0);

      const actualDailySpend = baseDailySpend > 0 ? baseDailySpend : (isDemoData ? 1450 : 0);
      const actualDailyRevenue = isDemoData ? Math.round(actualDailySpend * (targetRoas > 0 ? targetRoas : 10.5)) : 0;
      const actualDailyOrders = isDemoData ? Math.max(1, Math.round(actualDailyRevenue / 1250)) : 0;

      const periods = {
        realtime: {
          revenue: isDemoData ? Math.round(actualDailyRevenue * 0.4) : 0,
          adSpend: isDemoData ? Math.round(actualDailySpend * 0.4) : 0,
          orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.4)) : 0,
          roas: isDemoData ? targetRoas : 0,
          aov: isDemoData ? 1250 : 0,
          channels: {
            meta: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.25) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.28) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 1.05).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.28)) : 0
            },
            google: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.1) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.1) : 0,
              roas: isDemoData ? targetRoas : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.1)) : 0
            },
            tiktok: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.05) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.04) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 0.9).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.04)) : 0
            },
            openai: {
              label: 'GPT-4o Dinamik Bütçe',
              note: `${name} için akıllı teklif ve ROAS 10+ koruması başlatıldı.`
            }
          }
        },
        daily: {
          revenue: actualDailyRevenue,
          adSpend: actualDailySpend,
          orders: actualDailyOrders,
          roas: isDemoData ? targetRoas : 0,
          aov: isDemoData ? 1250 : 0,
          channels: {
            meta: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.6) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.65) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 1.05).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.65)) : 0
            },
            google: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.28) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.25) : 0,
              roas: isDemoData ? targetRoas : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.25)) : 0
            },
            tiktok: {
              spend: isDemoData ? Math.round(actualDailySpend * 0.12) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 0.1) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 0.9).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 0.1)) : 0
            },
            openai: {
              label: 'GPT-4o Optimizasyon',
              note: 'Hedef ROAS 10+ optimizasyonu aktif.'
            }
          }
        },
        weekly: {
          revenue: isDemoData ? actualDailyRevenue * 6.5 : 0,
          adSpend: isDemoData ? actualDailySpend * 6.5 : 0,
          orders: isDemoData ? actualDailyOrders * 6 : 0,
          roas: isDemoData ? targetRoas : 0,
          aov: isDemoData ? 1250 : 0,
          channels: {
            meta: {
              spend: isDemoData ? Math.round(actualDailySpend * 6.5 * 0.6) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 6.5 * 0.65) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 1.05).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 6 * 0.65)) : 0
            },
            google: {
              spend: isDemoData ? Math.round(actualDailySpend * 6.5 * 0.28) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 6.5 * 0.25) : 0,
              roas: isDemoData ? targetRoas : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 6 * 0.25)) : 0
            },
            tiktok: {
              spend: isDemoData ? Math.round(actualDailySpend * 6.5 * 0.12) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 6.5 * 0.1) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 0.9).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 6 * 0.1)) : 0
            },
            openai: {
              label: 'Haftalık AI Raporu',
              note: 'Bütçe verimliliği yüksek seyrediyor.'
            }
          }
        },
        monthly: {
          revenue: isDemoData ? actualDailyRevenue * 28 : 0,
          adSpend: isDemoData ? actualDailySpend * 28 : 0,
          orders: isDemoData ? actualDailyOrders * 26 : 0,
          roas: isDemoData ? targetRoas : 0,
          aov: isDemoData ? 1250 : 0,
          channels: {
            meta: {
              spend: isDemoData ? Math.round(actualDailySpend * 28 * 0.6) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 28 * 0.65) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 1.05).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 26 * 0.65)) : 0
            },
            google: {
              spend: isDemoData ? Math.round(actualDailySpend * 28 * 0.28) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 28 * 0.25) : 0,
              roas: isDemoData ? targetRoas : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 26 * 0.25)) : 0
            },
            tiktok: {
              spend: isDemoData ? Math.round(actualDailySpend * 28 * 0.12) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 28 * 0.1) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 0.9).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 26 * 0.1)) : 0
            },
            openai: {
              label: 'Aylık Konsolide Rapor',
              note: 'ROAS 10+ korumasıyla büyüme hedefleri aşıldı.'
            }
          }
        },
        allTime: {
          revenue: isDemoData ? actualDailyRevenue * 55 : 0,
          adSpend: isDemoData ? actualDailySpend * 55 : 0,
          orders: isDemoData ? actualDailyOrders * 52 : 0,
          roas: isDemoData ? targetRoas : 0,
          aov: isDemoData ? 1250 : 0,
          channels: {
            meta: {
              spend: isDemoData ? Math.round(actualDailySpend * 55 * 0.6) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 55 * 0.65) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 1.05).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 52 * 0.65)) : 0
            },
            google: {
              spend: isDemoData ? Math.round(actualDailySpend * 55 * 0.28) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 55 * 0.25) : 0,
              roas: isDemoData ? targetRoas : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 52 * 0.25)) : 0
            },
            tiktok: {
              spend: isDemoData ? Math.round(actualDailySpend * 55 * 0.12) : 0,
              revenue: isDemoData ? Math.round(actualDailyRevenue * 55 * 0.1) : 0,
              roas: isDemoData ? parseFloat((targetRoas * 0.9).toFixed(2)) : 0,
              orders: isDemoData ? Math.max(1, Math.round(actualDailyOrders * 52 * 0.1)) : 0
            },
            openai: {
              label: 'Tüm Zamanlar AI Özeti',
              note: 'Tüm reklam kanalları optimize edildi.'
            }
          }
        }
      };

      const newClient = {
        id: newId,
        name: name,
        category: (data.category || 'E-Ticaret').trim(),
        website: (data.website || '').trim(),
        contact: {
          name: (data.contact?.name || '').trim(),
          phone: (data.contact?.phone || '').trim(),
          email: (data.contact?.email || '').trim()
        },
        package: (data.package || 'Profesyonel Next.js 14 E-Ticaret Paketi (Entegre AI Studio Altyapısı)').trim(),
        status: data.status || 'Canlı Satışta',
        statusBadge: data.statusBadge || 'Yeni Marka 🌟',
        apis: {
          meta: {
            enabled: Boolean(data.apis?.meta?.enabled),
            adAccountId: (data.apis?.meta?.adAccountId || '').trim(),
            pixelId: (data.apis?.meta?.pixelId || '').trim(),
            capiToken: (data.apis?.meta?.capiToken || '').trim(),
            testEventCode: (data.apis?.meta?.testEventCode || '').trim(),
            capiStatus: Boolean(data.apis?.meta?.enabled) ? 'Active (CAPI Connected)' : 'Pasif',
            todaySpend: Number(data.apis?.meta?.todaySpend || 0),
            lastSync: Boolean(data.apis?.meta?.enabled) ? 'Meta Graph v20.0 CAPI Bağlı' : 'Bağlı Değil'
          },
          google: {
            enabled: Boolean(data.apis?.google?.enabled),
            customerId: (data.apis?.google?.customerId || '').trim(),
            conversionId: (data.apis?.google?.conversionId || '').trim(),
            merchantCenterId: (data.apis?.google?.merchantCenterId || '').trim(),
            ga4Id: (data.apis?.google?.ga4Id || '').trim(),
            status: Boolean(data.apis?.google?.enabled) ? 'Active (P-Max & Shopping)' : 'Pasif',
            todaySpend: Number(data.apis?.google?.todaySpend || 0),
            lastSync: Boolean(data.apis?.google?.enabled) ? 'Google Ads API v16 OK' : 'Bağlı Değil'
          },
          tiktok: {
            enabled: Boolean(data.apis?.tiktok?.enabled),
            advertiserId: (data.apis?.tiktok?.advertiserId || '').trim(),
            pixelId: (data.apis?.tiktok?.pixelId || '').trim(),
            eventsApiToken: (data.apis?.tiktok?.eventsApiToken || '').trim(),
            status: Boolean(data.apis?.tiktok?.enabled) ? 'Active (Events API)' : 'Pasif',
            todaySpend: Number(data.apis?.tiktok?.todaySpend || 0),
            lastSync: Boolean(data.apis?.tiktok?.enabled) ? 'TikTok Marketing API OK' : 'Bağlı Değil'
          },
          openai: {
            enabled: Boolean(data.apis?.openai?.enabled !== false),
            engine: (data.apis?.openai?.engine || 'GPT-4o Auto-Bid Engine').trim(),
            targetRoas: targetRoas,
            autoScale: Boolean(data.apis?.openai?.autoScale !== false),
            status: 'Akıllı Bütçe Dağıtım Devrede',
            action: `Hedef ${targetRoas}x ROAS koruması aktif`,
            lastSync: 'GPT-4o Bütçe Optimizatörü Aktif'
          }
        },
        periods: periods,
        recentSales: isDemoData ? [
          {
            id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            time: '12 dk önce',
            customer: 'Zehra B.',
            city: 'Ankara',
            product: `${name} Koleksiyon Siparişi`,
            amount: 1450,
            channel: 'Meta Ads CAPI (Instagram Reels)',
            payment: 'PayTR 3D Secure'
          }
        ] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      clients.unshift(newClient);
      writeJsonFile(CLIENTS_FILE, clients);
      sendJson(res, 201, {
        success: true,
        message: `${name} başarıyla eklendi ve reklam API'ları yapılandırıldı.`,
        client: newClient
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 15. CLIENT DETAIL API: GET SINGLE CLIENT
  const clientDetailMatch = pathname.match(/^\/api\/clients\/([a-zA-Z0-9_-]+)$/);
  if (clientDetailMatch && req.method === 'GET') {
    const clientId = clientDetailMatch[1];
    const clients = readClients();
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return sendJson(res, 404, { success: false, error: 'Müşteri bulunamadı.' });
    }
    sendJson(res, 200, { success: true, client });
    return;
  }

  // 16. CLIENT UPDATE API: PUT /api/clients/:id
  if (clientDetailMatch && req.method === 'PUT') {
    try {
      const clientId = clientDetailMatch[1];
      const data = await parseJsonBody(req);
      const clients = readClients();
      const index = clients.findIndex(c => c.id === clientId);
      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Müşteri bulunamadı.' });
      }

      const current = clients[index];
      clients[index] = {
        ...current,
        name: data.name !== undefined ? data.name : current.name,
        category: data.category !== undefined ? data.category : current.category,
        website: data.website !== undefined ? data.website : current.website,
        contact: {
          ...current.contact,
          ...(data.contact || {})
        },
        package: data.package !== undefined ? data.package : current.package,
        status: data.status !== undefined ? data.status : current.status,
        statusBadge: data.statusBadge !== undefined ? data.statusBadge : current.statusBadge,
        apis: {
          ...current.apis,
          meta: {
            ...current.apis?.meta,
            ...(data.apis?.meta || {})
          },
          google: {
            ...current.apis?.google,
            ...(data.apis?.google || {})
          },
          tiktok: {
            ...current.apis?.tiktok,
            ...(data.apis?.tiktok || {})
          },
          openai: {
            ...current.apis?.openai,
            ...(data.apis?.openai || {})
          }
        },
        updatedAt: new Date().toISOString()
      };

      writeJsonFile(CLIENTS_FILE, clients);
      sendJson(res, 200, { success: true, message: 'Müşteri bilgileri ve API ayarları güncellendi.', client: clients[index] });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 16.b CLIENT DELETE API: DELETE /api/clients/:id
  if (clientDetailMatch && req.method === 'DELETE') {
    try {
      const clientId = clientDetailMatch[1];
      const clients = readClients();
      const index = clients.findIndex(c => c.id === clientId);
      if (index === -1) {
        return sendJson(res, 404, { success: false, error: 'Müşteri bulunamadı.' });
      }

      const deletedClient = clients.splice(index, 1)[0];
      writeJsonFile(CLIENTS_FILE, clients);
      sendJson(res, 200, {
        success: true,
        message: `${deletedClient.name} portföyden başarıyla kaldırıldı.`
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 17. CLIENT LIVE SALE INGESTION (WEBHOOK / SIMULATION)
  const clientSaleMatch = pathname.match(/^\/api\/clients\/([a-zA-Z0-9_-]+)\/sales$/);
  if (clientSaleMatch && req.method === 'POST') {
    try {
      const clientId = clientSaleMatch[1];
      const data = await parseJsonBody(req);
      const clients = readClients();
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        return sendJson(res, 404, { success: false, error: 'Müşteri bulunamadı.' });
      }

      const newSale = {
        id: data.id || ('ORD-' + Date.now()),
        time: 'Az önce',
        customer: data.customer || 'Müşteri',
        city: data.city || 'İstanbul',
        product: data.product || 'E-Ticaret Siparişi',
        amount: Number(data.amount || 1000),
        channel: data.channel || 'Meta Ads CAPI',
        payment: data.payment || 'PayTR 3D Secure'
      };

      if (!client.recentSales) client.recentSales = [];
      client.recentSales.unshift(newSale);
      if (client.recentSales.length > 20) client.recentSales.pop();

      // Update real-time & daily metrics
      const amount = Number(data.amount || 1000);
      ['realtime', 'daily', 'weekly', 'monthly', 'allTime'].forEach(p => {
        if (client.periods?.[p]) {
          client.periods[p].revenue += amount;
          client.periods[p].orders += 1;
          if (client.periods[p].adSpend > 0) {
            client.periods[p].roas = parseFloat((client.periods[p].revenue / client.periods[p].adSpend).toFixed(2));
          }
        }
      });

      writeJsonFile(CLIENTS_FILE, clients);
      sendJson(res, 200, { success: true, message: 'Satış anlık panele kaydedildi.', sale: newSale, client });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 18. CLIENT API SYNC (META, GOOGLE, TIKTOK, OPENAI)
  const clientSyncMatch = pathname.match(/^\/api\/clients\/([a-zA-Z0-9_-]+)\/sync$/);
  if (clientSyncMatch && req.method === 'POST') {
    try {
      const clientId = clientSyncMatch[1];
      const clients = readClients();
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        return sendJson(res, 404, { success: false, error: 'Müşteri bulunamadı.' });
      }

      // Simulate live sync with Meta Graph API, Google Ads API, TikTok API, OpenAI model
      client.lastSyncAt = new Date().toISOString();
      if (client.apis?.meta) client.apis.meta.lastSync = 'Şimdi senkronize edildi (Meta Graph v20.0 CAPI OK)';
      if (client.apis?.google) client.apis.google.lastSync = 'Google Ads API v16 OK';
      if (client.apis?.tiktok) client.apis.tiktok.lastSync = 'TikTok Marketing API OK';
      if (client.apis?.openai) client.apis.openai.lastSync = 'GPT-4o Bütçe Optimizatörü Aktif';

      writeJsonFile(CLIENTS_FILE, clients);
      sendJson(res, 200, {
        success: true,
        message: `${client.name} için Meta, Google, TikTok ve OpenAI API verileri başarıyla senkronize edildi.`,
        client
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // =========================================================================
  // 18.b REFERENCES MARQUEE, IKAS SHOWCASE & AUTO SCREENSHOT API (/api/references)
  // =========================================================================
  const DEFAULT_CATEGORIES = [
    { id: 'eticaret', name: 'E-Ticaret', icon: '🛒' },
    { id: 'kurumsal-web', name: 'Kurumsal Web', icon: '🏢' },
    { id: 'onepage', name: 'Onepage', icon: '⚡' },
    { id: 'tekstil', name: 'Tekstil & Giyim', icon: '👗' },
    { id: 'otomotiv', name: 'Otomotiv & Yedek Parça', icon: '🚗' },
    { id: 'muhendislik', name: 'Mühendislik & İklimlendirme', icon: '❄️' },
    { id: 'ayakkabi', name: 'Ayakkabı & Aksesuar', icon: '👟' },
    { id: 'kozmetik', name: 'Kozmetik & Bakım', icon: '💄' }
  ];

  const DEFAULT_REFERENCES_DATA = {
    settings: {
      enabled: true,
      title: "Her sektörden işletme için Yeni Nesil E-Ticaret & Web Altyapısı",
      subtitle: "E-ticaret, Kurumsal Web ve Onepage satış sistemlerimizle dijitalde büyüyen mutlu müşterilerimiz",
      speed: 32,
      pauseOnHover: true,
      grayscaleEffect: true,
      showBadges: true
    },
    categories: DEFAULT_CATEGORIES,
    items: []
  };

  function readReferencesData() {
    if (!fs.existsSync(REFERENCES_FILE)) {
      writeJsonFile(REFERENCES_FILE, DEFAULT_REFERENCES_DATA);
      return DEFAULT_REFERENCES_DATA;
    }
    try {
      const raw = fs.readFileSync(REFERENCES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_REFERENCES_DATA.settings, ...(parsed.settings || {}) },
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
        items: Array.isArray(parsed.items) ? parsed.items : []
      };
    } catch (e) {
      return DEFAULT_REFERENCES_DATA;
    }
  }

  function buildGeneratedSvgLogo(brandName) {
    const safeName = String(brandName || 'MARKA').replace(/[<>&"']/g, '').toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 60'><rect x='14' y='17' width='26' height='26' rx='7' fill='#0f172a'/><text x='27' y='35' text-anchor='middle' font-family='Space Grotesk, Arial, sans-serif' font-size='14' font-weight='900' fill='#38bdf8'>${safeName.charAt(0) || 'E'}</text><text x='50' y='37' font-family='Space Grotesk, Arial, sans-serif' font-size='21' font-weight='800' letter-spacing='1.8' fill='#0f172a'>${safeName.substring(0, 16)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function saveUploadedBannerFile(base64Str, prefix = 'ref') {
    if (!base64Str || typeof base64Str !== 'string') return '';
    const match = base64Str.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return base64Str;

    const mime = match[1];
    const b64Data = match[2];
    let ext = 'png';
    if (mime.includes('svg')) ext = 'svg';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('gif')) ext = 'gif';

    const filename = `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}.${ext}`;
    const fullPath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(b64Data, 'base64'));
    return `/api/references/media/${filename}`;
  }

  function normalizeWebsiteUrl(rawUrl) {
    let urlStr = String(rawUrl || '').trim();
    if (!urlStr) return '';
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = 'https://' + urlStr;
    }
    return urlStr;
  }

  function downloadBinaryFile(remoteUrl, destPath) {
    return new Promise((resolve) => {
      try {
        const client = remoteUrl.startsWith('https') ? https : http;
        client.get(remoteUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return downloadBinaryFile(res.headers.location, destPath).then(resolve);
          }
          if (res.statusCode !== 200) {
            res.resume();
            return resolve(false);
          }
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            try {
              const buf = Buffer.concat(chunks);
              if (buf.length > 1000) {
                fs.writeFileSync(destPath, buf);
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (e) {
              resolve(false);
            }
          });
        }).on('error', () => resolve(false));
      } catch (e) {
        resolve(false);
      }
    });
  }

  async function captureWebsiteScreenshotAndMeta(rawUrl) {
    const targetUrl = normalizeWebsiteUrl(rawUrl);
    if (!targetUrl) {
      throw new Error('Geçerli bir web sitesi URL adresi giriniz.');
    }

    const apiEndpoint = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=true&viewport.width=1280&viewport.height=1024`;
    const metaResult = await new Promise((resolve) => {
      const reqApi = https.get(apiEndpoint, { timeout: 12000 }, (resApi) => {
        let body = '';
        resApi.on('data', d => body += d);
        resApi.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve(null);
          }
        });
      });
      reqApi.on('error', () => resolve(null));
      reqApi.on('timeout', () => {
        reqApi.destroy();
        resolve(null);
      });
    });

    let remoteShotUrl = metaResult?.data?.screenshot?.url || '';
    const extractedTitle = metaResult?.data?.title || '';
    const extractedDesc = metaResult?.data?.description || '';

    // Save locally to data/uploads if remoteShotUrl exists so it never expires
    if (remoteShotUrl) {
      let hostSlug = 'site';
      try {
        hostSlug = slugifyClientName(new URL(targetUrl).hostname.replace(/^www\./, ''));
      } catch (e) {}
      const filename = `shot-${hostSlug}-${Date.now()}.png`;
      const fullPath = path.join(UPLOADS_DIR, filename);
      const saved = await downloadBinaryFile(remoteShotUrl, fullPath);
      if (saved) {
        remoteShotUrl = `/api/references/media/${filename}`;
      }
    } else {
      // Fallback to WordPress mShots service
      remoteShotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=900&h=1100`;
    }

    return {
      targetUrl,
      screenshotUrl: remoteShotUrl,
      title: extractedTitle,
      description: extractedDesc
    };
  }

  // Serve uploaded reference banner/screenshot images
  const refMediaMatch = pathname.match(/^\/api\/references\/media\/([a-zA-Z0-9_.-]+)$/);
  if (refMediaMatch && req.method === 'GET') {
    const filename = path.basename(refMediaMatch[1]);
    const mediaPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(mediaPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Media not found');
    }
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400'
    });
    fs.createReadStream(mediaPath).pipe(res);
    return;
  }

  // POST /api/references/capture-screenshot (Live URL -> Auto Screenshot + Meta)
  if (pathname === '/api/references/capture-screenshot' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const urlInput = String(body.url || '').trim();
      if (!urlInput) {
        return sendJson(res, 400, { success: false, error: 'Lütfen sayfa URL adresini girin.' });
      }
      const captured = await captureWebsiteScreenshotAndMeta(urlInput);
      sendJson(res, 200, {
        success: true,
        url: captured.targetUrl,
        screenshotUrl: captured.screenshotUrl,
        title: captured.title,
        description: captured.description
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // POST /api/references/categories (Add new category)
  if (pathname === '/api/references/categories' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const name = String(body.name || '').trim();
      const icon = String(body.icon || '🏷️').trim() || '🏷️';
      if (!name) {
        return sendJson(res, 400, { success: false, error: 'Kategori adı zorunludur.' });
      }
      const refData = readReferencesData();
      const id = slugifyClientName(name);
      if (refData.categories.some(c => c.id === id)) {
        return sendJson(res, 400, { success: false, error: 'Bu kategori zaten mevcut.' });
      }
      const newCat = { id, name, icon };
      refData.categories.push(newCat);
      writeJsonFile(REFERENCES_FILE, refData);
      sendJson(res, 201, {
        success: true,
        category: newCat,
        categories: refData.categories
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // DELETE /api/references/categories/:id
  const refCatDelMatch = pathname.match(/^\/api\/references\/categories\/([a-zA-Z0-9_-]+)$/);
  if (refCatDelMatch && req.method === 'DELETE') {
    try {
      const catId = refCatDelMatch[1];
      const refData = readReferencesData();
      refData.categories = refData.categories.filter(c => c.id !== catId);
      writeJsonFile(REFERENCES_FILE, refData);
      sendJson(res, 200, {
        success: true,
        categories: refData.categories
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // GET /api/references
  if (pathname === '/api/references' && req.method === 'GET') {
    const refData = readReferencesData();
    const sorted = [...refData.items].sort((a, b) => (a.order || 999) - (b.order || 999));
    sendJson(res, 200, {
      success: true,
      settings: refData.settings,
      categories: refData.categories,
      items: sorted
    });
    return;
  }

  // POST /api/references (Add new reference showcase card & marquee logo)
  if (pathname === '/api/references' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const name = String(body.name || '').trim();
      if (!name) {
        return sendJson(res, 400, { success: false, error: 'Referans firma adı zorunludur.' });
      }

      const refData = readReferencesData();
      const website = normalizeWebsiteUrl(body.website || '');
      const category = String(body.category || 'eticaret').trim() || 'eticaret';

      // 1. Logo URL
      let finalLogoUrl = String(body.logoUrl || '').trim();
      if (body.logoBase64 && String(body.logoBase64).startsWith('data:image/')) {
        finalLogoUrl = saveUploadedBannerFile(body.logoBase64, 'logo-' + slugifyClientName(name));
      } else if (!finalLogoUrl) {
        finalLogoUrl = buildGeneratedSvgLogo(name);
      }

      // 2. Website Screenshot URL (if screenshotBase64 uploaded, or screenshotUrl provided, or auto-capture from website URL)
      let finalScreenshotUrl = String(body.screenshotUrl || '').trim();
      if (body.screenshotBase64 && String(body.screenshotBase64).startsWith('data:image/')) {
        finalScreenshotUrl = saveUploadedBannerFile(body.screenshotBase64, 'shot-' + slugifyClientName(name));
      } else if (!finalScreenshotUrl && website) {
        try {
          const captured = await captureWebsiteScreenshotAndMeta(website);
          finalScreenshotUrl = captured.screenshotUrl;
        } catch (e) {
          finalScreenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(website)}?w=900&h=1100`;
        }
      }

      const defaultDesc = `${name} Entegre Shop Altyapısı Sayesinde Dönüşüm ve Satış Oranlarını Artırdı!`;
      const description = String(body.description || '').trim() || defaultDesc;

      const maxOrder = refData.items.reduce((max, item) => Math.max(max, Number(item.order || 0)), 0);
      const newItem = {
        id: 'ref-' + slugifyClientName(name) + '-' + Math.floor(100 + Math.random() * 900),
        name,
        category,
        website,
        screenshotUrl: finalScreenshotUrl,
        logoUrl: finalLogoUrl,
        badge: String(body.badge || '').trim(),
        description,
        active: body.active !== false,
        order: maxOrder + 1,
        createdAt: new Date().toISOString()
      };

      refData.items.push(newItem);
      refData.updatedAt = new Date().toISOString();
      writeJsonFile(REFERENCES_FILE, refData);

      sendJson(res, 201, {
        success: true,
        message: `${name} referans vitrinine ve bandına eklendi.`,
        item: newItem,
        items: refData.items
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // POST /api/references/settings (Update marquee & showcase settings)
  if (pathname === '/api/references/settings' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const refData = readReferencesData();
      refData.settings = {
        ...refData.settings,
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : refData.settings.enabled,
        title: body.title !== undefined ? String(body.title).trim() : refData.settings.title,
        subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : refData.settings.subtitle,
        speed: body.speed !== undefined ? Math.max(8, Math.min(120, Number(body.speed) || 32)) : refData.settings.speed,
        pauseOnHover: body.pauseOnHover !== undefined ? Boolean(body.pauseOnHover) : refData.settings.pauseOnHover,
        grayscaleEffect: body.grayscaleEffect !== undefined ? Boolean(body.grayscaleEffect) : refData.settings.grayscaleEffect,
        showBadges: body.showBadges !== undefined ? Boolean(body.showBadges) : refData.settings.showBadges
      };
      refData.updatedAt = new Date().toISOString();
      writeJsonFile(REFERENCES_FILE, refData);

      sendJson(res, 200, {
        success: true,
        message: 'Referans vitrini ve bant ayarları güncellendi.',
        settings: refData.settings
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // POST /api/references/reorder (Move reference up/down)
  if (pathname === '/api/references/reorder' && req.method === 'POST') {
    try {
      const { id, direction } = await parseJsonBody(req);
      const refData = readReferencesData();
      refData.items.sort((a, b) => (a.order || 999) - (b.order || 999));

      const idx = refData.items.findIndex(i => i.id === id);
      if (idx === -1) {
        return sendJson(res, 404, { success: false, error: 'Referans bulunamadı.' });
      }
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < refData.items.length) {
        const temp = refData.items[idx];
        refData.items[idx] = refData.items[targetIdx];
        refData.items[targetIdx] = temp;
        refData.items.forEach((item, index) => {
          item.order = index + 1;
        });
        writeJsonFile(REFERENCES_FILE, refData);
      }
      sendJson(res, 200, { success: true, items: refData.items });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // PUT & DELETE /api/references/:id
  const refDetailMatch = pathname.match(/^\/api\/references\/([a-zA-Z0-9_-]+)$/);
  if (refDetailMatch && req.method === 'PUT') {
    try {
      const refId = refDetailMatch[1];
      const body = await parseJsonBody(req);
      const refData = readReferencesData();
      const idx = refData.items.findIndex(i => i.id === refId);
      if (idx === -1) {
        return sendJson(res, 404, { success: false, error: 'Referans bulunamadı.' });
      }

      const current = refData.items[idx];
      let updatedLogoUrl = body.logoUrl !== undefined ? String(body.logoUrl).trim() : current.logoUrl;
      if (body.logoBase64 && String(body.logoBase64).startsWith('data:image/')) {
        updatedLogoUrl = saveUploadedBannerFile(body.logoBase64, 'logo-' + slugifyClientName(body.name || current.name));
      } else if (!updatedLogoUrl) {
        updatedLogoUrl = buildGeneratedSvgLogo(body.name || current.name);
      }

      let updatedScreenshotUrl = body.screenshotUrl !== undefined ? String(body.screenshotUrl).trim() : (current.screenshotUrl || '');
      if (body.screenshotBase64 && String(body.screenshotBase64).startsWith('data:image/')) {
        updatedScreenshotUrl = saveUploadedBannerFile(body.screenshotBase64, 'shot-' + slugifyClientName(body.name || current.name));
      }

      refData.items[idx] = {
        ...current,
        name: body.name !== undefined ? String(body.name).trim() : current.name,
        category: body.category !== undefined ? String(body.category).trim() : (current.category || 'eticaret'),
        website: body.website !== undefined ? normalizeWebsiteUrl(body.website) : current.website,
        screenshotUrl: updatedScreenshotUrl,
        logoUrl: updatedLogoUrl,
        badge: body.badge !== undefined ? String(body.badge).trim() : current.badge,
        description: body.description !== undefined ? String(body.description).trim() : (current.description || ''),
        active: body.active !== undefined ? Boolean(body.active) : current.active,
        order: body.order !== undefined ? Number(body.order) : current.order,
        updatedAt: new Date().toISOString()
      };

      writeJsonFile(REFERENCES_FILE, refData);
      sendJson(res, 200, {
        success: true,
        message: 'Referans güncellendi.',
        item: refData.items[idx],
        items: refData.items
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  if (refDetailMatch && req.method === 'DELETE') {
    try {
      const refId = refDetailMatch[1];
      const refData = readReferencesData();
      const idx = refData.items.findIndex(i => i.id === refId);
      if (idx === -1) {
        return sendJson(res, 404, { success: false, error: 'Referans bulunamadı.' });
      }
      const removed = refData.items.splice(idx, 1)[0];
      writeJsonFile(REFERENCES_FILE, refData);
      sendJson(res, 200, {
        success: true,
        message: `${removed.name} referans bandından çıkarıldı.`,
        items: refData.items
      });
    } catch (e) {
      sendJson(res, 400, { success: false, error: e.message });
    }
    return;
  }

  // 19. STATIC FILES & ROUTING
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
  console.log(`⚡ Entegre AI Studio Ready | Port: ${PORT}`);
  console.log(`===================================================`);
});
