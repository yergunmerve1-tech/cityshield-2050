/*
  CityShield 2050
  Kurgusal kent paneli. Ağ isteği yok, kişisel veri alanı yok.
  Puan tam sayılarla hesaplanır. Kullanıcı metni innerHTML ile yazılmaz.
*/

const STORAGE_KEY = "cityshield2050.events.v1";
const EVENT_CAP = 40;
const IMPACT_PERCENT = 15;
const POSTURE_MIN = 15;
const POSTURE_MAX = 99;

const EVENT_TYPES = [
  { id: "hizmet-kesintisi", label: "Hizmet kesintisi simülasyonu", base: 74, hint: "Kurgusal senaryo: bir hizmet kısa süre yanıt vermez. Gerçek kesinti oluşturulmaz." },
  { id: "sensor", label: "Sensör manipülasyon senaryosu", base: 68, hint: "Kurgusal senaryo: bir ölçüm kaynağı olağandışı değer üretir. Fiziksel ekipman kontrol edilmez." },
  { id: "erisim", label: "Yetkisiz erişim denemesi", base: 62, hint: "Kurgusal senaryo: yetkisiz bir oturum denemesi kayda geçer. Gerçek hesap ele geçirilmez." },
  { id: "kimlik", label: "Kimlik doğrulama sapması", base: 56, hint: "Kurgusal senaryo: doğrulama adımı beklenen sonucu vermez. Parola üretilmez." },
  { id: "butunluk", label: "Veri bütünlüğü uyarısı", base: 52, hint: "Kurgusal senaryo: bir kayıt beklenen kopyadan sapar. Veri değiştirilmez." },
  { id: "anomali", label: "Ağ anomali sinyali", base: 46, hint: "Kurgusal senaryo: ağ izlemede olağandışı bir desen görünür. Tarama yapılmaz." },
  { id: "yedek", label: "Yedekleme doğrulama hatası", base: 40, hint: "Kurgusal senaryo: yedek kopya doğrulaması başarısız görünür. Geri yükleme yapılmaz." },
  { id: "gecikme", label: "İletişim gecikmesi", base: 34, hint: "Kurgusal senaryo: bir iletişim kanalı gecikir. Hat kesilmez." }
];

const SEVERITIES = [
  { id: "dusuk", label: "Düşük", factor100: 50 },
  { id: "orta", label: "Orta", factor100: 78 },
  { id: "yuksek", label: "Yüksek", factor100: 100 },
  { id: "kritik", label: "Kritik", factor100: 118 }
];

const SYSTEMS = [
  { id: "hastane", label: "Hastane", factor100: 122, baseline: 84, scope: "Hasta izleme ve acil servis ağı" },
  { id: "ulasim", label: "Ulaşım", factor100: 108, baseline: 76, scope: "Sinyalizasyon ve durak bilgilendirme" },
  { id: "enerji", label: "Enerji", factor100: 116, baseline: 80, scope: "Dağıtım ve yük dengeleme" },
  { id: "su", label: "Su", factor100: 112, baseline: 78, scope: "Arıtma ve basınç izleme" },
  { id: "haberlesme", label: "Haberleşme", factor100: 104, baseline: 74, scope: "Acil duyuru ve saha iletişimi" }
];

const LEVELS = {
  dusuk: { label: "Düşük", tone: "low" },
  orta: { label: "Orta", tone: "mid" },
  yuksek: { label: "Yüksek", tone: "high" }
};

