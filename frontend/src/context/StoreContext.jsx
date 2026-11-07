import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sound } from "../utils/sound";

const StoreContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const FALLBACK_ROLES = [
  {
    id: "usr-cashier",
    username: "kassir",
    passwordHint: "kassir123",
    role: "cashier",
    roleLabel: "Kassir (POS Operator)",
    fullName: "Dilshod Rahimov",
    allowedModules: ["pos", "queue"],
    avatar: "🖥️"
  },
  {
    id: "usr-chef",
    username: "oshpaz",
    passwordHint: "oshpaz123",
    role: "chef",
    roleLabel: "Bosh Oshpaz (KDS)",
    fullName: "Usta Jamshid Oshpaz",
    allowedModules: ["kds", "queue"],
    avatar: "👨‍🍳"
  },
  {
    id: "usr-tv",
    username: "ekran",
    passwordHint: "ekran123",
    role: "tv_operator",
    roleLabel: "Zal Navbat Ekrani",
    fullName: "Zal TV Terminali",
    allowedModules: ["queue"],
    avatar: "📺"
  },
  {
    id: "usr-admin",
    username: "admin",
    passwordHint: "admin123",
    role: "admin",
    roleLabel: "Boshqaruvchi / Admin",
    fullName: "Sanjarbek Rahbar",
    allowedModules: ["admin", "pos", "kds", "queue", "security"],
    avatar: "👔"
  },
  {
    id: "usr-security",
    username: "secadmin",
    passwordHint: "sec12345",
    role: "security",
    roleLabel: "Kiberxavfsizlik (SOC)",
    fullName: "Axborot Xavfsizligi Bo'limi",
    allowedModules: ["security", "admin", "pos", "kds", "queue"],
    avatar: "🛡️"
  }
];

