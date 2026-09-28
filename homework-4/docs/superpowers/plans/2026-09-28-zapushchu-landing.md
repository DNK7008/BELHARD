# Лендинг «Запущу» — план реализации

> **Для исполнителей-агентов:** ОБЯЗАТЕЛЬНЫЙ SUB-SKILL: superpowers:subagent-driven-development
> (рекомендуется) или superpowers:executing-plans — выполнять план задача за задачей.
> Шаги отмечены чекбоксами (`- [ ]`).

**Goal:** одностраничный лендинг услуги «запуск AI-сгенерированного кода под ключ» с формой
заявки на бесплатную оценку.

**Architecture:** три файла без сборки в `homework-4/`: `index.html` — только разметка,
`styles.css` — четыре подписанных блока стилей (база + по блоку на группу секций),
`script.js` — только отправка формы через `fetch`. Каждая задача заполняет свою часть
разметки (по маркеру-комментарию в `<main>`) и свой блок CSS.

**Tech Stack:** HTML5, CSS (custom properties, grid, flex), чистый JavaScript. Проверка — Playwright MCP.

**Spec:** `homework-4/docs/superpowers/specs/2026-09-28-zapushchu-landing-design.md`

## Global Constraints

- Все файлы работы — в `E:\Domains\BELHARD\homework-4\`. Вне этой папки правятся только
  корневые `index.html` и `CLAUDE.md`, и только в задаче 5.
- Без сборки, npm, Tailwind, CDN, внешних шрифтов и библиотек.
- Тексты страницы — дословно из раздела 4 спеки (в этом плане они уже вписаны в код).
- Цвета — только через переменные `--color-*`. Hex-значения цветов встречаются в `styles.css`
  только в объявлениях переменных на `:root`.
- Четыре заголовка блоков в `styles.css` ровно такого вида:
  `/* ===== 1. Токены и база ===== */`, `/* ===== 2. Первый экран ===== */`,
  `/* ===== 3. Проблема и решение ===== */`, `/* ===== 4. FAQ и форма ===== */`.
- Блоки 2–4 стилизуют только классы своих секций и не переопределяют блок 1.
- В HTML нет атрибутов `style` и `<script>` без `src`.
- В `<head>`: `<meta name="robots" content="noindex">` и `<link rel="icon" href="data:,">`.
- Заглушки остаются заглушками: `https://formspree.io/f/[ВАШ_ID]`, `@USERNAME`,
  `https://t.me/USERNAME`, `you@example.com`.
- Комментарии в коде — на русском и объясняют «зачем». Код простой: автор учится.
- Отступ — 2 пробела в HTML, CSS и JS. В JS — двойные кавычки и точка с запятой.
- Ветка — `homework-4-landing`. Не переключать ветки, не делать merge, push, rebase.
- Каждая задача заканчивается одним commit'ом из корня репозитория. Сообщение на русском,
  последняя строка: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Файлы спеки и плана не менять.

## Как проверять

Тестового фреймворка нет — проверки выполняются в настоящем браузере через Playwright MCP.
Если инструменты `mcp__playwright__*` не видны, загрузи их через ToolSearch:
`select:mcp__playwright__browser_navigate,mcp__playwright__browser_evaluate,mcp__playwright__browser_resize,mcp__playwright__browser_console_messages,mcp__playwright__browser_click,mcp__playwright__browser_take_screenshot`.

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

2. Адрес страницы: `http://127.0.0.1:8765/homework-4/index.html`.
3. Ширины экрана: `mcp__playwright__browser_resize` с `{"width": 1280, "height": 900}` и
   `{"width": 360, "height": 800}`.
4. Проверки — функции для `mcp__playwright__browser_evaluate` (параметр `function`). Результат
   сравнивается с ожидаемым JSON **поле в поле**. Любое расхождение — проверка не пройдена.
5. Консоль — `mcp__playwright__browser_console_messages` с `{"level": "error"}` сразу после
   `browser_navigate` на страницу. Ожидается: ни одного сообщения `[ERROR]`.

## Review Focus

1. **Поле из одних пробелов.** `required` пропускает `"   "` → ожидается «Заполните все поля.»
   и ни одного запроса. Тест — задача 4, проверка поведения, поле `blank`.
2. **Двойное нажатие «Получить оценку» во время отправки** → кнопка заблокирована, текст
   «Отправляю…», ровно один запрос. Тест — задача 4, поля `sending` и `sendingCalls`.
3. **Сервер ответил ошибкой или нет сети** → понятное сообщение с Telegram, кнопка снова
   активна. Тест — задача 4, поля `serverError` и `networkError`.
4. **Повторная отправка после успеха** → зелёный статус не остаётся рядом с новой ошибкой
   (класс `is-success` снимается). Тест — задача 4, `serverError.cls` идёт после `success`.
5. **Узкий экран 360 px и длинное слово без пробелов** → нет горизонтальной прокрутки.
   Тест — задача 1 (длинное слово), проверка ширины в задачах 1–5.

---

### Task 1: Каркас и базовые стили

**Files:**
- Create: `homework-4/index.html`
- Create: `homework-4/styles.css`

**Interfaces:**
- Consumes: ничего.
- Produces:
  - в `<main>` три маркера, каждый заменяет своя задача:
    `<!-- Задача 2: первый экран -->`, `<!-- Задача 3: проблема, что входит, как это работает -->`,
    `<!-- Задача 4: FAQ и форма -->`;
  - переменные: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`,
    `--color-accent-hover`, `--color-accent-soft`, `--color-border`, `--color-error`, `--font-sans`,
    `--radius`, `--container`;
  - классы: `.container`, `.btn`, `.btn--small`, `.section`, `.section--soft`, `.section-title`,
    `.section-intro`, `.site-header`, `.site-header__inner`, `.logo`, `.site-footer`,
    `.site-footer__inner`, `.site-footer__contacts`;
  - в `styles.css` пустые заголовки блоков 2, 3, 4 — под ними задачи 2–4 пишут свои правила;
  - `<body id="top">` — цель ссылки логотипа.

- [ ] **Step 1: Убедиться, что сервер работает**

Выполни шаг 1 раздела «Как проверять». Ожидается `200`.

- [ ] **Step 2: Запустить проверку каркаса до правок — она должна упасть**

`mcp__playwright__browser_navigate` → `http://127.0.0.1:8765/homework-4/index.html`, затем
`mcp__playwright__browser_evaluate` с функцией:

```js
async () => {
  const css = await (await fetch("styles.css")).text();
  const body = getComputedStyle(document.body);
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const headerCta = document.querySelector(".site-header .btn");
  return {
    lang: document.documentElement.lang,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? null,
    robots: document.querySelector('meta[name="robots"]')?.content ?? null,
    icon: document.querySelector('link[rel="icon"]')?.getAttribute("href") ?? null,
    bodyId: document.body.id,
    logo: [text(document.querySelector(".site-header .logo")), document.querySelector(".site-header .logo")?.getAttribute("href") ?? null],
    headerCta: [text(headerCta), headerCta?.getAttribute("href") ?? null],
    footer: text(document.querySelector(".site-footer")),
    markers: document.querySelector("main")?.innerHTML.match(/Задача \d/g) ?? null,
    background: body.backgroundColor,
    font: body.fontFamily,
    cssBlocks: css.match(/\/\* ===== \d\. [^=]+ ===== \*\//g),
  };
}
```