const TYPE_ADVICE = {
  "hizmet-kesintisi": [
    "Yedek hizmet rotasını tatbikat planından seçip masa başında uygulayın.",
    "Etkilenen bileşeni simülasyon kaydında ayırın ve kritik hizmet sırasını kontrol edin.",
    "Duyuru metnini kurgusal şablonla hazırlayın; gerçek kişi veya hasta verisi yazmayın."
  ],
  sensor: [
    "İlgili sensörü tatbikatta şüpheli kaynak olarak işaretleyin.",
    "Son bilinen sağlam ölçümle karşılaştırın ve eşik sapmasını not edin.",
    "Saha teyidini sözlü prosedürle planlayın. Bu ekran fiziksel vana açmaz."
  ],
  erisim: [
    "Senaryodaki hesabı tatbikat dizininde geçici olarak askıya alın.",
    "Erişim günlüğünü yalnızca yetkili tatbikat ekibiyle gözden geçirin.",
    "Ayrıcalıklı hesaplar için çok adımlı doğrulamayı yeniden eğitin."
  ],
  kimlik: [
    "Başarısız doğrulama denemelerini vardiya notuna işleyin.",
    "Senaryo kimliklerini sıfırlama tatbikatına alın. Gerçek parola üretmeyin.",
    "Olağandışı saatlerdeki girişleri ayrıca işaretleyin."
  ],
  butunluk: [
    "Etkilenen kaydın son sağlam kopyasını tatbikat envanterinden seçin.",
    "Değişen alanı salt okunur karşılaştırma ile işaretleyin.",
    "Yazma iznini senaryo süresince daraltın."
  ],
  anomali: [
    "Anomali görülen ağ dilimini izleme senaryosunda ayırın.",
    "Beklenen trafik profiliyle farkı kısa not halinde kaydedin.",
    "Yönetim arayüzüne erişimi tatbikat rolleriyle sınırlayın."
  ],
  yedek: [
    "Son başarılı yedekleme zamanını tatbikat çizelgesiyle karşılaştırın.",
    "Geri yükleme provasını üretim dışı kabul edin. Bu uygulama geri yükleme yapmaz.",
    "Eksik kopya için sorumlu rolü atayın."
  ],
  gecikme: [
    "Gecikme eşiğini iletişim planındaki değerle karşılaştırın.",
    "Yedek kanalı duyuru taslağına ekleyin.",
    "Kaydı düşük öncelikli izlemeye alın ve yeniden ölçün."
  ]
};

const SYSTEM_ADVICE = {
  hastane: "Klinik cihazları senaryoda hastane ağından mantıksal olarak ayırın ve acil servis sürekliliğini kontrol listesinden doğrulayın.",
  ulasim: "Sinyal ve durak ekranlarını salt okunur yedek bildirime alın.",
  enerji: "Yük azaltma sırasını tatbikat planındaki önceliğe göre gözden geçirin.",
  su: "Basınç ve vana eşiklerini saha ekibinin sözlü teyit adımıyla eşleştirin.",
  haberlesme: "Yedek duyuru kanalını görevli listesine yeniden bildirin."
};

const LEVEL_ADVICE = {
  yuksek: "Kaydı yüksek öncelikli tatbikat işi olarak işaretleyin ve aynı vardiyada kısa bir değerlendirme yapın.",
  orta: "Kaydı vardiya notuna ekleyin ve aynı gün içinde gözden geçirin.",
  dusuk: "Kaydı haftalık özete bırakın. Ek müdahale adımı gerekmez."
};

const SAMPLE = {
  title: "Gece vardiyası sensör sapması",
  typeId: "sensor",
  severityId: "yuksek",
  systemId: "su",
  note: "Arıtma tesisindeki basınç sensörü kısa süreli olağandışı değer üretti. Bu kayıt kurgusal bir tatbikattır."
};

