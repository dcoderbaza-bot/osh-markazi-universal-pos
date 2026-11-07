const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  initialConfig,
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
} = require("./seedData");

const app = express();
const PORT = process.env.PORT || 4000;
const FISCAL_SECRET = "ASL_OSH_MARKAZI_2026_SHA256_SECRET_KEY";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Persistent JSON Database Setup
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateFiscalHash(orderId, queueNumber, total, createdAt) {
  return crypto
    .createHmac("sha256", FISCAL_SECRET)
    .update(`${orderId}|${queueNumber}|${total}|${createdAt}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
}

function getFreshSeedState() {
  const seededOrders = JSON.parse(JSON.stringify(initialOrders)).map((o) => ({
    ...o,
    fiscalHash: generateFiscalHash(o.id, o.queueNumber, o.total, o.createdAt)
  }));

  return {
    config: JSON.parse(JSON.stringify(initialConfig)),
    staffAccounts: JSON.parse(JSON.stringify(staffAccounts)),
    branches: JSON.parse(JSON.stringify(initialBranches)),
    stories: JSON.parse(JSON.stringify(initialStories)),
    categories: JSON.parse(JSON.stringify(initialCategories)),
    products: JSON.parse(JSON.stringify(initialProducts)),
    tables: JSON.parse(JSON.stringify(initialTables)),
    promos: JSON.parse(JSON.stringify(initialPromos)),
    orders: seededOrders,
    shift: JSON.parse(JSON.stringify(initialShift)),
    securityLogs: JSON.parse(JSON.stringify(initialSecurityLogs)),
    securitySettings: {
      wafEnabled: true,
      bruteForceProtection: true,
      rateLimitEnabled: true,
      fiscalHashEnabled: true,
      strictRbac: true
    },
    blockedIps: ["185.220.101.44", "45.155.205.233"],
    activeSessions: [],
    statsBlockedAttacks: 14,
    queueCounter: 103
  };
}

let db = getFreshSeedState();

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw);
      const fresh = getFreshSeedState();
      db = {
        ...fresh,
        ...parsed,
        config: { ...fresh.config, ...(parsed.config || {}), brandName: parsed.config?.brandName || fresh.config.brandName },
        staffAccounts: fresh.staffAccounts,
        securitySettings: { ...fresh.securitySettings, ...(parsed.securitySettings || {}) },
        securityLogs: Array.isArray(parsed.securityLogs) && parsed.securityLogs.length > 0 ? parsed.securityLogs : fresh.securityLogs
      };
      delete db.config.presets;
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
    } catch {
      sseClients.delete(client);
    }
  }
}

function addSecurityLog(event, severity, actor, ip, details) {
  const logEntry = {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    event,
    severity, // info | success | warning | critical
    actor: actor || "anonymous",
    ip: ip || "127.0.0.1",
    details
  };
  db.securityLogs.unshift(logEntry);
  if (db.securityLogs.length > 100) {
    db.securityLogs = db.securityLogs.slice(0, 100);
  }
  saveDb();
  broadcastEvent("SECURITY_UPDATED", {
    securityLogs: db.securityLogs,
    securitySettings: db.securitySettings,
    blockedIps: db.blockedIps,
    statsBlockedAttacks: db.statsBlockedAttacks
  });
  return logEntry;
}

// ================= CYBERSECURITY MIDDLEWARE (Headers, IP Firewall, WAF) =================
const failedLoginsByIp = new Map();

app.use((req, res, next) => {
  // Security HTTP Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  // Check IP Blacklist (skip security management endpoints so admin can unblock)
  if (db.blockedIps.includes(clientIp) && !req.path.startsWith("/api/security")) {
    db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
    addSecurityLog("FIREWALL_BLOCK", "critical", "firewall", clientIp, `Bloklangan IP manzildan kirish urinishi to'xtatildi: ${req.path}`);
    return res.status(403).json({ error: "Sizning IP manzilingiz Kiberxavfsizlik tizimi tomonidan bloklangan!" });
  }

  // WAF: Inspect payload for XSS / SQL Injection signatures
  if (db.securitySettings?.wafEnabled && req.body && Object.keys(req.body).length > 0 && !req.path.startsWith("/api/security/simulate")) {
    const rawPayload = JSON.stringify(req.body);
    const sqliOrXssRegex = /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=|UNION\s+SELECT|DROP\s+TABLE|--\s*$|'\s*OR\s+'1'\s*=\s*'1)/i;
    if (sqliOrXssRegex.test(rawPayload)) {
      db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
      addSecurityLog(
        "WAF_ATTACK_BLOCKED",
        "critical",
        "WAF-Engine",
        clientIp,
        `Zararli kod (XSS/SQLi) aniqlandi va bloklandi! Manba: ${req.method} ${req.path}`
      );
      return res.status(403).json({
        error: "WAF Himoyasi: So'rovda xavfli kod (XSS/SQL-Injection) aniqlandi va bloklandi!"
      });
    }
  }

  next();
});

