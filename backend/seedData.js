// Default Osh Markazi Seed Data — Premium Heritage Plov Center, RBAC Roles, Soliq.uz OFD API, Thermal Printer & Cybersecurity

const initialConfig = {
  brandName: "ASL OSH MARKAZI",
  brandSubtitle: "Premium Heritage • Milliy Osh Markazi",
  logoEmoji: "🍛",
  logoUrl: "",
  themeColor: "#D4AF37",
  accentColor: "#C85A32",
  slogan: "O'zbek oshpazlik san'atining oltin merosi — cho'yan qozonda damlangan haqiqiy osh, sopol lagan yoki maxsus termosda 25 daqiqada dasturxoningizda!",
  badgeText: "Jonli Qozonlar Ochiq • Bug'i Chiqib Turgan Issiq Osh 🔥",
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
  receiptFooter: "Soliq.uz ilovasi orqali QR-kodni skanerlang va 1% keshbek oling!",
  activeBranchId: "branch-1"
};

const initialSoliqConfig = {
  enabled: true,
  mode: "PRODUCTION_OFD", // PRODUCTION_OFD | TEST_SANDBOX
  companyName: '"ASL OSH MARKAZI" MCHJ',
  stir: "309841205", // 9-digit INN / STIR
  terminalId: "LG4202600819", // Fiskal Modul raqami
  cashboxNumber: "NKM-8800412",
  vatPercent: 12, // 12% QQS (NDS)
  soliqCashbackPercent: 1, // 1% Soliq.uz QR Cashback
  apiKey: "soliq_live_98f4a2d7c1e64b8091a5d3f7e2b904c1",
  secretKey: "ofd_sec_77a1b3c9d4e5f608123456789abcdef0",
  ofdEndpoint: "https://ofd.soliq.uz/api/v1/fiscal",
  webhookUrl: "http://localhost:4000/api/soliq/webhook",
  autoFiscalize: true,
  lastSyncAt: new Date().toISOString()
};

const initialPrinterConfig = {
  paperWidth: "80mm", // 80mm | 58mm
  autoPrintOnPosPay: true, // POS da to'lov bosilishi bilan darhol chop etish
  printMethod: "zero_margin_iframe", // zero_margin_iframe | windows_raw
  selectedPrinter: "Default POS Thermal Printer (80mm)",
  copies: 1,
  cutPaper: true,
  openCashDrawer: true,
  fontSize: "normal"
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
    allowedModules: ["pos", "queue", "soliq"],
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
    id: "usr-soliq",
    username: "soliq",
    password: "soliq123",
    role: "accountant",
    roleLabel: "Soliq & Fiskal API (Buxgalter)",
    fullName: "Bosh Hisobchi (OFD/MXIK)",
    allowedModules: ["soliq", "admin"],
    status: "active",
    avatar: "🏛️"
  },
  {
    id: "usr-admin",
    username: "admin",
    password: "admin123",
    role: "admin",
    roleLabel: "Boshqaruvchi / Admin",
    fullName: "Sanjarbek Rahbar",
    allowedModules: ["admin", "pos", "kds", "queue", "soliq", "security"],
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
    allowedModules: ["security", "soliq", "admin", "pos", "kds", "queue"],
    status: "active",
    avatar: "🛡️"
  }
];

