export interface UnitDefinition {
    dimension: string;
    scale: number;
    offset?: number;
}

const DEG_TO_RAD = Math.PI / 180;

const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
    // Length (base: m)
    m: { dimension: 'length', scale: 1 },
    meter: { dimension: 'length', scale: 1 },
    meters: { dimension: 'length', scale: 1 },
    metre: { dimension: 'length', scale: 1 },
    metres: { dimension: 'length', scale: 1 },
    km: { dimension: 'length', scale: 1e3 },
    hm: { dimension: 'length', scale: 1e2 },
    dam: { dimension: 'length', scale: 10 },
    dm: { dimension: 'length', scale: 0.1 },
    cm: { dimension: 'length', scale: 1e-2 },
    mm: { dimension: 'length', scale: 1e-3 },
    um: { dimension: 'length', scale: 1e-6 },
    'µm': { dimension: 'length', scale: 1e-6 },
    nm: { dimension: 'length', scale: 1e-9 },
    pm: { dimension: 'length', scale: 1e-12 },
    in: { dimension: 'length', scale: 0.0254 },
    inch: { dimension: 'length', scale: 0.0254 },
    inches: { dimension: 'length', scale: 0.0254 },
    ft: { dimension: 'length', scale: 0.3048 },
    foot: { dimension: 'length', scale: 0.3048 },
    feet: { dimension: 'length', scale: 0.3048 },
    yd: { dimension: 'length', scale: 0.9144 },
    yard: { dimension: 'length', scale: 0.9144 },
    yards: { dimension: 'length', scale: 0.9144 },
    mi: { dimension: 'length', scale: 1609.344 },
    mile: { dimension: 'length', scale: 1609.344 },
    miles: { dimension: 'length', scale: 1609.344 },
    nmi: { dimension: 'length', scale: 1852 },
    au: { dimension: 'length', scale: 149597870700 },
    ly: { dimension: 'length', scale: 9.4607304725808e15 },
    pc: { dimension: 'length', scale: 3.0856775814913673e16 },

    // Angle (base: rad)
    rad: { dimension: 'angle', scale: 1 },
    radian: { dimension: 'angle', scale: 1 },
    radians: { dimension: 'angle', scale: 1 },
    mrad: { dimension: 'angle', scale: 1e-3 },
    deg: { dimension: 'angle', scale: DEG_TO_RAD },
    degree: { dimension: 'angle', scale: DEG_TO_RAD },
    degrees: { dimension: 'angle', scale: DEG_TO_RAD },
    '°': { dimension: 'angle', scale: DEG_TO_RAD },
    arcmin: { dimension: 'angle', scale: DEG_TO_RAD / 60 },
    "'": { dimension: 'angle', scale: DEG_TO_RAD / 60 },
    arcsec: { dimension: 'angle', scale: DEG_TO_RAD / 3600 },
    '"': { dimension: 'angle', scale: DEG_TO_RAD / 3600 },
    mas: { dimension: 'angle', scale: (DEG_TO_RAD / 3600) * 1e-3 },
    uas: { dimension: 'angle', scale: (DEG_TO_RAD / 3600) * 1e-6 },
    'µas': { dimension: 'angle', scale: (DEG_TO_RAD / 3600) * 1e-6 },
    turn: { dimension: 'angle', scale: Math.PI * 2 },
    grad: { dimension: 'angle', scale: Math.PI / 200 },

    // Time (base: s)
    s: { dimension: 'time', scale: 1 },
    sec: { dimension: 'time', scale: 1 },
    second: { dimension: 'time', scale: 1 },
    seconds: { dimension: 'time', scale: 1 },
    ms: { dimension: 'time', scale: 1e-3 },
    us: { dimension: 'time', scale: 1e-6 },
    'µs': { dimension: 'time', scale: 1e-6 },
    ns: { dimension: 'time', scale: 1e-9 },
    min: { dimension: 'time', scale: 60 },
    minute: { dimension: 'time', scale: 60 },
    minutes: { dimension: 'time', scale: 60 },
    h: { dimension: 'time', scale: 3600 },
    hr: { dimension: 'time', scale: 3600 },
    hour: { dimension: 'time', scale: 3600 },
    hours: { dimension: 'time', scale: 3600 },
    d: { dimension: 'time', scale: 86400 },
    day: { dimension: 'time', scale: 86400 },
    days: { dimension: 'time', scale: 86400 },
    wk: { dimension: 'time', scale: 604800 },
    week: { dimension: 'time', scale: 604800 },
    yr: { dimension: 'time', scale: 31557600 },
    year: { dimension: 'time', scale: 31557600 },

    // Mass (base: kg)
    kg: { dimension: 'mass', scale: 1 },
    g: { dimension: 'mass', scale: 1e-3 },
    mg: { dimension: 'mass', scale: 1e-6 },
    ug: { dimension: 'mass', scale: 1e-9 },
    'µg': { dimension: 'mass', scale: 1e-9 },
    t: { dimension: 'mass', scale: 1e3 },
    tonne: { dimension: 'mass', scale: 1e3 },
    lb: { dimension: 'mass', scale: 0.45359237 },
    lbs: { dimension: 'mass', scale: 0.45359237 },
    pound: { dimension: 'mass', scale: 0.45359237 },
    oz: { dimension: 'mass', scale: 0.028349523125 },
    ounce: { dimension: 'mass', scale: 0.028349523125 },

    // Temperature (base: K)
    K: { dimension: 'temperature', scale: 1, offset: 0 },
    C: { dimension: 'temperature', scale: 1, offset: 273.15 },
    degC: { dimension: 'temperature', scale: 1, offset: 273.15 },
    '°C': { dimension: 'temperature', scale: 1, offset: 273.15 },
    F: { dimension: 'temperature', scale: 5 / 9, offset: 459.67 },
    degF: { dimension: 'temperature', scale: 5 / 9, offset: 459.67 },
    '°F': { dimension: 'temperature', scale: 5 / 9, offset: 459.67 },

    // Area (base: m2)
    m2: { dimension: 'area', scale: 1 },
    'm^2': { dimension: 'area', scale: 1 },
    km2: { dimension: 'area', scale: 1e6 },
    'km^2': { dimension: 'area', scale: 1e6 },
    cm2: { dimension: 'area', scale: 1e-4 },
    'cm^2': { dimension: 'area', scale: 1e-4 },
    mm2: { dimension: 'area', scale: 1e-6 },
    'mm^2': { dimension: 'area', scale: 1e-6 },
    ha: { dimension: 'area', scale: 1e4 },
    acre: { dimension: 'area', scale: 4046.8564224 },
    ft2: { dimension: 'area', scale: 0.09290304 },
    'ft^2': { dimension: 'area', scale: 0.09290304 },
    in2: { dimension: 'area', scale: 0.00064516 },
    'in^2': { dimension: 'area', scale: 0.00064516 },
    mi2: { dimension: 'area', scale: 2589988.110336 },
    'mi^2': { dimension: 'area', scale: 2589988.110336 },

    // Volume (base: m3)
    m3: { dimension: 'volume', scale: 1 },
    'm^3': { dimension: 'volume', scale: 1 },
    L: { dimension: 'volume', scale: 1e-3 },
    l: { dimension: 'volume', scale: 1e-3 },
    liter: { dimension: 'volume', scale: 1e-3 },
    litre: { dimension: 'volume', scale: 1e-3 },
    mL: { dimension: 'volume', scale: 1e-6 },
    ml: { dimension: 'volume', scale: 1e-6 },
    uL: { dimension: 'volume', scale: 1e-9 },
    cm3: { dimension: 'volume', scale: 1e-6 },
    'cm^3': { dimension: 'volume', scale: 1e-6 },
    mm3: { dimension: 'volume', scale: 1e-9 },
    'mm^3': { dimension: 'volume', scale: 1e-9 },
    gal: { dimension: 'volume', scale: 0.003785411784 },
    qt: { dimension: 'volume', scale: 0.000946352946 },
    pt: { dimension: 'volume', scale: 0.000473176473 },
    floz: { dimension: 'volume', scale: 2.95735295625e-5 },
    ft3: { dimension: 'volume', scale: 0.028316846592 },
    'ft^3': { dimension: 'volume', scale: 0.028316846592 },
    in3: { dimension: 'volume', scale: 1.6387064e-5 },
    'in^3': { dimension: 'volume', scale: 1.6387064e-5 },

    // Speed (base: m/s)
    'm/s': { dimension: 'speed', scale: 1 },
    'km/h': { dimension: 'speed', scale: 1 / 3.6 },
    kph: { dimension: 'speed', scale: 1 / 3.6 },
    mph: { dimension: 'speed', scale: 0.44704 },
    'mi/h': { dimension: 'speed', scale: 0.44704 },
    'ft/s': { dimension: 'speed', scale: 0.3048 },
    knot: { dimension: 'speed', scale: 1852 / 3600 },
    kn: { dimension: 'speed', scale: 1852 / 3600 },
    kt: { dimension: 'speed', scale: 1852 / 3600 },

    // Frequency (base: Hz)
    Hz: { dimension: 'frequency', scale: 1 },
    hz: { dimension: 'frequency', scale: 1 },
    kHz: { dimension: 'frequency', scale: 1e3 },
    khz: { dimension: 'frequency', scale: 1e3 },
    MHz: { dimension: 'frequency', scale: 1e6 },
    mhz: { dimension: 'frequency', scale: 1e6 },
    GHz: { dimension: 'frequency', scale: 1e9 },
    ghz: { dimension: 'frequency', scale: 1e9 },
    THz: { dimension: 'frequency', scale: 1e12 },
    thz: { dimension: 'frequency', scale: 1e12 },

    // Energy (base: J)
    J: { dimension: 'energy', scale: 1 },
    kJ: { dimension: 'energy', scale: 1e3 },
    MJ: { dimension: 'energy', scale: 1e6 },
    GJ: { dimension: 'energy', scale: 1e9 },
    cal: { dimension: 'energy', scale: 4.184 },
    kcal: { dimension: 'energy', scale: 4184 },
    Wh: { dimension: 'energy', scale: 3600 },
    kWh: { dimension: 'energy', scale: 3.6e6 },
    eV: { dimension: 'energy', scale: 1.602176634e-19 },
    keV: { dimension: 'energy', scale: 1.602176634e-16 },
    MeV: { dimension: 'energy', scale: 1.602176634e-13 },
    GeV: { dimension: 'energy', scale: 1.602176634e-10 },

    // Power (base: W)
    W: { dimension: 'power', scale: 1 },
    mW: { dimension: 'power', scale: 1e-3 },
    kW: { dimension: 'power', scale: 1e3 },
    MW: { dimension: 'power', scale: 1e6 },
    GW: { dimension: 'power', scale: 1e9 },

    // Pressure (base: Pa)
    Pa: { dimension: 'pressure', scale: 1 },
    hPa: { dimension: 'pressure', scale: 1e2 },
    kPa: { dimension: 'pressure', scale: 1e3 },
    MPa: { dimension: 'pressure', scale: 1e6 },
    bar: { dimension: 'pressure', scale: 1e5 },
    mbar: { dimension: 'pressure', scale: 1e2 },
    atm: { dimension: 'pressure', scale: 101325 },
    psi: { dimension: 'pressure', scale: 6894.757293168 },
    torr: { dimension: 'pressure', scale: 101325 / 760 },
    mmHg: { dimension: 'pressure', scale: 133.322387415 },

    // Force (base: N)
    N: { dimension: 'force', scale: 1 },
    kN: { dimension: 'force', scale: 1e3 },
    MN: { dimension: 'force', scale: 1e6 },
    lbf: { dimension: 'force', scale: 4.4482216152605 },
    dyn: { dimension: 'force', scale: 1e-5 },

    // Digital (base: B)
    B: { dimension: 'data', scale: 1 },
    byte: { dimension: 'data', scale: 1 },
    bytes: { dimension: 'data', scale: 1 },
    KB: { dimension: 'data', scale: 1e3 },
    MB: { dimension: 'data', scale: 1e6 },
    GB: { dimension: 'data', scale: 1e9 },
    TB: { dimension: 'data', scale: 1e12 },
    KiB: { dimension: 'data', scale: 1024 },
    MiB: { dimension: 'data', scale: 1024 ** 2 },
    GiB: { dimension: 'data', scale: 1024 ** 3 },
    TiB: { dimension: 'data', scale: 1024 ** 4 },
    bit: { dimension: 'data', scale: 0.125 },
    b: { dimension: 'data', scale: 0.125 },
    Kb: { dimension: 'data', scale: 125 },
    Mb: { dimension: 'data', scale: 1.25e5 },
    Gb: { dimension: 'data', scale: 1.25e8 },

    // Electrical
    V: { dimension: 'voltage', scale: 1 },
    mV: { dimension: 'voltage', scale: 1e-3 },
    kV: { dimension: 'voltage', scale: 1e3 },
    A: { dimension: 'current', scale: 1 },
    mA: { dimension: 'current', scale: 1e-3 },
    uA: { dimension: 'current', scale: 1e-6 },
    ohm: { dimension: 'resistance', scale: 1 },
    kohm: { dimension: 'resistance', scale: 1e3 },
    Mohm: { dimension: 'resistance', scale: 1e6 },

    // Dimensionless
    '%': { dimension: 'dimensionless', scale: 1e-2 },
    percent: { dimension: 'dimensionless', scale: 1e-2 },
    ppm: { dimension: 'dimensionless', scale: 1e-6 },
    ppb: { dimension: 'dimensionless', scale: 1e-9 }
};

