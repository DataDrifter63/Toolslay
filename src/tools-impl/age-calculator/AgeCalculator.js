"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cake,
  PartyPopper,
  Copy,
  Check,
  Info,
  Star,
  Moon,
  Hourglass,
  CalendarHeart,
} from "lucide-react";

const ZODIAC_SIGNS = [
  { name: "Capricorn", from: [12, 22], to: [1, 19] },
  { name: "Aquarius", from: [1, 20], to: [2, 18] },
  { name: "Pisces", from: [2, 19], to: [3, 20] },
  { name: "Aries", from: [3, 21], to: [4, 19] },
  { name: "Taurus", from: [4, 20], to: [5, 20] },
  { name: "Gemini", from: [5, 21], to: [6, 20] },
  { name: "Cancer", from: [6, 21], to: [7, 22] },
  { name: "Leo", from: [7, 23], to: [8, 22] },
  { name: "Virgo", from: [8, 23], to: [9, 22] },
  { name: "Libra", from: [9, 23], to: [10, 22] },
  { name: "Scorpio", from: [10, 23], to: [11, 21] },
  { name: "Sagittarius", from: [11, 22], to: [12, 21] },
];

const CHINESE_ZODIAC = ["Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getZodiacSign(month, day) {
  const found = ZODIAC_SIGNS.find(({ from, to }) => {
    if (from[0] === to[0]) return month === from[0] && day >= from[1] && day <= to[1];
    if (month === from[0]) return day >= from[1];
    if (month === to[0]) return day <= to[1];
    return false;
  });
  return found ? found.name : "Capricorn";
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function countLeapYears(startYear, endYear) {
  let count = 0;
  for (let y = startYear; y <= endYear; y += 1) {
    if (isLeapYear(y)) count += 1;
  }
  return count;
}

// Calendar-accurate year/month/day difference (not a 365-day approximation).
function diffYMD(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const lastDayOfPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += lastDayOfPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function nextOccurrence(birthDate, from) {
  const next = new Date(from.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  next.setHours(0, 0, 0, 0);
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (next < fromMidnight) next.setFullYear(next.getFullYear() + 1);
  return next;
}

function fmtNumber(n) {
  return Math.floor(n).toLocaleString();
}

function toInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function AgeCalculator({ compact = false }) {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(toInputValue(new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())));
  const [birthTime, setBirthTime] = useState("");
  const [refMode, setRefMode] = useState("today"); // "today" | "custom"
  const [customDate, setCustomDate] = useState(toInputValue(today));
  const [now, setNow] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [targetAge, setTargetAge] = useState("30");

  // Live "as of now" ticking — only meaningful when comparing against today.
  useEffect(() => {
    if (refMode !== "today") return undefined;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [refMode]);

  const parsedBirth = useMemo(() => {
    if (!birthDate) return null;
    const [y, m, d] = birthDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    if (birthTime) {
      const [hh, mm] = birthTime.split(":").map(Number);
      return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
    }
    return new Date(y, m - 1, d, 0, 0, 0);
  }, [birthDate, birthTime]);

  const referenceDate = useMemo(() => {
    if (refMode === "today") return now;
    if (!customDate) return now;
    const [y, m, d] = customDate.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [refMode, now, customDate]);

  const isFuture = parsedBirth && referenceDate < parsedBirth;

  const result = useMemo(() => {
    if (!parsedBirth || isFuture) return null;

    const ymd = diffYMD(parsedBirth, referenceDate);
    const totalMs = referenceDate - parsedBirth;
    const totalSeconds = totalMs / 1000;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;
    const totalWeeks = totalDays / 7;
    const totalMonths = ymd.years * 12 + ymd.months;

    const dayOfWeekBorn = DAY_NAMES[parsedBirth.getDay()];
    const zodiac = getZodiacSign(parsedBirth.getMonth() + 1, parsedBirth.getDate());
    const chineseZodiac = CHINESE_ZODIAC[parsedBirth.getFullYear() % 12];
    const leapYears = countLeapYears(parsedBirth.getFullYear(), referenceDate.getFullYear());

    const nextBirthday = nextOccurrence(parsedBirth, referenceDate);
    const msToNextBirthday = nextBirthday - new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), referenceDate.getHours(), referenceDate.getMinutes(), referenceDate.getSeconds());
    const daysToNextBirthday = Math.ceil(msToNextBirthday / (1000 * 60 * 60 * 24));
    const isBirthdayToday = parsedBirth.getMonth() === referenceDate.getMonth() && parsedBirth.getDate() === referenceDate.getDate();
    const turningAge = nextBirthday.getFullYear() - parsedBirth.getFullYear();

    return {
      ymd, totalSeconds, totalMinutes, totalHours, totalDays, totalWeeks, totalMonths,
      dayOfWeekBorn, zodiac, chineseZodiac, leapYears,
      daysToNextBirthday, isBirthdayToday, turningAge,
    };
  }, [parsedBirth, referenceDate, isFuture]);

  const targetAgeDate = useMemo(() => {
    if (!parsedBirth) return null;
    const n = parseInt(targetAge, 10);
    if (Number.isNaN(n) || n < 0) return null;
    const d = new Date(parsedBirth);
    d.setFullYear(d.getFullYear() + n);
    return d;
  }, [parsedBirth, targetAge]);

  async function handleCopy() {
    if (!result) return;
    const text = `Age: ${result.ymd.years} years, ${result.ymd.months} months, ${result.ymd.days} days\nTotal days lived: ${fmtNumber(result.totalDays)}\nBorn on a ${result.dayOfWeekBorn} · ${result.zodiac} · Chinese zodiac: ${result.chineseZodiac}\nNext birthday in ${result.daysToNextBirthday} day(s)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Date of birth</span>
          <input
            type="date"
            value={birthDate}
            max={toInputValue(today)}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Time of birth (optional)</span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>
      </div>

      {!compact && (
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-medium text-muted">Calculate age as of</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-line bg-paper p-1">
              {[
                { id: "today", label: "Today (live)" },
                { id: "custom", label: "A specific date" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRefMode(opt.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    refMode === opt.id ? "bg-surface text-ink shadow-card" : "text-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {refMode === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {isFuture && (
        <p className="mt-5 rounded-lg border border-amber/30 bg-amber-light px-3 py-2.5 text-sm text-ink">
          That date of birth is after the reference date — pick a date in the past.
        </p>
      )}

      {result && (
        <>
          <div className="mt-6 rounded-xl border border-brand bg-brand-light p-5 text-center">
            <p className="text-xs font-medium text-muted">
              {refMode === "today" ? "You are exactly" : "Age on the selected date"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-brand sm:text-4xl">
              {result.ymd.years}y {result.ymd.months}m {result.ymd.days}d
            </p>
            {result.isBirthdayToday && (
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-teal">
                <PartyPopper size={15} aria-hidden="true" /> Happy Birthday! 🎉
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total months" value={fmtNumber(result.totalMonths)} />
            <Stat label="Total weeks" value={fmtNumber(result.totalWeeks)} />
            <Stat label="Total days" value={fmtNumber(result.totalDays)} />
            <Stat label="Leap years lived" value={fmtNumber(result.leapYears)} />
          </div>

          {refMode === "today" && (
            <div className="mt-3 rounded-xl border border-line bg-surface p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Hourglass size={13} aria-hidden="true" /> Ticking live, right now
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Hours lived" value={fmtNumber(result.totalHours)} small />
                <Stat label="Minutes lived" value={fmtNumber(result.totalMinutes)} small />
                <Stat label="Seconds lived" value={fmtNumber(result.totalSeconds)} small />
              </div>
            </div>
          )}

          {!compact && (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoTile icon={CalendarHeart} label="Born on a" value={result.dayOfWeekBorn} />
                <InfoTile icon={Star} label="Zodiac sign" value={result.zodiac} />
                <InfoTile icon={Moon} label="Chinese zodiac" value={result.chineseZodiac} />
              </div>

              <div className="mt-3 rounded-xl border border-teal/30 bg-teal-light p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Cake size={15} className="text-teal" aria-hidden="true" />
                  {result.isBirthdayToday
                    ? `Today you turn ${result.turningAge}!`
                    : `${result.daysToNextBirthday} day${result.daysToNextBirthday !== 1 ? "s" : ""} until you turn ${result.turningAge}`}
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-line bg-surface p-4">
                <p className="mb-2 text-xs font-semibold text-ink">When will I turn a certain age?</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
                    <input
                      type="number"
                      value={targetAge}
                      onChange={(e) => setTargetAge(e.target.value)}
                      className="w-16 bg-transparent text-sm text-ink focus:outline-none"
                    />
                    <span className="text-xs text-muted">years old</span>
                  </div>
                  {targetAgeDate && (
                    <p className="text-sm text-ink">
                      → {targetAgeDate < today ? "You turned" : "You'll turn"} {targetAge} on{" "}
                      <span className="font-semibold">
                        {targetAgeDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:text-brand"
              >
                {copied ? <Check size={13} className="text-teal" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copied ? "Copied!" : "Copy summary"}
              </button>

              <p className="mt-4 flex items-start gap-1.5 text-xs text-muted">
                <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                Chinese zodiac here is based on the birth year only and doesn't account for the exact Lunar New Year date, which can shift the sign for people born in January or February.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-2.5 text-center">
      <div className={`font-display font-bold text-ink ${small ? "text-base" : "text-lg"}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function InfoTile({ icon: IconCmp, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
        <IconCmp size={16} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}