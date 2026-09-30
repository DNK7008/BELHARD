# Демо «Проверка кода» — план реализации

> **Для исполнителей-агентов:** ОБЯЗАТЕЛЬНЫЙ SUB-SKILL: superpowers:subagent-driven-development
> (рекомендуется) или superpowers:executing-plans — выполнять план задача за задачей.
> Шаги отмечены чекбоксами (`- [ ]`).

**Goal:** страница, где человек вставляет код от AI или выбирает файлы и получает отчёт: тип
проекта, что мешает запуску (с номерами строк и замаскированными ключами), что понадобится; отчёт
одной ссылкой уходит в форму заявки на лендинге.

**Architecture:** своя папка `homework-4/code-check/`. `examples.js` — три примера кода строками.
`code-check.js` — разделы 1–3: таблицы правил, чистые функции анализа и чтение файлов (задача 1),
раздел 4: отрисовка и обработчики (задача 2). CSP в `<head>` запрещает странице сетевые запросы.
Лендинг получает ссылку на демо в секции проблем; подстановка `?project=` в форму уже есть
(задача 3).

**Tech Stack:** HTML5, CSS (custom properties, grid, flex), чистый JavaScript, `File.text()`,
Content-Security-Policy. Проверка — Playwright MCP и node.

**Spec:** `homework-4/docs/superpowers/specs/2026-09-30-code-check-demo-design.md`

## Global Constraints

- Все новые файлы — в `E:\Domains\BELHARD\homework-4\code-check\`. Вне этой папки правятся только
  `homework-4/index.html`, `homework-4/styles.css` (одно правило в блоке 3), корневые `index.html`
  и `CLAUDE.md`, и только в задаче 3. `homework-4/script.js` не меняется.
- Без сборки, npm, Tailwind, CDN, внешних шрифтов и библиотек.
- Правила, тексты и примеры — дословно из спеки (в этом плане они уже вписаны в код).
- Цвета — только переменные `--color-*` из `styles.css`. В `code-check.css` нет ни одного hex-,
  `rgb()`- или именованного цвета.
- В HTML нет атрибутов `style` и `<script>` без `src`.
- Тексты на страницу — только через `textContent` или текстовые узлы, `innerHTML` не используется.
- В `<head>` демо: CSP `connect-src 'none'; form-action 'none'` сразу после `charset`,
  `<meta name="robots" content="noindex">`, `<link rel="icon" href="data:,">`.
- Страница ничего не пишет ни в `localStorage`, ни в `sessionStorage` и не делает сетевых запросов.
- В подвале демо нет контактов.
- Комментарии в коде — на русском и объясняют «зачем». Код простой: автор учится.
- Отступ — 2 пробела в HTML, CSS и JS. В JS — двойные кавычки и точка с запятой, фигурные скобки у
  каждого `if`.
- Ветка — `homework-4-code-check`. Не переключать ветки, не делать merge, push, rebase.
- Каждая задача заканчивается одним commit'ом из корня репозитория. Сообщение на русском,
  последняя строка: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Файлы спеки и плана не менять.

## Как проверять

Тестового фреймворка нет — проверки выполняются в настоящем браузере через Playwright MCP.
Если инструменты `mcp__playwright__*` не видны, загрузи их через ToolSearch:
`select:mcp__playwright__browser_navigate,mcp__playwright__browser_evaluate,mcp__playwright__browser_resize,mcp__playwright__browser_console_messages,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_run_code_unsafe`.

Playwright MCP не открывает `file://`, поэтому репозиторий раздаётся локальным сервером.

1. Проверь, что сервер отвечает (Git Bash):

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8765/index.html
   ```

   Ожидается `200`. Если нет — запусти сервер **в фоне** (Bash с `run_in_background: true`)
   и повтори проверку через пару секунд:

   ```bash
   python -c "import http.server as s, functools as f; H = type('H', (s.SimpleHTTPRequestHandler,), {'end_headers': lambda self: (self.send_header('Cache-Control', 'no-store'), s.SimpleHTTPRequestHandler.end_headers(self))}); s.ThreadingHTTPServer(('127.0.0.1', 8765), f.partial(H, directory='E:/Domains/BELHARD')).serve_forever()"
   ```

2. Адреса: демо — `http://127.0.0.1:8765/homework-4/code-check/index.html`, лендинг —
   `http://127.0.0.1:8765/homework-4/index.html`.
3. **Перезагрузка после правок.** Перед повторной проверкой той же страницы сначала
   `browser_navigate` на `about:blank`, затем на адрес страницы: переход на тот же адрес с `#…`
   браузер может не считать перезагрузкой (урок демо 1).
4. Ширины экрана: `mcp__playwright__browser_resize` с `{"width": 1280, "height": 900}` и
   `{"width": 360, "height": 800}`.
5. Проверки — функции для `mcp__playwright__browser_evaluate` (параметр `function`) или код для
   `mcp__playwright__browser_run_code_unsafe` (параметр `code`, функция получает `page`).
   Результат сравнивается с ожидаемым JSON **поле в поле**. Любое расхождение — проверка не пройдена.
6. Консоль — `mcp__playwright__browser_console_messages` с `{"level": "error"}` сразу после
   загрузки страницы. Ожидается: ни одного `[ERROR]`. Исключение — проверка CSP (задача 1, шаг 9):
   там сообщение о нарушении CSP и есть ожидаемый результат.

## Review Focus

1. **Ключ в строке, которую нашло не «ключевое» правило** (пароль в адресе базы на строке с
   `localhost`, в том числе в `.env`) → в показанной строке он всё равно замаскирован.
   Тест — задача 1, шаг 8, поле `withEnv`; задача 2, шаг 5, поле `places`.
2. **Строка в 50 000 символов** (минифицированный скрипт) → находка есть, показанная строка обрезана
   до 120 символов, анализ не подвисает. Тест — задача 1, шаг 8, поле `longLine`.
3. **Много находок в нескольких файлах с длинными именами** → текст для формы не длиннее 2000
   символов, лишние находки свёрнуты в «…и ещё N …», в строке «Проверено» не больше 5 имён,
   строка «Понадобится» на месте. Тест — задача 1, шаг 8, поле `longText`.
