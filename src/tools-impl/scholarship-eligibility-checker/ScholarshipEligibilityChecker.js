"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap, Globe, BookOpen, Target, 
  Award, Lock, Unlock, TrendingUp, CheckCircle2,
  AlertCircle, Briefcase, ChevronRight, XCircle
} from "lucide-react";

// Simulated Premium Database of Top-Tier Scholarships
const SCHOLARSHIPS_DB = [
  // UK
  { id: 1, name: "Chevening Scholarship", country: "UK", levels: ["Masters"], fields: ["All"], minGpa: 3.3, minIelts: 6.5, funding: "Fully Funded", desc: "UK government's global scholarship programme for outstanding scholars with leadership potential." },
  { id: 2, name: "Rhodes Scholarship", country: "UK", levels: ["Masters", "PhD"], fields: ["All"], minGpa: 3.7, minIelts: 7.0, funding: "Fully Funded", desc: "Oldest and perhaps most prestigious international scholarship program at Oxford University." },
  { id: 3, name: "Commonwealth Scholarships", country: "UK", levels: ["Masters", "PhD"], fields: ["All"], minGpa: 3.0, minIelts: 6.5, funding: "Fully Funded", desc: "Aimed at students from developing Commonwealth countries." },
  
  // USA
  { id: 4, name: "Fulbright Foreign Student", country: "USA", levels: ["Masters", "PhD"], fields: ["All"], minGpa: 3.5, minIelts: 7.0, funding: "Fully Funded", desc: "Enables graduate students, young professionals to study and conduct research in the US." },
  { id: 5, name: "Stamps Scholarship", country: "USA", levels: ["Undergrad"], fields: ["All"], minGpa: 3.8, minIelts: 7.0, funding: "Fully Funded", desc: "Merit-based scholarship at partner universities in the USA for exceptional undergrads." },
  { id: 6, name: "AAUW International Fellowships", country: "USA", levels: ["Masters", "PhD", "Postdoc"], fields: ["All"], minGpa: 3.0, minIelts: 6.5, funding: "Partial", desc: "For women pursuing full-time graduate or postdoctoral study in the U.S." },

  // Canada
  { id: 7, name: "Vanier Canada Graduate", country: "Canada", levels: ["PhD"], fields: ["STEM", "Humanities", "Medical"], minGpa: 3.7, minIelts: 7.0, funding: "Fully Funded", desc: "Valued at $50,000 per year for three years during doctoral studies." },
  { id: 8, name: "Lester B. Pearson", country: "Canada", levels: ["Undergrad"], fields: ["All"], minGpa: 3.8, minIelts: 6.5, funding: "Fully Funded", desc: "At the University of Toronto for international students who demonstrate exceptional academic achievement." },

  // Australia
  { id: 9, name: "Australia Awards", country: "Australia", levels: ["Masters", "PhD"], fields: ["All"], minGpa: 3.0, minIelts: 6.5, funding: "Fully Funded", desc: "Long-term development awards administered by the Department of Foreign Affairs and Trade." },
  { id: 10, name: "Destination Australia", country: "Australia", levels: ["Undergrad", "Masters", "PhD"], fields: ["STEM", "Medical", "Business"], minGpa: 3.0, minIelts: 6.0, funding: "Partial", desc: "Aims to attract and support international and domestic students to study in regional Australia." },

  // Germany (DAAD)
  { id: 11, name: "DAAD Scholarships", country: "Germany", levels: ["Masters", "PhD"], fields: ["All"], minGpa: 3.0, minIelts: 6.0, funding: "Fully Funded", desc: "Offers a wide range of scholarships for international students to study in Germany." },
  { id: 12, name: "Heinrich Böll Foundation", country: "Germany", levels: ["Masters", "PhD"], fields: ["STEM", "Humanities"], minGpa: 3.2, minIelts: 6.5, funding: "Fully Funded", desc: "Grants scholarships to approx. 1,200 undergraduates, graduates, and doctoral students." }
];

const COUNTRIES = ["All", "USA", "UK", "Canada", "Australia", "Germany"];
const LEVELS = ["Undergrad", "Masters", "PhD"];
const FIELDS = ["All", "STEM", "Humanities", "Business", "Medical"];

