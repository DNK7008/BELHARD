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
    pattern: /^\s*(?:import\s+\w+|from\s+[\w.]+\s+import\b|def\s+\w+\s*\()/m,
    server: true,
    web: false,
  },
  {
    id: "js-code",
    label: "Код на JavaScript",
    pattern: /\bfunction\s+\w+\s*\(|\b(?:const|let)\s+\w+\s*=|=>/,
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
    pattern: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/,
    secret: true,
    mask: (match) => hide(match),
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
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@"']+:([^\s@/"']+)@/i,
    secret: true,
    mask: (match, password) => match.replace(`:${password}@`, `:${hide(password)}@`),
  },
  {
    id: "secret-assignment",
    title: "Пароль или ключ прямо в коде",
    looksFor: "присваивания вида password = \"…\", api_key = \"…\", BOT_TOKEN = \"…\"",
    text: "Пароли и ключи в коде видит каждый, у кого есть файл или доступ к репозиторию. Их хранят на сервере отдельно от кода.",
    pattern: /\b\w*(?:password|passwd|pwd|secret|api_?key|apikey|access_?key|token)\w*["']?\s*[:=]\s*["'](?!https?:|your|ваш|<)([^"'\s]{6,})["']/i,
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
    pattern: /\b(?:execute|executemany|query|raw)\s*\(\s*f["']|\b(?:execute|query)\s*\(\s*["'][^"']*["']\s*(?:%|\+|\.format\()|\bquery\s*\(\s*`[^`]*\$\{/,
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

// Текст для поля «Что за проект» в форме заявки. Кода и показанных строк в нём нет:
// только заголовки находок и места — ключ не уйдёт в заявку даже замаскированным.
function reportToText(report) {
  const head = ["Отчёт проверки кода на сайте", `Проект: ${report.type.label}`, summaryText(report, MAX_SOURCES_IN_TEXT), ""];
  const problemLines = report.problems.map((problem) => {
    const labels = problem.places.map((place) => placeLabel(place, report.multipleSources));
    return `- ${problem.title}: ${joinLimited(labels, MAX_PLACES_IN_TEXT)}`;
  });
  const needsLine = report.needs.length > 0
    ? `Понадобится: ${report.needs.map((need) => need.title).join("; ")}`
    : "Понадобится: скажу после оценки";
  const tail = ["", needsLine];
  if (report.skipped.length > 0) {
    const skippedNames = report.skipped.map((file) => `${file.name} (${file.reason})`);
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

  // Поле формы вмещает MAX_TEXT_LENGTH символов — убираем находки с конца, пока текст не влезет
  let count = problemLines.length;
  let text = build(count);
  while (text.length > MAX_TEXT_LENGTH && count > 0) {
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