Ожидается FAIL: файла ещё нет, сервер отдаёт страницу 404 — `title` равен `"Error response"`.

- [ ] **Step 3: Создать `homework-4/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Запущу — запуск кода от ChatGPT и Claude под ключ</title>
  <meta name="description" content="Запущу ваш проект, написанный ChatGPT или Claude: сервер, домен, SSL и мониторинг. Оценка — бесплатно.">
  <!-- Временно: контакты и ID формы — заглушки, поэтому страница закрыта от поисковиков -->
  <meta name="robots" content="noindex">
  <!-- Пустая иконка: браузер не запрашивает favicon.ico и не пишет 404 в консоль -->
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles.css">
</head>
<body id="top">
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="#top">Запущу</a>
      <a class="btn btn--small" href="#form">Оценить проект</a>
    </div>
  </header>

  <main>
    <!-- Задача 2: первый экран -->

    <!-- Задача 3: проблема, что входит, как это работает -->

    <!-- Задача 4: FAQ и форма -->
  </main>

  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>Запущу — запуск AI-проектов под ключ</p>
      <ul class="site-footer__contacts">
        <li><a href="https://t.me/USERNAME">@USERNAME</a></li>
        <li><a href="mailto:you@example.com">you@example.com</a></li>
      </ul>
      <p>© 2026</p>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 4: Создать `homework-4/styles.css`**

```css
/* Стили лендинга «Запущу». Цвета — только через переменные из блока 1. */

/* ===== 1. Токены и база ===== */
:root {
  --color-bg: #faf7f2;
  --color-surface: #ffffff;
  --color-text: #1f2933;
  --color-muted: #52606d;
  --color-accent: #0f766e;
  --color-accent-hover: #115e59;
  --color-accent-soft: #e6f4f1;
  --color-border: #e4ddd3;
  --color-error: #b42318;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --radius: 12px;
  --container: 1100px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

/* Плавная прокрутка мешает тем, кто отключил анимации в системе */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  line-height: 1.6;
  /* Длинное слово или ссылка без пробелов переносится, а не распирает страницу */
  overflow-wrap: anywhere;
}

h1,
h2,
h3 {
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

p {
  margin: 0 0 1rem;
}

a {
  color: var(--color-accent);
}

a:hover {
  color: var(--color-accent-hover);
}

/* Видимая рамка фокуса для тех, кто ходит по странице клавишей Tab */
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 16px;
}

/* Кнопка: и ссылка-кнопка, и настоящая <button> в форме */
.btn {
  display: inline-block;
  padding: 0.875rem 1.5rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: var(--color-surface); /* белый текст на акцентном фоне */
  font: inherit;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.btn:hover {
  background: var(--color-accent-hover);
  color: var(--color-surface);
}

.btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
}

.site-header {
  border-bottom: 1px solid var(--color-border);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
}

.logo {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.section {
  padding: 4rem 0;
}

/* Мягкий бирюзовый фон, чтобы соседние секции не сливались */
.section--soft {
  background: var(--color-accent-soft);
}

.section-title {
  font-size: clamp(1.625rem, 4vw, 2.25rem);
}

.section-intro {
  max-width: 40rem;
  color: var(--color-muted);
  font-size: 1.125rem;
}

.site-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}

.site-footer p {
  margin: 0;
}

.site-footer__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ===== 2. Первый экран ===== */

/* ===== 3. Проблема и решение ===== */

/* ===== 4. FAQ и форма ===== */
```

- [ ] **Step 5: Запустить проверку каркаса — она должна пройти**

`mcp__playwright__browser_resize` → 1280×900, `browser_navigate` на страницу, затем функция из
Step 2. Ожидается ровно:

```json
{
  "lang": "ru",
  "title": "Запущу — запуск кода от ChatGPT и Claude под ключ",
  "description": "Запущу ваш проект, написанный ChatGPT или Claude: сервер, домен, SSL и мониторинг. Оценка — бесплатно.",
  "robots": "noindex",
  "icon": "data:,",
  "bodyId": "top",
  "logo": ["Запущу", "#top"],
  "headerCta": ["Оценить проект", "#form"],
  "footer": "Запущу — запуск AI-проектов под ключ @USERNAME you@example.com © 2026",
  "markers": ["Задача 2", "Задача 3", "Задача 4"],
  "background": "rgb(250, 247, 242)",
  "font": "system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif",
  "cssBlocks": [
    "/* ===== 1. Токены и база ===== */",
    "/* ===== 2. Первый экран ===== */",
    "/* ===== 3. Проблема и решение ===== */",
    "/* ===== 4. FAQ и форма ===== */"
  ]
}
```

- [ ] **Step 6: Проверить консоль, ширину и длинное слово**

1. `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.
2. Для 1280×900 и затем 360×800 (`browser_resize`, потом `browser_navigate` на страницу):

   ```js
   () => ({
     width: window.innerWidth,
     noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
   })
   ```

   Ожидается `{"width": 1280, "noHorizontalScroll": true}` и `{"width": 360, "noHorizontalScroll": true}`.
3. На ширине 360×800 — длинное слово без пробелов не распирает страницу:

   ```js
   () => {
     const p = document.querySelector(".site-footer p");
     const old = p.textContent;
     p.textContent = "https://example.com/" + "x".repeat(300);
     const ok = document.documentElement.scrollWidth <= document.documentElement.clientWidth;
     p.textContent = old;
     return ok;
   }
   ```

   Ожидается `true`.

- [ ] **Step 7: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/styles.css
git commit -F - <<'EOF'
homework-4: каркас лендинга и базовые стили

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Первый экран

**Files:**
- Modify: `homework-4/index.html` — заменить маркер `<!-- Задача 2: первый экран -->`
- Modify: `homework-4/styles.css` — блок `/* ===== 2. Первый экран ===== */`

**Interfaces:**
- Consumes (из задачи 1): `.container`, `.btn`, маркер `<!-- Задача 2: первый экран -->` в `<main>`,
  пустой заголовок блока 2 в `styles.css`.
- Produces: `section#hero` — первый элемент `<main>`; классы `.hero`, `.hero__title`,
  `.hero__accent`, `.hero__lead`, `.hero__actions`, `.hero__link`. Ссылки ведут на `#form`
  (появится в задаче 4) и `#steps` (появится в задаче 3) — до этого они никуда не прокручивают,
  это нормально.

- [ ] **Step 1: Запустить проверку первого экрана до правок — она должна упасть**

`browser_resize` → 1280×900, `browser_navigate` на страницу, затем:

```js
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const hero = document.querySelector("main > section#hero");
  if (!hero) return "нет section#hero";
  const primary = hero.querySelector(".btn");
  const secondary = hero.querySelector(".hero__link");
  return {
    firstInMain: document.querySelector("main").firstElementChild === hero,
    h1Count: document.querySelectorAll("h1").length,
    h1: text(hero.querySelector("h1")),
    accentLine: text(hero.querySelector("h1 .hero__accent")),
    lead: text(hero.querySelector(".hero__lead")),
    primary: [text(primary), primary?.getAttribute("href") ?? null],
    secondary: [text(secondary), secondary?.getAttribute("href") ?? null],
    h1FontSize: getComputedStyle(hero.querySelector("h1")).fontSize,
    marker2Gone: !document.querySelector("main").innerHTML.includes("Задача 2"),
  };
}
```

Ожидается FAIL: `"нет section#hero"`.

- [ ] **Step 2: Заменить маркер в `index.html`**

Строку `    <!-- Задача 2: первый экран -->` заменить на:

```html
    <section id="hero" class="hero">
      <div class="container">
        <h1 class="hero__title">ChatGPT написал вам код. <span class="hero__accent">Я запущу его в интернете</span></h1>
        <p class="hero__lead">Сервер, адрес сайта, защищённое соединение и присмотр за работой. Разбираться в серверах вам не придётся.</p>
        <div class="hero__actions">
          <a class="btn" href="#form">Получить бесплатную оценку</a>
          <a class="hero__link" href="#steps">Как это работает</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Заполнить блок 2 в `styles.css`**

Строку `/* ===== 2. Первый экран ===== */` заменить на неё же вместе с правилами (пустая строка
перед заголовком блока 3 сохраняется):

```css
/* ===== 2. Первый экран ===== */
.hero {
  padding: 4rem 0 3rem;
}

.hero__title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  /* Строки заголовка примерно одной длины — без одинокого слова в конце */
  text-wrap: balance;
}

/* Вторая фраза заголовка — с новой строки и акцентным цветом */
.hero__accent {
  display: block;
  color: var(--color-accent);
}

.hero__lead {
  max-width: 36rem;
  color: var(--color-muted);
  font-size: 1.25rem;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 2rem;
}

.hero__link {
  font-weight: 600;
}
```

- [ ] **Step 4: Запустить проверку первого экрана — она должна пройти**

`browser_resize` → 1280×900, `browser_navigate` на страницу, функция из Step 1. Ожидается ровно:

```json
{
  "firstInMain": true,
  "h1Count": 1,
  "h1": "ChatGPT написал вам код. Я запущу его в интернете",
  "accentLine": "Я запущу его в интернете",
  "lead": "Сервер, адрес сайта, защищённое соединение и присмотр за работой. Разбираться в серверах вам не придётся.",
  "primary": ["Получить бесплатную оценку", "#form"],
  "secondary": ["Как это работает", "#steps"],
  "h1FontSize": "56px",
  "marker2Gone": true
}
```

Затем `browser_resize` → 360×800, `browser_navigate`, та же функция: всё то же самое, но
`"h1FontSize": "32px"`.

- [ ] **Step 5: Проверить консоль и ширину**

1. `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.
2. Для 1280×900 и затем 360×800 (`browser_resize`, потом `browser_navigate`):

   ```js
   () => ({
     width: window.innerWidth,
     noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
   })
   ```

   Ожидается `{"width": 1280, "noHorizontalScroll": true}` и `{"width": 360, "noHorizontalScroll": true}`.

- [ ] **Step 6: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/styles.css
git commit -F - <<'EOF'
homework-4: первый экран лендинга

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Проблема, что входит, как это работает

**Files:**
- Modify: `homework-4/index.html` — заменить маркер `<!-- Задача 3: проблема, что входит, как это работает -->`
- Modify: `homework-4/styles.css` — блок `/* ===== 3. Проблема и решение ===== */`

**Interfaces:**
- Consumes (из задачи 1): `.container`, `.section`, `.section--soft`, `.section-title`,
  `.section-intro`, маркер задачи 3, пустой заголовок блока 3.
- Produces: `section#problem`, `section#included`, `section#steps` (цель ссылки «Как это
  работает» из задачи 2); классы `.cards`, `.card`, `.steps`, `.step`.

- [ ] **Step 1: Запустить проверку блока до правок — она должна упасть**

`browser_resize` → 1280×900, `browser_navigate` на страницу, затем:

```js
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const all = (selector) => [...document.querySelectorAll(selector)].map(text);
  const steps = [...document.querySelectorAll("#steps ol > li")];
  return {
    sections: [...document.querySelectorAll("main > section")].map((s) => s.id),
    problemTitle: text(document.querySelector("#problem h2")),
    problemIntro: text(document.querySelector("#problem .section-intro")),
    problemCards: all("#problem .card h3"),
    problemTexts: all("#problem .card p"),
    includedTitle: text(document.querySelector("#included h2")),
    includedIntro: text(document.querySelector("#included .section-intro")),
    includedTerms: all("#included dl dt"),
    includedDefs: all("#included dl dd"),
    stepsTitle: text(document.querySelector("#steps h2")),
    stepTitles: all("#steps ol > li h3"),
    stepTexts: all("#steps ol > li p"),
    stepRows: new Set(steps.map((li) => li.offsetTop)).size,
    marker3Gone: !document.querySelector("main").innerHTML.includes("Задача 3"),
  };
}
```

Ожидается FAIL: `"sections": ["hero"]`, `"problemTitle": null`.

- [ ] **Step 2: Заменить маркер в `index.html`**

Строку `    <!-- Задача 3: проблема, что входит, как это работает -->` заменить на:

```html
    <section id="problem" class="section">
      <div class="container">
        <h2 class="section-title">Код есть, а сайта нет</h2>
        <p class="section-intro">AI отлично пишет программы, но запускать их приходится самому. На этом шаге большинство проектов и останавливается.</p>
        <ul class="cards">
          <li class="card">
            <h3>Непонятно, куда загрузить файлы</h3>
            <p>Код лежит в чате или в архиве, а что с ним делать дальше — не сказано.</p>
          </li>
          <li class="card">
            <h3>Инструкции от AI полны слов вроде Docker, SSH и DNS</h3>
            <p>Каждое такое слово — ещё один вечер в поисковике, и не факт, что поможет.</p>
          </li>
          <li class="card">
            <h3>Страшно, что всё сломается или взломают</h3>
            <p>Непонятно, как проверить, что сайт защищён и не упадёт завтра.</p>
          </li>
        </ul>
      </div>
    </section>

    <section id="included" class="section section--soft">
      <div class="container">
        <h2 class="section-title">Что вы получаете</h2>
        <p class="section-intro">Всю техническую часть я беру на себя. Вот что будет у вашего проекта после запуска:</p>
        <!-- Список определений: термин и его объяснение простыми словами -->
        <dl class="cards">
          <div class="card">
            <dt>Сервер</dt>
            <dd>Компьютер в дата-центре, на котором ваша программа работает круглосуточно.</dd>
          </div>
          <div class="card">
            <dt>Домен</dt>
            <dd>Адрес вида вашпроект.by, по которому сайт открывают люди.</dd>
          </div>
          <div class="card">
            <dt>SSL-сертификат</dt>
            <dd>Замочек в адресной строке: данные между посетителем и сайтом шифруются.</dd>
          </div>
          <div class="card">
            <dt>Мониторинг</dt>
            <dd>Если сайт перестанет открываться, я узнаю об этом первым.</dd>
          </div>
        </dl>
      </div>
    </section>

    <section id="steps" class="section">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <ol class="cards steps">
          <li class="card step">
            <h3>Вы присылаете код</h3>
            <p>Архив, ссылку на GitHub или просто чат с AI. И пару слов о том, что программа должна делать.</p>
          </li>
          <li class="card step">
            <h3>Я оцениваю — бесплатно</h3>
            <p>Смотрю код и называю срок и цену. Если что-то нужно поправить до запуска, скажу сразу.</p>
          </li>
          <li class="card step">
            <h3>Вы получаете готовый сайт</h3>
            <p>Ссылку, по которой проект открывается, и доступы, чтобы он был полностью вашим.</p>
          </li>
        </ol>
      </div>
    </section>
```