const ALLOWED = /^[A-Za-z0-9ÇĞİÖŞÜçğıöşüıİ \n.,:;!?'"()/%+\-–—]+$/;
const WORD = /[A-Za-z0-9ÇĞİÖŞÜçğıöşüıİ]/;
const FIELD_IDS = ["title", "type", "severity", "system", "note"];

const state = {
  events: [],
  filter: "all",
  memoryOnly: false,
  confirmClear: false,
  pendingDeleteId: null,
  activeId: null,
  highlightId: null
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* Pozitif tam sayılarda yarım yukarı yuvarlar. Kayan nokta sapmasını önler. */
function divRound(numerator, denominator) {
  return Math.floor((numerator + Math.floor(denominator / 2)) / denominator);
}

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

function formatFactor(factor100) {
  const whole = Math.trunc(factor100 / 100);
  const frac = String(factor100 % 100).padStart(2, "0");
  return `${whole},${frac}`;
}

function formatProduct(product) {
  const hundredths = divRound(product, 100);
  const whole = Math.trunc(hundredths / 100);
  const frac = String(hundredths % 100).padStart(2, "0");
  return `${whole},${frac}`;
}

function formatOneDecimal(tenths) {
  const whole = Math.trunc(Math.abs(tenths) / 10);
  const frac = Math.abs(tenths) % 10;
  return `${whole},${frac}`;
}

function levelFor(score) {
  if (score >= 70) return "yuksek";
  if (score >= 40) return "orta";
  return "dusuk";
}

function calculateRisk(typeId, severityId, systemId) {
  const type = findById(EVENT_TYPES, typeId);
  const severity = findById(SEVERITIES, severityId);
  const system = findById(SYSTEMS, systemId);
  const product = type.base * severity.factor100 * system.factor100;
  const rounded = divRound(product, 10000);
  const score = clamp(rounded, 0, 100);
  return { product, rounded, score, level: levelFor(score) };
}

function eventPenalty(score) {
  return divRound(score * IMPACT_PERCENT, 100);
}

function adviceFor(typeId, systemId, level) {
  return [SYSTEM_ADVICE[systemId]].concat(TYPE_ADVICE[typeId], [LEVEL_ADVICE[level]]);
}

function normalizeText(value) {
  return String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function isCleanText(value, min, max) {
  if (value.length < min || value.length > max) return false;
  return ALLOWED.test(value);
}

function validateForm(form) {
  const title = normalizeText(form.title.value);
  const note = normalizeText(form.note.value);
  const typeId = form.type.value;
  const severityId = form.severity.value;
  const systemId = form.system.value;
  const errors = {};

  form.title.value = title;
  form.note.value = note;

  if (!title) {
    errors.title = "Başlık gerekli.";
  } else if (title.length < 5 || title.length > 80) {
    errors.title = "Başlık 5 ile 80 karakter arasında olmalı.";
  } else if (!isCleanText(title, 5, 80)) {
    errors.title = "Başlık yalnızca harf, rakam, boşluk ve temel noktalama içerebilir.";
  } else if (!WORD.test(title)) {
    errors.title = "Başlık en az bir harf veya rakam içermeli.";
  }

  if (!findById(EVENT_TYPES, typeId)) errors.type = "Olay türünü listeden seçin.";
  if (!findById(SEVERITIES, severityId)) errors.severity = "Önemi listeden seçin.";
  if (!findById(SYSTEMS, systemId)) errors.system = "Etkilenen sistemi listeden seçin.";

  if (note) {
    if (note.length > 240) {
      errors.note = "Not 240 karakteri aşamaz.";
    } else if (!isCleanText(note, 1, 240)) {
      errors.note = "Not yalnızca harf, rakam, boşluk ve temel noktalama içerebilir.";
    } else if (!WORD.test(note)) {
      errors.note = "Not en az bir harf veya rakam içermeli.";
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { title, note, typeId, severityId, systemId }
  };
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function toStored(event) {
  return {
    id: event.id,
    title: event.title,
    note: event.note,
    typeId: event.typeId,
    severityId: event.severityId,
    systemId: event.systemId,
    score: event.score,
    level: event.level,
    createdAt: event.createdAt
  };
}

function normalizeEvent(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const type = findById(EVENT_TYPES, raw.typeId);
  const severity = findById(SEVERITIES, raw.severityId);
  const system = findById(SYSTEMS, raw.systemId);
  if (!type || !severity || !system) return null;
  if (typeof raw.id !== "string" || !/^[A-Za-z0-9-]{8,80}$/.test(raw.id)) return null;
  if (typeof raw.title !== "string" || !isCleanText(raw.title.trim(), 5, 80) || !WORD.test(raw.title)) return null;
  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  if (note && (!isCleanText(note, 1, 240) || !WORD.test(note))) return null;
  if (!Number.isInteger(raw.score) || typeof raw.level !== "string") return null;
  if (typeof raw.createdAt !== "string" || raw.createdAt.length > 40 || Number.isNaN(Date.parse(raw.createdAt))) return null;
  const calc = calculateRisk(type.id, severity.id, system.id);
  if (calc.score !== raw.score || calc.level !== raw.level) return null;
  return {
    id: raw.id,
    title: raw.title.trim(),
    note,
    typeId: type.id,
    severityId: severity.id,
    systemId: system.id,
    score: calc.score,
    level: calc.level,
    createdAt: raw.createdAt
  };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: [], memoryOnly: false, warning: "" };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, "[]");
      return { events: [], memoryOnly: false, warning: "Kayıt alanı liste değildi. Geçmiş sıfırlandı." };
    }
    const seen = new Set();
    const events = [];
    let skipped = 0;
    for (const item of parsed) {
      const event = normalizeEvent(item);
      if (!event || seen.has(event.id)) {
        skipped += 1;
        continue;
      }
      seen.add(event.id);
      events.push(event);
    }
    events.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    let warning = "";
    let changed = skipped > 0;
    if (events.length > EVENT_CAP) {
      events.length = EVENT_CAP;
      changed = true;
      warning = "Kayıt üst sınırı aşıldığı için en yeni 40 kayıt tutuldu.";
    }
    if (skipped) {
      warning = warning
        ? `${warning} Biçimi uymayan ${skipped} kayıt yok sayıldı.`
        : `Biçimi uymayan ${skipped} kayıt yok sayıldı ve temiz liste yeniden yazıldı.`;
    }
    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events.map(toStored)));
      } catch (writeError) {
        return {
          events,
          memoryOnly: true,
          warning: warning
            ? `${warning} Temiz liste kayıt alanına yazılamadı.`
            : "Kayıtlar okundu fakat kayıt alanı güncellenemedi. Değişiklikler bu sayfa kapanınca kalıcı olmayabilir."
        };
      }
    }
    return { events, memoryOnly: false, warning };
  } catch (error) {
    return {
      events: [],
      memoryOnly: true,
      warning: "Tarayıcı kayıt alanı okunamadı. Olaylar yalnızca bu sayfa açıkken tutulur."
    };
  }
}

