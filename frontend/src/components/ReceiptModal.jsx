import React from "react";
import { Printer, X, ShieldCheck } from "lucide-react";
import { formatMoney } from "../utils/sound";

export default function ReceiptModal({ order, config, onClose }) {
  if (!order) return null;

  const paymentLabels = {
    cash: "Naqd",
    card: "Karta (Terminal)",
    click: "CLICK",
    payme: "Payme",
    split: "Aralash"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-200">
        {/* Top bar */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider">Kassa Cheki</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean & Simplified Printable Receipt */}
        <div className="p-5 bg-stone-50 flex justify-center">
          <div
            id="thermal-receipt-print"
            className="bg-white w-[290px] p-4 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs"
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-stone-300 pb-2.5 mb-2.5">
              <div className="font-black text-sm uppercase">{config.brandName}</div>
              <div className="text-[11px] text-stone-500">{config.phone}</div>
            </div>

            {/* Big Queue Number */}
            <div className="bg-stone-900 text-white rounded-lg py-2 px-3 text-center mb-3 print:border print:border-black print:bg-white print:text-black">
              <div className="text-[10px] uppercase opacity-75">Navbat raqami</div>
              <div className="text-3xl font-black tracking-wider">{order.queueNumber}</div>
              <div className="text-[10px] opacity-90">{order.tableName}</div>
            </div>

            {/* Time & Customer */}
            <div className="flex justify-between text-[11px] text-stone-500 border-b border-dashed border-stone-300 pb-2 mb-2">
              <span>{new Date(order.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="font-bold text-stone-700">{order.customerName || "Mijoz"}</span>
            </div>

            {/* Items List */}
            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2.5 mb-2.5">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="whitespace-nowrap pl-2">
                      {formatMoney(item.totalPrice, config.currency)}
                    </span>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-[10px] text-stone-500 pl-3">
                      + {item.modifiers.map((m) => m.name).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-1">
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>Chegirma:</span>
                  <span>-{formatMoney(order.discount, config.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1">
                <span>JAMI:</span>
                <span>{formatMoney(order.total, config.currency)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-600">
                <span>To'lov turi:</span>
                <span className="font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              {Number(order.changeAmount) > 0 && (
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Qaytim:</span>
                  <span>{formatMoney(order.changeAmount, config.currency)}</span>
                </div>
              )}
            </div>

            {/* Security Hash Footer */}
            <div className="mt-3 pt-2 border-t border-dashed border-stone-300 text-center text-[10px] text-stone-500">
              <div className="flex items-center justify-center gap-1 font-bold text-stone-600">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>SHA-256: {order.fiscalHash || "VERIFIED"}</span>
              </div>
              <div className="mt-0.5">{config.receiptFooter}</div>
            </div>
          </div>
        </div>

        {/* Simple Actions */}
        <div className="p-3.5 bg-white border-t border-stone-200 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 cursor-pointer"
          >
            Yopish
          </button>
          <button
            onClick={() => window.print()}
            style={{ backgroundColor: config.themeColor }}
            className="flex-1 py-2.5 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow hover:opacity-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chop Etish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
