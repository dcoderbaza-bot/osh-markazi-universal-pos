import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  PauseCircle,
  PlayCircle,
  LayoutGrid,
  SlidersHorizontal,
  CheckCircle2,
  X,
  FileText,
  Ban,
  Receipt
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import { printThermalReceipt } from "../utils/printEngine";
import ProductModifierModal from "./ProductModifierModal";
import ReceiptModal from "./ReceiptModal";

export default function PosTerminalView() {
  const {
    config,
    soliqConfig,
    printerConfig,
    categories,
    products,
    tables,
    orders,
    shift,
    createOrder,
    updateOrderStatus,
    toggleProductStock,
    toggleShift,
    showToast
  } = useStore();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stopListEditMode, setStopListEditMode] = useState(false);

  // Mobile/Tablet responsive check drawer toggle
  const [mobileCheckOpen, setMobileCheckOpen] = useState(false);

  // Current POS Check State
  const [posChannel, setPosChannel] = useState("pos_pickup");
  const [selectedTableId, setSelectedTableId] = useState("t-2");
  const [customerName, setCustomerName] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkItems, setCheckItems] = useState([]);

  // Parked (Hold) Checks
  const [parkedChecks, setParkedChecks] = useState([]);
  const [showParkedModal, setShowParkedModal] = useState(false);

  // Modals
  const [modifierProduct, setModifierProduct] = useState(null);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Payment Calculator State
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.categoryId !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.mxikCode && p.mxikCode.includes(q))
        );
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId),
    [tables, selectedTableId]
  );

  const addItemToCheck = (item) => {
    sound.playPosTap();
    setCheckItems((prev) => {
      const modKey = (item.modifiers || []).map((m) => m.id).sort().join("|");
      const idx = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.variantName === item.variantName &&
          (c.modifiers || []).map((m) => m.id).sort().join("|") === modKey &&
          c.note === item.note
      );
      if (idx > -1) {
        const next = [...prev];
        const nextQty = next[idx].quantity + item.quantity;
        next[idx] = {
          ...next[idx],
          quantity: nextQty,
          totalPrice: next[idx].unitPrice * nextQty
        };
        return next;
      }
      return [
        ...prev,
        {
          ...item,
          lineId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        }
      ];
    });
  };

  const handlePosTileClick = (product, openModifier = false) => {
    if (stopListEditMode) {
      toggleProductStock(product.id);
      return;
    }
    if (!product.inStock) {
      showToast(`"${product.name}" Stop-listda!`, "error");
      return;
    }
    if (openModifier) {
      sound.playPosTap();
      setModifierProduct(product);
      return;
    }
    const defaultVariant =
      product.variants && product.variants.length > 0
        ? product.variants[Math.min(1, product.variants.length - 1)]
        : null;
    const unitPrice = product.price + (defaultVariant ? Number(defaultVariant.priceDelta) || 0 : 0);

    addItemToCheck({
      productId: product.id,
      mxikCode: product.mxikCode || "10705001001000000",
      name: product.name,
      image: product.image,
      variantName: defaultVariant ? defaultVariant.name : "",
      modifiers: [],
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      note: ""
    });
  };

  const updateLineQty = (lineId, delta) => {
    sound.playPosTap();
    setCheckItems((prev) =>
      prev
        .map((item) => {
          if (item.lineId !== lineId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return {
            ...item,
            quantity: nextQty,
            totalPrice: item.unitPrice * nextQty
          };
        })
        .filter(Boolean)
    );
  };

  const subtotal = useMemo(
    () => checkItems.reduce((sum, i) => sum + i.totalPrice, 0),
    [checkItems]
  );

  const discountAmount = useMemo(
    () => Math.round((subtotal * discountPercent) / 100),
    [subtotal, discountPercent]
  );

  const serviceFee = useMemo(() => {
    if (posChannel === "pos_dine_in") {
      return Math.round(((subtotal - discountAmount) * (Number(config.serviceChargePercent) || 10)) / 100);
    }
    return 0;
  }, [subtotal, discountAmount, posChannel, config]);

  const deliveryFee = useMemo(() => {
    if (posChannel !== "pos_delivery") return 0;
    if (subtotal >= (config.freeDeliveryMin || 150000)) return 0;
    return Number(config.deliveryFee) || 15000;
  }, [posChannel, subtotal, config]);

  const grandTotal = Math.max(0, subtotal - discountAmount + serviceFee + deliveryFee);
  const vat12Amount = Math.round((grandTotal * 12) / 112);
  const totalCheckCount = checkItems.reduce((s, i) => s + i.quantity, 0);

  const handleHoldCheck = () => {
    if (checkItems.length === 0) return;
    sound.playPosTap();
    const parked = {
      id: `hold-${Date.now()}`,
      time: new Date().toLocaleTimeString("uz-UZ"),
      posChannel,
      selectedTableId,
      customerName: customerName || `Chek #${parkedChecks.length + 1}`,
      checkItems,
      discountPercent,
      grandTotal
    };
    setParkedChecks((prev) => [parked, ...prev]);
    setCheckItems([]);
    setCustomerName("");
    setDiscountPercent(0);
    showToast("Chek xotiraga olindi (Hold)");
  };

  const handleRestoreParked = (parked) => {
    sound.playPosTap();
    setPosChannel(parked.posChannel);
    setSelectedTableId(parked.selectedTableId);
    setCustomerName(parked.customerName);
    setCheckItems(parked.checkItems);
    setDiscountPercent(parked.discountPercent);
    setParkedChecks((prev) => prev.filter((p) => p.id !== parked.id));
    setShowParkedModal(false);
    showToast("Kechiktirilgan chek tiklandi");
  };

  const handleCompletePayment = async () => {
    if (checkItems.length === 0) return;

    const isAggregator = posChannel === "uzum" || posChannel === "yandex";
    const orderType =
      posChannel === "pos_dine_in"
        ? "dine_in"
        : posChannel === "pos_delivery"
        ? "delivery"
        : "pickup";

    const receivedNum =
      paymentMethod === "cash" ? Number(cashReceived) || grandTotal : grandTotal;
    const changeNum =
      paymentMethod === "cash" ? Math.max(0, receivedNum - grandTotal) : 0;

    const payload = {
      source: isAggregator ? posChannel : "pos",
      orderType,
      tableId: orderType === "dine_in" ? selectedTableId : null,
      tableName:
        orderType === "dine_in"
          ? selectedTable?.number || "Stol"
          : posChannel === "uzum"
          ? "Uzum Tezkor"
          : posChannel === "yandex"
          ? "Yandex Eats"
          : orderType === "delivery"
          ? "Telefon Dastavka 🛵"
          : "O'zi bilan (Kassa)",
      customerName:
        customerName.trim() ||
        (orderType === "dine_in" ? `${selectedTable?.number} mijozi` : "Kassa Mijozi"),
      status: "cooking",
      paymentStatus: "paid",
      paymentMethod,
      cashReceived: receivedNum,
      changeAmount: changeNum,
      cashierName: shift.cashierName || "Kassir #1",
      items: checkItems,
      subtotal,
      discount: discountAmount,
      serviceFee,
      deliveryFee,
      total: grandTotal
    };

    const created = await createOrder(payload);
    setShowPaymentModal(false);
    setMobileCheckOpen(false);
    setCheckItems([]);
    setCustomerName("");
    setDiscountPercent(0);
    setCashReceived("");

    // If Auto-Print is enabled, print immediately via Zero-Margin Thermal Engine
    if (printerConfig?.autoPrintOnPosPay) {
      printThermalReceipt(created, config, soliqConfig, printerConfig);
    }
    setReceiptOrder(created);
  };

  // Reusable Check Panel UI (used in right sidebar on desktop & slide-over drawer on mobile/tablet)
  const renderCheckBuilder = () => (
    <div className="bg-stone-950 flex flex-col h-full overflow-hidden">
      {/* Order Mode Tabs */}
      <div className="p-3 border-b border-stone-800 space-y-2 shrink-0">
        <div className="grid grid-cols-5 gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
          {[
            { id: "pos_pickup", label: "O'zi bilan", icon: "🛍️" },
            { id: "pos_dine_in", label: "Zal Stol", icon: "🍽️" },
            { id: "pos_delivery", label: "Dastavka", icon: "🛵" },
            { id: "uzum", label: "Uzum", icon: "🟣" },
            { id: "yandex", label: "Yandex", icon: "🟡" }
          ].map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                sound.playPosTap();
                setPosChannel(ch.id);
              }}
              style={posChannel === ch.id ? { backgroundColor: config.themeColor } : {}}
              className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold text-center transition cursor-pointer ${
                posChannel === ch.id ? "text-white shadow" : "text-stone-400 hover:text-white"
              }`}
            >
              <div>{ch.icon}</div>
              <div className="truncate mt-0.5">{ch.label}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {posChannel === "pos_dine_in" && (
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number} ({t.status === "occupied" ? "Band" : "Bo'sh"})
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Mijoz ismi / Izoh..."
            className="flex-1 min-w-0 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Itemized Check Lines */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {checkItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 p-6">
            <div className="text-4xl mb-2">🧾</div>
            <div className="font-bold text-sm text-stone-400">Yangi Fiskal Chek</div>
            <p className="text-xs mt-1 max-w-xs">
              Menyudan taomni bosing. Har bir chek avtomatik Soliq.uz MXIK va 12% QQS bilan shakllanadi.
            </p>
          </div>
        ) : (
          checkItems.map((item, idx) => (
            <div
              key={item.lineId}
              className="bg-stone-900 border border-stone-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-white truncate">
                  {idx + 1}. {item.name}
                </div>
                {item.variantName && (
                  <div className="text-[11px] text-amber-400 font-semibold">{item.variantName}</div>
                )}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="text-[10px] text-stone-400">
                    + {item.modifiers.map((m) => m.name).join(", ")}
                  </div>
                )}
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {formatMoney(item.unitPrice, config.currency)} x {item.quantity} ={" "}
                  <strong className="text-white">{formatMoney(item.totalPrice, config.currency)}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateLineQty(item.lineId, -1)}
                  className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-red-900/60 text-stone-200 flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateLineQty(item.lineId, 1)}
                  className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-emerald-900/60 text-stone-200 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discounts & Totals Footer */}
      <div className="p-3.5 bg-stone-900 border-t border-stone-800 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-stone-400">Chegirma:</span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  sound.playPosTap();
                  setDiscountPercent(pct);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                  discountPercent === pct
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-xs border-t border-stone-800 pt-2">
          <div className="flex justify-between text-stone-400">
            <span>QQS (NDS 12% ichida):</span>
            <span>{formatMoney(vat12Amount, config.currency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Chegirma ({discountPercent}%):</span>
              <span>-{formatMoney(discountAmount, config.currency)}</span>
            </div>
          )}
          {serviceFee > 0 && (
            <div className="flex justify-between text-stone-400">
              <span>Zal xizmati ({config.serviceChargePercent}%):</span>
              <span>+{formatMoney(serviceFee, config.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-base sm:text-lg font-black text-white pt-1">
            <span>JAMI TO'LOV:</span>
            <span className="text-amber-400">{formatMoney(grandTotal, config.currency)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            disabled={checkItems.length === 0}
            onClick={() => {
              sound.playPosTap();
              setCheckItems([]);
              setDiscountPercent(0);
            }}
            className="py-3 rounded-xl bg-stone-800 hover:bg-red-950/80 text-red-400 font-bold text-xs flex items-center justify-center gap-1 transition disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={checkItems.length === 0}
            onClick={handleHoldCheck}
            className="py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-sky-400 font-bold text-xs flex items-center justify-center gap-1 transition disabled:opacity-40 cursor-pointer"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Hold</span>
          </button>

          <button
            type="button"
            disabled={checkItems.length === 0}
            onClick={() => {
              sound.playPosTap();
              setCashReceived(String(grandTotal));
              setShowPaymentModal(true);
            }}
            style={checkItems.length > 0 ? { backgroundColor: config.themeColor } : {}}
            className="col-span-2 py-3 rounded-xl bg-stone-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>TO'LOV & CHEK</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-56px)] bg-stone-900 text-stone-100 flex flex-col overflow-hidden relative">
      {/* Top POS Terminal Toolbar */}
      <div className="bg-stone-950 border-b border-stone-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTablesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-extrabold transition cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Stollar ({tables.filter((t) => t.status === "occupied").length}/{tables.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowParkedModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Hold ({parkedChecks.length})</span>
          </button>
        </div>

        {/* Fast Search */}
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SKU, MXIK yoki taom qidirish..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStopListEditMode((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
              stopListEditMode
                ? "bg-red-600 text-white border-red-500 animate-pulse"
                : "bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stop-List</span>
          </button>

          <button
            type="button"
            onClick={() => setShowZReportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Z-Hisobot</span>
          </button>
        </div>
      </div>

      {/* Main Split POS Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT/CENTER: Categories & POS Product Tiles */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full overflow-hidden border-r border-stone-800">
          {/* Category Bar */}
          <div className="p-2.5 bg-stone-900 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setActiveCategory("all");
              }}
              style={activeCategory === "all" ? { backgroundColor: config.themeColor } : {}}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                activeCategory === "all"
                  ? "text-white shadow-md"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              Barchasi ({products.length})
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    active
                      ? "text-white shadow-md"
                      : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Tiles Grid (Responsive across Mobile, Tablet, Monoblok, Desktop) */}
          <div className="flex-1 overflow-y-auto p-3 pb-20 lg:pb-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 content-start">
            {filteredProducts.map((product) => {
              const hasMods =
                (product.variants && product.variants.length > 0) ||
                (product.modifiers && product.modifiers.length > 0);
              return (
                <div
                  key={product.id}
                  onClick={() => handlePosTileClick(product, false)}
                  className={`group relative rounded-2xl border p-2.5 sm:p-3 flex flex-col justify-between transition select-none cursor-pointer min-h-[155px] overflow-hidden ${
                    product.inStock
                      ? "bg-stone-800/90 border-stone-700/80 hover:border-amber-500 hover:bg-stone-800 active:scale-[0.98]"
                      : "bg-stone-900/50 border-red-900/60 opacity-55"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 z-10">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-950/80 text-stone-400">
                      {product.sku || "POS"}
                    </span>
                    {hasMods && product.inStock && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePosTileClick(product, true);
                        }}
                        style={{ backgroundColor: config.themeColor }}
                        className="px-2 py-1 rounded-lg text-[10px] font-black text-white flex items-center gap-1 shadow hover:opacity-90 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Porsiya</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 my-1.5 z-10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 bg-stone-700"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-white leading-snug line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{product.weight}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-stone-700/60 z-10">
                    <span className="font-black text-xs sm:text-sm text-amber-400">
                      {formatMoney(product.price, config.currency)}
                    </span>
                    {!product.inStock ? (
                      <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">
                        STOP
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-stone-700 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DESKTOP CHECK BUILDER */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full overflow-hidden">
          {renderCheckBuilder()}
        </div>
      </div>

      {/* MOBILE / TABLET FLOATING CHECK BAR */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-30">
        <button
          type="button"
          onClick={() => setMobileCheckOpen(true)}
          style={{ backgroundColor: config.themeColor }}
          className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs sm:text-sm shadow-2xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span>Kassa Cheki ({totalCheckCount} ta taom)</span>
          </div>
          <span>{formatMoney(grandTotal, config.currency)} →</span>
        </button>
      </div>

      {/* MOBILE / TABLET CHECK DRAWER */}
      {mobileCheckOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/75 flex flex-col justify-end">
          <div className="h-[85dvh] bg-stone-950 rounded-t-3xl overflow-hidden flex flex-col border-t border-stone-700">
            <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
              <span className="font-black text-sm text-white">Kassa Cheki ({totalCheckCount})</span>
              <button
                onClick={() => setMobileCheckOpen(false)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{renderCheckBuilder()}</div>
          </div>
        </div>
      )}

      {/* POS PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white my-auto">
            <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg">Kassa To'lov Terminali</h3>
                <p className="text-xs text-stone-400">
                  Jami:{" "}
                  <strong className="text-amber-400">{formatMoney(grandTotal, config.currency)}</strong> (QQS 12%: {formatMoney(vat12Amount, config.currency)})
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "💵 Naqd pul", sub: "Qaytim hisoblash" },
                  { id: "card", label: "💳 Uzcard / Humo", sub: "Bank terminali" },
                  { id: "click", label: "💙 CLICK QR", sub: "Fiskal QR" },
                  { id: "payme", label: "🩵 Payme QR", sub: "Fiskal QR" },
                  { id: "split", label: "🔄 Aralash", sub: "Naqd + Karta" }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      sound.playPosTap();
                      setPaymentMethod(pm.id);
                    }}
                    style={
                      paymentMethod === pm.id
                        ? { borderColor: config.themeColor, backgroundColor: `${config.themeColor}25` }
                        : {}
                    }
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      paymentMethod === pm.id ? "text-white" : "border-stone-800 bg-stone-950 text-stone-400"
                    }`}
                  >
                    <div className="font-black text-xs">{pm.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{pm.sub}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "cash" && (
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-400">Mijoz bergan pul:</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-36 sm:w-44 text-right bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 font-black text-base text-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[grandTotal, 50000, 100000, 200000, 500000].map((val, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          sound.playPosTap();
                          setCashReceived(String(val));
                        }}
                        className="py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 cursor-pointer"
                      >
                        {i === 0 ? "Aniq" : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                    <span className="text-xs font-bold text-stone-400">Mijozga qaytim:</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400">
                      {formatMoney(Math.max(0, (Number(cashReceived) || 0) - grandTotal), config.currency)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCompletePayment}
                style={{ backgroundColor: config.themeColor }}
                className="w-full py-4 rounded-2xl text-white font-black text-sm sm:text-base shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>To'lovni Qabul Qilish va Fiskal Chek Chiqarish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLES MODAL */}
      {showTablesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-white">
            <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-black text-base">Zal Stollari Xaritasi</h3>
              <button
                onClick={() => setShowTablesModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75dvh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tables.map((t) => {
                const activeOrd = orders.find((o) => o.id === t.currentOrderId);
                const isOccupied = t.status === "occupied";
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between ${
                      isOccupied
                        ? "bg-amber-500/15 border-amber-500/60"
                        : "bg-stone-950 border-stone-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-stone-400">{t.zone}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isOccupied
                              ? "bg-amber-500 text-stone-950"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {isOccupied ? "BAND" : "BO'SH"}
                        </span>
                      </div>
                      <div className="font-black text-sm text-white">{t.number}</div>
                    </div>

                    <div className="mt-3 pt-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPosChannel("pos_dine_in");
                          setSelectedTableId(t.id);
                          setShowTablesModal(false);
                          showToast(`${t.number} tanlandi`);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white cursor-pointer"
                      >
                        Tanlash
                      </button>
                      {activeOrd && (
                        <button
                          type="button"
                          onClick={() => {
                            updateOrderStatus(activeOrd.id, "completed");
                            showToast(`${t.number} bo'shatildi!`);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white cursor-pointer"
                        >
                          Yopish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PARKED CHECKS MODAL */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white">
            <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-black text-sm">Kechiktirilgan Cheklar ({parkedChecks.length})</h3>
              <button
                onClick={() => setShowParkedModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {parkedChecks.length === 0 ? (
                <div className="text-center text-stone-500 py-8 text-xs">
                  Kechiktirilgan cheklar yo'q
                </div>
              ) : (
                parkedChecks.map((pk) => (
                  <div
                    key={pk.id}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs">{pk.customerName}</div>
                      <div className="text-[11px] text-amber-400 font-bold">
                        {formatMoney(pk.grandTotal, config.currency)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreParked(pk)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Tiklash</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Z-REPORT MODAL */}
      {showZReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white">
            <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-black text-base">Soliq OFD Z-Hisobot va Smena</h3>
              <button
                onClick={() => setShowZReportModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-400">Fiskal Modul:</span>
                  <span className="font-mono font-bold text-amber-400">{soliqConfig.terminalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">STIR (INN):</span>
                  <span className="font-mono font-bold">{soliqConfig.stir}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Jami fiskal cheklar:</span>
                  <span className="font-bold">{orders.length} ta</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-stone-800">
                  <span>Jami tushum:</span>
                  <span className="text-emerald-400">
                    {formatMoney(
                      orders.reduce((s, o) => s + (o.status !== "cancelled" ? Number(o.total) || 0 : 0), 0),
                      config.currency
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleShift();
                  setShowZReportModal(false);
                }}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase cursor-pointer ${
                  shift.isOpen ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {shift.isOpen ? "Z-Hisobotni Yopish (OFD ga Yuborish)" : "Yangi Smenani Ochish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modifierProduct && (
        <ProductModifierModal
          product={modifierProduct}
          config={config}
          onClose={() => setModifierProduct(null)}
          onConfirm={addItemToCheck}
        />
      )}

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