4. **Код изменён после проверки** → отчёт прячется, отправить отчёт о старом коде нельзя.
   Тест — задача 2, шаг 4, поле `hiddenAfterEdit`.
5. **Поле из одних пробелов и ни одного файла** → статус «Вставьте код или выберите файлы.»,
   отчёта нет. Тест — задача 2, шаг 4, поля `emptyStatus` и `hiddenWhenEmpty`.

---

### Task 1: Правила, анализ и чтение файлов

**Files:**
- Create: `homework-4/code-check/index.html`
- Create: `homework-4/code-check/code-check.css` (только заголовки блоков — заполняет задача 2)
- Create: `homework-4/code-check/examples.js`
- Create: `homework-4/code-check/code-check.js` (разделы 1–3 — раздел 4 дописывает задача 2)

**Interfaces:**
- Consumes: из `../styles.css` классы `.container`, `.btn`, `.btn--small`, `.site-header`,
  `.site-header__inner`, `.logo`, `.section`, `.section--soft`, `.section-title`,
  `.section-intro`, `.cards`, `.card`, `.site-footer`, `.site-footer__inner`.
- Produces (глобальные имена, их использует задача 2 и проверки):
  - `EXAMPLES` — `{ bot, flask, calc }`, значения — строки кода;
  - `PROJECT_TYPES`, `UNKNOWN_TYPE`, `PROBLEM_RULES`, `NEEDS`, `NEED_RULES` — таблицы из спеки;
  - `PASTED_NAME` — `"вставленный код"`;
  - `hide(value)` → `string`; `maskSecrets(line)` → `string`; `isEnvFile(name)` → `boolean`;
    `countLines(text)` → `number`; `plural(n, one, few, many)` → `string`;
    `detectType(sources)` → `{ id, label, server, web }`;
  - `analyze(sources, skipped = [])` → `{ type: { id, label }, sourceNames, lineCount,
    multipleSources, problems: [{ id, title, text, places: [{ source, line, snippet }] }],
    needs: [{ id, title, text }], skipped: [{ name, reason }] }`;
  - `placeLabel(place, multipleSources)` → `string`; `summaryText(report, maxNames = все)` →
    `string` (без точки в конце; в тексте для формы — не больше 5 имён, это дополнение к
    разделу 6.4 спеки, чтобы текст гарантированно влезал в 2000 символов);
    `reportToText(report)` → `string`;
  - `MAX_FILES`, `MAX_FILE_SIZE`, `readFiles(fileList)` → `Promise<{ sources, skipped }>`.
- Produces (разметка `index.html`, её использует задача 2): `#checker.checker`, `#code`, `#files`,
  кнопки `[data-example]`, `#clear`, `#check-status`; `#report[hidden]` с `#report-title[tabindex="-1"]`,
  `#report-summary`, `#report-body`, `#rules-list`, `a#send-report`, `#check-another`.

- [ ] **Step 1: Убедиться, что сервер работает**

Выполни шаг 1 раздела «Как проверять». Ожидается `200`.

- [ ] **Step 2: Запустить проверку эталонов до правок — она должна упасть**

`browser_navigate` → `http://127.0.0.1:8765/homework-4/code-check/index.html`, затем
`browser_evaluate` с функцией:

```js
() => {
  const view = (id) => {
    const report = analyze([{ name: "вставленный код", text: EXAMPLES[id] }]);
    return {
      type: report.type.label,
      lines: report.lineCount,
      problems: report.problems.map((p) => [p.title, p.places.map((x) => [x.line, x.snippet])]),
      needs: report.needs.map((n) => n.title),
    };
  };
  return {
    bot: view("bot"),
    flask: view("flask"),
    calc: view("calc"),
    textBot: reportToText(analyze([{ name: "вставленный код", text: EXAMPLES.bot }])),
  };
}
```

Ожидается FAIL: файла ещё нет, сервер отдаёт 404 — ошибка `analyze is not defined`.

