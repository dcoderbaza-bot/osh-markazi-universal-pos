// Universal Osh Markazi & Fast-Casual POS Seed Data

const brandPresets = [
  {
    id: "besh-qozon",
    brandName: "BESH QOZON",
    brandSubtitle: "Milliy Osh Markazi & Fast-Casual",
    logoEmoji: "🍛",
    themeColor: "#D97706", // Warm Amber Gold
    accentColor: "#92400E",
    slogan: "Har kuni yangi damlangan issiq osh — 25 daqiqada dasturxoningizda!",
    badgeText: "Asosiy Qozon Ochiq 🔥"
  },
  {
    id: "osh-up",
    brandName: "OSH UP",
    brandSubtitle: "Milliy Fast-Casual & Express Plov",
    logoEmoji: "🔥",
    themeColor: "#E11D48", // Feed Up inspired vibrant crimson-red
    accentColor: "#9F1239",
    slogan: "Tez, mazali va milliy! Kombo oshlar va issiq taomlar tarmog'i",
    badgeText: "Feed Up Uslubidagi Tezkor Xizmat ⚡"
  },
  {
    id: "samarqand-osh",
    brandName: "SAMARQAND DARVOZA OSH",
    brandSubtitle: "An'anaviy Zig'ir va To'y Oshi Markazi",
    logoEmoji: "🕌",
    themeColor: "#059669", // Oriental Emerald
    accentColor: "#065F46",
    slogan: "Samarqand va Toshkent oshining eng sara an'analari bir makonda",
    badgeText: "100% Tabiiy Zig'ir va Qo'y Go'shti ✨"
  },
  {
    id: "xontaxta-plov",
    brandName: "XONTAXTA PLOV",
    brandSubtitle: "Premium Choyxona va Osh Markazi",
    logoEmoji: "👑",
    themeColor: "#2563EB", // Royal Cobalt Blue
    accentColor: "#1E40AF",
    slogan: "Shohona dasturxon va haqiqiy oshpazlar mahorati",
    badgeText: "VIP Xizmat va Oilaviy Laganlar 👑"
  }
];

const initialConfig = {
  brandName: "OSH UP • BESH QOZON",
  brandSubtitle: "Milliy Osh Markazi & Fast-Casual POS",
  logoEmoji: "🍛",
  logoUrl: "",
  themeColor: "#D97706",
  accentColor: "#B45309",
  slogan: "Har kuni 5 xil qozonda yangi damlangan issiq osh — 25 daqiqada yetkazib beramiz!",
  badgeText: "Qozonlar Ochiq • Issiq Osh Tayyor 🔥",
  currency: "so'm",
  phone: "+998 (71) 200-55-77",
  telegram: "@oshmarkazi_uz",
  instagram: "@oshmarkazi.official",
  workingHours: "07:00 - 23:30",
  deliveryFee: 15000,
  freeDeliveryMin: 150000,
  serviceChargePercent: 10,
  taxPercent: 12,
  cashbackPercent: 5,
  queuePrefix: "A",
  receiptHeader: "Xush kelibsiz! Yoqimli ishtaha tilaymiz!",
  receiptFooter: "Xaridingiz uchun rahmat! Har bir buyurtmadan 5% keshbek yig'iladi.",
  activeBranchId: "branch-1",
  presets: brandPresets
};

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
    qozonStatus: "5 ta qozon faol 🔥",
    coordinates: { lat: 41.3455, lng: 69.2845 }
  },
  {
    id: "branch-2",
    name: "Chilonzor Express Filiali (Feed-Up format)",
    address: "Toshkent sh., Chilonzor 9-daha, Qatortol ko'chasi, 24-uy",
    phone: "+998 (71) 200-55-88",
    hours: "08:00 - 02:00",
    isOpen: true,
    deliveryTime: "20-30 daq",
    tablesCount: 12,
    qozonStatus: "3 ta qozon faol 🔥",
    coordinates: { lat: 41.2858, lng: 69.2041 }
  },
  {
    id: "branch-3",
    name: "Samarqand Darvoza Oilaviy Filiali",
    address: "Toshkent sh., Shayxontohur tumani, Qoratosh ko'chasi, 5A",
    phone: "+998 (71) 200-55-99",
    hours: "07:30 - 23:00",
    isOpen: true,
    deliveryTime: "25-40 daq",
    tablesCount: 20,
    qozonStatus: "4 ta qozon faol 🔥",
    coordinates: { lat: 41.3162, lng: 69.2311 }
  }
];

