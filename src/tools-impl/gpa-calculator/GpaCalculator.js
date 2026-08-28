"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, GraduationCap, Target, Settings2 } from "lucide-react";

// ---------- Grading scales ----------
const BUILT_IN_SCALES = {
  "4.0": {
    label: "4.0 Scale (US)",
    max: 4.0,
    grades: [
      { letter: "A+", points: 4.0 }, { letter: "A", points: 4.0 }, { letter: "A-", points: 3.7 },
      { letter: "B+", points: 3.3 }, { letter: "B", points: 3.0 }, { letter: "B-", points: 2.7 },
      { letter: "C+", points: 2.3 }, { letter: "C", points: 2.0 }, { letter: "C-", points: 1.7 },
      { letter: "D+", points: 1.3 }, { letter: "D", points: 1.0 }, { letter: "F", points: 0.0 },
    ],
  },
  "4.3": {
    label: "4.3 Scale (Canada)",
    max: 4.3,
    grades: [
      { letter: "A+", points: 4.3 }, { letter: "A", points: 4.0 }, { letter: "A-", points: 3.7 },
      { letter: "B+", points: 3.3 }, { letter: "B", points: 3.0 }, { letter: "B-", points: 2.7 },
      { letter: "C+", points: 2.3 }, { letter: "C", points: 2.0 }, { letter: "C-", points: 1.7 },
      { letter: "D+", points: 1.3 }, { letter: "D", points: 1.0 }, { letter: "F", points: 0.0 },
    ],
  },
  "10.0": {
    label: "10-Point Scale (India/Pakistan HEC)",
    max: 10.0,
    grades: [
      { letter: "O", points: 10 }, { letter: "A+", points: 9 }, { letter: "A", points: 8 },
      { letter: "B+", points: 7 }, { letter: "B", points: 6 }, { letter: "C", points: 5 },
      { letter: "P", points: 4 }, { letter: "F", points: 0 },
    ],
  },
};

const STORAGE_KEY = "toolslay-gpa-calculator";
let idCounter = 1;
const nextId = () => idCounter++;

function makeCourse() {
  return { id: nextId(), name: "", credits: 3, grade: "" };
}

function makeSemester(name) {
  return { id: nextId(), name, courses: [makeCourse()] };
}

function computeSemesterStats(semester, gradeMap) {
  let credits = 0;
  let points = 0;
  for (const c of semester.courses) {
    const cr = parseFloat(c.credits) || 0;
    const gp = gradeMap[c.grade];
    if (cr > 0 && gp != null) {
      credits += cr;
      points += cr * gp;
    }
  }
  return { credits, points, gpa: credits > 0 ? points / credits : null };
}