- [ ] **Step 3: Создать `homework-4/code-check/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <!-- Запрет на отправку данных: браузер заблокирует любой сетевой запрос и отправку формы
       с этой страницы. Поэтому код технически не может покинуть браузер. Не убирать. -->
  <meta http-equiv="Content-Security-Policy" content="connect-src 'none'; form-action 'none'">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Проверка кода — Запущу</title>
  <meta name="description" content="Вставьте код, который написал AI, и узнайте, что мешает его запуску. Код не покидает ваш браузер.">
  <!-- Как и лендинг: пока на сайте заглушки, страница закрыта от поисковиков -->
  <meta name="robots" content="noindex">
  <!-- Пустая иконка: браузер не запрашивает favicon.ico и не пишет 404 в консоль -->
  <link rel="icon" href="data:,">
  <!-- Цвета, кнопки и карточки — общие с лендингом; свои стили демо идут после них -->
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="code-check.css">
  <!-- defer сохраняет порядок: сначала примеры, потом проверка, которая ими пользуется -->
  <script src="examples.js" defer></script>
  <script src="code-check.js" defer></script>
</head>
<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="../index.html">Запущу</a>
      <a class="btn btn--small" href="../index.html#form">Оценить проект</a>
    </div>
  </header>

  <main>
    <section class="section">
      <div class="container">
        <h1 class="section-title">Проверка кода</h1>
        <p class="section-intro">Вставьте код, который написал ChatGPT или Claude, или выберите файлы — я покажу, что мешает запуску и что понадобится. Код не покидает ваш браузер: страница технически не может его отправить.</p>
        <noscript>
          <p class="section-intro">Для проверки нужен JavaScript. Если он выключен, просто <a href="../index.html#form">оставьте заявку</a> — я посмотрю код сам.</p>
        </noscript>
        <form id="checker" class="checker">
          <div class="checker__field">
            <label for="code">Код</label>
            <!-- spellcheck="false": иначе браузер может отправить текст поля на проверку орфографии в облако.
                 autocomplete="off": браузер не восстановит код после перезагрузки.
                 autocorrect и autocapitalize: телефон не «исправит» код. -->
            <textarea id="code" name="code" rows="12" maxlength="200000" placeholder="Вставьте сюда код из чата с AI" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
          </div>
          <div class="checker__field">
            <label for="files">Или выберите файлы</label>
            <!-- Без accept: на телефоне фильтр по расширениям прячет нужные файлы -->
            <input id="files" name="files" type="file" multiple>
            <p class="checker__hint">До 20 файлов, каждый до 1 МБ. Архив .zip сначала распакуйте.</p>
          </div>
          <div class="checker__examples">
            <p class="checker__examples-title">Нет кода под рукой? Возьмите пример:</p>
            <button class="example-button" type="button" data-example="bot">Telegram-бот</button>
            <button class="example-button" type="button" data-example="flask">Сайт на Flask</button>
            <button class="example-button" type="button" data-example="calc">Калькулятор на HTML</button>
          </div>
          <div class="checker__actions">
            <button class="btn" type="submit">Проверить</button>
            <button id="clear" class="link-button" type="button">Очистить</button>
          </div>
          <p id="check-status" class="checker__status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>

    <!-- Отчёт скрыт, пока нет проверки -->
    <section id="report" class="section section--soft" hidden>
      <div class="container">
        <!-- tabindex="-1": на заголовок можно перенести фокус из скрипта -->
        <h2 id="report-title" class="section-title" tabindex="-1">Результат проверки</h2>
        <p id="report-summary" class="report__summary"></p>
        <div id="report-body"></div>
        <details class="report__rules">
          <summary>Что я проверял</summary>
          <ul id="rules-list"></ul>
        </details>
        <p class="report__note">Это первая автоматическая проверка, а не аудит: она ищет только типовые ошибки из списка выше. Точный ответ дам, когда посмотрю весь проект.</p>
        <div class="report__actions">
          <!-- Адрес ссылки с текстом отчёта собирает code-check.js -->
          <a id="send-report" class="btn" href="../index.html#form">Отправить отчёт на бесплатную оценку</a>
          <button id="check-another" class="link-button" type="button">Проверить другой код</button>
        </div>
      </div>
    </section>
  </main>

  <!-- Контактов здесь нет: они заглушки, и каждая копия — лишнее место для правки -->
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>Запущу — запуск AI-проектов под ключ</p>
      <a href="../index.html">← На главную</a>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 4: Создать `homework-4/code-check/code-check.css` с заголовками блоков**

```css
/* Стили демо «Проверка кода». Цвета, кнопки и карточки — из ../styles.css. */

/* ===== 1. Форма проверки ===== */