const initialStories = [
  {
    id: "story-1",
    title: "Super Kombo -20%",
    subtitle: "Feed Up uslubidagi tezkor tushlik setlari",
    badge: "XIT KOMBO 🔥",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    description: "To'y oshi + Qazi + Achichuk salat + Issiq patir + Choy yoki Coca-Cola — barchasi bitta qulay kombo qutida 20% arzonroq!",
    promoCode: "FEEDUP",
    linkedCategoryId: "combos"
  },
  {
    id: "story-2",
    title: "1 Kg Oilaviy Lagan",
    subtitle: "4-5 kishilik shohona osh to'plami",
    badge: "OILAVIY 👑",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    description: "Maxsus sopol ko'rinishdagi issiqlik saqlovchi idishda 1 kg To'y oshi, 4 bo'lak qazi, 4 dona bedana tuxumi, 2 ta patir va 1L kompot!",
    promoCode: "OSH20",
    linkedCategoryId: "combos"
  },
  {
    id: "story-3",
    title: "Samarqand Zig'ir Oshi",
    subtitle: "Qashqadaryo va Samarqand zig'ir yog'ida",
    badge: "YANGI QOZON ✨",
    gradient: "from-purple-600 via-indigo-600 to-blue-700",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    description: "Sariq sabzi, no'xat, mayiz va yumshoq mol/qo'y go'shtidan qat-qat qilib suziladigan haqiqiy Samarqand zig'ir oshi.",
    promoCode: "BESHQOZON",
    linkedCategoryId: "plov"
  },
  {
    id: "story-4",
    title: "Bepul Yetkazib Berish",
    subtitle: "150 000 so'mdan yuqori buyurtmalarga",
    badge: "AKSIYA 🛵",
    gradient: "from-rose-600 via-pink-600 to-orange-500",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "Toshkent shahri bo'ylab maxsus termo-sumkalarda oshingiz sovumasdan 25-35 daqiqa ichida eshigingizgacha yetkazib beriladi.",
    promoCode: "OSH20",
    linkedCategoryId: "plov"
  }
];

const initialCategories = [
  { id: "combos", name: "Kombo Setlar", icon: "🔥", description: "Feed Up uslubidagi tejamkor va to'yimli setlar", sortOrder: 1 },
  { id: "plov", name: "Osh Turlari", icon: "🍛", description: "5 xil qozonda damlangan issiq milliy oshlar", sortOrder: 2 },
  { id: "addons", name: "Oshga Qo'shimchalar", icon: "🥩", description: "Qazi, pay, bedana tuxumi, qo'shimcha go'sht va norin", sortOrder: 3 },
  { id: "salads", name: "Salatlar & Gazaklar", icon: "🥗", description: "Achichuk, suzma, bahor, chimchi va turp-anor", sortOrder: 4 },
  { id: "bread_somsa", name: "Non va Somsalar", icon: "🫓", description: "Tandir somsa, patir non va Obi non", sortOrder: 5 },
  { id: "drinks", name: "Choy va Ichimliklar", icon: "🫖", description: "Limonli choy, uy kompoti, ayron va salqin ichimliklar", sortOrder: 6 },
  { id: "desserts", name: "Shirinliklar", icon: "🍯", description: "Samarqand halvo, paxlava va chak-chak", sortOrder: 7 }
];

const commonPlovModifiers = [
  { id: "mod-qazi", name: "Ot qazisi (1 bo'lak)", price: 14000, defaultSelected: false },
  { id: "mod-pay", name: "Yumshoq Pay (ulush)", price: 15000, defaultSelected: false },
  { id: "mod-bedana", name: "Bedana tuxumi (2 dona)", price: 6000, defaultSelected: false },
  { id: "mod-extra-meat", name: "Double Go'sht (+100g)", price: 24000, defaultSelected: false },
  { id: "mod-garlic", name: "Pishgan sarimsoq (1 bosh)", price: 5000, defaultSelected: false },
  { id: "mod-pepper", name: "Achchiq qalampir", price: 3000, defaultSelected: false },
  { id: "mod-achichuk", name: "Mini Achichuk salat", price: 11000, defaultSelected: false },
  { id: "mod-patir", name: "Yarimta issiq patir", price: 7000, defaultSelected: false }
];

const plovPortionVariants = [
  { id: "v-07", name: "0.7 Porsiya (Yengil)", priceDelta: -8000, weight: "320g" },
  { id: "v-10", name: "1 Porsiya (Standart)", priceDelta: 0, weight: "420g" },
  { id: "v-15", name: "1.5 Porsiya (Katta)", priceDelta: 18000, weight: "600g" },
  { id: "v-1kg", name: "1 Kg Oilaviy Lagan (3-4 kishilik)", priceDelta: 85000, weight: "1100g" }
];

