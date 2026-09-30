# Демо «Что нужно вашему проекту» — план реализации

> **Для исполнителей-агентов:** ОБЯЗАТЕЛЬНЫЙ SUB-SKILL: superpowers:subagent-driven-development
> (рекомендуется) или superpowers:executing-plans — выполнять план задача за задачей.
> Шаги отмечены чекбоксами (`- [ ]`).

**Goal:** страница-диагностика: шесть вопросов → паспорт запуска → паспорт одной ссылкой
уходит в форму заявки на лендинге.

**Architecture:** своя папка `homework-4/diagnostic/` с тремя файлами. `diagnostic.js` —
таблицы `QUESTIONS`, `GROUPS`, `TOPICS` и чистые функции подсчёта (задача 1), затем отрисовка
и обработчики (задача 2). Стили берутся из `../styles.css`, свои — в `diagnostic.css`.
Результат передаётся лендингу адресом `../index.html?project=…#form`, а `script.js` лендинга
подставляет его в поле «Что за проект» (задача 3).

**Tech Stack:** HTML5, CSS (custom properties, grid, flex, `:has`), чистый JavaScript,
`localStorage`. Проверка — Playwright MCP.

**Spec:** `homework-4/docs/superpowers/specs/2026-09-30-diagnostic-demo-design.md`

## Global Constraints

- Все новые файлы — в `E:\Domains\BELHARD\homework-4\diagnostic\`. Вне этой папки правятся
  только `homework-4/index.html`, `homework-4/script.js`, корневые `index.html` и `CLAUDE.md`,
  и только в задаче 3. `homework-4/styles.css` не меняется.
- Без сборки, npm, Tailwind, CDN, внешних шрифтов и библиотек.
- Тексты вопросов, правил и страницы — дословно из спеки (в этом плане они уже вписаны в код).
- Цвета — только через переменные `--color-*` из `styles.css`. В `diagnostic.css` нет ни
  одного hex-, `rgb()`- или именованного цвета.
- В HTML нет атрибутов `style` и `<script>` без `src`.
- Тексты на страницу — только через `textContent` или текстовые узлы, `innerHTML` не используется.
- В `<head>` демо: `<meta name="robots" content="noindex">` и `<link rel="icon" href="data:,">`.
- В подвале демо нет контактов.
- Ключ `localStorage` — ровно `zapushchu-diagnostic-answers`.
- Комментарии в коде — на русском и объясняют «зачем». Код простой: автор учится.
- Отступ — 2 пробела в HTML, CSS и JS. В JS — двойные кавычки и точка с запятой.
- Ветка — `homework-4-demos`. Не переключать ветки, не делать merge, push, rebase.
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

2. Адреса: демо — `http://127.0.0.1:8765/homework-4/diagnostic/index.html`, лендинг —
   `http://127.0.0.1:8765/homework-4/index.html`.
3. Ширины экрана: `mcp__playwright__browser_resize` с `{"width": 1280, "height": 900}` и
   `{"width": 360, "height": 800}`.
4. Проверки — функции для `mcp__playwright__browser_evaluate` (параметр `function`) или код для
   `mcp__playwright__browser_run_code_unsafe` (параметр `code`, функция получает `page`).
   Результат сравнивается с ожидаемым JSON **поле в поле**. Любое расхождение — проверка не пройдена.
5. Консоль — `mcp__playwright__browser_console_messages` с `{"level": "error"}` сразу после
   `browser_navigate` на страницу. Ожидается: ни одного сообщения `[ERROR]`.

## Review Focus

1. **Старые или испорченные данные в `localStorage`** (битый JSON, неизвестный ответ,
   ответ `"toString"`) → молча отбрасываются, страница стартует как с чистого листа.
   Тест — задача 1, проверка хранилища, поля `filtered` и `broken`.
2. **Хранилище запрещено** (приватный режим, блокировка данных сайтов) → демо работает, паспорт
   показывается, консоль чистая. Тест — задача 1 (поле `blocked`) и задача 2 (проверка
   с запрещённым хранилищем).
3. **Чужая ссылка на лендинг с `?project=`** — HTML-разметка или 2500 символов → текст попадает
   в поле как есть, обрезан до 2000, разметка не внедряется. Тест — задача 3, поля
   `longLength`, `htmlSame`, `imgs`, `flag`.
4. **Ответ изменён после показа паспорта** → паспорт и ссылка «Отправить паспорт»
   пересчитываются. Тест — задача 2, поля `afterChange` и `linkAfterChange`.
5. **Узкий экран 360 px с показанным паспортом из семи карточек** → нет горизонтальной
   прокрутки, каждый ответ не ниже 44 px. Тест — задача 2, проверка ширин.

---

### Task 1: Вопросы, правила и подсчёт паспорта

**Files:**
- Create: `homework-4/diagnostic/index.html`
- Create: `homework-4/diagnostic/diagnostic.css` (только заголовки блоков — заполняет задача 2)
- Create: `homework-4/diagnostic/diagnostic.js` (разделы 1–4 — раздел 5 дописывает задача 2)

**Interfaces:**
- Consumes: из `../styles.css` классы `.container`, `.btn`, `.btn--small`, `.site-header`,
  `.site-header__inner`, `.logo`, `.section`, `.section--soft`, `.section-title`,
  `.section-intro`, `.site-footer`, `.site-footer__inner`.
- Produces (глобальные имена `diagnostic.js`, их использует задача 2 и проверки):
  - `QUESTIONS` — массив `{ id, text, short, answers: { idОтвета: "текст" } }`;
  - `GROUPS` — массив `{ id, title }`;
  - `TOPICS` — массив тем, тема — массив правил `{ all?, any?, why?, group, title, text }`;
  - `matchRule(rule, answers)` → `string[] | null`;
  - `buildPassport(answers)` → `{ group, title, text, why }[]`;
  - `passportToText(answers)` → `string`;
  - `STORAGE_KEY`, `loadAnswers()` → объект ответов, `saveAnswers(answers)`, `clearAnswers()`.
- Produces (разметка `index.html`, её использует задача 2): `#quiz.quiz` с `#questions.quiz__questions`
  и кнопкой `submit`; `#passport[hidden]` с `#passport-title[tabindex="-1"]`,
  `#passport-groups`, `.passport__note`, `.passport__actions`, `a#send-passport.btn`,
  `button#restart.link-button`.

- [ ] **Step 1: Убедиться, что сервер работает**

Выполни шаг 1 раздела «Как проверять». Ожидается `200`.

- [ ] **Step 2: Запустить проверку подсчёта до правок — она должна упасть**

`mcp__playwright__browser_navigate` → `http://127.0.0.1:8765/homework-4/diagnostic/index.html`,
затем `mcp__playwright__browser_evaluate` с функцией:

