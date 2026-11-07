const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const {
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
} = require("./seedData");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Persistent JSON Database Setup
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFreshSeedState() {
  return {
    config: JSON.parse(JSON.stringify(initialConfig)),
    branches: JSON.parse(JSON.stringify(initialBranches)),
    stories: JSON.parse(JSON.stringify(initialStories)),
    categories: JSON.parse(JSON.stringify(initialCategories)),
    products: JSON.parse(JSON.stringify(initialProducts)),
    tables: JSON.parse(JSON.stringify(initialTables)),
    promos: JSON.parse(JSON.stringify(initialPromos)),
    orders: JSON.parse(JSON.stringify(initialOrders)),
    shift: JSON.parse(JSON.stringify(initialShift)),
    queueCounter: 106
  };
}

let db = getFreshSeedState();

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw);
      db = {
        ...getFreshSeedState(),
        ...parsed,
        config: { ...initialConfig, ...(parsed.config || {}), presets: brandPresets }
      };
    } else {
      saveDb();
    }
  } catch (err) {
    console.error("Error loading DB, using seed state:", err.message);
    db = getFreshSeedState();
    saveDb();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving DB:", err.message);
  }
}

loadDb();

// Real-Time Server-Sent Events (SSE) Clients
const sseClients = new Set();

function broadcastEvent(type, payload) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`);
  sseClients.add(res);

  const keepAlive = setInterval(() => {
    try {
      res.write(`: keep-alive\n\n`);
    } catch (e) {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// ================= BOOTSTRAP / INITIAL STATE =================
app.get("/api/bootstrap", (req, res) => {
  res.json({
    config: db.config,
    branches: db.branches,
    stories: db.stories,
    categories: db.categories,
    products: db.products,
    tables: db.tables,
    promos: db.promos,
    orders: db.orders,
    shift: db.shift
  });
});

// ================= UNIVERSAL WHITE-LABEL BRAND CONFIG =================
app.get("/api/config", (req, res) => {
  res.json(db.config);
});

app.put("/api/config", (req, res) => {
  db.config = {
    ...db.config,
    ...req.body,
    presets: brandPresets
  };
  saveDb();
  broadcastEvent("CONFIG_UPDATED", db.config);
  res.json(db.config);
});

app.post("/api/config/preset/:presetId", (req, res) => {
  const preset = brandPresets.find((p) => p.id === req.params.presetId);
  if (!preset) {
    return res.status(404).json({ error: "Preset topilmadi" });
  }
  db.config = {
    ...db.config,
    brandName: preset.brandName,
    brandSubtitle: preset.brandSubtitle,
    logoEmoji: preset.logoEmoji,
    themeColor: preset.themeColor,
    accentColor: preset.accentColor,
    slogan: preset.slogan,
    badgeText: preset.badgeText
  };
  saveDb();
  broadcastEvent("CONFIG_UPDATED", db.config);
  res.json(db.config);
});

// ================= PRODUCTS & MENU MANAGEMENT =================
app.get("/api/products", (req, res) => {
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const body = req.body;
  const newProduct = {
    id: `prod-${Date.now()}`,
    sku: body.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
    categoryId: body.categoryId || "plov",
    name: body.name || "Yangi Taom",
    description: body.description || "",
    price: Number(body.price) || 35000,
    oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
    weight: body.weight || "400g",
    calories: body.calories || "650 kkal",
    prepTime: body.prepTime || "5 daq",
    image:
      body.image ||
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    isPopular: Boolean(body.isPopular),
    isCombo: Boolean(body.isCombo),
    badge: body.badge || "",
    variants: Array.isArray(body.variants) ? body.variants : [],
    modifiers: Array.isArray(body.modifiers) ? body.modifiers : []
  };
  db.products.unshift(newProduct);
  saveDb();
  broadcastEvent("PRODUCTS_UPDATED", db.products);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Mahsulot topilmadi" });

  db.products[idx] = {
    ...db.products[idx],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : db.products[idx].price
  };
  saveDb();
  broadcastEvent("PRODUCTS_UPDATED", db.products);
  res.json(db.products[idx]);
});

app.patch("/api/products/:id/stock", (req, res) => {
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Mahsulot topilmadi" });

  db.products[idx].inStock = req.body.inStock !== undefined ? Boolean(req.body.inStock) : !db.products[idx].inStock;
  saveDb();
  broadcastEvent("PRODUCTS_UPDATED", db.products);
  res.json(db.products[idx]);
});

app.delete("/api/products/:id", (req, res) => {
  db.products = db.products.filter((p) => p.id !== req.params.id);
  saveDb();
  broadcastEvent("PRODUCTS_UPDATED", db.products);
  res.json({ success: true });
});

// ================= CATEGORIES & BRANCHES & TABLES =================
app.get("/api/categories", (req, res) => res.json(db.categories));

app.get("/api/branches", (req, res) => res.json(db.branches));

app.put("/api/branches/:id", (req, res) => {
  const idx = db.branches.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Filial topilmadi" });
  db.branches[idx] = { ...db.branches[idx], ...req.body };
  saveDb();
  broadcastEvent("BRANCHES_UPDATED", db.branches);
  res.json(db.branches[idx]);
});

app.get("/api/tables", (req, res) => res.json(db.tables));

app.put("/api/tables/:id", (req, res) => {
  const idx = db.tables.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Stol topilmadi" });
  db.tables[idx] = { ...db.tables[idx], ...req.body };
  saveDb();
  broadcastEvent("TABLES_UPDATED", db.tables);
  res.json(db.tables[idx]);
});

// ================= PROMO CODES =================
app.post("/api/promos/validate", (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const subtotal = Number(req.body.subtotal || 0);
  const promo = db.promos.find((p) => p.code.toUpperCase() === code);
  if (!promo) {
    return res.status(404).json({ valid: false, message: "Bunday promokod mavjud emas" });
  }
  if (subtotal < promo.minOrder) {
    return res.status(400).json({
      valid: false,
      message: `Ushbu promokod kamida ${promo.minOrder.toLocaleString()} so'mlik buyurtmalar uchun amal qiladi`
    });
  }
  return res.json({
    valid: true,
    promo
  });
});

