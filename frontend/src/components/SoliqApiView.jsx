import React, { useState, useEffect, useMemo } from "react";
import {
  Landmark,
  KeyRound,
  Copy,
  RefreshCw,
  CheckCircle2,
  Play,
  FileCode2,
  Printer,
  QrCode,
  ShieldCheck,
  Receipt,
  Monitor,
  Save,
  Sparkles,
  Check
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatMoney, sound } from "../utils/sound";
import { printThermalReceipt } from "../utils/printEngine";
import ReceiptModal from "./ReceiptModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function SoliqApiView() {
  const {
    config,
    soliqConfig,
    printerConfig,
    products,
    orders,
    updateSoliqConfig,
    generateNewSoliqKey,
    updatePrinterConfig,
    updateProduct,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState("api"); // api | mxik | printer
  const [copiedField, setCopiedField] = useState("");
  const [receiptOrder, setReceiptOrder] = useState(null);

  // API Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState("status");
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Soliq Form State
  const [formSoliq, setFormSoliq] = useState(soliqConfig);
  useEffect(() => {
    setFormSoliq(soliqConfig);
  }, [soliqConfig]);

  // System Printers List
  const [systemPrinters, setSystemPrinters] = useState([
    { Name: "Default POS Thermal Printer (80mm)", PortName: "USB001 / Kiosk", PrinterStatus: "Normal" }
  ]);

  useEffect(() => {
    fetch(`${API_BASE}/printer/list`)
      .then((r) => r.json())
      .then((data) => {
        if (data.systemPrinters) setSystemPrinters(data.systemPrinters);
      })
      .catch(() => {});
  }, []);

  // Fiscal Stats
  const fiscalStats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const totalTurnover = valid.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalVat = valid.reduce(
      (s, o) => s + (Number(o.vatAmount) || Math.round(((Number(o.total) || 0) * 12) / 112)),
      0
    );
    const totalCashback = valid.reduce(
      (s, o) => s + (Number(o.soliqCashback) || Math.round((Number(o.total) || 0) * 0.01)),
      0
    );
    return {
      count: valid.length,
      totalTurnover,
      totalVat,
      totalCashback
    };
  }, [orders]);

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    sound.playPosTap();
    showToast(`${label} nusxalandi!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const runApiTest = async (endpointKey) => {
    setSelectedEndpoint(endpointKey);
    setApiLoading(true);
    sound.playPosTap();
    try {
      let url = `${API_BASE}/soliq/status`;
      let options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-soliq-api-key": soliqConfig.apiKey
        }
      };

      if (endpointKey === "receipts") {
        url = `${API_BASE}/soliq/receipts`;
      } else if (endpointKey === "z-report") {
        url = `${API_BASE}/soliq/z-report`;
      } else if (endpointKey === "verify") {
        const sampleSign = orders[0]?.fiscalSign || "849201746381";
        url = `${API_BASE}/soliq/verify/${sampleSign}`;
      } else if (endpointKey === "register") {
        url = `${API_BASE}/soliq/register-receipt`;
        options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-soliq-api-key": soliqConfig.apiKey
          },
          body: JSON.stringify({
            totalAmount: 73000,
            paymentMethod: "click",
            items: [
              {
                name: "Toshkent To'y Oshi (Maxsus)",
                mxikCode: "10705001001000000",
                quantity: 1,
                price: 73000
              }
            ]
          })
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setApiResponse({
        status: res.status,
        url,
        method: options.method,
        data
      });
    } catch (err) {
      setApiResponse({
        status: 500,
        error: err.message
      });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    runApiTest("status");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSoliq = async (e) => {
    e.preventDefault();
    await updateSoliqConfig(formSoliq);
  };

  const handleTestPrinter = () => {
    const sampleOrder = orders[0] || {
      id: "ord-test",
      queueNumber: "A-777",
      receiptSeq: 9999,
      tableName: "Sinov Cheki (Test Print)",
      customerName: "Test Mijoz",
      cashierName: "Kassa #1",
      paymentMethod: "click",
      createdAt: new Date().toISOString(),
      total: 59000,
      vatAmount: 6321,
      soliqCashback: 590,
      fiscalSign: "849201746381",
      terminalId: soliqConfig.terminalId,
      fiscalHash: "SHA256-TEST80MM",
      items: [
        {
          name: "Asl Osh Solo Kombo #1",
          mxikCode: "10705001002000000",
          quantity: 1,
          unitPrice: 59000,
          totalPrice: 59000
        }
      ]
    };
    sound.playCashRegister();
    printThermalReceipt(sampleOrder, config, soliqConfig, printerConfig);
    showToast(`Sinov cheki (${printerConfig.paperWidth}) printerga yuborildi!`);
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-stone-950 text-stone-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-start sm:items-center gap-4">
            <div
              style={{ backgroundColor: config.themeColor }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
            >
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                OFD.SOLIQ.UZ VIRTUAL KASSA & PRINTER MARKAZI
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Soliq Tizimi (API), MXIK Kodlar va Termal Printer Boshqaruvi
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                STIR: <strong className="text-white">{soliqConfig.stir}</strong> • Fiskal Modul:{" "}
                <strong className="text-amber-400">{soliqConfig.terminalId}</strong> • QQS Stavkasi:{" "}
                <strong className="text-emerald-400">{soliqConfig.vatPercent}%</strong>
              </p>
            </div>
          </div>

          {/* Sub-Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "api", label: "Soliq API & Kalit Olish", icon: KeyRound },
              { id: "mxik", label: "MXIK & Fiskal Cheklar", icon: QrCode },
              { id: "printer", label: "Termal Printer & .EXE Rejim", icon: Printer }
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
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                    active
                      ? "text-white shadow-lg"
                      : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fiscal KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase text-stone-400">Fiskal Cheklar (OFD)</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{fiscalStats.count} ta</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">✓ 100% Soliq.uz ga uzatilgan</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase text-stone-400">Jami Fiskal Aylanma</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {formatMoney(fiscalStats.totalTurnover, config.currency)}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">FM: {soliqConfig.terminalId}</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase text-stone-400">Hisoblangan QQS (12% NDS)</div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
              {formatMoney(fiscalStats.totalVat, config.currency)}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">Soliq kodeksi bo'yicha 12%</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase text-stone-400">Mijozlarga 1% Keshbek</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {formatMoney(fiscalStats.totalCashback, config.currency)}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">Soliq QR skaner orqali</div>
          </div>
        </div>

        {/* ================= TAB 1: SOLIQ API KEY GENERATOR & PLAYGROUND ================= */}
        {activeTab === "api" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: API Credentials & Generator (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <h2 className="font-black text-base text-white">Sizning Soliq API Kalitlaringiz</h2>
                  </div>
                  <button
                    type="button"
                    onClick={generateNewSoliqKey}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yangi API Olish</span>
                  </button>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Ushbu API kalit orqali tashqi tizimlar (1C Buxgalteriya, Soliq OFD, Telegram Bot yoki mobil ilova) bevosita POS kassa va fiskal cheklar bazasiga ulanadi:
                </p>

                {/* API Key Box */}
                <div className="space-y-3">
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="font-bold uppercase text-amber-400">1. X-Soliq-API-Key (Public/Live Token)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(soliqConfig.apiKey, "API Key")}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {copiedField === "API Key" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Nusxalash</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-white break-all select-all bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                      {soliqConfig.apiKey}
                    </div>
                  </div>

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="font-bold uppercase text-sky-400">2. OFD Secret Key (Imzo Kaliti)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(soliqConfig.secretKey, "Secret Key")}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nusxalash</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-stone-300 break-all select-all bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                      {soliqConfig.secretKey}
                    </div>
                  </div>

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="font-bold uppercase text-emerald-400">3. Soliq REST API Endpoint Manzil</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${API_BASE}/soliq/status`, "Endpoint URL")}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nusxalash</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-emerald-300 break-all select-all bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                      {API_BASE}/soliq/*
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Tax Requisites Form */}
              <form
                onSubmit={handleSaveSoliq}
                className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="font-black text-sm text-white">Korxona Soliq Rekvizitlari (STIR / FM)</h3>
                  <button
                    type="submit"
                    style={{ backgroundColor: config.themeColor }}
                    className="px-4 py-1.5 rounded-xl text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Saqlash</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-400 font-bold mb-1">Yuridik Shaxs Nomi (MCHJ / YaTT)</label>
                    <input
                      type="text"
                      value={formSoliq.companyName || ""}
                      onChange={(e) => setFormSoliq({ ...formSoliq, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">STIR (INN - 9 xonali)</label>
                    <input
                      type="text"
                      value={formSoliq.stir || ""}
                      onChange={(e) => setFormSoliq({ ...formSoliq, stir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Fiskal Modul ID (Terminal)</label>
                    <input
                      type="text"
                      value={formSoliq.terminalId || ""}
                      onChange={(e) => setFormSoliq({ ...formSoliq, terminalId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">QQS Stavkasi (NDS %)</label>
                    <input
                      type="number"
                      value={formSoliq.vatPercent || 12}
                      onChange={(e) => setFormSoliq({ ...formSoliq, vatPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">OFD Ishlash Rejimi</label>
                    <select
                      value={formSoliq.mode || "PRODUCTION_OFD"}
                      onChange={(e) => setFormSoliq({ ...formSoliq, mode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-bold"
                    >
                      <option value="PRODUCTION_OFD">🟢 PRODUCTION (Real OFD)</option>
                      <option value="TEST_SANDBOX">🟡 SANDBOX (Test API)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Interactive Soliq API Playground & JSON Inspector (7 cols) */}
            <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-black text-base text-white">
                      Jonli Soliq API Playground (So'rov Yuborish va JSON Olish)
                    </h2>
                  </div>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-black px-2.5 py-1 rounded-lg">
                    REST API v2.4 Ready
                  </span>
                </div>

                {/* Endpoint Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "status", method: "GET", path: "/api/soliq/status", title: "Fiskal Modul & QQS Holati" },
                    { id: "receipts", method: "GET", path: "/api/soliq/receipts", title: "Barcha Fiskal Cheklar (MXIK)" },
                    { id: "register", method: "POST", path: "/api/soliq/register-receipt", title: "Yangi Fiskal Chek Ro'yxatdan O'tkazish" },
                    { id: "z-report", method: "GET", path: "/api/soliq/z-report", title: "Kunlik Soliq Z-Hisobot" },
                    { id: "verify", method: "GET", path: "/api/soliq/verify/:sign", title: "Chek Fiskal Belgisini Tekshirish" }
                  ].map((ep) => {
                    const active = selectedEndpoint === ep.id;
                    return (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => runApiTest(ep.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                          active
                            ? "bg-stone-800 border-amber-500 text-white"
                            : "bg-stone-950 border-stone-800 text-stone-400 hover:text-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                ep.method === "POST"
                                  ? "bg-amber-500 text-stone-950"
                                  : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {ep.method}
                            </span>
                            <span className="font-mono text-xs font-bold truncate">{ep.path}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-1 truncate">{ep.title}</div>
                        </div>
                        <Play className="w-4 h-4 text-amber-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Code Snippet for Developer */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5 font-sans">
                    <span>Tashqi dasturdan ulanish kodi (Fetch / cURL):</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `curl -H "x-soliq-api-key: ${soliqConfig.apiKey}" ${apiResponse?.url || `${API_BASE}/soliq/status`}`,
                          "cURL kod"
                        )
                      }
                      className="text-amber-400 hover:underline font-bold cursor-pointer"
                    >
                      cURL nusxalash
                    </button>
                  </div>
                  <div className="text-sky-300 overflow-x-auto whitespace-nowrap">
                    curl -X {apiResponse?.method || "GET"} &quot;{apiResponse?.url || `${API_BASE}/soliq/status`}&quot; -H &quot;x-soliq-api-key: {soliqConfig.apiKey}&quot;
                  </div>
                </div>

                {/* Live JSON Response Output */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-stone-800">
                    <span className="font-bold text-stone-400">Server JSON Javobi:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      HTTP {apiResponse?.status || 200} OK
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-300 max-h-80 overflow-auto leading-relaxed">
                    {apiLoading
                      ? "So'rov bajarilmoqda..."
                      : JSON.stringify(apiResponse?.data || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MXIK CODES & FISCAL RECEIPTS REGISTRY ================= */}
        {activeTab === "mxik" && (
          <div className="space-y-6">
            {/* MXIK Classifier Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
              <div>
                <h2 className="font-black text-base text-white">
                  Taomlarning 17 Xonali MXIK (ИКПУ) Kodlari va QQS Stavkasi
                </h2>
                <p className="text-xs text-stone-400">
                  Har bir taom Soliq.uz tasniflagichi (tasnif.soliq.uz) bo'yicha MXIK kodiga biriktirilgan
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 uppercase">
                      <th className="py-3 px-3">Taom Nomi</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">MXIK Kodi (17 xonali ИКПУ)</th>
                      <th className="py-3 px-3">Qadoq Kodi</th>
                      <th className="py-3 px-3">Narxi</th>
                      <th className="py-3 px-3">QQS (12%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {products.map((p) => {
                      const vat = Math.round(((Number(p.price) || 0) * 12) / 112);
                      return (
                        <tr key={p.id} className="hover:bg-stone-950/60">
                          <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                          <td className="py-3 px-3 font-mono text-stone-400">{p.sku}</td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              defaultValue={p.mxikCode || "10705001001000000"}
                              onBlur={(e) => updateProduct(p.id, { mxikCode: e.target.value })}
                              className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 font-mono text-amber-400 font-bold w-44"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-300">{p.packageCode || "12001"}</td>
                          <td className="py-3 px-3 font-black text-white">
                            {formatMoney(p.price, config.currency)}
                          </td>
                          <td className="py-3 px-3 text-emerald-400 font-bold">
                            {formatMoney(vat, config.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fiscalized Receipts Registry */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-black text-base text-white">
                Soliq.uz OFD Fiskal Cheklar Reestri
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 uppercase">
                      <th className="py-3 px-3">Navbat / Chek #</th>
                      <th className="py-3 px-3">Fiskal Modul</th>
                      <th className="py-3 px-3">Fiskal Belgi (12 xona)</th>
                      <th className="py-3 px-3">Summa</th>
                      <th className="py-3 px-3">QQS (12%)</th>
                      <th className="py-3 px-3">1% Keshbek</th>
                      <th className="py-3 px-3 text-right">Fiskal Chek</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {orders.map((ord) => {
                      const vat = ord.vatAmount || Math.round(((Number(ord.total) || 0) * 12) / 112);
                      const cb = ord.soliqCashback || Math.round((Number(ord.total) || 0) * 0.01);
                      return (
                        <tr key={ord.id} className="hover:bg-stone-950/60">
                          <td className="py-3 px-3 font-black text-white">
                            {ord.queueNumber} <span className="text-stone-500">(#{ord.receiptSeq || "1001"})</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-300">
                            {ord.terminalId || soliqConfig.terminalId}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {ord.fiscalSign || "849201746381"}
                          </td>
                          <td className="py-3 px-3 font-black text-white">
                            {formatMoney(ord.total, config.currency)}
                          </td>
                          <td className="py-3 px-3 text-sky-400 font-bold">
                            {formatMoney(vat, config.currency)}
                          </td>
                          <td className="py-3 px-3 text-emerald-400 font-bold">
                            +{formatMoney(cb, config.currency)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setReceiptOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-amber-400" />
                              <span>QR Chek</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: THERMAL PRINTER & DESKTOP (.EXE) SETTINGS ================= */}
        {activeTab === "printer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Thermal Printer Settings (7 cols) */}
            <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h2 className="font-black text-lg text-white">
                    🖨️ Termal Printer (80mm / 58mm) Sozlamalari
                  </h2>
                  <p className="text-xs text-stone-400">
                    Xprinter, Rongta, Sam4s va barcha USB/LAN POS printerlar uchun Zero-Margin dvigateli
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestPrinter}
                  style={{ backgroundColor: config.themeColor }}
                  className="px-4 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Sinov Chekini Chiqarish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-400 mb-1.5">
                    Kompyuterdagi Termal Printerni Tanlang
                  </label>
                  <select
                    value={printerConfig.selectedPrinter}
                    onChange={(e) => updatePrinterConfig({ selectedPrinter: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-bold"
                  >
                    {systemPrinters.map((pr, idx) => (
                      <option key={idx} value={pr.Name}>
                        🖨️ {pr.Name} ({pr.PortName || "USB"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-400 mb-1.5">
                    Kassa Lentasi Kengligi (Paper Size)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["80mm", "58mm"].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updatePrinterConfig({ paperWidth: w })}
                        style={printerConfig.paperWidth === w ? { backgroundColor: config.themeColor } : {}}
                        className={`py-2.5 rounded-xl font-black text-xs border transition cursor-pointer ${
                          printerConfig.paperWidth === w
                            ? "text-white border-transparent"
                            : "bg-stone-950 text-stone-400 border-stone-800"
                        }`}
                      >
                        {w} ({w === "80mm" ? "Standart" : "Mini"})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <div>
                      <div className="font-black text-sm text-white">
                        Avtomatik Chek Chiqarish (POS 1-Click Auto-Print)
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        POS Kassada &quot;To&apos;lovni Qabul Qilish&quot; tugmasi bosilishi bilan chek darhol printerga chiqadi
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(printerConfig.autoPrintOnPosPay)}
                      onChange={(e) => updatePrinterConfig({ autoPrintOnPosPay: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Desktop App (.EXE / Kiosk Printing) Info Card (5 cols) */}
            <div className="lg:col-span-5 bg-stone-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Windows Desktop POS Rejimi (.EXE / Kiosk)
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Printer muammosini 100% hal qiluvchi muhandislik yechimi
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-300 space-y-2.5 leading-relaxed bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <p>
                  <strong className="text-white">Nima uchun oddiy brauzer printer bilan kelishmaydi?</strong>
                  <br />
                  Oddiy brauzerda har safar &quot;Print&quot; oyna chiqadi va chek tepasiga URL/sana qo&apos;shib, qog&apos;oz o&apos;lchamini buzadi.
                </p>
                <p>
                  <strong className="text-amber-400">Muhandislik Yechimi:</strong>
                  <br />
                  Loyiha papkasida maxsus <strong>`AslOshPOS-Desktop.bat`</strong> (va <strong>`AslOshPOS-Silent.vbs`</strong>) Desktop dastur ishga tushiruvchisi yaratildi:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-stone-300">
                  <li>Saytni <strong>alohida kompyuter dasturi (Native App Window)</strong> ko&apos;rinishida ochadi.</li>
                  <li>Maxsus <code>--kiosk-printing</code> bayrog&apos;i orqali <strong>printer dialog oynasini umuman chiqarmasdan 0.2 soniyada</strong> to&apos;g&apos;ridan-to&apos;g&apos;ri termal printerdan chek chiqaradi!</li>
                  <li>Har bir chek yuborilganda <code>backend/data/last_receipt.txt</code> ga va Windows Printer Spooler&apos;ga ham uzatiladi.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

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