```js
() => {
  const a = { kind: "bot", data: "yes", audience: "any", paid: "no", auto: "yes", where: "chat" };
  const b = { kind: "landing", data: "no", audience: "any", paid: "no", auto: "no", where: "archive" };
  const view = (answers) => buildPassport(answers).map((item) => [item.group, item.title, item.why]);
  return {
    questions: QUESTIONS.map((q) => [q.id, q.short, Object.keys(q.answers).length]),
    groups: GROUPS.map((g) => g.title),
    rulesPerTopic: TOPICS.map((rules) => rules.length),
    titles: TOPICS.flat().map((rule) => rule.title),
    a: view(a),
    b: view(b),
    textA: passportToText(a),
  };
}
```

Ожидается FAIL: файла ещё нет, сервер отдаёт 404 — ошибка `QUESTIONS is not defined`.

- [ ] **Step 3: Создать `homework-4/diagnostic/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Что нужно вашему проекту — Запущу</title>
  <meta name="description" content="Ответьте на шесть вопросов о проекте, который написал AI, и узнайте, что понадобится для его запуска.">
  <!-- Как и лендинг: пока на сайте заглушки, страница закрыта от поисковиков -->
  <meta name="robots" content="noindex">
  <!-- Пустая иконка: браузер не запрашивает favicon.ico и не пишет 404 в консоль -->
  <link rel="icon" href="data:,">
  <!-- Цвета, кнопки и карточки — общие с лендингом; свои стили демо идут после них -->
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="diagnostic.css">
  <!-- defer: скрипт выполнится, когда разметка уже готова -->
  <script src="diagnostic.js" defer></script>
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
        <h1 class="section-title">Что нужно вашему проекту</h1>
        <p class="section-intro">Шесть вопросов простыми словами — и вы увидите, что понадобится для запуска, а что нет. Ответы остаются в вашем браузере и никуда не отправляются.</p>
        <noscript>
          <p class="section-intro">Для диагностики нужен JavaScript. Если он выключен, просто <a href="../index.html#form">оставьте заявку</a> — я разберусь сам.</p>
        </noscript>
        <!-- Вопросы рисует diagnostic.js из таблицы QUESTIONS: тексты вопросов живут в одном месте -->
        <form id="quiz" class="quiz">
          <div id="questions" class="quiz__questions"></div>
          <button class="btn" type="submit">Показать паспорт</button>
        </form>
      </div>
    </section>

    <!-- Паспорт скрыт, пока человек не ответит на все вопросы -->
    <section id="passport" class="section section--soft" hidden>
      <div class="container">
        <!-- tabindex="-1": на заголовок можно перенести фокус из скрипта -->
        <h2 id="passport-title" class="section-title" tabindex="-1">Паспорт запуска</h2>
        <div id="passport-groups"></div>
        <p class="passport__note">Это первая прикидка по правилам. Точный ответ дам, когда посмотрю код.</p>
        <div class="passport__actions">
          <!-- Адрес ссылки с текстом паспорта собирает diagnostic.js -->
          <a id="send-passport" class="btn" href="../index.html#form">Отправить паспорт на бесплатную оценку</a>
          <button id="restart" class="link-button" type="button">Пройти заново</button>
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

- [ ] **Step 4: Создать `homework-4/diagnostic/diagnostic.css` с заголовками блоков**

```css
/* Стили демо «Что нужно вашему проекту». Цвета, кнопки и карточки — из ../styles.css. */

/* ===== 1. Вопросы ===== */

/* ===== 2. Паспорт ===== */
```

- [ ] **Step 5: Создать `homework-4/diagnostic/diagnostic.js` — разделы 1–4**

```js
// Диагностика «Что нужно вашему проекту»: шесть вопросов → правила → паспорт запуска.
// Всё считается в браузере — ответы никуда не отправляются.

// ===== 1. Вопросы =====
// id — это name у радиокнопок, ключи answers — их value.
// short — короткая подпись для строки «Почему» и для текста в форме заявки.
const QUESTIONS = [
  {
    id: "kind",
    text: "Что сделал для вас AI?",
    short: "Что сделал AI",
    answers: {
      landing: "Сайт-визитку",
      bot: "Telegram-бота",
      webapp: "Сайт с формой, личным кабинетом или оплатой",
      tool: "Программу для работы — таблицу, калькулятор, отчёт",
      unknown: "Не знаю, как это назвать",
    },
  },
  {
    id: "data",
    text: "Программа должна запоминать что-то между визитами — заказы, записи, пользователей?",
    short: "Запоминает данные",
    answers: { yes: "Да", no: "Нет", unknown: "Не знаю" },
  },
  {
    id: "audience",
    text: "Кто будет ею пользоваться?",
    short: "Кто пользуется",
    answers: { me: "Только я", team: "Моя команда", any: "Любой человек из интернета" },
  },
  {
    id: "paid",
    text: "Она обращается к платным сервисам — ChatGPT, приёму оплаты, рассылкам?",
    short: "Платные сервисы",
    answers: { yes: "Да", no: "Нет", unknown: "Не знаю" },
  },
  {
    id: "auto",
    text: "Она должна работать сама, без человека — присылать напоминания, что-то делать ночью?",
    short: "Работает сама",
    answers: { yes: "Да", no: "Нет", unknown: "Не знаю" },
  },
  {
    id: "where",
    text: "Где сейчас код?",
    short: "Где код",
    answers: {
      chat: "В чате с AI",
      archive: "В архиве или папке на компьютере",
      github: "На GitHub",
    },
  },
];

// ===== 2. Правила =====
// Группы паспорта — в порядке показа.
const GROUPS = [
  { id: "need", title: "Понадобится" },
  { id: "notNeeded", title: "Не понадобится" },
  { id: "check", title: "Проверю при бесплатной оценке" },
];

