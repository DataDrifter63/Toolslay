// Scientific calculator math engine.
//
// This does NOT use eval() — it's a real tokenizer + recursive-descent parser,
// so it correctly handles operator precedence, implicit multiplication (2π,
// 3(4+5)), postfix factorial (5!), right-associative power (2^3^2), and custom
// function calls with multiple arguments (log(8, 2), root(3, 27)).

const FUNCTION_ARITY = {
  sin: 1, cos: 1, tan: 1,
  asin: 1, acos: 1, atan: 1,
  sinh: 1, cosh: 1, tanh: 1,
  asinh: 1, acosh: 1, atanh: 1,
  sqrt: 1, cbrt: 1, abs: 1, exp: 1,
  ln: 1, log2: 1,
  log: [1, 2],   // log(x) = log10(x), log(x, base) = custom base
  root: 2,       // root(n, x) = the n-th root of x
};

export const ANGLE_MODES = ["DEG", "RAD", "GRAD"];
export const VARIABLE_NAMES = ["A", "B", "C", "D", "E", "F"];

function tokenize(raw) {
  const s = raw
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      let dots = 0;
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === ".") dots++;
        j++;
      }
      if (dots > 1) throw new Error("Invalid number");
      tokens.push({ type: "num", value: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
      tokens.push({ type: "ident", value: s.slice(i, j) });
      i = j;
      continue;
    }
    if ("()".includes(c)) {
      tokens.push({ type: "paren", value: c });
      i++;
      continue;
    }
    if (c === ",") {
      tokens.push({ type: "comma", value: "," });
      i++;
      continue;
    }
    if ("+-*/^%!".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    throw new Error(`Unexpected character "${c}"`);
  }
  return tokens;
}

function factorial(n) {
  if (n < 0) throw new Error("Factorial of a negative number");
  if (Math.abs(n - Math.round(n)) > 1e-9) throw new Error("Factorial needs a whole number");
  const whole = Math.round(n);
  if (whole > 170) return Infinity;
  let result = 1;
  for (let k = 2; k <= whole; k++) result *= k;
  return result;
}

function callFunction(name, args, angleMode) {
  const key = name.toLowerCase();
  const arity = FUNCTION_ARITY[key];
  if (arity === undefined) throw new Error(`Unknown function "${name}"`);
  const validArity = Array.isArray(arity) ? arity.includes(args.length) : arity === args.length;
  if (!validArity) throw new Error(`"${name}" takes ${arity} argument(s)`);

  const toRad = (x) =>
    angleMode === "DEG" ? (x * Math.PI) / 180 : angleMode === "GRAD" ? (x * Math.PI) / 200 : x;
  const fromRad = (x) =>
    angleMode === "DEG" ? (x * 180) / Math.PI : angleMode === "GRAD" ? (x * 200) / Math.PI : x;

  switch (key) {
    case "sin": return Math.sin(toRad(args[0]));
    case "cos": return Math.cos(toRad(args[0]));
    case "tan": return Math.tan(toRad(args[0]));
    case "asin": return fromRad(Math.asin(args[0]));
    case "acos": return fromRad(Math.acos(args[0]));
    case "atan": return fromRad(Math.atan(args[0]));
    case "sinh": return Math.sinh(args[0]);
    case "cosh": return Math.cosh(args[0]);
    case "tanh": return Math.tanh(args[0]);
    case "asinh": return Math.asinh(args[0]);
    case "acosh": return Math.acosh(args[0]);
    case "atanh": return Math.atanh(args[0]);
    case "log": return args.length === 2 ? Math.log(args[0]) / Math.log(args[1]) : Math.log10(args[0]);
    case "log2": return Math.log2(args[0]);
    case "ln": return Math.log(args[0]);
    case "sqrt": return Math.sqrt(args[0]);
    case "cbrt": return Math.cbrt(args[0]);
    case "root": return Math.pow(args[1], 1 / args[0]); // root(n, x) -> n-th root of x
    case "abs": return Math.abs(args[0]);
    case "exp": return Math.exp(args[0]);
    default: throw new Error(`Unknown function "${name}"`);
  }
}

function resolveIdentifier(name, variables) {
  const lower = name.toLowerCase();
  if (lower === "pi") return Math.PI;
  if (lower === "e") return Math.E;
  if (lower === "ans") return variables.Ans ?? 0;
  const upper = name.toUpperCase();
  if (Object.prototype.hasOwnProperty.call(variables, upper)) return variables[upper];
  throw new Error(`Unknown variable "${name}"`);
}

/**
 * Evaluate a math expression string.
 * @param {string} input - raw expression, e.g. "2sin(30)+√(3^2+4^2)"
 * @param {{angleMode: "DEG"|"RAD"|"GRAD", variables: Record<string, number>}} ctx
 * @returns {{ value: number|null, error: string|null }}
 */
