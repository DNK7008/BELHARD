# Демо «Проверка кода» — спецификация

> Дата: 2026-09-30. Путь brainstorming: Architectural (новая страница).
> Правки после финального ревью (2026-09-30): шаблоны `telegram-token`, `url-password`,
> `secret-assignment`, `sql-concat`, `python-script`, `js-code`; короткие имена файлов и
> ограничение длины адреса в тексте для формы (6.4); шрифт поля кода 16 px (10); новые случаи в 12.
>
> Источник: [demo.md](../../../demo.md), вариант 2. Устройство повторяет демо 1 —
> [2026-09-30-diagnostic-demo-design.md](2026-09-30-diagnostic-demo-design.md): своя папка, стили из
> `../styles.css`, результат уходит в форму лендинга через `?project=`.

## 1. Зачем

Вторая рабочая часть продукта «Запущу» — уменьшенная копия шага «Я оцениваю — бесплатно».
Человек вставляет код, который написал AI, или выбирает файлы и получает отчёт:
что это за проект, что мешает запуску (с номерами строк), что понадобится. Отчёт
одной ссылкой уходит в форму заявки — без кода и без ключей.

Главное обещание — «код не покинет ваш браузер». Оно держится не на честном слове,
а на запрете, который браузер соблюдает сам (раздел 9).

**Аудитория и тон** — как у лендинга: не-разработчики, спокойно, на «вы», без жаргона
в объяснениях. Технические слова остаются только там, где человек увидит их в своём коде.

### Критерии успеха

1. Три примера дают ровно отчёты из раздела 6.5.
2. Каждое правило срабатывает на своих положительных случаях и молчит на отрицательных
   из раздела 12.
3. Ни одного фрагмента ключей и паролей из примеров нет ни в отчёте на странице, ни в
   ссылке «Отправить отчёт».
4. Попытка страницы сделать сетевой запрос (`fetch`) отклоняется браузером.
5. После проверки `localStorage` и `sessionStorage` пусты.
6. Выбранные файлы проверяются вместе со вставленным кодом; нетекстовые, слишком большие
   и лишние файлы пропускаются с объяснением.
7. На ширине от 360 до 1440 px нет горизонтальной прокрутки страницы; на телефоне отчёт
   после проверки прокручивается в экран; в консоли нет ошибок.
8. Работает двойным кликом (`file://`) и на GitHub Pages.

## 2. Ограничения и вне рамок

**Ограничения** — как у демо 1: только статика, без сервера, API-ключей, библиотек, шрифтов,
CDN и сборки; офлайн и с телефона. Соглашения лендинга: цвета — только переменные `--color-*`
из `styles.css`, никаких атрибутов `style` и `<script>` без `src`, тексты на страницу — только
через `textContent`, комментарии на русском и объясняют «зачем», отступ 2 пробела, в JS двойные
кавычки и точка с запятой.

**Вне рамок:**
- архивы `.zip`, выбор папки целиком, перетаскивание файлов мышью;
- подсветка синтаксиса и показ кода целиком;
- сохранение кода или отчёта где-либо, в том числе в браузере;
- языки, кроме Python, JavaScript и HTML: правила ищут текст и сработают в любом файле,
  но тип проекта для других языков — «Не удалось определить»;
- демо 3.

## 3. Файлы

```
homework-4/
├─ index.html          + строка со ссылкой на демо после карточек секции #problem (раздел 11)
├─ styles.css          + одно правило .problem-cta в блоке 3 (раздел 11)
├─ script.js           без изменений: подстановка ?project= уже есть
└─ code-check/
   ├─ index.html       каркас страницы
   ├─ code-check.css   стили поля, примеров и отчёта
   ├─ examples.js      три примера кода
   └─ code-check.js    правила, анализ, чтение файлов, страница
```

Плюс в корне репозитория: ссылка в оглавлении `index.html` и абзац в `CLAUDE.md`.

### Обязанности файлов

**`code-check/index.html`** — только каркас: шапка, форма проверки, скрытый блок отчёта,
подвал. Правила и тексты находок в разметке не живут.

