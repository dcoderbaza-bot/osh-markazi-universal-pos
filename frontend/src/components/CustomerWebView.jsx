import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  Search,
  Flame,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Truck,
  Store,
  Utensils,
  Gift,
  ChevronRight,
  X,
  Receipt,
  Users,
  Calculator,
  ChefHat,
  Award,
  Calendar,
  Navigation,
  Thermometer,
  Timer,
  Check,
  ShieldCheck
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import ProductModifierModal from "./ProductModifierModal";
import ReceiptModal from "./ReceiptModal";

const INITIAL_KAZANS = [
  {
    id: "kazan-1",
    number: "1-Qozon",
    title: "Toshkent To'y Oshi",
    productId: "prod-plov-1",
    status: "ready",
    statusText: "Tayyor — 45 porsiya qoldi",
    portionsLeft: 45,
    maxPortions: 80,
    etaSeconds: 0,
    chef: "Usta Jamshid Oshpaz",
    temp: "94°C",
    highlightColor: "#D4AF37"
  },
  {
    id: "kazan-2",
    number: "2-Qozon",
    title: "Choyxona Oshi (Qovurma)",
    productId: "prod-plov-2",
    status: "steaming",
    statusText: "20 daqiqada suziladi",
    portionsLeft: 65,
    maxPortions: 65,
    etaSeconds: 20 * 60,
    chef: "Usta Mahmud Oshpaz",
    temp: "98°C",
    highlightColor: "#C85A32"
  },
  {
    id: "kazan-3",
    number: "3-Qozon",
    title: "Andijon Devzira Oshi",
    productId: "prod-plov-4",
    status: "ready",
    statusText: "Tayyor — 32 porsiya qoldi",
    portionsLeft: 32,
    maxPortions: 60,
    etaSeconds: 0,
    chef: "Usta Abdulla Oshpaz",
    temp: "92°C",
    highlightColor: "#008B8B"
  },
  {
    id: "kazan-4",
    number: "4-Qozon",
    title: "Samarqandcha Zig'ir Oshi",
    productId: "prod-plov-3",
    status: "steaming",
    statusText: "14 daqiqada suziladi",
    portionsLeft: 50,
    maxPortions: 50,
    etaSeconds: 14 * 60,
    chef: "Usta Anvar Samarqandiy",
    temp: "96°C",
    highlightColor: "#D4AF37"
  }
];

const SCROLLYTELLING_STEPS = [
  {
    id: "step-1",
    stepNum: "01",
    title: "Cho'yan Qozon va Dog'langan Yog'",
    subtitle: "210°C harorat va tabiiy dumba hamda zig'ir yog'i",
    duration: "05:30 — 06:15",
    temp: "210°C",
    badge: "1-BOSQICH • OLOV VA QOZON",
    description:
      "Asrlar davomida sinalgan 120 kilogrammlik quyma cho'yan qozon o'rik va tut o'tinida qizdiriladi. Qo'y dumba yog'i hamda 100% tabiiy zig'ir yog'i ko'kimtir tutun chiqqunga qadar dog'lanadi — bu oshning xushbo'y va yengil hazm bo'lishining ilk siridir.",
    secret: "Oshpaz siri: Yog'ga bir bosh archilgan piyoz va suyak tashlab qizartirilsa, yog'ning barcha taxirligi yo'qolib, oltin tusga kiradi.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "step-2",
    stepNum: "02",
    title: "Oltin Zirvak Qovurilishi",
    subtitle: "Barra qo'y go'shti, sariq sabzi va tog' zirasi uyg'unligi",
    duration: "06:15 — 07:30",
    temp: "145°C",
    badge: "2-BOSQICH • ZIRVAK SAN'ATI",
    description:
      "Katta bo'laklarda kesilgan barra qo'y va mol go'shti qizarguncha qovuriladi, so'ngra qo'lda somoncha to'g'ralgan shirin sariq sabzi, Surxondaryo tog' zirasi, zirk, shirin mayiz va oldindan ivitilgan Halima no'xat qo'shilib, past olovda 75 daqiqa miltillatib qaynatiladi.",
    secret: "Oshpaz siri: Zirvak qaynayotganda qozon o'rtasiga butun sarimsoq boshlari va achchiq qalampir qo'yiladi — ular yorilib ketmasligi shart.",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "step-3",
    stepNum: "03",
    title: "Lazer va Devzira Guruchi Damlanishi",
    subtitle: "Har bir guruch donasi marjondek dona-dona bo'lib pishadi",
    duration: "07:30 — 08:30",
    temp: "96°C",
    badge: "3-BOSQICH • MARJON GURUCH",
    description:
      "Iliq tuzli suvda 40 daqiqa ivitilgan Xorazm «Oltin Lazer» yoki 3 yillik «Uzgen Devzira» guruchi zirvak ustiga tekis qatlam qilib solinadi. Kapgir bilan faqat ustki qatlam ohista aylantirilib, guruch zirvak sharbatini to'liq shimib olgach, gumbaz shaklida yig'iladi va mis tog'ora bilan 45 daqiqa damga qo'yiladi.",
    secret: "Oshpaz siri: Dam berishdan oldin gumbazning 4 nuqtasidan cho'mich dastasi bilan tuynuk ochiladi — shunda bug' guruchni bir tekis pishiradi.",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "step-4",
    stepNum: "04",
    title: "Rishton Sopol Laganida Shohona Tortiq",
    subtitle: "Ot qazisi, kovatok do'lma va bedana tuxumi bilan bezatiladi",
    duration: "Issiq holda — 25 daqiqada",
    temp: "88°C",
    badge: "4-BOSQICH • DASTURXON KO'RKI",
    description:
      "Damdan ochilgan qaynoq osh Rishton ustalarining feruza naqshli sopol laganiga yoki 3 soat issiqlik saqlovchi maxsus termos-idishga suziladi. Ustiga parrak qilib kesilgan ot qazisi, yumshoq pay, kovatok do'lma va bedana tuxumlari terilib, achichuk salat hamda tandir patiri bilan tortiq etiladi.",
    secret: "Meros kafolati: Yetkazib berilganda oshingiz kamida 80°C issiq bo'lishiga 100% kafolat beramiz!",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=85"
  }
];

const PACKAGING_OPTIONS = [
  {
    id: "sopol_lagan",
    name: "Rishton Sopol Laganida",
    subtitle: "Naqshinkor sopol lagan o'ramda (6+ porsiyada lagan sovg'a!)",
    fee: 25000,
    freeMinSubtotal: 220000,
    icon: "🏺",
    heatRetention: "90 daqiqa issiq",
    badge: "SHOHONA TORTIQ 👑"
  },
  {
    id: "termos_idish",
    name: "Maxsus Germetik Termos-Idishda",
    subtitle: "Zanglamas po'lat vakuumli termos — uzoq masofaga 90°C saqlaydi",
    fee: 15000,
    freeMinSubtotal: 160000,
    icon: "🔥",
    heatRetention: "180 daqiqa qaynoq",
    badge: "3 SOAT ISSIQ 🌡️"
  },
  {
    id: "eco_box",
    name: "Folga Qoplamali EKO-Idish",
    subtitle: "Har bir porsiya alohida issiqlik saqlovchi kraft-bokslarda",
    fee: 0,
    freeMinSubtotal: 0,
    icon: "🥡",
    heatRetention: "45 daqiqa issiq",
    badge: "BEPUL STANDART ✨"
  }
];

