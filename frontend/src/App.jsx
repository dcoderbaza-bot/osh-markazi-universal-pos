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
  CheckCircle2,
  Flame
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
    <div className="min-h-dvh flex flex-col bg-[#0F0F0F] text-stone-100">
      {/* Top Heritage Header (Responsive across Mobile, Tablet, POS & Desktop) */}
      <header className="min-h-15 bg-[#0F0F0F]/95 backdrop-blur-xl text-white border-b border-[#D4AF37]/25 sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_30px_rgba(0,0,0,0.65)]">
        {/* Left: Single Brand Identity in "Premium Heritage" Style */}
        <div
          onClick={() => setActiveModule("web")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <span
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37] via-[#C85A32] to-[#8B3A1E]"
          >
            {config.logoEmoji || "🍛"}
          </span>
          <div>
            <div className="font-cinzel font-extrabold text-xs sm:text-base tracking-wider leading-none text-[#D4AF37] group-hover:text-amber-300 transition flex items-center gap-1.5">
              <span>{config.brandName}</span>
              <span className="hidden sm:inline-block text-[9px] font-sans font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#008B8B]/30 text-[#2DD4BF] border border-[#008B8B]/50">
                EST. 1987
              </span>
            </div>
            <div className="text-[10px] text-stone-400 hidden xs:block mt-0.5">
              {config.brandSubtitle}
            </div>
          </div>
        </div>

        {/* Center Navigation: Customer Anchor Links OR Staff RBAC Modules */}
        {currentUser ? (
          <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-[#D4AF37]/25 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveModule("web")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                activeModule === "web"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-sm"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Mijozlar Sayti</span>
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
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#C85A32] text-[#0F0F0F] shadow-sm"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 rounded-full ${
                        active ? "bg-black/30 text-white" : "bg-[#D4AF37] text-[#0F0F0F]"
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
          <div className="hidden xl:flex items-center gap-5 text-xs font-semibold text-stone-300">
            <a
              href="#jonli-qozon"
              className="hover:text-[#D4AF37] transition flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Jonli Qozon</span>
            </a>
            <a href="#osh-kalkulyatori" className="hover:text-[#D4AF37] transition">
              🧮 Osh Kalkulyatori
            </a>
            <a href="#interaktiv-menyu" className="hover:text-[#D4AF37] transition">
              🍛 Interaktiv Menyu
            </a>
            <a href="#oshpazlar-siri" className="hover:text-[#D4AF37] transition">
              👨‍🍳 Oshpazlar Siri
            </a>
            <a href="#filiallar-bron" className="hover:text-[#D4AF37] transition">
              📍 Joy Band Qilish & Xarita
            </a>
            <span className="text-stone-700">|</span>
            <span className="flex items-center gap-1.5 text-[#D4AF37]">
              <Phone className="w-3.5 h-3.5" />
              <strong>{config.phone}</strong>
            </span>
          </div>
        )}

        {/* Right: Staff Login / Active Role Badge */}
        <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAudio}
            className="p-2 rounded-xl bg-[#161616] hover:bg-stone-800 text-stone-300 border border-[#D4AF37]/25 cursor-pointer"
            title="Ovoz effektlari"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161616] border border-[#D4AF37]/40 text-xs">
                <span>{currentUser.avatar}</span>
                <span className="font-bold text-[#D4AF37]">{currentUser.roleLabel}</span>
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
              className="px-3 py-1.5 rounded-xl bg-[#161616] hover:bg-[#222222] border border-[#D4AF37]/35 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
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
        <div className="fixed bottom-5 right-5 z-50 bg-[#161616] text-white border border-[#D4AF37]/60 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
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