**`code-check/code-check.css`** — подключается **после** `../styles.css` и пользуется его
классами: `.container`, `.btn`, `.btn--small`, `.site-header`, `.site-header__inner`, `.logo`,
`.section`, `.section--soft`, `.section-title`, `.section-intro`, `.cards`, `.card`,
`.site-footer`, `.site-footer__inner`. Свои стили — в двух подписанных блоках:

```
/* ===== 1. Форма проверки ===== */
/* ===== 2. Отчёт ===== */
```

Новых цветов нет. Если понадобится — сначала переменная на `:root` в `styles.css`.

**`code-check/examples.js`** — один объект `EXAMPLES` с тремя примерами кода (раздел 6.4).
Подключается раньше `code-check.js`. Примеры — строки, а не файлы: файлы пришлось бы
загружать через `fetch`, а он запрещён самой страницей (раздел 9) и не работает по `file://`.

**`code-check/code-check.js`** — четыре подписанных раздела:

```
// ===== 1. Правила =====          PROJECT_TYPES, UNKNOWN_TYPE, PROBLEM_RULES, NEED_RULES, NEEDS
// ===== 2. Анализ =====           hide, maskSecrets, isEnvFile, countLines, plural, detectType,
//                                  analyze, placeLabel, reportToText
// ===== 3. Чтение файлов =====    MAX_FILES, MAX_FILE_SIZE, readFiles
// ===== 4. Страница =====          отрисовка и обработчики
```

Разделы 1–3 не трогают разметку — их можно вызвать из консоли браузера и проверить
отдельно. Оба скрипта подключаются с `defer`, `examples.js` — первым.

## 4. Страница

### `<head>`

- `<html lang="ru">`, `<meta charset="utf-8">`, затем **сразу** запрет на отправку данных:
  `<meta http-equiv="Content-Security-Policy" content="connect-src 'none'; form-action 'none'">`.
- viewport `width=device-width, initial-scale=1`.
- `<title>`: `Проверка кода — Запущу`
- `<meta name="description">`: `Вставьте код, который написал AI, и узнайте, что мешает его запуску. Код не покидает ваш браузер.`
- `<meta name="robots" content="noindex">` и `<link rel="icon" href="data:,">` — как на лендинге.
- Стили: `../styles.css`, затем `code-check.css`. Скрипты: `examples.js`, затем `code-check.js`,
  оба с `defer`.

### Шапка и подвал

Как у демо 1: шапка — «Запущу» → `../index.html`, кнопка-ссылка «Оценить проект» →
`../index.html#form`. Подвал без контактов: «Запущу — запуск AI-проектов под ключ» и ссылка
«← На главную» → `../index.html`.

### Блок проверки — `section.section`

- `h1.section-title`: **Проверка кода**
- `p.section-intro`: «Вставьте код, который написал ChatGPT или Claude, или выберите файлы — я
  покажу, что мешает запуску и что понадобится. Код не покидает ваш браузер: страница
  технически не может его отправить.»