// Темы паспорта. По каждой теме берётся ПЕРВОЕ сработавшее правило,
// поэтому порядок правил внутри темы важен.
// all — каждый указанный вопрос получил один из перечисленных ответов;
// any — хотя бы один получил. Правило без условий срабатывает всегда,
// и вместо причин у него фиксированный текст why.
const TOPICS = [
  // 1. Где работает
  [
    {
      all: { kind: ["tool"], audience: ["me"] },
      group: "check",
      title: "Сервер или ваш компьютер",
      text: "Программу только для себя иногда проще запускать на своём компьютере. Посмотрю код и скажу, что выйдет проще и дешевле.",
    },
    {
      any: { kind: ["bot", "webapp", "tool"], data: ["yes"], paid: ["yes"], auto: ["yes"] },
      group: "need",
      title: "Сервер",
      text: "Компьютер в дата-центре, который не выключается: программа работает круглосуточно, даже когда ваш ноутбук закрыт.",
    },
    {
      all: { kind: ["landing"], data: ["no"], paid: ["no"], auto: ["no"] },
      group: "notNeeded",
      title: "Сервер",
      text: "Сайт из готовых страниц можно разместить на бесплатном хостинге — платить за сервер не придётся.",
    },
    {
      // Ловит всё, что не поймали правила выше: там остались только ответы «Не знаю»
      any: { kind: ["unknown"], data: ["unknown"], paid: ["unknown"], auto: ["unknown"] },
      group: "check",
      title: "Нужен ли сервер",
      text: "Зависит от того, что делает код. Посмотрю — возможно, хватит бесплатного хостинга.",
    },
  ],
  // 2. Адрес
  [
    {
      all: { kind: ["bot"] },
      group: "notNeeded",
      title: "Домен",
      text: "Бота находят в Telegram по имени — отдельный адрес сайта ему не нужен.",
    },
    {
      any: { kind: ["landing", "webapp"], audience: ["team", "any"] },
      group: "need",
      title: "Домен и SSL-сертификат",
      text: "Адрес вида вашпроект.by и замочек в адресной строке: данные посетителей шифруются.",
    },
  ],
  // 3. Данные
  [
    {
      all: { data: ["yes"] },
      group: "need",
      title: "База данных и резервные копии",
      text: "Заказы и записи хранятся в базе, а её копия каждый день уезжает в другое место: одна поломка не сотрёт всё.",
    },
    {
      all: { data: ["unknown"] },
      group: "check",
      title: "Хранит ли программа данные",
      text: "Если хранит, понадобятся база и резервные копии. Это видно по коду.",
    },
  ],
  // 4. Ключи
  [
    {
      all: { paid: ["yes"] },
      group: "need",
      title: "Надёжное место для ключей",
      text: "Ключ от ChatGPT или приёма оплаты — это доступ к вашим деньгам. На сервере он хранится отдельно от кода, а не внутри него.",
    },
    {
      all: { paid: ["unknown"] },
      group: "check",
      title: "Нет ли в коде ключей",
      text: "AI часто вписывает ключи прямо в код. Если найду — перенесу в надёжное место.",
    },
  ],
  // 5. Работа без человека
  [
    {
      all: { auto: ["yes"] },
      group: "need",
      title: "Автозапуск и расписание",
      text: "После сбоя программа поднимется сама, а напоминания и ночные задачи будут выполняться по расписанию.",
    },
    {
      all: { auto: ["unknown"] },
      group: "check",
      title: "Работает ли программа по расписанию",
      text: "Напоминания и ночные задачи требуют отдельной настройки — увижу это по коду.",
    },
  ],
  // 6. Доступ
  [
    {
      all: { audience: ["me", "team"] },
      group: "need",
      title: "Вход только для своих",
      text: "Закрою программу паролем или списком разрешённых людей — посторонние не смогут ею пользоваться, даже если найдут.",
    },
    {
      all: { audience: ["any"], kind: ["webapp"] },
      group: "need",
      title: "Защита от спама",
      text: "Открытую всем форму быстро находят спам-боты. Поставлю защиту, чтобы заявки приходили от людей.",
    },
  ],
  // 7. Присмотр
  [
    {
      why: "входит в любой запуск",
      group: "need",
      title: "Мониторинг",
      text: "Если проект перестанет открываться, я узнаю об этом первым.",
    },
  ],
  // 8. Где код
  [
    {
      all: { where: ["chat"] },
      group: "check",
      title: "Код из чата",
      text: "В чате код обычно разбит на куски. Соберу их в один проект и проверю, что ничего не потерялось.",
    },
    {
      all: { where: ["github"] },
      group: "check",
      title: "Открыт ли репозиторий",
      text: "Открытый репозиторий видят все. Проверю, не попали ли туда пароли и ключи.",
    },
  ],
];

// ===== 3. Подсчёт паспорта =====
// Функции этого раздела не трогают страницу — их можно вызвать из консоли браузера.
// answers — объект вида { kind: "bot", data: "yes", … }.

function findQuestion(questionId) {
  return QUESTIONS.find((question) => question.id === questionId);
}

// Проверяет одно правило. Возвращает id вопросов-причин или null, если правило не сработало.
function matchRule(rule, answers) {
  const reasons = [];

  if (rule.all) {
    for (const [questionId, values] of Object.entries(rule.all)) {
      if (!values.includes(answers[questionId])) {
        return null;
      }
      reasons.push(questionId);
    }
  }

  if (rule.any) {
    // В причины попадают только совпавшие вопросы, а не все перечисленные
    const matched = Object.keys(rule.any).filter((questionId) =>
      rule.any[questionId].includes(answers[questionId])
    );
    if (matched.length === 0) {
      return null;
    }
    reasons.push(...matched);
  }

  return reasons;
}

// Строка «Почему: …» — из каких ответов получился вывод
function explain(rule, reasons, answers) {
  if (reasons.length === 0) {
    return `Почему: ${rule.why}`;
  }
  const parts = reasons.map((questionId) => {
    const question = findQuestion(questionId);
    return `${question.short} — «${question.answers[answers[questionId]]}»`;
  });
  return `Почему: ${parts.join("; ")}`;
}

// Собирает паспорт: по каждой теме — первое сработавшее правило
function buildPassport(answers) {
  const items = [];
  for (const rules of TOPICS) {
    for (const rule of rules) {
      const reasons = matchRule(rule, answers);
      if (reasons !== null) {
        items.push({
          group: rule.group,
          title: rule.title,
          text: rule.text,
          why: explain(rule, reasons, answers),
        });
        break; // остальные правила этой темы уже не смотрим
      }
    }
  }
  return items;
}

// Текст для поля «Что за проект» в форме заявки: ответы и заголовки пунктов, без пояснений
function passportToText(answers) {
  const items = buildPassport(answers);
  const lines = ["Паспорт запуска из диагностики на сайте"];
  for (const question of QUESTIONS) {
    lines.push(`${question.short}: ${question.answers[answers[question.id]]}`);
  }
  lines.push("");
  for (const group of GROUPS) {
    const titles = items.filter((item) => item.group === group.id).map((item) => item.title);
    if (titles.length > 0) {
      lines.push(`${group.title}: ${titles.join("; ")}`);
    }
  }
  return lines.join("\n");
}

// ===== 4. Сохранение ответов =====
// localStorage бывает недоступен: приватный режим, запрет хранить данные сайтов.
// Тогда демо просто не запоминает ответы — без ошибок в консоли.
const STORAGE_KEY = "zapushchu-diagnostic-answers";

