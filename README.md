# 🍛 Universal Osh Markazi & Feed-Up POS Ekotizimi (White-Label Restaurant Suite)

Milliy Osh Markazlari va Fast-Casual (Feed Up uslubidagi) restoran tarmoqlari uchun mo'ljallangan **alohida Backend API Server** va **Zamonaviy Frontend Ekotizimi**.

---

## 🌟 Asosiy Imkoniyatlar va Arxitektura

Loyiha **5 ta o'zaro real-vaqtda (SSE - Server-Sent Events) bog'langan moduldan** iborat:

1. **🌐 Mijozlar Sayti (Feed Up Style Web Ordering)**
   - **Buyurtma rejimlari:** Yetkazib berish (Dastavka), Olib ketish (Self-Pickup), va Zaldan QR-Stol orqali buyurtma.
   - **Qaynoq Hikoyalar (Stories) & Promokodlar:** `OSH20`, `FEEDUP`, `BESHQOZON` promokodlari va interaktiv aksiyalar.
   - **Osh Konstruktori (Modifiers):** Porsiya hajmini tanlash (`0.7 porsiya`, `1 porsiya`, `1.5 porsiya`, `1 Kg Lagan`) va osh ustiga qo'shimchalar (`+Ot qazisi`, `+Pay`, `+Bedana tuxumi`, `+Double go'sht`, `+Achichuk`, `+Patir`).
   - **Keshbek & Loyalty Bonus:** Har bir buyurtmadan 5% keshbek yig'ish va keyingi xaridda ishlatish.
   - **Jonli Buyurtma Kuzatuvi:** Mijoz o'zining elektron navbat raqamini (`#A-106`) va oshning tayyorlanish bosqichlarini jonli kuzatadi.

2. **🖥️ Professional POS Kassa Terminali (Real Working POS)**
   - **Tezkor qidiruv:** Shtrix-kod / SKU (`PLV-001`, `CMB-001`) va kategoriyalar bo'yicha 1-bosishda urish.
   - **Kanallar:** O'zi bilan (Kassa), Zal Stollari, Telefon Dastavka, Uzum Tezkor, Yandex Eats.
   - **Interaktiv Zal Stollari Xaritasi:** Asosiy zal, Yozgi terassa va VIP xonalar bandligini boshqarish.
   - **Kechiktirilgan Cheklar (Hold Order):** Navbatdagi mijozga xizmat ko'rsatish uchun chekni vaqtincha xotiraga olish va qayta tiklash.
   - **To'lov & Qaytim Kalkulyatori:** Naqd pul (50k, 100k, 200k, 500k kupyuralar bilan avtomatik qaytim hisoblash), Uzcard/Humo, CLICK QR, Payme QR va Aralash to'lov.
   - **80mm Fiskal Termal Chek Chop Etish:** Elektron navbat raqami va QR-kod bilan real printerga chiqarish (`window.print()`).

3. **👨‍🍳 Oshxona Ekrani — KDS (Kitchen Display System)**
   - Oshpaz va suzuvchilar uchun real-vaqt buyurtmalar taxtasi.
   - Har bir taomni belgilab chiqish (checklist) va tayyor bo'lganda **1-bosishda Elektron Navbat TV ekraniga chiqarish**.

4. **📺 Elektron Navbat TV Ekrani (Feed Up Queue Board)**
   - Restoran zali uchun ikki ustunli katta TV tablo: **"TAYYORLANMOQDA..."** va **"TAYYOR! MARHAMAT OLING"**.
   - Buyurtma tayyor bo'lganda **ovozli chaqiruv va qo'ng'iroq (Ding-Dong)** effekti.

5. **⚙️ Universal Brend Konstruktori & Admin Panel (White-Label Engine)**
   - **Brend nomini 1 soniyada o'zgartirish:** Istalgan Osh Markazi nomini, shiorini, logotip belgisini, asosiy rang palitrasini, dastavka va xizmat foizlarini kiritish yoki tayyor shablonlardan (*Besh Qozon*, *Osh UP*, *Samarqand Darvoza Osh*, *Xontaxta Plov*) birini tanlash mumkin.
   - **Menyu va Stop-List CRUD:** Yangi taom/kombo qo'shish, narxlarni o'zgartirish va tugagan taomni 1-bosishda Stop-listga olish.
   - **Moliya, Analitika va Z-Hisobot:** Tushum, o'rtacha chek, to'lov turlari kesimi, eng ko'p sotilgan taomlar va **Excel/CSV eksport**.

---

## 🚀 Ishga Tushirish (Quick Start)

### 1. Backend Serverni ishga tushirish (`http://localhost:4000`)
```bash
cd backend
npm install
npm start
```

### 2. Frontend Ilovani ishga tushirish (`http://localhost:5173`)
```bash
cd frontend
npm install
npm run dev
```

Yoki Windows'da `start-all.bat` faylini ikki marta bosing!
