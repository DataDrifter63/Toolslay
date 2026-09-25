"use client";

import React, { useMemo, useState } from "react";

const FIRST_NAMES = [
  "James","John","Robert","Michael","William","David","Richard","Joseph",
  "Thomas","Charles","Daniel","Matthew","Anthony","Mark","Donald","Steven",
  "Sarah","Emily","Emma","Olivia","Sophia","Ava","Mia","Isabella",
  "Charlotte","Amelia","Harper","Evelyn","Ella","Grace","Chloe","Lily"
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Wilson","Anderson","Taylor","Thomas","Moore","Martin","Jackson","White",
  "Harris","Clark","Lewis","Robinson","Walker","Young","Allen","King",
  "Wright","Scott","Green","Baker","Adams","Nelson","Hill","Campbell"
];

const COMPANIES = [
  "Northstar Labs",
  "PixelCraft Studio",
  "Vertex Digital",
  "BluePeak Systems",
  "NovaWorks",
  "CloudBridge",
  "BrightLayer",
  "Apex Technologies",
  "Orbit Solutions",
  "Summit Creative"
];

const JOBS = [
  "Software Engineer",
  "Product Manager",
  "UX Designer",
  "Digital Marketing Manager",
  "Data Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Project Manager",
  "SEO Specialist",
  "Sales Executive",
  "Business Analyst",
  "Content Strategist"
];

const CITIES = [
  ["New York","NY","10001"],
  ["Los Angeles","CA","90001"],
  ["Chicago","IL","60601"],
  ["Houston","TX","77001"],
  ["Phoenix","AZ","85001"],
  ["Philadelphia","PA","19101"],
  ["San Antonio","TX","78201"],
  ["San Diego","CA","92101"],
  ["Dallas","TX","75201"],
  ["Austin","TX","73301"]
];

const DOMAINS = [
  "example.com",
  "demo.test",
  "mail.test",
  "sample.dev"
];