const initialBranches = [
  {
    id: "branch-1",
    name: "Markaziy Osh Markazi (Teleminora)",
    address: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 108-uy",
    landmark: "Toshkent Teleminorasi va Oq Machit ro'parasida",
    phone: "+998 (71) 200-55-77",
    hours: "07:00 - 23:30",
    isOpen: true,
    deliveryTime: "25-30 daq",
    tablesCount: 24,
    vipRoomsCount: 6,
    qozonStatus: "5 ta cho'yan qozon faol 🔥",
    lat: 41.3445,
    lng: 69.2868
  },
  {
    id: "branch-2",
    name: "Chilonzor Meros & Express Filiali",
    address: "Toshkent sh., Chilonzor 9-daha, Qatortol ko'chasi, 24-uy",
    landmark: "Qatortol savdo markazi yonida",
    phone: "+998 (71) 200-55-88",
    hours: "08:00 - 02:00",
    isOpen: true,
    deliveryTime: "20-28 daq",
    tablesCount: 16,
    vipRoomsCount: 4,
    qozonStatus: "4 ta cho'yan qozon faol 🔥",
    lat: 41.2858,
    lng: 69.2041
  },
  {
    id: "branch-3",
    name: "Samarqand Darvoza (Eski Shahar)",
    address: "Toshkent sh., Shayxontohur tumani, Qoratosh ko'chasi, 5A-uy",
    landmark: "Samarqand Darvoza majmuasi yaqinida",
    phone: "+998 (71) 200-55-99",
    hours: "07:30 - 23:00",
    isOpen: true,
    deliveryTime: "22-32 daq",
    tablesCount: 20,
    vipRoomsCount: 5,
    qozonStatus: "4 ta cho'yan qozon faol 🔥",
    lat: 41.3164,
    lng: 69.2311
  }
];

const initialStories = [
  {
    id: "story-1",
    title: "Sopol Laganda To'y Oshi",
    subtitle: "Rishton ustalarining naqshinkor laganida issiq yetkazish",
    badge: "MEROS PREMIUM 👑",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    description: "6 kishidan ko'p buyurtmalarga haqiqiy Rishton sopol lagani sovg'a sifatida dasturxoningizda qoladi! Promokod bilan 20% chegirma.",
    promoCode: "OSH20"
  },
  {
    id: "story-2",
    title: "Andijon Devzira Oshi",
    subtitle: "3 yillik Uzgen devzira guruchi va dumba yog'ida",
    badge: "CHOYXONA SIRI 🔥",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    description: "Qip-qizil devzira guruchi, sarimsoq boshlari va achchiq qalampir bilan damlangan haqiqiy vodiy oshi.",
    promoCode: "FEEDUP"
  },
  {
    id: "story-3",
    title: "Samarqand Zig'ir Oshi",
    subtitle: "Tabiiy zig'ir yog'i va sariq sabzida qat-qat suziladi",
    badge: "QADIMIY RETSEPT ✨",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    description: "Aralashtirilmasdan qat-qat suziladigan Samarqandcha zig'ir oshi — ot qazisi va bedana tuxumi bilan.",
    promoCode: "OSH20"
  },
  {
    id: "story-4",
    title: "1 Kg Shohona Termos-Set",
    subtitle: "4-5 kishilik oilaviy osh to'plami — 3 soat issiq saqlaydi",
    badge: "TERMOS-IDISH 🏺",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "Maxsus germetik termos-idishda 1 kg To'y oshi, 4 bo'lak qazi, 4 ta bedana tuxumi, 2 ta achichuk va patir non!",
    promoCode: "FEEDUP"
  }
];

const initialCategories = [
  { id: "plov", name: "Osh Turlari", icon: "🍛", sortOrder: 1 },
  { id: "combos", name: "Shohona Setlar", icon: "👑", sortOrder: 2 },
  { id: "addons", name: "Osh Ustiga Qo'shimchalar", icon: "🥩", sortOrder: 3 },
  { id: "salads", name: "Salatlar", icon: "🥗", sortOrder: 4 },
  { id: "bread_somsa", name: "Patir va Somsa", icon: "🫓", sortOrder: 5 },
  { id: "drinks", name: "Choy va Ichimliklar", icon: "🫖", sortOrder: 6 }
];

// Inline Toggle Modifiers for Plov Cards (Qazi, Do'lma, Sarimsoq, Achchiq qalampir, Bedana tuxumi)
const commonPlovModifiers = [
  { id: "mod-qazi", name: "Qazi (Ot qazisi)", shortName: "Qazi", icon: "🥩", price: 14000 },
  { id: "mod-dolma", name: "Kovatok Do'lma (3 dona)", shortName: "Do'lma", icon: "🍃", price: 12000 },
  { id: "mod-sarimsoq", name: "Damlangan Sarimsoq boshi", shortName: "Sarimsoq", icon: "🧄", price: 5000 },
  { id: "mod-qalampir", name: "Achchiq Qalampir", shortName: "Achchiq qalampir", icon: "🌶️", price: 4000 },
  { id: "mod-bedana", name: "Bedana tuxumi (2 dona)", shortName: "Bedana tuxumi", icon: "🥚", price: 6000 },
  { id: "mod-pay", name: "Yumshoq Pay", shortName: "Pay", icon: "🍖", price: 15000 }
];

