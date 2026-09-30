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

// ===== 2. Сохранение =====

// Доступ к localStorage может быть запрещён (приватный режим, настройки браузера) —
// тогда страница просто работает без сохранения
function loadState() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  return readState(raw, STEPS.length, CHECKLIST.map((item) => item.id));
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Не получилось сохранить — не беда: всё работает до перезагрузки страницы
  }
}

// ===== 3. Страница =====

const state = loadState();

const TAB_ORDER = ["self", "withMe"];
const tabs = {
  self: document.getElementById("tab-self"),
  withMe: document.getElementById("tab-with-me"),
};
const panels = {
  self: document.getElementById("panel-self"),
  withMe: document.getElementById("panel-with-me"),
};

const stepProgress = document.getElementById("step-progress");
const stepTitle = document.getElementById("step-title");
const stepWhy = document.getElementById("step-why");
const stepScreens = document.getElementById("step-screens");
const stepNote = document.getElementById("step-note");
const stepFork = document.getElementById("step-fork");
const stepTerms = document.getElementById("step-terms");
const stepTermsList = document.getElementById("step-terms-list");
const stepWithMe = document.getElementById("step-with-me");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const stepHint = document.getElementById("step-hint");
const summaryTitle = document.getElementById("summary-title");
const checklistItems = document.getElementById("checklist-items");
const sendLink = document.getElementById("send-checklist");
const copyStatus = document.getElementById("copy-status");

// Выбран ли сейчас верный вариант в развилке — живёт, пока показан шаг, и не сохраняется
let forkSolved = false;

// Подпись над экраном: честно говорим, что это запись или пример
const SCREEN_CAPTIONS = {
  terminal: "Запись терминала, а не живой сервер",
  panel: "Пример панели хостинга",
  chat: "Пример переписки в Telegram",
};

// Создаёт элемент с классом и текстом — тексты только через textContent
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

// Терминал: приглашение и команда выделены, вывод — как есть
function renderTerminal(screen) {
  const pre = el("pre", "terminal");
  screen.lines.forEach((line, index) => {
    if (index > 0) {
      pre.append("\n");
    }
    const parts = splitPrompt(line);
    if (!parts) {
      pre.append(el("span", "terminal__output", line));
      return;
    }
    pre.append(el("span", "terminal__prompt", parts.prompt));
    if (parts.command) {
      pre.append(el("span", "terminal__command", ` ${parts.command}`));
    }
  });
  return pre;
}

function renderPanel(screen) {
  const panel = el("div", "host-panel");
  const rows = el("dl", "host-panel__rows");
  for (const [name, value] of screen.rows) {
    const row = el("div", "host-panel__row");
    row.append(el("dt", "", name), el("dd", "", value));
    rows.append(row);
  }
  panel.append(el("p", "host-panel__title", screen.title), rows);
  return panel;
}

function renderChat(screen) {
  const chat = el("div", "chat");
  for (const message of screen.messages) {
    chat.append(el("p", `chat__message chat__message--${message.from}`, message.text));
  }
  return chat;
}

const SCREEN_RENDERERS = { terminal: renderTerminal, panel: renderPanel, chat: renderChat };

// Экраны шага или варианта развилки: подпись и сам экран
function renderScreens(container, screens) {
  container.replaceChildren();
  for (const screen of screens) {
    const figure = el("figure", "screen");
    figure.append(el("figcaption", "screen__caption", SCREEN_CAPTIONS[screen.kind]), SCREEN_RENDERERS[screen.kind](screen));
    container.append(figure);
  }
}

function currentStep() {
  return STEPS[state.step];
}

// «Дальше» открыта, если развилки нет, шаг уже пройден или выбран верный вариант
function updateNav() {
  const open = !currentStep().fork || state.step < state.furthest || forkSolved;
  nextButton.disabled = !open;
  stepHint.hidden = open;
  prevButton.disabled = state.step === 0;
  nextButton.textContent = state.step === STEPS.length - 1 ? "К итогу ↓" : "Дальше →";
}

// Выбор варианта: вердикт, экраны варианта и объяснение. Выбор можно менять сколько угодно
function chooseOption(option, button, options, result) {
  for (const other of options.children) {
    other.setAttribute("aria-pressed", String(other === button));
  }
  result.replaceChildren();
  const verdictClass = option.correct ? "fork__verdict fork__verdict--correct" : "fork__verdict";
  result.append(el("p", verdictClass, option.correct ? "Верно" : "Так не выйдет"));
  if (option.screens) {
    const screens = el("div", "screens");
    renderScreens(screens, option.screens);
    result.append(screens);
  }
  result.append(el("p", "fork__text", option.result));
  forkSolved = option.correct;
  updateNav();
}

// Развилка: вопрос, варианты-кнопки и область результата, которую озвучивает экранный диктор
function renderFork(step, passed) {
  stepFork.replaceChildren();
  stepFork.hidden = !step.fork;
  if (!step.fork) {
    return;
  }
  const options = el("div", "fork__options");
  const result = el("div", "fork__result");
  result.setAttribute("aria-live", "polite");
  for (const option of step.fork.options) {
    const button = el("button", "fork__option", option.text);
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => chooseOption(option, button, options, result));
    options.append(button);
  }
  stepFork.append(el("h3", "fork__question", step.fork.question), options, result);
  // Пройденный шаг показываем сразу с верным ответом
  if (passed) {
    const index = step.fork.options.findIndex((option) => option.correct);
    chooseOption(step.fork.options[index], options.children[index], options, result);
  }
}

