// Default Osh Markazi Seed Data & RBAC Roles with Security

const initialConfig = {
  brandName: "ASL OSH MARKAZI",
  brandSubtitle: "Milliy Taomlar & Fast-Casual Express",
  logoEmoji: "🍛",
  logoUrl: "",
  themeColor: "#D97706",
  accentColor: "#B45309",
  slogan: "Har kuni 5 xil qozonda yangi damlangan issiq osh — 25 daqiqada dasturxoningizda!",
  badgeText: "Qozonlar Ochiq • Issiq Osh Tayyor 🔥",
  currency: "so'm",
  phone: "+998 (71) 200-55-77",
  telegram: "@aslosh_uz",
  instagram: "@aslosh.official",
  workingHours: "07:00 - 23:30",
  deliveryFee: 15000,
  freeDeliveryMin: 150000,
  serviceChargePercent: 10,
  taxPercent: 12,
  cashbackPercent: 5,
  queuePrefix: "A",
  receiptHeader: "Xush kelibsiz! Yoqimli ishtaha tilaymiz!",
  receiptFooter: "Xaridingiz uchun rahmat! Har bir buyurtmadan 5% keshbek yig'iladi.",
  activeBranchId: "branch-1"
};

// Staff Roles with Credentials & Permissions
const staffAccounts = [
  {
    id: "usr-cashier",
    username: "kassir",
    password: "kassir123",
    role: "cashier",
    roleLabel: "Kassir (POS Operator)",
    fullName: "Dilshod Rahimov",
    allowedModules: ["pos", "queue"],
    status: "active",
    avatar: "🖥️"
  },
  {
    id: "usr-chef",
    username: "oshpaz",
    password: "oshpaz123",
    role: "chef",
    roleLabel: "Bosh Oshpaz (KDS)",
    fullName: "Usta Jamshid Oshpaz",
    allowedModules: ["kds", "queue"],
    status: "active",
    avatar: "👨‍🍳"
  },
  {
    id: "usr-tv",
    username: "ekran",
    password: "ekran123",
    role: "tv_operator",
    roleLabel: "Zal Navbat Ekrani",
    fullName: "Zal TV Terminali",
    allowedModules: ["queue"],
    status: "active",
    avatar: "📺"
  },
  {
    id: "usr-admin",
    username: "admin",
    password: "admin123",
    role: "admin",
    roleLabel: "Boshqaruvchi / Admin",
    fullName: "Sanjarbek Rahbar",
    allowedModules: ["admin", "pos", "kds", "queue", "security"],
    status: "active",
    avatar: "👔"
  },
  {
    id: "usr-security",
    username: "secadmin",
    password: "sec12345",
    role: "security",
    roleLabel: "Kiberxavfsizlik (SOC)",
    fullName: "Axborot Xavfsizligi Bo'limi",
    allowedModules: ["security", "admin", "pos", "kds", "queue"],
    status: "active",
    avatar: "🛡️"
  }
];

const initialBranches = [
  {
    id: "branch-1",
    name: "Markaziy Osh Markazi (Teleminora)",
    address: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 108-uy",
    phone: "+998 (71) 200-55-77",
    hours: "07:00 - 23:30",
    isOpen: true,
    deliveryTime: "25-35 daq",
    tablesCount: 16,
    qozonStatus: "5 ta qozon faol 🔥"
  },
  {
    id: "branch-2",
    name: "Chilonzor Express Filiali",
    address: "Toshkent sh., Chilonzor 9-daha, Qatortol ko'chasi, 24-uy",
    phone: "+998 (71) 200-55-88",
    hours: "08:00 - 02:00",
    isOpen: true,
    deliveryTime: "20-30 daq",
    tablesCount: 12,
    qozonStatus: "3 ta qozon faol 🔥"
  }
];

const initialStories = [
  {
    id: "story-1",
    title: "Super Kombo -20%",
    subtitle: "Feed Up uslubidagi tezkor tushlik setlari",
    badge: "XIT KOMBO 🔥",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    description: "To'y oshi + Qazi + Achichuk salat + Issiq patir + Choy yoki Coca-Cola — 20% arzonroq!",
    promoCode: "FEEDUP"
  },
  {
    id: "story-2",
    title: "1 Kg Oilaviy Lagan",
    subtitle: "4-5 kishilik shohona osh to'plami",
    badge: "OILAVIY 👑",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    description: "Maxsus termo-idishda 1 kg To'y oshi, 4 bo'lak qazi, 4 dona bedana tuxumi, 2 ta patir va 1L kompot!",
    promoCode: "OSH20"
  },
  {
    id: "story-3",
    title: "Samarqand Zig'ir Oshi",
    subtitle: "Tabiiy zig'ir yog'ida",
    badge: "YANGI QOZON ✨",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    description: "Sariq sabzi, no'xat, mayiz va barra go'shtdan qat-qat qilib suziladigan haqiqiy Samarqand oshi.",
    promoCode: "ASLOSH"
  }
];

