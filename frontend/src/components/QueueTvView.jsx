import React, { useState, useEffect } from "react";
import { Volume2, Maximize2, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { sound } from "../utils/sound";

export default function QueueTvView() {
  const { config, orders } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const preparingOrders = orders.filter((o) => o.status === "new" || o.status === "cooking");
  const readyOrders = orders.filter((o) => o.status === "ready");

  const announceOrder = (queueNumber) => {
    sound.playQueueDingDong();
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          `Buyurtma raqami ${queueNumber.replace("-", " ")} tayyor! Marhamat, tarqatish oynasidan oling!`
        );
        utter.lang = "tr-TR"; // Closest phonetic match if uz-UZ voice is not installed on Windows
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore speech errors
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-stone-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top TV Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div
            style={{ backgroundColor: config.themeColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
          >
            {config.logoEmoji || "🍛"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              {config.brandName}
            </h1>
            <p className="text-xs text-stone-400 font-semibold">{config.brandSubtitle} • ELEKTRON NAVBAT TABLOSI</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => announceOrder(readyOrders[0]?.queueNumber || "A-101")}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Ovozli chaqiruvni sinash</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
            title="To'liq ekran (TV rejim)"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <div className="text-right pl-3 border-l border-stone-800">
            <div className="text-2xl font-mono font-black text-amber-400">
              {currentTime.toLocaleTimeString("uz-UZ")}
            </div>
            <div className="text-[11px] text-stone-400">{currentTime.toLocaleDateString("uz-UZ")}</div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Queue Display */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        {/* LEFT COLUMN: TAYYORLANMOQDA (Preparing) */}
        <div className="bg-stone-900/90 border-2 border-amber-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-stone-950 animate-spin" style={{ animationDuration: "8s" }} />
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 uppercase tracking-wide">
                TAYYORLANMOQDA...
              </h2>
            </div>
            <span className="bg-stone-950 text-amber-400 font-black text-lg px-3.5 py-1 rounded-xl">
              {preparingOrders.length}
            </span>
          </div>

          <div className="p-6 flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
            {preparingOrders.length === 0 ? (
              <div className="col-span-full py-20 text-center text-stone-500 font-bold">
                Hozirda tayyorlanayotgan buyurtmalar yo'q
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-stone-950 border-2 border-amber-500/40 rounded-2xl p-4 text-center shadow-lg"
                >
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider">
                    {ord.queueNumber}
                  </div>
                  <div className="text-xs font-bold text-stone-400 mt-1 truncate">
                    {ord.tableName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TAYYOR! MARHAMAT OLING (Ready for Pickup) */}
        <div className="bg-stone-900/90 border-2 border-emerald-500/60 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-stone-950" />
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 uppercase tracking-wide">
                TAYYOR! MARHAMAT OLING
              </h2>
            </div>
            <span className="bg-stone-950 text-emerald-400 font-black text-lg px-3.5 py-1 rounded-xl">
              {readyOrders.length}
            </span>
          </div>

          <div className="p-6 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {readyOrders.length === 0 ? (
              <div className="col-span-full py-20 text-center text-stone-500 font-bold">
                Tayyor buyurtmalar shu yerda yashil rangda yonadi
              </div>
            ) : (
              readyOrders.map((ord, idx) => (
                <div
                  key={ord.id}
                  onClick={() => announceOrder(ord.queueNumber)}
                  className="bg-emerald-500 text-stone-950 rounded-3xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:scale-[1.02] transition animate-pulse"
                  style={{ animationDuration: "2.5s" }}
                >
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-75">
                      Tarqatish oynasi #{(idx % 3) + 1}
                    </div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight mt-0.5">
                      {ord.queueNumber}
                    </div>
                    <div className="text-xs font-extrabold mt-1 opacity-90">{ord.tableName}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-stone-950/15 flex items-center justify-center">
                    <Volume2 className="w-6 h-6" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Promotional Ticker */}
      <div
        style={{ backgroundColor: config.themeColor }}
        className="rounded-2xl px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg"
      >
        <div className="flex items-center gap-2 font-extrabold text-sm">
          <Sparkles className="w-5 h-5" />
          <span>{config.slogan}</span>
        </div>
        <div className="text-xs font-black bg-black/25 px-3.5 py-1.5 rounded-xl">
          Sayt orqali navbatsiz buyurtma bering • Promokod: OSH20 (-20%)
        </div>
      </div>
    </div>
  );
}