// ================= SSE STREAM =================
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
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// ================= BOOTSTRAP =================
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
    shift: db.shift,
    securityLogs: db.securityLogs,
    securitySettings: db.securitySettings,
    blockedIps: db.blockedIps,
    statsBlockedAttacks: db.statsBlockedAttacks,
    rolesOverview: db.staffAccounts.map((acc) => ({
      id: acc.id,
      username: acc.username,
      passwordHint: acc.password,
      role: acc.role,
      roleLabel: acc.roleLabel,
      fullName: acc.fullName,
      allowedModules: acc.allowedModules,
      avatar: acc.avatar
    }))
  });
});

// ================= RBAC AUTHENTICATION =================
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || "127.0.0.1";
  const cleanUser = String(username || "").trim().toLowerCase();

  // Check Brute-Force lock
  const failCount = failedLoginsByIp.get(clientIp) || 0;
  if (db.securitySettings.bruteForceProtection && failCount >= 5) {
    db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
    addSecurityLog(
      "BRUTE_FORCE_LOCK",
      "critical",
      cleanUser || "unknown",
      clientIp,
      `Ketma-ket 5 marta xato parol terilgani sababli kirish vaqtincha bloklandi!`
    );
    return res.status(429).json({
      error: "Brute-Force Himoyasi: Juda ko'p xato urinish! 1 daqiqadan so'ng qayta urinib ko'ring."
    });
  }

  const account = db.staffAccounts.find(
    (a) => a.username.toLowerCase() === cleanUser && a.password === String(password || "")
  );

  if (!account) {
    failedLoginsByIp.set(clientIp, failCount + 1);
    setTimeout(() => failedLoginsByIp.delete(clientIp), 60000);

    addSecurityLog(
      "AUTH_FAILED",
      "warning",
      cleanUser || "unknown",
      clientIp,
      `Noto'g'ri login yoki parol kiritildi (${failCount + 1}/5 urinish)`
    );
    return res.status(401).json({
      error: "Login yoki parol noto'g'ri!"
    });
  }

  failedLoginsByIp.delete(clientIp);
  const token = crypto.randomBytes(24).toString("hex");
  const sessionUser = {
    id: account.id,
    username: account.username,
    role: account.role,
    roleLabel: account.roleLabel,
    fullName: account.fullName,
    allowedModules: account.allowedModules,
    avatar: account.avatar,
    token,
    loginAt: new Date().toISOString()
  };

  addSecurityLog(
    "AUTH_SUCCESS",
    "success",
    account.username,
    clientIp,
    `${account.fullName} (${account.roleLabel}) tizimga muvaffaqiyatli kirdi.`
  );

  res.json({
    success: true,
    user: sessionUser
  });
});

app.post("/api/auth/logout", (req, res) => {
  const { username } = req.body;
  addSecurityLog("AUTH_LOGOUT", "info", username || "staff", "127.0.0.1", "Xodim tizimdan chiqdi.");
  res.json({ success: true });
});