export function evaluateExpression(input, ctx) {
  const { angleMode = "DEG", variables = {} } = ctx || {};
  if (!input || !input.trim()) return { value: null, error: null };

  try {
    const tokens = tokenize(input);
    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseExpr() {
      let value = parseTerm();
      while (peek() && peek().type === "op" && (peek().value === "+" || peek().value === "-")) {
        const op = next().value;
        const rhs = parseTerm();
        value = op === "+" ? value + rhs : value - rhs;
      }
      return value;
    }

    function canStartFactor(t) {
      return !!t && (t.type === "num" || t.type === "ident" || (t.type === "paren" && t.value === "("));
    }

    function parseTerm() {
      let value = parseUnary();
      while (true) {
        const t = peek();
        if (!t) break;
        if (t.type === "op" && (t.value === "*" || t.value === "/" || t.value === "%")) {
          const op = next().value;
          const rhs = parseUnary();
          if (op === "*") value *= rhs;
          else if (op === "/") {
            if (rhs === 0) throw new Error("Can't divide by zero");
            value /= rhs;
          } else {
            value %= rhs;
          }
        } else if (canStartFactor(t)) {
          value *= parseUnary(); // implicit multiplication, e.g. 2π or 3(4+5)
        } else {
          break;
        }
      }
      return value;
    }

    function parseUnary() {
      const t = peek();
      if (t && t.type === "op" && (t.value === "-" || t.value === "+")) {
        next();
        const val = parseUnary();
        return t.value === "-" ? -val : val;
      }
      return parsePower();
    }

    function parsePower() {
      const base = parsePostfix();
      if (peek() && peek().type === "op" && peek().value === "^") {
        next();
        const exponent = parseUnary(); // right-associative: 2^3^2 = 2^(3^2)
        return Math.pow(base, exponent);
      }
      return base;
    }

    function parsePostfix() {
      let value = parsePrimary();
      while (peek() && peek().type === "op" && peek().value === "!") {
        next();
        value = factorial(value);
      }
      return value;
    }

    function parsePrimary() {
      const t = next();
      if (!t) throw new Error("Unexpected end of expression");

      if (t.type === "num") return t.value;

      if (t.type === "paren" && t.value === "(") {
        const val = parseExpr();
        const close = next();
        if (!close || close.value !== ")") throw new Error('Missing ")"');
        return val;
      }

      if (t.type === "ident") {
        if (peek() && peek().type === "paren" && peek().value === "(") {
          next(); // consume "("
          const args = [parseExpr()];
          while (peek() && peek().type === "comma") {
            next();
            args.push(parseExpr());
          }
          const close = next();
          if (!close || close.value !== ")") throw new Error('Missing ")"');
          return callFunction(t.value, args, angleMode);
        }
        return resolveIdentifier(t.value, variables);
      }

      throw new Error(`Unexpected "${t.value}"`);
    }

    const result = parseExpr();
    if (pos < tokens.length) throw new Error(`Unexpected "${tokens[pos].value}"`);
    if (Number.isNaN(result)) throw new Error("Invalid calculation");
    return { value: result, error: null };
  } catch (err) {
    return { value: null, error: err.message || "Invalid expression" };
  }
}

/** Continued-fraction approximation — turns 0.75 into "3/4", π into "355/113", etc. */
export function toFractionApprox(num, maxDenominator = 100000) {
  if (!Number.isFinite(num)) return null;
  if (num === 0) return "0";
  const sign = num < 0 ? -1 : 1;
  const x = Math.abs(num);

  let h0 = 0, h1 = 1, k0 = 1, k1 = 0;
  let b = x;
  for (let iter = 0; iter < 30; iter++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDenominator) break;
    h0 = h1; h1 = h2;
    k0 = k1; k1 = k2;
    const rem = b - a;
    if (rem < 1e-10) break;
    b = 1 / rem;
  }
  if (k1 === 0) return null;
  if (k1 === 1) return `${sign * h1}`;
  return `${sign * h1}/${k1}`;
}

export function formatScientific(num, precision = 6) {
  if (!Number.isFinite(num)) return Number.isNaN(num) ? "NaN" : num > 0 ? "∞" : "-∞";
  return num
    .toExponential(precision)
    .replace(/(\.\d*?)0+e/, "$1e")
    .replace(/\.e/, "e")
    .replace("e+", " × 10^")
    .replace("e-", " × 10^-");
}

export function formatDecimal(num, precision = 10) {
  if (!Number.isFinite(num)) return Number.isNaN(num) ? "NaN" : num > 0 ? "∞" : "-∞";
  if (Number.isInteger(num)) return num.toLocaleString("en-US");
  const rounded = parseFloat(num.toPrecision(precision));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: precision });
}

export const BASES = { BIN: 2, OCT: 8, DEC: 10, HEX: 16 };

export function decToBase(value, base) {
  if (!Number.isFinite(value)) return "";
  const n = Math.trunc(value);
  if (base === 10) return String(n);
  const neg = n < 0;
  const digits = Math.abs(n).toString(base).toUpperCase();
  return neg ? `-${digits}` : digits;
}

export function baseToDecimal(str, base) {
  if (!str || !str.trim()) return null;
  const n = parseInt(str.trim(), base);
  return Number.isNaN(n) ? null : n;
}
