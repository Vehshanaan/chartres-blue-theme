/**
 * Chartres Blue Theme Demo — JavaScript (ES2022+)
 */

// === Private fields & static blocks ===

class CobaltBlue {
  #ingredient;
  static #all = [];
  static LABEL = 'Cobalt Blue';

  static {
    this.#all = [];
  }

  constructor(ingredient) {
    this.#ingredient = ingredient;
    CobaltBlue.#all.push(this);
  }

  get formula() {
    return `CoO · Al₂O₃`;
  }

  set base(baseMaterial) {
    this._base = baseMaterial;
  }

  static count() {
    return this.#all.length;
  }

  #privateHelper(temp) {
    return temp >= 1200 ? 'glassy' : 'opaque';
  }

  describe(temp) {
    return `${this.#ingredient} at ${temp}°C → ${this.#privateHelper(temp)}`;
  }
}

// === Async / await with destructuring ===

const fetchGlassData = async (url) => {
  const response = await fetch(url);
  const { data, meta: { total } = {} } = await response.json();
  return { data, total };
};

// === Arrow functions & closures ===

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const double = (n) => n * 2;
const square = (n) => n ** 2;
const doubleThenSquare = pipe(double, square);

// === Template literals & tagged templates ===

function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const val = values[i] ? `«${values[i]}»` : '';
    return result + str + val;
  }, '');
}

const name = 'Chartres';
const year = 1194;
const msg = highlight`The ${name} Cathedral was rebuilt in ${year}.`;

// === Regex & nullish coalescing ===

const HEX_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

function parseColor(str) {
  const match = HEX_PATTERN.exec(str);
  const [, r, g, b] = match ?? [];
  return match
    ? { r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16) }
    : null;
}

// === Optional chaining & spread ===

const glass = {
  type: 'stained',
  specs: { color: '#1A2A6C', thickness: 3.2 },
};

const thickness = glass?.specs?.thickness ?? 0;
const clone = { ...glass, id: crypto.randomUUID() };

// === Top-level await (module) ===

const result = await Promise.resolve({ ok: true });
console.log(doubleThenSquare(5), parseColor('#1A2A6C'), msg, clone);

export { CobaltBlue, fetchGlassData, parseColor, pipe };
