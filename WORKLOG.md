# 📋 Osh Markazi POS & Web Tizimi — Bajarilgan Ishlar Jurnali (WORKLOG.md)

Ushbu faylda loyiha ustida bajarilgan barcha muhandislik va UI/UX dizayn ishlari bosqichma-bosqich qayd etilgan.

---

## ✅ 1-Bosqich: Asosiy Arxitektura va Boshlang'ich Tizim (Bajarildi)
- [x] Alohida **Backend API Server** (`backend/server.js`) va **Frontend SPA** (`frontend/`) arxitekturasi qurildi.
- [x] Real-vaqtda ma'lumot almashish uchun **SSE (Server-Sent Events)** oqimi (`/api/events`) ulandi.

## ✅ 2-Bosqich: Yagona Brend, Default Mijozlar Rejimi, Rollar (RBAC), Kiberxavfsizlik va Sodda Chek (Bajarildi)
- [x] Yagona **"ASL OSH MARKAZI"** brendi, RBAC Login-Parollar (`kassir`, `oshpaz`, `ekran`, `soliq`, `admin`, `secadmin`) va **Kiberxavfsizlik (SOC & WAF)** bo'limi qo'shildi.

## ✅ 3-Bosqich: Soliq.uz (OFD/Fiskal API), Termal Printer (.EXE / Kiosk) va Adaptiv Dizayn (Bajarildi)
- [x] Soliq API Key generator, 17 xonali MXIK kodlar, 12% QQS, 80mm/58mm Zero-Margin Print Engine va `AslOshPOS-Desktop.bat` yaratildi.

---

## ✅ 4-Bosqich: "Premium Heritage" UI/UX Yangilanishi va Revolyutsion Mijozlar Sayti (Bajarildi)

### 4.1. "Premium Heritage" Ranglar Palitrasi va Tipografika (`index.html` & `index.css`)
- [x] **Ranglar:** Chuqur qora/qozon fon (`#0F0F0F`), Oltin-za'faron (`#D4AF37`), Mis/terrakota (`#C85A32`) va Feruza lagan aksenti (`#008B8B`).
- [x] **Tipografika:** Google Fonts orqali sarlavhalar uchun **`Playfair Display`** va **`Cinzel`**, matn va menyu uchun **`Plus Jakarta Sans`** ulandi.
- [x] **Atmosfera:** CSS/SVG sekin ko'tariluvchi bug' (`steamRise`) animatsiyasi, sharqona girih lagan naqshlari va silliq o'tishlar.

### 4.2. Hero Section + "Jonli Qozon" (Live Kazan Tracker) Vidjeti
- [x] Katta ekranda bug'i chiqib turgan Toshkent to'y oshi tasviri va jonli bug' effekti (`94°C ISSIQ BUG'`).
- [x] **"Jonli Qozon" (Live Kazan Tracker)** vidjeti va sekundomeri:
  - *1-Qozon (Toshkent To'y oshi): Tayyor — 45 porsiya qoldi*
  - *2-Qozon (Choyxona oshi): 20 daqiqada suziladi* (real-vaqt taymeri bilan)
  - *3-Qozon (Andijon Devzira oshi): Tayyor — 32 porsiya qoldi*
  - *4-Qozon (Samarqandcha Zig'ir oshi): 14 daqiqada suziladi*

### 4.3. Aqlli "Osh Kalkulyatori" (Interactive Plov Builder)
- [x] Mehmonlar sonini kiritish (`1` dan `50` kishigacha slider va tezkor `2`, `4`, `8`, `12`, `20` kishi tugmalari).
- [x] Avtomatik hisoblash: necha kg/porsiya osh, necha bo'lak qazi, bedana tuxumi, kovatok do'lma, achichuk salat, patir non va choy kerakligini hisoblab, **"Bir tugma bilan savatchaga qo'shish"** funksiyasi.

### 4.4. Interaktiv Menyu (Kartochka ichida Qo'shimchalar Toggle Tugmalari)
- [x] Har bir osh kartochkasining o'zida ustiga **Qazi**, **Do'lma**, **Sarimsoq**, **Achchiq qalampir**, **Bedana tuxumi**, **Pay** qo'shish uchun interaktiv "toggle" tugmalari va jonli narx o'zgarishi.

### 4.5. Oshpazlar va Siri (Scrollytelling Taymlayn)
- [x] Cho'yan qozon va yog' dog'lash (`210°C`), Oltin zirvak qovurilishi (`145°C`), Lazer/Devzira guruchi damlanishi (`96°C`) va Rishton sopol laganida tortiq (`88°C`) bosqichlarini ko'rsatuvchi interaktiv Scrollytelling bo'limi.

### 4.6. Sopol Lagan / Termos-Idish Tanlovi, Joy Band Qilish va Filiallar Xaritasi
- [x] **Rishton Sopol Laganida** yoki **Maxsus Germetik Termos-Idishda** yetkazish tanlovi, issiq yetkazib berish taymeri, VIP xona/so'ri/stol bron qilish formasi va interaktiv Toshkent filiallar xaritasi.
