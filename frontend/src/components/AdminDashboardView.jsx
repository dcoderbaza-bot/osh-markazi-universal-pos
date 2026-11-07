import React, { useState, useMemo } from "react";
import {
  Palette,
  UtensilsCrossed,
  BarChart3,
  Plus,
  Save,
  RotateCcw,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  Ban,
  Receipt,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Award,
  X
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import ReceiptModal from "./ReceiptModal";

const COLOR_PALETTES = [
  { name: "Oltin Palov (Amber)", color: "#D97706" },
  { name: "Feed-Up Qirmizi (Red)", color: "#E11D48" },
  { name: "Sharqona Zumrad (Emerald)", color: "#059669" },
  { name: "Shohona Moviy (Royal Blue)", color: "#2563EB" },
  { name: "Qovurma Olov (Orange)", color: "#EA580C" },
  { name: "Premium Binafsha (Purple)", color: "#7C3AED" }
];

export default function AdminDashboardView() {
  const {
    config,
    categories,
    products,
    orders,
    tables,
    updateConfig,
    applyBrandPreset,
    toggleProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    resetDemoData
  } = useStore();

  const [activeTab, setActiveTab] = useState("brand"); // brand | menu | analytics
  const [formConfig, setFormConfig] = useState(config);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Sync local form when preset changes
  React.useEffect(() => {
    setFormConfig(config);
  }, [config]);

  // Menu Add/Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    categoryId: "plov",
    price: 40000,
    oldPrice: "",
    weight: "420g",
    prepTime: "5 daq",
    badge: "",
    description: "",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    isPopular: true
  });

  // Analytics Calculations
  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = valid.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalOrders = valid.length;
    const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const byPayment = { cash: 0, card: 0, click: 0, payme: 0, split: 0 };
    const bySource = { web: 0, pos: 0, qr_table: 0, uzum: 0, yandex: 0 };
    const itemMap = {};

    for (const o of valid) {
      const pm = o.paymentMethod || "cash";
      byPayment[pm] = (byPayment[pm] || 0) + (Number(o.total) || 0);
      const src = o.source || "pos";
      bySource[src] = (bySource[src] || 0) + 1;

      for (const it of o.items || []) {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
        }
        itemMap[it.name].qty += Number(it.quantity) || 1;
        itemMap[it.name].revenue += Number(it.totalPrice) || 0;
      }
    }

    const topProducts = Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return { totalRevenue, totalOrders, avgCheck, byPayment, bySource, topProducts };
  }, [orders]);

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    sound.playCashRegister();
    await updateConfig(formConfig);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      sku: `PLV-0${products.length + 1}`,
      categoryId: "plov",
      price: 42000,
      oldPrice: "",
      weight: "420g",
      prepTime: "5 daq",
      badge: "YANGI 🔥",
      description: "Yangi damlangan xushbo'y milliy taom",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
      isPopular: true
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku || "",
      categoryId: prod.categoryId,
      price: prod.price,
      oldPrice: prod.oldPrice || "",
      weight: prod.weight || "400g",
      prepTime: prod.prepTime || "5 daq",
      badge: prod.badge || "",
      description: prod.description || "",
      image: prod.image || "",
      isPopular: Boolean(prod.isPopular)
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        ...productForm,
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null
      });
    } else {
      await addProduct({
        ...productForm,
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null
      });
    }
    setShowProductModal(false);
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Navbat", "Manba", "Turi", "Mijoz", "To'lov", "Holati", "Summa", "Vaqt"];
    const rows = orders.map((o) => [
      o.id,
      o.queueNumber,
      o.source,
      o.orderType,
      `"${o.customerName || ""}"`,
      o.paymentMethod,
      o.status,
      o.total,
      o.createdAt
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.brandName.replace(/\s+/g, "_")}_Hisobot.csv`;
    a.click();
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-stone-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Admin Header & Sub-Navigation */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">
              ⚙️ Boshqaruv va Universal Brend Konstruktori
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Brend nomini, ranglarni, menyuni va moliya hisobotlarini real vaqtda boshqaring
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "brand", label: "Universal Brend Sozlamalari", icon: Palette },
              { id: "menu", label: `Menyu & Stop-List (${products.length})`, icon: UtensilsCrossed },
              { id: "analytics", label: "Moliya & Buyurtmalar", icon: BarChart3 }
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sound.playPosTap();
                    setActiveTab(t.id);
                  }}
                  style={active ? { backgroundColor: config.themeColor } : {}}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                    active ? "text-white shadow-md" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= TAB 1: UNIVERSAL WHITE-LABEL BRAND CONFIG ================= */}
        {activeTab === "brand" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 1-Click Brand Presets */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-black text-base text-stone-900">
                    Tayyor Brend Shablonlari (1-Bosishda)
                  </h2>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Tizim universal arxitekturada qurilgan: quyidagi tayyor brendlardan birini tanlang yoki o'ng tomonda o'zingizning istalgan Osh Markazingiz nomini kiriting!
                </p>

                <div className="space-y-2.5">
                  {(config.presets || []).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyBrandPreset(preset.id)}
                      className="w-full p-3.5 rounded-2xl border-2 border-stone-200 hover:border-amber-500 text-left transition flex items-center justify-between group bg-stone-50/60 hover:bg-white cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{ backgroundColor: preset.themeColor }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow"
                        >
                          {preset.logoEmoji}
                        </span>
                        <div>
                          <div className="font-black text-sm text-stone-900">{preset.brandName}</div>
                          <div className="text-[11px] text-stone-500">{preset.brandSubtitle}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition">
                        Tanlash →
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={resetDemoData}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Barcha demo ma'lumotlarni boshidan tiklash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Custom Brand Constructor Form */}
            <form
              onSubmit={handleSaveBrand}
              className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-black text-lg text-stone-900">
                    Individual Brend Sozlamalari (White-Label Engine)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Bu yerdagi har bir o'zgarish Sayt, POS Kassa, Oshxona (KDS), TV Navbat ekrani va 80mm Fiskal Chekda darhol aks etadi
                  </p>
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: formConfig.themeColor }}
                  className="px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-lg hover:opacity-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash va Qo'llash</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Osh Markazi / Brend Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formConfig.brandName || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, brandName: e.target.value })}
                    placeholder="Masalan: BESH QOZON, OSH UP, KAMOLON OSH..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Brend Yo'nalishi (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formConfig.brandSubtitle || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, brandSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Logotip Belgisi (Emoji) va Navbat Prefiksi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formConfig.logoEmoji || "🍛"}
                      onChange={(e) => setFormConfig({ ...formConfig, logoEmoji: e.target.value })}
                      className="w-20 text-center px-3 py-2.5 rounded-xl border border-stone-300 text-lg"
                    />
                    <input
                      type="text"
                      maxLength={2}
                      value={formConfig.queuePrefix || "A"}
                      onChange={(e) =>
                        setFormConfig({ ...formConfig, queuePrefix: e.target.value.toUpperCase() })
                      }
                      placeholder="Navbat harfi (A)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Call-Markaz Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={formConfig.phone || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Bosh Sahifa Shiori (Slogan)
                  </label>
                  <input
                    type="text"
                    value={formConfig.slogan || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, slogan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                {/* Color Palette Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-stone-600 mb-2">
                    Brend Asosiy Rangi (Theme Color)
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.color}
                        type="button"
                        onClick={() => setFormConfig({ ...formConfig, themeColor: pal.color })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border-2 transition cursor-pointer ${
                          formConfig.themeColor === pal.color
                            ? "border-stone-900 shadow-md scale-105"
                            : "border-stone-200"
                        }`}
                      >
                        <span
                          style={{ backgroundColor: pal.color }}
                          className="w-4 h-4 rounded-full inline-block"
                        />
                        <span>{pal.name}</span>
                      </button>
                    ))}
                    <input
                      type="color"
                      value={formConfig.themeColor || "#D97706"}
                      onChange={(e) => setFormConfig({ ...formConfig, themeColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300"
                    />
                  </div>
                </div>

                {/* Financial & Delivery Settings */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Yetkazib berish narxi ({config.currency})
                  </label>
                  <input
                    type="number"
                    value={formConfig.deliveryFee || 0}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, deliveryFee: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Bepul dastavka chegarasi ({config.currency})
                  </label>
                  <input
                    type="number"
                    value={formConfig.freeDeliveryMin || 0}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, freeDeliveryMin: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Zal Xizmat Haqi (%)
                  </label>
                  <input
                    type="number"
                    value={formConfig.serviceChargePercent || 0}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, serviceChargePercent: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Mijoz Keshbek Bonusi (%)
                  </label>
                  <input
                    type="number"
                    value={formConfig.cashbackPercent || 5}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, cashbackPercent: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Chek tepasidagi matn (Receipt Header)
                  </label>
                  <input
                    type="text"
                    value={formConfig.receiptHeader || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, receiptHeader: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-600 mb-1">
                    Chek pastidagi matn (Receipt Footer)
                  </label>
                  <input
                    type="text"
                    value={formConfig.receiptFooter || ""}
                    onChange={(e) => setFormConfig({ ...formConfig, receiptFooter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 2: MENU & STOP-LIST CRUD ================= */}
        {activeTab === "menu" && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-lg text-stone-900">
                  Menyu Taomlari, Narxlar va Stop-List Boshqaruvi
                </h2>
                <p className="text-xs text-stone-500">
                  Yangi taom yoki kombo qo'shing, narxlarni tahrirlang yoki tugagan taomni 1-bosishda Stop-listga oling
                </p>
              </div>
              <button
                type="button"
                onClick={openAddProduct}
                style={{ backgroundColor: config.themeColor }}
                className="px-4 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Taom / Kombo Qo'shish</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase">
                    <th className="py-3 px-3">Taom</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Kategoriya</th>
                    <th className="py-3 px-3">Narxi</th>
                    <th className="py-3 px-3">Holati (Stop-List)</th>
                    <th className="py-3 px-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {products.map((prod) => {
                    const cat = categories.find((c) => c.id === prod.categoryId);
                    return (
                      <tr key={prod.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-11 h-11 rounded-xl object-cover bg-stone-200"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{prod.name}</div>
                              <div className="text-[11px] text-stone-500">{prod.weight}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-600">{prod.sku}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-semibold">
                            {cat?.icon} {cat?.name || prod.categoryId}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-sm text-stone-900">
                          {formatMoney(prod.price, config.currency)}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => toggleProductStock(prod.id)}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                              prod.inStock
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {prod.inStock ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Sotuvda bor</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>STOP-LIST (Tugagan)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProduct(prod)}
                              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ANALYTICS & ORDER HISTORY ================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>JAMI TUSHUM (SAVDO)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {formatMoney(stats.totalRevenue, config.currency)}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  ↑ Sayt + POS + Agregatorlar
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>JAMI BUYURTMALAR</span>
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">{stats.totalOrders} ta</div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Saytdan: {stats.bySource.web || 0} • POS: {stats.bySource.pos || 0} • Uzum:{" "}
                  {stats.bySource.uzum || 0}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>O'RTACHA CHEK</span>
                  <CreditCard className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {formatMoney(stats.avgCheck, config.currency)}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Kombo setlar hisobiga +18% yuqori</div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>ZAL STOLLARI BANDLIGI</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {tables.filter((t) => t.status === "occupied").length} / {tables.length}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Asosiy zal, Terassa va VIP xonalar</div>
              </div>
            </div>

            {/* Payment Breakdown & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-stone-900">
                  To'lov Turlari Bo'yicha Tushum
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "cash", label: "💵 Naqd pul (Kassa)", color: "bg-emerald-500" },
                    { key: "click", label: "💙 CLICK Evolution", color: "bg-sky-500" },
                    { key: "payme", label: "🩵 Payme", color: "bg-teal-500" },
                    { key: "card", label: "💳 Uzcard / Humo Terminal", color: "bg-amber-500" },
                    { key: "split", label: "🔄 Aralash to'lov", color: "bg-purple-500" }
                  ].map((pm) => {
                    const amount = stats.byPayment[pm.key] || 0;
                    const pct =
                      stats.totalRevenue > 0 ? Math.round((amount / stats.totalRevenue) * 100) : 0;
                    return (
                      <div key={pm.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{pm.label}</span>
                          <span>
                            {formatMoney(amount, config.currency)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pm.color}`}
                            style={{ width: `${Math.max(3, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-stone-900">
                  Eng Ko'p Sotilgan Osh va Kombolar (Top-6)
                </h3>
                <div className="space-y-2.5">
                  {stats.topProducts.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{ backgroundColor: config.themeColor }}
                          className="w-6 h-6 rounded-lg text-white font-black flex items-center justify-center"
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500">{item.qty} porsiya sotildi</div>
                        </div>
                      </div>
                      <span className="font-black text-sm text-stone-900">
                        {formatMoney(item.revenue, config.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Orders Table with CSV Export */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-stone-900">Barcha Buyurtmalar Jurnali</h3>
                  <p className="text-xs text-stone-500">
                    Har bir chekni qayta chop etish yoki holatini o'zgartirish mumkin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel / CSV Hisobotni Yuklab Olish</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase">
                      <th className="py-3 px-3">Navbat</th>
                      <th className="py-3 px-3">Manba / Joy</th>
                      <th className="py-3 px-3">Mijoz</th>
                      <th className="py-3 px-3">Taomlar</th>
                      <th className="py-3 px-3">To'lov</th>
                      <th className="py-3 px-3">Holati</th>
                      <th className="py-3 px-3 text-right">Chek</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <span className="font-black text-sm text-stone-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                            {ord.queueNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-800">{ord.tableName}</div>
                          <div className="text-[10px] text-stone-400 uppercase">{ord.source}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold">{ord.customerName}</div>
                          <div className="text-[11px] text-stone-500">{ord.customerPhone}</div>
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate text-stone-600">
                          {(ord.items || []).map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-black text-stone-900">
                            {formatMoney(ord.total, config.currency)}
                          </div>
                          <div className="text-[10px] uppercase text-stone-500">{ord.paymentMethod}</div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold text-xs bg-white cursor-pointer"
                          >
                            <option value="new">🔔 Yangi</option>
                            <option value="cooking">🔥 Tayyorlanmoqda</option>
                            <option value="ready">✅ Tayyor (Navbatda)</option>
                            <option value="completed">🏁 Topshirildi</option>
                            <option value="cancelled">❌ Bekor qilindi</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(ord)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Chek</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200"
          >
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base">
                {editingProduct ? "Taomni Tahrirlash" : "Yangi Taom yoki Kombo Qo'shish"}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Taom Nomi *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategoriya</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">POS Shtrix-kod (SKU)</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Narxi ({config.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vazni / Hajmi</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Rasm URL manzili</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Ta'rif (Tarkibi)</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: config.themeColor }}
                  className="px-5 py-2.5 rounded-xl text-white font-black cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </form>
        </div>
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