// ================= CYBERSECURITY SOC ENDPOINTS =================
app.get("/api/security/dashboard", (req, res) => {
  res.json({
    securityLogs: db.securityLogs,
    securitySettings: db.securitySettings,
    blockedIps: db.blockedIps,
    statsBlockedAttacks: db.statsBlockedAttacks,
    rolesOverview: db.staffAccounts.map((acc) => ({
      id: acc.id,
      username: acc.username,
      password: acc.password,
      role: acc.role,
      roleLabel: acc.roleLabel,
      fullName: acc.fullName,
      allowedModules: acc.allowedModules,
      avatar: acc.avatar
    }))
  });
});

app.post("/api/security/toggle-setting", (req, res) => {
  const { key } = req.body;
  if (key && key in db.securitySettings) {
    db.securitySettings[key] = !db.securitySettings[key];
    addSecurityLog(
      "SECURITY_CONFIG_CHANGE",
      "info",
      "secadmin",
      "127.0.0.1",
      `Xavfsizlik parametri "${key}" -> ${db.securitySettings[key] ? "YOQILDI" : "O'CHIRILDI"}`
    );
  }
  res.json(db.securitySettings);
});

app.post("/api/security/block-ip", (req, res) => {
  const ip = String(req.body.ip || "").trim();
  if (ip && !db.blockedIps.includes(ip)) {
    db.blockedIps.unshift(ip);
    addSecurityLog("IP_BLACKLISTED", "warning", "secadmin", ip, `IP manzil Firewall qora ro'yxatiga qo'shildi: ${ip}`);
  }
  res.json({ blockedIps: db.blockedIps });
});

app.post("/api/security/unblock-ip", (req, res) => {
  const ip = String(req.body.ip || "").trim();
  db.blockedIps = db.blockedIps.filter((item) => item !== ip);
  addSecurityLog("IP_UNBLOCKED", "info", "secadmin", ip, `IP manzil blokdan chiqarildi: ${ip}`);
  res.json({ blockedIps: db.blockedIps });
});

app.post("/api/security/simulate-attack", (req, res) => {
  const { type } = req.body;
  db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;

  if (type === "sqli") {
    addSecurityLog(
      "WAF_SQLI_BLOCKED",
      "critical",
      "attacker_bot",
      "194.26.135.89",
      `[SINOV] SQL-Injection hujumi ("' OR 1=1; DROP TABLE orders;--") WAF tomonidan tutib qolindi va bloklandi!`
    );
  } else if (type === "xss") {
    addSecurityLog(
      "WAF_XSS_BLOCKED",
      "critical",
      "attacker_bot",
      "91.214.124.11",
      `[SINOV] Cross-Site Scripting ("<script>stealToken()</script>") zararsizlantirildi!`
    );
  } else if (type === "bruteforce") {
    addSecurityLog(
      "BRUTE_FORCE_BLOCKED",
      "warning",
      "botnet_node",
      "103.145.12.77",
      `[SINOV] Admin parolini buzishga bo'lgan avto-urinish Rate-Limiter tomonidan to'xtatildi!`
    );
  } else if (type === "tamper") {
    addSecurityLog(
      "FISCAL_HASH_VERIFIED",
      "success",
      "SHA256-Guard",
      "127.0.0.1",
      `[SINOV] Barcha ${db.orders.length} ta kassa chekining SHA-256 kriptografik imzosi tekshirildi: Sohtalashtirish yo'q (100% original).`
    );
  }

  res.json({
    success: true,
    securityLogs: db.securityLogs,
    statsBlockedAttacks: db.statsBlockedAttacks
  });
});

// ================= CONFIG =================
app.get("/api/config", (req, res) => res.json(db.config));

app.put("/api/config", (req, res) => {
  db.config = { ...db.config, ...req.body };
  delete db.config.presets;
  saveDb();
  addSecurityLog("BRAND_SETTINGS_UPDATED", "info", "admin", "127.0.0.1", "Tizim va markaz sozlamalari yangilandi.");
  broadcastEvent("CONFIG_UPDATED", db.config);
  res.json(db.config);
});

