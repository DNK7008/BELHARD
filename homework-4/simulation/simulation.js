// Демо «Сам или со мной»: симуляция запуска Telegram-бота.
// Данные сценария — в scenario.js (STEPS, WITH_ME, CHECKLIST), он подключён раньше.
// Три раздела: 1 — подсчёты и тексты (чистые функции, их проверяют в node),
// 2 — сохранение в браузере, 3 — страница.

// ===== 1. Подсчёты и тексты =====

// Ключ в localStorage: вкладка, шаг и отметки чеклиста — ни кода, ни ключей тут нет
const STORAGE_KEY = "zapushchu-simulation";

// Шаги, разные новые слова и развилки одного пути
function countPath(steps) {
  const words = new Set();
  for (const step of steps) {
    for (const term of step.terms) {
      words.add(term.word.toLowerCase());
    }
  }
  return {
    steps: steps.length,
    terms: words.size,
    forks: steps.filter((step) => step.fork).length,
  };
}

// Сравнение путей для таблицы в итоге. Числа считаются по самим данным:
// поправишь сценарий — таблица поправится сама, выдумать число нельзя
function compare(steps, withMe) {
  return { self: countPath(steps), withMe: countPath(withMe) };
}

// Подписи пунктов через запятую; пустой список — «ничего из списка»
function listShorts(items) {
  if (items.length === 0) {
    return "ничего из списка";
  }
  return items.map((item) => item.short).join(", ");
}

// Текст для поля «Что за проект»: что у проекта уже есть и чего нет или человек не знает.
// Самый длинный вариант — около 300 символов, лимиты поля и адреса ему не грозят
function checklistToFormText(checklist, has) {
  const done = checklist.filter((item) => has.includes(item.id));
  const missing = checklist.filter((item) => !has.includes(item.id));
  return [
    "Чеклист запуска из демо «Сам или со мной».",
    `Уже есть: ${listShorts(done)}.`,
    `Нет или не знаю: ${listShorts(missing)}.`,
  ].join("\n");
}

// Ссылка на форму лендинга: script.js лендинга подставит текст в поле «Что за проект»
function formLink(text) {
  return `../index.html?project=${encodeURIComponent(text)}#form`;
}

// Текст для копирования: [x] у того, что уже есть, [ ] у остального
function checklistToCopyText(checklist, has) {
  const lines = checklist.map((item) => `${has.includes(item.id) ? "[x]" : "[ ]"} ${item.text}`);
  return ["Что должно быть у запущенного проекта", ...lines].join("\n");
}

// Приглашение командной строки: PowerShell на компьютере человека или сервер.
// После приглашения — пробел и команда или конец строки
const PROMPT_PATTERN = /^(PS [^>]*>|root@vps:[^#]*#)(?: (.*))?$/;

// Делит строку терминала на приглашение и команду; для строки вывода — null
function splitPrompt(line) {
  const match = line.match(PROMPT_PATTERN);
  if (!match) {
    return null;
  }
  return { prompt: match[1], command: match[2] || "" };
}

// Целое число в границах [min, max] или null
function intInRange(value, min, max) {
  if (Number.isInteger(value) && value >= min && value <= max) {
    return value;
  }
  return null;
}

// Превращает сохранённую строку в состояние. Хранилище мог испортить кто угодно
// (или его оставила старая версия сценария), поэтому каждое поле проверяется,
// а всё непонятное заменяется значением по умолчанию
function readState(raw, stepCount, checklistIds) {
  const state = { tab: "self", step: 0, furthest: 0, has: [] };
  let saved = null;
  try {
    saved = JSON.parse(raw);
  } catch {
    return state;
  }
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    return state;
  }
  if (saved.tab === "self" || saved.tab === "withMe") {
    state.tab = saved.tab;
  }
  state.furthest = intInRange(saved.furthest, 0, stepCount) ?? 0;
  const step = intInRange(saved.step, 0, stepCount - 1) ?? 0;
  // Дальше непройденного шага попасть нельзя
  state.step = Math.min(step, state.furthest, stepCount - 1);
  if (Array.isArray(saved.has)) {
    state.has = checklistIds.filter((id) => saved.has.includes(id));
  }
  return state;
}