function seededRandom(seed) {
  let value = Math.abs(Number(seed) || 1);

  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function randomFrom(array, random) {
  return array[Math.floor(random() * array.length)];
}

function randomInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function escapeCsv(value) {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function makeUnique(value, used) {
  let result = value;
  let counter = 2;

  while (used.has(result)) {
    result = `${value}${counter}`;
    counter += 1;
  }

  used.add(result);
  return result;
}

export default function FakeDataGenerator() {
  const [count, setCount] = useState(25);
  const [locale, setLocale] = useState("US");
  const [gender, setGender] = useState("mixed");

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(65);

  const [seed, setSeed] = useState("toolslay2026");

  const [fields, setFields] = useState({
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    email: true,
    phone: true,
    age: true,
    gender: true,
    company: true,
    jobTitle: true,
    city: true,
    state: true,
    zip: true,
    address: true,
    website: true,
    createdAt: true
  });

  const [format, setFormat] = useState("json");
  const [prettyJson, setPrettyJson] = useState(true);

  const [generated, setGenerated] = useState([]);
  const [copied, setCopied] = useState(false);

  const [customFieldName, setCustomFieldName] = useState("");
  const [customFields, setCustomFields] = useState([]);

  const [activeTab, setActiveTab] = useState("builder");

  const toggleField = (field) => {
    setFields((current) => ({
      ...current,
      [field]: !current[field]
    }));
  };

  const addCustomField = () => {
    const name = customFieldName.trim();

    if (!name) return;

    const exists = customFields.some(
      (field) => field.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setCustomFieldName("");
      return;
    }

    setCustomFields((current) => [...current, name]);
    setCustomFieldName("");
  };

  const removeCustomField = (name) => {
    setCustomFields((current) =>
      current.filter((field) => field !== name)
    );
  };

  const generateUsers = () => {
    const safeCount = Math.min(
      Math.max(Number(count) || 1, 1),
      1000
    );

    const random = seededRandom(
      `${seed}${locale}${gender}${safeCount}`
        .split("")
        .reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0
        )
    );

    const usedEmails = new Set();
    const usedUsernames = new Set();

    const users = [];

    for (let i = 0; i < safeCount; i += 1) {
      let firstName = randomFrom(FIRST_NAMES, random);
      let lastName = randomFrom(LAST_NAMES, random);

      if (gender === "male") {
        firstName = randomFrom(
          [
            "James","John","Robert","Michael","William",
            "David","Richard","Joseph","Thomas","Daniel"
          ],
          random
        );
      }

      if (gender === "female") {
        firstName = randomFrom(
          [
            "Sarah","Emily","Emma","Olivia","Sophia",
            "Ava","Mia","Isabella","Charlotte","Amelia"
          ],
          random
        );
      }

      const cityData = randomFrom(CITIES, random);
      const city = cityData[0];
      const state = cityData[1];
      const zip = cityData[2];

      const baseUsername =
        `${slugify(firstName)}.${slugify(lastName)}`;

      const username = makeUnique(
        baseUsername,
        usedUsernames
      );

      const email = makeUnique(
        `${username}@${randomFrom(DOMAINS, random)}`,
        usedEmails
      );

      const streetNumber = randomInt(10, 9999, random);

      const user = {};

      if (fields.id) {
        user.id = i + 1;
      }

      if (fields.firstName) {
        user.firstName = firstName;
      }

      if (fields.lastName) {
        user.lastName = lastName;
      }

      if (fields.username) {
        user.username = username;
      }

      if (fields.email) {
        user.email = email;
      }

      if (fields.phone) {
        user.phone =
          `+1 (${randomInt(200, 999, random)}) ` +
          `${randomInt(200, 999, random)}-${randomInt(1000, 9999, random)}`;
      }

      if (fields.age) {
        user.age = randomInt(
          Number(minAge) || 18,
          Number(maxAge) || 65,
          random
        );
      }

      if (fields.gender) {
        user.gender =
          gender === "male"
            ? "Male"
            : gender === "female"
              ? "Female"
              : random() > 0.5
                ? "Male"
                : "Female";
      }

      if (fields.company) {
        user.company = randomFrom(COMPANIES, random);
      }

      if (fields.jobTitle) {
        user.jobTitle = randomFrom(JOBS, random);
      }

      if (fields.city) {
        user.city = city;
      }

      if (fields.state) {
        user.state = state;
      }

      if (fields.zip) {
        user.zip = zip;
      }

      if (fields.address) {
        user.address =
          `${streetNumber} ${randomFrom(
            ["Main","Oak","Maple","Pine","Cedar","Lake"],
            random
          )} Street`;
      }

      if (fields.website) {
        user.website = `https://example.com/users/${username}`;
      }

      if (fields.createdAt) {
        const date = new Date(
          Date.now() -
          randomInt(
            1,
            900,
            random
          ) *
          86400000
        );

        user.createdAt = date.toISOString();
      }

      customFields.forEach((field) => {
        user[field] =
          `sample_${randomInt(1000, 9999, random)}`;
      });

      users.push(user);
    }

    setGenerated(users);
    setActiveTab("preview");
    setCopied(false);
  };

  const outputText = useMemo(() => {
    if (!generated.length) return "";

    if (format === "json") {
      return JSON.stringify(
        generated,
        null,
        prettyJson ? 2 : 0
      );
    }

    if (format === "csv") {
      const columns = Object.keys(generated[0]);

      const header = columns
        .map(escapeCsv)
        .join(",");

      const rows = generated.map((row) =>
        columns
          .map((column) =>
            escapeCsv(row[column])
          )
          .join(",")
      );

      return [header, ...rows].join("\n");
    }

    if (format === "sql") {
      const columns = Object.keys(generated[0]);

      return generated
        .map((row) => {
          const values = columns.map((column) => {
            const value = row[column];

            if (typeof value === "number") {
              return String(value);
            }

            return `'${String(value ?? "")
              .replaceAll("'", "''")}'`;
          });

          return `INSERT INTO users (${columns.join(
            ", "
          )}) VALUES (${values.join(", ")});`;
        })
        .join("\n");
    }

    return JSON.stringify(generated, null, 2);
  }, [generated, format, prettyJson]);

  const copyOutput = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;

    let extension = "json";
    let mime = "application/json";

    if (format === "csv") {
      extension = "csv";
      mime = "text/csv";
    }

    if (format === "sql") {
      extension = "sql";
      mime = "text/plain";
    }

    const blob = new Blob([outputText], {
      type: `${mime};charset=utf-8`
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `fake-data.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const activeFieldCount =
    Object.values(fields).filter(Boolean).length +
    customFields.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              👥
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                DEVELOPER DATA TOOL
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                Fake Data Generator
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Generate realistic dummy users, emails, addresses, companies and developer-ready datasets instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-paper text-[11px] font-black text-ink shrink-0">
            <span className="text-emerald-500 text-xs">●</span>
            Local generation
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center bg-paper border border-line p-1 rounded-xl gap-1 w-fit">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "builder" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
            onClick={() => setActiveTab("builder")}
          >
            Generator
          </button>

          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "preview" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
        </div>

        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_0.8fr] gap-6 items-start min-w-0">

            {/* SETTINGS */}
            <section className="bg-paper border border-line p-5 sm:p-6 rounded-2xl space-y-6 min-w-0">
              <div className="border-b border-line pb-4 min-w-0">
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">Dataset Settings</h2>
                <p className="text-[11px] font-medium text-muted mt-0.5">Configure the fake records you need.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Number of records</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none"
                  />
                  <small className="block mt-1 text-[10px] font-medium text-muted">Maximum 1,000 records per generation.</small>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Locale</label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none cursor-pointer"
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none cursor-pointer"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Minimum age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Maximum age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-bold text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">Seed</label>
                <input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Enter any seed"
                  className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                />
                <small className="block mt-1 text-[10px] font-medium text-muted">
                  Same seed + settings produce repeatable data. Great for testing and bug reproduction.
                </small>
              </div>

              {/* FIELDS */}
              <div className="pt-5 border-t border-line space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-ink uppercase tracking-wider">Fields</h3>
                    <span className="text-[10px] font-medium text-muted">{activeFieldCount} fields selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    ["id", "ID"],
                    ["firstName", "First name"],
                    ["lastName", "Last name"],
                    ["username", "Username"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["age", "Age"],
                    ["gender", "Gender"],
                    ["company", "Company"],
                    ["jobTitle", "Job title"],
                    ["city", "City"],
                    ["state", "State"],
                    ["zip", "ZIP code"],
                    ["address", "Address"],
                    ["website", "Website"],
                    ["createdAt", "Created at"]
                  ].map(([key, label]) => (
                    <label
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-line bg-surface cursor-pointer select-none text-xs font-black text-ink"
                      key={key}
                    >
                      <input
                        type="checkbox"
                        checked={fields[key]}
                        onChange={() => toggleField(key)}
                        className="w-4 h-4 accent-brand rounded border-line"
                      />
                      <span className="truncate">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CUSTOM FIELDS */}
              <div className="pt-5 border-t border-line space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-ink uppercase tracking-wider">Custom fields</h3>
                    <span className="text-[10px] font-medium text-muted">Add fields specific to your project</span>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={customFieldName}
                    onChange={(e) => setCustomFieldName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomField();
                      }
                    }}
                    placeholder="Example: department"
                    className="w-full h-11 bg-surface border border-line rounded-xl px-3 text-xs font-mono text-ink outline-none"
                  />

                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity"
                  >
                    Add
                  </button>
                </div>

                {customFields.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customFields.map((field) => (
                      <span key={field} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-black">
                        {field}
                        <button
                          type="button"
                          onClick={() => removeCustomField(field)}
                          className="text-brand hover:opacity-75 font-bold text-sm"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="w-full h-12 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity shadow-sm mt-4"
                onClick={generateUsers}
              >
                Generate {count || 0} records →
              </button>
            </section>

            {/* OUTPUT SETTINGS */}
            <aside className="space-y-6 min-w-0">

              <section className="bg-paper border border-line p-5 sm:p-6 rounded-2xl space-y-5 min-w-0">
                <div className="border-b border-line pb-4 min-w-0">
                  <h2 className="text-sm font-black text-ink uppercase tracking-wider">Output Format</h2>
                  <p className="text-[11px] font-medium text-muted mt-0.5">Choose your development format.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${format === "json" ? "border-brand bg-brand/5 shadow-sm" : "border-line bg-surface hover:border-brand/50"}`}
                    onClick={() => setFormat("json")}
                  >
                    <strong className="text-xs font-black text-ink">JSON</strong>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">API / Apps</span>
                  </button>

                  <button
                    type="button"
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${format === "csv" ? "border-brand bg-brand/5 shadow-sm" : "border-line bg-surface hover:border-brand/50"}`}
                    onClick={() => setFormat("csv")}
                  >
                    <strong className="text-xs font-black text-ink">CSV</strong>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Excel / Sheets</span>
                  </button>

                  <button
                    type="button"
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${format === "sql" ? "border-brand bg-brand/5 shadow-sm" : "border-line bg-surface hover:border-brand/50"}`}
                    onClick={() => setFormat("sql")}
                  >
                    <strong className="text-xs font-black text-ink">SQL</strong>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Database seed</span>
                  </button>
                </div>

                {format === "json" && (
                  <label className="flex items-start gap-3 pt-4 border-t border-line cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={prettyJson}
                      onChange={(e) => setPrettyJson(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded border-line mt-0.5"
                    />
                    <span className="space-y-0.5">
                      <strong className="text-xs font-black text-ink block">Pretty JSON</strong>
                      <small className="text-[10px] font-medium text-muted block">Format JSON with readable indentation.</small>
                    </span>
                  </label>
                )}
              </section>

              <section className="bg-paper border border-line p-5 sm:p-6 rounded-2xl space-y-3 bg-gradient-to-br from-brand/5 to-transparent min-w-0">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-sm">
                  ✦
                </div>
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Why use a seed?</h3>
                <p className="text-[11px] text-muted leading-relaxed">
                  A deterministic seed lets you regenerate the same dataset later. This is useful when reproducing UI bugs, testing APIs or creating stable demo environments.
                </p>
              </section>

              <section className="bg-paper border border-line p-5 sm:p-6 rounded-2xl space-y-3 min-w-0">
                <div className="border-b border-line pb-3 min-w-0">
                  <h2 className="text-xs font-black text-ink uppercase tracking-wider">Privacy</h2>
                  <p className="text-[11px] font-medium text-muted mt-0.5">Generated data is synthetic.</p>
                </div>

                <div className="space-y-2.5 text-xs font-bold text-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> No API request required
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Generated in your browser
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> No real personal data lookup
                  </div>
                </div>
              </section>

            </aside>
          </div>
        )}

        {/* PREVIEW */}
        {activeTab === "preview" && (
          <section className="bg-paper border border-line p-5 sm:p-6 rounded-2xl space-y-5 min-w-0">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 min-w-0">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">Generated Dataset</h2>
                <p className="text-[11px] font-medium text-muted mt-0.5">
                  {generated.length ? `${generated.length} records generated` : "Generate data from the Generator tab."}
                </p>
              </div>

              {generated.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-line bg-surface text-ink hover:bg-paper text-xs font-black uppercase tracking-wider transition-all"
                    onClick={copyOutput}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity"
                    onClick={downloadOutput}
                  >
                    Download {format.toUpperCase()}
                  </button>
                </div>
              )}
            </div>

            {generated.length === 0 ? (
              <div className="border-2 border-dashed border-line rounded-2xl p-12 text-center space-y-3 bg-surface min-w-0">
                <div className="w-12 h-12 mx-auto rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
                  ✦
                </div>
                <strong className="text-xs font-black text-ink block">No data generated yet</strong>
                <p className="text-[11px] font-medium text-muted">Configure your fields and click Generate.</p>

                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity mt-2"
                >
                  Open Generator
                </button>
              </div>
            ) : (
              <div className="border border-line rounded-xl overflow-hidden bg-[#10131a] min-w-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-[#98a2b3] font-mono text-[11px]">
                  <span>fake-data.{format}</span>
                  <span>{outputText.length.toLocaleString()} chars</span>
                </div>

                <pre className="p-4 text-[#e7eaf0] font-mono text-xs leading-relaxed overflow-auto max-h-[600px] whitespace-pre-wrap break-words">
                  <code>{outputText}</code>
                </pre>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}