- [ ] **Step 3: Заполнить блок 3 в `styles.css`**

Строку `/* ===== 3. Проблема и решение ===== */` заменить на неё же вместе с правилами (пустая
строка перед заголовком блока 4 сохраняется):

```css
/* ===== 3. Проблема и решение ===== */
/* Сетка карточек: одна колонка на телефоне, несколько — на широком экране */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
}

.card {
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.card h3,
.card dt {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}

.card p,
.card dd {
  margin: 0;
  color: var(--color-muted);
}

/* Шаги: одна колонка на телефоне, три в ряд от 768 px */
.steps {
  grid-template-columns: 1fr;
  counter-reset: step;
}

.step {
  counter-increment: step;
}

/* Номер шага в кружке рисует CSS — в разметке цифр нет */
.step::before {
  content: counter(step);
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-surface);
  font-weight: 700;
}

@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 4: Запустить проверку блока — она должна пройти**

`browser_resize` → 1280×900, `browser_navigate` на страницу, функция из Step 1. Ожидается ровно:

```json
{
  "sections": ["hero", "problem", "included", "steps"],
  "problemTitle": "Код есть, а сайта нет",
  "problemIntro": "AI отлично пишет программы, но запускать их приходится самому. На этом шаге большинство проектов и останавливается.",
  "problemCards": [
    "Непонятно, куда загрузить файлы",
    "Инструкции от AI полны слов вроде Docker, SSH и DNS",
    "Страшно, что всё сломается или взломают"
  ],
  "problemTexts": [
    "Код лежит в чате или в архиве, а что с ним делать дальше — не сказано.",
    "Каждое такое слово — ещё один вечер в поисковике, и не факт, что поможет.",
    "Непонятно, как проверить, что сайт защищён и не упадёт завтра."
  ],
  "includedTitle": "Что вы получаете",
  "includedIntro": "Всю техническую часть я беру на себя. Вот что будет у вашего проекта после запуска:",
  "includedTerms": ["Сервер", "Домен", "SSL-сертификат", "Мониторинг"],
  "includedDefs": [
    "Компьютер в дата-центре, на котором ваша программа работает круглосуточно.",
    "Адрес вида вашпроект.by, по которому сайт открывают люди.",
    "Замочек в адресной строке: данные между посетителем и сайтом шифруются.",
    "Если сайт перестанет открываться, я узнаю об этом первым."
  ],
  "stepsTitle": "Как это работает",
  "stepTitles": ["Вы присылаете код", "Я оцениваю — бесплатно", "Вы получаете готовый сайт"],
  "stepTexts": [
    "Архив, ссылку на GitHub или просто чат с AI. И пару слов о том, что программа должна делать.",
    "Смотрю код и называю срок и цену. Если что-то нужно поправить до запуска, скажу сразу.",
    "Ссылку, по которой проект открывается, и доступы, чтобы он был полностью вашим."
  ],
  "stepRows": 1,
  "marker3Gone": true
}
```

Затем `browser_resize` → 360×800, `browser_navigate`, та же функция: всё то же самое, но
`"stepRows": 3` (шаги встали в одну колонку).

- [ ] **Step 5: Проверить консоль и ширину**

1. `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.
2. Для 1280×900 и затем 360×800 (`browser_resize`, потом `browser_navigate`):

   ```js
   () => ({
     width: window.innerWidth,
     noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
   })
   ```

   Ожидается `{"width": 1280, "noHorizontalScroll": true}` и `{"width": 360, "noHorizontalScroll": true}`.

- [ ] **Step 6: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/styles.css
git commit -F - <<'EOF'
homework-4: блоки «проблема», «что входит» и «как это работает»

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: FAQ и форма заявки

**Files:**
- Modify: `homework-4/index.html` — заменить маркер `<!-- Задача 4: FAQ и форма -->`; в `<head>` подключить `script.js`
- Modify: `homework-4/styles.css` — блок `/* ===== 4. FAQ и форма ===== */`
- Create: `homework-4/script.js`

**Interfaces:**
- Consumes (из задачи 1): `.container`, `.section`, `.section--soft`, `.section-title`,
  `.section-intro`, `.btn`, маркер задачи 4, пустой заголовок блока 4.
- Produces: `section#faq`, `section#form` (цель кнопок «Оценить проект» и «Получить бесплатную
  оценку»), `form#lead-form`, `p#form-status`; классы `.faq`, `.faq__item`, `.lead-form`, `.field`,
  `.form-note`, `.form-status`, `.is-success`, `.is-error`. `script.js` опирается на `#lead-form`,
  `#form-status` и `button[type="submit"]` внутри формы.

- [ ] **Step 1: Запустить проверки формы до правок — они должны упасть**

`browser_resize` → 1280×900, `browser_navigate` на страницу, затем проверка разметки:

```js
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const form = document.getElementById("lead-form");
  if (!form) return "нет #lead-form";
  const field = (name) => {
    const el = form.elements.namedItem(name);
    return el && {
      tag: el.tagName.toLowerCase(),
      type: el.type,
      id: el.id,
      required: el.required,
      maxLength: el.maxLength,
      label: text(form.querySelector(`label[for="${name}"]`)),
      placeholder: el.placeholder,
    };
  };
  const faq = [...document.querySelectorAll("#faq details")];
  const status = document.getElementById("form-status");
  return {
    sections: [...document.querySelectorAll("main > section")].map((s) => s.id),
    faqTitle: text(document.querySelector("#faq h2")),
    faqQuestions: faq.map((d) => text(d.querySelector("summary"))),
    faqAnswers: faq.map((d) => text(d.querySelector("p"))),
    faqClosed: faq.every((d) => !d.open),
    formTitle: text(document.querySelector("#form h2")),
    formIntro: text(document.querySelector("#form .section-intro")),
    action: form.getAttribute("action"),
    method: form.getAttribute("method"),
    fields: ["name", "contact", "project"].map(field),
    autocompleteName: form.elements.namedItem("name").getAttribute("autocomplete"),
    projectRows: form.elements.namedItem("project").rows,
    button: text(form.querySelector('button[type="submit"]')),
    note: text(form.querySelector(".form-note")),
    status: status && [status.getAttribute("role"), status.getAttribute("aria-live"), status.textContent],
    scriptDefer: document.querySelector('script[src="script.js"]')?.defer ?? null,
    inlineScripts: document.querySelectorAll("script:not([src])").length,
    inlineStyles: document.querySelectorAll("[style]").length,
    markersGone: !document.querySelector("main").innerHTML.includes("Задача"),
  };
}
```

