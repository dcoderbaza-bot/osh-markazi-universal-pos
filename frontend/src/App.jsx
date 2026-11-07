import React, { useState } from "react";
import {
  Globe,
  Monitor,
  ChefHat,
  Tv,
  Settings,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";
import CustomerWebView from "./components/CustomerWebView";
import PosTerminalView from "./components/PosTerminalView";
import KitchenKdsView from "./components/KitchenKdsView";
import QueueTvView from "./components/QueueTvView";
import AdminDashboardView from "./components/AdminDashboardView";
import { sound } from "./utils/sound";

function EcosystemApp() {
  const { config, orders, isConnected, toast, applyBrandPreset } = useStore();
  const [activeModule, setActiveModule] = useState("web"); // web | pos | kds | queue | admin
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeKitchenCount = orders.filter(
    (o) => o.status === "new" || o.status === "cooking"
  ).length;
  const readyQueueCount = orders.filter((o) => o.status === "ready").length;

  const toggleAudio = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playPosTap();
  };

  const navItems = [
    { id: "web", label: "Mijozlar Sayti", icon: Globe, badge: null },
    { id: "pos", label: "POS Kassa Terminali", icon: Monitor, badge: "REAL POS" },
    {
      id: "kds",
      label: "Oshxona (KDS)",
      icon: ChefHat,
      badge: activeKitchenCount > 0 ? activeKitchenCount : null
    },
    {
      id: "queue",
      label: "Navbat TV Ekrani",
      icon: Tv,
      badge: readyQueueCount > 0 ? readyQueueCount : null
    },
    { id: "admin", label: "Brend & Admin", icon: Settings, badge: null }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Universal Top Ecosystem Switcher Header */}
      <header className="h-14 bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40 px-3 sm:px-5 flex items-center justify-between gap-2">
        {/* Left: Dynamic Brand Identity + Quick Preset Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => setActiveModule("web")}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <span
              style={{ backgroundColor: config.themeColor }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow"
            >
              {config.logoEmoji || "🍛"}
            </span>
            <div className="hidden sm:block">
              <div className="font-black text-xs sm:text-sm tracking-tight leading-none text-white group-hover:text-amber-400 transition">
                {config.brandName}
              </div>
              <div className="text-[10px] text-stone-400 truncate max-w-[160px]">
                {config.brandSubtitle}
              </div>
            </div>
          </div>

          {/* Quick White-Label Brand Switcher */}
          {config.presets && config.presets.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setActiveModule("admin");
                } else if (e.target.value) {
                  applyBrandPreset(e.target.value);
                }
              }}
              className="hidden xl:block bg-stone-900 border border-stone-700 hover:border-amber-500 text-[11px] font-bold text-amber-300 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                🎨 Brendni o'zgartirish...
              </option>
              {config.presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.logoEmoji} {p.brandName}
                </option>
              ))}
              <option value="custom">✏️ Boshqa nom kiritish (Admin)...</option>
            </select>
          )}
        </div>

        {/* Center: Module Switcher Pills */}
        <nav className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.playPosTap();
                  setActiveModule(item.id);
                }}
                style={active ? { backgroundColor: config.themeColor } : {}}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "text-white shadow-sm"
                    : "text-stone-400 hover:text-white hover:bg-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      active ? "bg-black/30 text-white" : "bg-amber-500 text-stone-950"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Backend Server Live Status & Audio Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            title={
              isConnected
                ? "Backend API serveri bilan jonli SSE aloqa o'rnatilgan"
                : "Avtonom lokal rejim"
            }
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
              isConnected
                ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-400"
                : "bg-amber-950/60 border-amber-700/60 text-amber-400"
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isConnected ? "API Server Online" : "Avtonom Rejim"}</span>
          </div>

          <button
            type="button"
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 cursor-pointer"
            title="Ovoz effektlarini yoqish/o'chirish"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>
        </div>
      </header>

      {/* Active View Body */}
      <main className="flex-1">
        {activeModule === "web" && <CustomerWebView onNavigateModule={setActiveModule} />}
        {activeModule === "pos" && <PosTerminalView />}
        {activeModule === "kds" && <KitchenKdsView />}
        {activeModule === "queue" && <QueueTvView />}
        {activeModule === "admin" && <AdminDashboardView />}
      </main>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-950 text-white border border-stone-700 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <EcosystemApp />
    </StoreProvider>
  );
}