const initialProducts = [
  // COMBOS (Feed Up Style)
  {
    id: "prod-combo-1",
    sku: "CMB-001",
    categoryId: "combos",
    name: "OshUP Solo Kombo #1",
    description: "1 porsiya To'y oshi (qazi va bedana tuxumi bilan) + Achichuk salat + Yarimta patir + Coca-Cola 0.5L yoki Limonli choy.",
    price: 59000,
    oldPrice: 69000,
    weight: "850g",
    calories: "940 kkal",
    prepTime: "5 daq",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "ENG KO'P SOTILGAN 🔥",
    variants: [
      { id: "cmb-v1", name: "Standart Kombo (Coca-Cola 0.5L bilan)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v2", name: "Milliy Kombo (Limonli Qora/Ko'k Choy bilan)", priceDelta: 0, weight: "850g" },
      { id: "cmb-v3", name: "Kombo MAX (1.5 porsiya osh + Double Qazi)", priceDelta: 22000, weight: "1050g" }
    ],
    modifiers: [
      { id: "mod-qazi", name: "Qo'shimcha Qazi bo'lagi", price: 14000 },
      { id: "mod-somsa", name: "+1 dona Tandir Somsa", price: 12000 },
      { id: "mod-suzma", name: "+Suzma salat", price: 10000 }
    ]
  },
  {
    id: "prod-combo-2",
    sku: "CMB-002",
    categoryId: "combos",
    name: "Juftlik Kombo (2 kishilik)",
    description: "2 porsiya To'y yoki Choyxona oshi + 2 bo'lak Qazi + 4 ta Bedana tuxumi + Achichuk + Suzma + Butun Patir + 1L Uy kompoti.",
    price: 118000,
    oldPrice: 138000,
    weight: "1750g",
    calories: "1850 kkal",
    prepTime: "8 daq",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "-15% FOYDALI 💑",
    variants: [
      { id: "duo-1", name: "To'y oshi bilan (2 porsiya)", priceDelta: 0, weight: "1750g" },
      { id: "duo-2", name: "Choyxona oshi bilan (2 porsiya)", priceDelta: 4000, weight: "1750g" },
      { id: "duo-3", name: "Samarqand Zig'ir oshi bilan (2 porsiya)", priceDelta: 6000, weight: "1750g" }
    ],
    modifiers: [
      { id: "mod-pay", name: "+Pay qo'shish (2 ulush)", price: 28000 },
      { id: "mod-somsa2", name: "+2 dona Go'shtli Somsa", price: 24000 }
    ]
  },
  {
    id: "prod-combo-3",
    sku: "CMB-003",
    categoryId: "combos",
    name: "Besh Qozon Oilaviy Lagan Set (4-5 kishilik)",
    description: "Maxsus lagan qutida 1.5 kg Kombo Osh (Qazi, Pay, Qo'y go'shti, Bedana tuxumi, Do'lma) + 2 xil Achichuk + 2 xil Suzma + 2 ta Patir + 2L Kompot.",
    price: 235000,
    oldPrice: 275000,
    weight: "3600g",
    calories: "3900 kkal",
    prepTime: "10 daq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: true,
    badge: "SHOHONA SET 👑",
    variants: [
      { id: "fam-4", name: "Oilaviy Set (4-5 kishilik)", priceDelta: 0, weight: "3.6 kg" },
      { id: "fam-8", name: "Mehmondo'st Set (7-8 kishilik)", priceDelta: 145000, weight: "5.8 kg" }
    ],
    modifiers: [
      { id: "mod-norin", name: "+1 porsiya Toshkent Norini", price: 38000 },
      { id: "mod-somsa4", name: "+4 dona Tandir Somsa", price: 46000 }
    ]
  },
  {
    id: "prod-combo-4",
    sku: "CMB-004",
    categoryId: "combos",
    name: "Talaba / Express Box",
    description: "Feed Up uslubidagi qulay qutida 0.7 porsiya To'y oshi + Mini Achichuk + Non bo'lagi + Ayron 0.3L.",
    price: 42000,
    oldPrice: 49000,
    weight: "620g",
    calories: "680 kkal",
    prepTime: "3 daq",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: true,
    badge: "TEZKOR BOX ⚡",
    variants: [
      { id: "exp-1", name: "Express Box (0.7 porsiya)", priceDelta: 0, weight: "620g" },
      { id: "exp-2", name: "Big Box (1 porsiya)", priceDelta: 9000, weight: "750g" }
    ],
    modifiers: [
      { id: "mod-bedana", name: "+2 dona Bedana tuxumi", price: 6000 },
      { id: "mod-qazi", name: "+1 bo'lak Qazi", price: 14000 }
    ]
  },

  // PLOV TYPES (Osh Turlari)
  {
    id: "prod-plov-1",
    sku: "PLV-001",
    categoryId: "plov",
    name: "Toshkent To'y Oshi (Maxsus)",
    description: "Lazer guruchida sariq va qizil sabzi, no'xat, oq kishmish, yumshoq mol va qo'y go'shti bilan damlangan an'anaviy Toshkent to'y oshi.",
    price: 38000,
    weight: "420g",
    calories: "720 kkal",
    prepTime: "4 daq",
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
    description: "Qo'y dumba yog'i va dog'langan yog'da qizarib qovurilgan Farg'ona/Toshkent uslubidagi to'q rangli xushbo'y choyxona oshi, pishgan sarimsoq bilan.",
    price: 42000,
    weight: "430g",
    calories: "790 kkal",
    prepTime: "5 daq",
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
    description: "Aralshtirilmasdan qat-qat qilib suziladigan, 100% tabiiy zig'ir yog'i, sariq sabzi va barra go'shtdan tayyorlangan Samarqand oshi.",
    price: 44000,
    weight: "430g",
    calories: "710 kkal",
    prepTime: "5 daq",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "TABIIY ZIG'IR ✨",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-4",
    sku: "PLV-004",
    categoryId: "plov",
    name: "Andijon Devzira Oshi",
    description: "Haqiqiy Qorako'l va Chungara devzira guruchidan, qo'y qovurg'asi va sariq sabzi bilan damlangan vodiycha devzira palov.",
    price: 46000,
    weight: "440g",
    calories: "780 kkal",
    prepTime: "5 daq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    badge: "DEVZIRA GURUCH 🌾",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },
  {
    id: "prod-plov-5",
    sku: "PLV-005",
    categoryId: "plov",
    name: "Shohona Assorti Osh (Super Kombo)",
    description: "Ustiga 2 bo'lak ot qazisi, yumshoq pay, 2 dona bedana tuxumi, tok do'lma va qo'shimcha go'sht bosilgan boyitilgan bayramona osh.",
    price: 62000,
    weight: "550g",
    calories: "950 kkal",
    prepTime: "5 daq",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "VIP ASSORTI 👑",
    variants: plovPortionVariants,
    modifiers: commonPlovModifiers
  },

  // ADDONS (Oshga Qo'shimchalar)
  {
    id: "prod-add-1",
    sku: "ADD-001",
    categoryId: "addons",
    name: "Ot Qazisi (1 porsiya / 3 bo'lak)",
    description: "Maxsus retsept bo'yicha dudlangan va qozonda pishirilgan oliy navli ot qazisi.",
    price: 36000,
    weight: "120g",
    calories: "340 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: [
      { id: "qz-1", name: "1 bo'lak (40g)", priceDelta: -22000, weight: "40g" },
      { id: "qz-3", name: "3 bo'lak (120g - Porsiya)", priceDelta: 0, weight: "120g" }
    ],
    modifiers: []
  },
  {
    id: "prod-add-2",
    sku: "ADD-002",
    categoryId: "addons",
    name: "Toshkent Norini (Qazi bilan)",
    description: "Mayda to'g'ralgan qo'l xamiri va ot go'shti/qazisidan tayyorlangan haqiqiy Toshkent norini (quruq yoki sho'rva bilan).",
    price: 42000,
    weight: "300g",
    calories: "520 kkal",
    prepTime: "4 daq",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "MILLIY DELIKATES",
    variants: [
      { id: "nr-1", name: "Quruq norin (300g)", priceDelta: 0, weight: "300g" },
      { id: "nr-2", name: "Sho'rvasi bilan (400g)", priceDelta: 5000, weight: "400g" }
    ],
    modifiers: [
      { id: "mod-qazi", name: "+Qo'shimcha Qazi", price: 14000 }
    ]
  },
  {
    id: "prod-add-3",
    sku: "ADD-003",
    categoryId: "addons",
    name: "Yumshoq Pay va Ilashma",
    description: "Uzoq vaqt past olovda pishirilgan, og'izda eriydigan kollagenga boy mol payi.",
    price: 22000,
    weight: "100g",
    calories: "240 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-add-4",
    sku: "ADD-004",
    categoryId: "addons",
    name: "Tok Do'lma (Kovartok - 5 dona)",
    description: "Yangi uzum bargiga o'ralgan qiyma go'shtli xushbo'y kovartok do'lmalar.",
    price: 18000,
    weight: "130g",
    calories: "210 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },

  // SALADS (Salatlar)
  {
    id: "prod-sal-1",
    sku: "SAL-001",
    categoryId: "salads",
    name: "Achichuk Salat (Shakarob)",
    description: "Yupqa to'g'ralgan shirin Toshkent pomidori, oq piyoz, rayhon va achchiq ko'k qalampir — oshning eng yaqin do'sti.",
    price: 14000,
    weight: "220g",
    calories: "65 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "OSHGA MOS #1 🍅",
    variants: [
      { id: "ach-1", name: "Standart porsiya", priceDelta: 0, weight: "220g" },
      { id: "ach-2", name: "Katta Oilaviy porsiya", priceDelta: 8000, weight: "380g" }
    ],
    modifiers: []
  },
  {
    id: "prod-sal-2",
    sku: "SAL-002",
    categoryId: "salads",
    name: "Ko'katli Chakka (Suzma)",
    description: "Tabiiy qatiqdan suzilgan quyuq suzma, yangi ukrop, kashnich va rayhon bilan.",
    price: 12000,
    weight: "180g",
    calories: "140 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-sal-3",
    sku: "SAL-003",
    categoryId: "salads",
    name: "Anor va Marg'ilon Turp Salati",
    description: "Qarsildoq ko'k Marg'ilon turpi va nordon-shirin Qashqadaryo anor donachalari — hazmni yaxshilovchi vitaminli salat.",
    price: 15000,
    weight: "200g",
    calories: "80 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-sal-4",
    sku: "SAL-004",
    categoryId: "salads",
    name: "Bahor Salati (Bodring-Pomidor-Ko'kat)",
    description: "Barragina bodring, pomidor, qizil piyoz va ko'katlar aralashmasi.",
    price: 14000,
    weight: "220g",
    calories: "75 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },

  // BREAD & SOMSA
  {
    id: "prod-brd-1",
    sku: "BRD-001",
    categoryId: "bread_somsa",
    name: "Tandirdan Uzilgan Go'shtli Somsa",
    description: "Qat-qat qarsildoq xamir ichida barra qo'y go'shti va dumba bilan tandirda yopilgan issiq somsa.",
    price: 12000,
    weight: "140g",
    calories: "360 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "ISSIQ TANDIR 🔥",
    variants: [
      { id: "sms-1", name: "Go'shtli somsa (1 dona)", priceDelta: 0, weight: "140g" },
      { id: "sms-2", name: "Ko'k / Qovoqli somsa (1 dona)", priceDelta: -3000, weight: "130g" }
    ],
    modifiers: []
  },
  {
    id: "prod-brd-2",
    sku: "BRD-002",
    categoryId: "bread_somsa",
    name: "Toshkent Patir Noni (Kunjutli)",
    description: "Sut va sariyog' qo'shib tandirda yopilgan qarsildoq kunjutli patir non.",
    price: 10000,
    weight: "300g",
    calories: "620 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: [
      { id: "non-full", name: "Butun patir", priceDelta: 0, weight: "300g" },
      { id: "non-half", name: "Yarimta patir", priceDelta: -4000, weight: "150g" }
    ],
    modifiers: []
  },
  {
    id: "prod-brd-3",
    sku: "BRD-003",
    categoryId: "bread_somsa",
    name: "Yopgan Obi Non",
    description: "Har soatda yangi uziladigan yumshoq tandir obi noni.",
    price: 6000,
    weight: "250g",
    calories: "510 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },

  // DRINKS
  {
    id: "prod-drk-1",
    sku: "DRK-001",
    categoryId: "drinks",
    name: "Toshkent Limonli Choyi (Choynak / Stakan)",
    description: "Tog' giyohlari, yangi Toshkent limoni va novvot bilan damlangan xushbo'y ko'k yoki qora choy.",
    price: 10000,
    weight: "500ml",
    calories: "45 kkal",
    prepTime: "2 daq",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    badge: "LIMON + NOVVOT 🍋",
    variants: [
      { id: "tea-green", name: "Ko'k choy limon bilan", priceDelta: 0, weight: "500ml" },
      { id: "tea-black", name: "Qora choy limon bilan", priceDelta: 0, weight: "500ml" }
    ],
    modifiers: []
  },
  {
    id: "prod-drk-2",
    sku: "DRK-002",
    categoryId: "drinks",
    name: "Tabiiy Uy Kompoti (Olcha va O'rik)",
    description: "Muzdek tabiiy mevalardan qaynatilgan vitaminli uy kompoti.",
    price: 16000,
    weight: "1000ml",
    calories: "180 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: [
      { id: "kmp-1l", name: "1 L Grafin / Butulka", priceDelta: 0, weight: "1000ml" },
      { id: "kmp-04", name: "0.4 L Stakan", priceDelta: -8000, weight: "400ml" }
    ],
    modifiers: []
  },
  {
    id: "prod-drk-3",
    sku: "DRK-003",
    categoryId: "drinks",
    name: "Muzdek Yalpizli Ayron",
    description: "Tog' yalpizi va rayhon qo'shilgan salqinlatuvchi tabiiy ayron.",
    price: 9000,
    weight: "350ml",
    calories: "95 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-drk-4",
    sku: "DRK-004",
    categoryId: "drinks",
    name: "Coca-Cola / Fanta / Sprite",
    description: "Muzdek gazlangan ichimlik.",
    price: 12000,
    weight: "500ml",
    calories: "210 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [
      { id: "cc-05", name: "0.5 L", priceDelta: 0, weight: "500ml" },
      { id: "cc-10", name: "1.0 L", priceDelta: 6000, weight: "1000ml" },
      { id: "cc-15", name: "1.5 L", priceDelta: 10000, weight: "1500ml" }
    ],
    modifiers: []
  },

  // DESSERTS
  {
    id: "prod-des-1",
    sku: "DES-001",
    categoryId: "desserts",
    name: "Yong'oqli Sharqona Paxlava",
    description: "Asal va yong'oq mag'zi bilan pishirilgan og'izda eriydigan paxlava.",
    price: 18000,
    weight: "150g",
    calories: "420 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: true,
    isCombo: false,
    variants: [],
    modifiers: []
  },
  {
    id: "prod-des-2",
    sku: "DES-002",
    categoryId: "desserts",
    name: "Samarqand Suti va Pista Halvosi",
    description: "Choy bilan tanovul qilish uchun qaymoqli va xandon pistali milliy halvo.",
    price: 16000,
    weight: "160g",
    calories: "380 kkal",
    prepTime: "1 daq",
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    isPopular: false,
    isCombo: false,
    variants: [],
    modifiers: []
  }
];