function writeStorage() {
  if (state.memoryOnly) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events.map(toStored)));
    return true;
  } catch (error) {
    state.memoryOnly = true;
    return false;
  }
}

function systemSnapshot(systemId, events) {
  const system = findById(SYSTEMS, systemId);
  const related = events.filter((event) => event.systemId === systemId);
  if (!related.length) {
    return { posture: system.baseline, status: "Olay yok", tone: "idle", count: 0 };
  }
  const penalty = related.reduce((total, event) => total + eventPenalty(event.score), 0);
  const posture = clamp(system.baseline - penalty, POSTURE_MIN, POSTURE_MAX);
  let status = "Stabil";
  let tone = "low";
  if (related.some((event) => event.level === "yuksek")) {
    status = "Müdahale";
    tone = "high";
  } else if (related.some((event) => event.level === "orta") || posture < 60) {
    status = "İzleniyor";
    tone = "mid";
  }
  return { posture, status, tone, count: related.length };
}

function summarize(events) {
  const count = events.length;
  const sum = events.reduce((total, event) => total + event.score, 0);
  const high = events.filter((event) => event.level === "yuksek").length;
  const avgTenths = count ? divRound(sum * 10, count) : 0;
  const ranking = SYSTEMS.map((system) => {
    const related = events.filter((event) => event.systemId === system.id);
    const score = related.reduce((total, event) => total + event.score, 0);
    return { label: system.label, count: related.length, score };
  }).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.score !== a.score) return b.score - a.score;
    return a.label.localeCompare(b.label, "tr");
  });
  const topLabel = ranking[0] && ranking[0].count > 0 ? ranking[0].label : "—";
  return { count, high, avgTenths, topLabel };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function meter(value, tone) {
  const wrap = el("span", `meter tone-${tone}`);
  wrap.setAttribute("aria-hidden", "true");
  const lit = clamp(Math.round(value / 10), 0, 10);
  for (let index = 0; index < 10; index += 1) {
    wrap.append(el("span", index < lit ? "meter-cell on" : "meter-cell"));
  }
  return wrap;
}

function formatWhen(iso) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch (error) {
    return iso;
  }
}

function notify(message, kind) {
  const node = document.getElementById("notice");
  node.hidden = false;
  node.className = `notice ${kind}`;
  node.textContent = message;
}

function showFieldErrors(errors) {
  FIELD_IDS.forEach((id) => {
    const field = document.getElementById(id);
    const message = errors[id] || "";
    document.getElementById(`${id}-error`).textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  });
}

function updateTypeHint() {
  const type = findById(EVENT_TYPES, document.getElementById("type").value);
  document.getElementById("type-help").textContent = type
    ? type.hint
    : "Tür, puanın taban değerini belirler.";
}

function fillSelect(id, items, placeholder) {
  const select = document.getElementById(id);
  select.replaceChildren();
  const first = new Option(placeholder, "");
  first.disabled = true;
  first.selected = true;
  select.append(first);
  for (const item of items) select.append(new Option(item.label, item.id));
}