const plovPortionVariants = [
  { id: "v-07", name: "0.7 Porsiya", priceDelta: -8000, weight: "320g" },
  { id: "v-10", name: "1 Porsiya (Standart)", priceDelta: 0, weight: "420g" },
  { id: "v-15", name: "1.5 Porsiya (Boyvachcha)", priceDelta: 18000, weight: "600g" },
  { id: "v-1kg", name: "1 Kg Sopol Lagan (4 kishilik)", priceDelta: 95000, weight: "1200g" }
];

const initialProducts = [
  {
    id: "prod-plov-1",
    sku: "PLV-001",
    mxikCode: "10705001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "plov",
    name: "Toshkent To'y Oshi (Maxsus)",
    kazanLabel: "1-Qozon • Tayyor",
    regionTag: "Toshkent Maktabi",
    riceType: "Xorazm Oltin Lazer guruchi",
    description: "Xorazmning eng sara Lazer guruchi, sariq sabzi, shirin mayiz, Halima no'xat, barra qo'y va mol go'shti bilan mis qozonda damlangan shohona to'y oshi.",
    price: 38000,
    weight: "420g",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=85",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "1-QOZON • XIT 🌟",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-4",
    sku: "PLV-004",
    mxikCode: "10705001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "plov",
    name: "Andijon Devzira Oshi (Xoncha)",
    kazanLabel: "3-Qozon • Tayyor",
    regionTag: "Farg'ona vodiysi",
    riceType: "3 yillik Uzgen Qizil Devzirasi",
    description: "Haqiqiy 3 yillik Uzgen devzira guruchi, qo'y dumba yog'i, butun sarimsoq va achchiq qalampir bilan cho'yan qozonda damlangan to'yimli vodiy oshi.",
    price: 45000,
    weight: "440g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "DEVZIRA MEROS 🔥",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-3",
    sku: "PLV-003",
    mxikCode: "10705001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "plov",
    name: "Samarqandcha Zig'ir Oshi",
    kazanLabel: "4-Qozon • Damda",
    regionTag: "Samarqand Maktabi",
    riceType: "Alanga & Lazer guruchi",
    description: "100% tabiiy tog' zig'ir yog'i, sariq sabzi va barra go'shtdan qozonda aralashtirilmay, laganga qat-qat qilib suziladigan parhezli Samarqand oshi.",
    price: 44000,
    weight: "430g",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "SAMARQANDCHA ✨",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-2",
    sku: "PLV-002",
    mxikCode: "10705001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "plov",
    name: "Choyxona Palovi (Qovurma)",
    kazanLabel: "2-Qozon • 20 daqiqada",
    regionTag: "Eski Toshkent Choyxonasi",
    riceType: "Qovurilgan Lazer guruchi",
    description: "Qo'y dumba yog'i va dog'langan yog'da qizarib qovurilgan piyoz hamda sabzi bilan damlanadigan to'q rangli, xushbo'y ulfatlar choyxona oshi.",
    price: 42000,
    weight: "430g",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "CHOYXONA USLUBI 🏺",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-combo-1",
    sku: "CMB-001",
    mxikCode: "10705001002000000",
    packageCode: "12002",
    vatPercent: 12,
    categoryId: "combos",
    name: "Asl Osh Solo Kombo #1",
    description: "1 porsiya Toshkent To'y oshi + Ot qazisi + Achichuk salat + Yarimta patir + Limonli Ko'k Choy.",
    price: 59000,
    oldPrice: 69000,
    weight: "850g",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "SOLO XIT 🔥",
    variants: [
      { id: "cmb-v1", name: "Milliy (Limonli Choy bilan)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v2", name: "Standart (Reyhan Kompot bilan)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v3", name: "Kombo MAX (1.5 porsiya + Double Qazi)", priceDelta: 22000, weight: "1050g" }
    ],
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-combo-2",
    sku: "CMB-002",
    mxikCode: "10705001002000000",
    packageCode: "12002",
    vatPercent: 12,
    categoryId: "combos",
    name: "Sopol Lagan Oilaviy Set (4 kishilik)",
    description: "Rishton sopol laganida 1.5 kg To'y oshi + 4 bo'lak Qazi + 4 dona Kovatok Do'lma + 4 ta Bedana tuxumi + 2 ta Achichuk + 2 ta Patir + 1L Kompot.",
    price: 215000,
    oldPrice: 255000,
    weight: "2850g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "SOPOL LAGANDA 👑",
    variants: [
      { id: "fam-1", name: "Toshkent To'y oshi bilan", priceDelta: 0, weight: "2850g" },
      { id: "fam-2", name: "Andijon Devzira oshi bilan", priceDelta: 18000, weight: "2850g" },
      { id: "fam-3", name: "Samarqand Zig'ir oshi bilan", priceDelta: 15000, weight: "2850g" }
    ],
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-add-1",
    sku: "ADD-001",
    mxikCode: "01602001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "addons",
    name: "Ot Qazisi (3 bo'lak)",
    description: "Qozonda zirvak bilan birga pishirilgan oliy navli ot qazisi.",
    price: 38000,
    weight: "130g",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-add-2",
    sku: "ADD-002",
    mxikCode: "01602001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "addons",
    name: "Kovatok Do'lma (5 dona)",
    description: "Mayin uzum bargiga o'ralgan qiyma go'shtli osh usti do'lmasi.",
    price: 18000,
    weight: "150g",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-add-3",
    sku: "ADD-003",
    mxikCode: "01602001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "addons",
    name: "Bedana Tuxumi (5 dona)",
    description: "Tozalangan va dog'langan yog'da biroz qizartirilgan bedana tuxumlari.",
    price: 15000,
    weight: "90g",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-sal-1",
    sku: "SAL-001",
    mxikCode: "10704001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "salads",
    name: "Achichuk Salat (Shakarob)",
    description: "Pichoqda qog'ozdek yupqa to'g'ralgan shirin pomidor, oq piyoz, rayhon va achchiq qalampir.",
    price: 14000,
    weight: "220g",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-sal-2",
    sku: "SAL-002",
    mxikCode: "10704001001000000",
    packageCode: "12001",
    vatPercent: 12,
    categoryId: "salads",
    name: "Ko'katli Chakki (Suzma)",
    description: "Samarqand uslubidagi quyuq chakki suzma — kashnich, ukrop va rayhon bilan.",
    price: 12000,
    weight: "180g",
    image: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-brd-1",
    sku: "BRD-001",
    mxikCode: "01905001001000000",
    packageCode: "12003",
    vatPercent: 12,
    categoryId: "bread_somsa",
    name: "Tandir Go'shtli Somsa",
    description: "Cho'g'li tandirda yopilgan qarsildoq qatlama xamir ichida barra qo'y go'shti va dumba.",
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
    mxikCode: "01905001001000000",
    packageCode: "12003",
    vatPercent: 12,
    categoryId: "bread_somsa",
    name: "Kunjutli Tandir Patir Non",
    description: "Qaymoq va sariyog'da qorilib, tandirdan uzilgan issiq shirmoy patir.",
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
    mxikCode: "02202001001000000",
    packageCode: "12004",
    vatPercent: 12,
    categoryId: "drinks",
    name: "Toshkent Limonli Choyi (Choynakda)",
    description: "Paxta gulli choynakda novvot va yangi Toshkent limoni bilan damlangan ko'k yoki qora choy.",
    price: 10000,
    weight: "600ml",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-drk-2",
    sku: "DRK-002",
    mxikCode: "02202001001000000",
    packageCode: "12004",
    vatPercent: 12,
    categoryId: "drinks",
    name: "Muzdek Reyhan & Olcha Kompoti (1L)",
    description: "Osh hazmini yengillashtiruvchi tabiiy tog' olchasi va binafsha rayhon sharbati.",
    price: 18000,
    weight: "1000ml",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    variants: [],
    modifiers: []
  }
];