// Читает сохранённые ответы. Неизвестные вопросы и ответы отбрасывает:
// данные могли остаться от старой версии правил или быть испорчены.
function loadAnswers() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
  if (!saved || typeof saved !== "object") {
    return {};
  }
  const answers = {};
  for (const question of QUESTIONS) {
    const value = saved[question.id];
    // hasOwn, а не in: иначе ответ "toString" нашёлся бы у любого объекта
    if (Object.hasOwn(question.answers, value)) {
      answers[question.id] = value;
    }
  }
  return answers;
}

function saveAnswers(answers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Хранилище недоступно — ответы живут до перезагрузки страницы
  }
}

function clearAnswers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Хранилище недоступно — очищать нечего
  }
}
```

- [ ] **Step 6: Повторить проверку подсчёта — теперь она должна пройти**

`browser_navigate` на демо, консоль — без ошибок. Затем функция из шага 2. Ожидается:

```json
{
  "questions": [["kind", "Что сделал AI", 5], ["data", "Запоминает данные", 3], ["audience", "Кто пользуется", 3], ["paid", "Платные сервисы", 3], ["auto", "Работает сама", 3], ["where", "Где код", 3]],
  "groups": ["Понадобится", "Не понадобится", "Проверю при бесплатной оценке"],
  "rulesPerTopic": [4, 2, 2, 2, 2, 2, 1, 2],
  "titles": ["Сервер или ваш компьютер", "Сервер", "Сервер", "Нужен ли сервер", "Домен", "Домен и SSL-сертификат", "База данных и резервные копии", "Хранит ли программа данные", "Надёжное место для ключей", "Нет ли в коде ключей", "Автозапуск и расписание", "Работает ли программа по расписанию", "Вход только для своих", "Защита от спама", "Мониторинг", "Код из чата", "Открыт ли репозиторий"],
  "a": [
    ["need", "Сервер", "Почему: Что сделал AI — «Telegram-бота»; Запоминает данные — «Да»; Работает сама — «Да»"],
    ["notNeeded", "Домен", "Почему: Что сделал AI — «Telegram-бота»"],
    ["need", "База данных и резервные копии", "Почему: Запоминает данные — «Да»"],
    ["need", "Автозапуск и расписание", "Почему: Работает сама — «Да»"],
    ["need", "Мониторинг", "Почему: входит в любой запуск"],
    ["check", "Код из чата", "Почему: Где код — «В чате с AI»"]
  ],
  "b": [
    ["notNeeded", "Сервер", "Почему: Что сделал AI — «Сайт-визитку»; Запоминает данные — «Нет»; Платные сервисы — «Нет»; Работает сама — «Нет»"],
    ["need", "Домен и SSL-сертификат", "Почему: Что сделал AI — «Сайт-визитку»; Кто пользуется — «Любой человек из интернета»"],
    ["need", "Мониторинг", "Почему: входит в любой запуск"]
  ],
  "textA": "Паспорт запуска из диагностики на сайте\nЧто сделал AI: Telegram-бота\nЗапоминает данные: Да\nКто пользуется: Любой человек из интернета\nПлатные сервисы: Нет\nРаботает сама: Да\nГде код: В чате с AI\n\nПонадобится: Сервер; База данных и резервные копии; Автозапуск и расписание; Мониторинг\nНе понадобится: Домен\nПроверю при бесплатной оценке: Код из чата"
}
```

- [ ] **Step 7: Перебор всех 1215 сочетаний ответов**

`browser_evaluate` с функцией:

```js
() => {
  // Все сочетания: по одному ответу на каждый вопрос
  let combos = [{}];
  for (const question of QUESTIONS) {
    const next = [];
    for (const combo of combos) {
      for (const value of Object.keys(question.answers)) {
        next.push({ ...combo, [question.id]: value });
      }
    }
    combos = next;
  }

  const problems = [];
  for (const answers of combos) {
    const key = JSON.stringify(answers);
    const items = buildPassport(answers);
    // Сколько пунктов дала каждая тема: пункт узнаём по паре «группа + заголовок»
    const perTopic = TOPICS.map((rules) =>
      items.filter((item) => rules.some((rule) => rule.group === item.group && rule.title === item.title)).length
    );
    const text = passportToText(answers);
    if (perTopic[0] !== 1) problems.push(`тема 1 дала ${perTopic[0]}: ${key}`);
    if (perTopic.some((count) => count > 1)) problems.push(`тема дала два пункта: ${key}`);
    if (perTopic.reduce((sum, count) => sum + count, 0) !== items.length) problems.push(`пункт вне тем: ${key}`);
    if (!items.some((item) => item.group === "need" && item.title === "Мониторинг")) problems.push(`нет мониторинга: ${key}`);
    if (items.some((item) => !item.why.startsWith("Почему: ") || item.why.length <= "Почему: ".length)) problems.push(`пустое «Почему»: ${key}`);
    if (text.length > 2000) problems.push(`текст длиннее 2000: ${key}`);
    if (text.includes("undefined") || items.some((item) => item.why.includes("undefined"))) problems.push(`undefined в тексте: ${key}`);
  }
  return { combos: combos.length, problemCount: problems.length, firstProblems: problems.slice(0, 5) };
}
```

Ожидается:

```json
{ "combos": 1215, "problemCount": 0, "firstProblems": [] }
```

- [ ] **Step 8: Проверка хранилища — испорченные данные и запрет**

`browser_evaluate` с функцией:

```js
() => {
  localStorage.removeItem(STORAGE_KEY);
  const empty = loadAnswers();
  saveAnswers({ kind: "bot", data: "yes" });
  const saved = loadAnswers();
  localStorage.setItem(STORAGE_KEY, '{"kind":"spaceship","data":"no","extra":"x","where":"toString"}');
  const filtered = loadAnswers();
  localStorage.setItem(STORAGE_KEY, "{сломано");
  const broken = loadAnswers();
  clearAnswers();
  const cleared = localStorage.getItem(STORAGE_KEY);

  // Запрещённое хранилище: любое обращение к localStorage бросает ошибку
  const original = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Хранилище запрещено", "SecurityError");
    },
  });
  let blocked;
  try {
    saveAnswers({ kind: "bot" });
    clearAnswers();
    blocked = loadAnswers();
  } catch (error) {
    blocked = `ошибка: ${error.message}`;
  } finally {
    Object.defineProperty(window, "localStorage", original);
  }

  return { key: STORAGE_KEY, empty, saved, filtered, broken, cleared, blocked };
}
```

Ожидается:

```json
{
  "key": "zapushchu-diagnostic-answers",
  "empty": {},
  "saved": { "kind": "bot", "data": "yes" },
  "filtered": { "data": "no" },
  "broken": {},
  "cleared": null,
  "blocked": {}
}
```

- [ ] **Step 9: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/diagnostic/index.html homework-4/diagnostic/diagnostic.css homework-4/diagnostic/diagnostic.js
git commit -F - <<'EOF'
homework-4: диагностика — вопросы, правила и подсчёт паспорта

Каркас страницы diagnostic/ и разделы 1–4 diagnostic.js: таблицы QUESTIONS,
GROUPS, TOPICS, подсчёт паспорта и сохранение ответов в localStorage.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Страница — вопросы, паспорт, сохранение

**Files:**
- Modify: `homework-4/diagnostic/diagnostic.css` (заполнить блоки 1 и 2)
- Modify: `homework-4/diagnostic/diagnostic.js` (дописать раздел 5 в конец файла)

**Interfaces:**
- Consumes: из задачи 1 — `QUESTIONS`, `GROUPS`, `buildPassport(answers)`,
  `passportToText(answers)`, `loadAnswers()`, `saveAnswers(answers)`, `clearAnswers()`,
  `STORAGE_KEY`; разметку `#quiz`, `#questions`, `#passport`, `#passport-title`,
  `#passport-groups`, `#send-passport`, `#restart`.