Ожидается FAIL: `"нет #lead-form"`.

Затем проверка поведения формы. Она подменяет `fetch`, поэтому ни одного настоящего запроса
к Formspree не уходит:

```js
async () => {
  const form = document.getElementById("lead-form");
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  const realFetch = window.fetch;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fill = (value) => {
    for (const name of ["name", "contact", "project"]) form.elements.namedItem(name).value = value;
  };
  const snapshot = () => ({
    text: status.textContent,
    cls: status.className,
    color: getComputedStyle(status).color,
    disabled: button.disabled,
    button: button.textContent,
  });
  // Страховка: если script.js не перехватил отправку, не даём браузеру уйти на Formspree
  let nativeSubmit = false;
  const guard = (event) => {
    if (!event.defaultPrevented) {
      event.preventDefault();
      nativeSubmit = true;
    }
  };
  form.addEventListener("submit", guard);
  const results = {};
  let calls = 0;

  // 1. Пустая форма не проходит встроенную проверку браузера
  fill("");
  results.emptyValid = form.checkValidity();

  // 2. Одни пробелы: required их пропускает, ловит script.js
  window.fetch = async () => {
    calls++;
    return new Response("{}", { status: 200 });
  };
  fill("   ");
  form.requestSubmit();
  await wait(50);
  results.blank = { ...snapshot(), calls };

  // 3. Успешная отправка
  calls = 0;
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.success = { ...snapshot(), calls, fieldsCleared: form.elements.namedItem("project").value === "" };

  // 4. Сервер ответил ошибкой (сразу после успеха — зелёный статус должен смениться красным)
  window.fetch = async () => new Response("{}", { status: 500 });
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.serverError = snapshot();

  // 5. Нет сети
  window.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.networkError = snapshot();

  // 6. Во время отправки кнопка заблокирована, повторный клик не шлёт второй запрос
  let release;
  calls = 0;
  window.fetch = () => {
    calls++;
    return new Promise((resolve) => {
      release = () => resolve(new Response("{}", { status: 200 }));
    });
  };
  fill("Тест");
  form.requestSubmit();
  await wait(20);
  results.sending = snapshot();
  button.click();
  await wait(20);
  results.sendingCalls = calls;
  release();
  await wait(50);
  results.afterSending = snapshot();

  window.fetch = realFetch;
  form.removeEventListener("submit", guard);
  results.nativeSubmit = nativeSubmit;
  return results;
}
```

Ожидается FAIL: ошибка `Cannot read properties of null` — формы ещё нет.

- [ ] **Step 2: Заменить маркер в `index.html`**

Строку `    <!-- Задача 4: FAQ и форма -->` заменить на:

```html
    <section id="faq" class="section">
      <div class="container">
        <h2 class="section-title">Частые вопросы</h2>
        <!-- <details> раскрывается по клику сам, без JavaScript -->
        <div class="faq">
          <details class="faq__item">
            <summary>Мне нужно что-то устанавливать?</summary>
            <p>Нет. Всё настраивается на сервере, от вас нужен только код и ответы на пару вопросов.</p>
          </details>
          <details class="faq__item">
            <summary>А если код не работает?</summary>
            <p>Это видно на этапе оценки. Я скажу, что именно не так и что нужно поправить, — и можно ли сделать это вместе с запуском.</p>
          </details>
          <details class="faq__item">
            <summary>Сколько это стоит?</summary>
            <p>Зависит от проекта: простой бот и сервис с базой данных — разная работа. Поэтому сначала бесплатная оценка, и цену вы узнаёте до начала работы.</p>
          </details>
          <details class="faq__item">
            <summary>Что будет после запуска?</summary>
            <p>Мониторинг включён: если сайт упадёт, я узнаю первым. Постоянную поддержку — обновления и доработки — можно подключить отдельно.</p>
          </details>
        </div>
      </div>
    </section>

    <section id="form" class="section section--soft">
      <div class="container">
        <h2 class="section-title">Бесплатная оценка проекта</h2>
        <p class="section-intro">Расскажите коротко о проекте — я отвечу, сколько займёт запуск и сколько он стоит.</p>
        <!-- [ВАШ_ID] — заглушка: без настоящего ID из Formspree отправка всегда заканчивается ошибкой -->
        <form id="lead-form" class="lead-form" action="https://formspree.io/f/[ВАШ_ID]" method="POST">
          <div class="field">
            <label for="name">Как вас зовут</label>
            <input id="name" name="name" type="text" required maxlength="80" autocomplete="name">
          </div>
          <div class="field">
            <label for="contact">Telegram или email</label>
            <input id="contact" name="contact" type="text" required maxlength="120" placeholder="@username или email">
          </div>
          <div class="field">
            <label for="project">Что за проект</label>
            <textarea id="project" name="project" rows="5" required maxlength="2000" placeholder="Например: Telegram-бот для записи клиентов, код написал ChatGPT"></textarea>
          </div>
          <button class="btn" type="submit">Получить оценку</button>
          <p class="form-note">Отвечу в течение дня.</p>
          <!-- Сюда script.js пишет результат отправки; aria-live зачитывает его скринридером -->
          <p id="form-status" class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
```

- [ ] **Step 3: Подключить `script.js` в `<head>`**

Строку `  <link rel="stylesheet" href="styles.css">` заменить на:

```html
  <link rel="stylesheet" href="styles.css">
  <!-- defer: скрипт выполнится, когда разметка уже готова -->
  <script src="script.js" defer></script>
```

- [ ] **Step 4: Заполнить блок 4 в `styles.css`**

Строку `/* ===== 4. FAQ и форма ===== */` заменить на неё же вместе с правилами (это конец файла):

```css
/* ===== 4. FAQ и форма ===== */
.faq {
  max-width: 48rem;
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.faq__item {
  border-bottom: 1px solid var(--color-border);
}

.faq__item summary {
  padding: 1rem 0;
  font-weight: 600;
  cursor: pointer;
}

.faq__item p {
  margin: 0 0 1rem;
  color: var(--color-muted);
}

.lead-form {
  display: grid;
  gap: 1.25rem;
  max-width: 36rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field label {
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.75rem 0.875rem;
  /* Рамка цветом --color-muted: граница поля должна отличаться от фона хотя бы в 3 раза */
  border: 1px solid var(--color-muted);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

.field textarea {
  resize: vertical;
}

/* Кнопка по ширине текста, а не на всю ширину формы */
.lead-form .btn {
  justify-self: start;
}

.form-note,
.form-status {
  margin: 0;
}

.form-note {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.form-status {
  font-weight: 600;
}

.form-status.is-success {
  color: var(--color-accent);
}

.form-status.is-error {
  color: var(--color-error);
}
```