const initialTables = [
  { id: "t-1", number: "Stol #1", zone: "Asosiy Zal", seats: 4, status: "occupied", currentOrderId: "ord-102" },
  { id: "t-2", number: "Stol #2", zone: "Asosiy Zal", seats: 4, status: "free", currentOrderId: null },
  { id: "t-3", number: "Stol #3", zone: "Asosiy Zal", seats: 6, status: "free", currentOrderId: null },
  { id: "t-4", number: "Stol #4", zone: "Asosiy Zal", seats: 4, status: "occupied", currentOrderId: "ord-104" },
  { id: "t-5", number: "Stol #5", zone: "Asosiy Zal", seats: 2, status: "free", currentOrderId: null },
  { id: "t-6", number: "Stol #6", zone: "Asosiy Zal", seats: 6, status: "free", currentOrderId: null },
  { id: "t-7", number: "Terassa #1", zone: "Yozgi Terassa", seats: 4, status: "free", currentOrderId: null },
  { id: "t-8", number: "Terassa #2", zone: "Yozgi Terassa", seats: 6, status: "reserved", currentOrderId: null },
  { id: "t-9", number: "Terassa #3", zone: "Yozgi Terassa", seats: 4, status: "free", currentOrderId: null },
  { id: "t-10", number: "VIP Xona #1 (Samarqand)", zone: "VIP Kabinalar", seats: 10, status: "occupied", currentOrderId: "ord-101" },
  { id: "t-11", number: "VIP Xona #2 (Buxoro)", zone: "VIP Kabinalar", seats: 12, status: "free", currentOrderId: null },
  { id: "t-12", number: "VIP Xona #3 (Xiva)", zone: "VIP Kabinalar", seats: 8, status: "free", currentOrderId: null }
];

