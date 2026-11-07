import React, { useState } from "react";
import { X, Plus, Minus, Flame, Clock, Sparkles, Check } from "lucide-react";
import { formatMoney, sound } from "../utils/sound";

const QUICK_NOTES = [
  "Yog'i kamroq bo'lsin",
  "Yog'liroq (qovurma)",
  "Achchiq qalampir bilan",
  "Piyozsiz",
  "Qazisi ustiga kesilsin",
  "Issiqroq qadoqlansin"
];

export default function ProductModifierModal({ product, config, onClose, onConfirm }) {
  if (!product) return null;

  const variants = product.variants || [];
  const modifiers = product.modifiers || [];

  const [selectedVariant, setSelectedVariant] = useState(
    variants.length > 0 ? variants[Math.min(1, variants.length - 1)] : null
  );
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const toggleModifier = (mod) => {
    sound.playPosTap();
    setSelectedModifiers((prev) =>
      prev.some((m) => m.id === mod.id) ? prev.filter((m) => m.id !== mod.id) : [...prev, mod]
    );
  };

  const toggleQuickNote = (tag) => {
    sound.playPosTap();
    if (note.includes(tag)) {
      setNote(
        note
          .replace(tag, "")
          .replace(/,\s*,/g, ",")
          .replace(/^,\s*|,\s*$/g, "")
          .trim()
      );
    } else {
      setNote(note ? `${note}, ${tag}` : tag);
    }
  };

  const basePrice = Number(product.price) || 0;
  const variantDelta = selectedVariant ? Number(selectedVariant.priceDelta) || 0 : 0;
  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const unitPrice = Math.max(1000, basePrice + variantDelta + modifiersTotal);
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    sound.playPosTap();
    onConfirm({
      productId: product.id,
      name: product.name,
      image: product.image,
      variantId: selectedVariant?.id || "",
      variantName: selectedVariant?.name || "",
      modifiers: selectedModifiers,
      quantity,
      unitPrice,
      totalPrice,
      note: note.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Hero Image */}
        <div className="relative h-52 sm:h-60 bg-stone-900">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {product.badge && (
            <span
              style={{ backgroundColor: config.themeColor }}
              className="absolute top-4 left-4 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg"
            >
              {product.badge}
            </span>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h3 className="text-xl sm:text-2xl font-black leading-tight">{product.name}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-200 mt-1.5">
              {product.weight && (
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md font-semibold">
                  ⚖️ {selectedVariant?.weight || product.weight}
                </span>
              )}
              {product.calories && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {product.calories}
                </span>
              )}
              {product.prepTime && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {product.prepTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 max-h-[58vh] overflow-y-auto space-y-5">
          <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

          {/* 1. Portion / Size Selector */}
          {variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                  1. Porsiya / Hajmni tanlang
                </label>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Majburiy
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variants.map((v) => {
                  const active = selectedVariant?.id === v.id;
                  const vPrice = basePrice + (Number(v.priceDelta) || 0);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        sound.playPosTap();
                        setSelectedVariant(v);
                      }}
                      style={
                        active
                          ? { borderColor: config.themeColor, backgroundColor: `${config.themeColor}12` }
                          : {}
                      }
                      className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                        active ? "shadow-sm" : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900">{v.name}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {formatMoney(vPrice, config.currency)} {v.weight ? `• ${v.weight}` : ""}
                        </div>
                      </div>
                      <div
                        style={active ? { backgroundColor: config.themeColor } : {}}
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          active ? "border-transparent text-white" : "border-stone-300"
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Extra Modifiers (Feed Up style Constructor) */}
          {modifiers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  2. Osh ustiga qo'shimchalar (Konstruktor)
                </label>
                <span className="text-[11px] text-stone-400">Ixtiyoriy</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modifiers.map((mod) => {
                  const isSelected = selectedModifiers.some((m) => m.id === mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModifier(mod)}
                      style={
                        isSelected
                          ? { borderColor: config.themeColor, backgroundColor: `${config.themeColor}12` }
                          : {}
                      }
                      className={`p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected ? "shadow-sm" : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="pr-2">
                        <div className="text-xs font-bold text-stone-800">{mod.name}</div>
                        <div className="text-[11px] font-semibold text-amber-700">
                          +{formatMoney(mod.price, config.currency)}
                        </div>
                      </div>
                      <div
                        style={isSelected ? { backgroundColor: config.themeColor } : {}}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? "border-transparent text-white" : "border-stone-300 bg-stone-50"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Culinary Preferences / Special Notes */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
              3. Oshpaz uchun maxsus istaklar
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {QUICK_NOTES.map((tag) => {
                const active = note.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleQuickNote(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                      active
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masalan: Qoshiq soling, achichuk piyozsiz bo'lsin..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          {/* Quantity Counter */}
          <div className="flex items-center bg-white border border-stone-300 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-700 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-black text-base">{quantity}</span>
            <button
              type="button"
              onClick={() => {
                sound.playPosTap();
                setQuantity((q) => q + 1);
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleAdd}
            style={{ backgroundColor: config.themeColor }}
            className="flex-1 py-3.5 px-5 rounded-xl text-white font-extrabold text-sm flex items-center justify-between shadow-lg hover:opacity-95 transition cursor-pointer"
          >
            <span>Qo'shish</span>
            <span className="bg-black/20 px-3 py-1 rounded-lg text-xs font-black">
              {formatMoney(totalPrice, config.currency)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
