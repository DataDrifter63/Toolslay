"use client";

import React, { useState } from "react";
import { 
  Shield, ShieldAlert, ShieldCheck, Eye, EyeOff, Copy, 
  RefreshCw, CheckCircle2, AlertTriangle, Lock, KeyRound, Sparkles
} from "lucide-react";

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const analyzePassword = (pwd) => {
    if (!pwd) {
      return {
        score: 0,
        label: "Enter Password",
        color: "bg-line",
        textColor: "text-muted",
        crackTime: "Instant",
        entropy: 0,
        checks: {
          length: false,
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false,
          noCommon: true,
        },
      };
    }

    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      longLength: pwd.length >= 12,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[^A-Za-z0-9]/.test(pwd),
      noCommon: !/(12345|password|qwerty|admin|welcome|letmein)/i.test(pwd),
    };

    if (checks.length) score += 1;
    if (checks.longLength) score += 1;
    if (checks.lowercase && checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 1;
    if (checks.noCommon) score += 1;

    let poolSize = 0;
    if (checks.lowercase) poolSize += 26;
    if (checks.uppercase) poolSize += 26;
    if (checks.numbers) poolSize += 10;
    if (checks.symbols) poolSize += 32;

    const entropy = poolSize > 0 ? Math.round(pwd.length * Math.log2(poolSize)) : 0;

    let crackTime = "Instant";
    if (entropy > 120) crackTime = "Centuries";
    else if (entropy > 90) crackTime = "Several Years";
    else if (entropy > 70) crackTime = "Months / Years";
    else if (entropy > 50) crackTime = "Days / Weeks";
    else if (entropy > 30) crackTime = "Hours / Days";
    else crackTime = "Seconds / Minutes";

    let label = "Very Weak";
    let color = "bg-rose-500";
    let textColor = "text-rose-600 dark:text-rose-400";

    if (score >= 6) {
      label = "Extremely Strong";
      color = "bg-emerald-500";
      textColor = "text-emerald-600 dark:text-emerald-400";
    } else if (score >= 5) {
      label = "Strong";
      color = "bg-teal-500";
      textColor = "text-teal-600 dark:text-teal-400";
    } else if (score >= 4) {
      label = "Moderate";
      color = "bg-amber-500";
      textColor = "text-amber-600 dark:text-amber-400";
    } else if (score >= 3) {
      label = "Weak";
      color = "bg-orange-500";
      textColor = "text-orange-600 dark:text-orange-400";
    }

    return { score, label, color, textColor, crackTime, entropy, checks };
  };

  const analysis = analyzePassword(password);

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!_";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setMessage("Secure password generated successfully!");
    setTimeout(() => setMessage(""), 2000);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Password Strength Checker
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Check how strong a password is and how long it would take to crack.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Zero-Server Privacy
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          
          {/* INPUT & ANALYSIS PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                Test Your Password
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Type or paste a password below to analyze its vulnerability instantly.
              </p>
            </div>

            {/* Password Input Box */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to check..."
                className="w-full h-12 pl-4 pr-24 border border-line rounded-xl bg-paper text-ink text-sm font-bold outline-none shadow-inner focus:border-brand"
              />
              <div className="absolute right-2 top-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-9 h-9 rounded-lg border border-line bg-surface text-muted hover:text-ink flex items-center justify-center cursor-pointer shadow-sm"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={!password}
                  className="w-9 h-9 rounded-lg border border-line bg-surface text-muted hover:text-ink flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-40"
                  title="Copy password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Strength Meter Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-muted uppercase tracking-wider text-[10px]">Security Rating</span>
                <span className={analysis.textColor}>{analysis.label}</span>
              </div>
              <div className="h-2 w-full bg-paper rounded-full overflow-hidden border border-line flex gap-1 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${analysis.color}`}
                  style={{ width: `${(Math.max(analysis.score, 0) / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Time to Crack & Entropy Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-paper border border-line rounded-xl shadow-inner text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Time to Crack</span>
                <strong className="text-xs sm:text-sm font-black text-ink font-mono block break-words">{analysis.crackTime}</strong>
              </div>
              <div className="p-3.5 bg-paper border border-line rounded-xl shadow-inner text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Estimated Entropy</span>
                <strong className="text-xs sm:text-sm font-black text-brand font-mono block">{analysis.entropy} bits</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={generateSecurePassword}
                className="flex-1 h-11 px-4 rounded-xl bg-brand text-surface font-black text-xs uppercase tracking-wider shadow-sm hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 shrink-0" /> Generate Secure Password
              </button>
              <button
                type="button"
                onClick={() => setPassword("")}
                disabled={!password}
                className="h-11 px-4 rounded-xl border border-line bg-paper text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider hover:bg-rose-500/10 cursor-pointer shadow-sm disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{message}</span>
              </div>
            )}

          </div>

          {/* SECURITY CRITERIA & AUDIT PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                  Password Criteria Audit
                </h3>
                <p className="text-[10px] text-muted mt-0.5">
                  Detailed breakdown of password composition requirements.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "At least 8 characters long", met: analysis.checks.length },
                  { label: "Contains lowercase letters (a-z)", met: analysis.checks.lowercase },
                  { label: "Contains uppercase letters (A-Z)", met: analysis.checks.uppercase },
                  { label: "Contains numbers (0-9)", met: analysis.checks.numbers },
                  { label: "Contains special symbols (!@#$)", met: analysis.checks.symbols },
                  { label: "No common dictionary patterns", met: analysis.checks.noCommon },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-line shadow-sm gap-2">
                    <span className="text-xs font-bold text-ink leading-snug">{item.label}</span>
                    {item.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line text-xs text-muted leading-relaxed flex items-center gap-2.5 shadow-inner mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Your data never leaves your device. All calculations run securely inside your browser.
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}