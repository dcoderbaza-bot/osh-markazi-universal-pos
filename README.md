# 🍛 ASL OSH MARKAZI — Web, Real POS, KDS, Navbat TV va Kiberxavfsizlik Tizimi

Osh Markazi uchun mo'ljallangan **alohida Backend API Server** (`backend/`) va **Rollarga bo'lingan (RBAC) Frontend Ilova** (`frontend/`).

---

## 🔐 Xodimlar Rollari va Login-Parollar (RBAC)

Saytga kirilganda **default holatda faqat Mijozlar Bo'limi** (buyurtma berish sayti) ko'rinadi. Xodimlar esa o'ng yuqori burchakdagi **"🔒 Xodimlar kirishi"** tugmasi orqali o'z login va parollari bilan tizimga kiradilar:

| Rol / Lavozim | Login | Parol | Ruxsat etilgan bo'limlar |
| :--- | :--- | :--- | :--- |
| **🌐 Mijoz (Default)** | *Login shart emas* | — | Mijozlar Sayti (Menyu, Kombo, Savat, Jonli Navbat) |
| **🖥️ Kassir (POS)** | `kassir` | `kassir123` | POS Kassa Terminali, Navbat TV Ekrani |
| **👨‍🍳 Bosh Oshpaz (KDS)** | `oshpaz` | `oshpaz123` | Oshxona Ekrani (KDS), Navbat TV Ekrani |
| **📺 Zal Ekrani** | `ekran` | `ekran123` | Elektron Navbat TV Ekrani |
| **👔 Admin / Rahbar** | `admin` | `admin123` | Admin Panel (Menyu, Moliya), POS, KDS, Navbat TV, Kiberxavfsizlik |
| **🛡️ Kiberxavfsizlik (SOC)** | `secadmin` | `sec12345` | Kiberxavfsizlik Markazi (WAF, Firewall, Audit Log), Admin |

---

## 🌟 Asosiy Bo'limlar

1. **🌐 Mijozlar Bo'limi (Default)**
   - Yetkazib berish (Dastavka), Olib ketish va Zaldan QR-Stol buyurtmasi.
   - Osh porsiyalari (`0.7`, `1`, `1.5`, `1 Kg Lagan`) va qo'shimchalar konstruktori (`+Qazi`, `+Pay`, `+Bedana tuxumi`, `+Double go'sht`).
   - Promokodlar (`OSH20`, `FEEDUP`), 5% keshbek bonus va jonli navbat kuzatuvi.
2. **🖥️ Real POS Kassa Terminali**
   - Shtrix-kod/SKU qidiruv, Zal stollari xaritasi, Kechiktirilgan cheklar (*Hold*), Naqd pul qaytim kalkulyatori va **Soddalashtirilgan 80mm Kassa Cheki** (`SHA-256` imzosi bilan).
3. **👨‍🍳 Oshxona Ekrani (KDS)**
   - Oshpazlar uchun real-vaqt buyurtmalar taxtasi va tayyor taomni 1-bosishda Navbat TV ekraniga chiqarish.
4. **📺 Elektron Navbat TV Ekrani**
   - *"Tayyorlanmoqda"* va *"Tayyor! Marhamat oling"* ikki ustunli tablo va ovozli chaqiruv.
5. **🛡️ Kiberxavfsizlik Markazi (SOC & WAF)**
   - **WAF (Web Application Firewall):** SQL-Injection va XSS hujumlarini avtomatik tutish va bloklash.
   - **Brute-Force & Rate-Limiting:** Ketma-ket xato parol terilganda bloklash.
   - **SHA-256 Fiskal Imzo:** Har bir chekning o'zgartirilmaganligini kriptografik tasdiqlash.
   - **IP Firewall & Jonli SIEM Audit Log:** Shubhali IP manzillarni bloklash va hujum simulyatori.

---

## 🚀 Ishga Tushirish

1. `start-all.bat` faylini ikki marta bosing, yoki:
2. Backend (`http://localhost:4000`):
   ```bash
   cd backend && npm install && npm start
   ```
3. Frontend (`http://localhost:5173`):
   ```bash
   cd frontend && npm install && npm run dev
   ```