- `<noscript>`: «Для проверки нужен JavaScript. Если он выключен, просто
  [оставьте заявку](../index.html#form) — я посмотрю код сам.»
- `<form id="checker" class="checker">`:
  - поле кода: `<label for="code">Код</label>` и
    `<textarea id="code" name="code" rows="12" maxlength="200000" placeholder="Вставьте сюда код из чата с AI" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>`;
  - файлы: `<label for="files">Или выберите файлы</label>`, `<input id="files" name="files" type="file" multiple>`
    (без `accept`: на телефоне фильтр по расширениям прячет нужные файлы) и подсказка
    `p.checker__hint`: «До 20 файлов, каждый до 1 МБ. Архив .zip сначала распакуйте.»;
  - примеры: `p.checker__examples-title` «Нет кода под рукой? Возьмите пример:» и три кнопки
    `<button class="example-button" type="button" data-example="bot">Telegram-бот</button>`,
    `data-example="flask"` — «Сайт на Flask», `data-example="calc"` — «Калькулятор на HTML»;
  - действия: `<button class="btn" type="submit">Проверить</button>` и
    `<button id="clear" class="link-button" type="button">Очистить</button>`;
  - статус: `<p id="check-status" class="checker__status" role="status" aria-live="polite"></p>`.

### Отчёт — `<section id="report" class="section section--soft" hidden>`

- `<h2 id="report-title" class="section-title" tabindex="-1">Результат проверки</h2>`
- `<p id="report-summary" class="report__summary"></p>` — строка «Проверено: …» (раздел 6.3).
- `<div id="report-body"></div>` — сюда скрипт рисует блоки (раздел 6.3).
- `<details class="report__rules">` с `<summary>Что я проверял</summary>` и `<ul id="rules-list"></ul>` —
  список всех правил, скрипт заполняет его один раз при загрузке.
- `p.report__note`: «Это первая автоматическая проверка, а не аудит: она ищет только типовые
  ошибки из списка выше. Точный ответ дам, когда посмотрю весь проект.»
- `div.report__actions`: `<a id="send-report" class="btn" href="../index.html#form">Отправить отчёт на бесплатную оценку</a>`
  и `<button id="check-another" class="link-button" type="button">Проверить другой код</button>`.

## 5. Правила

Тексты и шаблоны окончательные. Код ниже переносится в `code-check.js` дословно.

### 5.1. Тип проекта

По списку сверху вниз: берётся первый тип, шаблон которого нашёлся хотя бы в одном источнике.
Файлы `.env` в определении типа не участвуют.

```js
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
```

У типа с `names` к подписи добавляется название фреймворка из первой скобки шаблона:
«Веб-приложение на Python (Flask)».

### 5.2. Что мешает запуску

Порядок правил — порядок блоков в отчёте. Правила с `secret: true` ищут ключи и пароли:
они **не срабатывают в файлах `.env`** (там ключам и место), и на одной строке срабатывает
только первое из них — чтобы токен в `BOT_TOKEN = "…"` не посчитался дважды. `mask` —
как спрятать найденное в показанной строке (раздел 6.2).

```js
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
```

### 5.3. Что понадобится

Потребности — фиксированный каталог; порядок ключей — порядок в отчёте. Одна потребность
показывается один раз, даже если её дали несколько правил.

```js
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
```

Потребности из типа проекта: `server: true` → `server`; тип `static` → `free-hosting`;
`web: true` → `domain`. Если среди источников есть файл `.env` → `env`.

## 6. Анализ

### 6.1. Источники

Источник — `{ name, text }`. Вставленный код — источник с именем `вставленный код` (если в
поле не одни пробелы); каждый прочитанный файл — источник с именем файла. Порядок: сначала
вставленный код, потом файлы в порядке выбора.

- `isEnvFile(name)` — `true` для `.env`, `.env.local`, `.env.production` и т. п.:
  `/(^|[\\/])\.env(\.[\w.-]+)?$/i`.
- Строки делятся по `/\r?\n/`; пустая строка после последнего перевода строки не считается.
  `countLines(text)` возвращает число строк по этому правилу.

### 6.2. Как ищутся находки

1. **Тип** — `detectType(sources)` (раздел 5.1): `{ id, label, server, web }`.
2. **Проблемы** — для каждого источника, для каждой строки (номер с 1), для каждого правила
   `PROBLEM_RULES` по порядку: правило с `secret` пропускается в `.env` и на строке, где уже
   сработало другое `secret`-правило; если `pattern.test(строка)` — в правило добавляется
   место `{ source, line, snippet }`.
3. **Показанная строка** (`snippet`) — `maskSecrets(строка).trim()`, обрезанная до 120
   символов с `…` в конце. `maskSecrets` прогоняет строку через `mask` **всех** правил, у
   которых он есть (с флагом `g`), — поэтому ключ прячется, какое бы правило ни нашло строку.
   `hide(value)` — первые 3 символа и `…`: `hide("qwerty123")` → `qwe…`.
4. **Потребности** — множество: из типа, из `NEED_RULES` (правило срабатывает, если его шаблон
   нашёлся хотя бы в одном источнике; `serverOnly` пропускается у типа `static`), `env` при
   наличии `.env`. В отчёт — в порядке ключей `NEEDS`.

### 6.3. Отчёт

`analyze(sources, skipped = [])` возвращает:

```js
{
  type: { id, label },
  sourceNames: ["вставленный код", "bot.py"],
  lineCount: 58,
  multipleSources: true,                                   // от этого зависит подпись места
  problems: [{ id, title, text, places: [{ source, line, snippet }] }],   // только сработавшие, в порядке правил
  needs: [{ id, title, text }],
  skipped: [{ name, reason }],
}
```

`placeLabel(place, multipleSources)` — `строка 8` для одного источника, `bot.py, строка 8`
для нескольких.

**Строка «Проверено»:** `Проверено: <имена через запятую> — <N> <строка|строки|строк>.` —
«Проверено: вставленный код — 37 строк.», «Проверено: вставленный код, bot.py — 58 строк.»
`plural(n, "строка", "строки", "строк")` — по правилам русского языка (1, 21 — «строка»;
2–4, 22–24 — «строки»; 5–20, 11–14 — «строк»).

**Блоки в `#report-body`**, каждый — `div.report__block` с `h3`:

1. **Что это за проект** — `p.report__type` с подписью типа.
2. **Что мешает запуску** — `ul.cards`, на каждое правило `li.card`: `h4` заголовок, `p` текст,
   `ul.places` с местами: `li` → `span.place__label` (подпись места) и `code` (показанная
   строка). Больше 10 мест — показываются первые 10 и `li` «…и ещё N». Если проблем нет —
   `p.report__ok`: «Явных проблем не нашёл. Это не значит, что их нет: проверка ищет только
   типовые ошибки из списка ниже.»
3. **Что понадобится** — `ul.cards`, на каждую потребность `li.card`: `h4` и `p`. Если пусто —
   `p`: «По этому коду не понять, что понадобится для запуска, — скажу после оценки.»
4. **Пропущенные файлы** — только если есть: `ul.skipped`, `li` «photo.png — не текстовый файл».

**Список «Что я проверял»** (`#rules-list`), по `li` на строку:
- «Тип проекта — по импортам и разметке: aiogram, flask, express, <html> и другие»;
- каждое правило `PROBLEM_RULES`, затем `NEED_RULES`: `strong` с заголовком и текст ` — ищу <looksFor>`;
- «Файл .env — правила про ключи в нём не срабатывают».

### 6.4. Текст для формы заявки

`reportToText(report)` — обычный текст, строки через `\n`. Кода и показанных строк в нём нет,
только заголовки и места:

```
Отчёт проверки кода на сайте
Проект: Telegram-бот
Проверено: вставленный код — 37 строк

Мешает запуску:
- Токен Telegram-бота в коде: строка 8
- Ключ OpenAI в коде: строка 9

Понадобится: Сервер; Автозапуск; База данных и резервные копии; Надёжное место для ключей
```

- Места одного правила — через `; `, не больше 5, дальше `; и ещё N`.
- Нет проблем — строка `Мешает запуску: явных проблем не нашёл` вместо блока.
- Нет потребностей — `Понадобится: скажу после оценки`.
- Есть пропущенные файлы — последней строкой `Пропущено: photo.png (не текстовый файл); big.log (больше 1 МБ)`.
- Имена файлов длиннее 40 символов укорачиваются: первые 26 символов, `…` и последние 13
  (расширение остаётся). В строке «Проверено» — не больше 5 имён, дальше `и ещё N`. На странице
  имена показываются полностью.
- Текст должен влезть и в поле формы (2000 символов), и в адрес ссылки: после
  `encodeURIComponent` — не больше 6000 символов. GitHub Pages отвечает ошибкой 414 на адреса
  длиннее ~8 КБ, а русская буква в адресе занимает 6 символов (`%D0%BF`). Пока текст не влезает,
  строки проблем убираются с конца, и вместо них — `…и ещё N находок`.

### 6.5. Примеры и эталонные отчёты

`examples.js`:

```js
// Примеры кода для демо «Проверка кода». Ключи и пароли в них выдуманы,
// но выглядят как настоящие — иначе правилам нечего было бы находить.
const EXAMPLES = {
  bot: `import asyncio
import sqlite3

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from openai import OpenAI

BOT_TOKEN = "123456789:AAFakeTokenForDemoOnly-0123456789ab"
client = OpenAI(api_key="sk-demoFakeKey0123456789abcdefXYZ")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
db = sqlite3.connect("clients.db")
db.execute("CREATE TABLE IF NOT EXISTS clients (id INTEGER, name TEXT)")


@dp.message(CommandStart())
async def start(message: types.Message):
    db.execute("INSERT INTO clients VALUES (?, ?)", (message.from_user.id, message.from_user.full_name))
    db.commit()
    await message.answer("Привет! Я запишу вас на приём.")


@dp.message()
async def ask_ai(message: types.Message):
    answer = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": message.text}],
    )
    await message.answer(answer.choices[0].message.content)