/* ===== 2. Отчёт ===== */
```

- [ ] **Step 5: Создать `homework-4/code-check/examples.js`**

Код примеров начинается сразу после открывающей обратной кавычки и заканчивается переводом
строки — от этого зависят номера строк в эталонах.

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

- [ ] **Step 6: Создать `homework-4/code-check/code-check.js` — разделы 1–3**

```js
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
```

- [ ] **Step 7: Повторить проверку эталонов — теперь она должна пройти**

`about:blank`, затем `browser_navigate` на демо, консоль — без ошибок. Функция из шага 2.
Ожидается:

```json
{
  "bot": {
    "type": "Telegram-бот",
    "lines": 37,
    "problems": [
      ["Токен Telegram-бота в коде", [[8, "BOT_TOKEN = \"123…\""]]],
      ["Ключ OpenAI в коде", [[9, "client = OpenAI(api_key=\"sk-…\")"]]]
    ],
    "needs": ["Сервер", "Автозапуск", "База данных и резервные копии", "Надёжное место для ключей"]
  },
  "flask": {
    "type": "Веб-приложение на Python (Flask)",
    "lines": 31,
    "problems": [
      ["Пароль или ключ прямо в коде", [[6, "app.secret_key = \"sup…\""], [7, "DB_PASSWORD = \"qwe…\""]]],
      ["Включён режим отладки", [[31, "app.run(host=\"127.0.0.1\", port=5000, debug=True)"]]],
      ["Адрес «этого компьютера»", [[31, "app.run(host=\"127.0.0.1\", port=5000, debug=True)"]]],
      ["Запрос к базе склеивается из текста", [[24, "db.execute(f\"INSERT INTO orders (name, phone) VALUES ('{name}', '{phone}')\")"]]]
    ],
    "needs": ["Сервер", "Домен и SSL-сертификат", "База данных и резервные копии"]
  },
  "calc": {
    "type": "Обычная страница из HTML, CSS и JavaScript",
    "lines": 21,
    "problems": [],
    "needs": ["Бесплатный хостинг", "Домен и SSL-сертификат"]
  },
  "textBot": "Отчёт проверки кода на сайте\nПроект: Telegram-бот\nПроверено: вставленный код — 37 строк\n\nМешает запуску:\n- Токен Telegram-бота в коде: строка 8\n- Ключ OpenAI в коде: строка 9\n\nПонадобится: Сервер; Автозапуск; База данных и резервные копии; Надёжное место для ключей"
}
```

- [ ] **Step 8: Положительные и отрицательные случаи, вспомогательные функции, файлы**

`browser_evaluate` с функцией:

```js
async () => {
  const cases = {
    "telegram-token": [['BOT_TOKEN = "123456789:AAFakeTokenForDemoOnly-0123456789ab"'], ['id = "123456789:short"']],
    "openai-key": [['key = "sk-demoFakeKey0123456789abcdefXYZ"'], ['name = "task-0123456789abcdefghijk"']],
    "url-password": [['DATABASE_URL = "postgres://admin:S3cretPass@db.example.com/shop"'], ['url = "http://localhost:5000/api"']],
    "secret-assignment": [
      ['DB_PASSWORD = "qwerty123"', '"api_key": "abcdef123456"'],
      ['TOKEN = os.getenv("TOKEN")', 'password = ""', 'BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"', 'token_url = "https://example.com/token"'],
    ],
    "debug-mode": [["app.run(debug=True)", "DEBUG = True"], ["debugger = True"]],
    localhost: [['fetch("http://localhost:3000/api")'], ['hostname = "example.com"']],
    "sql-concat": [
      ['cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")', "db.query(`SELECT * FROM users WHERE id = ${id}`)"],
      ['cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))'],
    ],
    "eval-exec": [["result = eval(user_input)"], ["const m = /a+/.exec(text);", 'cursor.execute("SELECT 1")']],
  };
  const fired = (id, line) => analyze([{ name: "x.py", text: line }]).problems.some((p) => p.id === id);
  const wrong = [];
  for (const [id, [yes, no]] of Object.entries(cases)) {
    for (const line of yes) {
      if (!fired(id, line)) wrong.push(`не сработало ${id}: ${line}`);
    }
    for (const line of no) {
      if (fired(id, line)) wrong.push(`ложно сработало ${id}: ${line}`);
    }
  }
  const url = analyze([{ name: "x.py", text: 'DATABASE_URL = "postgres://admin:S3cretPass@db.example.com/shop"' }]);

  const envText = "BOT_TOKEN=123456789:AAFakeTokenForDemoOnly-0123456789ab\nDATABASE_URL=postgres://admin:S3cretPass@localhost/shop\n";
  const withEnv = analyze([{ name: "bot.py", text: EXAMPLES.bot }, { name: ".env", text: envText }]);

  // Строка в 50 000 символов, как у минифицированного скрипта
  const hugeLine = `var t="${"x".repeat(50000)}";eval(t);`;
  const started = performance.now();
  const huge = analyze([{ name: "min.js", text: hugeLine }]);
  const hugeMs = performance.now() - started;

  // Все 8 правил в каждом из 8 файлов с длинными именами — текст для формы обязан влезть в 2000
  const allRules = [
    'BOT_TOKEN = "123456789:AAFakeTokenForDemoOnly-0123456789ab"',
    'key = "sk-demoFakeKey0123456789abcdefXYZ"',
    'DATABASE_URL = "postgres://admin:S3cretPass@db.example.com/shop"',
    'DB_PASSWORD = "qwerty123"',
    "DEBUG = True",
    'fetch("http://localhost:3000/api")',
    'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
    "result = eval(user_input)",
  ].join("\n");
  const longSources = Array.from({ length: 8 }, (_, i) => ({
    name: `очень-длинное-имя-файла-номер-${i + 1}-для-проверки-обрезки-текста.py`,
    text: allRules,
  }));
  const longText = reportToText(analyze(longSources));

  const read = await readFiles([
    new File([EXAMPLES.bot], "bot.py"),
    new File([new Uint8Array([137, 80, 78, 71, 0, 0, 0, 13])], "photo.png"),
    new File(["x".repeat(MAX_FILE_SIZE + 1)], "big.log"),
  ]);
  const twentyOne = await readFiles(Array.from({ length: 21 }, (_, i) => new File(["print(1)"], `f${i + 1}.py`)));

  return {
    wrong,
    urlLine: url.problems.map((p) => [p.id, p.places[0].snippet]),
    plural: [1, 2, 5, 11, 21, 22, 25, 111, 112].map((n) => `${n} ${plural(n, "строка", "строки", "строк")}`),
    envFiles: [".env", ".env.local", "config/.env.production", "env.py", ".envrc"].map(isEnvFile),
    withEnv: {
      type: withEnv.type.label,
      problems: withEnv.problems.map((p) => [p.id, p.places.map((x) => `${placeLabel(x, withEnv.multipleSources)}: ${x.snippet}`)]),
      needs: withEnv.needs.map((n) => n.id),
    },
    longLine: {
      fired: huge.problems.map((p) => p.id),
      snippetLength: huge.problems[0].places[0].snippet.length,
      fastEnough: hugeMs < 500,
    },
    longText: {
      fits: longText.length <= 2000,
      hasRest: /\n…и ещё \d+ наход/.test(longText),
      keepsNeeds: longText.includes("\nПонадобится: "),
      namesCapped: longText.split("\n")[2].endsWith("-5-для-проверки-обрезки-текста.py и ещё 3 — 64 строки"),
    },
    calcText: reportToText(analyze([{ name: "вставленный код", text: EXAMPLES.calc }])),
    skippedLine: reportToText(analyze([{ name: "bot.py", text: "print(1)" }], [{ name: "photo.png", reason: "не текстовый файл" }])).split("\n").pop(),
    read: { sources: read.sources.map((s) => s.name), skipped: read.skipped },
    twentyOne: { sources: twentyOne.sources.length, skipped: twentyOne.skipped },
  };
}
```

Ожидается:

```json
{
  "wrong": [],
  "urlLine": [["url-password", "DATABASE_URL = \"postgres://admin:S3c…@db.example.com/shop\""]],
  "plural": ["1 строка", "2 строки", "5 строк", "11 строк", "21 строка", "22 строки", "25 строк", "111 строк", "112 строк"],
  "envFiles": [true, true, true, false, false],
  "withEnv": {
    "type": "Telegram-бот",
    "problems": [
      ["telegram-token", ["bot.py, строка 8: BOT_TOKEN = \"123…\""]],
      ["openai-key", ["bot.py, строка 9: client = OpenAI(api_key=\"sk-…\")"]],
      ["localhost", [".env, строка 2: DATABASE_URL=postgres://admin:S3c…@localhost/shop"]]
    ],
    "needs": ["server", "autostart", "backups", "keys", "env"]
  },
  "longLine": { "fired": ["eval-exec"], "snippetLength": 121, "fastEnough": true },
  "longText": { "fits": true, "hasRest": true, "keepsNeeds": true, "namesCapped": true },
  "calcText": "Отчёт проверки кода на сайте\nПроект: Обычная страница из HTML, CSS и JavaScript\nПроверено: вставленный код — 21 строка\n\nМешает запуску: явных проблем не нашёл\n\nПонадобится: Бесплатный хостинг; Домен и SSL-сертификат",
  "skippedLine": "Пропущено: photo.png (не текстовый файл)",
  "read": {
    "sources": ["bot.py"],
    "skipped": [{ "name": "photo.png", "reason": "не текстовый файл" }, { "name": "big.log", "reason": "больше 1 МБ" }]
  },
  "twentyOne": { "sources": 20, "skipped": [{ "name": "f21.py", "reason": "больше 20 файлов" }] }
}
```

- [ ] **Step 9: Проверка запрета на сетевые запросы (CSP)**

`browser_evaluate`:

```js
async () => {
  try {
    await fetch("../index.html");
    return "запрос прошёл";
  } catch (error) {
    return `заблокирован: ${error.name}`;
  }
}
```

Ожидается: `"заблокирован: TypeError"`. `browser_console_messages` с `{"level": "error"}` показывает
сообщение о нарушении `connect-src` — это ожидаемо и относится только к этой проверке.

- [ ] **Step 10: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/code-check/index.html homework-4/code-check/code-check.css homework-4/code-check/examples.js homework-4/code-check/code-check.js
git commit -F - <<'EOF'
homework-4: проверка кода — правила, анализ и чтение файлов

Каркас страницы code-check/ с запретом на сетевые запросы (CSP), три примера
кода и разделы 1–3 code-check.js: таблицы правил, анализ с маскировкой ключей,
текст для формы заявки и чтение файлов.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Страница — форма, примеры, отчёт

**Files:**
- Modify: `homework-4/code-check/code-check.css` (заполнить блоки 1 и 2)
- Modify: `homework-4/code-check/code-check.js` (дописать раздел 4 в конец файла)

**Interfaces:**
- Consumes: из задачи 1 — `EXAMPLES`, `PROBLEM_RULES`, `NEED_RULES`, `PASTED_NAME`, `analyze`,
  `placeLabel`, `summaryText`, `reportToText`, `readFiles`; разметку `#checker`, `#code`, `#files`,
  `[data-example]`, `#clear`, `#check-status`, `#report`, `#report-title`, `#report-summary`,
  `#report-body`, `#rules-list`, `#send-report`, `#check-another`.
