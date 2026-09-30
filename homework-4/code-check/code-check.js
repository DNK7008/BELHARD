// Проверка кода «Запущу»: правила ищут в коде типовые проблемы запуска.
// Всё происходит в браузере — CSP в <head> запрещает странице любые сетевые запросы.

// ===== 1. Правила =====
// Тип проекта: берётся первый тип из списка, который нашёлся хотя бы в одном источнике.
// names — как назвать фреймворк из первой скобки шаблона.
const PROJECT_TYPES = [
  {
    id: "bot",
    label: "Telegram-бот",
    pattern: /\b(?:aiogram|telebot|telegraf|grammy)\b|telegram\.ext|\bfrom\s+telegram\s+import\b|node-telegram-bot-api/i,
    server: true,
    web: false,
  },
  {
    id: "python-web",
    label: "Веб-приложение на Python",
    pattern: /\b(?:from|import)\s+(flask|fastapi|django)\b/i,
    names: { flask: "Flask", fastapi: "FastAPI", django: "Django" },
    server: true,
    web: true,
  },
  {
    id: "streamlit",
    label: "Веб-приложение на Streamlit",
    pattern: /\bimport\s+streamlit\b/,
    server: true,
    web: true,
  },
  {
    id: "node-server",
    label: "Сервер на Node.js",
    pattern: /require\(\s*["'](?:express|http)["']\s*\)|\bfrom\s+["']express["']|\bcreateServer\s*\(/,
    server: true,
    web: true,
  },
  {
    id: "static",
    label: "Обычная страница из HTML, CSS и JavaScript",
    pattern: /<!doctype\s+html|<html[\s>]/i,
    server: false,
    web: true,
  },
  {
    id: "python-script",
    label: "Скрипт на Python",
    // «import X» без «from "…"» дальше по строке: import React from "react" — это JavaScript
    pattern: /^\s*(?:import\s+\w+(?!.*\bfrom\s*["'])|from\s+[\w.]+\s+import\b|def\s+\w+\s*\()/m,
    server: true,
    web: false,
  },
  {
    id: "js-code",
    label: "Код на JavaScript",
    pattern: /\bfunction\s+\w+\s*\(|\b(?:const|let)\s+\w+\s*=|=>|^\s*import\s.*\bfrom\s*["']/m,
    server: false,
    web: false,
  },
];

const UNKNOWN_TYPE = {
  id: "unknown",
  label: "Не удалось определить — посмотрю при оценке",
  server: false,
  web: false,
};

// Что мешает запуску. Порядок правил — порядок в отчёте.
// secret: true — правило про ключи и пароли: не срабатывает в .env (там им и место),
// и на одной строке срабатывает только первое такое правило.
// mask — как спрятать найденное в показанной строке.
const PROBLEM_RULES = [
  {
    id: "telegram-token",
    title: "Токен Telegram-бота в коде",
    looksFor: "строку вида 123456789:AA… — так выглядит токен бота",
    text: "Кто увидит код, тот получит полное управление ботом. Токен хранят отдельно от кода, а этот стоит перевыпустить у @BotFather.",
    // Перед токеном — не цифра (в адресе API он идёт сразу после «bot»), после — не буква и не «-»
    pattern: /(?:^|\D)(\d{8,10}:[A-Za-z0-9_-]{35})(?![\w-])/,
    secret: true,
    mask: (match, token) => match.replace(token, hide(token)),
  },
  {
    id: "openai-key",
    title: "Ключ OpenAI в коде",
    looksFor: "строку, которая начинается с sk- — так выглядит ключ OpenAI",
    text: "По этому ключу с вашего счёта в OpenAI могут тратить деньги. Попавший в код ключ отзывают и выпускают новый.",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}/,
    secret: true,
    mask: (match) => hide(match),
  },
  {
    id: "url-password",
    title: "Пароль в адресе подключения",
    looksFor: "адреса вида postgres://имя:пароль@сервер",
    text: "Пароль от базы спрятан внутри адреса подключения — и виден каждому, у кого есть код.",
    // Имя может быть пустым (redis://:пароль@…); схема не длиннее 31 символа — иначе шаблон
    // перебирает слишком много вариантов на длинных строках
    pattern: /\b[a-z][a-z0-9+.-]{0,30}:\/\/[^\s:/@"']*:([^\s@/"']+)@/i,
    secret: true,
    mask: (match, password) => match.replace(`:${password}@`, `:${hide(password)}@`),
  },
  {
    id: "secret-assignment",
    title: "Пароль или ключ прямо в коде",
    looksFor: "присваивания вида password = \"…\", api_key = \"…\", BOT_TOKEN = \"…\"",
    text: "Пароли и ключи в коде видит каждый, у кого есть файл или доступ к репозиторию. Их хранят на сервере отдельно от кода.",
    // ["']?\]? — чтобы находить и app.config["SECRET_KEY"] = "…"
    pattern: /\b\w*(?:password|passwd|pwd|secret|api_?key|apikey|access_?key|token)\w*["']?\]?\s*[:=]\s*["'](?!https?:|your|ваш|<)([^"'\s]{6,})["']/i,
    secret: true,
    mask: (match, value) => match.replace(value, hide(value)),
  },
  {
    id: "debug-mode",
    title: "Включён режим отладки",
    looksFor: "debug=True и DEBUG = True",
    text: "При ошибке сайт покажет посетителю куски кода и настройки. На сервере отладку выключают.",
    pattern: /\bdebug\s*=\s*True\b/i,
  },
  {
    id: "localhost",
    title: "Адрес «этого компьютера»",
    looksFor: "localhost и 127.0.0.1",
    text: "Так программа обращается к компьютеру, на котором сама запущена. После переезда на сервер такой адрес часто указывает не туда — например, страница начнёт искать сервер на компьютере посетителя. Проверю каждое такое место.",
    pattern: /\b(?:localhost|127\.0\.0\.1)\b/i,
  },
  {
    id: "sql-concat",
    title: "Запрос к базе склеивается из текста",
    looksFor: "execute(f\"…\"), склейку запроса через + или %, query(`…${…}`)",
    text: "Если в запрос попадёт текст посетителя, через поле формы можно прочитать или стереть всю базу. Это классическая дыра — SQL-инъекция.",
    // Варианты: f-строка прямо в execute(); склейка через %, + или .format() внутри execute()/query();
    // шаблон JS в query(); f-строка или шаблон JS с SQL, собранные отдельно от вызова
    pattern: /\b(?:execute|executemany|query|raw)\s*\(\s*f["']|\b(?:execute|query)\s*\([^\n]*["']\s*(?:%|\+|\.format\()|\bquery\s*\(\s*`[^`]*\$\{|\bf["']\s*(?:SELECT|INSERT|UPDATE|DELETE)\b[^"'\n]*\{|`\s*(?:SELECT|INSERT|UPDATE|DELETE)\b[^`]*\$\{/,
  },
  {
    id: "eval-exec",
    title: "Текст выполняется как код",
    looksFor: "eval( и exec( — но не .exec( из JavaScript",
    text: "Если в этот текст попадёт ввод посетителя, он сможет выполнить на сервере что угодно.",
    pattern: /(?:^|[^.\w])(?:eval|exec)\s*\(/,
  },
];

// Что понадобится. Порядок ключей — порядок в отчёте; одна потребность показывается один раз.
const NEEDS = {
  server: {
    title: "Сервер",
    text: "Компьютер в дата-центре, который не выключается: программа работает круглосуточно, даже когда ваш ноутбук закрыт.",
  },
  "free-hosting": {
    title: "Бесплатный хостинг",
    text: "Сервер не нужен: такую страницу можно разместить бесплатно.",
  },
  domain: {
    title: "Домен и SSL-сертификат",
    text: "Адрес вида вашпроект.by и замочек в адресной строке: данные посетителей шифруются.",
  },
  autostart: {
    title: "Автозапуск",
    text: "Программа работает без остановки — сервер сам поднимет её после сбоя или перезагрузки.",
  },
  backups: {
    title: "База данных и резервные копии",
    text: "Программа хранит данные в файле или базе. Без резервных копий одна поломка сотрёт всё.",
  },
  keys: {
    title: "Надёжное место для ключей",
    text: "Программа обращается к платным сервисам. Ключи от них хранятся на сервере отдельно от кода.",
  },
  env: {
    title: "Ключи отдельно от кода",
    text: "Файл .env — правильное место для ключей, поэтому правила про ключи в нём не срабатывают. Но его нельзя пересылать вместе с кодом и выкладывать на GitHub: ключи я попрошу отдельно.",
  },
};

// Правила ищут по всему тексту источника. serverOnly — не применяются к обычной странице:
// setInterval в браузере или port в ссылке не делают её серверной программой.
const NEED_RULES = [
  {
    id: "runs-forever",
    need: "autostart",
    title: "Работает без остановки",
    looksFor: "while True, start_polling, infinity_polling, setInterval, schedule.every",
    pattern: /\bwhile\s+True\b|\b(?:start_polling|run_polling|infinity_polling)\b|\.polling\s*\(|\bsetInterval\s*\(|\bschedule\.every\b|\bbot\.launch\s*\(/,
    serverOnly: true,
  },
  {
    id: "stores-data",
    need: "backups",
    title: "Хранит данные",
    looksFor: "sqlite3, файлы .db, json.dump, запись в файл, CREATE TABLE",
    pattern: /\bsqlite3?\b|\.(?:db|sqlite3?)["']|\bjson\.dump\b|\bopen\s*\([^)]*["'][wa]\+?b?["']|\bwriteFile(?:Sync)?\s*\(|\bCREATE\s+TABLE\b|\b(?:psycopg2?|pymysql|pymongo|mongoose)\b/i,
  },
  {
    id: "paid-api",
    need: "keys",
    title: "Платные сервисы",
    looksFor: "openai, anthropic, stripe, yookassa и другие платные сервисы",
    pattern: /\b(?:openai|anthropic|stripe|yookassa|paypal|twilio|sendgrid)\b/i,
  },
  {
    id: "listens-port",
    need: "domain",
    title: "Ждёт посетителей на порту",
    looksFor: "port=5000, .listen(3000)",
    pattern: /\bport\s*[=:]\s*\d{2,5}\b|\.listen\s*\(\s*\d{2,5}/i,
    serverOnly: true,
  },
];

// ===== 2. Анализ =====
// Функции этого раздела не трогают страницу — их можно вызвать из консоли браузера.
// Источник — { name, text }: вставленный код или прочитанный файл.
const PASTED_NAME = "вставленный код";
const MAX_SNIPPET = 120;
const MAX_PLACES_IN_TEXT = 5;
const MAX_SKIPPED_IN_TEXT = 5;
const MAX_SOURCES_IN_TEXT = 5; // двадцать длинных имён файлов заняли бы всё поле формы
const MAX_TEXT_LENGTH = 2000; // maxlength поля «Что за проект» на лендинге
// Длина текста в адресе ссылки. GitHub Pages отвечает ошибкой 414 на адреса длиннее ~8 КБ,
// а русская буква в адресе занимает 6 символов (%D0%BF) — 2000 букв не влезли бы.
const MAX_URL_TEXT = 6000;
const MAX_NAME_IN_TEXT = 40;

// Прячет найденный ключ: оставляет первые 3 символа, чтобы было понятно, о каком ключе речь
function hide(value) {
  return `${value.slice(0, 3)}…`;
}

// Прячет в строке все ключи и пароли — какое бы правило ни нашло эту строку
function maskSecrets(line) {
  let masked = line;
  for (const rule of PROBLEM_RULES) {
    if (rule.mask) {
      // Флаг g — чтобы спрятать все ключи в строке, а не только первый
      const everywhere = new RegExp(rule.pattern.source, `${rule.pattern.flags}g`);
      masked = masked.replace(everywhere, rule.mask);
    }
  }
  return masked;
}

// .env, .env.local, .env.production — файлы, где ключам и место
function isEnvFile(name) {
  return /(^|[\\/])\.env(\.[\w.-]+)?$/i.test(name);
}

// Делит текст на строки; пустая строка после последнего перевода строки не считается
function splitLines(text) {
  const lines = text.split(/\r?\n/);
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

function countLines(text) {
  return splitLines(text).length;
}

// Русское множественное число: 1 строка, 2 строки, 5 строк, 11 строк, 21 строка
function plural(n, one, few, many) {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }
  if (last === 1) {
    return one;
  }
  if (last >= 2 && last <= 4) {
    return few;
  }
  return many;
}

// Тип проекта по первому совпадению в PROJECT_TYPES. Файлы .env в этом не участвуют.
function detectType(sources) {
  const codeSources = sources.filter((source) => !isEnvFile(source.name));
  for (const type of PROJECT_TYPES) {
    for (const source of codeSources) {
      const match = source.text.match(type.pattern);
      if (match) {
        const label = type.names ? `${type.label} (${type.names[match[1].toLowerCase()]})` : type.label;
        return { id: type.id, label, server: type.server, web: type.web };
      }
    }
  }
  return UNKNOWN_TYPE;
}

// Строка кода для отчёта: без ключей, без отступов и не длиннее MAX_SNIPPET символов
function snippetOf(line) {
  const snippet = maskSecrets(line).trim();
  return snippet.length > MAX_SNIPPET ? `${snippet.slice(0, MAX_SNIPPET)}…` : snippet;
}

// Главная функция: источники → отчёт
function analyze(sources, skipped = []) {
  const type = detectType(sources);
  const places = PROBLEM_RULES.map(() => []); // по списку мест на каждое правило
  let lineCount = 0;

  for (const source of sources) {
    const isEnv = isEnvFile(source.name);
    splitLines(source.text).forEach((line, index) => {
      lineCount += 1;
      let secretFound = false; // на строке срабатывает только одно правило про ключи
      PROBLEM_RULES.forEach((rule, ruleIndex) => {
        if (rule.secret && (isEnv || secretFound)) {
          return;
        }
        if (rule.pattern.test(line)) {
          places[ruleIndex].push({ source: source.name, line: index + 1, snippet: snippetOf(line) });
          if (rule.secret) {
            secretFound = true;
          }
        }
      });
    });
  }

  const problems = PROBLEM_RULES
    .map((rule, ruleIndex) => ({ id: rule.id, title: rule.title, text: rule.text, places: places[ruleIndex] }))
    .filter((problem) => problem.places.length > 0);

  // Потребности собираем во множество, а в отчёт выводим в порядке каталога NEEDS
  const needIds = new Set();
  if (type.server) {
    needIds.add("server");
  }
  if (type.id === "static") {
    needIds.add("free-hosting");
  }
  if (type.web) {
    needIds.add("domain");
  }
  for (const rule of NEED_RULES) {
    if (rule.serverOnly && type.id === "static") {
      continue;
    }
    if (sources.some((source) => rule.pattern.test(source.text))) {
      needIds.add(rule.need);
    }
  }
  if (sources.some((source) => isEnvFile(source.name))) {
    needIds.add("env");
  }
  const needs = Object.keys(NEEDS)
    .filter((id) => needIds.has(id))
    .map((id) => ({ id, title: NEEDS[id].title, text: NEEDS[id].text }));

  return {
    type: { id: type.id, label: type.label },
    sourceNames: sources.map((source) => source.name),
    lineCount,
    multipleSources: sources.length > 1,
    problems,
    needs,
    skipped,
  };
}

// Подпись места: «строка 8» или «bot.py, строка 8», если источников несколько
function placeLabel(place, multipleSources) {
  return multipleSources ? `${place.source}, строка ${place.line}` : `строка ${place.line}`;
}

// «Проверено: вставленный код — 37 строк» (точку на странице ставит отрисовка).
// maxNames — сколько имён показать; остальные сворачиваются в «и ещё N».
function summaryText(report, maxNames = report.sourceNames.length) {
  const shown = report.sourceNames.slice(0, maxNames).join(", ");
  const rest = report.sourceNames.length - maxNames;
  const names = rest > 0 ? `${shown} и ещё ${rest}` : shown;
  const lines = plural(report.lineCount, "строка", "строки", "строк");
  return `Проверено: ${names} — ${report.lineCount} ${lines}`;
}

// Первые limit элементов через «; » и хвост «; и ещё N»
function joinLimited(items, limit) {
  const shown = items.slice(0, limit).join("; ");
  const rest = items.length - limit;
  return rest > 0 ? `${shown}; и ещё ${rest}` : shown;
}

// Длинное имя файла для текста формы: начало, «…» и конец — чтобы осталось расширение
function shortName(name) {
  if (name.length <= MAX_NAME_IN_TEXT) {
    return name;
  }
  return `${name.slice(0, 26)}…${name.slice(-13)}`;
}

// Текст для поля «Что за проект» в форме заявки. Кода и показанных строк в нём нет:
// только заголовки находок и места — ключ не уйдёт в заявку даже замаскированным.
function reportToText(report) {
  // Имена файлов укорачиваем: текст должен влезть и в поле формы, и в адрес ссылки
  const shortReport = { ...report, sourceNames: report.sourceNames.map(shortName) };
  const head = ["Отчёт проверки кода на сайте", `Проект: ${report.type.label}`, summaryText(shortReport, MAX_SOURCES_IN_TEXT), ""];
  const problemLines = report.problems.map((problem) => {
    const labels = problem.places.map((place) => placeLabel({ ...place, source: shortName(place.source) }, report.multipleSources));
    return `- ${problem.title}: ${joinLimited(labels, MAX_PLACES_IN_TEXT)}`;
  });
  const needsLine = report.needs.length > 0
    ? `Понадобится: ${report.needs.map((need) => need.title).join("; ")}`
    : "Понадобится: скажу после оценки";
  const tail = ["", needsLine];
  if (report.skipped.length > 0) {
    const skippedNames = report.skipped.map((file) => `${shortName(file.name)} (${file.reason})`);
    tail.push(`Пропущено: ${joinLimited(skippedNames, MAX_SKIPPED_IN_TEXT)}`);
  }

  // Собирает текст из первых count строк про находки; остальные сворачивает в «…и ещё N»
  const build = (count) => {
    if (report.problems.length === 0) {
      return [...head, "Мешает запуску: явных проблем не нашёл", ...tail].join("\n");
    }
    const hidden = problemLines.length - count;
    const more = hidden > 0 ? [`…и ещё ${hidden} ${plural(hidden, "находка", "находки", "находок")}`] : [];
    return [...head, "Мешает запуску:", ...problemLines.slice(0, count), ...more, ...tail].join("\n");
  };

  // Текст должен влезть и в поле формы, и в адрес ссылки — убираем находки с конца, пока не влезет
  const tooLong = (value) => value.length > MAX_TEXT_LENGTH || encodeURIComponent(value).length > MAX_URL_TEXT;
  let count = problemLines.length;
  let text = build(count);
  while (tooLong(text) && count > 0) {
    count -= 1;
    text = build(count);
  }
  return text;
}

// ===== 3. Чтение файлов =====
const MAX_FILES = 20;
const MAX_FILE_SIZE = 1024 * 1024; // 1 МБ

// Читает выбранные файлы по очереди. Возвращает источники и пропущенные файлы с причиной.
async function readFiles(fileList) {
  const sources = [];
  const skipped = [];
  const files = [...fileList];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (index >= MAX_FILES) {
      skipped.push({ name: file.name, reason: "больше 20 файлов" });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      skipped.push({ name: file.name, reason: "больше 1 МБ" });
      continue;
    }
    const text = await file.text();
    // В тексте нулевого символа не бывает — так выглядят картинки, архивы и PDF
    if (text.includes("\u0000")) {
      skipped.push({ name: file.name, reason: "не текстовый файл" });
      continue;
    }
    sources.push({ name: file.name, text });
  }
  return { sources, skipped };
}

// ===== 4. Страница =====
const MAX_PLACES_SHOWN = 10;

const MESSAGES = {
  empty: "Вставьте код или выберите файлы.",
  allSkipped: "Нечего проверять: все выбранные файлы пропущены — не текстовые или больше 1 МБ.",
};

const checker = document.getElementById("checker");
const codeField = document.getElementById("code");
const filesField = document.getElementById("files");
const statusLine = document.getElementById("check-status");
const reportSection = document.getElementById("report");
const reportTitle = document.getElementById("report-title");
const reportSummary = document.getElementById("report-summary");
const reportBody = document.getElementById("report-body");
const rulesList = document.getElementById("rules-list");
const sendLink = document.getElementById("send-report");
const clearButton = document.getElementById("clear");
const checkAnotherButton = document.getElementById("check-another");

// Создаёт элемент. Текст — через textContent, чтобы он никогда не превратился в разметку.
function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text) {
    node.textContent = text;
  }
  return node;
}

// Список «Что я проверял» — из тех же таблиц, по которым идёт проверка
function renderRulesList() {
  rulesList.append(createNode("li", "", "Тип проекта — по импортам и разметке: aiogram, flask, express, <html> и другие"));
  for (const rule of [...PROBLEM_RULES, ...NEED_RULES]) {
    const item = createNode("li");
    item.append(createNode("strong", "", rule.title), ` — ищу ${rule.looksFor}`);
    rulesList.append(item);
  }
  rulesList.append(createNode("li", "", "Файл .env — правила про ключи в нём не срабатывают"));
}

// Блок отчёта с заголовком
function createBlock(title) {
  const block = createNode("div", "report__block");
  block.append(createNode("h3", "", title));
  return block;
}

// Карточки: заголовок и текст, у проблем — ещё список мест
function createCards(items, fillCard) {
  const list = createNode("ul", "cards");
  for (const item of items) {
    const card = createNode("li", "card");
    card.append(createNode("h4", "", item.title), createNode("p", "", item.text));
    fillCard(card, item);
    list.append(card);
  }
  return list;
}

function renderReport(report) {
  reportSummary.textContent = `${summaryText(report)}.`;
  reportBody.replaceChildren();

  const typeBlock = createBlock("Что это за проект");
  typeBlock.append(createNode("p", "report__type", report.type.label));

  const problemsBlock = createBlock("Что мешает запуску");
  if (report.problems.length === 0) {
    problemsBlock.append(createNode("p", "report__ok", "Явных проблем не нашёл. Это не значит, что их нет: проверка ищет только типовые ошибки из списка ниже."));
  } else {
    problemsBlock.append(createCards(report.problems, (card, problem) => {
      const placesList = createNode("ul", "places");
      for (const place of problem.places.slice(0, MAX_PLACES_SHOWN)) {
        const item = createNode("li");
        // Пробел между подписью и кодом не виден (подпись — отдельной строкой), но без него
        // скринридер и копирование склеят «строка 8» с кодом
        item.append(
          createNode("span", "place__label", placeLabel(place, report.multipleSources)),
          " ",
          createNode("code", "", place.snippet)
        );
        placesList.append(item);
      }
      const rest = problem.places.length - MAX_PLACES_SHOWN;
      if (rest > 0) {
        placesList.append(createNode("li", "", `…и ещё ${rest}`));
      }
      card.append(placesList);
    }));
  }

  const needsBlock = createBlock("Что понадобится");
  if (report.needs.length === 0) {
    needsBlock.append(createNode("p", "", "По этому коду не понять, что понадобится для запуска, — скажу после оценки."));
  } else {
    needsBlock.append(createCards(report.needs, () => {}));
  }

  reportBody.append(typeBlock, problemsBlock, needsBlock);

  if (report.skipped.length > 0) {
    const skippedBlock = createBlock("Пропущенные файлы");
    const list = createNode("ul", "skipped");
    for (const file of report.skipped) {
      list.append(createNode("li", "", `${file.name} — ${file.reason}`));
    }
    skippedBlock.append(list);
    reportBody.append(skippedBlock);
  }

  // Отчёт уходит в форму лендинга через адрес ссылки — без кода и без ключей
  sendLink.href = `../index.html?project=${encodeURIComponent(reportToText(report))}#form`;
}

function showStatus(text) {
  statusLine.textContent = text;
}

// Проверка: собрать источники, прочитать файлы, посчитать и показать отчёт
async function runCheck() {
  showStatus("");
  const sources = [];
  if (codeField.value.trim() !== "") {
    sources.push({ name: PASTED_NAME, text: codeField.value });
  }
  const files = await readFiles(filesField.files);
  sources.push(...files.sources);

  if (sources.length === 0) {
    reportSection.hidden = true;
    showStatus(files.skipped.length > 0 ? MESSAGES.allSkipped : MESSAGES.empty);
    return;
  }

  renderReport(analyze(sources, files.skipped));
  reportSection.hidden = false;
  // Сам focus() не прокручивает страницу, если заголовок виден краешком внизу (урок демо 1),
  // поэтому фокус ставим без прокрутки, а к отчёту прокручиваем явно
  reportTitle.focus({ preventScroll: true });
  reportTitle.scrollIntoView({ block: "start" });
}

// Код изменился — старый отчёт больше не про этот код: прячем, чтобы его нельзя было отправить
function forgetReport() {
  if (!reportSection.hidden) {
    reportSection.hidden = true;
    showStatus("");
  }
}

function clearAll() {
  checker.reset(); // стирает и поле кода, и выбранные файлы
  reportSection.hidden = true;
  showStatus("");
  codeField.focus();
}

checker.addEventListener("submit", (event) => {
  event.preventDefault();
  runCheck();
});

// Пример: подставляем код, сбрасываем выбранные файлы и сразу проверяем
for (const button of document.querySelectorAll("[data-example]")) {
  button.addEventListener("click", () => {
    codeField.value = EXAMPLES[button.dataset.example];
    filesField.value = "";
    runCheck();
  });
}

codeField.addEventListener("input", forgetReport);
filesField.addEventListener("change", forgetReport);
clearButton.addEventListener("click", clearAll);
checkAnotherButton.addEventListener("click", clearAll);

renderRulesList();
