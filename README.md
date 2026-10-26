# Entegre Shop | Yazılım & Dijital Reklam Ajansı

Entegre Shop için geliştirilmiş modern, dönüşüm odaklı (conversion-focused) ve **Entegre AI Studio** altyapısıyla tam uyumlu web platformu.

---

## 🚀 Proje Bölümleri ve Özellikleri

1. **Hero Bölümü:**
   - **Başlık:** *"Dijitalde Büyümenizi Hızlandırın: Yazılım, E-Ticaret ve Reklam Çözümleri"*
   - **Alt Başlık:** Meta, Google Ads, TikTok, OpenAI reklam yönetimi ve anahtar teslim e-ticaret/kurumsal web paketleri.
   - **KPI Rozetleri:** 10+ ROAS, < 0.8s Hız Skoru, %100 Entegre AI Studio Desteği.
   - **Görseller:** 3D cam panel reklam ve analitik hub illüstrasyonu (`/assets/images/hero-growth.jpg`).

2. **Dijital Reklam Danışmanlığı Paketleri:**
   - **Meta Ads Danışmanlığı:** CAPI (Server-Side), Dinamik Katalog ve Advantage+ (12.500 ₺/Ay).
   - **Google Ads Danışmanlığı:** Performance Max, Shopping Feed ve GA4 (12.500 ₺/Ay).
   - **TikTok Ads Danışmanlığı:** Viral Spark Ads ve Events API (10.000 ₺/Ay).
   - **OpenAI Destekli Çok Kanallı Reklam (Full-Stack):** GPT-4o metin robotu & akıllı bütçe masası (24.500 ₺/Ay).
   - **Dinamik Fiyatlandırma Anahtarı:** *Aylık Düzenli* vs *3 Aylık Peşin (-%15 İndirimli)*.

3. **Kurumsal Web Sayfası Paketi:**
   - OnePage modern kurumsal web sitesi çözümü.
   - 72 saatte hızlı teslim, %100 mobil uyum, < 0.8s sayfa açılış hızı, WhatsApp & form motoru, 1 yıl bulut hosting ve SSL dahil (8.500 ₺ Tek Seferlik).

4. **E-Ticaret Paketleri (Entegre AI Studio Uyumlu):**
   - **OnePage E-Ticaret Paketi:** Tek ürün / viral satış hunisi, express checkout, iyzico/PayTR (14.500 ₺).
   - **Standart E-Ticaret Paketi:** 1.000 ürün varyantı, Entegre AI Studio çekirdek, kargo takip (24.500 ₺).
   - **Profesyonel E-Ticaret Paketi:** Next.js 14 Storefront, terk edilmiş sepet kurtarma, CAPI & DataLayer (38.500 ₺).
   - **Premium E-Ticaret Paketi (🌟 EN POPÜLER / ÖNERİLEN):** Global çoklu para birimi/dil, B2B bayi iskontosu, OpenAI ürün öneri motoru, 7/24 VIP destek (58.500 ₺).

5. **Dönüşüm Araçları & İnteraktif Altyapı:**
   - **Canlı Hizmet Sepeti (Cart Drawer):** LocalStorage tabanlı Entegre AI Studio Cart simülasyonu, promosyon kodu (`ENTEGRE10` / `%10` indirim), KDV hesaplaması.
   - **Sipariş / Teklif Modalı (Checkout Modal):** Müşteri ve fatura bilgileriyle sipariş referansı üretimi (`ENT-ORD-XXXXXX`).
   - **WhatsApp Entegrasyonu:** Sepetteki paketleri tek tıkla WhatsApp mesajına dönüştürerek doğrudan sipariş başlatma.
   - **Ücretsiz Dijital Check-Up Formu:** Büyüme analizi ve potansiyel müşteri toplama motoru.
   - **Ajans Yönetim Paneli (`/admin`):** Gelen siparişleri ve analiz taleplerini listeleme, durum güncelleme ve WhatsApp üzerinden müşteriye tek tıkla ulaşma.

---

## 🛠️ Yerel Ortamda Çalıştırma

Sıfır bağımlılıkla (ekstra npm paketine gerek olmadan) doğrudan Node.js ile çalıştırabilirsiniz:

```bash
# Proje dizinine girin
cd entegreshop-agency

# Sunucuyu başlatın
node server.js
```

Tarayıcınızda açın:
- **Web Sitesi:** [http://localhost:3000](http://localhost:3000)
- **Ajans Paneli:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Sağlık Kontrolü:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🐳 Docker & Coolify Dağıtımı

Coolify üzerinde doğrudan GitHub reposu (`entegreshop/entegreshop-agency` veya ana repo alt klasörü) üzerinden Dockerfile seçilerek yayınlanabilir.

```bash
docker build -t entegreshop-agency:latest .
docker run -d -p 3000:3000 --name entegreshop-agency entegreshop-agency:latest
```

---

## 📦 Dosya Yapısı

```
entegreshop-agency/
├── assets/
│   └── images/
│       ├── hero-growth.jpg           # 3D Büyüme & Reklam Hub görseli
│       ├── ai-advertising.jpg        # Çok kanallı AI reklam görseli
│       └── ecommerce-medusa.jpg      # Headless Medusa v2 e-ticaret görseli
├── css/
│   └── style.css                     # Cam panel & teknolojik koyu tema stilleri
├── js/
│   └── app.js                        # Sepet motoru, fiyatlandırma & checkout mantığı
├── data/
│   ├── orders.json                   # Sipariş veritabanı
│   └── leads.json                    # Analiz talepleri veritabanı
├── index.html                        # Ana web sitesi (5 bölüm + sepet + form)
├── admin.html                        # Ajans sipariş & lead yönetim paneli
├── server.js                         # Production Node.js HTTP sunucusu
├── medusa-config-sample.json         # Medusa v2 ürün ve varyant kataloğu
├── Dockerfile                        # Coolify / Dockerfile
├── docker-compose.yml                # Docker compose
└── package.json
```