function renderGauge() {
  const sum = SYSTEMS.reduce((total, system) => total + systemSnapshot(system.id, state.events).posture, 0);
  const tenths = divRound(sum * 10, SYSTEMS.length);
  const percent = tenths / 10;
  document.getElementById("gauge-value").textContent = formatOneDecimal(tenths);
  const circumference = 2 * Math.PI * 52;
  const arc = document.getElementById("gauge-arc");
  arc.setAttribute("stroke-dasharray", String(circumference));
  arc.setAttribute("stroke-dashoffset", String(circumference * (1 - percent / 100)));
  const svg = document.getElementById("gauge");
  const tone = percent >= 75 ? "good" : percent >= 55 ? "mid" : "bad";
  svg.classList.remove("tone-good", "tone-mid", "tone-bad");
  svg.classList.add(`tone-${tone}`);
  const label = `Kent hazırlığı ${formatOneDecimal(tenths)} / 100`;
  svg.setAttribute("aria-label", label);
  document.getElementById("gauge-caption").textContent = state.events.length
    ? "Kayıtlara göre güncel hazırlık. Etkilenmeyen sistemler referansta kalır."
    : "Henüz olay yok. Gösterilen değer beş sistemin referans hazırlığıdır.";
}

function renderSystems() {
  const list = document.getElementById("system-list");
  list.replaceChildren();
  for (const system of SYSTEMS) {
    const snap = systemSnapshot(system.id, state.events);
    const button = el("button", `system-card tone-${snap.tone}`);
    button.type = "button";
    button.dataset.filter = system.id;
    button.setAttribute("aria-pressed", state.filter === system.id ? "true" : "false");
    const head = el("span", "system-head");
    head.append(el("span", "system-name", system.label));
    head.append(el("span", "status-pill", snap.status));
    button.append(head);
    button.append(el("span", "system-scope", system.scope));
    button.append(meter(snap.posture, snap.tone));
    const line = snap.count
      ? `Hazırlık ${snap.posture} · referans ${system.baseline} · ${snap.count} kayıt`
      : `Referans hazırlık ${system.baseline} · olay yok`;
    button.append(el("span", "system-meta", line));
    list.append(button);
  }
}

function renderStats() {
  const summary = summarize(state.events);
  document.getElementById("stat-count").textContent = String(summary.count);
  document.getElementById("stat-avg").textContent = summary.count ? formatOneDecimal(summary.avgTenths) : "0";
  document.getElementById("stat-high").textContent = String(summary.high);
  document.getElementById("stat-system").textContent = summary.topLabel;
}

function renderFilters() {
  const host = document.getElementById("filters");
  host.replaceChildren();
  const all = el("button", "chip", "Tümü");
  all.type = "button";
  all.dataset.filter = "all";
  all.setAttribute("aria-pressed", state.filter === "all" ? "true" : "false");
  host.append(all);
  for (const system of SYSTEMS) {
    const count = state.events.filter((event) => event.systemId === system.id).length;
    const button = el("button", "chip", `${system.label} (${count})`);
    button.type = "button";
    button.dataset.filter = system.id;
    button.setAttribute("aria-pressed", state.filter === system.id ? "true" : "false");
    host.append(button);
  }
}

function renderHistoryItem(event, highlightId) {
  const item = el("li", "history-item");
  if (event.id === highlightId) item.classList.add("enter");
  const system = findById(SYSTEMS, event.systemId);
  const type = findById(EVENT_TYPES, event.typeId);
  const severity = findById(SEVERITIES, event.severityId);
  const level = LEVELS[event.level];
  const top = el("div", "history-top");
  top.append(el("h3", "history-title user-text", event.title));
  top.append(el("span", `badge tone-${level.tone}`, `${level.label} · ${event.score}`));
  item.append(top);
  item.append(el("p", "meta", `${system.label} · ${type.label} · ${severity.label} önem · ${formatWhen(event.createdAt)}`));
  if (event.note) item.append(el("p", "note user-text", event.note));
  const actions = el("div", "row-actions");
  if (state.pendingDeleteId === event.id) {
    actions.append(el("span", "confirm-copy", "Bu kayıt silinsin mi?"));
    const yes = el("button", "button danger small", "Evet, sil");
    yes.type = "button";
    yes.dataset.action = "confirm-delete";
    yes.dataset.id = event.id;
    const no = el("button", "button ghost small", "Vazgeç");
    no.type = "button";
    no.dataset.action = "cancel-delete";
    no.dataset.id = event.id;
    actions.append(yes, no);
  } else {
    const detail = el("button", "button ghost small", "Ayrıntı");
    detail.type = "button";
    detail.dataset.action = "detail";
    detail.dataset.id = event.id;
    const remove = el("button", "button danger small", "Sil");
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.dataset.id = event.id;
    actions.append(detail, remove);
  }
  item.append(actions);
  return item;
}