// ================= ORDERS (POS, WEB, KDS, QUEUE) =================
app.get("/api/orders", (req, res) => {
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const body = req.body;
  db.queueCounter = (db.queueCounter || 105) + 1;
  const prefix =
    body.orderType === "delivery"
      ? "D"
      : body.source === "uzum" || body.source === "yandex"
      ? "K"
      : db.config.queuePrefix || "A";
  const queueNumber = body.queueNumber || `${prefix}-${db.queueCounter}`;

  const nowIso = new Date().toISOString();
  const items = (body.items || []).map((item, index) => ({
    id: item.id || `item-${Date.now()}-${index}`,
    productId: item.productId,
    name: item.name,
    variantName: item.variantName || "",
    modifiers: Array.isArray(item.modifiers) ? item.modifiers : [],
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || 0,
    totalPrice: Number(item.totalPrice) || (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    note: item.note || "",
    ready: false
  }));

  const newOrder = {
    id: `ord-${Date.now()}`,
    queueNumber,
    source: body.source || "web", // web | pos | qr_table | uzum | yandex
    orderType: body.orderType || "pickup", // delivery | pickup | dine_in
    tableId: body.tableId || null,
    tableName:
      body.tableName ||
      (body.orderType === "delivery"
        ? "Yetkazib berish 🛵"
        : body.orderType === "dine_in"
        ? "Zal Stoli"
        : "O'zi bilan (Pickup)"),
    branchId: body.branchId || db.config.activeBranchId || "branch-1",
    customerName: body.customerName || "Hurmatli Mijoz",
    customerPhone: body.customerPhone || "",
    address: body.address || "",
    status: body.status || (body.source === "pos" ? "cooking" : "new"), // new | cooking | ready | delivering | completed | cancelled
    paymentStatus: body.paymentStatus || "paid",
    paymentMethod: body.paymentMethod || "cash", // cash | card | click | payme | split
    cashReceived: body.cashReceived ? Number(body.cashReceived) : 0,
    changeAmount: body.changeAmount ? Number(body.changeAmount) : 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    cashierName: body.cashierName || (body.source === "pos" ? db.shift.cashierName : "Online Sayt"),
    note: body.note || "",
    promoCode: body.promoCode || "",
    items,
    subtotal: Number(body.subtotal) || 0,
    discount: Number(body.discount) || 0,
    serviceFee: Number(body.serviceFee) || 0,
    deliveryFee: Number(body.deliveryFee) || 0,
    total: Number(body.total) || 0
  };

  db.orders.unshift(newOrder);

  // If dine_in with tableId, mark table occupied
  if (newOrder.tableId) {
    const tIdx = db.tables.findIndex((t) => t.id === newOrder.tableId);
    if (tIdx !== -1) {
      db.tables[tIdx].status = "occupied";
      db.tables[tIdx].currentOrderId = newOrder.id;
      broadcastEvent("TABLES_UPDATED", db.tables);
    }
  }

  saveDb();
  broadcastEvent("ORDER_CREATED", newOrder);
  broadcastEvent("ORDERS_UPDATED", db.orders);
  res.status(201).json(newOrder);
});

app.patch("/api/orders/:id/status", (req, res) => {
  const idx = db.orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Buyurtma topilmadi" });

  const { status } = req.body;
  db.orders[idx].status = status;
  db.orders[idx].updatedAt = new Date().toISOString();

  if (status === "ready" || status === "completed") {
    db.orders[idx].items = db.orders[idx].items.map((it) => ({ ...it, ready: true }));
  }

  // If completed or cancelled and bound to a table, free the table
  if ((status === "completed" || status === "cancelled") && db.orders[idx].tableId) {
    const tIdx = db.tables.findIndex((t) => t.id === db.orders[idx].tableId);
    if (tIdx !== -1) {
      db.tables[tIdx].status = "free";
      db.tables[tIdx].currentOrderId = null;
      broadcastEvent("TABLES_UPDATED", db.tables);
    }
  }

  saveDb();
  broadcastEvent("ORDER_STATUS_CHANGED", db.orders[idx]);
  broadcastEvent("ORDERS_UPDATED", db.orders);
  res.json(db.orders[idx]);
});

app.patch("/api/orders/:id/items/:itemId", (req, res) => {
  const idx = db.orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Buyurtma topilmadi" });

  const order = db.orders[idx];
  const itemIdx = order.items.findIndex((it) => it.id === req.params.itemId);
  if (itemIdx === -1) return res.status(404).json({ error: "Taom qatori topilmadi" });

  order.items[itemIdx].ready =
    req.body.ready !== undefined ? Boolean(req.body.ready) : !order.items[itemIdx].ready;
  order.updatedAt = new Date().toISOString();

  saveDb();
  broadcastEvent("ORDERS_UPDATED", db.orders);
  res.json(order);
});

app.delete("/api/orders/:id", (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (order && order.tableId) {
    const tIdx = db.tables.findIndex((t) => t.id === order.tableId);
    if (tIdx !== -1) {
      db.tables[tIdx].status = "free";
      db.tables[tIdx].currentOrderId = null;
      broadcastEvent("TABLES_UPDATED", db.tables);
    }
  }
  db.orders = db.orders.filter((o) => o.id !== req.params.id);
  saveDb();
  broadcastEvent("ORDERS_UPDATED", db.orders);
  res.json({ success: true });
});

// ================= SHIFT & ANALYTICS =================
app.get("/api/shift", (req, res) => res.json(db.shift));

app.post("/api/shift/toggle", (req, res) => {
  db.shift.isOpen = !db.shift.isOpen;
  if (db.shift.isOpen) {
    db.shift.openedAt = new Date().toISOString();
    if (req.body.cashierName) db.shift.cashierName = req.body.cashierName;
  } else {
    db.shift.closedAt = new Date().toISOString();
  }
  saveDb();
  broadcastEvent("SHIFT_UPDATED", db.shift);
  res.json(db.shift);
});

app.get("/api/analytics", (req, res) => {
  const validOrders = db.orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = validOrders.length;
  const averageCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const byPayment = { cash: 0, card: 0, click: 0, payme: 0, split: 0 };
  const bySource = { web: 0, pos: 0, qr_table: 0, uzum: 0, yandex: 0 };
  const byType = { dine_in: 0, pickup: 0, delivery: 0 };
  const productSales = {};

  for (const order of validOrders) {
    const pm = order.paymentMethod || "cash";
    byPayment[pm] = (byPayment[pm] || 0) + (Number(order.total) || 0);

    const src = order.source || "pos";
    bySource[src] = (bySource[src] || 0) + 1;

    const tp = order.orderType || "pickup";
    byType[tp] = (byType[tp] || 0) + 1;

    for (const item of order.items || []) {
      if (!productSales[item.name]) {
        productSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[item.name].qty += Number(item.quantity) || 1;
      productSales[item.name].revenue += Number(item.totalPrice) || 0;
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  res.json({
    totalRevenue,
    totalOrders,
    averageCheck,
    byPayment,
    bySource,
    byType,
    topProducts
  });
});

// ================= DEMO RESET =================
app.post("/api/reset-demo", (req, res) => {
  db = getFreshSeedState();
  saveDb();
  broadcastEvent("FULL_RESET", db);
  res.json({ success: true, db });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍛 Universal Osh Markazi & POS Backend Server`);
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📡 Real-time SSE oqimi: http://localhost:${PORT}/api/events`);
  console.log(`====================================================`);
});