export default function ScholarshipEligibilityChecker() {
  const [isMounted, setIsMounted] = useState(false);
  
  // User Profile State
  const [targetCountry, setTargetCountry] = useState("All");
  const [studyLevel, setStudyLevel] = useState("Masters");
  const [fieldOfStudy, setFieldOfStudy] = useState("All");
  const [currentGpa, setCurrentGpa] = useState(3.2); // 4.0 Scale
  const [currentIelts, setCurrentIelts] = useState(6.5); // 9.0 Scale

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Smart Matching Engine
  const matchedScholarships = useMemo(() => {
    const results = {
      eligible: [],
      locked: [] // Missed by GPA or IELTS, but matches criteria
    };

    SCHOLARSHIPS_DB.forEach(scholarship => {
      // 1. Basic Criteria Filter
      const matchCountry = targetCountry === "All" || scholarship.country === targetCountry;
      const matchLevel = scholarship.levels.includes(studyLevel);
      const matchField = scholarship.fields.includes("All") || scholarship.fields.includes(fieldOfStudy);

      if (matchCountry && matchLevel && matchField) {
        // 2. Academic & Language Check
        const gpaDiff = scholarship.minGpa - currentGpa;
        const ieltsDiff = scholarship.minIelts - currentIelts;

        if (gpaDiff <= 0 && ieltsDiff <= 0) {
          results.eligible.push(scholarship);
        } else {
          // Add to locked (Gap Analysis)
          let gapMsg = [];
          if (gpaDiff > 0) gapMsg.push(`+${gpaDiff.toFixed(1)} GPA`);
          if (ieltsDiff > 0) gapMsg.push(`+${ieltsDiff.toFixed(1)} IELTS`);
          
          results.locked.push({
            ...scholarship,
            gapMessage: `Need ${gapMsg.join(" & ")} to unlock`
          });
        }
      }
    });

    // Sort: Fully Funded first
    results.eligible.sort((a, b) => (a.funding === "Fully Funded" ? -1 : 1));
    results.locked.sort((a, b) => (a.funding === "Fully Funded" ? -1 : 1));

    return results;
  }, [targetCountry, studyLevel, fieldOfStudy, currentGpa, currentIelts]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-5 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl shadow-inner">
            <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              Scholarship Eligibility Checker
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Top Tier Countries • Smart Gap Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6 items-start">
        
        {/* ================= LEFT: ACADEMIC PROFILE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-8">
            
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Globe className="w-4 h-4 text-blue-500" /> Academic Goals
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Country</label>
                  <select 
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c === "All" ? "Select Country" : c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Study Level</label>
                  <div className="flex gap-2">
                    {LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setStudyLevel(lvl)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                          studyLevel === lvl
                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Field of Study</label>
                  <select 
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  >
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Target className="w-4 h-4 text-blue-500" /> Current Metrics
              </h3>
              
              <div className="space-y-6">
                {/* GPA Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2 pl-1 pr-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPA (4.0 Scale)</label>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{currentGpa.toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min="2.0" max="4.0" step="0.1"
                    value={currentGpa}
                    onChange={(e) => setCurrentGpa(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase px-1">
                    <span>2.0</span><span>3.0</span><span>4.0</span>
                  </div>
                </div>

                {/* IELTS Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2 pl-1 pr-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IELTS Score</label>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{currentIelts.toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min="5.0" max="9.0" step="0.5"
                    value={currentIelts}
                    onChange={(e) => setCurrentIelts(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase px-1">
                    <span>5.0</span><span>7.0</span><span>9.0</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULTS DASHBOARD ================= */}
        <div className="space-y-6">
          
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-inner relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            {/* Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Matches Found
                </h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Based on your current profile
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  {matchedScholarships.eligible.length} Eligible
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  {matchedScholarships.locked.length} Locked
                </span>
              </div>
            </div>

            {/* Results Container */}
            <div className="space-y-8">
              
              {/* Eligible Section */}
              {matchedScholarships.eligible.length > 0 ? (
                <div className="space-y-3">
                  {matchedScholarships.eligible.map(scholar => (
                    <div key={scholar.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors group">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Unlock className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{scholar.name}</h4>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Globe className="w-3 h-3" /> {scholar.country} • {scholar.levels.join(", ")}
                          </span>
                        </div>
                        <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                          scholar.funding === "Fully Funded" ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        }`}>
                          {scholar.funding}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {scholar.desc}
                      </p>
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Min GPA: {scholar.minGpa}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Min IELTS: {scholar.minIelts}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50">
                  <XCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No scholarships available with current criteria.</p>
                </div>
              )}

              {/* Locked / Gap Analysis Section */}
              {matchedScholarships.locked.length > 0 && (
                <div className="pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-amber-500" /> Reach Scholarships (Improve to Unlock)
                  </h3>
                  
                  <div className="space-y-3">
                    {matchedScholarships.locked.map(scholar => (
                      <div key={scholar.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Lock className="w-4 h-4 text-rose-500" />
                              <h4 className="text-base font-extrabold text-slate-600 dark:text-slate-300">{scholar.name}</h4>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                              <Globe className="w-3 h-3" /> {scholar.country} • {scholar.levels.join(", ")}
                            </span>
                          </div>
                        </div>
                        
                        {/* Gap Analysis Tag */}
                        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/30 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold text-rose-700 dark:text-rose-400">{scholar.gapMessage}</span>
                            <span className="block text-[10px] font-medium text-rose-500/80 dark:text-rose-300 mt-0.5">
                              Required: GPA {scholar.minGpa} • IELTS {scholar.minIelts}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}