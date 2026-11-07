import React, { useState, useMemo, useEffect } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  Bell,
  Utensils,
  ShoppingBag,
  Truck,
  CheckSquare,
  Square,
  Printer
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { sound } from "../utils/sound";
import ReceiptModal from "./ReceiptModal";

export default function KitchenKdsView() {
  const { config, orders, updateOrderStatus, toggleOrderItemReady } = useStore();
  const [filterStatus, setFilterStatus] = useState("active"); // active | new | cooking | ready | completed
  const [filterType, setFilterType] = useState("all");
  const [nowTick, setNowTick] = useState(Date.now());
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const kdsOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "cancelled") return false;
      if (filterStatus === "active" && o.status === "completed") return false;
      if (filterStatus !== "active" && o.status !== filterStatus) return false;
      if (filterType !== "all" && o.orderType !== filterType) return false;
      return true;
    });
  }, [orders, filterStatus, filterType]);

  const counts = useMemo(() => {
    return {
      new: orders.filter((o) => o.status === "new").length,
      cooking: orders.filter((o) => o.status === "cooking").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length
    };
  }, [orders]);

  const getElapsedMinutes = (iso) => {
    const diff = Math.max(0, Math.floor((nowTick - new Date(iso).getTime()) / 60000));
    return diff;
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-stone-950 text-stone-100 p-4 sm:p-6">
      {/* KDS Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: config.themeColor }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
          >
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              OSHXONA EKRANI (KDS) — {config.brandName}
            </h1>
            <p className="text-xs text-stone-400">
              Oshpaz va suzuvchilar uchun real-vaqt buyurtmalar taxtasi
            </p>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "active", label: `Faol buyurtmalar (${counts.new + counts.cooking + counts.ready})` },
            { id: "new", label: `🔔 Yangi (${counts.new})` },
            { id: "cooking", label: `🔥 Suzilmoqda (${counts.cooking})` },
            { id: "ready", label: `✅ Tayyor (${counts.ready})` },
            { id: "completed", label: `Arxiv (${counts.completed})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playPosTap();
                setFilterStatus(tab.id);
              }}
              style={filterStatus === tab.id ? { backgroundColor: config.themeColor } : {}}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                filterStatus === tab.id
                  ? "text-white shadow"
                  : "bg-stone-900 text-stone-400 border border-stone-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      {kdsOrders.length === 0 ? (
        <div className="py-24 text-center text-stone-500">
          <div className="text-5xl mb-3">👨‍🍳</div>
          <div className="text-lg font-bold text-stone-300">Hozircha bu bo'limda buyurtmalar yo'q</div>
          <p className="text-xs mt-1">Saytdan yoki POS kassadan yangi buyurtma urilishi bilan shu yerda chiqadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-5">
          {kdsOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const statusColors = {
              new: "border-rose-500 bg-rose-950/20",
              cooking: "border-amber-500 bg-amber-950/20",
              ready: "border-emerald-500 bg-emerald-950/20",
              completed: "border-stone-700 bg-stone-900/50 opacity-75"
            };
            const headerColors = {
              new: "bg-rose-600 text-white",
              cooking: "bg-amber-500 text-stone-950",
              ready: "bg-emerald-500 text-stone-950",
              completed: "bg-stone-800 text-stone-300"
            };

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between shadow-xl transition ${
                  statusColors[order.status] || "border-stone-800 bg-stone-900"
                }`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${headerColors[order.status]}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black tracking-tight">{order.queueNumber}</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-black/20">
                        {order.orderType === "dine_in"
                          ? "🍽️ ZAL"
                          : order.orderType === "delivery"
                          ? "🛵 DASTAVKA"
                          : "🛍️ O'ZI BILAN"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} daq</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta Subheader */}
                  <div className="px-4 py-2 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-200 truncate">{order.tableName}</span>
                    <button
                      type="button"
                      onClick={() => setReceiptOrder(order)}
                      className="text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Chek</span>
                    </button>
                  </div>

                  {order.note && (
                    <div className="mx-3 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold">
                      ⚠️ Izoh: {order.note}
                    </div>
                  )}

                  {/* Order Items Checklist */}
                  <div className="p-3.5 space-y-2.5">
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleOrderItemReady(order.id, item.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                          item.ready
                            ? "bg-emerald-950/30 border-emerald-700/50 text-stone-400 line-through"
                            : "bg-stone-900 border-stone-800 text-white hover:border-stone-700"
                        }`}
                      >
                        <div className="mt-0.5 text-emerald-400 shrink-0">
                          {item.ready ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-sm leading-snug">
                            <span className="text-amber-400 mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </div>
                          {item.variantName && (
                            <div className="text-xs font-bold text-sky-400 mt-0.5">{item.variantName}</div>
                          )}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs text-amber-300 mt-0.5">
                              + {item.modifiers.map((m) => m.name).join(", ")}
                            </div>
                          )}
                          {item.note && (
                            <div className="text-xs italic text-rose-300 mt-0.5">* {item.note}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-3 bg-stone-900/90 border-t border-stone-800">
                  {order.status === "new" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, "cooking")}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow cursor-pointer"
                    >
                      🔥 Qozonga Olindi (Suzishni boshlash)
                    </button>
                  )}
                  {order.status === "cooking" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, "ready")}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow cursor-pointer"
                    >
                      🔔 TAYYOR! (Navbat Ekraniga Chiqarish)
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      className="w-full py-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      ✅ Mijozga / Kuryerga Topshirildi
                    </button>
                  )}
                  {order.status === "completed" && (
                    <div className="text-center text-xs font-bold text-emerald-400 py-2">
                      ✓ Buyurtma muvaffaqiyatli yakunlangan
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