- Produces: разметку, которую строит скрипт (её проверяют тесты):
  в `#report-body` — `div.report__block` по порядку: 1 «Что это за проект» (`p.report__type`),
  2 «Что мешает запуску» (`ul.cards > li.card > h4 + p + ul.places > li > span.place__label + code`
  или `p.report__ok`), 3 «Что понадобится» (`ul.cards > li.card > h4 + p`), 4 «Пропущенные файлы»
  (`ul.skipped > li`, только если есть); `href` у `#send-report` вида
  `../index.html?project=<encodeURIComponent(reportToText(...))>#form`.

- [ ] **Step 1: Запустить проверку страницы до правок — она должна упасть**

`about:blank`, затем `browser_navigate` на демо, затем `browser_evaluate` с функцией:

```js
async () => {
  localStorage.clear();
  sessionStorage.clear();
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const wait = () => new Promise((resolve) => setTimeout(resolve, 150));
  const report = document.getElementById("report");
  const status = document.getElementById("check-status");
  const submit = document.querySelector('#checker button[type="submit"]');
  const code = document.getElementById("code");
  const link = document.getElementById("send-report");
  const secrets = ["AAFakeTokenForDemoOnly", "demoFakeKey", "super-secret", "qwerty123"];
  const leaks = () => secrets.filter((s) => report.textContent.includes(s) || decodeURIComponent(link.getAttribute("href")).includes(s));
  const block = (n) => report.querySelector(`#report-body > .report__block:nth-child(${n})`);

  const result = { rulesCount: document.querySelectorAll("#rules-list li").length };

  code.value = "   ";
  submit.click();
  await wait();
  result.emptyStatus = status.textContent;
  result.hiddenWhenEmpty = report.hidden;

  document.querySelector('[data-example="bot"]').click();
  await wait();
  result.bot = {
    hidden: report.hidden,
    focused: document.activeElement ? document.activeElement.id : null,
    codeFilled: code.value.startsWith("import asyncio"),
    statusCleared: status.textContent,
    summary: text(document.getElementById("report-summary")),
    blocks: [...report.querySelectorAll("#report-body > .report__block > h3")].map(text),
    type: text(report.querySelector(".report__type")),
    problems: [...block(2).querySelectorAll(".card")].map((card) => [text(card.querySelector("h4")), [...card.querySelectorAll(".places li")].map(text)]),
    needs: [...block(3).querySelectorAll(".card h4")].map(text),
    leaks: leaks(),
    linkStart: link.getAttribute("href").startsWith("../index.html?project="),
    linkEnd: link.getAttribute("href").endsWith("#form"),
  };

  document.querySelector('[data-example="flask"]').click();
  await wait();
  result.flaskLeaks = leaks();
  result.flaskProblems = [...block(2).querySelectorAll(".card h4")].map(text);

  document.querySelector('[data-example="calc"]').click();
  await wait();
  result.calc = {
    ok: text(report.querySelector(".report__ok")),
    needs: [...block(3).querySelectorAll(".card h4")].map(text),
  };

  // Код изменился после проверки — отчёт о старом коде прячется
  code.value += "\n<!-- правка -->";
  code.dispatchEvent(new Event("input", { bubbles: true }));
  result.hiddenAfterEdit = report.hidden;

  document.querySelector('[data-example="bot"]').click();
  await wait();
  document.getElementById("check-another").click();
  result.afterClear = {
    hidden: report.hidden,
    code: code.value,
    focused: document.activeElement ? document.activeElement.id : null,
  };

  // Кнопка «Очистить» в самой форме
  code.value = "print(1)";
  document.getElementById("clear").click();
  result.clearButton = code.value;

  result.storage = { local: localStorage.length, session: sessionStorage.length };
  return result;
}
```

Ожидается FAIL: раздела 4 ещё нет — отчёт не рисуется, и функция падает с ошибкой
`Cannot read properties of null (reading 'querySelectorAll')`. В консоли при этом будет сообщение
о нарушении `form-action`: без обработчика форма пытается отправиться, и CSP её останавливает.

- [ ] **Step 2: Заполнить `homework-4/code-check/code-check.css`**

Весь файл:

```css
/* Стили демо «Проверка кода». Цвета, кнопки и карточки — из ../styles.css. */