function renderHistory() {
  const highlightId = state.highlightId;
  state.highlightId = null;
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  list.replaceChildren();
  const visible = state.events.filter((event) => state.filter === "all" || event.systemId === state.filter);
  document.getElementById("history-count").textContent = state.events.length
    ? `${state.events.length} kayıt bu tarayıcıda`
    : "Henüz kayıt yok";
  if (!visible.length) {
    empty.hidden = false;
    empty.textContent = state.events.length
      ? "Bu filtrede kayıt yok."
      : "Geçmiş boş. Kaydedilen simülasyonlar burada listelenir.";
    return;
  }
  empty.hidden = true;
  for (const event of visible) list.append(renderHistoryItem(event, highlightId));
}

function render() {
  renderGauge();
  renderSystems();
  renderStats();
  renderFilters();
  renderHistory();
}

function showResult(event, options) {
  const body = document.getElementById("result-body");
  const card = document.getElementById("result");
  body.replaceChildren();
  state.activeId = event ? event.id : null;
  card.classList.remove("tone-low", "tone-mid", "tone-high", "tone-idle");
  if (!event) {
    card.classList.add("tone-idle");
    body.append(el("p", "lede", "Henüz analiz yok. Form, kurgusal bir tatbikat olayı kaydeder. Puan; tür, önem ve etkilenen sistemden hesaplanır."));
    return;
  }
  const level = LEVELS[event.level];
  const calc = calculateRisk(event.typeId, event.severityId, event.systemId);
  const type = findById(EVENT_TYPES, event.typeId);
  const severity = findById(SEVERITIES, event.severityId);
  const system = findById(SYSTEMS, event.systemId);
  const penalty = eventPenalty(event.score);
  card.classList.add(`tone-${level.tone}`);

  const scoreRow = el("div", "score-row");
  scoreRow.append(el("p", "score-big", String(event.score)));
  scoreRow.append(el("span", `badge tone-${level.tone}`, `${level.label} risk`));
  body.append(scoreRow);
  body.append(el("h3", "user-text result-title", event.title));
  body.append(el("p", "meta", `${system.label} · ${type.label} · ${severity.label} önem`));

  let calcText = `Hesap: ${type.base} × ${formatFactor(severity.factor100)} × ${formatFactor(system.factor100)} = ${formatProduct(calc.product)}. Yuvarlanmış değer ${calc.rounded}.`;
  if (calc.rounded !== calc.score) {
    calcText += ` Sınır nedeniyle puan ${calc.score}.`;
  } else {
    calcText += ` Puan ${calc.score}.`;
  }
  body.append(el("p", "calc", calcText));
  body.append(el("p", "meta", `Bu kayıt ${system.label} hazırlığını ${penalty} puan düşürür. Düşüşler toplanır. Hazırlık ${POSTURE_MIN} ile ${POSTURE_MAX} arasında kalır.`));
  if (event.note) body.append(el("p", "note user-text", event.note));
  body.append(el("h3", "subhead", "Savunma önerileri"));
  const tips = el("ul", "advice");
  adviceFor(event.typeId, event.systemId, event.level).forEach((tip) => tips.append(el("li", null, tip)));
  body.append(tips);
  body.append(el("p", "disclaimer", "Öneriler sabit tatbikat metinleridir. Resmi müdahale planının yerine geçmez. Bu sayfa bir sistemi yönetmez."));
  body.append(el("p", "meta", formatWhen(event.createdAt)));
  if (options && options.focus) document.getElementById("result-heading").focus();
}