const initialCategories = [
  { id: "combos", name: "Kombo Setlar", icon: "🔥", sortOrder: 1 },
  { id: "plov", name: "Osh Turlari", icon: "🍛", sortOrder: 2 },
  { id: "addons", name: "Qo'shimchalar", icon: "🥩", sortOrder: 3 },
  { id: "salads", name: "Salatlar", icon: "🥗", sortOrder: 4 },
  { id: "bread_somsa", name: "Non va Somsa", icon: "🫓", sortOrder: 5 },
  { id: "drinks", name: "Ichimliklar", icon: "🫖", sortOrder: 6 }
];

const commonPlovModifiers = [
  { id: "mod-qazi", name: "Ot qazisi (1 bo'lak)", price: 14000 },
  { id: "mod-pay", name: "Yumshoq Pay", price: 15000 },
  { id: "mod-bedana", name: "Bedana tuxumi (2 dona)", price: 6000 },
  { id: "mod-extra-meat", name: "Double Go'sht (+100g)", price: 24000 },
  { id: "mod-achichuk", name: "Mini Achichuk", price: 11000 },
  { id: "mod-patir", name: "Yarimta patir", price: 7000 }
];

const plovPortionVariants = [
  { id: "v-07", name: "0.7 Porsiya", priceDelta: -8000, weight: "320g" },
  { id: "v-10", name: "1 Porsiya (Standart)", priceDelta: 0, weight: "420g" },
  { id: "v-15", name: "1.5 Porsiya (Katta)", priceDelta: 18000, weight: "600g" },
  { id: "v-1kg", name: "1 Kg Oilaviy Lagan", priceDelta: 85000, weight: "1100g" }
];

const initialProducts = [
  {
    id: "prod-combo-1",
    sku: "CMB-001",
    categoryId: "combos",
    name: "Asl Osh Solo Kombo #1",
    description: "1 porsiya To'y oshi + Qazi + Achichuk salat + Yarimta patir + Coca-Cola 0.5L yoki Choy.",
    price: 59000,
    oldPrice: 69000,
    weight: "850g",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "XIT KOMBO 🔥",
    variants: [
      { id: "cmb-v1", name: "Standart (Coca-Cola 0.5L)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v2", name: "Milliy (Limonli Choy)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v3", name: "Kombo MAX (1.5 porsiya + Double Qazi)", priceDelta: 22000, weight: "1050g" }
    ],
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-combo-2",
    sku: "CMB-002",
    categoryId: "combos",
    name: "Juftlik Kombo (2 kishilik)",
    description: "2 porsiya Osh + 2 bo'lak Qazi + 4 ta Bedana tuxumi + Achichuk + Suzma + Butun Patir + 1L Kompot.",
    price: 118000,
    oldPrice: 138000,
    weight: "1750g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "-15% FOYDALI 💑",
    variants: [
      { id: "duo-1", name: "To'y oshi bilan", priceDelta: 0, weight: "1750g" },
      { id: "duo-2", name: "Choyxona oshi bilan", priceDelta: 4000, weight: "1750g" }
    ],
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-1",
    sku: "PLV-001",
    categoryId: "plov",
    name: "Toshkent To'y Oshi (Maxsus)",
    description: "Lazer guruchi, sariq va qizil sabzi, no'xat, mayiz, yumshoq mol va qo'y go'shti bilan damlangan to'y oshi.",
    price: 38000,
    weight: "420g",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "KLASSIK XIT 🌟",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-2",
    sku: "PLV-002",
    categoryId: "plov",
    name: "Choyxona Palovi (Qovurma)",
    description: "Qo'y dumba yog'i va dog'langan yog'da qovurilgan to'q rangli xushbo'y choyxona oshi.",
    price: 42000,
    weight: "430g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "CHOYXONA USLUBI 🔥",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-3",
    sku: "PLV-003",
    categoryId: "plov",
    name: "Samarqand Zig'ir Oshi",
    description: "100% tabiiy zig'ir yog'i, sariq sabzi va barra go'shtdan aralashtirilmay suziladigan Samarqand oshi.",
    price: 44000,
    weight: "430g",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-add-1",
    sku: "ADD-001",
    categoryId: "addons",
    name: "Ot Qazisi (3 bo'lak)",
    description: "Dudlangan va qozonda pishirilgan oliy navli ot qazisi.",
    price: 36000,
    weight: "120g",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-sal-1",
    sku: "SAL-001",
    categoryId: "salads",
    name: "Achichuk Salat (Shakarob)",
    description: "Yupqa to'g'ralgan shirin pomidor, piyoz, rayhon va qalampir.",
    price: 14000,
    weight: "220g",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-brd-1",
    sku: "BRD-001",
    categoryId: "bread_somsa",
    name: "Tandir Go'shtli Somsa",
    description: "Qarsildoq qatlama xamir ichida barra qo'y go'shti.",
    price: 12000,
    weight: "140g",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-brd-2",
    sku: "BRD-002",
    categoryId: "bread_somsa",
    name: "Kunjutli Patir Non",
    description: "Sut va sariyog'da yopilgan tandir patir.",
    price: 10000,
    weight: "300g",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-drk-1",
    sku: "DRK-001",
    categoryId: "drinks",
    name: "Toshkent Limonli Choyi",
    description: "Novvot va yangi limon bilan damlangan xushbo'y choy.",
    price: 10000,
    weight: "500ml",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  }
];