async def main():
    await dp.start_polling(bot)


asyncio.run(main())
`,
  flask: `import sqlite3

from flask import Flask, render_template_string, request

app = Flask(__name__)
app.secret_key = "super-secret-key-123"
DB_PASSWORD = "qwerty123"

PAGE = """
<form method="post">
  <input name="name" placeholder="Ваше имя">
  <input name="phone" placeholder="Телефон">
  <button>Записаться</button>
</form>
"""


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        db = sqlite3.connect("orders.db")
        name = request.form["name"]
        phone = request.form["phone"]
        db.execute(f"INSERT INTO orders (name, phone) VALUES ('{name}', '{phone}')")
        db.commit()
        return "Спасибо! Мы перезвоним."
    return render_template_string(PAGE)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
`,
  calc: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Калькулятор стоимости ремонта</title>
</head>
<body>
  <h1>Сколько стоит ремонт</h1>
  <label>Площадь, м²: <input id="area" type="number" value="40"></label>
  <label>Цена за м², руб.: <input id="price" type="number" value="3500"></label>
  <button id="calc">Посчитать</button>
  <p id="result"></p>
  <script>
    document.getElementById("calc").addEventListener("click", function () {
      const area = Number(document.getElementById("area").value);
      const price = Number(document.getElementById("price").value);
      document.getElementById("result").textContent = "Итого: " + area * price + " руб.";
    });
  </script>
</body>
</html>
`,
};
```

**Эталон «Telegram-бот»** (источник `вставленный код`):
- Тип: «Telegram-бот». Проверено: вставленный код — 37 строк.
- Мешает запуску:
  - «Токен Telegram-бота в коде» — строка 8: `BOT_TOKEN = "123…"`;
  - «Ключ OpenAI в коде» — строка 9: `client = OpenAI(api_key="sk-…")`.
- Понадобится: Сервер, Автозапуск, База данных и резервные копии, Надёжное место для ключей.

**Эталон «Сайт на Flask»**:
- Тип: «Веб-приложение на Python (Flask)». Проверено: вставленный код — 31 строка.
- Мешает запуску:
  - «Пароль или ключ прямо в коде» — строка 6: `app.secret_key = "sup…"`; строка 7: `DB_PASSWORD = "qwe…"`;
  - «Включён режим отладки» — строка 31: `app.run(host="127.0.0.1", port=5000, debug=True)`;
  - «Адрес «этого компьютера»» — строка 31: та же строка;
  - «Запрос к базе склеивается из текста» — строка 24:
    `db.execute(f"INSERT INTO orders (name, phone) VALUES ('{name}', '{phone}')")`.
- Понадобится: Сервер, Домен и SSL-сертификат, База данных и резервные копии.

**Эталон «Калькулятор на HTML»**:
- Тип: «Обычная страница из HTML, CSS и JavaScript». Проверено: вставленный код — 21 строка.
- Мешает запуску: нет — «Явных проблем не нашёл…».
- Понадобится: Бесплатный хостинг, Домен и SSL-сертификат.

## 7. Чтение файлов

```js
const MAX_FILES = 20;
const MAX_FILE_SIZE = 1024 * 1024; // 1 МБ
```

`readFiles(fileList)` → `Promise<{ sources, skipped }>`. Файлы читаются по очереди через
`file.text()`:
- 21-й и следующие — в `skipped` с причиной `больше 20 файлов`;
- больше `MAX_FILE_SIZE` — `больше 1 МБ` (не читается);
- в тексте есть символ `\u0000` — `не текстовый файл` (так выглядят картинки, архивы, PDF);
- остальные — в `sources`.

## 8. Поведение страницы

1. **Загрузка.** Скрипт заполняет `#rules-list`. Больше ничего: код не восстанавливается.
2. **«Проверить»** (`submit`). `preventDefault()`, статус очищается. Собираются источники
   (раздел 6.1) и читаются файлы. Если источников нет:
   - ни кода, ни файлов — статус «Вставьте код или выберите файлы.»;
   - файлы были, но все пропущены — статус «Нечего проверять: все выбранные файлы пропущены — не текстовые или больше 1 МБ.»

   Иначе — `analyze`, отрисовка отчёта, `hidden` снимается, обновляется `href` у
   `#send-report`: `../index.html?project=` + `encodeURIComponent(reportToText(отчёт))` + `#form`.
   Фокус — на `#report-title` **без прокрутки** (`preventScroll`), затем явный
   `scrollIntoView({ block: "start" })`: сам `focus()` не крутит страницу, если заголовок
   виден краешком внизу (урок демо 1).
