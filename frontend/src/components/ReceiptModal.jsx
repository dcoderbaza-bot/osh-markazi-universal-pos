import React from "react";
import { Printer, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatMoney } from "../utils/sound";
import { printThermalReceipt, generateSoliqQrSvg } from "../utils/printEngine";
import { useStore } from "../context/StoreContext";

export default function ReceiptModal({ order, config, onClose }) {
  const { soliqConfig, printerConfig } = useStore();

  if (!order) return null;

  const paymentLabels = {
    cash: "Naqd",
    card: "Karta (Terminal)",
    click: "CLICK",
    payme: "Payme",
    split: "Aralash"
  };

  const vatAmount = order.vatAmount || Math.round(((Number(order.total) || 0) * 12) / 112);
  const cashback = order.soliqCashback || Math.round((Number(order.total) || 0) * 0.01);
  const qrSvg = generateSoliqQrSvg(
    order.qrCodeUrl || `https://ofd.soliq.uz/check?s=${order.fiscalSign || "849201746381"}`,
    96
  );

  const handleDirectPrint = () => {
    printThermalReceipt(order, config, soliqConfig, printerConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-200 my-auto">
        {/* Top bar */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Soliq.uz Fiskal Chek ({printerConfig?.paperWidth || "80mm"})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean & Simplified Printable Receipt Preview */}
        <div className="p-4 bg-stone-100 max-h-[70dvh] overflow-y-auto flex justify-center">
          <div className="bg-white w-[290px] p-4 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs shadow-sm">
            {/* Header */}
            <div className="text-center border-b border-dashed border-stone-300 pb-2 mb-2">
              <div className="font-black text-sm uppercase">{config.brandName}</div>
              <div className="text-[10px] text-stone-600">
                {soliqConfig?.companyName || '"ASL OSH MARKAZI" MCHJ'} • STIR: {soliqConfig?.stir || "309841205"}
              </div>
              <div className="text-[10px] text-stone-500">{config.phone}</div>
            </div>

            {/* Big Queue Number */}
            <div className="bg-stone-950 text-white rounded-xl py-2 px-3 text-center mb-2.5">
              <div className="text-[9px] uppercase tracking-widest opacity-75">Navbat raqami</div>
              <div className="text-3xl font-black tracking-wider">{order.queueNumber}</div>
              <div className="text-[10px] opacity-90">{order.tableName}</div>
            </div>

            {/* Time & Customer */}
            <div className="flex justify-between text-[10px] text-stone-500 border-b border-dashed border-stone-300 pb-1.5 mb-2">
              <span>Chek #{order.receiptSeq || "1001"}</span>
              <span>{new Date(order.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>

            {/* Items List */}
            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2 mb-2">
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
                  <div className="text-[9px] text-stone-500">
                    MXIK: {item.mxikCode || "10705001001000000"}
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Soliq VAT */}
            <div className="space-y-1">
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[10px] text-emerald-700">
                  <span>Chegirma:</span>
                  <span>-{formatMoney(order.discount, config.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-0.5">
                <span>JAMI TO'LOV:</span>
                <span>{formatMoney(order.total, config.currency)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>QQS (NDS 12%):</span>
                <span>{formatMoney(vatAmount, config.currency)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>To'lov turi:</span>
                <span className="font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              {Number(order.changeAmount) > 0 && (
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Qaytim:</span>
                  <span>{formatMoney(order.changeAmount, config.currency)}</span>
                </div>
              )}
            </div>

            {/* Soliq Fiscal Sign & QR Code */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-stone-300 text-[10px] text-stone-600 space-y-0.5">
              <div className="flex justify-between">
                <span>FM ID:</span>
                <span className="font-bold">{order.terminalId || soliqConfig?.terminalId || "LG4202600819"}</span>
              </div>
              <div className="flex justify-between">
                <span>Fiskal belgi:</span>
                <span className="font-bold">{order.fiscalSign || "849201746381"}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Soliq Keshbek (1%):</span>
                <span>+{formatMoney(cashback, config.currency)}</span>
              </div>

              <div className="flex flex-col items-center justify-center pt-2">
                <div
                  className="p-1.5 border border-stone-300 rounded-lg bg-white"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className="flex items-center gap-1 font-bold text-stone-700 mt-1 text-[9px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>OFD.SOLIQ.UZ • {order.fiscalHash || "VERIFIED"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Actions */}
        <div className="p-3.5 bg-white border-t border-stone-200 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 cursor-pointer"
          >
            Yopish
          </button>
          <button
            onClick={handleDirectPrint}
            style={{ backgroundColor: config.themeColor }}
            className="flex-1 py-3 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg hover:opacity-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Printerga Chiqarish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