const initialTables = [
  { id: "t-1", number: "Stol #1", zone: "Asosiy Zal", seats: 4, status: "occupied", currentOrderId: "ord-102" },
  { id: "t-2", number: "Stol #2", zone: "Asosiy Zal", seats: 4, status: "free", currentOrderId: null },
  { id: "t-3", number: "Stol #3", zone: "Asosiy Zal", seats: 6, status: "free", currentOrderId: null },
  { id: "t-4", number: "Stol #4", zone: "Asosiy Zal", seats: 4, status: "free", currentOrderId: null },
  { id: "t-5", number: "VIP Xona #1", zone: "VIP Kabinalar", seats: 10, status: "occupied", currentOrderId: "ord-101" }
];

const initialPromos = [
  { code: "OSH20", discountPercent: 20, minOrder: 50000, description: "Barcha buyurtmalarga 20% chegirma" },
  { code: "FEEDUP", discountPercent: 15, minOrder: 40000, description: "Kombolarga 15% chegirma" }
];

const now = Date.now();
const initialOrders = [
  {
    id: "ord-101",
    queueNumber: "A-101",
    source: "pos",
    orderType: "dine_in",
    tableId: "t-5",
    tableName: "VIP Xona #1",
    customerName: "Sardorbek",
    customerPhone: "+998 90 123-45-67",
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "click",
    createdAt: new Date(now - 14 * 60000).toISOString(),
    cashierName: "Dilshod Kassir",
    items: [
      {
        id: "item-1",
        productId: "prod-combo-1",
        name: "Asl Osh Solo Kombo #1",
        variantName: "Standart (Coca-Cola 0.5L)",
        modifiers: [],
        quantity: 2,
        unitPrice: 59000,
        totalPrice: 118000,
        ready: true
      }
    ],
    subtotal: 118000,
    discount: 0,
    serviceFee: 11800,
    deliveryFee: 0,
    total: 129800
  },
  {
    id: "ord-102",
    queueNumber: "A-102",
    source: "web",
    orderType: "delivery",
    tableId: null,
    tableName: "Yetkazib berish 🛵",
    customerName: "Malika K.",
    customerPhone: "+998 97 707-88-99",
    address: "Yunusobod 4, 18-uy, 42-xona",
    status: "cooking",
    paymentStatus: "paid",
    paymentMethod: "payme",
    createdAt: new Date(now - 8 * 60000).toISOString(),
    cashierName: "Online Sayt",
    items: [
      {
        id: "item-3",
        productId: "prod-plov-1",
        name: "Toshkent To'y Oshi (Maxsus)",
        variantName: "1 Porsiya (Standart)",
        modifiers: [{ name: "Ot qazisi (1 bo'lak)", price: 14000 }],
        quantity: 2,
        unitPrice: 52000,
        totalPrice: 104000,
        ready: false
      }
    ],
    subtotal: 104000,
    discount: 0,
    serviceFee: 0,
    deliveryFee: 15000,
    total: 119000
  }
];

const initialShift = {
  isOpen: true,
  openedAt: new Date(now - 4 * 3600000).toISOString(),
  cashierName: "Dilshod Rahimov (Kassa #1)",
  startingCash: 500000
};

// Initial Security Audit Logs
const initialSecurityLogs = [
  {
    id: "sec-log-1",
    timestamp: new Date(now - 35 * 60000).toISOString(),
    event: "SYSTEM_BOOT",
    severity: "info",
    actor: "system",
    ip: "127.0.0.1",
    details: "Universal Asl Osh Markazi tizimi xavfsiz muhitda ishga tushirildi."
  },
  {
    id: "sec-log-2",
    timestamp: new Date(now - 20 * 60000).toISOString(),
    event: "AUTH_SUCCESS",
    severity: "success",
    actor: "kassir",
    ip: "192.168.1.104",
    details: "Kassir Dilshod Rahimov POS terminalga muvaffaqiyatli kirdi."
  },
  {
    id: "sec-log-3",
    timestamp: new Date(now - 12 * 60000).toISOString(),
    event: "RATE_LIMIT_CHECK",
    severity: "info",
    actor: "guest",
    ip: "144.124.196.69",
    details: "DDoS va Brute-Force tekshiruvi: 0 ta shubhali so'rov aniqlandi."
  }
];

module.exports = {
  initialConfig,
  staffAccounts,
  initialBranches,
  initialStories,
  initialCategories,
  initialProducts,
  initialTables,
  initialPromos,
  initialOrders,
  initialShift,
  initialSecurityLogs
};
