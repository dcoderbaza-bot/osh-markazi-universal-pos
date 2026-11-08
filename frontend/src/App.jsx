import React, { useState } from "react";
import {
  Globe,
  Monitor,
  ChefHat,
  Tv,
  Settings,
  ShieldCheck,
  Landmark,
  Lock,
  LogOut,
  Volume2,
  VolumeX,
  Phone,
  CheckCircle2
} from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";
import CustomerWebView from "./components/CustomerWebView";
import PosTerminalView from "./components/PosTerminalView";
import KitchenKdsView from "./components/KitchenKdsView";
import QueueTvView from "./components/QueueTvView";
import AdminDashboardView from "./components/AdminDashboardView";
import CyberSecurityView from "./components/CyberSecurityView";
import SoliqApiView from "./components/SoliqApiView";
import LoginModal from "./components/LoginModal";
import { sound } from "./utils/sound";

function EcosystemApp() {
  const { config, orders, currentUser, logoutStaff, toast } = useStore();
  const [activeModule, setActiveModule] = useState("web");
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  const allStaffModules = [
    { id: "pos", label: "POS Kassa", icon: Monitor, badge: "POS" },
    {
      id: "kds",
      label: "Oshxona (KDS)",
      icon: ChefHat,
      badge: activeKitchenCount > 0 ? activeKitchenCount : null
    },
    {
      id: "queue",
      label: "Navbat TV",
      icon: Tv,
      badge: readyQueueCount > 0 ? readyQueueCount : null
    },
    { id: "soliq", label: "Soliq API & Printer", icon: Landmark, badge: "OFD" },
    { id: "admin", label: "Admin Panel", icon: Settings, badge: null },
    { id: "security", label: "Kiberxavfsizlik", icon: ShieldCheck, badge: "SOC" }
  ];

  const permittedModules = currentUser
    ? allStaffModules.filter((m) => (currentUser.allowedModules || []).includes(m.id))
    : [];

  const handleLoginSuccess = (user) => {
    const primaryModule = user.allowedModules?.[0] || "web";
    setActiveModule(primaryModule);
  };

  const handleLogout = () => {
    logoutStaff();
    setActiveModule("web");
  };

  const handleNavigateModule = (modId) => {
    if (modId === "web") {
      setActiveModule("web");
      return;
    }
    if (currentUser && (currentUser.allowedModules || []).includes(modId)) {
      setActiveModule(modId);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-stone-50">
      {/* Top Header (Responsive across Mobile, Tablet, POS & Desktop) */}
      <header className="min-h-14 bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Single Brand Identity */}
        <div
          onClick={() => setActiveModule("web")}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <span
            style={{ backgroundColor: config.themeColor }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg shadow"
          >
            {config.logoEmoji || "🍛"}
          </span>
          <div>
            <div className="font-black text-xs sm:text-sm tracking-tight leading-none text-white group-hover:text-amber-400 transition">
              {config.brandName}
            </div>
            <div className="text-[10px] text-stone-400 hidden xs:block">{config.brandSubtitle}</div>
          </div>
        </div>

        {/* Center Navigation (Only visible when staff is logged in) */}
        {currentUser ? (
          <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveModule("web")}
              style={activeModule === "web" ? { backgroundColor: config.themeColor } : {}}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                activeModule === "web"
                  ? "text-white shadow-sm"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Mijozlar</span>
            </button>

            {permittedModules.map((item) => {
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
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "text-white shadow-sm"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 rounded-full ${
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
        ) : (
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-stone-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Aloqa: <strong className="text-white">{config.phone}</strong>
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-emerald-400">🕒 Ish vaqti: {config.workingHours}</span>
          </div>
        )}

        {/* Right: Staff Login / Active Role Badge */}
        <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 cursor-pointer"
            title="Ovoz effektlari"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs">
                <span>{currentUser.avatar}</span>
                <span className="font-bold text-amber-400">{currentUser.roleLabel}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-600/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Chiqish</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Xodimlar kirishi</span>
            </button>
          )}
        </div>
      </header>

      {/* Active View Body */}
      <main className="flex-1">
        {activeModule === "web" && <CustomerWebView onNavigateModule={handleNavigateModule} />}
        {activeModule === "pos" && currentUser && <PosTerminalView />}
        {activeModule === "kds" && currentUser && <KitchenKdsView />}
        {activeModule === "queue" && currentUser && <QueueTvView />}
        {activeModule === "soliq" && currentUser && <SoliqApiView />}
        {activeModule === "admin" && currentUser && <AdminDashboardView />}
        {activeModule === "security" && currentUser && <CyberSecurityView />}
      </main>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-950 text-white border border-stone-700 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold">
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