function renderFormula() {
  const panel = document.getElementById("formula-panel");
  panel.replaceChildren();
  panel.append(el("p", null, "Puan tam sayılarla hesaplanır: taban × önem katsayısı × sistem katsayısı. Sonuç yuvarlanır, sonra 0 ile 100 arasına alınır. 0–39 düşük, 40–69 orta, 70–100 yüksektir."));
  panel.append(el("h3", null, "Tür tabanları"));
  const types = el("ul", "plain-list");
  EVENT_TYPES.forEach((type) => types.append(el("li", null, `${type.label}: ${type.base}`)));
  panel.append(types);
  panel.append(el("h3", null, "Önem katsayıları"));
  const severities = el("ul", "plain-list");
  SEVERITIES.forEach((item) => severities.append(el("li", null, `${item.label}: ${formatFactor(item.factor100)}`)));
  panel.append(severities);
  panel.append(el("h3", null, "Sistem katsayıları"));
  const systems = el("ul", "plain-list");
  SYSTEMS.forEach((item) => systems.append(el("li", null, `${item.label}: ${formatFactor(item.factor100)} · referans hazırlık ${item.baseline}`)));
  panel.append(systems);
  panel.append(el("p", null, "Düşük önem her zaman düşük risk üretmez. Yüksek tabanlı bir tür ve kritik bir sistem puanı orta banda taşıyabilir."));
  panel.append(el("h3", null, "Örnekler"));
  const examples = el("ul", "plain-list");
  [
    ["hizmet-kesintisi", "kritik", "hastane"],
    ["gecikme", "dusuk", "haberlesme"],
    ["anomali", "orta", "ulasim"],
    ["butunluk", "orta", "haberlesme"],
    ["sensor", "yuksek", "enerji"],
    ["hizmet-kesintisi", "dusuk", "hastane"]
  ].forEach((sample) => {
    const type = findById(EVENT_TYPES, sample[0]);
    const severity = findById(SEVERITIES, sample[1]);
    const system = findById(SYSTEMS, sample[2]);
    const calc = calculateRisk(sample[0], sample[1], sample[2]);
    examples.append(el("li", null, `${type.label}, ${severity.label} önem, ${system.label}: ham ${formatProduct(calc.product)}, yuvarlanmış ${calc.rounded}, puan ${calc.score}, ${LEVELS[calc.level].label}.`));
  });
  panel.append(examples);
  panel.append(el("p", null, `Hazırlık düşüşü puanın yüzde ${IMPACT_PERCENT} kadarıdır ve aynı sistemde toplanır. Hazırlık ${POSTURE_MIN} puanın altına inmez.`));
}

function resetForm(options) {
  const form = document.getElementById("event-form");
  form.title.value = "";
  form.note.value = "";
  form.type.value = "";
  form.severity.value = "";
  form.system.value = "";
  showFieldErrors({});
  updateTypeHint();
  if (!options || !options.silent) notify("Form temizlendi.", "info");
}

function fillSample() {
  const form = document.getElementById("event-form");
  form.title.value = SAMPLE.title;
  form.type.value = SAMPLE.typeId;
  form.severity.value = SAMPLE.severityId;
  form.system.value = SAMPLE.systemId;
  form.note.value = SAMPLE.note;
  showFieldErrors({});
  updateTypeHint();
  notify("Örnek senaryo forma yazıldı. Kaydetmek için Simülasyonu kaydet düğmesine basın.", "info");
  form.title.focus();
}

function setClearBox(open) {
  state.confirmClear = open;
  const box = document.getElementById("clear-box");
  box.hidden = !open;
  document.getElementById("clear-history").setAttribute("aria-expanded", open ? "true" : "false");
  if (open) document.getElementById("clear-yes").focus();
}

function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const result = validateForm(form);
  showFieldErrors(result.errors);
  if (!result.ok) {
    notify("Kayıt eklenmedi. İşaretli alanları düzeltin.", "err");
    const firstId = FIELD_IDS.find((id) => result.errors[id]);
    document.getElementById(firstId).focus();
    return;
  }
  const calc = calculateRisk(result.value.typeId, result.value.severityId, result.value.systemId);
  const record = {
    id: createId(),
    title: result.value.title,
    note: result.value.note,
    typeId: result.value.typeId,
    severityId: result.value.severityId,
    systemId: result.value.systemId,
    score: calc.score,
    level: calc.level,
    createdAt: new Date().toISOString()
  };
  state.events.unshift(record);
  const dropped = state.events.length > EVENT_CAP;
  if (dropped) state.events.pop();
  state.highlightId = record.id;
  state.filter = "all";
  state.pendingDeleteId = null;
  const saved = writeStorage();
  showResult(record, { focus: true });
  render();
  resetForm({ silent: true });
  if (!saved) {
    notify("Simülasyon bu sayfada hesaplandı fakat tarayıcı kayıt alanına yazılamadı.", "warn");
  } else if (dropped) {
    notify("Simülasyon kaydedildi. Üst sınır 40 olduğu için en eski kayıt çıkarıldı.", "warn");
  } else {
    notify("Simülasyon kaydedildi.", "ok");
  }
}

