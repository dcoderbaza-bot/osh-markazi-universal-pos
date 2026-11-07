# 📋 Osh Markazi POS & Web Tizimi — Bajarilgan Ishlar Jurnali (WORKLOG.md)

Ushbu faylda loyiha ustida bajarilgan barcha muhandislik ishlari bosqichma-bosqich qayd etilgan.

---

## ✅ 1-Bosqich: Asosiy Arxitektura va Boshlang'ich Tizim (Bajarildi)
- [x] Alohida **Backend API Server** (`backend/server.js`) va **Frontend SPA** (`frontend/`) arxitekturasi qurildi.
- [x] Real-vaqtda ma'lumot almashish uchun **SSE (Server-Sent Events)** oqimi (`/api/events`) ulandi.
- [x] Feed-Up uslubidagi mijozlar menyusi, Kombo setlar, Osh porsiya va qo'shimchalar konstruktori (`ProductModifierModal.jsx`) yaratildi.
- [x] GitHub repozitoriy yaratildi va dastlabki versiya yuklandi: https://github.com/dcoderbaza-bot/osh-markazi-universal-pos

---

## ✅ 2-Bosqich: Yagona Brend, Default Mijozlar Rejimi, Rollar (RBAC), Kiberxavfsizlik va Sodda Chek (Bajarildi)

### 2.1. Boshqa brendlarni olib tashlash va Yagona Brendga o'tkazish
- [x] `backend/seedData.js`, `App.jsx` va `AdminDashboardView.jsx` dan ortiqcha brend shablonlari (`Besh Qozon`, `Osh UP`, `Samarqand Darvoza`, `Xontaxta Plov`) olib tashlandi.
- [x] Yagona **"ASL OSH MARKAZI"** brendi qoldirildi.

### 2.2. Default holatda faqat Mijozlar Bo'limi ko'rinishi
- [x] Saytga kirganda (`http://localhost:5173`) odatiy mijozlarga faqat **Mijozlar Bo'limi (Buyurtma berish sayti)** ko'rinadi.
- [x] Ichki tizim bo'limlari (`POS Kassa`, `Oshxona KDS`, `Navbat TV`, `Admin`, `Kiberxavfsizlik`) mijozlardan yashirildi va faqat **"Xodimlar kirishi"** tugmasi orqali login qilinganda tegishli rolga qarab ochiladi.

### 2.3. Rollarga bo'lish (RBAC) va Login-Parollar (`LoginModal.jsx`)
Har bir xodim o'z login va paroli bilan kirganda faqat o'ziga ruxsat berilgan bo'limni ko'radi:

| Rol | Login | Parol | Ruxsat etilgan bo'limlar |
| :--- | :--- | :--- | :--- |
| **Mijoz (Default)** | *Login shart emas* | — | Mijozlar Sayti (Menyu, Savat, Navbat kuzatuvi) |
| **Kassir (POS)** | `kassir` | `kassir123` | POS Kassa Terminali, Navbat TV Ekrani |
| **Oshpaz (KDS)** | `oshpaz` | `oshpaz123` | Oshxona Ekrani (KDS), Navbat TV Ekrani |
| **Navbat TV Ekrani** | `ekran` | `ekran123` | Elektron Navbat TV Ekrani |
| **Admin / Rahbar** | `admin` | `admin123` | Admin Panel, POS Kassa, Oshxona KDS, Navbat TV, Kiberxavfsizlik |
| **Kiberxavfsizlik (SOC)** | `secadmin` | `sec12345` | Kiberxavfsizlik Markazi, Audit Log, Firewall, Admin |

### 2.4. Kiberxavfsizlik Bo'limi (`CyberSecurityView.jsx` va `backend/server.js`)
- [x] **Backend WAF & Himoya qatlami (`backend/server.js`):**
  - XSS va SQL-Injection hujumlarini aniqlash va bloklash (`WAF Payload Inspector`).
  - Login urinishlarida **Brute-Force himoyasi** (5 marta xato paroldan so'ng bloklash).
  - Har bir chek va buyurtma uchun **SHA-256 Kriptografik Imzo (`fiscalHash`)** — chek summasini soxtalashtirishdan himoya.
  - Shubhali IP manzillarni bloklash (`Firewall Blacklist`).
- [x] **Frontend Kiberxavfsizlik Paneli (`CyberSecurityView.jsx`):**
  - Jonli Xavfsizlik Auditi Jurnali (`Security Audit Logs`).
  - Xodimlar rollari va login-parollari jadvali.
  - IP Firewall boshqaruvi (IP bloklash / blokdan chiqarish).
  - Xavfsizlik sinovi simulyatori (*SQLi, XSS va SHA-256 Chek Audit sinov tugmalari*).

### 2.5. Chek chiqarishni soddalashtirish (`ReceiptModal.jsx`)
- [x] Ortiqcha murakkab qatorlar olib tashlanib, tez o'qiladigan va 1-bosishda chop etiladigan **ixcham, tushunarli 80mm kassa cheki** qilindi (Markaz nomi, Katta Navbat Raqami `#A-101`, Taomlar ro'yxati, Jami summa, To'lov turi, SHA-256 kodi va "Chop etish" tugmasi).

### 2.6. Yakuniy sinov va GitHub'ga yangilanishni yuklash (`git push`)
- [x] Barcha o'zgarishlar build qilindi va GitHub repozitoriyga (`main` branch) yuklandi.