export interface ParsedQuantity {
    value: number;
    unit: string;
}

const QUANTITY_STRING_RE = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(.*)$/;

export function parseQuantity(raw: unknown, defaultUnit = ''): ParsedQuantity | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? { value: raw, unit: defaultUnit.trim() } : null;
    }

    if (typeof raw === 'object' && 'value' in raw) {
        const obj = raw as { value: unknown; unit?: unknown };
        const num = Number(obj.value);
        if (!Number.isFinite(num)) return null;
        const unitStr = typeof obj.unit === 'string' && obj.unit.trim() !== ''
            ? obj.unit.trim()
            : defaultUnit.trim();
        return { value: num, unit: unitStr };
    }

    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed === '') return null;
        const match = QUANTITY_STRING_RE.exec(trimmed);
        if (!match) return null;
        const num = Number(match[1]);
        if (!Number.isFinite(num)) return null;
        const unitStr = match[2].trim() || defaultUnit.trim();
        return { value: num, unit: unitStr };
    }

    return null;
}

export function convertToTargetUnit(value: number, fromUnit: string, toUnit: string): number | null {
    const src = fromUnit.trim();
    const dst = toUnit.trim();
    if (src === dst) return value;
    if (!src || !dst) return null;

    const srcDef = UNIT_DEFINITIONS[src];
    const dstDef = UNIT_DEFINITIONS[dst];
    if (!srcDef || !dstDef || srcDef.dimension !== dstDef.dimension) return null;

    const baseValue = (value + (srcDef.offset ?? 0)) * srcDef.scale;
    return baseValue / dstDef.scale - (dstDef.offset ?? 0);
}