const initialTables = [
  { id: "t-1", number: "So'ri #1 (Sharqona)", zone: "Hovli Ayvon", seats: 6, status: "occupied", currentOrderId: "ord-102" },
  { id: "t-2", number: "Stol #2 (Oilaviy)", zone: "Asosiy Zal", seats: 4, status: "free", currentOrderId: null },
  { id: "t-3", number: "Stol #3 (Naqshinkor)", zone: "Asosiy Zal", seats: 6, status: "free", currentOrderId: null },
  { id: "t-4", number: "So'ri #4 (Favvora bo'yi)", zone: "Hovli Ayvon", seats: 8, status: "free", currentOrderId: null },
  { id: "t-5", number: "VIP Xona «Registon»", zone: "VIP Kabinalar", seats: 12, status: "occupied", currentOrderId: "ord-101" },
  { id: "t-6", number: "VIP Xona «Xiva Xonligi»", zone: "VIP Kabinalar", seats: 16, status: "free", currentOrderId: null }
];

const initialPromos = [
  { code: "OSH20", discountPercent: 20, minOrder: 50000, description: "Barcha osh va lagan setlarga 20% chegirma" },
  { code: "FEEDUP", discountPercent: 15, minOrder: 40000, description: "Shohona kombolarga 15% chegirma" },
  { code: "MEROS", discountPercent: 25, minOrder: 150000, description: "Mehmon kutish to'plamlariga 25% chegirma" }
];

