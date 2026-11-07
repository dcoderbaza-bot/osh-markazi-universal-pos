import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Activity,
  Ban,
  Terminal,
  FileCheck2,
  Users,
  Plus,
  Trash2,
  Zap
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function CyberSecurityView() {
  const {
    config,
    securityLogs,
    securitySettings,
    blockedIps,
    statsBlockedAttacks,
    rolesOverview,
    orders,
    toggleSecuritySetting,
    blockIp,
    unblockIp,
    simulateAttack
  } = useStore();

  const [newIp, setNewIp] = useState("");

  const handleAddIp = (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    blockIp(newIp.trim());
    setNewIp("");
  };

  const severityStyles = {
    info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/40"
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-stone-950 text-stone-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Cybersecurity Header */}
        <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SOC • KIBERXAVFSIZLIK MARKAZI FAOL
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">
                {config.brandName} — Axborot Xavfsizligi va Audit Tizimi
              </h1>
              <p className="text-xs text-stone-400">
                WAF (XSS/SQLi himoya), Brute-Force blokirovkasi, RBAC rollar nazorati va SHA-256 fiskal chek imzosi
              </p>
            </div>
          </div>

          {/* KPI Counters */}
          <div className="flex items-center gap-3">
            <div className="bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase text-stone-400">Qaytarilgan hujumlar</div>
              <div className="text-2xl font-black text-rose-400">{statsBlockedAttacks}</div>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase text-stone-400">Bloklangan IP'lar</div>
              <div className="text-2xl font-black text-amber-400">{blockedIps.length}</div>
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase text-stone-400">SHA-256 Cheklar</div>
              <div className="text-2xl font-black text-emerald-400">{orders.length}</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Controls, Simulator & Firewall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Security Protection Switches (4 cols) */}
          <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-white border-b border-stone-800 pb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Faol Himoya Qatlamlari (WAF & Guard)</span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: "wafEnabled",
                  title: "WAF (SQLi & XSS Filtr)",
                  desc: "Zararli skript va baza hujumlarini avtomatik tutish"
                },
                {
                  key: "bruteForceProtection",
                  title: "Brute-Force Himoyasi",
                  desc: "5 marta xato paroldan so'ng IP ni vaqtincha bloklash"
                },
                {
                  key: "rateLimitEnabled",
                  title: "DDoS & Rate-Limiting",
                  desc: "Bir IP dan keluvchi ommaviy so'rovlarni cheklash"
                },
                {
                  key: "fiscalHashEnabled",
                  title: "SHA-256 Chek Kriptografiyasi",
                  desc: "Har bir kassa chekini raqamli imzo bilan himoyalash"
                },
                {
                  key: "strictRbac",
                  title: "Qat'iy Rollar Nazorati (RBAC)",
                  desc: "Mijozlarga ichki bo'limlarni yashirish va parol talab qilish"
                }
              ].map((item) => {
                const active = Boolean(securitySettings[item.key]);
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleSecuritySetting(item.key)}
                    className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 cursor-pointer hover:border-stone-700 transition"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-white">{item.title}</div>
                      <div className="text-[11px] text-stone-400">{item.desc}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        active ? "bg-emerald-500 text-stone-950" : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {active ? "YOQILGAN" : "O'CHIQ"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center: Penetration Test Simulator & IP Firewall (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Attack Simulator */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-black text-white border-b border-stone-800 pb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Xavfsizlik Sinovi (Penetration Test)</span>
              </div>
              <p className="text-xs text-stone-400">
                Himoya tizimi qanday ishlashini tekshirish uchun sun'iy kiberhujum yuborib ko'ring:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => simulateAttack("sqli")}
                  className="p-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/60 text-left flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-black text-rose-300">🧨 SQL-Injection Hujumini Sinash</div>
                    <div className="text-[10px] font-mono text-rose-400/80">' OR 1=1; DROP TABLE orders;--</div>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-1 rounded">Sinash</span>
                </button>

                <button
                  type="button"
                  onClick={() => simulateAttack("xss")}
                  className="p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/60 text-left flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-black text-amber-300">⚡ XSS Skript Hujumini Sinash</div>
                    <div className="text-[10px] font-mono text-amber-400/80">&lt;script&gt;stealToken()&lt;/script&gt;</div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-1 rounded">Sinash</span>
                </button>

                <button
                  type="button"
                  onClick={() => simulateAttack("tamper")}
                  className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 text-left flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-black text-emerald-300">🧾 SHA-256 Cheklar Imzosini Tekshirish</div>
                    <div className="text-[10px] text-emerald-400/80">Barcha cheklarning haqiqiyligini solishtirish</div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500 text-stone-950 px-2 py-1 rounded">Audit</span>
                </button>
              </div>
            </div>

            {/* IP Firewall Blacklist */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-black text-white border-b border-stone-800 pb-3">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>IP Firewall (Qora Ro'yxat)</span>
              </div>

              <form onSubmit={handleAddIp} className="flex gap-2">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="IP manzil (masalan: 192.168.1.99)"
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bloklash</span>
                </button>
              </form>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {blockedIps.map((ip) => (
                  <div
                    key={ip}
                    className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-rose-400">{ip}</span>
                    <button
                      type="button"
                      onClick={() => unblockIp(ip)}
                      className="text-stone-400 hover:text-emerald-400 text-[11px] font-sans font-bold cursor-pointer"
                    >
                      Blokdan chiqarish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: RBAC Roles & Passwords Table (4 cols) */}
          <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-black text-white border-b border-stone-800 pb-3">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Xodimlar Rollari va Login-Parollar</span>
            </div>

            <div className="space-y-2.5">
              {rolesOverview.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.avatar}</span>
                      <div>
                        <div className="text-xs font-black text-white">{r.roleLabel}</div>
                        <div className="text-[11px] text-stone-400">{r.fullName}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      FAOL
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-stone-900 text-[11px]">
                    <span className="text-stone-400">
                      Login: <strong className="text-emerald-400 font-mono">{r.username}</strong>
                    </span>
                    <span className="text-stone-400">
                      Parol: <strong className="text-amber-300 font-mono">{r.passwordHint || r.password}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Live Security Audit Logs */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Jonli Xavfsizlik Auditi Jurnali (SIEM / Audit Logs)</span>
            </div>
            <span className="text-xs text-stone-400">{securityLogs.length} ta yozuv</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
            {securityLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                  severityStyles[log.severity] || severityStyles.info
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/30">
                    {log.event}
                  </span>
                  <span className="font-sans font-semibold text-white">{log.details}</span>
                </div>
                <div className="text-[11px] opacity-80 shrink-0">
                  IP: {log.ip} • {log.actor} • {new Date(log.timestamp).toLocaleTimeString("uz-UZ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