export default function GpaCalculator() {
  const [scaleKey, setScaleKey] = useState("4.0");
  const [customGrades, setCustomGrades] = useState(BUILT_IN_SCALES["4.0"].grades);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [semesters, setSemesters] = useState([makeSemester("Semester 1")]);
  const [previousCgpa, setPreviousCgpa] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [loaded, setLoaded] = useState(false);

  const isCustom = scaleKey === "custom";
  const activeScale = isCustom
    ? { label: "Custom Scale", max: Math.max(...customGrades.map((g) => g.points), 4), grades: customGrades }
    : BUILT_IN_SCALES[scaleKey];
  const gradeMap = useMemo(
    () => Object.fromEntries(activeScale.grades.map((g) => [g.letter, g.points])),
    [activeScale]
  );

  // ---------- Load / save (localStorage) ----------
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        if (saved.scaleKey) setScaleKey(saved.scaleKey);
        if (saved.customGrades) setCustomGrades(saved.customGrades);
        if (saved.semesters?.length) {
          idCounter = saved.nextId || idCounter;
          setSemesters(saved.semesters);
        }
        if (saved.previousCgpa != null) setPreviousCgpa(saved.previousCgpa);
        if (saved.previousCredits != null) setPreviousCredits(saved.previousCredits);
      }
    } catch {
      // no saved data — start fresh
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ scaleKey, customGrades, semesters, previousCgpa, previousCredits, nextId: idCounter })
      );
    } catch {
      // storage unavailable — inputs still work, just won't persist
    }
  }, [scaleKey, customGrades, semesters, previousCgpa, previousCredits, loaded]);

  // ---------- Derived totals ----------
  const semesterStats = useMemo(
    () => semesters.map((s) => ({ id: s.id, ...computeSemesterStats(s, gradeMap) })),
    [semesters, gradeMap]
  );

  const totals = useMemo(() => {
    const prevCr = parseFloat(previousCredits) || 0;
    const prevGpa = parseFloat(previousCgpa) || 0;
    let credits = prevCr;
    let points = prevCr * prevGpa;
    for (const s of semesterStats) {
      credits += s.credits;
      points += s.points;
    }
    return { credits, points, cgpa: credits > 0 ? points / credits : null };
  }, [semesterStats, previousCredits, previousCgpa]);

  const gradeDistribution = useMemo(() => {
    const counts = {};
    for (const s of semesters) {
      for (const c of s.courses) {
        if (c.grade) counts[c.grade] = (counts[c.grade] || 0) + 1;
      }
    }
    return counts;
  }, [semesters]);

  const maxDistCount = Math.max(1, ...Object.values(gradeDistribution));

  // ---------- Target GPA planner ----------
  const target = useMemo(() => {
    const goal = parseFloat(targetCgpa);
    const remaining = parseFloat(remainingCredits);
    if (!goal || !remaining) return null;
    const requiredPoints = goal * (totals.credits + remaining) - totals.points;
    const requiredAvg = requiredPoints / remaining;
    return { requiredAvg, achievable: requiredAvg <= activeScale.max, alreadyThere: requiredAvg <= 0 };
  }, [targetCgpa, remainingCredits, totals, activeScale.max]);

  // ---------- Mutators ----------
  function updateCourse(semId, courseId, field, value) {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id !== semId ? s : { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, [field]: value } : c)) }
      )
    );
  }

  function addCourse(semId) {
    setSemesters((prev) => prev.map((s) => (s.id === semId ? { ...s, courses: [...s.courses, makeCourse()] } : s)));
  }

  function removeCourse(semId, courseId) {
    setSemesters((prev) =>
      prev.map((s) => (s.id !== semId ? s : { ...s, courses: s.courses.filter((c) => c.id !== courseId) }))
    );
  }

  function addSemester() {
    setSemesters((prev) => [...prev, makeSemester(`Semester ${prev.length + 1}`)]);
  }

  function removeSemester(semId) {
    setSemesters((prev) => (prev.length === 1 ? prev : prev.filter((s) => s.id !== semId)));
  }

  function renameSemester(semId, name) {
    setSemesters((prev) => prev.map((s) => (s.id === semId ? { ...s, name } : s)));
  }

  function updateCustomGrade(index, field, value) {
    setCustomGrades((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: field === "points" ? parseFloat(value) || 0 : value } : g))
    );
  }

  function addCustomGrade() {
    setCustomGrades((prev) => [...prev, { letter: "", points: 0 }]);
  }

  function removeCustomGrade(index) {
    setCustomGrades((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      {/* ---------- Scale selector ---------- */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Grading scale</span>
          <select
            value={scaleKey}
            onChange={(e) => setScaleKey(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
          >
            {Object.entries(BUILT_IN_SCALES).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
            <option value="custom">Custom scale...</option>
          </select>
        </label>
        {isCustom && (
          <button
            type="button"
            onClick={() => setShowCustomEditor((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
          >
            <Settings2 size={13} aria-hidden="true" />
            {showCustomEditor ? "Hide scale editor" : "Edit custom scale"}
          </button>
        )}
      </div>

      {isCustom && showCustomEditor && (
        <div className="mt-3 rounded-lg border border-line bg-paper p-3">
          <div className="grid grid-cols-1 gap-2">
            {customGrades.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={g.letter}
                  onChange={(e) => updateCustomGrade(i, "letter", e.target.value)}
                  placeholder="Letter (e.g. A)"
                  className="w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  value={g.points}
                  onChange={(e) => updateCustomGrade(i, "points", e.target.value)}
                  placeholder="Points"
                  className="w-24 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                />
                <button type="button" onClick={() => removeCustomGrade(i)} className="text-muted hover:text-red-600">
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCustomGrade}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark"
          >
            <Plus size={13} aria-hidden="true" /> Add grade
          </button>
        </div>
      )}

      {/* ---------- Prior academic history ---------- */}
      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-line bg-paper p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Previous CGPA (optional)</span>
          <input
            type="number"
            step="0.01"
            value={previousCgpa}
            onChange={(e) => setPreviousCgpa(e.target.value)}
            placeholder="e.g. 3.4"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Previous credit hours completed</span>
          <input
            type="number"
            value={previousCredits}
            onChange={(e) => setPreviousCredits(e.target.value)}
            placeholder="e.g. 60"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
          />
        </label>
      </div>

      {/* ---------- Semesters ---------- */}
      <div className="mt-6 space-y-5">
        {semesters.map((sem) => {
          const stats = semesterStats.find((s) => s.id === sem.id);
          return (
            <div key={sem.id} className="rounded-lg border border-line bg-surface p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <input
                  value={sem.name}
                  onChange={(e) => renameSemester(sem.id, e.target.value)}
                  className="rounded-lg border border-transparent bg-transparent px-1 py-1 font-display text-sm font-semibold text-ink hover:border-line focus:border-brand focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    GPA: <span className="font-semibold text-ink">{stats.gpa != null ? stats.gpa.toFixed(2) : "—"}</span>
                  </span>
                  {semesters.length > 1 && (
                    <button type="button" onClick={() => removeSemester(sem.id)} className="text-muted hover:text-red-600">
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {sem.courses.map((course) => (
                  <div key={course.id} className="flex flex-wrap items-center gap-2">
                    <input
                      value={course.name}
                      onChange={(e) => updateCourse(sem.id, course.id, "name", e.target.value)}
                      placeholder="Course name (optional)"
                      className="min-w-[140px] flex-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={course.credits}
                      onChange={(e) => updateCourse(sem.id, course.id, "credits", e.target.value)}
                      placeholder="Credits"
                      className="w-24 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(sem.id, course.id, "grade", e.target.value)}
                      className="w-28 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                    >
                      <option value="">Grade</option>
                      {activeScale.grades.map((g) => (
                        <option key={g.letter} value={g.letter}>{g.letter}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCourse(sem.id, course.id)}
                      className="text-muted hover:text-red-600"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addCourse(sem.id)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark"
              >
                <Plus size={13} aria-hidden="true" /> Add course
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addSemester}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
        >
          <Plus size={13} aria-hidden="true" /> Add semester
        </button>
      </div>

      {/* ---------- Cumulative result ---------- */}
      <div className="mt-6 flex flex-col items-center gap-2 rounded-lg bg-paper p-6 text-center">
        <GraduationCap size={20} className="text-brand" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Cumulative GPA</p>
        <p className="font-display text-4xl font-bold text-ink">
          {totals.cgpa != null ? totals.cgpa.toFixed(2) : "—"}
          <span className="ml-1 text-base font-normal text-muted">/ {activeScale.max}</span>
        </p>
        <p className="text-xs text-muted">{totals.credits} total credit hours</p>
      </div>

      {/* ---------- Grade distribution ---------- */}
      {Object.keys(gradeDistribution).length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Grade distribution</p>
          <div className="space-y-1.5">
            {activeScale.grades
              .filter((g) => gradeDistribution[g.letter])
              .map((g) => (
                <div key={g.letter} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-medium text-ink">{g.letter}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(gradeDistribution[g.letter] / maxDistCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-muted">{gradeDistribution[g.letter]}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------- Target GPA planner ---------- */}
      <div className="mt-8 rounded-lg border border-line bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={16} className="text-teal" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">What GPA do I need going forward?</h3>
        </div>
        <p className="mb-3 text-xs text-muted">
          Enter a target cumulative GPA and how many credit hours you have left — this works out the
          average grade you'll need to earn in those remaining credits.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Target CGPA</span>
            <input
              type="number"
              step="0.01"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
              placeholder={`e.g. ${(activeScale.max * 0.9).toFixed(1)}`}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Remaining credit hours</span>
            <input
              type="number"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(e.target.value)}
              placeholder="e.g. 30"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        {target && (
          <div className="mt-4 rounded-lg bg-paper p-4 text-center">
            {target.alreadyThere ? (
              <p className="text-sm text-teal">
                You've already reached this target — any passing average keeps you above it.
              </p>
            ) : target.achievable ? (
              <p className="text-sm text-ink">
                You'll need an average of{" "}
                <span className="font-display text-lg font-bold text-brand">{target.requiredAvg.toFixed(2)}</span>{" "}
                grade points across your remaining credits.
              </p>
            ) : (
              <p className="text-sm text-red-600">
                This target isn't reachable — it would require an average of{" "}
                {target.requiredAvg.toFixed(2)}, above the {activeScale.max} scale maximum.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}