const now = Date.now();
const initialOrders = [
  {
    id: "ord-101",
    queueNumber: "A-101",
    receiptSeq: 1001,
    source: "pos",
    orderType: "dine_in",
    tableId: "t-5",
    tableName: "VIP Xona «Registon»",
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
        mxikCode: "10705001002000000",
        name: "Asl Osh Solo Kombo #1",
        variantName: "Milliy (Limonli Choy bilan)",
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
    total: 129800,
    vatAmount: Math.round((129800 * 12) / 112),
    soliqCashback: Math.round(129800 * 0.01),
    fiscalSign: "849201746381",
    terminalId: "LG4202600819",
    ofdStatus: "SENT_OK"
  },
  {
    id: "ord-102",
    queueNumber: "A-102",
    receiptSeq: 1002,
    source: "web",
    orderType: "delivery",
    tableId: null,
    tableName: "Yetkazib berish (Sopol laganda) 🏺",
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
        mxikCode: "10705001001000000",
        name: "Toshkent To'y Oshi (Maxsus)",
        variantName: "1 Porsiya (Standart)",
        modifiers: [{ name: "Qazi (Ot qazisi)", price: 14000 }],
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
    total: 119000,
    vatAmount: Math.round((119000 * 12) / 112),
    soliqCashback: Math.round(119000 * 0.01),
    fiscalSign: "938105624190",
    terminalId: "LG4202600819",
    ofdStatus: "SENT_OK"
  }
];

const initialShift = {
  isOpen: true,
  openedAt: new Date(now - 4 * 3600000).toISOString(),
  cashierName: "Dilshod Rahimov (Kassa #1)",
  startingCash: 500000
};

const initialSecurityLogs = [
  {
    id: "sec-log-1",
    timestamp: new Date(now - 35 * 60000).toISOString(),
    event: "SYSTEM_BOOT",
    severity: "info",
    actor: "system",
    ip: "127.0.0.1",
    details: "Asl Osh Markazi POS, Soliq OFD API va Kiberxavfsizlik tizimi ishga tushirildi."
  },
  {
    id: "sec-log-2",
    timestamp: new Date(now - 20 * 60000).toISOString(),
    event: "SOLIQ_OFD_SYNC",
    severity: "success",
    actor: "OFD-Agent",
    ip: "127.0.0.1",
    details: "Soliq.uz OFD fiskal moduli (LG4202600819) bilan aloqa o'rnatildi."
  }
];

module.exports = {
  initialConfig,
  initialSoliqConfig,
  initialPrinterConfig,
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