function renderStep() {
  const step = currentStep();
  forkSolved = false;
  stepProgress.textContent = `Шаг ${state.step + 1} из ${STEPS.length}`;
  stepTitle.textContent = step.title;
  stepWhy.textContent = step.why;
  renderScreens(stepScreens, step.screens);
  stepScreens.hidden = step.screens.length === 0;
  stepNote.textContent = step.note || "";
  stepNote.hidden = !step.note;
  renderFork(step, state.step < state.furthest);
  stepTermsList.replaceChildren();
  for (const term of step.terms) {
    stepTermsList.append(el("dt", "", term.word), el("dd", "", term.meaning));
  }
  stepTerms.hidden = step.terms.length === 0;
  stepWithMe.textContent = step.withMe;
  updateNav();
}

// Фокус на заголовок без рывка, потом прокрутка к нему: на телефоне иначе новый шаг
// начинается где-то внизу экрана (тот же приём, что в диагностике)
function focusHeading(heading) {
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: "start" });
}

function goToStep(index) {
  state.step = index;
  saveState(state);
  renderStep();
  focusHeading(stepTitle);
}

nextButton.addEventListener("click", () => {
  state.furthest = Math.max(state.furthest, state.step + 1);
  if (state.step === STEPS.length - 1) {
    saveState(state);
    focusHeading(summaryTitle);
    return;
  }
  goToStep(state.step + 1);
});

prevButton.addEventListener("click", () => {
  if (state.step > 0) {
    goToStep(state.step - 1);
  }
});

// Начать сначала: развилки снова закрыты, а отметки чеклиста — про проект человека, их не трогаем
document.getElementById("restart").addEventListener("click", () => {
  state.furthest = 0;
  goToStep(0);
});

// Вкладки: шаг при переключении не сбрасывается
function selectTab(name) {
  state.tab = name;
  for (const key of TAB_ORDER) {
    const selected = key === name;
    tabs[key].setAttribute("aria-selected", String(selected));
    tabs[key].tabIndex = selected ? 0 : -1;
    panels[key].hidden = !selected;
  }
  saveState(state);
}

// Стрелки, Home и End — как у вкладок в операционной системе
function tabFromKey(key, current) {
  const index = TAB_ORDER.indexOf(current);
  if (key === "ArrowRight") {
    return TAB_ORDER[(index + 1) % TAB_ORDER.length];
  }
  if (key === "ArrowLeft") {
    return TAB_ORDER[(index - 1 + TAB_ORDER.length) % TAB_ORDER.length];
  }
  if (key === "Home") {
    return TAB_ORDER[0];
  }
  if (key === "End") {
    return TAB_ORDER[TAB_ORDER.length - 1];
  }
  return null;
}

for (const key of TAB_ORDER) {
  tabs[key].addEventListener("click", () => selectTab(key));
  tabs[key].addEventListener("keydown", (event) => {
    const next = tabFromKey(event.key, key);
    if (next) {
      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    }
  });
}

// Вкладка «Со мной»: карточки из WITH_ME и число шагов, которые беру на себя
function renderWithMe() {
  const list = document.getElementById("with-me-steps");
  for (const step of WITH_ME) {
    const item = el("li", "card step");
    item.append(el("h3", "", step.title), el("p", "", step.text));
    list.append(item);
  }
  document.getElementById("with-me-total").textContent = `Все ${STEPS.length} шагов из режима «Сам» делаю я.`;
}

// Таблица сравнения: числа только из compare()
function renderCompare() {
  const numbers = compare(STEPS, WITH_ME);
  const rows = [
    ["Шагов", "steps"],
    ["Новых слов", "terms"],
    ["Развилок, где можно ошибиться", "forks"],
  ];
  const body = document.getElementById("compare-body");
  for (const [label, key] of rows) {
    const row = el("tr");
    const head = el("th", "", label);
    head.scope = "row";
    row.append(head, el("td", "", String(numbers.self[key])), el("td", "", String(numbers.withMe[key])));
    body.append(row);
  }
}

// Ссылка «Отправить чеклист» пересобирается при каждой отметке
function updateSendLink() {
  sendLink.setAttribute("href", formLink(checklistToFormText(CHECKLIST, state.has)));
}

function renderChecklist() {
  for (const item of CHECKLIST) {
    const box = el("input", "checklist__box");
    box.type = "checkbox";
    box.value = item.id;
    box.checked = state.has.includes(item.id);
    box.addEventListener("change", () => {
      // Отметки берём со страницы: там они уже в порядке CHECKLIST
      state.has = [...checklistItems.querySelectorAll("input:checked")].map((input) => input.value);
      saveState(state);
      updateSendLink();
    });
    const label = el("label", "checklist__item");
    label.append(box, el("span", "", item.text));
    const li = el("li");
    li.append(label);
    checklistItems.append(li);
  }
}

document.getElementById("copy-checklist").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(checklistToCopyText(CHECKLIST, state.has));
    copyStatus.textContent = "Чеклист скопирован.";
  } catch {
    // Нет navigator.clipboard (старый браузер) или браузер не дал доступ к буферу
    copyStatus.textContent = "Не получилось скопировать. Выделите список и скопируйте вручную.";
  }
});

document.getElementById("print-checklist").addEventListener("click", () => {
  window.print();
});

renderWithMe();
renderCompare();
renderChecklist();
updateSendLink();
selectTab(state.tab);
renderStep();
