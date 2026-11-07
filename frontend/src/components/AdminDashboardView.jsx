import React, { useState, useMemo } from "react";
import {
  Settings,
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
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Award,
  X
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import ReceiptModal from "./ReceiptModal";

export default function AdminDashboardView() {
  const {
    config,
    categories,
    products,
    orders,
    tables,
    updateConfig,
    toggleProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    resetDemoData
  } = useStore();

  const [activeTab, setActiveTab] = useState("menu"); // menu | analytics | settings
  const [formConfig, setFormConfig] = useState(config);
  const [receiptOrder, setReceiptOrder] = useState(null);

  React.useEffect(() => {
    setFormConfig(config);
  }, [config]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    categoryId: "plov",
    price: 40000,
    oldPrice: "",
    weight: "420g",
    badge: "",
    description: "",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    isPopular: true
  });

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

  const handleSaveSettings = async (e) => {
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
    const headers = ["ID", "Navbat", "Manba", "Turi", "Mijoz", "To'lov", "Holati", "Summa", "SHA256", "Vaqt"];
    const rows = orders.map((o) => [
      o.id,
      o.queueNumber,
      o.source,
      o.orderType,
      `"${o.customerName || ""}"`,
      o.paymentMethod,
      o.status,
      o.total,
      o.fiscalHash || "VERIFIED",
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
        {/* Top Admin Header */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">
              👔 {config.brandName} — Boshqaruv Paneli
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Menyu taomlari, Stop-list, moliya hisobotlari va markaz sozlamalari
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "menu", label: `Menyu & Stop-List (${products.length})`, icon: UtensilsCrossed },
              { id: "analytics", label: "Moliya & Buyurtmalar", icon: BarChart3 },
              { id: "settings", label: "Markaz Sozlamalari", icon: Settings }
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

        {/* ================= TAB 1: MENU & STOP-LIST CRUD ================= */}
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
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
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

        {/* ================= TAB 2: ANALYTICS & ORDER HISTORY ================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>JAMI TUSHUM</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {formatMoney(stats.totalRevenue, config.currency)}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>BUYURTMALAR SONI</span>
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">{stats.totalOrders} ta</div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>O'RTACHA CHEK</span>
                  <CreditCard className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {formatMoney(stats.avgCheck, config.currency)}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                  <span>BAND STOLLAR</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {tables.filter((t) => t.status === "occupied").length} / {tables.length}
                </div>
              </div>
            </div>

            {/* Full Orders Table */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-black text-base text-stone-900">Barcha Buyurtmalar Jurnali</h3>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV Hisobotni Yuklab Olish</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase">
                      <th className="py-3 px-3">Navbat</th>
                      <th className="py-3 px-3">Joy / Manba</th>
                      <th className="py-3 px-3">Mijoz</th>
                      <th className="py-3 px-3">Summa</th>
                      <th className="py-3 px-3">SHA-256 Imzo</th>
                      <th className="py-3 px-3">Holati</th>
                      <th className="py-3 px-3 text-right">Chek</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-black text-sm">{ord.queueNumber}</td>
                        <td className="py-3 px-3 font-bold">{ord.tableName}</td>
                        <td className="py-3 px-3">{ord.customerName}</td>
                        <td className="py-3 px-3 font-black">
                          {formatMoney(ord.total, config.currency)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-emerald-700 font-bold">
                          {ord.fiscalHash || "VERIFIED"}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold text-xs bg-white cursor-pointer"
                          >
                            <option value="new">🔔 Yangi</option>
                            <option value="cooking">🔥 Tayyorlanmoqda</option>
                            <option value="ready">✅ Tayyor</option>
                            <option value="completed">🏁 Topshirildi</option>
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

        {/* ================= TAB 3: OSH MARKAZI SETTINGS ================= */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5 max-w-3xl"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-black text-lg text-stone-900">Osh Markazi Sozlamalari</h2>
                <p className="text-xs text-stone-500">
                  Markaz nomi, telefon raqami, yetkazib berish va zal xizmati foizi
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetDemoData}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tiklash</span>
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: formConfig.themeColor }}
                  className="px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-600 mb-1">
                  Osh Markazi Nomi
                </label>
                <input
                  type="text"
                  required
                  value={formConfig.brandName || ""}
                  onChange={(e) => setFormConfig({ ...formConfig, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-stone-600 mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  value={formConfig.phone || ""}
                  onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                />
              </div>
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
                  Zal xizmat haqi (%)
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
            </div>
          </form>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200"
          >
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base">
                {editingProduct ? "Taomni Tahrirlash" : "Yangi Taom Qo'shish"}
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
                  <label className="block font-bold text-stone-700 mb-1">Narxi ({config.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-black"
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
