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

  const resetTool = () => {
    setCount(25);
    setLocale("US");
    setGender("mixed");
    setMinAge(18);
    setMaxAge(65);
    setSeed("toolslay2026");

    setFields({
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

    setFormat("json");
    setPrettyJson(true);
    setGenerated([]);
    setCustomFields([]);
    setCustomFieldName("");
    setCopied(false);
    setActiveTab("builder");
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
    <div className="fdg-root">
      <div className="fdg-shell">

        {/* HEADER */}
        <div className="fdg-header">
          <div>
            <div className="fdg-eyebrow">
              DEVELOPER DATA TOOL
            </div>

            <h1>Fake Data Generator</h1>

            <p>
              Generate realistic dummy users, emails, addresses,
              companies and developer-ready datasets instantly.
            </p>
          </div>

          <div className="fdg-header-badge">
            <span>●</span>
            Local generation
          </div>
        </div>

        {/* TABS */}
        <div className="fdg-tabs">
          <button
            type="button"
            className={activeTab === "builder" ? "active" : ""}
            onClick={() => setActiveTab("builder")}
          >
            Generator
          </button>

          <button
            type="button"
            className={activeTab === "preview" ? "active" : ""}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
        </div>

        {activeTab === "builder" && (
          <div className="fdg-grid">

            {/* SETTINGS */}
            <section className="fdg-card">
              <div className="fdg-card-head">
                <div>
                  <h2>Dataset Settings</h2>
                  <p>
                    Configure the fake records you need.
                  </p>
                </div>
              </div>

              <div className="fdg-two">
                <div className="fdg-field">
                  <label>Number of records</label>

                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={count}
                    onChange={(e) =>
                      setCount(e.target.value)
                    }
                  />

                  <small>
                    Maximum 1,000 records per generation.
                  </small>
                </div>

                <div className="fdg-field">
                  <label>Locale</label>

                  <select
                    value={locale}
                    onChange={(e) =>
                      setLocale(e.target.value)
                    }
                  >
                    <option value="US">
                      United States
                    </option>
                    <option value="GB">
                      United Kingdom
                    </option>
                    <option value="CA">
                      Canada
                    </option>
                    <option value="AU">
                      Australia
                    </option>
                  </select>
                </div>
              </div>

              <div className="fdg-three">
                <div className="fdg-field">
                  <label>Gender</label>

                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                  >
                    <option value="mixed">
                      Mixed
                    </option>
                    <option value="male">
                      Male
                    </option>
                    <option value="female">
                      Female
                    </option>
                  </select>
                </div>

                <div className="fdg-field">
                  <label>Minimum age</label>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={minAge}
                    onChange={(e) =>
                      setMinAge(e.target.value)
                    }
                  />
                </div>

                <div className="fdg-field">
                  <label>Maximum age</label>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxAge}
                    onChange={(e) =>
                      setMaxAge(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="fdg-field">
                <label>Seed</label>

                <input
                  value={seed}
                  onChange={(e) =>
                    setSeed(e.target.value)
                  }
                  placeholder="Enter any seed"
                />

                <small>
                  Same seed + settings produce repeatable data.
                  Great for testing and bug reproduction.
                </small>
              </div>

              {/* FIELDS */}
              <div className="fdg-section">
                <div className="fdg-section-head">
                  <div>
                    <h3>Fields</h3>
                    <span>
                      {activeFieldCount} fields selected
                    </span>
                  </div>
                </div>

                <div className="fdg-field-grid">
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
                      className="fdg-check"
                      key={key}
                    >
                      <input
                        type="checkbox"
                        checked={fields[key]}
                        onChange={() =>
                          toggleField(key)
                        }
                      />

                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CUSTOM FIELDS */}
              <div className="fdg-section">
                <div className="fdg-section-head">
                  <div>
                    <h3>Custom fields</h3>
                    <span>
                      Add fields specific to your project
                    </span>
                  </div>
                </div>

                <div className="fdg-custom-add">
                  <input
                    value={customFieldName}
                    onChange={(e) =>
                      setCustomFieldName(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomField();
                      }
                    }}
                    placeholder="Example: department"
                  />

                  <button
                    type="button"
                    onClick={addCustomField}
                  >
                    Add
                  </button>
                </div>

                {customFields.length > 0 && (
                  <div className="fdg-custom-list">
                    {customFields.map((field) => (
                      <span key={field}>
                        {field}

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomField(field)
                          }
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
                className="fdg-generate"
                onClick={generateUsers}
              >
                Generate {count || 0} records →
              </button>
            </section>

            {/* OUTPUT SETTINGS */}
            <aside className="fdg-side">

              <section className="fdg-card">
                <div className="fdg-card-head">
                  <div>
                    <h2>Output Format</h2>
                    <p>
                      Choose your development format.
                    </p>
                  </div>
                </div>

                <div className="fdg-format-grid">
                  <button
                    type="button"
                    className={
                      format === "json"
                        ? "selected"
                        : ""
                    }
                    onClick={() => setFormat("json")}
                  >
                    <strong>JSON</strong>
                    <span>API / Apps</span>
                  </button>

                  <button
                    type="button"
                    className={
                      format === "csv"
                        ? "selected"
                        : ""
                    }
                    onClick={() => setFormat("csv")}
                  >
                    <strong>CSV</strong>
                    <span>Excel / Sheets</span>
                  </button>

                  <button
                    type="button"
                    className={
                      format === "sql"
                        ? "selected"
                        : ""
                    }
                    onClick={() => setFormat("sql")}
                  >
                    <strong>SQL</strong>
                    <span>Database seed</span>
                  </button>
                </div>

                {format === "json" && (
                  <label className="fdg-toggle">
                    <input
                      type="checkbox"
                      checked={prettyJson}
                      onChange={(e) =>
                        setPrettyJson(
                          e.target.checked
                        )
                      }
                    />

                    <span>
                      <strong>Pretty JSON</strong>
                      <small>
                        Format JSON with readable indentation.
                      </small>
                    </span>
                  </label>
                )}
              </section>

              <section className="fdg-card fdg-info-card">
                <div className="fdg-info-icon">
                  ✦
                </div>

                <h3>Why use a seed?</h3>

                <p>
                  A deterministic seed lets you regenerate the
                  same dataset later. This is useful when
                  reproducing UI bugs, testing APIs or creating
                  stable demo environments.
                </p>
              </section>

              <section className="fdg-card">
                <div className="fdg-card-head">
                  <div>
                    <h2>Privacy</h2>
                    <p>
                      Generated data is synthetic.
                    </p>
                  </div>
                </div>

                <div className="fdg-privacy">
                  <span>✓</span>
                  No API request required
                </div>

                <div className="fdg-privacy">
                  <span>✓</span>
                  Generated in your browser
                </div>

                <div className="fdg-privacy">
                  <span>✓</span>
                  No real personal data lookup
                </div>
              </section>

            </aside>
          </div>
        )}

        {/* PREVIEW */}
        {activeTab === "preview" && (
          <section className="fdg-card fdg-preview">

            <div className="fdg-preview-head">
              <div>
                <h2>Generated Dataset</h2>

                <p>
                  {generated.length
                    ? `${generated.length} records generated`
                    : "Generate data from the Generator tab."}
                </p>
              </div>

              {generated.length > 0 && (
                <div className="fdg-preview-actions">
                  <button
                    type="button"
                    onClick={copyOutput}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    type="button"
                    className="primary"
                    onClick={downloadOutput}
                  >
                    Download {format.toUpperCase()}
                  </button>
                </div>
              )}
            </div>

            {generated.length === 0 ? (
              <div className="fdg-empty-preview">
                <div>✦</div>
                <strong>No data generated yet</strong>
                <p>
                  Configure your fields and click Generate.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("builder")
                  }
                >
                  Open Generator
                </button>
              </div>
            ) : (
              <div className="fdg-output">
                <div className="fdg-output-top">
                  <span>
                    fake-data.{format}
                  </span>

                  <span>
                    {outputText.length.toLocaleString()} chars
                  </span>
                </div>

                <pre>
                  <code>{outputText}</code>
                </pre>
              </div>
            )}
          </section>
        )}

      </div>

      <style jsx>{`
        .fdg-root {
          --fdg-text: #172033;
          --fdg-muted: #667085;
          --fdg-border: #e1e5ec;
          --fdg-card: #ffffff;
          --fdg-soft: #f7f8fb;
          --fdg-input: #ffffff;
          --fdg-primary: #635bff;

          width: 100%;
          color: var(--fdg-text);
          padding: 24px 0 40px;
        }

        .fdg-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .fdg-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .fdg-eyebrow {
          color: var(--fdg-primary);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .13em;
          margin-bottom: 7px;
        }

        .fdg-header h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 39px);
          line-height: 1.1;
          letter-spacing: -.04em;
        }

        .fdg-header p {
          margin: 9px 0 0;
          max-width: 680px;
          color: var(--fdg-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .fdg-header-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid var(--fdg-border);
          border-radius: 30px;
          background: var(--fdg-card);
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .fdg-header-badge span {
          color: #12b76a;
          font-size: 9px;
        }

        .fdg-tabs {
          display: flex;
          gap: 4px;
          width: fit-content;
          padding: 4px;
          margin-bottom: 18px;
          border-radius: 11px;
          background: var(--fdg-soft);
          border: 1px solid var(--fdg-border);
        }

        .fdg-tabs button {
          border: 0;
          background: transparent;
          color: var(--fdg-muted);
          padding: 9px 16px;
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
        }

        .fdg-tabs button.active {
          background: var(--fdg-card);
          color: var(--fdg-text);
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        .fdg-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(290px, .8fr);
          gap: 18px;
          align-items: start;
        }

        .fdg-side {
          display: grid;
          gap: 18px;
        }

        .fdg-card {
          background: var(--fdg-card);
          border: 1px solid var(--fdg-border);
          border-radius: 16px;
          padding: 21px;
          box-shadow: 0 8px 30px rgba(16,24,40,.035);
        }

        .fdg-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 19px;
        }

        .fdg-card h2 {
          margin: 0;
          font-size: 17px;
          letter-spacing: -.02em;
        }

        .fdg-card-head p {
          margin: 5px 0 0;
          color: var(--fdg-muted);
          font-size: 12px;
        }

        .fdg-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .fdg-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .fdg-field {
          margin-bottom: 15px;
        }

        .fdg-field label {
          display: block;
          margin-bottom: 7px;
          color: var(--fdg-text);
          font-size: 12px;
          font-weight: 700;
        }

        .fdg-field input,
        .fdg-field select,
        .fdg-custom-add input {
          box-sizing: border-box;
          width: 100%;
          min-height: 42px;
          padding: 0 11px;
          border: 1px solid var(--fdg-border);
          border-radius: 9px;
          background: var(--fdg-input);
          color: var(--fdg-text);
          outline: none;
          font: inherit;
          font-size: 13px;
          transition: border-color .16s, box-shadow .16s;
        }

        .fdg-field input:focus,
        .fdg-field select:focus,
        .fdg-custom-add input:focus {
          border-color: var(--fdg-primary);
          box-shadow: 0 0 0 3px rgba(99,91,255,.11);
        }

        .fdg-field small {
          display: block;
          margin-top: 6px;
          color: var(--fdg-muted);
          font-size: 10px;
          line-height: 1.5;
        }

        .fdg-section {
          padding-top: 21px;
          margin-top: 6px;
          border-top: 1px solid var(--fdg-border);
        }

        .fdg-section-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .fdg-section-head h3 {
          margin: 0;
          font-size: 13px;
        }

        .fdg-section-head span {
          display: block;
          margin-top: 3px;
          color: var(--fdg-muted);
          font-size: 10px;
        }

        .fdg-field-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }

        .fdg-check {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 9px;
          border: 1px solid var(--fdg-border);
          border-radius: 8px;
          background: var(--fdg-soft);
          cursor: pointer;
          font-size: 11px;
        }

        .fdg-check input {
          margin: 0;
          accent-color: var(--fdg-primary);
        }

        .fdg-custom-add {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .fdg-custom-add button {
          padding: 0 14px;
          border: 0;
          border-radius: 9px;
          background: var(--fdg-primary);
          color: white;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
        }

        .fdg-custom-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .fdg-custom-list span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px 6px 10px;
          border-radius: 7px;
          background: #efedff;
          color: #5146c7;
          font-size: 11px;
          font-weight: 700;
        }

        .fdg-custom-list button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 15px;
          line-height: 1;
        }

        .fdg-generate {
          width: 100%;
          min-height: 47px;
          margin-top: 21px;
          border: 0;
          border-radius: 10px;
          background: var(--fdg-primary);
          color: white;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 750;
          box-shadow: 0 9px 20px rgba(99,91,255,.2);
          transition: transform .16s, box-shadow .16s;
        }

        .fdg-generate:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(99,91,255,.25);
        }

        .fdg-format-grid {
          display: grid;
          gap: 8px;
        }

        .fdg-format-grid button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 54px;
          padding: 0 13px;
          border: 1px solid var(--fdg-border);
          border-radius: 10px;
          background: var(--fdg-input);
          color: var(--fdg-text);
          cursor: pointer;
          text-align: left;
        }

        .fdg-format-grid button.selected {
          border-color: var(--fdg-primary);
          background: rgba(99,91,255,.07);
          box-shadow: 0 0 0 2px rgba(99,91,255,.07);
        }

        .fdg-format-grid strong {
          font-size: 12px;
        }

        .fdg-format-grid span {
          color: var(--fdg-muted);
          font-size: 10px;
        }

        .fdg-toggle {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--fdg-border);
          cursor: pointer;
        }

        .fdg-toggle input {
          margin-top: 3px;
          accent-color: var(--fdg-primary);
        }

        .fdg-toggle span {
          display: grid;
          gap: 3px;
        }

        .fdg-toggle strong {
          font-size: 12px;
        }

        .fdg-toggle small {
          color: var(--fdg-muted);
          font-size: 10px;
        }

        .fdg-info-card {
          background: linear-gradient(
            135deg,
            rgba(99,91,255,.09),
            var(--fdg-card)
          );
        }

        .fdg-info-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          margin-bottom: 12px;
          border-radius: 9px;
          background: #efedff;
          color: var(--fdg-primary);
          font-weight: 800;
        }

        .fdg-info-card h3 {
          margin: 0;
          font-size: 14px;
        }

        .fdg-info-card p {
          margin: 7px 0 0;
          color: var(--fdg-muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .fdg-privacy {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 0;
          border-bottom: 1px solid var(--fdg-border);
          color: var(--fdg-muted);
          font-size: 11px;
        }

        .fdg-privacy:last-child {
          border-bottom: 0;
        }

        .fdg-privacy span {
          color: #12b76a;
          font-weight: 900;
        }

        .fdg-preview {
          padding: 21px;
        }

        .fdg-preview-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .fdg-preview-head h2 {
          margin: 0;
          font-size: 18px;
        }

        .fdg-preview-head p {
          margin: 5px 0 0;
          color: var(--fdg-muted);
          font-size: 11px;
        }

        .fdg-preview-actions {
          display: flex;
          gap: 8px;
        }

        .fdg-preview-actions button {
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid var(--fdg-border);
          border-radius: 8px;
          background: var(--fdg-input);
          color: var(--fdg-text);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        .fdg-preview-actions button.primary {
          border-color: var(--fdg-primary);
          background: var(--fdg-primary);
          color: white;
        }

        .fdg-output {
          overflow: hidden;
          border: 1px solid var(--fdg-border);
          border-radius: 12px;
          background: #10131a;
        }

        .fdg-output-top {
          display: flex;
          justify-content: space-between;
          padding: 11px 13px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          color: #98a2b3;
          font-family: monospace;
          font-size: 10px;
        }

        .fdg-output pre {
          max-height: 650px;
          min-height: 350px;
          overflow: auto;
          margin: 0;
          padding: 18px;
          color: #e7eaf0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .fdg-empty-preview {
          display: grid;
          place-items: center;
          min-height: 390px;
          padding: 30px;
          border: 1px dashed var(--fdg-border);
          border-radius: 12px;
          text-align: center;
        }

        .fdg-empty-preview > div {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin-bottom: 10px;
          border-radius: 13px;
          background: #efedff;
          color: var(--fdg-primary);
        }

        .fdg-empty-preview strong {
          font-size: 14px;
        }

        .fdg-empty-preview p {
          margin: 5px 0 14px;
          color: var(--fdg-muted);
          font-size: 11px;
        }

        .fdg-empty-preview button {
          min-height: 38px;
          padding: 0 13px;
          border: 0;
          border-radius: 8px;
          background: var(--fdg-primary);
          color: white;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .fdg-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .fdg-root {
            padding: 12px 0 30px;
          }

          .fdg-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .fdg-header-badge {
            display: none;
          }

          .fdg-card {
            padding: 16px;
          }

          .fdg-two,
          .fdg-three {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .fdg-field-grid {
            grid-template-columns: 1fr 1fr;
          }

          .fdg-preview-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .fdg-preview-actions {
            width: 100%;
          }

          .fdg-preview-actions button {
            flex: 1;
          }
        }

        @media (max-width: 420px) {
          .fdg-field-grid {
            grid-template-columns: 1fr;
          }

          .fdg-custom-add {
            grid-template-columns: 1fr;
          }

          .fdg-custom-add button {
            min-height: 40px;
          }
        }

        :global(html.dark) .fdg-root {
          --fdg-text: #f2f4f7;
          --fdg-muted: #98a2b3;
          --fdg-border: #2d3442;
          --fdg-card: #151922;
          --fdg-soft: #10141c;
          --fdg-input: #10141c;
          --fdg-primary: #786cff;
        }

        :global(.dark) .fdg-root {
          --fdg-text: #f2f4f7;
          --fdg-muted: #98a2b3;
          --fdg-border: #2d3442;
          --fdg-card: #151922;
          --fdg-soft: #10141c;
          --fdg-input: #10141c;
          --fdg-primary: #786cff;
        }
      `}</style>
    </div>
  );
}