3. **Пример** (кнопка `data-example`). В поле подставляется `EXAMPLES[id]`, выбор файлов
   сбрасывается, проверка запускается сразу — как по «Проверить».
4. **Код изменился** (`input` в поле или `change` у выбора файлов) при показанном отчёте —
   отчёт прячется, статус очищается: нельзя отправить отчёт о другом коде.
5. **«Очистить»** и **«Проверить другой код»** — `form.reset()` (стирает и поле, и файлы),
   отчёт прячется, статус очищается, фокус — в поле кода.

Все тексты — через `textContent`.

## 9. Приватность

- **Запрет на отправку** — `<meta http-equiv="Content-Security-Policy" content="connect-src 'none'; form-action 'none'">`
  первым после `charset`. Браузер блокирует любые `fetch`, `XMLHttpRequest`, `sendBeacon`,
  WebSocket и отправку форм с этой страницы. Переход по ссылке «Отправить отчёт» — это
  обычная навигация, её запрет не касается; кода в ней нет.
- **Поле кода**: `spellcheck="false"` (иначе Chrome с «улучшенной проверкой правописания»
  отправляет текст полей в Google), `autocomplete="off"` (браузер не восстанавливает код после
  перезагрузки), `autocorrect="off"`, `autocapitalize="off"` (телефон не «исправляет» код).