export function angularToleranceToRadians(tolerance: number, unit: string): number {
    const def = UNIT_DEFINITIONS[unit.trim()];
    if (!def || def.dimension !== 'angle') {
        return tolerance * DEG_TO_RAD;
    }
    return tolerance * def.scale;
}

const SEXAGESIMAL_RE = /^([+-]?)\s*(\d+(?:\.\d+)?)\s*[hd°:\s]\s*(\d+(?:\.\d+)?)?\s*[m'′:\s]?\s*(\d+(?:\.\d+)?)?\s*[s"″]?$/i;

export function parseAngleToRadians(
    raw: unknown,
    coordUnit: 'deg' | 'rad' | 'hours_deg',
    isLonOrRa: boolean
): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) return null;
        if (coordUnit === 'rad') return raw;
        if (coordUnit === 'hours_deg' && isLonOrRa) return raw * 15 * DEG_TO_RAD;
        return raw * DEG_TO_RAD;
    }

    if (typeof raw === 'object' && 'value' in raw) {
        const q = parseQuantity(raw);
        if (!q) return null;
        if (q.unit) {
            const rad = convertToTargetUnit(q.value, q.unit, 'rad');
            if (rad !== null) return rad;
        }
        return parseAngleToRadians(q.value, coordUnit, isLonOrRa);
    }

    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return null;

        const plainNum = Number(trimmed);
        if (Number.isFinite(plainNum)) {
            return parseAngleToRadians(plainNum, coordUnit, isLonOrRa);
        }

        const q = parseQuantity(trimmed);
        if (q && q.unit) {
            const rad = convertToTargetUnit(q.value, q.unit, 'rad');
            if (rad !== null) return rad;
        }

        const sexa = SEXAGESIMAL_RE.exec(trimmed);
        if (sexa) {
            const sign = sexa[1] === '-' ? -1 : 1;
            const d = Number(sexa[2] ?? 0);
            const m = Number(sexa[3] ?? 0);
            const s = Number(sexa[4] ?? 0);
            if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(s)) return null;
            const total = sign * (d + m / 60 + s / 3600);
            const isHours = /h/i.test(trimmed) || (coordUnit === 'hours_deg' && isLonOrRa);
            return (isHours ? total * 15 : total) * DEG_TO_RAD;
        }
    }

    return null;
}

// Vincenty spherical formula avoids precision loss at sub-arcsecond separations
export function angularSeparationRad(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const dLon = lon2 - lon1;
    const sinLat1 = Math.sin(lat1);
    const cosLat1 = Math.cos(lat1);
    const sinLat2 = Math.sin(lat2);
    const cosLat2 = Math.cos(lat2);
    const sinDLon = Math.sin(dLon);
    const cosDLon = Math.cos(dLon);

    const a = cosLat2 * sinDLon;
    const b = cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosDLon;
    const y = Math.sqrt(a * a + b * b);
    const x = sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosDLon;
    return Math.atan2(y, x);
}
