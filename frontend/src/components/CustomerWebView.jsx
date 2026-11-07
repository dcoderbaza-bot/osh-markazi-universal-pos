import React, { useState, useMemo } from "react";
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
  Tag,
  ChevronRight,
  X,
  Receipt,
  Copy,
  Navigation
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import ProductModifierModal from "./ProductModifierModal";
import ReceiptModal from "./ReceiptModal";

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
      productId: "prod-combo-1",
      name: "OshUP Solo Kombo #1",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
      variantName: "Standart Kombo (Coca-Cola 0.5L bilan)",
      modifiers: [{ id: "mod-qazi", name: "Qo'shimcha Qazi bo'lagi", price: 14000 }],
      quantity: 1,
      unitPrice: 73000,
      totalPrice: 73000,
      note: ""
    }
  ]);

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 90 ");
  const [deliveryAddress, setDeliveryAddress] = useState("Yunusobod tumani, 7-mavze, 14-uy");
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

  // Filtered Products
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

  // Upsell items (Salads & Drinks not yet in cart)
  const upsellProducts = useMemo(() => {
    const inCartIds = new Set(cart.map((c) => c.productId));
    return products
      .filter(
        (p) =>
          p.inStock &&
          (p.categoryId === "salads" || p.categoryId === "drinks" || p.categoryId === "bread_somsa") &&
          !inCartIds.has(p.id)
      )
      .slice(0, 4);
  }, [products, cart]);

  // Add item to Cart
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const modKey = (item.modifiers || []).map((m) => m.id).sort().join("|");
      const existingIdx = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.variantName === item.variantName &&
          (c.modifiers || []).map((m) => m.id).sort().join("|") === modKey &&
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
    showToast(`"${item.name}" savatga qo'shildi!`);
  };

  const handleProductClick = (product) => {
    if (!product.inStock) {
      showToast("Kechirasiz, ushbu taom vaqtincha tugagan (Stop-list)", "error");
      return;
    }
    sound.playPosTap();
    if ((product.variants && product.variants.length > 0) || (product.modifiers && product.modifiers.length > 0)) {
      setModifierProduct(product);
    } else {
      handleAddToCart({
        productId: product.id,
        name: product.name,
        image: product.image,
        variantName: "",
        modifiers: [],
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        note: ""
      });
    }
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

  const deliveryFee = useMemo(() => {
    if (orderType !== "delivery") return 0;
    if (subtotal >= (config.freeDeliveryMin || 150000)) return 0;
    return Number(config.deliveryFee) || 15000;
  }, [orderType, subtotal, config]);

  const serviceFee = useMemo(() => {
    if (orderType !== "dine_in") return 0;
    return Math.round((subtotal * (Number(config.serviceChargePercent) || 10)) / 100);
  }, [orderType, subtotal, config]);

  const grandTotal = Math.max(0, subtotal - totalDiscount + deliveryFee + serviceFee);
  const totalItemsCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = promos.find((p) => p.code.toUpperCase() === code);
    if (!found) {
      showToast("Bunday promokod topilmadi (Masalan: OSH20, FEEDUP)", "error");
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

    const payload = {
      source: orderType === "dine_in" ? "qr_table" : "web",
      orderType,
      branchId: selectedBranchId,
      tableId: orderType === "dine_in" ? selectedTableId : null,
      tableName:
        orderType === "dine_in"
          ? selectedTable?.number || "Zal Stoli"
          : orderType === "delivery"
          ? "Yetkazib berish 🛵"
          : `Olib ketish (${selectedBranch?.name?.split("(")[0] || "Filial"})`,
      customerName: customerName.trim() || "Online Mijoz",
      customerPhone: customerPhone.trim() || "+998 90 000-00-00",
      address:
        orderType === "delivery"
          ? deliveryAddress
          : orderType === "dine_in"
          ? selectedTable?.number
          : selectedBranch?.address,
      paymentMethod,
      paymentStatus: "paid",
      note: orderNote.trim(),
      promoCode: appliedPromo?.code || "",
      usedBonus: bonusDiscount,
      items: cart,
      subtotal,
      discount: totalDiscount,
      serviceFee,
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

  const activeCustomerOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").slice(0, 6),
    [orders]
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Customer Sub-Header: Order Mode & Branch Selector */}
      <div className="bg-white border-b border-stone-200 sticky top-14 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Feed Up Style Order Type Switcher */}
          <div className="inline-flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("delivery");
              }}
              style={orderType === "delivery" ? { backgroundColor: config.themeColor } : {}}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "delivery" ? "text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Yetkazib berish</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("pickup");
              }}
              style={orderType === "pickup" ? { backgroundColor: config.themeColor } : {}}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "pickup" ? "text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Olib ketish (Self-Pickup)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setOrderType("dine_in");
              }}
              style={orderType === "dine_in" ? { backgroundColor: config.themeColor } : {}}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                orderType === "dine_in" ? "text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Zaldan (QR-Stol)</span>
            </button>
          </div>

          {/* Dynamic Context Input (Address / Branch / Table) */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {orderType === "delivery" && (
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 w-full">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Yetkazib berish manzilini kiriting..."
                  className="bg-transparent text-xs font-semibold text-stone-800 w-full focus:outline-none"
                />
              </div>
            )}
            {orderType === "pickup" && (
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 w-full">
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 w-full focus:outline-none cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.qozonStatus})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {orderType === "dine_in" && (
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 w-full">
                <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 w-full focus:outline-none cursor-pointer"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number} — {t.zone} ({t.seats} o'rinli)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Quick Actions: Loyalty Bonus, Order Tracker & Cart */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs font-bold">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Bonus: {formatMoney(loyaltyPoints, config.currency)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Buyurtma holati</span>
              <span className="bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 rounded-md text-[10px]">
                {activeCustomerOrders[0]?.queueNumber || "JONLI"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: config.themeColor }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{formatMoney(grandTotal, config.currency)}</span>
              <span className="bg-black/25 px-2 py-0.5 rounded-full text-[11px]">{totalItemsCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-8">
        {/* 1. Hero Brand Banner with Live Qozon Status */}
        <div
          style={{
            background: `linear-gradient(135deg, #1c1917 0%, #292524 55%, ${config.themeColor} 100%)`
          }}
          className="rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{config.badgeText || "Asosiy Qozonlar Ochiq • Issiq Osh Tayyor!"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {config.logoEmoji} {config.brandName}
              </h1>

              <p className="text-stone-200 text-sm sm:text-base max-w-xl leading-relaxed">
                {config.slogan}
              </p>

              {/* Key Service Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
                  <div className="text-[11px] text-stone-300">Yetkazish vaqti</div>
                  <div className="text-sm sm:text-base font-black mt-0.5 flex items-center gap-1.5">
                    ⚡ {selectedBranch?.deliveryTime || "25-35 daq"}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
                  <div className="text-[11px] text-stone-300">Bepul dastavka</div>
                  <div className="text-sm sm:text-base font-black mt-0.5">
                    🛵 {formatMoney(config.freeDeliveryMin, config.currency)} dan
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-stone-300">Keshbek tizimi</div>
                  <div className="text-sm sm:text-base font-black mt-0.5">
                    🎁 Har xariddan {config.cashbackPercent || 5}% bonus
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Live Queue & Promo Preview Card */}
            <div className="lg:col-span-5 bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Jonli Elektron Navbat
                  </div>
                  <div className="text-xs text-stone-300">{selectedBranch?.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateModule && onNavigateModule("queue")}
                  className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                >
                  TV Ekranni ochish →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-300">Tayyorlanmoqda</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {orders
                      .filter((o) => o.status === "cooking" || o.status === "new")
                      .slice(0, 4)
                      .map((o) => (
                        <span
                          key={o.id}
                          className="bg-amber-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-md"
                        >
                          {o.queueNumber}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-emerald-300">Tayyor (Oling!)</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {orders
                      .filter((o) => o.status === "ready")
                      .slice(0, 4)
                      .map((o) => (
                        <span
                          key={o.id}
                          className="bg-emerald-400 text-stone-950 font-black text-xs px-2 py-0.5 rounded-md animate-pulse"
                        >
                          {o.queueNumber}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/10 rounded-xl px-3.5 py-2.5 text-xs">
                <span>🎉 Promokod: <strong className="text-amber-300">OSH20</strong> (-20% chegirma)</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput("OSH20");
                    showToast("OSH20 promokodi nusxalandi!");
                  }}
                  className="text-amber-300 font-bold underline cursor-pointer"
                >
                  Qo'llash
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Feed Up Style Interactive Stories Carousel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Qaynoq Aksiyalar va Hikoyalar (Stories)
            </h2>
            <span className="text-xs text-stone-400">Bosing va promokod oling</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => {
                  sound.playPosTap();
                  setActiveStory(story);
                }}
                className="group relative h-44 rounded-2xl overflow-hidden text-left p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border-2 border-amber-500/60"
              >
                <img
                  src={story.image}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                <span
                  style={{ backgroundColor: config.themeColor }}
                  className="relative z-10 self-start text-[10px] font-black text-white px-2.5 py-1 rounded-full shadow"
                >
                  {story.badge}
                </span>
                <div className="relative z-10 text-white">
                  <div className="font-black text-base leading-snug">{story.title}</div>
                  <div className="text-[11px] text-stone-200 line-clamp-1 mt-0.5">{story.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sticky Categories + Search Filter Bar */}
        <div className="sticky top-[112px] z-20 bg-stone-50/95 backdrop-blur-md py-3 border-b border-stone-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Categories Horizontal List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setActiveCategory("all");
              }}
              style={activeCategory === "all" ? { backgroundColor: config.themeColor } : {}}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                activeCategory === "all"
                  ? "text-white shadow-sm"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
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
                  style={active ? { backgroundColor: config.themeColor } : {}}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "text-white shadow-sm"
                      : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Popular Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Osh, kombo, qazi, achichuk..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setOnlyPopular((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                onlyPopular
                  ? "bg-amber-500 text-stone-950 border-amber-500"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Xit taomlar</span>
            </button>
          </div>
        </div>

        {/* 4. Menu Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const hasModifiers =
              (product.variants && product.variants.length > 0) ||
              (product.modifiers && product.modifiers.length > 0);
            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  !product.inStock ? "opacity-60 grayscale" : "hover:-translate-y-1"
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    {product.badge && (
                      <span
                        style={{ backgroundColor: config.themeColor }}
                        className="absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md"
                      >
                        {product.badge}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase">
                          Vaqtincha Tugadi (Stop-list)
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                      {product.weight}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="font-extrabold text-base text-stone-900 group-hover:text-amber-700 transition line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price & Action Footer */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-stone-100">
                  <div>
                    {product.oldPrice && (
                      <div className="text-[11px] text-stone-400 line-through">
                        {formatMoney(product.oldPrice, config.currency)}
                      </div>
                    )}
                    <div className="text-base font-black text-stone-900">
                      {formatMoney(product.price, config.currency)}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!product.inStock}
                    style={product.inStock ? { backgroundColor: config.themeColor } : {}}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      product.inStock
                        ? "text-white shadow-md hover:opacity-90"
                        : "bg-stone-200 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{hasModifiers ? "Yig'ish" : "Savatga"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Branches & Working Hours Info Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                📍 {config.brandName} — Filiallarimiz va Qozonlar Holati
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Har bir filialimizda issiq osh, oilaviy zal, VIP xonalar va o'zi bilan olib ketish (Feed-Up Express) nuqtalari mavjud
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-stone-100 px-4 py-2 rounded-xl">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Yagona Call-Markaz: {config.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                  selectedBranchId === b.id
                    ? "border-amber-500 bg-amber-50/40"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {b.qozonStatus}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">🕒 {b.hours}</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">{b.name}</h3>
                <p className="text-xs text-stone-500 mt-1">{b.address}</p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/70 text-xs font-semibold text-stone-700">
                  <span>📞 {b.phone}</span>
                  <span className="text-amber-700">🛵 {b.deliveryTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-30 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: config.themeColor }}
            className="w-full py-4 px-5 rounded-2xl text-white font-black text-sm shadow-2xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Savatni rasmiylashtirish ({totalItemsCount} ta)</span>
            </div>
            <span>{formatMoney(grandTotal, config.currency)} →</span>
          </button>
        </div>
      )}

      {/* ================= STORY VIEWER MODAL ================= */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full rounded-3xl overflow-hidden bg-stone-900 text-white shadow-2xl border border-white/15">
            <img
              src={activeStory.image}
              alt={activeStory.title}
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 space-y-4">
              <span
                style={{ backgroundColor: config.themeColor }}
                className="inline-block text-xs font-black px-3 py-1 rounded-full"
              >
                {activeStory.badge}
              </span>
              <h3 className="text-2xl font-black">{activeStory.title}</h3>
              <p className="text-sm text-stone-300 leading-relaxed">{activeStory.description}</p>

              {activeStory.promoCode && (
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-stone-400">Maxsus promokod</div>
                    <div className="text-lg font-black text-amber-400 tracking-wider">
                      {activeStory.promoCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput(activeStory.promoCode);
                      showToast(`"${activeStory.promoCode}" promokodi savatga nusxalandi!`);
                      setActiveStory(null);
                      setIsCartOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Qo'llash</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeStory.linkedCategoryId) setActiveCategory(activeStory.linkedCategoryId);
                  setActiveStory(null);
                }}
                style={{ backgroundColor: config.themeColor }}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white cursor-pointer"
              >
                Taomlarni ko'rish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT MODIFIER MODAL ================= */}
      {modifierProduct && (
        <ProductModifierModal
          product={modifierProduct}
          config={config}
          onClose={() => setModifierProduct(null)}
          onConfirm={handleAddToCart}
        />
      )}

      {/* ================= CART & CHECKOUT DRAWER ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base">Buyurtma Savati</h3>
                  <p className="text-[11px] text-stone-400">
                    {orderType === "delivery"
                      ? "🛵 Yetkazib berish"
                      : orderType === "pickup"
                      ? "🛍️ Filialdan olib ketish"
                      : "🍽️ Zalda stolga buyurtma"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-5xl mb-3">🍛</div>
                <h4 className="font-black text-lg text-stone-800">Savatingiz hozircha bo'sh</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Issiq To'y oshi, Samarqand zig'ir oshi yoki tejamkor Feed-Up Kombo setlarimizdan tanlang!
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  style={{ backgroundColor: config.themeColor }}
                  className="mt-5 px-6 py-3 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Menyuga qaytish
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Free delivery progress bar */}
                {orderType === "delivery" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs">
                    {subtotal >= config.freeDeliveryMin ? (
                      <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tabriklaymiz! Siz uchun yetkazib berish BEPUL! 🎉</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between font-semibold text-stone-700 mb-1.5">
                          <span>Bepul yetkazish uchun yana:</span>
                          <span className="font-black text-amber-800">
                            {formatMoney(config.freeDeliveryMin - subtotal, config.currency)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(100, (subtotal / config.freeDeliveryMin) * 100)}%`,
                              backgroundColor: config.themeColor
                            }}
                            className="h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 p-3 rounded-2xl border border-stone-200 bg-stone-50/60"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-stone-900 truncate">{item.name}</div>
                        {item.variantName && (
                          <div className="text-[11px] text-amber-800 font-medium">{item.variantName}</div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-[10px] text-stone-500">
                            + {item.modifiers.map((m) => m.name).join(", ")}
                          </div>
                        )}
                        {item.note && (
                          <div className="text-[10px] italic text-stone-500">Izoh: {item.note}</div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-xs text-stone-900">
                            {formatMoney(item.totalPrice, config.currency)}
                          </span>
                          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.cartItemId, -1)}
                              className="p-1 text-stone-600 hover:text-red-600 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.cartItemId, 1)}
                              className="p-1 text-stone-600 hover:text-emerald-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feed Up Style Upsell: Osh yoniga qo'shing */}
                {upsellProducts.length > 0 && (
                  <div className="bg-stone-100 rounded-2xl p-3.5">
                    <div className="text-xs font-extrabold text-stone-700 mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Osh bilan juda mos keladi (1-bosishda qo'shish):</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {upsellProducts.map((up) => (
                        <button
                          key={up.id}
                          type="button"
                          onClick={() =>
                            handleAddToCart({
                              productId: up.id,
                              name: up.name,
                              image: up.image,
                              variantName: "",
                              modifiers: [],
                              quantity: 1,
                              unitPrice: up.price,
                              totalPrice: up.price,
                              note: ""
                            })
                          }
                          className="flex items-center justify-between bg-white p-2 rounded-xl border border-stone-200 hover:border-amber-500 text-left transition cursor-pointer"
                        >
                          <div className="min-w-0 pr-1">
                            <div className="text-[11px] font-bold text-stone-800 truncate">{up.name}</div>
                            <div className="text-[10px] font-semibold text-amber-700">
                              +{formatMoney(up.price, config.currency)}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-amber-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Code & Bonus Cashback */}
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promokod (OSH20, FEEDUP)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 cursor-pointer"
                    >
                      Qo'llash
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/60 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-stone-800">
                          Keshbek bonusni ishlatish
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Mavjud: {formatMoney(loyaltyPoints, config.currency)}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useBonus}
                      onChange={(e) => setUseBonus(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                    Qabul qiluvchi ma'lumotlari
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ismingiz *"
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Telefon raqamingiz *"
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {orderType === "delivery" && (
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Aniq manzil (Ko'cha, uy, xonadon, mo'ljal) *"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  )}
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Kuryer yoki oshpaz uchun izoh (Domofon kodi va h.k.)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                    To'lov usulini tanlang
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "click", label: "💙 CLICK Evolution" },
                      { id: "payme", label: "🩵 Payme" },
                      { id: "card", label: "💳 Uzcard / Humo" },
                      { id: "cash", label: "💵 Naqd pulda" }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        style={
                          paymentMethod === pm.id
                            ? { borderColor: config.themeColor, backgroundColor: `${config.themeColor}14` }
                            : {}
                        }
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold text-left transition cursor-pointer ${
                          paymentMethod === pm.id ? "text-stone-900" : "border-stone-200 text-stone-600"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-stone-100 rounded-2xl p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Taomlar summasi:</span>
                    <span className="font-semibold">{formatMoney(subtotal, config.currency)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Chegirma va bonus:</span>
                      <span>-{formatMoney(totalDiscount, config.currency)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Yetkazib berish:</span>
                      <span className="font-semibold">+{formatMoney(deliveryFee, config.currency)}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Zal xizmati ({config.serviceChargePercent}%):</span>
                      <span className="font-semibold">+{formatMoney(serviceFee, config.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-300">
                    <span>Jami to'lov:</span>
                    <span>{formatMoney(grandTotal, config.currency)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: config.themeColor }}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl hover:opacity-95 transition cursor-pointer"
                >
                  {isSubmitting
                    ? "Buyurtma yuborilmoqda..."
                    : `Buyurtmani Tasdiqlash • ${formatMoney(grandTotal, config.currency)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= LIVE ORDER STATUS & QUEUE TRACKER MODAL ================= */}
      {isTrackerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base">Jonli Buyurtmalar va Elektron Navbat</h3>
                  <p className="text-[11px] text-stone-400">
                    POS Kassa va Oshxona (KDS) bilan real vaqtda sinxronlangan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackerOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
              {activeCustomerOrders.map((ord) => {
                const steps = [
                  { key: "new", label: "Qabul qilindi" },
                  { key: "cooking", label: "Qozonda suzilmoqda" },
                  { key: "ready", label: ord.orderType === "delivery" ? "Kuryer yo'lda" : "Tayyor! Oling" },
                  { key: "completed", label: "Topshirildi" }
                ];
                const currentIdx = steps.findIndex((s) => s.key === ord.status);

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50/70 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          style={{ backgroundColor: config.themeColor }}
                          className="text-white font-black text-xl px-3.5 py-1.5 rounded-xl shadow"
                        >
                          {ord.queueNumber}
                        </span>
                        <div>
                          <div className="font-extrabold text-sm text-stone-900">
                            {ord.customerName} • {ord.tableName}
                          </div>
                          <div className="text-xs text-stone-500">
                            {new Date(ord.createdAt).toLocaleTimeString("uz-UZ")} •{" "}
                            {formatMoney(ord.total, config.currency)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReceiptOrder(ord)}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chekni ko'rish</span>
                      </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {steps.map((st, idx) => {
                        const done = idx <= currentIdx;
                        return (
                          <div key={st.key} className="text-center">
                            <div
                              className={`h-2 rounded-full mb-1.5 transition-all ${
                                done ? "bg-emerald-500" : "bg-stone-200"
                              }`}
                            />
                            <span
                              className={`text-[11px] font-bold ${
                                done ? "text-emerald-700" : "text-stone-400"
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-stone-600 pt-1 border-t border-stone-200/80">
                      {(ord.items || []).map((i) => `${i.quantity}x ${i.name}`).join(" • ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= RECEIPT MODAL ================= */}
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
