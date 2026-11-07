import React from "react";
import { Printer, X, CheckCircle2, QrCode } from "lucide-react";
import { formatMoney } from "../utils/sound";

export default function ReceiptModal({ order, config, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentLabels = {
    cash: "Naqd pul",
    card: "Uzcard / Humo terminal",
    click: "CLICK Evolution",
    payme: "Payme QR",
    split: "Aralash to'lov (Naqd + Karta)"
  };

  const orderTypeLabels = {
    dine_in: "Zalda (Stol buyurtmasi)",
    pickup: "O'zi bilan (Olib ketish)",
    delivery: "Yetkazib berish (Dastavka)"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Modal Controls */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">FISKAL CHEK VA NAVBAT TALONI (80mm)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable 80mm Thermal Slip Area */}
        <div className="p-6 bg-stone-100 max-h-[72vh] overflow-y-auto flex justify-center">
          <div
            id="thermal-receipt-print"
            className="bg-white w-[320px] p-5 shadow-md border border-dashed border-stone-300 text-stone-900 font-mono text-xs leading-relaxed"
          >
            {/* Brand Header */}
            <div className="text-center border-b border-dashed border-stone-400 pb-3 mb-3">
              <div className="text-2xl mb-1">{config.logoEmoji || "🍛"}</div>
              <div className="font-black text-base tracking-tight uppercase">{config.brandName}</div>
              <div className="text-[11px] text-stone-600">{config.brandSubtitle}</div>
              <div className="text-[11px] text-stone-600 mt-0.5">Tel: {config.phone}</div>
              <div className="text-[10px] text-stone-500 mt-1">{config.receiptHeader}</div>
            </div>

            {/* Big Electronic Queue Number (Feed Up Style) */}
            <div className="bg-stone-950 text-white rounded-xl py-2.5 px-4 text-center my-3 print:border-2 print:border-black print:bg-white print:text-black">
              <div className="text-[10px] uppercase tracking-widest opacity-80">Elektron Navbat Raqami</div>
              <div className="text-3xl font-black tracking-wider mt-0.5">{order.queueNumber}</div>
              <div className="text-[10px] mt-0.5 opacity-90">{orderTypeLabels[order.orderType] || order.tableName}</div>
            </div>

            {/* Meta Info */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-stone-400 pb-2.5 mb-2.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Chek ID:</span>
                <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Sana va vaqt:</span>
                <span>{new Date(order.createdAt).toLocaleString("uz-UZ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kassir / Kanal:</span>
                <span className="font-semibold">{order.cashierName || "POS Kassa"}</span>
              </div>
              {order.tableName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Joy / Manzil:</span>
                  <span className="font-bold">{order.tableName}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Mijoz:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="border-b border-dashed border-stone-400 pb-2.5 mb-2.5 space-y-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-stone-500 border-b border-stone-200 pb-1">
                <span>Taom nomi</span>
                <span>Soni x Summa</span>
              </div>
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span className="pr-2">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="whitespace-nowrap">{formatMoney(item.totalPrice, config.currency)}</span>
                  </div>
                  <div className="text-[10px] text-stone-600 pl-3">
                    {item.quantity} x {formatMoney(item.unitPrice, config.currency)}
                    {item.variantName ? ` • ${item.variantName}` : ""}
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-[10px] text-stone-500 pl-3">
                      + {item.modifiers.map((m) => m.name).join(", ")}
                    </div>
                  )}
                  {item.note && <div className="text-[10px] italic text-stone-600 pl-3">* Izoh: {item.note}</div>}
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-stone-400 pb-2.5 mb-2.5">
              <div className="flex justify-between">
                <span>Jami taomlar:</span>
                <span>{formatMoney(order.subtotal || order.total, config.currency)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Chegirma {order.promoCode ? `(${order.promoCode})` : ""}:</span>
                  <span>-{formatMoney(order.discount, config.currency)}</span>
                </div>
              )}
              {Number(order.serviceFee) > 0 && (
                <div className="flex justify-between">
                  <span>Xizmat haqi ({config.serviceChargePercent}%):</span>
                  <span>+{formatMoney(order.serviceFee, config.currency)}</span>
                </div>
              )}
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span>+{formatMoney(order.deliveryFee, config.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-stone-300">
                <span>JAMI TO'LOV:</span>
                <span>{formatMoney(order.total, config.currency)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span>To'lov turi:</span>
                <span className="font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              {Number(order.cashReceived) > 0 && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span>Qabul qilindi (Naqd):</span>
                    <span>{formatMoney(order.cashReceived, config.currency)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Qaytim:</span>
                    <span>{formatMoney(order.changeAmount || 0, config.currency)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Fiscal QR & Footer */}
            <div className="text-center pt-1">
              <div className="inline-flex flex-col items-center justify-center p-2 border border-stone-300 rounded-lg my-1">
                <QrCode className="w-14 h-14 text-stone-800" />
                <span className="text-[9px] text-stone-500 mt-1">FISKAL QR • SOLIQ.UZ</span>
              </div>
              <div className="text-[10px] text-stone-600 mt-2 font-sans">{config.receiptFooter}</div>
              <div className="text-[10px] font-bold mt-1">{config.instagram}</div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-100 transition"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            style={{ backgroundColor: config.themeColor }}
            className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Chekni Chop Etish
          </button>
        </div>
      </div>
    </div>
  );
}