const initialPromos = [
  { code: "OSH20", discountPercent: 20, minOrder: 50000, description: "Barcha buyurtmalarga 20% chegirma" },
  { code: "FEEDUP", discountPercent: 15, minOrder: 40000, description: "Kombo setlar va tezkor buyurtmalarga 15% chegirma" },
  { code: "BESHQOZON", discountPercent: 10, minOrder: 30000, description: "Doimiy mijozlar uchun 10% chegirma" }
];

const now = Date.now();

const initialOrders = [
  {
    id: "ord-101",
    queueNumber: "A-101",
    source: "pos",
    orderType: "dine_in",
    tableId: "t-10",
    tableName: "VIP Xona #1 (Samarqand)",
    branchId: "branch-1",
    customerName: "Sardorbek (VIP #1)",
    customerPhone: "+998 90 123-45-67",
    address: "Zal - VIP Xona #1",
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "click",
    createdAt: new Date(now - 14 * 60000).toISOString(),
    updatedAt: new Date(now - 2 * 60000).toISOString(),
    cashierName: "Dilshod Kassir",
    note: "Choyni novvot bilan bering, osh yog'sizroq bo'lsin",
    items: [
      {
        id: "item-1",
        productId: "prod-combo-3",
        name: "Besh Qozon Oilaviy Lagan Set (4-5 kishilik)",
        variantName: "Oilaviy Set (4-5 kishilik)",
        modifiers: [{ name: "+4 dona Tandir Somsa", price: 46000 }],
        quantity: 1,
        unitPrice: 281000,
        totalPrice: 281000,
        ready: true
      },
      {
        id: "item-2",
        productId: "prod-drk-1",
        name: "Toshkent Limonli Choyi",
        variantName: "Ko'k choy limon bilan",
        modifiers: [],
        quantity: 2,
        unitPrice: 10000,
        totalPrice: 20000,
        ready: true
      }
    ],
    subtotal: 301000,
    discount: 0,
    serviceFee: 30100,
    deliveryFee: 0,
    total: 331100
  },
  {
    id: "ord-102",
    queueNumber: "A-102",
    source: "pos",
    orderType: "dine_in",
    tableId: "t-1",
    tableName: "Stol #1",
    branchId: "branch-1",
    customerName: "Stol #1 Mijozi",
    customerPhone: "",
    address: "Asosiy Zal - Stol #1",
    status: "cooking",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date(now - 8 * 60000).toISOString(),
    updatedAt: new Date(now - 5 * 60000).toISOString(),
    cashierName: "Dilshod Kassir",
    note: "Achichuk piyozsiz bo'lsin",
    items: [
      {
        id: "item-3",
        productId: "prod-plov-1",
        name: "Toshkent To'y Oshi (Maxsus)",
        variantName: "1 Porsiya (Standart)",
        modifiers: [
          { name: "Ot qazisi (1 bo'lak)", price: 14000 },
          { name: "Bedana tuxumi (2 dona)", price: 6000 }
        ],
        quantity: 2,
        unitPrice: 58000,
        totalPrice: 116000,
        ready: false
      },
      {
        id: "item-4",
        productId: "prod-sal-1",
        name: "Achichuk Salat (Shakarob)",
        variantName: "Standart porsiya",
        modifiers: [],
        quantity: 2,
        unitPrice: 14000,
        totalPrice: 28000,
        ready: true
      },
      {
        id: "item-5",
        productId: "prod-brd-2",
        name: "Toshkent Patir Noni (Kunjutli)",
        variantName: "Butun patir",
        modifiers: [],
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
        ready: true
      }
    ],
    subtotal: 154000,
    discount: 0,
    serviceFee: 15400,
    deliveryFee: 0,
    total: 169400
  },
  {
    id: "ord-103",
    queueNumber: "A-103",
    source: "web",
    orderType: "pickup",
    tableId: null,
    tableName: "O'zi bilan (Saytdan)",
    branchId: "branch-1",
    customerName: "Javohir T.",
    customerPhone: "+998 93 555-11-22",
    address: "Markaziy Filialdan olib ketish",
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "payme",
    createdAt: new Date(now - 11 * 60000).toISOString(),
    updatedAt: new Date(now - 1 * 60000).toISOString(),
    cashierName: "Online Sayt",
    note: "Paketga qoshiq va salfetka ko'proq soling",
    items: [
      {
        id: "item-6",
        productId: "prod-combo-1",
        name: "OshUP Solo Kombo #1",
        variantName: "Standart Kombo (Coca-Cola 0.5L bilan)",
        modifiers: [{ name: "Qo'shimcha Qazi bo'lagi", price: 14000 }],
        quantity: 2,
        unitPrice: 73000,
        totalPrice: 146000,
        ready: true
      }
    ],
    subtotal: 146000,
    discount: 0,
    serviceFee: 0,
    deliveryFee: 0,
    total: 146000
  },
  {
    id: "ord-104",
    queueNumber: "A-104",
    source: "web",
    orderType: "delivery",
    tableId: null,
    tableName: "Yetkazib berish 🛵",
    branchId: "branch-1",
    customerName: "Malika Karimova",
    customerPhone: "+998 97 707-88-99",
    address: "Yunusobod 4-mavze, 18-uy, 42-xonadon",
    status: "new",
    paymentStatus: "paid",
    paymentMethod: "click",
    createdAt: new Date(now - 2 * 60000).toISOString(),
    updatedAt: new Date(now - 2 * 60000).toISOString(),
    cashierName: "Online Sayt",
    note: "Domofon kodi 42K. Issiqroq yetkazing iltimos!",
    items: [
      {
        id: "item-7",
        productId: "prod-combo-2",
        name: "Juftlik Kombo (2 kishilik)",
        variantName: "Samarqand Zig'ir oshi bilan (2 porsiya)",
        modifiers: [{ name: "+2 dona Go'shtli Somsa", price: 24000 }],
        quantity: 1,
        unitPrice: 148000,
        totalPrice: 148000,
        ready: false
      },
      {
        id: "item-8",
        productId: "prod-des-1",
        name: "Yong'oqli Sharqona Paxlava",
        variantName: "",
        modifiers: [],
        quantity: 2,
        unitPrice: 18000,
        totalPrice: 36000,
        ready: false
      }
    ],
    subtotal: 184000,
    discount: 18400,
    serviceFee: 0,
    deliveryFee: 0,
    total: 165600
  },
  {
    id: "ord-105",
    queueNumber: "A-105",
    source: "uzum",
    orderType: "pickup",
    tableId: null,
    tableName: "Uzum Tezkor #9482",
    branchId: "branch-1",
    customerName: "Uzum Kuryer (Aziz)",
    customerPhone: "+998 99 888-77-66",
    address: "Agregatordan olib ketish",
    status: "cooking",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: new Date(now - 4 * 60000).toISOString(),
    updatedAt: new Date(now - 3 * 60000).toISOString(),
    cashierName: "Uzum API",
    note: "Kuryer 5 daqiqada yetib keladi",
    items: [
      {
        id: "item-9",
        productId: "prod-plov-5",
        name: "Shohona Assorti Osh (Super Kombo)",
        variantName: "1 Porsiya (Standart)",
        modifiers: [],
        quantity: 2,
        unitPrice: 62000,
        totalPrice: 124000,
        ready: false
      },
      {
        id: "item-10",
        productId: "prod-add-2",
        name: "Toshkent Norini (Qazi bilan)",
        variantName: "Quruq norin (300g)",
        modifiers: [],
        quantity: 1,
        unitPrice: 42000,
        totalPrice: 42000,
        ready: true
      }
    ],
    subtotal: 166000,
    discount: 0,
    serviceFee: 0,
    deliveryFee: 0,
    total: 166000
  },
  {
    id: "ord-100",
    queueNumber: "A-100",
    source: "pos",
    orderType: "pickup",
    tableId: null,
    tableName: "O'zi bilan (Kassa)",
    branchId: "branch-1",
    customerName: "Mijoz #100",
    customerPhone: "",
    address: "Kassadan olib ketish",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "cash",
    createdAt: new Date(now - 45 * 60000).toISOString(),
    updatedAt: new Date(now - 30 * 60000).toISOString(),
    cashierName: "Dilshod Kassir",
    note: "",
    items: [
      {
        id: "item-0",
        productId: "prod-plov-2",
        name: "Choyxona Palovi (Qovurma)",
        variantName: "1.5 Porsiya (Katta)",
        modifiers: [{ name: "Ot qazisi (1 bo'lak)", price: 14000 }],
        quantity: 2,
        unitPrice: 74000,
        totalPrice: 148000,
        ready: true
      }
    ],
    subtotal: 148000,
    discount: 0,
    serviceFee: 0,
    deliveryFee: 0,
    total: 148000
  }
];

const initialShift = {
  id: "shift-1",
  isOpen: true,
  openedAt: new Date(now - 4 * 3600000).toISOString(),
  cashierName: "Dilshod Rahimov (Katta Kassir)",
  branchName: "Markaziy Osh Markazi (Teleminora)",
  startingCash: 500000
};

module.exports = {
  initialConfig,
  initialBranches,
  initialStories,
  initialCategories,
  initialProducts,
  initialTables,
  initialPromos,
  initialOrders,
  initialShift,
  brandPresets
};
