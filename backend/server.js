const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const {
  initialConfig,
  initialSoliqConfig,
  initialPrinterConfig,
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

function generate12DigitFiscalSign(seedStr) {
  const hashHex = crypto.createHash("sha256").update(seedStr).digest("hex");
  const digits = hashHex.replace(/[a-f]/gi, (c) => String(parseInt(c, 16) % 10));
  return digits.slice(0, 12);
}

function buildSoliqQrUrl(soliqConfig, order) {
  const t = soliqConfig?.terminalId || "LG4202600819";
  const r = order.receiptSeq || 1001;
  const s = order.fiscalSign || "849201746381";
  const a = order.total || 0;
  const d = new Date(order.createdAt || Date.now())
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
  return `https://ofd.soliq.uz/check?t=${t}&r=${r}&c=${d}&s=${s}&a=${a}`;
}

function getFreshSeedState() {
  const soliqCfg = JSON.parse(JSON.stringify(initialSoliqConfig));
  const seededOrders = JSON.parse(JSON.stringify(initialOrders)).map((o) => {
    const fiscalSign = o.fiscalSign || generate12DigitFiscalSign(`${o.id}-${o.total}`);
    const orderWithSign = {
      ...o,
      fiscalSign,
      fiscalHash: generateFiscalHash(o.id, o.queueNumber, o.total, o.createdAt)
    };
    return {
      ...orderWithSign,
      qrCodeUrl: buildSoliqQrUrl(soliqCfg, orderWithSign)
    };
  });

  return {
    config: JSON.parse(JSON.stringify(initialConfig)),
    soliqConfig: soliqCfg,
    printerConfig: JSON.parse(JSON.stringify(initialPrinterConfig)),
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
    statsBlockedAttacks: 14,
    queueCounter: 103,
    receiptSeqCounter: 1003
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
        config: { ...fresh.config, ...(parsed.config || {}) },
        soliqConfig: { ...fresh.soliqConfig, ...(parsed.soliqConfig || {}) },
        printerConfig: { ...fresh.printerConfig, ...(parsed.printerConfig || {}) },
        staffAccounts: fresh.staffAccounts,
        securitySettings: { ...fresh.securitySettings, ...(parsed.securitySettings || {}) }
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
    severity,
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

// ================= CYBERSECURITY MIDDLEWARE =================
const failedLoginsByIp = new Map();

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  if (db.blockedIps.includes(clientIp) && !req.path.startsWith("/api/security")) {
    db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
    addSecurityLog("FIREWALL_BLOCK", "critical", "firewall", clientIp, `Bloklangan IP manzildan kirish to'xtatildi: ${req.path}`);
    return res.status(403).json({ error: "IP manzilingiz bloklangan!" });
  }

  if (db.securitySettings?.wafEnabled && req.body && Object.keys(req.body).length > 0 && !req.path.startsWith("/api/security/simulate")) {
    const rawPayload = JSON.stringify(req.body);
    const sqliOrXssRegex = /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=|UNION\s+SELECT|DROP\s+TABLE|--\s*$|'\s*OR\s+'1'\s*=\s*'1)/i;
    if (sqliOrXssRegex.test(rawPayload)) {
      db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
      addSecurityLog("WAF_ATTACK_BLOCKED", "critical", "WAF-Engine", clientIp, `Zararli kod (XSS/SQLi) aniqlandi va bloklandi: ${req.path}`);
      return res.status(403).json({ error: "WAF Himoyasi: So'rovda xavfli kod aniqlandi!" });
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
    soliqConfig: db.soliqConfig,
    printerConfig: db.printerConfig,
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

// ================= SOLIQ.UZ OFD & FISCAL API MODULE =================
app.get("/api/soliq/status", (req, res) => {
  const validOrders = db.orders.filter((o) => o.status !== "cancelled");
  const totalSales = validOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const totalVat = validOrders.reduce(
    (s, o) => s + (Number(o.vatAmount) || Math.round(((Number(o.total) || 0) * 12) / 112)),
    0
  );
  const totalCashback = validOrders.reduce(
    (s, o) => s + (Number(o.soliqCashback) || Math.round((Number(o.total) || 0) * 0.01)),
    0
  );

  res.json({
    status: "ONLINE",
    ofdProvider: "Soliq.uz OFD Virtual Kassa API v2.4",
    companyName: db.soliqConfig.companyName,
    stir: db.soliqConfig.stir,
    terminalId: db.soliqConfig.terminalId,
    cashboxNumber: db.soliqConfig.cashboxNumber,
    mode: db.soliqConfig.mode,
    vatPercent: db.soliqConfig.vatPercent,
    apiKey: db.soliqConfig.apiKey,
    secretKey: db.soliqConfig.secretKey,
    webhookUrl: db.soliqConfig.webhookUrl,
    summary: {
      fiscalizedReceiptsCount: validOrders.length,
      totalFiscalTurnover: totalSales,
      totalVat12Percent: totalVat,
      totalCustomerCashback1Percent: totalCashback
    },
    endpoints: [
      { method: "GET", path: "/api/soliq/status", description: "Fiskal modul holati, API kalit va umumiy QQS hisoboti" },
      { method: "GET", path: "/api/soliq/receipts", description: "Barcha fiskallashtirilgan cheklar va MXIK kodlar ro'yxati" },
      { method: "POST", path: "/api/soliq/register-receipt", description: "Yangi chekni Soliq OFD da ro'yxatdan o'tkazish va QR olish" },
      { method: "GET", path: "/api/soliq/verify/:fiscalSign", description: "12 xonali Fiskal Belgi bo'yicha chek haqiqiyligini tekshirish" },
      { method: "GET", path: "/api/soliq/z-report", description: "Kunlik Fiskal Z-Hisobot va MXIK kesimida QQS jadvali" }
    ]
  });
});

app.put("/api/soliq/config", (req, res) => {
  db.soliqConfig = {
    ...db.soliqConfig,
    ...req.body,
    lastSyncAt: new Date().toISOString()
  };
  saveDb();
  addSecurityLog("SOLIQ_CONFIG_UPDATED", "info", "admin", "127.0.0.1", `Soliq OFD sozlamalari (STIR: ${db.soliqConfig.stir}, FM: ${db.soliqConfig.terminalId}) yangilandi.`);
  broadcastEvent("SOLIQ_UPDATED", db.soliqConfig);
  res.json(db.soliqConfig);
});

app.post("/api/soliq/generate-key", (req, res) => {
  const newApiKey = `soliq_live_${crypto.randomBytes(16).toString("hex")}`;
  const newSecretKey = `ofd_sec_${crypto.randomBytes(16).toString("hex")}`;
  db.soliqConfig.apiKey = newApiKey;
  db.soliqConfig.secretKey = newSecretKey;
  db.soliqConfig.lastSyncAt = new Date().toISOString();
  saveDb();
  addSecurityLog(
    "SOLIQ_API_KEY_GENERATED",
    "warning",
    "soliq_admin",
    "127.0.0.1",
    `Yangi Soliq.uz OFD API kaliti generatsiya qilindi: ${newApiKey.slice(0, 18)}...`
  );
  broadcastEvent("SOLIQ_UPDATED", db.soliqConfig);
  res.json({
    success: true,
    apiKey: newApiKey,
    secretKey: newSecretKey,
    soliqConfig: db.soliqConfig
  });
});

app.get("/api/soliq/receipts", (req, res) => {
  const receipts = db.orders.map((o) => ({
    receiptId: o.id,
    receiptSeq: o.receiptSeq || 1001,
    queueNumber: o.queueNumber,
    createdAt: o.createdAt,
    terminalId: o.terminalId || db.soliqConfig.terminalId,
    stir: db.soliqConfig.stir,
    fiscalSign: o.fiscalSign,
    fiscalHash: o.fiscalHash,
    paymentMethod: o.paymentMethod,
    totalAmount: o.total,
    vatPercent: db.soliqConfig.vatPercent || 12,
    vatAmount: o.vatAmount || Math.round(((Number(o.total) || 0) * 12) / 112),
    cashback1Percent: o.soliqCashback || Math.round((Number(o.total) || 0) * 0.01),
    ofdStatus: o.ofdStatus || "SENT_OK",
    qrCodeUrl: o.qrCodeUrl || buildSoliqQrUrl(db.soliqConfig, o),
    items: (o.items || []).map((it) => ({
      name: it.name,
      mxikCode: it.mxikCode || "10705001001000000",
      packageCode: "12001",
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      vatAmount: Math.round(((Number(it.totalPrice) || 0) * 12) / 112)
    }))
  }));
  res.json({
    count: receipts.length,
    stir: db.soliqConfig.stir,
    terminalId: db.soliqConfig.terminalId,
    receipts
  });
});

app.get("/api/soliq/verify/:fiscalSign", (req, res) => {
  const sign = String(req.params.fiscalSign || "").trim();
  const found = db.orders.find(
    (o) => o.fiscalSign === sign || o.id === sign || o.queueNumber.toLowerCase() === sign.toLowerCase()
  );
  if (!found) {
    return res.status(404).json({
      verified: false,
      message: "Bunday Fiskal Belgi bilan ro'yxatdan o'tgan chek topilmadi"
    });
  }
  res.json({
    verified: true,
    ofdStatus: "ORIGINAL_FISCAL_RECEIPT",
    companyName: db.soliqConfig.companyName,
    stir: db.soliqConfig.stir,
    terminalId: found.terminalId || db.soliqConfig.terminalId,
    receiptSeq: found.receiptSeq || 1001,
    queueNumber: found.queueNumber,
    fiscalSign: found.fiscalSign,
    sha256Signature: found.fiscalHash,
    createdAt: found.createdAt,
    totalAmount: found.total,
    vat12Amount: found.vatAmount || Math.round(((Number(found.total) || 0) * 12) / 112),
    soliqCashback: found.soliqCashback || Math.round((Number(found.total) || 0) * 0.01),
    qrCodeUrl: found.qrCodeUrl || buildSoliqQrUrl(db.soliqConfig, found),
    items: found.items
  });
});

app.post("/api/soliq/register-receipt", (req, res) => {
  const providedKey = req.headers["x-soliq-api-key"] || req.body.apiKey || db.soliqConfig.apiKey;
  if (providedKey !== db.soliqConfig.apiKey) {
    return res.status(401).json({
      error: "Noto'g'ri Soliq API Kaliti (Invalid x-soliq-api-key)"
    });
  }

  const amount = Number(req.body.totalAmount || req.body.total || 59000);
  db.receiptSeqCounter = (db.receiptSeqCounter || 1003) + 1;
  const nowIso = new Date().toISOString();
  const tempId = `api-ord-${Date.now()}`;
  const fiscalSign = generate12DigitFiscalSign(`${tempId}-${amount}-${nowIso}`);
  const vatAmount = Math.round((amount * (db.soliqConfig.vatPercent || 12)) / (100 + (db.soliqConfig.vatPercent || 12)));

  const mockOrder = {
    id: tempId,
    receiptSeq: db.receiptSeqCounter,
    fiscalSign,
    total: amount,
    createdAt: nowIso
  };

  const responsePayload = {
    success: true,
    ofdStatus: "REGISTERED",
    companyName: db.soliqConfig.companyName,
    stir: db.soliqConfig.stir,
    terminalId: db.soliqConfig.terminalId,
    receiptSeq: db.receiptSeqCounter,
    fiscalSign,
    sha256Hash: generateFiscalHash(tempId, `API-${db.receiptSeqCounter}`, amount, nowIso),
    totalAmount: amount,
    vatPercent: db.soliqConfig.vatPercent || 12,
    vatAmount,
    cashback1Percent: Math.round(amount * 0.01),
    qrCodeUrl: buildSoliqQrUrl(db.soliqConfig, mockOrder),
    timestamp: nowIso
  };

  addSecurityLog(
    "SOLIQ_API_CALL",
    "success",
    "API-Client",
    "127.0.0.1",
    `Soliq REST API orqali yangi fiskal chek (#${db.receiptSeqCounter}, FM: ${fiscalSign}) ro'yxatdan o'tkazildi.`
  );

  res.status(201).json(responsePayload);
});

app.get("/api/soliq/z-report", (req, res) => {
  const valid = db.orders.filter((o) => o.status !== "cancelled");
  const totalSales = valid.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const totalVat = Math.round((totalSales * 12) / 112);
  const byMethod = { cash: 0, card: 0, click: 0, payme: 0, split: 0 };

  for (const o of valid) {
    const pm = o.paymentMethod || "cash";
    byMethod[pm] = (byMethod[pm] || 0) + (Number(o.total) || 0);
  }

  res.json({
    reportType: "FISCAL_Z_REPORT",
    generatedAt: new Date().toISOString(),
    companyName: db.soliqConfig.companyName,
    stir: db.soliqConfig.stir,
    terminalId: db.soliqConfig.terminalId,
    cashboxNumber: db.soliqConfig.cashboxNumber,
    receiptsCount: valid.length,
    totalTurnover: totalSales,
    netSalesWithoutVat: totalSales - totalVat,
    vat12PercentTotal: totalVat,
    customerCashback1Percent: Math.round(totalSales * 0.01),
    byPaymentMethod: byMethod
  });
});

// ================= THERMAL PRINTER & WINDOWS SPOOLER BRIDGE =================
app.get("/api/printer/list", (req, res) => {
  exec(
    'powershell -NoProfile -Command "Get-Printer | Select-Object Name, PrinterStatus, PortName | ConvertTo-Json"',
    { timeout: 4000 },
    (err, stdout) => {
      let systemPrinters = [];
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout);
          systemPrinters = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          systemPrinters = [];
        }
      }
      res.json({
        printerConfig: db.printerConfig,
        systemPrinters: [
          { Name: "Default POS Thermal Printer (80mm)", PortName: "USB001 / Kiosk", PrinterStatus: "Normal" },
          ...systemPrinters
        ]
      });
    }
  );
});

app.put("/api/printer/config", (req, res) => {
  db.printerConfig = {
    ...db.printerConfig,
    ...req.body
  };
  saveDb();
  broadcastEvent("PRINTER_UPDATED", db.printerConfig);
  res.json(db.printerConfig);
});

app.post("/api/printer/print-raw", (req, res) => {
  const { order, printerName } = req.body;
  if (!order) return res.status(400).json({ error: "Order ma'lumotlari yo'q" });

  const targetPrinter = printerName || db.printerConfig.selectedPrinter;
  const lines = [
    "========================================",
    `          ${db.config.brandName}`,
    `      STIR (INN): ${db.soliqConfig.stir}`,
    `      Tel: ${db.config.phone}`,
    "----------------------------------------",
    `      NAVBAT RAQAMI:  ${order.queueNumber}`,
    `      Joy: ${order.tableName || "Kassa"}`,
    `      Sana: ${new Date(order.createdAt || Date.now()).toLocaleString("uz-UZ")}`,
    "----------------------------------------"
  ];

  for (const item of order.items || []) {
    lines.push(`${item.quantity}x ${item.name}`);
    lines.push(`   MXIK: ${item.mxikCode || "10705001001000000"}   = ${(item.totalPrice || 0).toLocaleString()} so'm`);
  }

  const vat = order.vatAmount || Math.round(((Number(order.total) || 0) * 12) / 112);
  lines.push("----------------------------------------");
  lines.push(`QQS (NDS 12%):       ${vat.toLocaleString()} so'm`);
  lines.push(`JAMI TO'LOV:         ${(Number(order.total) || 0).toLocaleString()} so'm`);
  lines.push(`To'lov turi:         ${String(order.paymentMethod || "naqd").toUpperCase()}`);
  lines.push("----------------------------------------");
  lines.push(`FM: ${order.terminalId || db.soliqConfig.terminalId}`);
  lines.push(`Fiskal belgi: ${order.fiscalSign || "849201746381"}`);
  lines.push(`SHA-256: ${order.fiscalHash || "VERIFIED"}`);
  lines.push("========================================");
  lines.push("");

  const receiptText = lines.join("\r\n");
  const tempTxtPath = path.join(DATA_DIR, "last_receipt.txt");
  fs.writeFileSync(tempTxtPath, receiptText, "utf8");

  // If a real non-PDF hardware printer is chosen on Windows, send to spooler
  if (
    targetPrinter &&
    !targetPrinter.includes("Default POS") &&
    !targetPrinter.toLowerCase().includes("pdf") &&
    !targetPrinter.toLowerCase().includes("onenote")
  ) {
    const safePrinter = targetPrinter.replace(/"/g, "");
    exec(
      `powershell -NoProfile -Command "Get-Content -Path '${tempTxtPath}' | Out-Printer -Name '${safePrinter}'"`,
      { timeout: 5000 },
      () => {}
    );
  }

  res.json({
    success: true,
    printedTo: targetPrinter,
    savedFile: tempTxtPath,
    receiptText
  });
});

// ================= RBAC AUTHENTICATION =================
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || "127.0.0.1";
  const cleanUser = String(username || "").trim().toLowerCase();

  const failCount = failedLoginsByIp.get(clientIp) || 0;
  if (db.securitySettings.bruteForceProtection && failCount >= 5) {
    db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;
    addSecurityLog("BRUTE_FORCE_LOCK", "critical", cleanUser || "unknown", clientIp, "Ketma-ket 5 marta xato parol terildi!");
    return res.status(429).json({ error: "Brute-Force Himoyasi: 1 daqiqa kuting." });
  }

  const account = db.staffAccounts.find(
    (a) => a.username.toLowerCase() === cleanUser && a.password === String(password || "")
  );

  if (!account) {
    failedLoginsByIp.set(clientIp, failCount + 1);
    setTimeout(() => failedLoginsByIp.delete(clientIp), 60000);
    addSecurityLog("AUTH_FAILED", "warning", cleanUser || "unknown", clientIp, `Xato parol (${failCount + 1}/5)`);
    return res.status(401).json({ error: "Login yoki parol noto'g'ri!" });
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

  addSecurityLog("AUTH_SUCCESS", "success", account.username, clientIp, `${account.fullName} tizimga kirdi.`);
  res.json({ success: true, user: sessionUser });
});

app.post("/api/auth/logout", (req, res) => {
  const { username } = req.body;
  addSecurityLog("AUTH_LOGOUT", "info", username || "staff", "127.0.0.1", "Xodim tizimdan chiqdi.");
  res.json({ success: true });
});

// ================= CYBERSECURITY SOC ENDPOINTS =================
app.post("/api/security/toggle-setting", (req, res) => {
  const { key } = req.body;
  if (key && key in db.securitySettings) {
    db.securitySettings[key] = !db.securitySettings[key];
    addSecurityLog("SECURITY_CONFIG_CHANGE", "info", "secadmin", "127.0.0.1", `"${key}" -> ${db.securitySettings[key] ? "YOQILDI" : "O'CHIRILDI"}`);
  }
  res.json(db.securitySettings);
});

app.post("/api/security/block-ip", (req, res) => {
  const ip = String(req.body.ip || "").trim();
  if (ip && !db.blockedIps.includes(ip)) {
    db.blockedIps.unshift(ip);
    addSecurityLog("IP_BLACKLISTED", "warning", "secadmin", ip, `IP bloklandi: ${ip}`);
  }
  res.json({ blockedIps: db.blockedIps });
});

app.post("/api/security/unblock-ip", (req, res) => {
  const ip = String(req.body.ip || "").trim();
  db.blockedIps = db.blockedIps.filter((item) => item !== ip);
  addSecurityLog("IP_UNBLOCKED", "info", "secadmin", ip, `IP blokdan chiqarildi: ${ip}`);
  res.json({ blockedIps: db.blockedIps });
});

app.post("/api/security/simulate-attack", (req, res) => {
  const { type } = req.body;
  db.statsBlockedAttacks = (db.statsBlockedAttacks || 0) + 1;

  if (type === "sqli") {
    addSecurityLog("WAF_SQLI_BLOCKED", "critical", "attacker_bot", "194.26.135.89", `[SINOV] SQL-Injection ("' OR 1=1; DROP TABLE orders;--") WAF tomonidan bloklandi!`);
  } else if (type === "xss") {
    addSecurityLog("WAF_XSS_BLOCKED", "critical", "attacker_bot", "91.214.124.11", `[SINOV] XSS Skript ("<script>stealToken()</script>") zararsizlantirildi!`);
  } else if (type === "tamper") {
    addSecurityLog("FISCAL_HASH_VERIFIED", "success", "SHA256-Guard", "127.0.0.1", `[SINOV] Barcha ${db.orders.length} ta chekning SHA-256 va Soliq OFD imzosi tasdiqlandi.`);
  }

  res.json({
    success: true,
    securityLogs: db.securityLogs,
    statsBlockedAttacks: db.statsBlockedAttacks
  });
});

// ================= CONFIG & MENU =================
app.get("/api/config", (req, res) => res.json(db.config));

app.put("/api/config", (req, res) => {
  db.config = { ...db.config, ...req.body };
  delete db.config.presets;
  saveDb();
  broadcastEvent("CONFIG_UPDATED", db.config);
  res.json(db.config);
});

app.get("/api/products", (req, res) => res.json(db.products));

app.post("/api/products", (req, res) => {
  const body = req.body;
  const newProduct = {
    id: `prod-${Date.now()}`,
    sku: body.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
    mxikCode: body.mxikCode || "10705001001000000",
    packageCode: body.packageCode || "12001",
    vatPercent: 12,
    categoryId: body.categoryId || "plov",
    name: body.name || "Yangi Taom",
    description: body.description || "",
    price: Number(body.price) || 35000,
    oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
    weight: body.weight || "400g",
    image: body.image || "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
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

// ================= ORDERS (AUTO SOLIQ FISCALIZATION) =================
app.get("/api/orders", (req, res) => res.json(db.orders));

app.post("/api/orders", (req, res) => {
  const body = req.body;
  db.queueCounter = (db.queueCounter || 103) + 1;
  db.receiptSeqCounter = (db.receiptSeqCounter || 1003) + 1;

  const prefix = body.orderType === "delivery" ? "D" : db.config.queuePrefix || "A";
  const queueNumber = body.queueNumber || `${prefix}-${db.queueCounter}`;
  const orderId = `ord-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const totalAmount = Number(body.total) || 0;
  const vatPercent = db.soliqConfig?.vatPercent || 12;
  const vatAmount = Math.round((totalAmount * vatPercent) / (100 + vatPercent));
  const soliqCashback = Math.round(totalAmount * 0.01);
  const fiscalSign = generate12DigitFiscalSign(`${orderId}|${queueNumber}|${totalAmount}|${nowIso}`);

  const items = (body.items || []).map((item, index) => {
    const prod = db.products.find((p) => p.id === item.productId);
    return {
      id: item.id || `item-${Date.now()}-${index}`,
      productId: item.productId,
      mxikCode: item.mxikCode || prod?.mxikCode || "10705001001000000",
      name: item.name,
      variantName: item.variantName || "",
      modifiers: Array.isArray(item.modifiers) ? item.modifiers : [],
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
      note: item.note || "",
      ready: false
    };
  });

  const newOrder = {
    id: orderId,
    queueNumber,
    receiptSeq: db.receiptSeqCounter,
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
    vatAmount,
    soliqCashback,
    fiscalSign,
    terminalId: db.soliqConfig?.terminalId || "LG4202600819",
    ofdStatus: "SENT_OK",
    fiscalHash: generateFiscalHash(orderId, queueNumber, totalAmount, nowIso)
  };

  newOrder.qrCodeUrl = buildSoliqQrUrl(db.soliqConfig, newOrder);

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
    "SOLIQ_FISCAL_OK",
    "success",
    newOrder.cashierName,
    "127.0.0.1",
    `Chek ${newOrder.queueNumber} Soliq.uz OFD da fiskallashtirildi (FM: ${newOrder.fiscalSign}, QQS 12%: ${vatAmount} so'm).`
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
  console.log(`🍛 Asl Osh Markazi — POS, Soliq OFD API & Security`);
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