function applyFilter(id) {
  if (id !== "all" && !findById(SYSTEMS, id)) return;
  state.filter = id !== "all" && state.filter === id ? "all" : id;
  render();
}

function focusDeleteYes(id) {
  const buttons = document.querySelectorAll("[data-action='confirm-delete']");
  for (const button of buttons) {
    if (button.getAttribute("data-id") === id) {
      button.focus();
      break;
    }
  }
}

function onHistoryAction(button) {
  const id = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");
  const found = state.events.some((event) => event.id === id);
  if (!found) {
    notify("Kayıt bulunamadı.", "warn");
    return;
  }
  if (action === "detail") {
    showResult(state.events.find((event) => event.id === id), { focus: true });
    return;
  }
  if (action === "delete") {
    state.pendingDeleteId = id;
    render();
    focusDeleteYes(id);
    return;
  }
  if (action === "cancel-delete") {
    state.pendingDeleteId = null;
    render();
    notify("Silme iptal edildi.", "info");
    return;
  }
  if (action === "confirm-delete") {
    state.events = state.events.filter((event) => event.id !== id);
    state.pendingDeleteId = null;
    const saved = writeStorage();
    if (state.activeId === id) showResult(null);
    render();
    document.getElementById("history-heading").focus();
    notify(saved ? "Kayıt silindi." : "Kayıt bu sayfadan silindi; tarayıcı kaydı güncellenemedi.", saved ? "ok" : "warn");
  }
}

function confirmClear() {
  state.events = [];
  state.pendingDeleteId = null;
  state.filter = "all";
  setClearBox(false);
  const saved = writeStorage();
  showResult(null);
  render();
  notify(saved ? "Geçmiş temizlendi." : "Liste bu sayfada temizlendi; tarayıcı kaydı güncellenemedi.", saved ? "ok" : "warn");
}

function tickClock() {
  const node = document.getElementById("clock");
  if (!node) return;
  node.textContent = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

function bind() {
  document.getElementById("event-form").addEventListener("submit", onSubmit);
  document.getElementById("event-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!field.id || !FIELD_IDS.includes(field.id)) return;
    document.getElementById(`${field.id}-error`).textContent = "";
    field.setAttribute("aria-invalid", "false");
  });
  document.getElementById("type").addEventListener("change", updateTypeHint);
  document.getElementById("reset-form").addEventListener("click", () => resetForm());
  document.getElementById("fill-sample").addEventListener("click", fillSample);
  document.getElementById("formula-toggle").addEventListener("click", () => {
    const panel = document.getElementById("formula-panel");
    const open = panel.hidden;
    panel.hidden = !open;
    document.getElementById("formula-toggle").setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("clear-history").addEventListener("click", () => {
    if (!state.events.length) {
      setClearBox(false);
      notify("Temizlenecek kayıt yok.", "info");
      return;
    }
    setClearBox(!state.confirmClear);
  });
  document.getElementById("clear-yes").addEventListener("click", confirmClear);
  document.getElementById("clear-no").addEventListener("click", () => {
    setClearBox(false);
    notify("Temizleme iptal edildi.", "info");
  });
  document.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton && filterButton.closest("#system-list, #filters")) {
      applyFilter(filterButton.getAttribute("data-filter"));
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton && actionButton.closest("#history-list")) onHistoryAction(actionButton);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    let changed = false;
    if (state.confirmClear) {
      setClearBox(false);
      changed = true;
    }
    if (state.pendingDeleteId) {
      state.pendingDeleteId = null;
      render();
      changed = true;
    }
    if (changed) notify("İşlem vazgeçildi.", "info");
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const loaded = readStorage();
    state.events = loaded.events;
    state.memoryOnly = loaded.memoryOnly;
    state.pendingDeleteId = null;
    setClearBox(false);
    render();
    if (state.activeId && !state.events.some((item) => item.id === state.activeId)) showResult(null);
    if (loaded.warning) notify(loaded.warning, "warn");
  });
}

function init() {
  const loaded = readStorage();
  state.events = loaded.events;
  state.memoryOnly = loaded.memoryOnly;
  fillSelect("type", EVENT_TYPES, "Tür seçin");
  fillSelect("severity", SEVERITIES, "Önem seçin");
  fillSelect("system", SYSTEMS, "Sistem seçin");
  renderFormula();
  bind();
  render();
  showResult(state.events[0] || null);
  tickClock();
  window.setInterval(tickClock, 1000);
  if (loaded.warning) notify(loaded.warning, "warn");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