- **Ни `localStorage`, ни `sessionStorage`.** Код и отчёт живут, пока открыта вкладка.

## 10. Визуал (`code-check.css`)

- `.checker` — сетка полей с промежутком, ширина не больше `48rem`, отступ сверху `2rem`.
- Поле кода — во всю ширину, моноширинный шрифт (`ui-monospace, "Cascadia Mono", Consolas, monospace`)
  размером не меньше 16 px (иначе iPhone увеличивает страницу при нажатии на поле),
  рамка `--color-muted` (граница поля отличается от фона хотя бы в 3 раза, как на лендинге),
  `--radius`, `resize: vertical`. Метки полей — жирные.
- `.checker__hint` — `--color-muted`, мельче основного текста.
- `.example-button` — кнопки-«таблетки»: рамка `--color-accent`, текст `--color-accent`, фон
  `--color-surface`, при наведении — фон `--color-accent-soft`; высота не меньше 44 px;
  переносятся (`flex-wrap`).
- `.link-button` — как у демо 1: кнопка, которая выглядит как ссылка.
- `.checker__status` — жирный, `--color-error`.
- Отчёт: `.report__block` — отступ сверху `2rem`; `h3` блока — `1.25rem`; `.card h4` —
  как `.card h3` на лендинге; `.report__type` — крупнее основного текста, жирный.