export function StoreProvider({ children }) {
  const [config, setConfig] = useState({
    brandName: "ASL OSH MARKAZI",
    brandSubtitle: "Milliy Taomlar & Fast-Casual Express",
    logoEmoji: "🍛",
    themeColor: "#D97706",
    accentColor: "#B45309",
    slogan: "Har kuni 5 xil qozonda yangi damlangan issiq osh — 25 daqiqada dasturxoningizda!",
    badgeText: "Qozonlar Ochiq • Issiq Osh Tayyor 🔥",
    currency: "so'm",
    phone: "+998 (71) 200-55-77",
    workingHours: "07:00 - 23:30",
    deliveryFee: 15000,
    freeDeliveryMin: 150000,
    serviceChargePercent: 10,
    cashbackPercent: 5,
    queuePrefix: "A",
    receiptHeader: "Xush kelibsiz! Yoqimli ishtaha tilaymiz!",
    receiptFooter: "Xaridingiz uchun rahmat!"
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
    startingCash: 500000
  });

  // RBAC Auth & Cybersecurity State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("osh_staff_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rolesOverview, setRolesOverview] = useState(FALLBACK_ROLES);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({
    wafEnabled: true,
    bruteForceProtection: true,
    rateLimitEnabled: true,
    fiscalHashEnabled: true,
    strictRbac: true
  });
  const [blockedIps, setBlockedIps] = useState(["185.220.101.44", "45.155.205.233"]);
  const [statsBlockedAttacks, setStatsBlockedAttacks] = useState(14);

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    const saved = localStorage.getItem("osh_loyalty_points");
    return saved ? Number(saved) : 15000;
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3400 ? null : prev));
    }, 3500);
  }, []);

  useEffect(() => {
    if (config?.themeColor) {
      document.documentElement.style.setProperty("--brand-primary", config.themeColor);
    }
    if (config?.brandName) {
      document.title = `${config.brandName} — Rasmiy Sayt & POS`;
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
      if (data.securityLogs) setSecurityLogs(data.securityLogs);
      if (data.securitySettings) setSecuritySettings(data.securitySettings);
      if (data.blockedIps) setBlockedIps(data.blockedIps);
      if (data.statsBlockedAttacks !== undefined) setStatsBlockedAttacks(data.statsBlockedAttacks);
      if (data.rolesOverview) setRolesOverview(data.rolesOverview);
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
              case "SECURITY_UPDATED":
                if (msg.payload) {
                  if (msg.payload.securityLogs) setSecurityLogs(msg.payload.securityLogs);
                  if (msg.payload.securitySettings) setSecuritySettings(msg.payload.securitySettings);
                  if (msg.payload.blockedIps) setBlockedIps(msg.payload.blockedIps);
                  if (msg.payload.statsBlockedAttacks !== undefined)
                    setStatsBlockedAttacks(msg.payload.statsBlockedAttacks);
                }
                break;
              case "FULL_RESET":
                if (msg.payload) {
                  setConfig(msg.payload.config);
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
            // ignore
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

  // RBAC Login & Logout
  const loginStaff = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Login yoki parol xato!", "error");
        return { success: false, error: data.error };
      }
      setCurrentUser(data.user);
      sessionStorage.setItem("osh_staff_session", JSON.stringify(data.user));
      sound.playCashRegister();
      showToast(`Xush kelibsiz, ${data.user.fullName} (${data.user.roleLabel})!`);
      return { success: true, user: data.user };
    } catch {
      // Fallback local check if offline
      const found = FALLBACK_ROLES.find(
        (r) => r.username === username.trim().toLowerCase() && r.passwordHint === password
      );
      if (found) {
        setCurrentUser(found);
        sessionStorage.setItem("osh_staff_session", JSON.stringify(found));
        sound.playCashRegister();
        showToast(`Xush kelibsiz, ${found.fullName}!`);
        return { success: true, user: found };
      }
      showToast("Login yoki parol noto'g'ri!", "error");
      return { success: false, error: "Login yoki parol noto'g'ri!" };
    }
  };

  const logoutStaff = async () => {
    try {
      if (currentUser) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser.username })
        });
      }
    } catch {
      // ignore
    }
    setCurrentUser(null);
    sessionStorage.removeItem("osh_staff_session");
    sound.playPosTap();
    showToast("Xodim tizimidan chiqdingiz (Mijozlar rejimiga qaytildi)");
  };

  // Cybersecurity Actions
  const toggleSecuritySetting = async (key) => {
    try {
      const res = await fetch(`${API_BASE}/security/toggle-setting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      const updated = await res.json();
      setSecuritySettings(updated);
      sound.playPosTap();
      showToast("Kiberxavfsizlik parametri yangilandi!");
    } catch {
      setSecuritySettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const blockIp = async (ip) => {
    try {
      const res = await fetch(`${API_BASE}/security/block-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.blockedIps) setBlockedIps(data.blockedIps);
      showToast(`IP manzil (${ip}) bloklandi!`);
    } catch {
      setBlockedIps((prev) => [ip, ...prev]);
    }
  };

  const unblockIp = async (ip) => {
    try {
      const res = await fetch(`${API_BASE}/security/unblock-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.blockedIps) setBlockedIps(data.blockedIps);
      showToast(`IP manzil (${ip}) blokdan chiqarildi!`);
    } catch {
      setBlockedIps((prev) => prev.filter((i) => i !== ip));
    }
  };

  const simulateAttack = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/security/simulate-attack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.securityLogs) setSecurityLogs(data.securityLogs);
      if (data.statsBlockedAttacks !== undefined) setStatsBlockedAttacks(data.statsBlockedAttacks);
      sound.playNewOrderBell();
      showToast("WAF Himoyasi sinov hujumini muvaffaqiyatli tutib qoldi!");
    } catch {
      showToast("Sinov hujumi bloklandi");
    }
  };

  // Standard Actions
  const updateConfig = async (newConfig) => {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      const updated = await res.json();
      setConfig(updated);
      showToast("Tizim sozlamalari saqlandi!");
      return updated;
    } catch {
      setConfig((prev) => ({ ...prev, ...newConfig }));
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
      setOrders((prev) => (prev.some((o) => o.id === created.id) ? prev : [created, ...prev]));

      if (orderPayload.source === "web") {
        const earned = Math.round((Number(orderPayload.total) || 0) * ((config.cashbackPercent || 5) / 100));
        const usedBonus = Number(orderPayload.usedBonus) || 0;
        const nextPoints = Math.max(0, loyaltyPoints - usedBonus + earned);
        setLoyaltyPoints(nextPoints);
        localStorage.setItem("osh_loyalty_points", String(nextPoints));
      }

      sound.playCashRegister();
      return created;
    } catch {
      const fallbackOrder = {
        id: `ord-${Date.now()}`,
        queueNumber: `A-${100 + orders.length + 1}`,
        createdAt: new Date().toISOString(),
        status: orderPayload.source === "pos" ? "cooking" : "new",
        fiscalHash: "SHA256-LOCAL",
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
      if (status === "ready") sound.playQueueDingDong();
      else sound.playPosTap();
      return updated;
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
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
      // ignore
    }
  };

  const toggleProductStock = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/stock`, { method: "PATCH" });
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`${updated.name}: ${updated.inStock ? "Sotuvda ✅" : "Stop-listda ⛔"}`);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p)));
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
      showToast("Xatolik", "error");
    }
  };

  const toggleShift = async () => {
    try {
      const res = await fetch(`${API_BASE}/shift/toggle`, { method: "POST" });
      const updated = await res.json();
      setShift(updated);
      showToast(updated.isOpen ? "Smena ochildi" : "Smena yopildi");
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
        setProducts(data.db.products);
        setTables(data.db.tables);
        setOrders(data.db.orders);
      }
      showToast("Demo ma'lumotlar tiklandi!");
    } catch {
      showToast("Xatolik", "error");
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
        currentUser,
        rolesOverview,
        securityLogs,
        securitySettings,
        blockedIps,
        statsBlockedAttacks,
        isConnected,
        loading,
        toast,
        loyaltyPoints,
        showToast,
        loginStaff,
        logoutStaff,
        toggleSecuritySetting,
        blockIp,
        unblockIp,
        simulateAttack,
        updateConfig,
        createOrder,
        updateOrderStatus,
        toggleOrderItemReady,
        toggleProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
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