/* ===== 1. Форма проверки ===== */
.checker {
  display: grid;
  gap: 1.25rem;
  max-width: 48rem;
  margin-top: 2rem;
}

.checker__field {
  display: grid;
  gap: 0.375rem;
}

.checker__field label {
  font-weight: 600;
}

/* Код читают моноширинным шрифтом: так видны отступы, а в Python они важны */
.checker textarea {
  width: 100%;
  padding: 0.75rem 0.875rem;
  /* Рамка цветом --color-muted: граница поля должна отличаться от фона хотя бы в 3 раза */
  border: 1px solid var(--color-muted);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: vertical;
}

/* Поле выбора файлов на узком экране не должно распирать страницу */
.checker input[type="file"] {
  max-width: 100%;
}

.checker__hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.checker__examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.checker__examples-title {
  width: 100%;
  margin: 0;
}

.example-button {
  min-height: 44px; /* удобно попасть пальцем */
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.example-button:hover {
  background: var(--color-accent-soft);
}

.checker__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
}

/* Кнопка, которая выглядит как ссылка: второстепенное действие рядом с главным */
.link-button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-accent);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.link-button:hover {
  color: var(--color-accent-hover);
}

.checker__status {
  margin: 0;
  color: var(--color-error);
  font-weight: 600;
}

/* ===== 2. Отчёт ===== */
/* У #report не задаём display: иначе атрибут hidden перестанет его прятать */
.report__summary {
  margin: 0;
  color: var(--color-muted);
}

.report__block {
  margin-top: 2rem;
}

.report__block h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

/* Сетка карточек из styles.css отступает сверху на 2rem — под заголовком блока это лишнее */
.report__block .cards {
  margin-top: 0;
}

/* Заголовок карточки — как заголовок карточки на лендинге (.card h3) */
.card h4 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}