- `.places` — список без маркеров; `code` — моноширинный шрифт, фон `--color-bg`, отступы,
  `--radius`, **перенос длинных строк** (`white-space: pre-wrap; overflow-wrap: anywhere`) —
  иначе длинная строка кода даст горизонтальную прокрутку на телефоне.
- `.report__note` — `--color-muted`; `.report__actions` — в строку с переносом.
- Элементам с атрибутом `hidden` CSS не задаёт `display`.

## 11. Изменения на лендинге и в корне

**`homework-4/index.html`** — в `section#problem` сразу после `</ul>` карточек:

```html
<p class="problem-cta">Боитесь, что в коде есть дыры? <a href="code-check/index.html">Проверить мой код — он не покинет ваш браузер</a></p>
```

**`homework-4/styles.css`** — в конец блока 3:

```css
/* Строка со ссылкой на проверку кода — под карточками проблем */
.problem-cta {
  margin: 1.5rem 0 0;
  font-size: 1.125rem;
}
```

**`homework-4/script.js`** — без изменений.

**Корневой `index.html`** — пункт оглавления после диагностики:
`homework-4/code-check/` — «homework-4/code-check — демо «Проверка кода»: разбор кода от AI прямо в браузере».

**`CLAUDE.md`**, раздел `homework-4`:
- в абзаце про демо — `code-check/` в списке папок;
- абзац про проверку кода: правила — таблицы в `code-check.js`; примеры — `examples.js`, они же
  эталоны; CSP в `<head>` запрещает странице сетевые запросы — не убирать и не добавлять
  `fetch`; ничего не сохранять в браузере; меняешь правила — прогони эталоны и отрицательные
  случаи из спеки;
- `start homework-4\code-check\index.html` в список команд;
- пункты проверки после правок.

## 12. Проверка

Проверка — в настоящем браузере через Playwright MCP на локальном сервере
`http://127.0.0.1:8765/` и в node (разделы 1–3 `code-check.js` не трогают страницу).
`file://` проверяется вручную в конце.

1. `code-check/index.html` загружается, в консоли нет ошибок.
2. Эталоны раздела 6.5: для каждого примера — тип, строка «Проверено», находки с местами и
   показанными строками, потребности — поле в поле. Текст для формы у примера «Telegram-бот» —
   ровно как в разделе 6.4.