export default function CustomerWebView({ onNavigateModule }) {
  const {
    config,
    branches,
    stories,
    categories,
    products,
    tables,
    promos,
    orders,
    loyaltyPoints,
    createOrder,
    showToast
  } = useStore();

  const [orderType, setOrderType] = useState("delivery"); // delivery | pickup | dine_in
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "branch-1");
  const [selectedTableId, setSelectedTableId] = useState("t-2");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyPopular, setOnlyPopular] = useState(false);

  // Packaging choice (Sopol laganda vs Termos-idishda vs Eco-box)
  const [packagingType, setPackagingType] = useState("sopol_lagan");

  // Live Kazan Tracker state with real-time ticking countdown
  const [kazans, setKazans] = useState(INITIAL_KAZANS);
  const [selectedKazanId, setSelectedKazanId] = useState("kazan-1");

  // Hot Delivery Guarantee Countdown Timer (24:59)
  const [deliveryTimerSec, setDeliveryTimerSec] = useState(24 * 60 + 45);

  useEffect(() => {
    const interval = setInterval(() => {
      setKazans((prev) =>
        prev.map((k) => {
          if (k.status === "steaming" && k.etaSeconds > 0) {
            const nextSec = k.etaSeconds - 1;
            const mins = Math.max(1, Math.ceil(nextSec / 60));
            return {
              ...k,
              etaSeconds: nextSec,
              statusText: `${mins} daqiqada suziladi`
            };
          }
          return k;
        })
      );
      setDeliveryTimerSec((prev) => (prev > 60 ? prev - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Aqlli "Osh Kalkulyatori" (Interactive Plov Builder) State
  const [guestCount, setGuestCount] = useState(8);
  const [calcPlovId, setCalcPlovId] = useState("prod-plov-1");
  const [calcRichness, setCalcRichness] = useState("shohona"); // standart | shohona | choyxona

  // Inline Toggle Modifiers per product card: { [productId]: ["mod-qazi", "mod-sarimsoq"] }
  const [inlineToggles, setInlineToggles] = useState({
    "prod-plov-1": ["mod-qazi", "mod-bedana"],
    "prod-plov-4": ["mod-sarimsoq", "mod-qalampir"],
    "prod-plov-3": ["mod-qazi", "mod-dolma"],
    "prod-plov-2": ["mod-qazi", "mod-sarimsoq"]
  });

  // Scrollytelling active stage
  const [activeStoryStep, setActiveStoryStep] = useState(0);

  // Table / VIP Room Reservation Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("+998 90 ");
  const [bookingGuests, setBookingGuests] = useState(8);
  const [bookingTime, setBookingTime] = useState("12:30 (Tushlik — Issiq Qozon)");
  const [bookingZone, setBookingZone] = useState("VIP Xona «Registon» (12 o'rinli)");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Modals & Drawers
  const [modifierProduct, setModifierProduct] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Cart State
  const [cart, setCart] = useState([
    {
      cartItemId: "init-1",
      productId: "prod-plov-1",
      name: "Toshkent To'y Oshi (Maxsus)",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=85",
      variantName: "1 Porsiya (Standart)",
      modifiers: [
        { id: "mod-qazi", name: "Qazi (Ot qazisi)", price: 14000 },
        { id: "mod-bedana", name: "Bedana tuxumi (2 dona)", price: 6000 }
      ],
      quantity: 2,
      unitPrice: 58000,
      totalPrice: 116000,
      note: ""
    }
  ]);

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 90 ");
  const [deliveryAddress, setDeliveryAddress] = useState("Toshkent sh., Yunusobod 4-mavze, 18-uy");
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("click");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [useBonus, setUseBonus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId) || branches[0],
    [branches, selectedBranchId]
  );

  const plovProducts = useMemo(
    () => products.filter((p) => p.categoryId === "plov"),
    [products]
  );

  // Filtered Products for Menu Grid
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.categoryId !== activeCategory) return false;
      if (onlyPopular && !p.isPopular && !p.isCombo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, activeCategory, onlyPopular, searchQuery]);

  // Smart Plov Calculator (Aqlli "Osh Kalkulyatori") Computation
  const plovCalculation = useMemo(() => {
    const selectedPlov =
      products.find((p) => p.id === calcPlovId) ||
      products.find((p) => p.categoryId === "plov") ||
      products[0];

    const guests = Math.max(1, Number(guestCount) || 1);
    const multiplier = calcRichness === "shohona" ? 1.15 : calcRichness === "choyxona" ? 1.25 : 1.0;

    const portionsCount = guests;
    const totalWeightKg = ((guests * 0.42 * multiplier)).toFixed(1);
    const qaziPieces = calcRichness === "standart" ? guests : Math.ceil(guests * 1.5);
    const qaziPlates = Math.max(1, Math.ceil(qaziPieces / 3)); // each plate has 3 slices
    const bedanaEggs = guests * 2;
    const bedanaPlates = Math.max(1, Math.ceil(bedanaEggs / 5));
    const dolmaCount = calcRichness === "standart" ? 0 : guests * 2;
    const dolmaPlates = dolmaCount > 0 ? Math.max(1, Math.ceil(dolmaCount / 5)) : 0;
    const achichukCount = Math.max(1, Math.ceil(guests / 2));
    const patirCount = Math.max(1, Math.ceil(guests / 3));
    const teaPots = Math.max(1, Math.ceil(guests / 4));
    const laganCount = Math.max(1, Math.ceil(guests / 4));

    const plovUnitPrice = selectedPlov?.price || 38000;
    const plovTotal = portionsCount * plovUnitPrice;
    const qaziTotal = qaziPlates * 38000;
    const bedanaTotal = bedanaPlates * 15000;
    const dolmaTotal = dolmaPlates * 18000;
    const achichukTotal = achichukCount * 14000;
    const patirTotal = patirCount * 10000;
    const teaTotal = teaPots * 10000;

    const rawBundleTotal =
      plovTotal + qaziTotal + bedanaTotal + dolmaTotal + achichukTotal + patirTotal + teaTotal;
    const bundleDiscount = guests >= 4 ? Math.round(rawBundleTotal * 0.1) : 0;
    const finalBundleTotal = rawBundleTotal - bundleDiscount;

    return {
      selectedPlov,
      guests,
      portionsCount,
      totalWeightKg,
      qaziPieces,
      qaziPlates,
      bedanaEggs,
      bedanaPlates,
      dolmaCount,
      dolmaPlates,
      achichukCount,
      patirCount,
      teaPots,
      laganCount,
      rawBundleTotal,
      bundleDiscount,
      finalBundleTotal,
      perPersonPrice: Math.round(finalBundleTotal / guests)
    };
  }, [guestCount, calcPlovId, calcRichness, products]);

  // Add item to Cart
  const handleAddToCart = (item, silent = false) => {
    setCart((prev) => {
      const modKey = (item.modifiers || []).map((m) => m.id || m.name).sort().join("|");
      const existingIdx = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.variantName === item.variantName &&
          (c.modifiers || []).map((m) => m.id || m.name).sort().join("|") === modKey &&
          c.note === item.note
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        const nextQty = copy[existingIdx].quantity + item.quantity;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: nextQty,
          totalPrice: copy[existingIdx].unitPrice * nextQty
        };
        return copy;
      }
      return [
        ...prev,
        {
          ...item,
          cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        }
      ];
    });
    if (!silent) {
      showToast(`"${item.name}" savatchaga qo'shildi!`);
    }
  };

  // One-click Add entire Plov Calculator Bundle to Cart
  const handleAddCalculatedPlovBundle = () => {
    sound.playCashRegister();
    const c = plovCalculation;
    if (!c.selectedPlov) return;

    // 1. Add Plov portions
    handleAddToCart(
      {
        productId: c.selectedPlov.id,
        name: `${c.selectedPlov.name} (${c.guests} kishilik ${c.laganCount} ta Lagan)`,
        image: c.selectedPlov.image,
        variantName: `${c.totalWeightKg} kg (${c.portionsCount} porsiya)`,
        modifiers: [],
        quantity: c.portionsCount,
        unitPrice: c.selectedPlov.price,
        totalPrice: c.portionsCount * c.selectedPlov.price,
        note: `Osh Kalkulyatori: ${c.guests} mehmon uchun`
      },
      true
    );

    // 2. Add Qazi
    handleAddToCart(
      {
        productId: "prod-add-1",
        name: `Ot Qazisi (${c.qaziPieces} bo'lak)`,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        variantName: "Osh ustiga kesilgan",
        modifiers: [],
        quantity: c.qaziPlates,
        unitPrice: 38000,
        totalPrice: c.qaziPlates * 38000,
        note: ""
      },
      true
    );

    // 3. Add Bedana Tuxumi
    handleAddToCart(
      {
        productId: "prod-add-3",
        name: `Bedana Tuxumi (${c.bedanaEggs} dona)`,
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
        variantName: "Osh ustiga",
        modifiers: [],
        quantity: c.bedanaPlates,
        unitPrice: 15000,
        totalPrice: c.bedanaPlates * 15000,
        note: ""
      },
      true
    );

    // 4. Add Do'lma if included
    if (c.dolmaPlates > 0) {
      handleAddToCart(
        {
          productId: "prod-add-2",
          name: `Kovatok Do'lma (${c.dolmaCount} dona)`,
          image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
          variantName: "Osh ustiga",
          modifiers: [],
          quantity: c.dolmaPlates,
          unitPrice: 18000,
          totalPrice: c.dolmaPlates * 18000,
          note: ""
        },
        true
      );
    }

    // 5. Add Achichuk Salad
    handleAddToCart(
      {
        productId: "prod-sal-1",
        name: "Achichuk Salat (Shakarob)",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        variantName: "Yangi to'g'ralgan",
        modifiers: [],
        quantity: c.achichukCount,
        unitPrice: 14000,
        totalPrice: c.achichukCount * 14000,
        note: ""
      },
      true
    );

    // 6. Add Patir Non
    handleAddToCart(
      {
        productId: "prod-brd-2",
        name: "Kunjutli Tandir Patir Non",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        variantName: "Issiq tandirdan",
        modifiers: [],
        quantity: c.patirCount,
        unitPrice: 10000,
        totalPrice: c.patirCount * 10000,
        note: ""
      },
      true
    );

    // 7. Add Tea
    handleAddToCart(
      {
        productId: "prod-drk-1",
        name: "Toshkent Limonli Choyi",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        variantName: "Novvot va limon bilan",
        modifiers: [],
        quantity: c.teaPots,
        unitPrice: 10000,
        totalPrice: c.teaPots * 10000,
        note: ""
      },
      true
    );

    if (c.guests >= 6) {
      setPackagingType("sopol_lagan");
    }

    showToast(
      `👑 ${c.guests} mehmonlik shohona osh to'plami (${c.totalWeightKg} kg osh + qazi + achichuk + patir + choy) savatchaga qo'shildi!`
    );
    setIsCartOpen(true);
  };

  // Toggle inline topping on a product card
  const handleToggleInlineModifier = (productId, modId) => {
    sound.playPosTap();
    setInlineToggles((prev) => {
      const current = prev[productId] || [];
      const exists = current.includes(modId);
      return {
        ...prev,
        [productId]: exists ? current.filter((id) => id !== modId) : [...current, modId]
      };
    });
  };

  // Add product directly from card with its inline toggled toppings
  const handleQuickAddCardWithToggles = (product) => {
    if (!product.inStock) {
      showToast("Kechirasiz, ushbu taom vaqtincha tugagan", "error");
      return;
    }
    sound.playPosTap();
    const selectedModIds = inlineToggles[product.id] || [];
    const selectedMods = (product.modifiers || []).filter((m) => selectedModIds.includes(m.id));
    const modsSum = selectedMods.reduce((s, m) => s + (Number(m.price) || 0), 0);
    const unitPrice = product.price + modsSum;

    handleAddToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      variantName: product.variants?.[1]?.name || product.variants?.[0]?.name || "1 Porsiya",
      modifiers: selectedMods,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      note: ""
    });
  };

  const updateCartQty = (cartItemId, delta) => {
    sound.playPosTap();
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.cartItemId !== cartItemId) return c;
          const nextQty = c.quantity + delta;
          if (nextQty <= 0) return null;
          return { ...c, quantity: nextQty, totalPrice: c.unitPrice * nextQty };
        })
        .filter(Boolean)
    );
  };

  // Cart Calculations
  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + c.totalPrice, 0), [cart]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round((subtotal * appliedPromo.discountPercent) / 100);
  }, [subtotal, appliedPromo]);

  const bonusDiscount = useMemo(() => {
    if (!useBonus || loyaltyPoints <= 0) return 0;
    const maxAllowed = Math.max(0, subtotal - promoDiscount);
    return Math.min(loyaltyPoints, maxAllowed, 30000);
  }, [useBonus, loyaltyPoints, subtotal, promoDiscount]);

  const totalDiscount = promoDiscount + bonusDiscount;

  const selectedPackagingObj = useMemo(
    () => PACKAGING_OPTIONS.find((p) => p.id === packagingType) || PACKAGING_OPTIONS[0],
    [packagingType]
  );

  const packagingFee = useMemo(() => {
    if (orderType === "dine_in") return 0;
    if (
      selectedPackagingObj.freeMinSubtotal > 0 &&
      subtotal >= selectedPackagingObj.freeMinSubtotal
    ) {
      return 0;
    }
    return selectedPackagingObj.fee;
  }, [orderType, selectedPackagingObj, subtotal]);

  const deliveryFee = useMemo(() => {
    if (orderType !== "delivery") return 0;
    if (subtotal >= (config.freeDeliveryMin || 150000)) return 0;
    return Number(config.deliveryFee) || 15000;
  }, [orderType, subtotal, config]);

  const serviceFee = useMemo(() => {
    if (orderType !== "dine_in") return 0;
    return Math.round((subtotal * (Number(config.serviceChargePercent) || 10)) / 100);
  }, [orderType, subtotal, config]);

  const grandTotal = Math.max(
    0,
    subtotal - totalDiscount + deliveryFee + serviceFee + packagingFee
  );
  const totalItemsCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = promos.find((p) => p.code.toUpperCase() === code);
    if (!found) {
      showToast("Bunday promokod topilmadi (Masalan: OSH20, MEROS, FEEDUP)", "error");
      return;
    }
    if (subtotal < found.minOrder) {
      showToast(`Kamida ${formatMoney(found.minOrder)} xarid qiling`, "error");
      return;
    }
    setAppliedPromo(found);
    sound.playCashRegister();
    showToast(`${found.code} promokodi qo'llandi (-${found.discountPercent}%)!`);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const packLabel =
      orderType !== "dine_in" ? ` [${selectedPackagingObj.name}]` : "";

    const payload = {
      source: orderType === "dine_in" ? "qr_table" : "web",
      orderType,
      branchId: selectedBranchId,
      tableId: orderType === "dine_in" ? selectedTableId : null,
      tableName:
        orderType === "dine_in"
          ? selectedTable?.number || "Zal Stoli"
          : orderType === "delivery"
          ? `Yetkazib berish • ${selectedPackagingObj.name}`
          : `Olib ketish • ${selectedPackagingObj.name}`,
      customerName: customerName.trim() || "Aziz Mehmon",
      customerPhone: customerPhone.trim() || "+998 90 000-00-00",
      address:
        orderType === "delivery"
          ? `${deliveryAddress}${packLabel}`
          : orderType === "dine_in"
          ? selectedTable?.number
          : `${selectedBranch?.address}${packLabel}`,
      paymentMethod,
      paymentStatus: "paid",
      note: `${selectedPackagingObj.name}. ${orderNote.trim()}`.trim(),
      promoCode: appliedPromo?.code || "",
      usedBonus: bonusDiscount,
      items: cart,
      subtotal,
      discount: totalDiscount,
      serviceFee: serviceFee + packagingFee,
      deliveryFee,
      total: grandTotal
    };

    const created = await createOrder(payload);
    setIsSubmitting(false);
    setCart([]);
    setAppliedPromo(null);
    setUseBonus(false);
    setIsCartOpen(false);
    setIsTrackerOpen(true);
    setReceiptOrder(created);
  };

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    sound.playCashRegister();
    const code = `BRON-${Math.floor(100 + Math.random() * 900)}`;
    setBookingSuccess({
      code,
      name: bookingName || "Aziz Mehmon",
      phone: bookingPhone,
      guests: bookingGuests,
      time: bookingTime,
      zone: bookingZone,
      branch: selectedBranch?.name
    });
    showToast(`Joy muvaffaqiyatli band qilindi! Bron kodi: ${code}`);
  };

  const activeCustomerOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").slice(0, 6),
    [orders]
  );

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-stone-100 pb-28 lagan-pattern-bg">
      {/* Sticky Sub-Header: Order Mode, Packaging Choice, Live Delivery Timer & Cart */}
      <div className="bg-[#141414]/95 backdrop-blur-xl border-b border-[#D4AF37]/20 sticky top-[60px] z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Order Type Switcher */}
          <div className="inline-flex bg-[#0F0F0F] p-1 rounded-2xl border border-[#D4AF37]/25">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("delivery");
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "delivery"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Issiq Yetkazish</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("pickup");
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "pickup"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Olib ketish</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("dine_in");
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "dine_in"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Zaldan (QR-Stol)</span>
            </button>
          </div>

          {/* Packaging Selector Pill (Sopol Lagan vs Termos-Idish) */}
          {orderType !== "dine_in" && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#0F0F0F] px-2.5 py-1 rounded-xl border border-[#008B8B]/40">
              <span className="text-[11px] text-[#2DD4BF] font-bold">Idish:</span>
              {PACKAGING_OPTIONS.map((pk) => (
                <button
                  key={pk.id}
                  type="button"
                  onClick={() => {
                    sound.playPosTap();
                    setPackagingType(pk.id);
                    showToast(`Yetkazish usuli: ${pk.name}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    packagingType === pk.id
                      ? "bg-[#008B8B] text-white"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {pk.icon} {pk.name.split(" ")[0]} {pk.name.split(" ")[1]}
                </button>
              ))}
            </div>
          )}

          {/* Right Quick Actions: Hot Delivery Timer, Order Tracker & Cart */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#C85A32]/15 border border-[#C85A32]/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Timer className="w-3.5 h-3.5 text-[#C85A32] animate-pulse" />
              <span>Issiq yetkazish:</span>
              <span className="font-mono font-black text-[#D4AF37]">
                {formatTimer(deliveryTimerSec)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1F1F] border border-[#D4AF37]/30 text-stone-200 text-xs font-bold hover:border-[#D4AF37] transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Buyurtma holati</span>
              <span className="bg-[#008B8B] text-white font-black px-1.5 py-0.5 rounded text-[10px]">
                {activeCustomerOrders[0]?.queueNumber || "JONLI"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C85A32] to-[#D4AF37] text-[#0F0F0F] text-xs font-black shadow-lg hover:brightness-110 transition cursor-pointer gold-glow"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{formatMoney(grandTotal, config.currency)}</span>
              <span className="bg-[#0F0F0F] text-[#D4AF37] px-2 py-0.5 rounded-full text-[11px]">
                {totalItemsCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 space-y-14">
        {/* =====================================================================
            1. HERO SECTION + "JONLI QOZON" STATUSI (LIVE KAZAN TRACKER)
           ===================================================================== */}
        <section
          id="jonli-qozon"
          className="relative rounded-[32px] overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-br from-[#161311] via-[#0F0F0F] to-[#1A1410] shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
        >
          {/* Background Steaming To'y Oshi Visual + Oriental Vignette */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1800&q=85"
              alt="Toshkent To'y Oshi"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/85 to-[#0F0F0F]/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-[#0F0F0F]/60" />
          </div>

          {/* Animated Rising Steam ("Bug'" effekti) Layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="steam-wisp-1 absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-gradient-to-t from-amber-100/15 via-white/10 to-transparent blur-3xl" />
            <div className="steam-wisp-2 absolute bottom-16 left-1/2 w-96 h-96 rounded-full bg-gradient-to-t from-[#D4AF37]/15 via-stone-200/10 to-transparent blur-3xl" />
            <div className="steam-wisp-3 absolute bottom-8 right-1/4 w-80 h-80 rounded-full bg-gradient-to-t from-[#C85A32]/15 via-white/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heritage Hero Headline & Steaming Showcase */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 bg-[#1A1815]/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-[#D4AF37]/40 text-[#D4AF37]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>PREMIUM HERITAGE • TOSHKENT OSH MARKAZI</span>
                <span className="text-stone-500">|</span>
                <span className="text-[#2DD4BF]">100% Xorazm Lazer & Uzgen Devzira</span>
              </div>

              <h1 className="font-serif-heritage text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Qozondan Yangi Uzilgan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C85A32]">
                  Shohona O'zbek Oshi
                </span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                O'rik o'tinida qizigan quyma cho'yan qozonlar, Xorazmning oltin Lazer guruchi,
                qarsildoq ot qazisi va Rishton ustalarining feruza sopol laganlarida{" "}
                <strong className="text-[#D4AF37]">25 daqiqada bug'i bilan</strong> dasturxoningizda.
              </p>

              {/* Featured Steaming Kazan Visual Preview Card */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-[#141414]/90 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 shadow-2xl">
                <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=85"
                    alt="Bug'i chiqayotgan Toshkent To'y Oshi"
                    className="w-full h-full object-cover"
                  />
                  <div className="steam-wisp-1 absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/30 to-transparent blur-xl pointer-events-none" />
                  <span className="absolute top-2 left-2 bg-[#0F0F0F]/85 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#C85A32]" /> 94°C ISSIQ BUG'
                  </span>
                </div>
                <div className="flex-1 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2DD4BF]">
                      Ayni damda 1-Qozondan suzilmoqda
                    </span>
                    <span className="text-xs font-black text-[#D4AF37]">38 000 so'm / porsiya</span>
                  </div>
                  <h3 className="font-serif-heritage text-lg font-bold text-white">
                    Toshkent To'y Oshi — Ot Qazisi va Bedana Tuxumi bilan
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href="#osh-kalkulyatori"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] text-xs font-black shadow-md hover:brightness-110 transition flex items-center gap-1.5"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Mehmonlar uchun hisoblash</span>
                    </a>
                    <a
                      href="#interaktiv-menyu"
                      className="px-4 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-stone-100 border border-[#D4AF37]/30 text-xs font-bold transition"
                    >
                      Kompleks yig'ish →
                    </a>
                  </div>
                </div>
              </div>

              {/* Heritage Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="bg-[#161616]/90 border border-[#D4AF37]/20 rounded-2xl p-3">
                  <div className="text-[11px] text-stone-400">Issiq yetkazish</div>
                  <div className="text-sm sm:text-base font-black text-[#D4AF37] mt-0.5">
                    ⚡ 25 daqiqa (88°C+)
                  </div>
                </div>
                <div className="bg-[#161616]/90 border border-[#008B8B]/30 rounded-2xl p-3">
                  <div className="text-[11px] text-stone-400">Tortiq usuli</div>
                  <div className="text-sm sm:text-base font-black text-[#2DD4BF] mt-0.5">
                    🏺 Sopol Lagan / Termos
                  </div>
                </div>
                <div className="bg-[#161616]/90 border border-[#C85A32]/30 rounded-2xl p-3">
                  <div className="text-[11px] text-stone-400">Soliq.uz QR</div>
                  <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                    🏛️ 1% Fiskal + 5% Bonus
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: "JONLI QOZON" (LIVE KAZAN TRACKER) WIDGET */}
            <div className="lg:col-span-5 bg-[#121212]/95 backdrop-blur-xl border-2 border-[#D4AF37]/45 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(212,175,55,0.12)] space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-cinzel text-sm font-black uppercase tracking-wider text-[#D4AF37]">
                      Jonli Qozon Statusi
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Oshxonadagi 4 ta cho'yan qozonning real vaqtdagi holati
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#C85A32]/20 border border-[#C85A32]/50 text-[#FDBA74] text-[10px] font-black flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> JONLI EFIR
                </span>
              </div>

              {/* 4 Live Kazans List */}
              <div className="space-y-3">
                {kazans.map((k) => {
                  const isReady = k.status === "ready";
                  const pct = Math.round((k.portionsLeft / k.maxPortions) * 100);
                  const active = selectedKazanId === k.id;
                  return (
                    <div
                      key={k.id}
                      onClick={() => setSelectedKazanId(k.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                        active
                          ? "bg-[#1C1915] border-[#D4AF37]"
                          : "bg-[#161616] border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                              {k.number}
                            </span>
                            <h4 className="font-bold text-sm text-white">{k.title}</h4>
                          </div>
                          <div className="text-xs font-extrabold mt-1.5 flex items-center gap-1.5">
                            {isReady ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                ● {k.number} ({k.title.split(" ")[0]} oshi):{" "}
                                <strong className="underline">
                                  Tayyor — {k.portionsLeft} porsiya qoldi
                                </strong>
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center gap-1">
                                ⏳ {k.number} ({k.title.split(" ")[0]} oshi):{" "}
                                <strong>{k.statusText}</strong> ({formatTimer(k.etaSeconds)})
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const prod =
                              products.find((p) => p.id === k.productId) || products[0];
                            if (prod) {
                              sound.playPosTap();
                              handleAddToCart({
                                productId: prod.id,
                                name: `${prod.name} (${k.number})`,
                                image: prod.image,
                                variantName: "1 Porsiya (Standart)",
                                modifiers: [],
                                quantity: 1,
                                unitPrice: prod.price,
                                totalPrice: prod.price,
                                note: `${k.number}dan issiq suzilsin`
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition cursor-pointer ${
                            isReady
                              ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] hover:brightness-110"
                              : "bg-[#008B8B]/25 text-[#2DD4BF] border border-[#008B8B]/50 hover:bg-[#008B8B]/40"
                          }`}
                        >
                          {isReady ? "+ Suzish" : "Band qilish"}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isReady ? "#10B981" : "#D4AF37"
                            }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 font-semibold">
                          👨‍🍳 {k.chef} • {k.temp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Hall Queue Mini Footer */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400">Zal navbati:</span>
                  {orders
                    .filter((o) => o.status === "ready")
                    .slice(0, 3)
                    .map((o) => (
                      <span
                        key={o.id}
                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black px-2 py-0.5 rounded text-[11px]"
                      >
                        {o.queueNumber} ✓
                      </span>
                    ))}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateModule && onNavigateModule("queue")}
                  className="text-[#D4AF37] hover:underline font-bold cursor-pointer"
                >
                  TV Ekran →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. AQLLI "OSH KALKULYATORI" (INTERACTIVE PLOV BUILDER)
           ===================================================================== */}
        <section
          id="osh-kalkulyatori"
          className="rounded-[32px] border-2 border-[#D4AF37]/40 bg-gradient-to-br from-[#171411] via-[#121212] to-[#141A1A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-extrabold mb-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>AQLLI OSH KALKULYATORI • INTERACTIVE PLOV BUILDER</span>
              </div>
              <h2 className="font-serif-heritage text-2xl sm:text-4xl font-black text-white">
                Mehmonlar Sonini Kiriting — Dasturxonni O'zimiz Hisoblaymiz
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Necha kishi bo'lishingizni tanlang: tizim avtomatik ravishda necha kg osh, necha bo'lak
                qazi, bedana tuxumi, achichuk, patir non va choy kerakligini hisoblab beradi.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0F0F0F] px-4 py-3 rounded-2xl border border-[#008B8B]/50 shrink-0">
              <span className="text-2xl">🏺</span>
              <div>
                <div className="text-[11px] font-bold text-[#2DD4BF] uppercase">Maxsus aksiya</div>
                <div className="text-xs font-extrabold text-white">
                  4+ kishilik to'plamga <span className="text-[#D4AF37]">-10% chegirma</span> + Sopol Lagan!
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Controls: Guest Count, Plov Type & Dasturxon Style */}
            <div className="lg:col-span-6 space-y-6 bg-[#0F0F0F]/80 p-5 sm:p-6 rounded-3xl border border-stone-800">
              {/* Step 1: Guest Count Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>1. Mehmonlar soni:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPosTap();
                        setGuestCount((g) => Math.max(1, g - 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-[#1F1F1F] hover:bg-stone-700 text-white font-black flex items-center justify-center border border-stone-700 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-serif-heritage text-2xl sm:text-3xl font-black text-[#D4AF37] min-w-[95px] text-center">
                      {guestCount} kishi
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPosTap();
                        setGuestCount((g) => Math.min(50, g + 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-[#D4AF37] hover:brightness-110 text-[#0F0F0F] font-black flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer h-2 bg-stone-800 rounded-lg"
                />

                {/* Quick Guest Presets */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {[2, 4, 8, 12, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        sound.playPosTap();
                        setGuestCount(num);
                      }}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        guestCount === num
                          ? "bg-[#D4AF37] text-[#0F0F0F] border-[#D4AF37] shadow-md"
                          : "bg-[#161616] text-stone-300 border-stone-800 hover:border-[#D4AF37]/50"
                      }`}
                    >
                      {num} kishi
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Plov Type */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-300 mb-2.5">
                  2. Qaysi osh turini tanlaysiz?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plovProducts.map((plov) => {
                    const active = calcPlovId === plov.id;
                    return (
                      <button
                        key={plov.id}
                        type="button"
                        onClick={() => {
                          sound.playPosTap();
                          setCalcPlovId(plov.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                          active
                            ? "bg-[#1F1A12] border-[#D4AF37] text-white shadow-md"
                            : "bg-[#161616] border-stone-800 text-stone-300 hover:border-stone-700"
                        }`}
                      >
                        <img
                          src={plov.image}
                          alt={plov.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#D4AF37]/30"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">{plov.name}</div>
                          <div className="text-[11px] text-[#D4AF37] font-extrabold mt-0.5">
                            {formatMoney(plov.price, config.currency)} / porsiya
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Dasturxon Richness Level */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-300 mb-2.5">
                  3. Dasturxon to'kinligi darajasi:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "standart", label: "Klassik", desc: "1x Qazi + Tuxum" },
                    { id: "shohona", label: "Shohona 👑", desc: "1.5x Qazi + Do'lma" },
                    { id: "choyxona", label: "Ulfatlar 🔥", desc: "Katta porsiya + Qo'shimcha" }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        sound.playPosTap();
                        setCalcRichness(tier.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        calcRichness === tier.id
                          ? "bg-[#008B8B]/25 border-[#2DD4BF] text-white"
                          : "bg-[#161616] border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <div className="text-xs font-black">{tier.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Output: Calculated Breakdown & 1-Click Add to Cart */}
            <div className="lg:col-span-6 bg-gradient-to-b from-[#1C1813] to-[#121212] p-5 sm:p-6 rounded-3xl border border-[#D4AF37]/40 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                      Tavsiya etilgan me'yor ({plovCalculation.guests} kishi uchun)
                    </span>
                    <h3 className="font-serif-heritage text-xl font-black text-white mt-0.5">
                      {plovCalculation.selectedPlov?.name} To'plami
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-black">
                    🏺 {plovCalculation.laganCount} ta Sopol Lagan
                  </span>
                </div>

                {/* Calculated Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-[#0F0F0F]/90 border border-[#D4AF37]/30 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🍛 Issiq Osh</div>
                    <div className="text-base font-black text-[#D4AF37] mt-0.5">
                      {plovCalculation.totalWeightKg} kg
                    </div>
                    <div className="text-[11px] text-stone-400">
                      ({plovCalculation.portionsCount} porsiya)
                    </div>
                  </div>

                  <div className="bg-[#0F0F0F]/90 border border-stone-800 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🥩 Ot Qazisi</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {plovCalculation.qaziPieces} bo'lak
                    </div>
                    <div className="text-[11px] text-stone-400">
                      ({plovCalculation.qaziPlates} porsiya)
                    </div>
                  </div>

                  <div className="bg-[#0F0F0F]/90 border border-stone-800 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🥚 Bedana tuxumi</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {plovCalculation.bedanaEggs} dona
                    </div>
                    <div className="text-[11px] text-stone-400">Tozalangan</div>
                  </div>

                  <div className="bg-[#0F0F0F]/90 border border-stone-800 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🥗 Achichuk salat</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {plovCalculation.achichukCount} tarelka
                    </div>
                    <div className="text-[11px] text-stone-400">Shakarob + rayhon</div>
                  </div>

                  <div className="bg-[#0F0F0F]/90 border border-stone-800 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🫓 Tandir Patir</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {plovCalculation.patirCount} ta butun
                    </div>
                    <div className="text-[11px] text-stone-400">Kunjutli issiq patir</div>
                  </div>

                  <div className="bg-[#0F0F0F]/90 border border-stone-800 rounded-2xl p-3">
                    <div className="text-xs text-stone-400">🫖 Limonli Choy</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {plovCalculation.teaPots} choynak
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {plovCalculation.dolmaCount > 0
                        ? `+ ${plovCalculation.dolmaCount} dona Do'lma`
                        : "Novvot bilan"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary & One-Click Add Button */}
              <div className="pt-4 border-t border-stone-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-stone-400">
                      Har bir mehmon uchun o'rtacha:{" "}
                      <strong className="text-[#2DD4BF]">
                        {formatMoney(plovCalculation.perPersonPrice, config.currency)}
                      </strong>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-serif-heritage text-2xl sm:text-3xl font-black text-[#D4AF37]">
                        {formatMoney(plovCalculation.finalBundleTotal, config.currency)}
                      </span>
                      {plovCalculation.bundleDiscount > 0 && (
                        <span className="text-xs text-stone-500 line-through">
                          {formatMoney(plovCalculation.rawBundleTotal, config.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {plovCalculation.bundleDiscount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      Tejaldi: {formatMoney(plovCalculation.bundleDiscount, config.currency)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddCalculatedPlovBundle}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C85A32] to-[#D4AF37] text-[#0F0F0F] font-black text-sm sm:text-base shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer gold-glow"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Bir tugma bilan savatchaga qo'shish ({plovCalculation.guests} kishilik to'plam)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            3. INTERAKTIV MENYU (KOMPLEKS YIG'ISH — INLINE TOGGLE TOPPINGS)
           ===================================================================== */}
        <section id="interaktiv-menyu" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2DD4BF] mb-1">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>INTERAKTIV MENYU • KOMPLEKS YIG'ISH</span>
              </div>
              <h2 className="font-serif-heritage text-2xl sm:text-4xl font-black text-white">
                Osh Turlari va Shohona Taomlar
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Har bir osh kartochkasining o'zida ustiga{" "}
                <strong className="text-[#D4AF37]">
                  Qazi, Do'lma, Sarimsoq, Achchiq qalampir, Bedana tuxumi
                </strong>{" "}
                qo'shish tugmalarini yoqing yoki o'chiring!
              </p>
            </div>

            {/* Search & Popular Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To'y oshi, Devzira, Zig'ir, Qazi..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#161616] border border-stone-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="button"
                onClick={() => setOnlyPopular((v) => !v)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  onlyPopular
                    ? "bg-[#D4AF37] text-[#0F0F0F] border-[#D4AF37]"
                    : "bg-[#161616] text-stone-300 border-stone-800 hover:border-stone-700"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Xit taomlar</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setActiveCategory("all");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-md"
                  : "bg-[#161616] text-stone-300 border border-stone-800 hover:border-[#D4AF37]/40"
              }`}
            >
              🍽️ Barchasi ({products.length})
            </button>
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playPosTap();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-md"
                      : "bg-[#161616] text-stone-300 border border-stone-800 hover:border-[#D4AF37]/40"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const hasInlineMods = product.modifiers && product.modifiers.length > 0;
              const activeModIds = inlineToggles[product.id] || [];
              const activeModsSum = (product.modifiers || [])
                .filter((m) => activeModIds.includes(m.id))
                .reduce((s, m) => s + (Number(m.price) || 0), 0);
              const liveCardPrice = product.price + activeModsSum;

              return (
                <div
                  key={product.id}
                  className={`group bg-[#161616] rounded-3xl border border-stone-800 hover:border-[#D4AF37]/60 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    !product.inStock ? "opacity-60 grayscale" : "hover:-translate-y-1"
                  }`}
                >
                  <div>
                    {/* Food-Porn Image Header */}
                    <div
                      onClick={() => setModifierProduct(product)}
                      className="relative h-56 bg-[#0F0F0F] overflow-hidden cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-black/30" />

                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-[#0F0F0F]/90 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                          {product.badge}
                        </span>
                      )}

                      {product.regionTag && (
                        <span className="absolute top-3 right-3 bg-[#008B8B]/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {product.regionTag}
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          ⚖️ {product.weight} {product.riceType ? `• ${product.riceType}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => setModifierProduct(product)}
                          className="font-serif-heritage font-bold text-lg text-white group-hover:text-[#D4AF37] transition cursor-pointer"
                        >
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* INLINE INTERACTIVE TOGGLE TOPPINGS (Qazi, Do'lma, Sarimsoq, Achchiq qalampir, Bedana) */}
                      {hasInlineMods && (
                        <div className="pt-2 border-t border-stone-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                              Ustiga qo'shimchalar (Toggle):
                            </span>
                            <button
                              type="button"
                              onClick={() => setModifierProduct(product)}
                              className="text-[11px] text-[#2DD4BF] hover:underline font-bold cursor-pointer"
                            >
                              Porsiya tanlash →
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {product.modifiers.map((mod) => {
                              const isSelected = activeModIds.includes(mod.id);
                              return (
                                <button
                                  key={mod.id}
                                  type="button"
                                  onClick={() => handleToggleInlineModifier(product.id, mod.id)}
                                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                    isSelected
                                      ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-sm"
                                      : "bg-[#0F0F0F] border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200"
                                  }`}
                                >
                                  <span>{mod.icon || "✨"}</span>
                                  <span>{mod.shortName || mod.name}</span>
                                  <span className="text-[10px] opacity-80">
                                    +{mod.price / 1000}k
                                  </span>
                                  {isSelected && <Check className="w-3 h-3 text-[#D4AF37]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Dynamic Price + Add to Cart */}
                  <div className="px-5 pb-5 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                    <div>
                      {activeModsSum > 0 ? (
                        <div className="text-[10px] text-[#2DD4BF] font-bold">
                          Asosiy: {formatMoney(product.price)} + Qo'shimcha:{" "}
                          {formatMoney(activeModsSum)}
                        </div>
                      ) : (
                        product.oldPrice && (
                          <div className="text-[11px] text-stone-500 line-through">
                            {formatMoney(product.oldPrice, config.currency)}
                          </div>
                        )
                      )}
                      <div className="font-serif-heritage text-xl font-black text-[#D4AF37]">
                        {formatMoney(liveCardPrice, config.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAddCardWithToggles(product)}
                        disabled={!product.inStock}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] text-xs font-black flex items-center gap-1.5 shadow-lg hover:brightness-110 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Savatga qo'shish</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            4. OSHPAZLAR VA SIRI (SCROLLYTELLING INTERACTIVE TIMELINE)
           ===================================================================== */}
        <section
          id="oshpazlar-siri"
          className="rounded-[32px] border border-[#D4AF37]/30 bg-gradient-to-br from-[#141210] via-[#0F0F0F] to-[#17130F] p-6 sm:p-10 shadow-2xl space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C85A32] mb-1">
                <ChefHat className="w-4 h-4 text-[#D4AF37]" />
                <span>OSHPAZLAR VA SIRI • SCROLLYTELLING TIMELINE</span>
              </div>
              <h2 className="font-serif-heritage text-2xl sm:text-4xl font-black text-white">
                Cho'yan Qozondan Sopol Lagangacha — 4 Muqaddas Bosqich
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Har kuni tonggi soat 05:30 da boshlanadigan haqiqiy Toshkent va Farg'ona oshpazlik
                maktabi sirlari bilan tanishing.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#161616] px-4 py-2.5 rounded-2xl border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37]">
              <Award className="w-4 h-4" />
              <span>Bosh Oshpaz: Usta Jamshid (32 yillik tajriba)</span>
            </div>
          </div>

          {/* Interactive Timeline Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCROLLYTELLING_STEPS.map((st, idx) => {
              const active = activeStoryStep === idx;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    sound.playPosTap();
                    setActiveStoryStep(idx);
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                    active
                      ? "bg-gradient-to-br from-[#231D14] to-[#161616] border-[#D4AF37] shadow-lg"
                      : "bg-[#161616]/70 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-cinzel text-2xl font-black text-[#D4AF37]">
                      {st.stepNum}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#C85A32]/20 text-[#FDBA74] border border-[#C85A32]/40">
                      🌡️ {st.temp}
                    </span>
                  </div>
                  <div className="font-serif-heritage font-bold text-sm text-white">
                    {st.title}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">🕒 {st.duration}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive Showcase */}
          {SCROLLYTELLING_STEPS[activeStoryStep] && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#161616] rounded-3xl p-5 sm:p-8 border border-[#D4AF37]/30">
              <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#D4AF37]/30">
                <img
                  src={SCROLLYTELLING_STEPS[activeStoryStep].image}
                  alt={SCROLLYTELLING_STEPS[activeStoryStep].title}
                  className="w-full h-full object-cover"
                />
                <div className="steam-wisp-1 absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/25 to-transparent blur-2xl pointer-events-none" />
                <span className="absolute top-3 left-3 bg-[#0F0F0F]/90 text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-black px-3 py-1 rounded-full">
                  {SCROLLYTELLING_STEPS[activeStoryStep].badge}
                </span>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#2DD4BF]">
                  <span>⏱️ Vaqti: {SCROLLYTELLING_STEPS[activeStoryStep].duration}</span>
                  <span>•</span>
                  <span>🔥 Qozon harorati: {SCROLLYTELLING_STEPS[activeStoryStep].temp}</span>
                </div>

                <h3 className="font-serif-heritage text-2xl sm:text-3xl font-black text-white">
                  {SCROLLYTELLING_STEPS[activeStoryStep].title}
                </h3>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  {SCROLLYTELLING_STEPS[activeStoryStep].description}
                </p>

                <div className="p-4 rounded-2xl bg-[#0F0F0F] border-l-4 border-[#D4AF37] text-xs sm:text-sm text-amber-100">
                  💡 <strong>{SCROLLYTELLING_STEPS[activeStoryStep].secret}</strong>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {SCROLLYTELLING_STEPS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveStoryStep(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeStoryStep === idx ? "w-8 bg-[#D4AF37]" : "w-2 bg-stone-700"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStoryStep((s) => (s + 1) % SCROLLYTELLING_STEPS.length)
                    }
                    className="text-xs font-extrabold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Keyingi bosqich</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================================
            5. TEZKOR BUYURTMA, SOPOL LAGAN / TERMOS TANLOVI, JOY BAND QILISH VA FILIAL XARITASI
           ===================================================================== */}
        <section id="filiallar-bron" className="space-y-8">
          {/* Packaging Comparison Banner (Sopol Lagan vs Termos-idish) */}
          <div className="rounded-3xl border border-[#008B8B]/45 bg-gradient-to-r from-[#101C1C] via-[#141414] to-[#1C1510] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2DD4BF]">
                  ISSIQ YETKAZIB BERISH TEXNOLOGIYASI
                </span>
                <h2 className="font-serif-heritage text-2xl sm:text-3xl font-black text-white mt-1">
                  Oshni Sopol Laganda Yoki Maxsus Termos-Idishda Qabul Qiling
                </h2>
              </div>
              <div className="bg-[#0F0F0F] px-4 py-2.5 rounded-2xl border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37]">
                🔥 Kafolat: Oshingiz 85°C dan past bo'lsa — buyurtma bepul!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGING_OPTIONS.map((pk) => {
                const active = packagingType === pk.id;
                return (
                  <div
                    key={pk.id}
                    onClick={() => {
                      sound.playPosTap();
                      setPackagingType(pk.id);
                      showToast(`Tanlandi: ${pk.name}`);
                    }}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      active
                        ? "bg-[#1C1914] border-[#D4AF37] shadow-xl"
                        : "bg-[#141414] border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{pk.icon}</span>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                          {pk.badge}
                        </span>
                      </div>
                      <h3 className="font-serif-heritage font-bold text-lg text-white">
                        {pk.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">{pk.subtitle}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2DD4BF]">🌡️ {pk.heatRetention}</span>
                      <span className="text-[#D4AF37]">
                        {pk.fee === 0 ? "Bepul" : `+${formatMoney(pk.fee)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column Grid: Table/VIP Room Reservation + Interactive Branches Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Joy Band Qilish (VIP Xona / So'ri / Stol Bron Qilish) */}
            <div className="lg:col-span-5 bg-[#161616] rounded-3xl border border-[#D4AF37]/35 p-6 sm:p-8 space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>JOY BAND QILISH • VIP KABINALAR VA SO'RILAR</span>
                </div>
                <h3 className="font-serif-heritage text-2xl font-black text-white mt-1">
                  Mehmon Kutish Uchun Stol Band Qiling
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Siz kelishingizga qozondan yangi uzilgan osh va choy tayyor turadi.
                </p>
              </div>

              {bookingSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-black text-sm">
                      ✅ Joyingiz Band Qilindi!
                    </span>
                    <span className="bg-emerald-500 text-stone-950 font-black px-2.5 py-1 rounded-lg">
                      {bookingSuccess.code}
                    </span>
                  </div>
                  <div className="text-stone-300 space-y-1">
                    <div>👤 Mehmon: <strong>{bookingSuccess.name}</strong></div>
                    <div>👥 Soni: <strong>{bookingSuccess.guests} kishi</strong></div>
                    <div>🕒 Vaqti: <strong>{bookingSuccess.time}</strong></div>
                    <div>🏛️ Joy: <strong>{bookingSuccess.zone}</strong></div>
                    <div>📍 Filial: <strong>{bookingSuccess.branch}</strong></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(null)}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold cursor-pointer"
                  >
                    Yana boshqa joy band qilish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 mb-1">
                      Ismingiz
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Masalan: Sardorbek Karimov"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-stone-800 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">
                        Telefon raqamingiz
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-stone-800 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">
                        Mehmonlar soni
                      </label>
                      <select
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-stone-800 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        {[2, 4, 6, 8, 10, 12, 16, 20].map((n) => (
                          <option key={n} value={n}>
                            {n} kishi
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">
                        Tashrif vaqti
                      </label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-stone-800 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option>07:30 (Nahorgi To'y Oshi)</option>
                        <option>12:00 (1-Qozon Ochilishi)</option>
                        <option>12:30 (Tushlik — Issiq Qozon)</option>
                        <option>13:30 (2-Qozon Choyxona Oshi)</option>
                        <option>18:30 (Kechki Devzira & Zig'ir)</option>
                        <option>20:00 (Kechki Oilaviy Bazm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">
                        Zal yoki VIP Xona
                      </label>
                      <select
                        value={bookingZone}
                        onChange={(e) => setBookingZone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-stone-800 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        {tables.map((t) => (
                          <option key={t.id} value={`${t.number} (${t.zone})`}>
                            {t.number} — {t.seats} o'rinli
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition cursor-pointer"
                  >
                    🏺 Joyni Tasdiqlash va Band Qilish
                  </button>
                </form>
              )}
            </div>

            {/* Right: Interactive Branches Map & Live Qozon Locations */}
            <div className="lg:col-span-7 bg-[#161616] rounded-3xl border border-stone-800 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2DD4BF]">
                    TOSHKENT BO'YLAB FILIALLAR XARITASI
                  </span>
                  <h3 className="font-serif-heritage text-2xl font-black text-white mt-0.5">
                    📍 {config.brandName} — Filiallar va Qozonlar
                  </h3>
                </div>
                <div className="text-xs font-bold text-[#D4AF37] bg-[#0F0F0F] px-3.5 py-2 rounded-xl border border-[#D4AF37]/30">
                  📞 Call-Markaz: {config.phone}
                </div>
              </div>

              {/* Stylized Interactive Tashkent Map Canvas */}
              <div className="relative h-52 rounded-2xl bg-[#0C1214] border border-[#008B8B]/40 overflow-hidden p-4 flex flex-col justify-between">
                {/* Grid & River Map Vector Illustration */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
                  viewBox="0 0 600 220"
                  fill="none"
                >
                  <path
                    d="M0 40 H600 M0 90 H600 M0 140 H600 M0 190 H600 M90 0 V220 M210 0 V220 M330 0 V220 M450 0 V220"
                    stroke="#008B8B"
                    strokeWidth="0.7"
                  />
                  {/* Bo'zsuv canal curve */}
                  <path
                    d="M40 210 C180 150, 260 110, 390 20 C450 -10, 520 40, 590 10"
                    stroke="#2DD4BF"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#0F0F0F]/90 text-[#2DD4BF] border border-[#008B8B]/50 text-[11px] font-bold px-3 py-1 rounded-full">
                    🗺️ Toshkent sh. • GPS Express Kur'erlar Faol
                  </span>
                  <span className="bg-[#0F0F0F]/90 text-[#D4AF37] text-[11px] font-bold px-3 py-1 rounded-full border border-[#D4AF37]/40">
                    🛵 {selectedBranch?.deliveryTime} da yetkaziladi
                  </span>
                </div>

                {/* Map Pins */}
                <div className="relative z-10 flex flex-wrap items-center justify-around gap-2 my-auto">
                  {branches.map((b, i) => {
                    const active = selectedBranchId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          sound.playPosTap();
                          setSelectedBranchId(b.id);
                        }}
                        className={`px-3.5 py-2 rounded-2xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          active
                            ? "bg-[#D4AF37] text-[#0F0F0F] border-white shadow-[0_0_25px_rgba(212,175,55,0.6)] scale-105"
                            : "bg-[#0F0F0F]/90 text-stone-200 border-[#D4AF37]/40 hover:border-[#D4AF37]"
                        }`}
                      >
                        <MapPin className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs font-black leading-none">
                            {i + 1}. {b.name.split("(")[0]}
                          </div>
                          <div
                            className={`text-[10px] font-bold mt-0.5 ${
                              active ? "text-[#0F0F0F]" : "text-emerald-400"
                            }`}
                          >
                            {b.qozonStatus}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-300 bg-[#0F0F0F]/85 px-3 py-1.5 rounded-xl border border-stone-800">
                  <span>
                    Tanlangan filial: <strong className="text-[#D4AF37]">{selectedBranch?.name}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">🕒 {selectedBranch?.hours}</span>
                </div>
              </div>

              {/* Branch Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {branches.map((b) => {
                  const active = selectedBranchId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBranchId(b.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                        active
                          ? "bg-[#1F1A12] border-[#D4AF37]"
                          : "bg-[#0F0F0F] border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-1">
                        <span>{b.qozonStatus}</span>
                        <span className="text-stone-400">{b.deliveryTime}</span>
                      </div>
                      <div className="font-bold text-xs text-white">{b.name}</div>
                      <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">{b.address}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Mobile Bar (100% Mobile-First Experience) */}
      <div className="fixed bottom-3 inset-x-3 z-30 md:hidden flex flex-col gap-2">
        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C85A32] to-[#D4AF37] text-[#0F0F0F] font-black text-sm shadow-2xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Savatchani rasmiylashtirish ({totalItemsCount} ta)</span>
            </div>
            <span>{formatMoney(grandTotal, config.currency)} →</span>
          </button>
        )}
      </div>

      {/* Product Modifier Modal */}
      {modifierProduct && (
        <ProductModifierModal
          product={modifierProduct}
          currency={config.currency}
          onClose={() => setModifierProduct(null)}
          onAdd={handleAddToCart}
        />
      )}

      {/* Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-[#141414] text-stone-100 w-full max-w-lg h-full flex flex-col justify-between shadow-2xl overflow-hidden border-l border-[#D4AF37]/30">
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-[#0F0F0F]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif-heritage font-black text-lg text-white">
                  Shohona Savatcha ({totalItemsCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="text-5xl">🏺</div>
                  <div className="font-serif-heritage font-bold text-lg text-white">
                    Savatchangiz hozircha bo'sh
                  </div>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Osh Kalkulyatori yordamida mehmonlar soniga qarab hisoblang yoki menyudan
                    issiq osh tanlang!
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex gap-3 p-3.5 rounded-2xl bg-[#1C1C1C] border border-stone-800"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D4AF37]/30"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.cartItemId, -item.quantity)}
                              className="text-stone-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.variantName && (
                            <div className="text-[11px] font-semibold text-[#D4AF37]">
                              {item.variantName}
                            </div>
                          )}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              + {item.modifiers.map((m) => m.name).join(", ")}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="font-extrabold text-sm text-[#D4AF37]">
                              {formatMoney(item.totalPrice, config.currency)}
                            </div>
                            <div className="flex items-center gap-2 bg-[#0F0F0F] border border-stone-700 rounded-xl px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartItemId, -1)}
                                className="w-6 h-6 rounded-lg hover:bg-stone-800 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.cartItemId, 1)}
                                className="w-6 h-6 rounded-lg hover:bg-stone-800 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Packaging Selector inside Drawer */}
                  {orderType !== "dine_in" && (
                    <div className="p-3.5 rounded-2xl bg-[#0F0F0F] border border-[#008B8B]/40 space-y-2">
                      <label className="block text-xs font-extrabold text-[#2DD4BF]">
                        🏺 Qanday idishda yetkazilsin?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PACKAGING_OPTIONS.map((pk) => (
                          <button
                            key={pk.id}
                            type="button"
                            onClick={() => setPackagingType(pk.id)}
                            className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                              packagingType === pk.id
                                ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white"
                                : "bg-[#161616] border-stone-800 text-stone-400"
                            }`}
                          >
                            <div className="text-sm">{pk.icon}</div>
                            <div className="text-[11px] font-bold leading-tight mt-0.5">
                              {pk.name.split(" ")[0]} {pk.name.split(" ")[1]}
                            </div>
                            <div className="text-[10px] text-[#D4AF37] mt-0.5">
                              {pk.fee === 0 ? "Bepul" : `+${pk.fee / 1000}k`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Promo Code */}
                  <div className="p-3.5 rounded-2xl bg-[#0F0F0F] border border-stone-800 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promokod (OSH20, MEROS, FEEDUP)"
                        className="flex-1 bg-[#161616] border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold uppercase text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0F0F0F] text-xs font-black cursor-pointer"
                      >
                        Qo'llash
                      </button>
                    </div>
                  </div>

                  {/* Customer Info Form */}
                  <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ismingiz *"
                        className="px-3.5 py-2.5 bg-[#0F0F0F] border border-stone-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Telefon raqamingiz *"
                        className="px-3.5 py-2.5 bg-[#0F0F0F] border border-stone-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {orderType === "delivery" && (
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Yetkazib berish manzili *"
                        className="w-full px-3.5 py-2.5 bg-[#0F0F0F] border border-stone-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    )}

                    {/* Payment Methods */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "click", label: "Click" },
                        { id: "payme", label: "Payme" },
                        { id: "uzum", label: "Uzum" },
                        { id: "cash", label: "Naqd" }
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                            paymentMethod === pm.id
                              ? "bg-[#D4AF37] text-[#0F0F0F] border-[#D4AF37]"
                              : "bg-[#0F0F0F] text-stone-400 border-stone-800"
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-stone-800 bg-[#0F0F0F] space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Taomlar:</span>
                    <span className="font-bold text-white">
                      {formatMoney(subtotal, config.currency)}
                    </span>
                  </div>
                  {packagingFee > 0 && (
                    <div className="flex justify-between text-[#2DD4BF]">
                      <span>{selectedPackagingObj.name}:</span>
                      <span className="font-bold">
                        +{formatMoney(packagingFee, config.currency)}
                      </span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-stone-400">
                      <span>Yetkazib berish:</span>
                      <span className="font-bold text-white">
                        {formatMoney(deliveryFee, config.currency)}
                      </span>
                    </div>
                  )}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Chegirma:</span>
                      <span>-{formatMoney(totalDiscount, config.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-[#D4AF37] pt-2 border-t border-stone-800">
                    <span>Jami to'lov:</span>
                    <span>{formatMoney(grandTotal, config.currency)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C85A32] to-[#D4AF37] text-[#0F0F0F] font-black text-sm shadow-xl hover:brightness-110 transition cursor-pointer"
                >
                  {isSubmitting
                    ? "Yuborilmoqda..."
                    : `Buyurtmani Tasdiqlash • ${formatMoney(grandTotal, config.currency)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Order Tracker Modal */}
      {isTrackerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#D4AF37]/40 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#D4AF37]">
                  Real-Vaqt Monitoring
                </span>
                <h3 className="font-serif-heritage text-xl font-black text-white">
                  Buyurtmalar va Fiskal Cheklar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackerOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeCustomerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-stone-800 bg-[#0F0F0F] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#D4AF37] text-[#0F0F0F] font-black text-sm px-3 py-1 rounded-xl">
                        {ord.queueNumber}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{ord.tableName}</div>
                        <div className="text-[11px] text-stone-400">{ord.customerName}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptOrder(ord)}
                      className="text-xs font-bold text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Soliq QR Chek</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          config={config}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