- [ ] **Step 5: Создать `homework-4/script.js`**

```js
// Отправка формы заявки без перезагрузки страницы.
// Если скрипт не загрузился, форма всё равно работает: браузер отправит её обычным POST.

const form = document.getElementById("lead-form");
const formStatus = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');
const submitText = submitButton.textContent;

const MESSAGES = {
  empty: "Заполните все поля.",
  sending: "Отправляю…",
  success: "Спасибо! Заявка отправлена — отвечу в течение дня.",
  error: "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME",
};

// Показывает сообщение под формой. kind — "is-success", "is-error" или "" (без цвета).
function showStatus(text, kind) {
  formStatus.textContent = text;
  formStatus.classList.remove("is-success", "is-error");
  if (kind) {
    formStatus.classList.add(kind);
  }
}

// required пропускает поле из одних пробелов, поэтому проверяем сами
function hasBlankField() {
  return [...form.elements]
    .filter((field) => field.name)
    .some((field) => field.value.trim() === "");
}

form.addEventListener("submit", async (event) => {
  // Сюда попадаем, только если встроенная проверка браузера (required, maxlength) пройдена.
  // Обычную отправку отменяем всегда — дальше всё решает скрипт.
  event.preventDefault();

  if (hasBlankField()) {
    showStatus(MESSAGES.empty, "is-error");
    return;
  }

  // Блокируем кнопку, чтобы повторное нажатие не отправило заявку второй раз
  submitButton.disabled = true;
  submitButton.textContent = MESSAGES.sending;
  showStatus("", "");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      showStatus(MESSAGES.success, "is-success");
      form.reset();
    } else {
      showStatus(MESSAGES.error, "is-error");
    }
  } catch {
    // Сеть недоступна или сервер не ответил
    showStatus(MESSAGES.error, "is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitText;
  }
});
```

- [ ] **Step 6: Запустить проверку разметки — она должна пройти**

`browser_resize` → 1280×900, `browser_navigate` на страницу, функция проверки разметки из Step 1.
Ожидается ровно:

```json
{
  "sections": ["hero", "problem", "included", "steps", "faq", "form"],
  "faqTitle": "Частые вопросы",
  "faqQuestions": [
    "Мне нужно что-то устанавливать?",
    "А если код не работает?",
    "Сколько это стоит?",
    "Что будет после запуска?"
  ],
  "faqAnswers": [
    "Нет. Всё настраивается на сервере, от вас нужен только код и ответы на пару вопросов.",
    "Это видно на этапе оценки. Я скажу, что именно не так и что нужно поправить, — и можно ли сделать это вместе с запуском.",
    "Зависит от проекта: простой бот и сервис с базой данных — разная работа. Поэтому сначала бесплатная оценка, и цену вы узнаёте до начала работы.",
    "Мониторинг включён: если сайт упадёт, я узнаю первым. Постоянную поддержку — обновления и доработки — можно подключить отдельно."
  ],
  "faqClosed": true,
  "formTitle": "Бесплатная оценка проекта",
  "formIntro": "Расскажите коротко о проекте — я отвечу, сколько займёт запуск и сколько он стоит.",
  "action": "https://formspree.io/f/[ВАШ_ID]",
  "method": "POST",
  "fields": [
    {"tag": "input", "type": "text", "id": "name", "required": true, "maxLength": 80, "label": "Как вас зовут", "placeholder": ""},
    {"tag": "input", "type": "text", "id": "contact", "required": true, "maxLength": 120, "label": "Telegram или email", "placeholder": "@username или email"},
    {"tag": "textarea", "type": "textarea", "id": "project", "required": true, "maxLength": 2000, "label": "Что за проект", "placeholder": "Например: Telegram-бот для записи клиентов, код написал ChatGPT"}
  ],
  "autocompleteName": "name",
  "projectRows": 5,
  "button": "Получить оценку",
  "note": "Отвечу в течение дня.",
  "status": ["status", "polite", ""],
  "scriptDefer": true,
  "inlineScripts": 0,
  "inlineStyles": 0,
  "markersGone": true
}
```

- [ ] **Step 7: Запустить проверку поведения — она должна пройти**

На той же странице — функция проверки поведения из Step 1. Ожидается ровно:

```json
{
  "emptyValid": false,
  "blank": {"text": "Заполните все поля.", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку", "calls": 0},
  "success": {"text": "Спасибо! Заявка отправлена — отвечу в течение дня.", "cls": "form-status is-success", "color": "rgb(15, 118, 110)", "disabled": false, "button": "Получить оценку", "calls": 1, "fieldsCleared": true},
  "serverError": {"text": "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку"},
  "networkError": {"text": "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку"},
  "sending": {"text": "", "cls": "form-status", "color": "rgb(31, 41, 51)", "disabled": true, "button": "Отправляю…"},
  "sendingCalls": 1,
  "afterSending": {"text": "Спасибо! Заявка отправлена — отвечу в течение дня.", "cls": "form-status is-success", "color": "rgb(15, 118, 110)", "disabled": false, "button": "Получить оценку"},
  "nativeSubmit": false
}
```

- [ ] **Step 8: Проверить, что FAQ раскрывается кликом**

`browser_navigate` на страницу, затем `mcp__playwright__browser_click` с
`{"target": "#faq details:nth-of-type(3) > summary", "element": "Вопрос «Сколько это стоит?»"}`,
затем:

```js
() => [...document.querySelectorAll("#faq details")].map((d) => d.open)
```

Ожидается `[false, false, true, false]`.

- [ ] **Step 9: Проверить консоль и ширину**

1. `browser_navigate` на страницу, `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.
2. Для 1280×900 и затем 360×800 (`browser_resize`, потом `browser_navigate`):

   ```js
   () => ({
     width: window.innerWidth,
     noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
   })
   ```

   Ожидается `{"width": 1280, "noHorizontalScroll": true}` и `{"width": 360, "noHorizontalScroll": true}`.

- [ ] **Step 10: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/styles.css homework-4/script.js
git commit -F - <<'EOF'
homework-4: FAQ и форма заявки с отправкой через fetch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Финальная проверка, оглавление и CLAUDE.md

**Files:**
- Modify: `index.html` (корень репозитория) — строки 31–36: список работ и примечание
- Modify: `CLAUDE.md` (корень репозитория) — раздел «Сборка и запуск» и новый раздел в конце

**Interfaces:**
- Consumes: всю страницу `homework-4/` из задач 1–4.
- Produces: ссылку `homework-4/` в оглавлении, документацию для следующих сессий.

- [ ] **Step 1: Запустить проверку оглавления до правок — она должна упасть**

`browser_resize` → 1280×900, `browser_navigate` → `http://127.0.0.1:8765/index.html`, затем:

```js
() => {
  const link = [...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === "homework-4/");
  return {
    link: link ? link.textContent.trim() : null,
    note: document.querySelector(".note")?.textContent.trim() ?? null,
  };
}
```

Ожидается FAIL: `"link": null`.

- [ ] **Step 2: Добавить ссылку и обновить примечание в корневом `index.html`**

Блок