3. **Каждое правило — положительный и отрицательный случай** (`analyze` по одной строке):

   | Правило | Срабатывает | Не срабатывает |
   |---|---|---|
   | telegram-token | `BOT_TOKEN = "123456789:AAFakeTokenForDemoOnly-0123456789ab"` | `id = "123456789:short"` |
   | openai-key | `key = "sk-demoFakeKey0123456789abcdefXYZ"` | `name = "task-0123456789abcdefghijk"` |
   | url-password | `DATABASE_URL = "postgres://admin:S3cretPass@db.example.com/shop"` | `url = "http://localhost:5000/api"` |
   | secret-assignment | `DB_PASSWORD = "qwerty123"`, `"api_key": "abcdef123456"` | `TOKEN = os.getenv("TOKEN")`, `password = ""`, `BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"`, `token_url = "https://example.com/token"` |
   | debug-mode | `app.run(debug=True)`, `DEBUG = True` | `debugger = True` |
   | localhost | `fetch("http://localhost:3000/api")` | `hostname = "example.com"` |
   | sql-concat | `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")`, ``db.query(`SELECT * FROM users WHERE id = ${id}`)`` | `cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))` |
   | eval-exec | `result = eval(user_input)` | `const m = /a+/.exec(text);`, `cursor.execute("SELECT 1")` |

   Плюс: на строке `DATABASE_URL = "postgres://admin:S3cretPass@db.example.com/shop"` находка
   **одна** (url-password), а показанная строка — `DATABASE_URL = "postgres://admin:S3c…@db.example.com/shop"`.

   **Случаи, добавленные по финальному ревью:**

   | Правило или тип | Срабатывает (и что показано) | Не срабатывает |
   |---|---|---|
   | telegram-token | токен внутри адреса API — `url = f"https://api.telegram.org/bot123…/sendMessage"`; токен, который кончается на `-` | — |
   | url-password | `redis://:S3cretRedisPass@localhost:6379/0` → `redis://:S3c…@localhost:6379/0`, в том числе в `.env` в находке про localhost | — |
   | secret-assignment | `app.config["SECRET_KEY"] = "dev-secret-key-123"` | `SECRET_KEY = os.environ["SECRET_KEY"]`, `if config["password"] == "admin123":` |
   | sql-concat | ``cursor.execute("… name = '" + name + "'")``, ``db.execute("INSERT INTO t (a, b) VALUES ('" + a + "', 1)")``, `query = f"SELECT * FROM users WHERE id = {user_id}"`, ``const sql = `SELECT * FROM users WHERE id = ${id}`;`` | `title = f"Hello {name}"`, `document.querySelector("#" + id)` |
   | тип проекта | `import React from "react"` + `import App from "./App"` → «Код на JavaScript», без «Сервера» | `import os` + `import numpy as np` по-прежнему «Скрипт на Python» |

   И про длину: три файла `Новый текстовый документ (N).txt` со всеми правилами по 10 раз и
   восемь файлов с именами по 220 символов плюс семь пропущенных с такими же именами — текст для
   формы не длиннее 2000 символов, после `encodeURIComponent` не длиннее 6000, строка
   «Пропущено» целая (`…; и ещё 2`).
4. **Утечки.** После проверки каждого примера ни одна из строк `AAFakeTokenForDemoOnly`,
   `demoFakeKey`, `super-secret`, `qwerty123` не встречается ни в тексте `#report`, ни в
   расшифрованном `href` у `#send-report`.
5. **CSP.** `fetch("../index.html")` со страницы демо отклоняется (`TypeError`). Браузер при
   этом пишет в консоль сообщение о нарушении CSP — это и есть проверка; критерий «в консоли
   нет ошибок» относится к загрузке и обычной работе страницы, не к этой попытке.
6. **Файлы** (через Playwright `setInputFiles`): `bot.py` (код примера «Telegram-бот»), `.env`
   (`BOT_TOKEN=123456789:AAFakeTokenForDemoOnly-0123456789ab` и
   `DATABASE_URL=postgres://admin:S3cretPass@localhost/shop`), `photo.png` (байты с нулём),
   `big.log` (больше 1 МБ). Ожидается: тип «Telegram-бот»; места подписаны `bot.py, строка 8`;
   в `.env` нет находок про ключи, но есть `localhost` в строке 2 с показанной строкой
   `DATABASE_URL=postgres://admin:S3c…@localhost/shop`; среди потребностей — «Ключи отдельно от
   кода»; пропущены `photo.png — не текстовый файл` и `big.log — больше 1 МБ`.
7. **Статусы.** Пустая форма — «Вставьте код или выберите файлы.»; только `photo.png` —
   «Нечего проверять: …».
8. **Отчёт прячется**, если после проверки изменить код в поле. «Очистить» стирает поле и файлы.
9. **Хранилища.** После проверки примера `localStorage.length === 0` и `sessionStorage.length === 0`.
10. **Экраны.** На 360 и 1280 px нет горизонтальной прокрутки (и с показанным отчётом Flask);
    на 360×740 после «Проверить» заголовок отчёта у верхнего края экрана.
11. **Лендинг.** Ссылка «Проверить мой код…» в секции проблем открывает демо; «Отправить отчёт»
    открывает лендинг на форме, поле «Что за проект» содержит текст отчёта, и в нём нет ключей.
12. Ссылка из корневого `index.html` открывает демо.
