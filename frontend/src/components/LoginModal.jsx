import React, { useState } from "react";
import { Shield, Lock, User, KeyRound, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { sound } from "../utils/sound";

export default function LoginModal({ onClose, onLoginSuccess }) {
  const { rolesOverview, loginStaff, config } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    const res = await loginStaff(username, password);
    setSubmitting(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || "Login yoki parol xato!");
    }
  };

  const handleQuickRoleSelect = async (roleItem) => {
    sound.playPosTap();
    setUsername(roleItem.username);
    setPassword(roleItem.passwordHint || roleItem.password);
    setErrorMsg("");
    setSubmitting(true);
    const res = await loginStaff(roleItem.username, roleItem.passwordHint || roleItem.password);
    setSubmitting(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: config.themeColor }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base">Xodimlar Tizimiga Kirish (RBAC)</h3>
              <p className="text-[11px] text-stone-400">
                Har bir rol faqat o'ziga ruxsat berilgan bo'limga kira oladi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-400 mb-1">
                  Login
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kassir / oshpaz / admin..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-400 mb-1">
                  Parol
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: config.themeColor }}
              className="w-full py-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{submitting ? "Tekshirilmoqda..." : "Tizimga Kirish"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Credentials Quick-Select Table */}
          <div className="border-t border-stone-800 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Barcha Rollar va Login-Parollar (1-bosishda kirish):
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {rolesOverview.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleQuickRoleSelect(r)}
                  className="p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/70 flex items-center justify-between gap-2 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{r.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-black text-xs text-white group-hover:text-amber-400 transition">
                        {r.roleLabel}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate">
                        Ruxsat: {r.allowedModules.join(", ").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right font-mono text-[11px] bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                      <span className="text-emerald-400 font-bold">{r.username}</span>
                      <span className="text-stone-500"> / </span>
                      <span className="text-amber-300 font-bold">{r.passwordHint || r.password}</span>
                    </div>
                    <span className="px-2.5 py-1.5 rounded-lg bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-[11px] font-black transition">
                      Kirish →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