- Produces: разметку, которую строит скрипт (её проверяют тесты):
  `fieldset.question > legend + div.answers > label.answer > input[type=radio][required]`;
  `div.passport__group > h3 + ul.cards > li.card > h4 + p + p.why`;
  `href` у `#send-passport` вида `../index.html?project=<encodeURIComponent(текст)>#form`.

- [ ] **Step 1: Запустить проверку страницы до правок — она должна упасть**

`browser_navigate` на демо, затем `browser_evaluate` с функцией
`() => { localStorage.removeItem("zapushchu-diagnostic-answers"); return true; }`,
снова `browser_navigate` на демо (страница стартует с чистого листа), затем
`browser_evaluate` с функцией:

```js
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const quiz = document.getElementById("quiz");
  const passport = document.getElementById("passport");
  const submit = quiz.querySelector('button[type="submit"]');
  const link = document.getElementById("send-passport");
  const pick = (name, value) => quiz.querySelector(`input[name="${name}"][value="${value}"]`).click();

  const validBefore = quiz.checkValidity();
  submit.click();
  const hiddenAfterEmptySubmit = passport.hidden;

  pick("kind", "bot");
  pick("data", "yes");
  pick("audience", "any");
  pick("paid", "no");
  pick("auto", "yes");
  submit.click(); // вопрос «Где код» пропущен
  const hiddenWithOneMissing = passport.hidden;

  pick("where", "chat");
  submit.click();
  const result = {
    legends: [...quiz.querySelectorAll("legend")].map(text),
    answersPerQuestion: [...quiz.querySelectorAll(".question")].map((fs) => fs.querySelectorAll('input[type="radio"][required]').length),
    validBefore,
    hiddenAfterEmptySubmit,
    hiddenWithOneMissing,
    hiddenAfterFull: passport.hidden,
    focused: document.activeElement ? document.activeElement.id : null,
    groups: [...passport.querySelectorAll(".passport__group")].map((g) => [text(g.querySelector("h3")), [...g.querySelectorAll(".card h4")].map(text)]),
    firstWhy: text(passport.querySelector(".card .why")),
    linkStart: link.getAttribute("href").startsWith("../index.html?project="),
    linkEnd: link.getAttribute("href").endsWith("#form"),
    linkFirstLine: new URL(link.href).searchParams.get("project").split("\n")[0],
    saved: localStorage.getItem("zapushchu-diagnostic-answers"),
  };

  // Ответ изменён после показа паспорта — паспорт и ссылка пересчитываются
  pick("kind", "webapp");
  result.afterChange = [...passport.querySelectorAll(".card h4")].map(text);
  result.linkAfterChange = new URL(link.href).searchParams.get("project").includes("Защита от спама");
  return result;
}
```

Ожидается FAIL: вопросов на странице нет, `quiz.querySelector(...)` возвращает `null` —
ошибка `Cannot read properties of null (reading 'click')`.

- [ ] **Step 2: Заполнить `homework-4/diagnostic/diagnostic.css`**

Весь файл:

```css
/* Стили демо «Что нужно вашему проекту». Цвета, кнопки и карточки — из ../styles.css. */

/* ===== 1. Вопросы ===== */
.quiz {
  display: grid;
  gap: 1.5rem;
  max-width: 48rem;
  margin-top: 2rem;
}

.quiz__questions {
  display: grid;
  gap: 1.25rem;
}

/* Кнопка по ширине текста, а не на всю ширину формы */
.quiz .btn {
  justify-self: start;
}

.question {
  /* fieldset по умолчанию не сжимается уже своего содержимого — на узком экране это даёт прокрутку */
  min-width: 0;
  margin: 0;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

/* float переносит легенду с рамки fieldset внутрь карточки */
.question legend {
  float: left;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0;
  font-weight: 700;
  line-height: 1.3;
}

.answers {
  clear: both; /* ответы начинаются под легендой, а не рядом с ней */
  display: grid;
  gap: 0.5rem;
}

.answer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px; /* удобно попасть пальцем */
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
}

.answer input {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: var(--color-accent);
}

/* Отмеченный ответ видно сразу, не вглядываясь в кружок */
.answer:has(input:checked) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

/* ===== 2. Паспорт ===== */
/* У #passport не задаём display: иначе атрибут hidden перестанет его прятать */
.passport__group {
  margin-top: 2rem;
}

.passport__group h3 {
  margin: 0;
  font-size: 1.25rem;
}

/* Сетка карточек из styles.css отступает сверху на 2rem — под заголовком группы хватит меньшего */
.passport__group .cards {
  margin-top: 1rem;
}

/* Заголовок пункта — как заголовок карточки на лендинге (.card h3) */
.card h4 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}

.card .why {
  margin-top: 0.75rem;
  font-size: 0.9375rem;
}

.passport__note {
  margin: 2rem 0 0;
  color: var(--color-muted);
}

.passport__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 1.5rem;
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
```

- [ ] **Step 3: Дописать раздел 5 в конец `homework-4/diagnostic/diagnostic.js`**