```html
    <li><a href="game-8-bit/cat/">game-8-bit/cat — 8-битная игра «Дорога домой» про кошку Лапку</a></li>
  </ul>

  <p class="note">Данные в резюме пока заглушки: страница опубликована для проверки вёрстки.</p>
```

заменить на

```html
    <li><a href="game-8-bit/cat/">game-8-bit/cat — 8-битная игра «Дорога домой» про кошку Лапку</a></li>
    <li><a href="homework-4/">homework-4 — лендинг «Запущу»: запуск AI-кода под ключ</a></li>
  </ul>

  <p class="note">Контакты в резюме и на лендинге пока заглушки: страницы опубликованы для проверки вёрстки.</p>
```

- [ ] **Step 3: Запустить проверку оглавления — она должна пройти**

`browser_navigate` → `http://127.0.0.1:8765/index.html`, функция из Step 1. Ожидается:

```json
{
  "link": "homework-4 — лендинг «Запущу»: запуск AI-кода под ключ",
  "note": "Контакты в резюме и на лендинге пока заглушки: страницы опубликованы для проверки вёрстки."
}
```

Затем `browser_click` с `{"target": "a[href=\"homework-4/\"]", "element": "Ссылка на homework-4"}` и:

```js
() => ({ url: location.href, title: document.title })
```

Ожидается `{"url": "http://127.0.0.1:8765/homework-4/", "title": "Запущу — запуск кода от ChatGPT и Claude под ключ"}`.

- [ ] **Step 4: Дополнить `CLAUDE.md`**

В разделе «Сборка и запуск» блок

```
start homework-1\index.html
start game-8-bit\cat\index.html
```

заменить на

```
start homework-1\index.html
start game-8-bit\cat\index.html
start homework-4\index.html
```

Сразу после абзаца, который начинается со слов «Локальный сервер нужен только если проверяешь
Open Graph или JSON-LD», вставить абзац и блок кода:

````
Второй случай, когда без сервера не обойтись, — проверка через Playwright MCP: он не открывает `file://` («Access to "file:" protocol is blocked»). Для него раздай корень репозитория локальным сервером — этот вариант отдаёт файлы с `Cache-Control: no-store`, чтобы браузер после правки не показывал старый CSS. Страницы тогда открываются по `http://127.0.0.1:8765/<папка>/`.

```
python -c "import http.server as s, functools as f; H = type('H', (s.SimpleHTTPRequestHandler,), {'end_headers': lambda self: (self.send_header('Cache-Control', 'no-store'), s.SimpleHTTPRequestHandler.end_headers(self))}); s.ThreadingHTTPServer(('127.0.0.1', 8765), f.partial(H, directory='E:/Domains/BELHARD')).serve_forever()"
```
````

(Внешние четыре обратные кавычки выше — только обёртка для этого плана, в `CLAUDE.md` их нет:
в файл идут абзац и блок кода с командой в обычных тройных кавычках.)

В конец файла добавить раздел:

```markdown

## homework-4 — лендинг «Запущу»

Лендинг услуги «запуск AI-сгенерированного кода под ключ» — идея №2 из `homework-3/product-ideas.md`. Аудитория — не-разработчики, которым код написал ChatGPT или Claude; главное действие — заявка на бесплатную оценку. Спека и план — в `homework-4/docs/superpowers/`.

Три файла без сборки: `index.html` — только разметка, `styles.css`, `script.js` — только отправка формы. Tailwind и CDN здесь сознательно не используются: для трёх файлов обычный CSS проще и нагляднее.

**Стили разбиты на четыре подписанных блока:** `/* ===== 1. Токены и база ===== */`, `2. Первый экран`, `3. Проблема и решение`, `4. FAQ и форма`. Блоки 2–4 стилизуют только свои секции. Все цвета — переменные на `:root`: нужен новый цвет — сначала заведи переменную.

**Форма отправляется на заглушку.** В `action` стоит `https://formspree.io/f/[ВАШ_ID]`, поэтому отправка всегда заканчивается сообщением «Не получилось отправить…», а в консоли появляется сетевая ошибка. Это не баг: нужен настоящий ID из кабинета Formspree. Контакты `@USERNAME` и `you@example.com` — тоже заглушки, страница закрыта `robots=noindex`. `@USERNAME` встречается и в подвале, и в тексте ошибки в `script.js` — меняешь контакт, правь оба места.

**Поле из одних пробелов** встроенная проверка `required` пропускает — его ловит `script.js` и пишет «Заполните все поля.».

**Что проверять после правок:**
- страница открывается двойным кликом, в консоли при загрузке ни одной ошибки;
- на ширине 360 и 1280 px нет горизонтальной прокрутки;
- кнопки «Оценить проект» и «Получить бесплатную оценку» ведут к форме, FAQ раскрывается;
- пустая форма не отправляется, форма из пробелов показывает «Заполните все поля.».
```

- [ ] **Step 5: Полная проверка текстов и порядка секций**

`browser_resize` → 1280×900, `browser_navigate` → `http://127.0.0.1:8765/homework-4/index.html`, затем:

```js
() => {
  const page = document.body.textContent.replace(/\s+/g, " ");
  const expected = [
    "Запущу", "Оценить проект",
    "ChatGPT написал вам код. Я запущу его в интернете",
    "Сервер, адрес сайта, защищённое соединение и присмотр за работой. Разбираться в серверах вам не придётся.",
    "Получить бесплатную оценку", "Как это работает",
    "Код есть, а сайта нет",
    "AI отлично пишет программы, но запускать их приходится самому. На этом шаге большинство проектов и останавливается.",
    "Непонятно, куда загрузить файлы",
    "Код лежит в чате или в архиве, а что с ним делать дальше — не сказано.",
    "Инструкции от AI полны слов вроде Docker, SSH и DNS",
    "Каждое такое слово — ещё один вечер в поисковике, и не факт, что поможет.",
    "Страшно, что всё сломается или взломают",
    "Непонятно, как проверить, что сайт защищён и не упадёт завтра.",
    "Что вы получаете",
    "Всю техническую часть я беру на себя. Вот что будет у вашего проекта после запуска:",
    "Сервер", "Компьютер в дата-центре, на котором ваша программа работает круглосуточно.",
    "Домен", "Адрес вида вашпроект.by, по которому сайт открывают люди.",
    "SSL-сертификат", "Замочек в адресной строке: данные между посетителем и сайтом шифруются.",
    "Мониторинг", "Если сайт перестанет открываться, я узнаю об этом первым.",
    "Вы присылаете код", "Архив, ссылку на GitHub или просто чат с AI. И пару слов о том, что программа должна делать.",
    "Я оцениваю — бесплатно", "Смотрю код и называю срок и цену. Если что-то нужно поправить до запуска, скажу сразу.",
    "Вы получаете готовый сайт", "Ссылку, по которой проект открывается, и доступы, чтобы он был полностью вашим.",
    "Частые вопросы",
    "Мне нужно что-то устанавливать?", "Нет. Всё настраивается на сервере, от вас нужен только код и ответы на пару вопросов.",
    "А если код не работает?", "Это видно на этапе оценки. Я скажу, что именно не так и что нужно поправить, — и можно ли сделать это вместе с запуском.",
    "Сколько это стоит?", "Зависит от проекта: простой бот и сервис с базой данных — разная работа. Поэтому сначала бесплатная оценка, и цену вы узнаёте до начала работы.",
    "Что будет после запуска?", "Мониторинг включён: если сайт упадёт, я узнаю первым. Постоянную поддержку — обновления и доработки — можно подключить отдельно.",
    "Бесплатная оценка проекта",
    "Расскажите коротко о проекте — я отвечу, сколько займёт запуск и сколько он стоит.",
    "Как вас зовут", "Telegram или email", "Что за проект",
    "Получить оценку", "Отвечу в течение дня.",
    "Запущу — запуск AI-проектов под ключ", "@USERNAME", "you@example.com", "© 2026",
  ];
  return {
    missing: expected.filter((s) => !page.includes(s)),
    sections: [...document.querySelectorAll("main > section")].map((s) => s.id),
    markersLeft: document.querySelector("main").innerHTML.includes("Задача"),
  };
}
```