.report__type {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.report__ok {
  margin: 0;
}

.places {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.place__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

/* Строка кода переносится, а не уезжает вбок: иначе на телефоне появится горизонтальная прокрутка */
.places code {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  background: var(--color-bg);
  font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.skipped {
  margin: 0;
  padding-left: 1.25rem;
}

.report__rules {
  margin-top: 2rem;
}

.report__rules summary {
  font-weight: 600;
  cursor: pointer;
}

.report__rules ul {
  margin: 1rem 0 0;
  padding-left: 1.25rem;
  color: var(--color-muted);
}

.report__rules li + li {
  margin-top: 0.5rem;
}

.report__note {
  margin: 2rem 0 0;
  color: var(--color-muted);
}

.report__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 1.5rem;
}
```

- [ ] **Step 3: Дописать раздел 4 в конец `homework-4/code-check/code-check.js`**

```js

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
        item.append(
          createNode("span", "place__label", placeLabel(place, report.multipleSources)),
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
```

- [ ] **Step 4: Повторить проверку страницы — теперь она должна пройти**

Повтори шаг 1 целиком (`about:blank`, загрузка, функция). Консоль после загрузки и после
функции — без ошибок. Ожидается:

```json
{
  "rulesCount": 14,
  "emptyStatus": "Вставьте код или выберите файлы.",
  "hiddenWhenEmpty": true,
  "bot": {
    "hidden": false,
    "focused": "report-title",
    "codeFilled": true,
    "statusCleared": "",
    "summary": "Проверено: вставленный код — 37 строк.",
    "blocks": ["Что это за проект", "Что мешает запуску", "Что понадобится"],
    "type": "Telegram-бот",
    "problems": [
      ["Токен Telegram-бота в коде", ["строка 8 BOT_TOKEN = \"123…\""]],
      ["Ключ OpenAI в коде", ["строка 9 client = OpenAI(api_key=\"sk-…\")"]]
    ],
    "needs": ["Сервер", "Автозапуск", "База данных и резервные копии", "Надёжное место для ключей"],
    "leaks": [],
    "linkStart": true,
    "linkEnd": true
  },
  "flaskLeaks": [],
  "flaskProblems": ["Пароль или ключ прямо в коде", "Включён режим отладки", "Адрес «этого компьютера»", "Запрос к базе склеивается из текста"],
  "calc": {
    "ok": "Явных проблем не нашёл. Это не значит, что их нет: проверка ищет только типовые ошибки из списка ниже.",
    "needs": ["Бесплатный хостинг", "Домен и SSL-сертификат"]
  },
  "hiddenAfterEdit": true,
  "afterClear": { "hidden": true, "code": "", "focused": "code" },
  "clearButton": "",
  "storage": { "local": 0, "session": 0 }
}
```

- [ ] **Step 5: Файлы — вместе, с `.env`, картинкой и большим файлом**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  await page.goto("about:blank");
  await page.goto("http://127.0.0.1:8765/homework-4/code-check/index.html");
  const botCode = await page.evaluate(() => EXAMPLES.bot);
  await page.setInputFiles("#files", [
    { name: "bot.py", mimeType: "text/x-python", buffer: Buffer.from(botCode) },
    { name: ".env", mimeType: "text/plain", buffer: Buffer.from("BOT_TOKEN=123456789:AAFakeTokenForDemoOnly-0123456789ab\nDATABASE_URL=postgres://admin:S3cretPass@localhost/shop\n") },
    { name: "photo.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71, 0, 0, 0, 13]) },
    { name: "big.log", mimeType: "text/plain", buffer: Buffer.alloc(1024 * 1024 + 1, 120) },
  ]);
  await page.click('#checker button[type="submit"]');
  await page.waitForSelector("#report:not([hidden])");
  const files = await page.evaluate(() => {
    const text = (el) => el.textContent.replace(/\s+/g, " ").trim();
    const report = document.getElementById("report");
    const href = decodeURIComponent(document.getElementById("send-report").getAttribute("href"));
    return {
      summary: text(document.getElementById("report-summary")),
      type: text(report.querySelector(".report__type")),
      places: [...report.querySelectorAll(".places li")].map(text),
      needs: [...report.querySelectorAll("#report-body > .report__block:nth-child(3) .card h4")].map(text),
      skipped: [...report.querySelectorAll(".skipped li")].map(text),
      leaks: ["AAFakeTokenForDemoOnly", "S3cretPass"].filter((s) => report.textContent.includes(s) || href.includes(s)),
    };
  });

  // Только нетекстовый файл — проверять нечего
  await page.fill("#code", "");
  await page.setInputFiles("#files", [{ name: "photo.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71, 0, 0, 0, 13]) }]);
  await page.click('#checker button[type="submit"]');
  await page.waitForFunction(() => document.getElementById("check-status").textContent !== "");
  const onlyImage = await page.evaluate(() => ({
    status: document.getElementById("check-status").textContent,
    hidden: document.getElementById("report").hidden,
  }));
  return { files, onlyImage };
}
```

Ожидается:

```json
{
  "files": {
    "summary": "Проверено: bot.py, .env — 39 строк.",
    "type": "Telegram-бот",
    "places": [
      "bot.py, строка 8 BOT_TOKEN = \"123…\"",
      "bot.py, строка 9 client = OpenAI(api_key=\"sk-…\")",
      ".env, строка 2 DATABASE_URL=postgres://admin:S3c…@localhost/shop"
    ],
    "needs": ["Сервер", "Автозапуск", "База данных и резервные копии", "Надёжное место для ключей", "Ключи отдельно от кода"],
    "skipped": ["photo.png — не текстовый файл", "big.log — больше 1 МБ"],
    "leaks": []
  },
  "onlyImage": {
    "status": "Нечего проверять: все выбранные файлы пропущены — не текстовые или больше 1 МБ.",
    "hidden": true
  }
}
```

- [ ] **Step 6: Экраны 360 и 1280 px и прокрутка к отчёту на телефоне**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  const url = "http://127.0.0.1:8765/homework-4/code-check/index.html";
  const result = {};
  for (const [width, height] of [[360, 740], [1280, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto("about:blank");
    await page.goto(url);
    // Кнопка примера в середине экрана — как у человека, который долистал до неё
    await page.evaluate(() => {
      const button = document.querySelector('[data-example="flask"]');
      window.scrollTo({ top: window.scrollY + button.getBoundingClientRect().top - 400, behavior: "instant" });
    });
    await page.click('[data-example="flask"]');
    const titleNearTop = await page
      .waitForFunction(() => {
        const top = document.getElementById("report-title").getBoundingClientRect().top;
        return top > -5 && top < 120;
      }, null, { timeout: 3000 })
      .then(() => true, () => false);
    result[width] = await page.evaluate(() => ({
      noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      examplesTallEnough: [...document.querySelectorAll(".example-button")].every((b) => b.getBoundingClientRect().height >= 44),
    }));
    result[width].titleNearTop = titleNearTop;
  }
  return result;
}
```

Ожидается:

```json
{
  "360": { "noHorizontalScroll": true, "examplesTallEnough": true, "titleNearTop": true },
  "1280": { "noHorizontalScroll": true, "examplesTallEnough": true, "titleNearTop": true }
}
```

Затем на каждой ширине (`browser_resize`, пример «Сайт на Flask») сделай
`browser_take_screenshot` окна у формы и у отчёта (прокрути к `#report-title` и подожди
окончания плавной прокрутки) и посмотри на них: поле кода моноширинное, примеры — «таблетки»,
показанные строки кода переносятся внутри карточек, ничего не вылезает за край.

- [ ] **Step 7: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/code-check/code-check.css homework-4/code-check/code-check.js
git commit -F - <<'EOF'
homework-4: проверка кода — форма, примеры и отчёт на странице

Раздел 4 code-check.js: проверка вставленного кода и файлов, примеры,
отчёт из блоков с местами находок, ссылка на форму заявки; отчёт прячется,
если код изменился. Стили формы и отчёта.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Связка с лендингом, оглавление и CLAUDE.md

**Files:**
- Modify: `homework-4/index.html` (секция `#problem`, после `</ul>` карточек)
- Modify: `homework-4/styles.css` (конец блока 3)
- Modify: `index.html` в корне репозитория (список работ)
- Modify: `CLAUDE.md` в корне репозитория (раздел «Сборка и запуск» и раздел `homework-4`)

**Interfaces:**
- Consumes: `a#send-report` с `href` вида `../index.html?project=<текст>#form` (задача 2);
  `reportToText`, `analyze`, `EXAMPLES` (задача 1) — для сквозной проверки; подстановка
  `?project=` в `homework-4/script.js` (уже есть).
- Produces: ссылку на демо на лендинге, пункт в оглавлении, документацию.

- [ ] **Step 1: Запустить проверку лендинга до правок — она должна упасть**

`about:blank`, затем `browser_navigate` → `http://127.0.0.1:8765/homework-4/index.html`, затем
`browser_evaluate`:

```js
async () => {
  const cta = document.querySelector("#problem .problem-cta");
  const link = cta ? cta.querySelector("a") : null;
  const page = link ? await (await fetch(link.href)).text() : "";
  const style = cta ? getComputedStyle(cta) : null;
  return {
    afterCards: cta ? cta.previousElementSibling.matches("ul.cards") : null,
    text: cta ? cta.textContent : null,
    href: link ? link.getAttribute("href") : null,
    title: (page.match(/<title>(.*)<\/title>/) || [])[1] ?? null,
    marginTop: style ? style.marginTop : null,
    fontSize: style ? style.fontSize : null,
  };
}
```

Ожидается FAIL: все поля `null`.

- [ ] **Step 2: Добавить ссылку в `homework-4/index.html`**

Найди в `section#problem` конец списка карточек:

```html
          <li class="card">
            <h3>Страшно, что всё сломается или взломают</h3>
            <p>Непонятно, как проверить, что сайт защищён и не упадёт завтра.</p>
          </li>
        </ul>
```

и сразу под `</ul>` вставь:

```html
        <!-- Ссылка на index.html, а не на папку: по двойному клику ссылка на папку открывает список файлов -->
        <p class="problem-cta">Боитесь, что в коде есть дыры? <a href="code-check/index.html">Проверить мой код — он не покинет ваш браузер</a></p>
```

- [ ] **Step 3: Добавить правило в `homework-4/styles.css`**

Найди конец блока 3 — правило

```css
@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

и сразу под ним (перед заголовком блока 4) вставь, отделив пустой строкой:

```css

/* Строка со ссылкой на проверку кода — под карточками проблем */
.problem-cta {
  margin: 1.5rem 0 0;
  font-size: 1.125rem;
}
```

- [ ] **Step 4: Повторить проверку из шага 1 — теперь она должна пройти**

`about:blank`, загрузка лендинга, консоль — без ошибок. Ожидается:

```json
{
  "afterCards": true,
  "text": "Боитесь, что в коде есть дыры? Проверить мой код — он не покинет ваш браузер",
  "href": "code-check/index.html",
  "title": "Проверка кода — Запущу",
  "marginTop": "24px",
  "fontSize": "18px"
}
```

- [ ] **Step 5: Сквозная проверка: демо → лендинг, без ключей**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("about:blank");
  await page.goto("http://127.0.0.1:8765/homework-4/code-check/index.html");
  await page.click('[data-example="flask"]');
  await page.waitForSelector("#report:not([hidden])");
  const expected = await page.evaluate(() => reportToText(analyze([{ name: PASTED_NAME, text: EXAMPLES.flask }])));
  await page.click("#send-report");
  await page.waitForURL(/homework-4\/index\.html\?project=.+#form$/);
  const formVisible = await page
    .waitForFunction(() => {
      const top = document.getElementById("form").getBoundingClientRect().top;
      return top > -5 && top < window.innerHeight;
    }, null, { timeout: 5000 })
    .then(() => true, () => false);
  const value = await page.inputValue("#project");
  return {
    same: value === expected,
    firstLine: value.split("\n")[0],
    leaks: ["super-secret", "qwerty123", "sup…", "qwe…"].filter((s) => value.includes(s)),
    formVisible,
  };
}
```

Ожидается: `{ "same": true, "firstLine": "Отчёт проверки кода на сайте", "leaks": [], "formVisible": true }`
(в форму не уходят даже замаскированные строки — только заголовки и места).

- [ ] **Step 6: Пункт в корневом оглавлении `index.html`**

Найди:

```html
    <li><a href="homework-4/diagnostic/">homework-4/diagnostic — демо «Что нужно вашему проекту»: шесть вопросов и паспорт запуска</a></li>
```

и сразу под ним вставь:

```html
    <li><a href="homework-4/code-check/">homework-4/code-check — демо «Проверка кода»: разбор кода от AI прямо в браузере</a></li>
```

Проверка: `about:blank`, `browser_navigate` → `http://127.0.0.1:8765/index.html`, затем `browser_evaluate`:

```js
async () => {
  const link = [...document.querySelectorAll("li a")].find((a) => a.getAttribute("href") === "homework-4/code-check/");
  const page = link ? await (await fetch(link.href)).text() : "";
  return { text: link ? link.textContent : null, title: (page.match(/<title>(.*)<\/title>/) || [])[1] ?? null };
}
```

Ожидается:
`{ "text": "homework-4/code-check — демо «Проверка кода»: разбор кода от AI прямо в браузере", "title": "Проверка кода — Запущу" }`.

- [ ] **Step 7: Обновить `CLAUDE.md`**

1. В разделе «Сборка и запуск» в блок команд после строки `start homework-4\diagnostic\index.html`
   добавь:

   ```
   start homework-4\code-check\index.html
   ```

2. В разделе `homework-4` в абзаце, который начинается с `**Демо — каждое в своей папке**`, замени

   ```
   (`diagnostic/`; дальше по `demo.md` — проверка кода и симуляция)
   ```

   на

   ```
   (`diagnostic/`, `code-check/`; дальше по `demo.md` — симуляция)
   ```

3. После абзаца, который начинается с `**Диагностика `diagnostic/`**`, вставь абзац:

   ```
   **Проверка кода `code-check/`** — вставка кода или выбор файлов и отчёт: тип проекта, что мешает запуску (с номерами строк), что понадобится. Правила — таблицы `PROJECT_TYPES`, `PROBLEM_RULES`, `NEED_RULES` в `code-check.js`; примеры — `examples.js`, они же эталоны. Найденные ключи и пароли маскируются в любой показанной строке (`maskSecrets`), в форму уходят только заголовки находок и номера строк. В `<head>` стоит CSP `connect-src 'none'`: странице запрещены любые сетевые запросы — не убирай его и не добавляй `fetch`. Код и отчёт нигде не сохраняются, даже в браузере. Спека с эталонами и отрицательными случаями — `docs/superpowers/specs/2026-09-30-code-check-demo-design.md`.
   ```

4. В список «Что проверять после правок» раздела `homework-4` добавь в конец:

   ```
   - проверка кода: три примера дают эталонные отчёты из спеки; после правки правил — положительные и отрицательные случаи из плана `docs/superpowers/plans/2026-09-30-code-check-demo.md` (задача 1, шаг 8); в отчёте и в ссылке «Отправить отчёт» нет ключей из примеров.
   ```

   и поменяй точку в конце предыдущего пункта на `;`.

- [ ] **Step 8: Ручная проверка по двойному клику (`file://`)**

Playwright не открывает `file://`, поэтому эту проверку делает Денис. Открой ему страницу
(PowerShell): `Start-Process "E:\Domains\BELHARD\homework-4\code-check\index.html"` и попроси:
нажать пример «Telegram-бот» — появится отчёт; выбрать пару своих файлов — они проверятся;
нажать «Отправить отчёт на бесплатную оценку» — откроется лендинг на форме с заполненным полем.

- [ ] **Step 9: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/styles.css index.html CLAUDE.md
git commit -F - <<'EOF'
homework-4: проверка кода связана с лендингом

На лендинге — ссылка на демо под карточками проблем. Пункт в оглавлении
и раздел про проверку кода в CLAUDE.md.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

После задачи 3 — ревью всей ветки `homework-4-code-check`. Слияние в `main` — только по слову Дениса.
