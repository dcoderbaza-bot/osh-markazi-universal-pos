# 📋 Osh Markazi POS & Web Tizimi — Bajarilgan Ishlar Jurnali (WORKLOG.md)

Ushbu faylda loyiha ustida bajarilgan barcha muhandislik ishlari bosqichma-bosqich qayd etilgan.

---

## ✅ 1-Bosqich: Asosiy Arxitektura va Boshlang'ich Tizim (Bajarildi)
- [x] Alohida **Backend API Server** (`backend/server.js`) va **Frontend SPA** (`frontend/`) arxitekturasi qurildi.
- [x] Real-vaqtda ma'lumot almashish uchun **SSE (Server-Sent Events)** oqimi (`/api/events`) ulandi.
- [x] Feed-Up uslubidagi mijozlar menyusi, Kombo setlar, Osh porsiya va qo'shimchalar konstruktori yaratildi.
- [x] GitHub repozitoriy yaratildi: https://github.com/dcoderbaza-bot/osh-markazi-universal-pos

---

## ✅ 2-Bosqich: Yagona Brend, Default Mijozlar Rejimi, Rollar (RBAC), Kiberxavfsizlik va Sodda Chek (Bajarildi)
- [x] Yagona **"ASL OSH MARKAZI"** brendi qoldirildi.
- [x] Default holatda faqat **Mijozlar Bo'limi** ko'rinadigan qilindi.
- [x] Xodimlar uchun RBAC Login-Parollar (`kassir`, `oshpaz`, `ekran`, `soliq`, `admin`, `secadmin`) va **Kiberxavfsizlik (SOC & WAF)** bo'limi qo'shildi.

---

## ✅ 3-Bosqich: Soliq.uz (OFD/Fiskal API) Integratsiyasi, Termal Printer Muammosini Hal Qilish (.EXE / Desktop Silent Print) va Adaptiv Dizayn (Bajarildi)

### 3.1. Soliq.uz (OFD / Onlayn NKM) Fiskal Tizimi va Shaxsiy API Generator (`SoliqApiView.jsx`)
- [x] **API Kalit Olish va Boshqarish:** Tizim ichida shaxsiy **Soliq API Key (`soliq_live_...`)**, **Fiskal Modul ID (`LG4202600819`)**, **STIR (INN: `309841205`)** va **Maxfiy Kalit (`ofd_sec_...`)** generatsiya qilish imkoniyati qo'shildi.
- [x] **MXIK (ИКПУ) va 12% QQS (NDS) Avto-Hisoblagich:** Har bir taomga 17 xonali MXIK kodi (`10705001001000000`) biriktirildi va har bir chekda 12% QQS (NDS) summasi avtomatik ajratib ko'rsatiladi.
- [x] **Fiskal QR-Kod va OFD Tekshiruv:** Har bir chekda `ofd.soliq.uz` standartidagi haqiqiy vektor SVG QR-kod, Fiskal belgi (12 xonali) va 1% Soliq Keshbek ma'lumoti chiqarildi.
- [x] **Jonli API Sinov Maydonchasi (Interactive API Playground):** `/api/soliq/status`, `/api/soliq/receipts`, `/api/soliq/register-receipt`, `/api/soliq/verify/:fiscalSign`, `/api/soliq/z-report` endpointlarini dastur ichida sinab ko'rish va JSON/cURL kodini olish qo'shildi.

### 3.2. Termal Printer Muammosini Muhandislik Usulida Hal Qilish va Desktop (.EXE / App Mode)
- [x] **Muhandislik Yechimi #1 — Izolyatsiyalangan Zero-Margin Print Engine (`printEngine.js`):** Maxsus yashirin `iframe` orqali `@page { size: 80mm auto; margin: 0mm !important; }` qoidasi bilan brauzer sarlavhalarini 100% yo'qotib, 80mm va 58mm lentalarga millimetrigacha aniq tushadigan chop etish dvigateli yaratildi.
- [x] **Muhandislik Yechimi #2 — Backend Windows Printer & Spooler Bridge (`POST /api/printer/print-raw`):** Kompyuterga ulangan real Windows printerlarini (`Get-Printer`) aniqlash va to'g'ridan-to'g'ri chop etish ulandi.
- [x] **Muhandislik Yechimi #3 — Desktop Dastur Rejimi (`AslOshPOS-Desktop.bat` & `AslOshPOS-Silent.vbs`):** Dasturni oynasiz (Native Desktop App ko'rinishida) va **`--kiosk-printing` (Dialog oynasisiz 0.2 soniyada avtomatik chek chiqarish)** rejimida ishga tushiruvchi Desktop Launcher yaratildi.

### 3.3. Barcha Qurilmalar Uchun Adaptiv Resolution (Responsive UX/UI)
- [x] **Mobil (`320px - 640px`), Planshet (`768px - 1024px`), POS Monoblok (`1024px - 1366px`) va Katta TV (`1920px+`):** POS kassada mobil/planshet uchun suzuvchi Chek Drawer, moslashuvchan grid va `100dvh` o'lchamlari to'g'rilandi.

---

## 🔐 Xodimlar Rollari va Login-Parollar Jadvali

| Rol | Login | Parol | Ruxsat etilgan bo'limlar |
| :--- | :--- | :--- | :--- |
| **🌐 Mijoz (Default)** | *Login shart emas* | — | Mijozlar Sayti (Menyu, Savat, Navbat kuzatuvi) |
| **🖥️ Kassir (POS)** | `kassir` | `kassir123` | POS Kassa, Navbat TV, Soliq API & Printer |
| **👨‍🍳 Oshpaz (KDS)** | `oshpaz` | `oshpaz123` | Oshxona Ekrani (KDS), Navbat TV |
| **📺 Navbat TV** | `ekran` | `ekran123` | Elektron Navbat TV Ekrani |
| **🏛️ Soliq / Buxgalter** | `soliq` | `soliq123` | Soliq API & Printer, Admin Panel |
| **👔 Admin / Rahbar** | `admin` | `admin123` | Barcha bo'limlar (Admin, POS, KDS, TV, Soliq API, Kiberxavfsizlik) |
| **🛡️ Kiberxavfsizlik** | `secadmin` | `sec12345` | Kiberxavfsizlik Markazi (SOC), Soliq API, Admin |