Ожидается:

```json
{"missing": [], "sections": ["hero", "problem", "included", "steps", "faq", "form"], "markersLeft": false}
```

- [ ] **Step 6: Повторить проверку поведения формы (регрессия)**

На той же странице:

```js
async () => {
  const form = document.getElementById("lead-form");
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  const realFetch = window.fetch;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fill = (value) => {
    for (const name of ["name", "contact", "project"]) form.elements.namedItem(name).value = value;
  };
  const snapshot = () => ({
    text: status.textContent,
    cls: status.className,
    color: getComputedStyle(status).color,
    disabled: button.disabled,
    button: button.textContent,
  });
  // Страховка: если script.js не перехватил отправку, не даём браузеру уйти на Formspree
  let nativeSubmit = false;
  const guard = (event) => {
    if (!event.defaultPrevented) {
      event.preventDefault();
      nativeSubmit = true;
    }
  };
  form.addEventListener("submit", guard);
  const results = {};
  let calls = 0;

  // 1. Пустая форма не проходит встроенную проверку браузера
  fill("");
  results.emptyValid = form.checkValidity();

  // 2. Одни пробелы: required их пропускает, ловит script.js
  window.fetch = async () => {
    calls++;
    return new Response("{}", { status: 200 });
  };
  fill("   ");
  form.requestSubmit();
  await wait(50);
  results.blank = { ...snapshot(), calls };

  // 3. Успешная отправка
  calls = 0;
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.success = { ...snapshot(), calls, fieldsCleared: form.elements.namedItem("project").value === "" };

  // 4. Сервер ответил ошибкой (сразу после успеха — зелёный статус должен смениться красным)
  window.fetch = async () => new Response("{}", { status: 500 });
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.serverError = snapshot();

  // 5. Нет сети
  window.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  fill("Тест");
  form.requestSubmit();
  await wait(50);
  results.networkError = snapshot();

  // 6. Во время отправки кнопка заблокирована, повторный клик не шлёт второй запрос
  let release;
  calls = 0;
  window.fetch = () => {
    calls++;
    return new Promise((resolve) => {
      release = () => resolve(new Response("{}", { status: 200 }));
    });
  };
  fill("Тест");
  form.requestSubmit();
  await wait(20);
  results.sending = snapshot();
  button.click();
  await wait(20);
  results.sendingCalls = calls;
  release();
  await wait(50);
  results.afterSending = snapshot();

  window.fetch = realFetch;
  form.removeEventListener("submit", guard);
  results.nativeSubmit = nativeSubmit;
  return results;
}
```

Ожидается ровно:

```json
{
  "emptyValid": false,
  "blank": {"text": "Заполните все поля.", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку", "calls": 0},
  "success": {"text": "Спасибо! Заявка отправлена — отвечу в течение дня.", "cls": "form-status is-success", "color": "rgb(15, 118, 110)", "disabled": false, "button": "Получить оценку", "calls": 1, "fieldsCleared": true},
  "serverError": {"text": "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку"},
  "networkError": {"text": "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME", "cls": "form-status is-error", "color": "rgb(180, 35, 24)", "disabled": false, "button": "Получить оценку"},
  "sending": {"text": "", "cls": "form-status", "color": "rgb(31, 41, 51)", "disabled": true, "button": "Отправляю…"},
  "sendingCalls": 1,
  "afterSending": {"text": "Спасибо! Заявка отправлена — отвечу в течение дня.", "cls": "form-status is-success", "color": "rgb(15, 118, 110)", "disabled": false, "button": "Получить оценку"},
  "nativeSubmit": false
}
```

- [ ] **Step 7: Проверить якорные ссылки кликом**

`browser_navigate` на страницу (1280×900). Для каждой из трёх ссылок по очереди:

| `target` для `browser_click` | `element` | Ожидаемый `hash` |
|---|---|---|
| `.site-header .btn` | Кнопка «Оценить проект» в шапке | `#form` |
| `#hero .btn` | Кнопка «Получить бесплатную оценку» | `#form` |
| `#hero .hero__link` | Ссылка «Как это работает» | `#steps` |

Перед каждым кликом верни страницу наверх:

```js
() => {
  history.replaceState(null, "", location.pathname);
  window.scrollTo({ top: 0, behavior: "instant" });
  return window.scrollY;
}
```

Ожидается `0`. После клика (прокрутка плавная, поэтому функция ждёт):

```js
async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const rect = document.querySelector(location.hash).getBoundingClientRect();
  return { hash: location.hash, targetVisible: rect.top >= -1 && rect.top < window.innerHeight / 2 };
}
```

Ожидается `{"hash": "<из таблицы>", "targetVisible": true}`.

- [ ] **Step 8: Консоль, ширина и скриншоты**

1. `browser_navigate` на страницу, прокрутить до конца:

   ```js
   () => {
     window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
     return window.scrollY > 0;
   }
   ```

   Ожидается `true`. Затем `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.
2. Для 1280×900 и затем 360×800 (`browser_resize`, потом `browser_navigate`):

   ```js
   () => ({
     width: window.innerWidth,
     noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
   })
   ```

   Ожидается `{"width": 1280, "noHorizontalScroll": true}` и `{"width": 360, "noHorizontalScroll": true}`.
3. Скриншоты всей страницы: `mcp__playwright__browser_take_screenshot` с
   `{"fullPage": true, "scale": "css", "filename": ".playwright-mcp/homework-4-1280.png"}` на
   ширине 1280 и `{"fullPage": true, "scale": "css", "filename": ".playwright-mcp/homework-4-360.png"}`
   на ширине 360. Открой оба файла инструментом Read и опиши в отчёте, что видно: наложения,
   обрезанный текст, слипшиеся секции. Папка `.playwright-mcp/` уже в `.gitignore`.

- [ ] **Step 9: Commit**

```bash
cd /e/Domains/BELHARD
git add index.html CLAUDE.md
git commit -F - <<'EOF'
homework-4: ссылка в оглавлении и раздел в CLAUDE.md

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
