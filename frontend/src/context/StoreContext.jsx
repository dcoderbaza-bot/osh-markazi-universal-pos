import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sound } from "../utils/sound";

const StoreContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function StoreProvider({ children }) {
  const [config, setConfig] = useState({
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
    presets: []
  });

  const [branches, setBranches] = useState([]);
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [promos, setPromos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shift, setShift] = useState({
    isOpen: true,
    cashierName: "Dilshod Rahimov",
    branchName: "Markaziy Osh Markazi",
    startingCash: 500000
  });

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    const saved = localStorage.getItem("osh_loyalty_points");
    return saved ? Number(saved) : 15000; // Initial welcome bonus 15,000 so'm
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3400 ? null : prev));
    }, 3500);
  }, []);

  // Apply dynamic brand theme CSS variables
  useEffect(() => {
    if (config?.themeColor) {
      document.documentElement.style.setProperty("--brand-primary", config.themeColor);
    }
    if (config?.accentColor) {
      document.documentElement.style.setProperty("--brand-accent", config.accentColor);
    }
    if (config?.brandName) {
      document.title = `${config.brandName} — ${config.brandSubtitle || "Rasmiy Sayt & POS"}`;
    }
  }, [config]);

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bootstrap`);
      if (!res.ok) throw new Error("Server javob bermadi");
      const data = await res.json();
      if (data.config) setConfig(data.config);
      if (data.branches) setBranches(data.branches);
      if (data.stories) setStories(data.stories);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.tables) setTables(data.tables);
      if (data.promos) setPromos(data.promos);
      if (data.orders) setOrders(data.orders);
      if (data.shift) setShift(data.shift);
      setIsConnected(true);
    } catch (err) {
      console.warn("Backend ulanish xatosi:", err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();

    // Real-time Server-Sent Events (SSE) subscription
    let es;
    let reconnectTimer;

    const connectSSE = () => {
      try {
        es = new EventSource(`${API_BASE}/events`);
        es.onopen = () => setIsConnected(true);
        es.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case "CONFIG_UPDATED":
                setConfig(msg.payload);
                break;
              case "PRODUCTS_UPDATED":
                setProducts(msg.payload);
                break;
              case "BRANCHES_UPDATED":
                setBranches(msg.payload);
                break;
              case "TABLES_UPDATED":
                setTables(msg.payload);
                break;
              case "ORDER_CREATED":
                sound.playNewOrderBell();
                break;
              case "ORDER_STATUS_CHANGED":
                if (msg.payload?.status === "ready") {
                  sound.playQueueDingDong();
                }
                break;
              case "ORDERS_UPDATED":
                setOrders(msg.payload);
                break;
              case "SHIFT_UPDATED":
                setShift(msg.payload);
                break;
              case "FULL_RESET":
                if (msg.payload) {
                  setConfig(msg.payload.config);
                  setBranches(msg.payload.branches);
                  setCategories(msg.payload.categories);
                  setProducts(msg.payload.products);
                  setTables(msg.payload.tables);
                  setOrders(msg.payload.orders);
                  setShift(msg.payload.shift);
                }
                break;
              default:
                break;
            }
          } catch {
            // ignore parse errors
          }
        };
        es.onerror = () => {
          setIsConnected(false);
          es.close();
          reconnectTimer = setTimeout(connectSSE, 4000);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (es) es.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [fetchBootstrap]);

  // Actions
  const updateConfig = async (newConfig) => {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      const updated = await res.json();
      setConfig(updated);
      showToast("Brend va tizim sozlamalari saqlandi!");
      return updated;
    } catch (err) {
      setConfig((prev) => ({ ...prev, ...newConfig }));
      showToast("Lokal rejimda brend yangilandi", "info");
    }
  };

  const applyBrandPreset = async (presetId) => {
    try {
      const res = await fetch(`${API_BASE}/config/preset/${presetId}`, {
        method: "POST"
      });
      const updated = await res.json();
      setConfig(updated);
      sound.playCashRegister();
      showToast(`Brend "${updated.brandName}" uslubiga o'zgartirildi!`);
      return updated;
    } catch (err) {
      showToast("Brend shablonini yuklashda xatolik", "error");
    }
  };

  const createOrder = async (orderPayload) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const created = await res.json();
      setOrders((prev) => {
        if (prev.some((o) => o.id === created.id)) return prev;
        return [created, ...prev];
      });

      // Earn 5% cashback points if customer order
      if (orderPayload.source === "web") {
        const earned = Math.round((Number(orderPayload.total) || 0) * ((config.cashbackPercent || 5) / 100));
        const usedBonus = Number(orderPayload.usedBonus) || 0;
        const nextPoints = Math.max(0, loyaltyPoints - usedBonus + earned);
        setLoyaltyPoints(nextPoints);
        localStorage.setItem("osh_loyalty_points", String(nextPoints));
      }

      sound.playCashRegister();
      return created;
    } catch (err) {
      // Fallback local order creation if server is unreachable
      const fallbackOrder = {
        id: `ord-${Date.now()}`,
        queueNumber: `A-${100 + orders.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: orderPayload.source === "pos" ? "cooking" : "new",
        ...orderPayload
      };
      setOrders((prev) => [fallbackOrder, ...prev]);
      sound.playCashRegister();
      return fallbackOrder;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (status === "ready") {
        sound.playQueueDingDong();
      } else {
        sound.playPosTap();
      }
      return updated;
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
      );
    }
  };

  const toggleOrderItemReady = async (orderId, itemId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      sound.playPosTap();
    } catch {
      // local fallback
    }
  };

  const toggleProductStock = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
        method: "PATCH"
      });
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`${updated.name}: ${updated.inStock ? "Sotuvga qaytarildi ✅" : "Stop-listga olindi ⛔"}`);
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
      );
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      const created = await res.json();
      setProducts((prev) => [created, ...prev]);
      showToast(`"${created.name}" menyuga qo'shildi!`);
      return created;
    } catch {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`"${updated.name}" yangilandi!`);
      return updated;
    } catch {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await fetch(`${API_BASE}/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast("Taom menyudan o'chirildi");
    } catch {
      showToast("O'chirishda xatolik", "error");
    }
  };

  const updateTableStatus = async (tableId, tableData) => {
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tableData)
      });
      const updated = await res.json();
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
      return updated;
    } catch {
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, ...tableData } : t)));
    }
  };

  const toggleShift = async (cashierName) => {
    try {
      const res = await fetch(`${API_BASE}/shift/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashierName })
      });
      const updated = await res.json();
      setShift(updated);
      showToast(updated.isOpen ? "Yangi kassa smenasi ochildi!" : "Kassa smenasi yopildi (Z-Report tayyor)");
      return updated;
    } catch {
      setShift((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    }
  };

  const resetDemoData = async () => {
    try {
      const res = await fetch(`${API_BASE}/reset-demo`, { method: "POST" });
      const data = await res.json();
      if (data.db) {
        setConfig(data.db.config);
        setBranches(data.db.branches);
        setCategories(data.db.categories);
        setProducts(data.db.products);
        setTables(data.db.tables);
        setOrders(data.db.orders);
        setShift(data.db.shift);
      }
      showToast("Tizim boshlang'ich demo holatiga qaytarildi!");
    } catch {
      showToast("Server bilan aloqa yo'q", "error");
    }
  };

  return (
    <StoreContext.Provider
      value={{
        config,
        branches,
        stories,
        categories,
        products,
        tables,
        promos,
        orders,
        shift,
        isConnected,
        loading,
        toast,
        loyaltyPoints,
        showToast,
        updateConfig,
        applyBrandPreset,
        createOrder,
        updateOrderStatus,
        toggleOrderItemReady,
        toggleProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        updateTableStatus,
        toggleShift,
        resetDemoData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