```js

// ===== 5. Страница =====
const quiz = document.getElementById("quiz");
const questionsBox = document.getElementById("questions");
const passport = document.getElementById("passport");
const passportTitle = document.getElementById("passport-title");
const passportGroups = document.getElementById("passport-groups");
const sendLink = document.getElementById("send-passport");
const restartButton = document.getElementById("restart");

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

// Рисует вопросы из QUESTIONS: fieldset с легендой и радиокнопки-ответы
function renderQuestions() {
  QUESTIONS.forEach((question, index) => {
    const fieldset = createNode("fieldset", "question");
    fieldset.append(createNode("legend", "", `${index + 1}. ${question.text}`));
    const answersBox = createNode("div", "answers");
    for (const [value, text] of Object.entries(question.answers)) {
      const label = createNode("label", "answer");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = question.id;
      input.value = value;
      // required на группе: браузер сам не даст показать паспорт с пропущенным вопросом
      input.required = true;
      label.append(input, text); // строка превращается в текстовый узел, не в разметку
      answersBox.append(label);
    }
    fieldset.append(answersBox);
    questionsBox.append(fieldset);
  });
}

// Ответы, отмеченные сейчас на странице
function readAnswers() {
  const answers = {};
  for (const question of QUESTIONS) {
    // Для группы радиокнопок value — значение отмеченной или "", если не отмечена ни одна
    const value = quiz.elements[question.id].value;
    if (value) {
      answers[question.id] = value;
    }
  }
  return answers;
}

// Отмечает сохранённые ответы на странице
function applyAnswers(answers) {
  for (const [questionId, value] of Object.entries(answers)) {
    quiz.elements[questionId].value = value;
  }
}

function isComplete(answers) {
  return QUESTIONS.every((question) => answers[question.id]);
}

// Рисует паспорт и обновляет ссылку «Отправить паспорт на бесплатную оценку»
function renderPassport(answers) {
  const items = buildPassport(answers);
  passportGroups.replaceChildren();
  for (const group of GROUPS) {
    const groupItems = items.filter((item) => item.group === group.id);
    if (groupItems.length === 0) {
      continue; // пустую группу не показываем
    }
    const box = createNode("div", "passport__group");
    box.append(createNode("h3", "", group.title));
    const list = createNode("ul", "cards");
    for (const item of groupItems) {
      const card = createNode("li", "card");
      card.append(
        createNode("h4", "", item.title),
        createNode("p", "", item.text),
        createNode("p", "why", item.why)
      );
      list.append(card);
    }
    box.append(list);
    passportGroups.append(box);
  }
  // Результат уходит в форму лендинга через адрес ссылки — сервер для этого не нужен
  sendLink.href = `../index.html?project=${encodeURIComponent(passportToText(answers))}#form`;
}

quiz.addEventListener("change", () => {
  const answers = readAnswers();
  saveAnswers(answers);
  // Паспорт уже на экране — пересчитываем, чтобы он не расходился с ответами
  if (!passport.hidden) {
    renderPassport(answers);
  }
});

quiz.addEventListener("submit", (event) => {
  // Сюда попадаем, только если браузер убедился, что отвечены все вопросы
  event.preventDefault();
  renderPassport(readAnswers());
  passport.hidden = false;
  // Фокус на заголовок: скринридер его прочитает, а телефон прокрутит страницу к паспорту
  passportTitle.focus();
});

restartButton.addEventListener("click", () => {
  clearAnswers();
  quiz.reset();
  passport.hidden = true;
  quiz.querySelector("input").focus();
});

// Старт: рисуем вопросы, возвращаем сохранённые ответы и, если их хватает, сразу показываем паспорт
renderQuestions();
const savedAnswers = loadAnswers();
applyAnswers(savedAnswers);
if (isComplete(savedAnswers)) {
  renderPassport(savedAnswers);
  passport.hidden = false;
}
```

- [ ] **Step 4: Повторить проверку страницы — теперь она должна пройти**

Повтори шаг 1 целиком (очистка хранилища, перезагрузка, функция). Консоль после загрузки —
без ошибок. Ожидается:

```json
{
  "legends": ["1. Что сделал для вас AI?", "2. Программа должна запоминать что-то между визитами — заказы, записи, пользователей?", "3. Кто будет ею пользоваться?", "4. Она обращается к платным сервисам — ChatGPT, приёму оплаты, рассылкам?", "5. Она должна работать сама, без человека — присылать напоминания, что-то делать ночью?", "6. Где сейчас код?"],
  "answersPerQuestion": [5, 3, 3, 3, 3, 3],
  "validBefore": false,
  "hiddenAfterEmptySubmit": true,
  "hiddenWithOneMissing": true,
  "hiddenAfterFull": false,
  "focused": "passport-title",
  "groups": [["Понадобится", ["Сервер", "База данных и резервные копии", "Автозапуск и расписание", "Мониторинг"]], ["Не понадобится", ["Домен"]], ["Проверю при бесплатной оценке", ["Код из чата"]]],
  "firstWhy": "Почему: Что сделал AI — «Telegram-бота»; Запоминает данные — «Да»; Работает сама — «Да»",
  "linkStart": true,
  "linkEnd": true,
  "linkFirstLine": "Паспорт запуска из диагностики на сайте",
  "saved": "{\"kind\":\"bot\",\"data\":\"yes\",\"audience\":\"any\",\"paid\":\"no\",\"auto\":\"yes\",\"where\":\"chat\"}",
  "afterChange": ["Сервер", "Домен и SSL-сертификат", "База данных и резервные копии", "Автозапуск и расписание", "Защита от спама", "Мониторинг", "Код из чата"],
  "linkAfterChange": true
}
```

После функции — `browser_console_messages` с `{"level": "error"}`: ни одного `[ERROR]`
(клики по ответам и показ паспорта не должны ничего ронять).

- [ ] **Step 5: Ответы и паспорт переживают перезагрузку**

Не очищая хранилище, `browser_navigate` на демо, консоль — без ошибок, затем `browser_evaluate`:

```js
() => ({
  hidden: document.getElementById("passport").hidden,
  checked: [...document.querySelectorAll("#quiz input:checked")].map((input) => `${input.name}=${input.value}`),
  cards: document.querySelectorAll("#passport .card").length,
})
```

Ожидается:

```json
{ "hidden": false, "checked": ["kind=webapp", "data=yes", "audience=any", "paid=no", "auto=yes", "where=chat"], "cards": 7 }
```

- [ ] **Step 6: Ширины 360 и 1280 px с показанным паспортом**

Паспорт из семи карточек уже на экране (шаг 5). Для каждой ширины из раздела «Как проверять»:
`browser_resize`, затем `browser_evaluate`:

```js
() => ({
  noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  answersTallEnough: [...document.querySelectorAll(".answer")].every((label) => label.getBoundingClientRect().height >= 44),
})
```

Ожидается на обеих ширинах: `{ "noHorizontalScroll": true, "answersTallEnough": true }`.
Сделай `browser_take_screenshot` с `{"fullPage": true, "scale": "css"}` на каждой ширине и
посмотри на них: легенды внутри карточек, отмеченные ответы подсвечены, карточки паспорта
в одну колонку на 360 px.

- [ ] **Step 7: «Пройти заново»**

`browser_evaluate`:

```js
() => {
  document.getElementById("restart").click();
  return {
    hidden: document.getElementById("passport").hidden,
    checked: document.querySelectorAll("#quiz input:checked").length,
    saved: localStorage.getItem("zapushchu-diagnostic-answers"),
    focused: document.activeElement ? document.activeElement.name : null,
  };
}
```

Ожидается: `{ "hidden": true, "checked": 0, "saved": null, "focused": "kind" }`.
Затем `browser_navigate` на демо и `browser_evaluate`
`() => ({ hidden: document.getElementById("passport").hidden, checked: document.querySelectorAll("#quiz input:checked").length })`
→ `{ "hidden": true, "checked": 0 }`.

- [ ] **Step 8: Демо с запрещённым хранилищем**

`mcp__playwright__browser_run_code_unsafe` с кодом:

```js
async (page) => {
  const blocked = await page.context().newPage();
  const errors = [];
  blocked.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  blocked.on("pageerror", (error) => errors.push(error.message));
  // До загрузки страницы делаем так, что любое обращение к localStorage бросает ошибку
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Хранилище запрещено", "SecurityError");
      },
    });
  });
  await blocked.goto("http://127.0.0.1:8765/homework-4/diagnostic/index.html");
  const answers = [["kind", "bot"], ["data", "yes"], ["audience", "any"], ["paid", "no"], ["auto", "yes"], ["where", "chat"]];
  for (const [name, value] of answers) {
    await blocked.check(`input[name="${name}"][value="${value}"]`);
  }
  await blocked.click('#quiz button[type="submit"]');
  const result = await blocked.evaluate(() => ({
    hidden: document.getElementById("passport").hidden,
    cards: document.querySelectorAll("#passport .card").length,
  }));
  await blocked.close();
  return { ...result, errors };
}
```

Ожидается: `{ "hidden": false, "cards": 6, "errors": [] }`.

- [ ] **Step 9: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/diagnostic/diagnostic.css homework-4/diagnostic/diagnostic.js
git commit -F - <<'EOF'
homework-4: диагностика — вопросы и паспорт на странице

Скрипт рисует вопросы из QUESTIONS, паспорт с группами и строками «Почему»,
запоминает ответы и собирает ссылку на форму заявки. Стили вопросов и паспорта.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Связка с лендингом, оглавление и CLAUDE.md

**Files:**
- Modify: `homework-4/index.html` (секция `#form`, после `p.section-intro`)
- Modify: `homework-4/script.js` (после объекта `MESSAGES`)
- Modify: `index.html` в корне репозитория (список работ)
- Modify: `CLAUDE.md` в корне репозитория (раздел «Сборка и запуск» и раздел `homework-4`)