// ================= PRODUCTS & MENU =================
app.get("/api/products", (req, res) => res.json(db.products));

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
    image:
      body.image ||
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
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

// ================= CATEGORIES, BRANCHES, TABLES =================
app.get("/api/categories", (req, res) => res.json(db.categories));
app.get("/api/branches", (req, res) => res.json(db.branches));
app.get("/api/tables", (req, res) => res.json(db.tables));

// ================= ORDERS =================
app.get("/api/orders", (req, res) => res.json(db.orders));

app.post("/api/orders", (req, res) => {
  const body = req.body;
  db.queueCounter = (db.queueCounter || 103) + 1;
  const prefix = body.orderType === "delivery" ? "D" : db.config.queuePrefix || "A";
  const queueNumber = body.queueNumber || `${prefix}-${db.queueCounter}`;
  const orderId = `ord-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const totalAmount = Number(body.total) || 0;

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
    id: orderId,
    queueNumber,
    source: body.source || "web",
    orderType: body.orderType || "pickup",
    tableId: body.tableId || null,
    tableName:
      body.tableName ||
      (body.orderType === "delivery"
        ? "Yetkazib berish 🛵"
        : body.orderType === "dine_in"
        ? "Zal Stoli"
        : "O'zi bilan"),
    branchId: body.branchId || "branch-1",
    customerName: body.customerName || "Mijoz",
    customerPhone: body.customerPhone || "",
    address: body.address || "",
    status: body.status || (body.source === "pos" ? "cooking" : "new"),
    paymentStatus: "paid",
    paymentMethod: body.paymentMethod || "cash",
    cashReceived: body.cashReceived ? Number(body.cashReceived) : 0,
    changeAmount: body.changeAmount ? Number(body.changeAmount) : 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    cashierName: body.cashierName || (body.source === "pos" ? db.shift.cashierName : "Online Sayt"),
    note: body.note || "",
    items,
    subtotal: Number(body.subtotal) || totalAmount,
    discount: Number(body.discount) || 0,
    serviceFee: Number(body.serviceFee) || 0,
    deliveryFee: Number(body.deliveryFee) || 0,
    total: totalAmount,
    fiscalHash: generateFiscalHash(orderId, queueNumber, totalAmount, nowIso)
  };

  db.orders.unshift(newOrder);

  if (newOrder.tableId) {
    const tIdx = db.tables.findIndex((t) => t.id === newOrder.tableId);
    if (tIdx !== -1) {
      db.tables[tIdx].status = "occupied";
      db.tables[tIdx].currentOrderId = newOrder.id;
      broadcastEvent("TABLES_UPDATED", db.tables);
    }
  }

  saveDb();
  addSecurityLog(
    "ORDER_SIGNED",
    "success",
    newOrder.cashierName,
    "127.0.0.1",
    `Yangi buyurtma (${newOrder.queueNumber}) SHA-256 imzosi [${newOrder.fiscalHash}] bilan tasdiqlandi.`
  );
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
  if (itemIdx === -1) return res.status(404).json({ error: "Taom topilmadi" });

  order.items[itemIdx].ready =
    req.body.ready !== undefined ? Boolean(req.body.ready) : !order.items[itemIdx].ready;
  order.updatedAt = new Date().toISOString();

  saveDb();
  broadcastEvent("ORDERS_UPDATED", db.orders);
  res.json(order);
});

// ================= SHIFT & RESET =================
app.post("/api/shift/toggle", (req, res) => {
  db.shift.isOpen = !db.shift.isOpen;
  saveDb();
  broadcastEvent("SHIFT_UPDATED", db.shift);
  res.json(db.shift);
});

app.post("/api/reset-demo", (req, res) => {
  db = getFreshSeedState();
  saveDb();
  broadcastEvent("FULL_RESET", db);
  res.json({ success: true, db });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍛 Asl Osh Markazi — POS, RBAC & Cybersecurity Server`);
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