**Interfaces:**
- Consumes: `a#send-passport` с `href` вида `../index.html?project=<текст>#form` (задача 2);
  `passportToText`, `loadAnswers` (задача 1) — для сквозной проверки.
- Produces: лендинг читает параметр `project` из адреса и подставляет его в `#project`
  с обрезкой по `maxLength` — этим же механизмом воспользуются демо 2 и 3.

- [ ] **Step 1: Запустить проверку лендинга до правок — она должна упасть**

`browser_navigate` →
`http://127.0.0.1:8765/homework-4/index.html?project=%D0%A2%D0%B5%D1%81%D1%82%0A%D0%B2%D1%82%D0%BE%D1%80%D0%B0%D1%8F#form`
(в параметре — «Тест», перевод строки, «вторая»), затем `browser_evaluate`:

```js
async () => {
  const links = [...document.querySelectorAll("#form .section-intro a")];
  // Ссылка должна вести на настоящую страницу демо, а не только выглядеть правильно
  const page = links[0] ? await (await fetch(links[0].href)).text() : "";
  return {
    value: document.getElementById("project").value,
    demoLink: links.map((a) => [a.textContent.trim(), a.getAttribute("href")]),
    demoTitle: (page.match(/<title>(.*)<\/title>/) || [])[1] ?? null,
  };
}
```

Ожидается FAIL: `value` равно `""`, `demoLink` — пустой массив, `demoTitle` — `null`.

- [ ] **Step 2: Добавить ссылку на демо в `homework-4/index.html`**

Найди в `section#form`:

```html
        <p class="section-intro">Расскажите коротко о проекте — я отвечу, сколько займёт запуск и сколько он стоит.</p>
```

и сразу под ним вставь:

```html
        <!-- Ссылка на index.html, а не на папку: по двойному клику ссылка на папку открывает список файлов -->
        <p class="section-intro">Не знаете, что написать? <a href="diagnostic/index.html">Узнать за минуту, что нужно для запуска моего проекта</a> — ответ сам подставится в форму.</p>
```

- [ ] **Step 3: Добавить подстановку в `homework-4/script.js`**

Найди конец объекта:

```js
  error: "Не получилось отправить. Напишите напрямую в Telegram: @USERNAME",
};
```

и сразу под ним (перед функцией `showStatus`) вставь, отделив пустой строкой:

```js

// Демо-страницы (например, diagnostic/) передают результат в адресе: index.html?project=…#form.
// Подставляем его в поле «Что за проект», чтобы человеку не пришлось писать заново.
// Текст пишется в value, а не в разметку, поэтому чужая ссылка ничего не внедрит в страницу.
const projectFromDemo = new URLSearchParams(window.location.search).get("project");
if (projectFromDemo) {
  const projectField = form.elements.project;
  projectField.value = projectFromDemo.slice(0, projectField.maxLength);
}
```

- [ ] **Step 4: Повторить проверку из шага 1 — теперь она должна пройти**

Консоль после загрузки — без ошибок. Ожидается:

```json
{
  "value": "Тест\nвторая",
  "demoLink": [["Узнать за минуту, что нужно для запуска моего проекта", "diagnostic/index.html"]],
  "demoTitle": "Что нужно вашему проекту — Запущу"
}
```

- [ ] **Step 5: Чужой `?project=` — длинный текст и разметка**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  const base = "http://127.0.0.1:8765/homework-4/index.html";
  await page.goto(`${base}?project=${encodeURIComponent("я".repeat(2500))}#form`);
  const longLength = (await page.inputValue("#project")).length;
  const html = '<img src=x onerror="window.injected = 1">';
  await page.goto(`${base}?project=${encodeURIComponent(html)}#form`);
  const htmlSame = (await page.inputValue("#project")) === html;
  const injected = await page.evaluate(() => ({
    imgs: document.querySelectorAll("#form img").length,
    flag: window.injected ?? null,
  }));
  return { longLength, htmlSame, ...injected };
}
```

Ожидается: `{ "longLength": 2000, "htmlSame": true, "imgs": 0, "flag": null }`.

- [ ] **Step 6: Лендинг без `?project=` ведёт себя как раньше**

`browser_navigate` → `http://127.0.0.1:8765/homework-4/index.html`, консоль — без ошибок, затем
`browser_evaluate`:

```js
async () => {
  const form = document.getElementById("lead-form");
  const before = document.getElementById("project").value;
  form.elements.name.value = "   ";
  form.elements.contact.value = "   ";
  form.elements.project.value = "   ";
  form.requestSubmit();
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { before, status: document.getElementById("form-status").textContent };
}
```

Ожидается: `{ "before": "", "status": "Заполните все поля." }`.

- [ ] **Step 7: Сквозная проверка: демо → лендинг**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  await page.goto("http://127.0.0.1:8765/homework-4/diagnostic/index.html");
  await page.evaluate(() =>
    localStorage.setItem("zapushchu-diagnostic-answers", JSON.stringify({ kind: "bot", data: "yes", audience: "any", paid: "no", auto: "yes", where: "chat" }))
  );
  await page.reload();
  const expected = await page.evaluate(() => passportToText(loadAnswers()));
  await page.click("#send-passport");
  await page.waitForURL(/homework-4\/index\.html\?project=.+#form$/);
  await page.waitForTimeout(1000); // плавная прокрутка к форме успевает закончиться
  const value = await page.inputValue("#project");
  const formVisible = await page.evaluate(() => {
    const top = document.getElementById("form").getBoundingClientRect().top;
    return top > -5 && top < window.innerHeight;
  });
  return { same: value === expected, lines: value.split("\n").length, formVisible };
}
```

Ожидается: `{ "same": true, "lines": 11, "formVisible": true }`.

- [ ] **Step 8: Пункт в корневом оглавлении `index.html`**

Найди:

```html
    <li><a href="homework-4/">homework-4 — лендинг «Запущу»: запуск AI-кода под ключ</a></li>
```

и сразу под ним вставь:

```html
    <li><a href="homework-4/diagnostic/">homework-4/diagnostic — демо «Что нужно вашему проекту»: шесть вопросов и паспорт запуска</a></li>
```

Проверка: `browser_navigate` → `http://127.0.0.1:8765/index.html`, затем `browser_evaluate`:

```js
async () => {
  const link = [...document.querySelectorAll("li a")].find((a) => a.getAttribute("href") === "homework-4/diagnostic/");
  const page = link ? await (await fetch(link.href)).text() : "";
  return { text: link ? link.textContent : null, title: (page.match(/<title>(.*)<\/title>/) || [])[1] ?? null };
}
```

Ожидается:
`{ "text": "homework-4/diagnostic — демо «Что нужно вашему проекту»: шесть вопросов и паспорт запуска", "title": "Что нужно вашему проекту — Запущу" }`.

- [ ] **Step 9: Обновить `CLAUDE.md`**

1. В разделе «Сборка и запуск» в блок команд после строки `start homework-4\index.html` добавь:

   ```
   start homework-4\diagnostic\index.html
   ```

2. В разделе `## homework-4 — лендинг «Запущу»` замени строку

   ```
   Три файла без сборки: `index.html` — только разметка, `styles.css`, `script.js` — только отправка формы. Tailwind и CDN здесь сознательно не используются: для трёх файлов обычный CSS проще и нагляднее.
   ```

   на

   ```
   Лендинг — три файла без сборки: `index.html` — только разметка, `styles.css`, `script.js` — отправка формы и подстановка результата демо в поле «Что за проект». Tailwind и CDN здесь сознательно не используются: для трёх файлов обычный CSS проще и нагляднее.
   ```

3. После абзаца, который начинается с `**Поле из одних пробелов**`, вставь два абзаца:

   ```
   **Демо — каждое в своей папке** (`diagnostic/`; дальше по `demo.md` — проверка кода и симуляция). У демо свои html, css и js; общие цвета, кнопки и карточки берутся из `../styles.css`, свои цвета не заводятся. Результат демо уходит в форму лендинга адресом ссылки `../index.html?project=…#form` — `script.js` подставляет текст в поле «Что за проект». Ссылки между страницами ведут на `index.html`, а не на папку: по двойному клику ссылка на папку открывает список файлов.

   **Диагностика `diagnostic/`** — шесть вопросов и паспорт запуска. Вопросы и правила — таблицы `QUESTIONS` и `TOPICS` в `diagnostic.js`, разметку вопросов строит скрипт. По каждой теме срабатывает первое подходящее правило, поэтому порядок правил внутри темы важен. Ответы хранятся в `localStorage` под ключом `zapushchu-diagnostic-answers`. Спека с эталонными паспортами — `docs/superpowers/specs/2026-09-30-diagnostic-demo-design.md`.
   ```

4. В список «Что проверять после правок» раздела `homework-4` добавь в конец два пункта:

   ```
   - диагностика: пропущенный вопрос не даёт показать паспорт; после правки `QUESTIONS` или `TOPICS` — перебор всех сочетаний ответов из плана `docs/superpowers/plans/2026-09-30-diagnostic-demo.md` (задача 1, шаг 7): у каждого паспорта ровно один вывод про сервер и есть «Мониторинг»;
   - «Отправить паспорт на бесплатную оценку» открывает лендинг с заполненным полем «Что за проект».
   ```

- [ ] **Step 10: Ручная проверка по двойному клику (`file://`)**

Playwright не открывает `file://`, поэтому эту проверку делает Денис. Открой ему страницу
(PowerShell): `Start-Process "E:\Domains\BELHARD\homework-4\diagnostic\index.html"` и попроси:
ответить на вопросы, показать паспорт, нажать «Отправить паспорт на бесплатную оценку» —
должен открыться лендинг на форме с заполненным полем «Что за проект»; ссылка «← На главную»
открывает лендинг, а не список файлов. Дождись подтверждения.

- [ ] **Step 11: Commit**

```bash
cd /e/Domains/BELHARD
git add homework-4/index.html homework-4/script.js index.html CLAUDE.md
git commit -F - <<'EOF'
homework-4: диагностика связана с лендингом

На лендинге — ссылка на демо в секции формы; script.js подставляет паспорт
из адреса ссылки в поле «Что за проект». Пункт в оглавлении и раздел про демо
в CLAUDE.md.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

После задачи 3 — ревью всей ветки `homework-4-demos`. Слияние в `main` — только по слову Дениса.
