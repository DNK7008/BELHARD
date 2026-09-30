# Демо «Сам или со мной» — план реализации

> **Для исполнителей-агентов:** ОБЯЗАТЕЛЬНЫЙ SUB-SKILL: superpowers:subagent-driven-development
> (рекомендуется) или superpowers:executing-plans — выполнять план задача за задачей.
> Шаги отмечены чекбоксами (`- [ ]`).

**Goal:** страница, где посетитель проходит запуск Telegram-бота по шагам во вкладке «Сам»
(10 шагов, 3 развилки, настоящие экраны терминала), сравнивает с тремя шагами во вкладке
«Со мной» и отмечает в чеклисте, что у его проекта уже есть; отметки одной ссылкой уходят в
форму заявки на лендинге.

**Architecture:** своя папка `homework-4/simulation/`. `scenario.js` — только данные
(`STEPS`, `WITH_ME`, `CHECKLIST`). `simulation.js` — раздел 1: чистые функции подсчётов и
текстов (задача 1, проверяются в node); разделы 2–3: сохранение в `localStorage` и страница
(задача 2, проверяются в браузере). Задача 3 переносит общую кнопку-ссылку в `styles.css`,
связывает демо с лендингом и обновляет оглавление и `CLAUDE.md`.

**Tech Stack:** HTML5, CSS (custom properties, flex, grid), чистый JavaScript,
`localStorage`, `navigator.clipboard`, `window.print()`. Проверка — node и Playwright MCP.

**Spec:** `homework-4/docs/superpowers/specs/2026-09-30-simulation-demo-design.md`

## Global Constraints

- Новые файлы — только в `E:\Domains\BELHARD\homework-4\simulation\`. Вне этой папки правятся
  `homework-4/index.html`, `homework-4/styles.css`, `homework-4/diagnostic/diagnostic.css`,
  `homework-4/code-check/code-check.css`, корневые `index.html` и `CLAUDE.md` — и только в
  задаче 3. `homework-4/script.js` не меняется.
- Без сборки, npm, Tailwind, CDN, внешних шрифтов и библиотек.
- Тексты и экраны — дословно из раздела 5 спеки (в этом плане они уже вписаны в код). Экраны
  терминала — записи с настоящей системы: не «улучшать», не менять пробелы и знаки.
- Цвета — только переменные `--color-*` из `styles.css`. В `simulation.css` нет ни одного hex-,
  `rgb()`- или именованного цвета (включая `transparent`).
- В HTML нет атрибутов `style` и `<script>` без `src`.
- Тексты на страницу — только через `textContent` или текстовые узлы, `innerHTML` не используется.
- В `<head>` демо: `<meta name="robots" content="noindex">`, `<link rel="icon" href="data:,">`.
- В `localStorage` — только ключ `zapushchu-simulation` со значением `{ tab, step, furthest, has }`.
  Сетевых запросов страница не делает.
- В подвале демо нет контактов.
- Комментарии в коде — на русском и объясняют «зачем». Код простой: автор учится.
- Отступ — 2 пробела в HTML, CSS и JS. В JS — двойные кавычки и точка с запятой, фигурные скобки у
  каждого `if`.
- Ветка — `homework-4-simulation`. Не переключать ветки, не делать merge, push, rebase.
- Каждая задача заканчивается одним commit'ом из корня репозитория. Сообщение на русском,
  последняя строка: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Файлы спеки и плана не менять.

## Как проверять

**Node.** Проверка данных и чистых функций — скрипт `sim-check.js` из задачи 1, шаг 1. Он живёт
вне репозитория, в scratchpad-папке сессии:
`C:/Users/Admin/AppData/Local/Temp/claude/e--Domains-BELHARD-homework-4/89f5cc98-2dd3-4d68-b573-8ac0ce791c3d/scratchpad/`
(дальше — `$SCRATCH`). Запуск из Git Bash: `node "$SCRATCH/sim-check.js"`.

**Браузер.** Тестового фреймворка нет — проверки выполняются в настоящем браузере через
Playwright MCP. Если инструменты `mcp__playwright__*` не видны, загрузи их через ToolSearch:
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

2. Адреса: демо — `http://127.0.0.1:8765/homework-4/simulation/index.html`, лендинг —
   `http://127.0.0.1:8765/homework-4/index.html`.
3. **Перезагрузка.** Перед повторной загрузкой той же страницы сначала `browser_navigate` на
   `about:blank`, затем на адрес страницы.
4. Ширины экрана: `mcp__playwright__browser_resize` с `{"width": 1280, "height": 900}` и
   `{"width": 360, "height": 800}`.
5. Проверки — функции для `mcp__playwright__browser_evaluate` (параметр `function`) или код для
   `mcp__playwright__browser_run_code_unsafe` (параметр `code`, функция получает `page`).
   Результат сравнивается с ожидаемым JSON **поле в поле**. Любое расхождение — проверка не пройдена.
6. Консоль — `mcp__playwright__browser_console_messages` с `{"level": "error"}` после загрузки
   страницы. Ожидается: ни одного `[ERROR]`.

## Review Focus

1. **Браузер запрещает `localStorage`** (приватный режим, запрет сайтам хранить данные) → страница
   работает с шага 1, шаги листаются, чеклист собирает ссылку, ошибок нет. Тест — задача 2, шаг 9.
2. **Смена вкладки посреди развилки** → выбранный вариант и открытая «Дальше» остаются. Тест —
   задача 2, шаг 7, поле `afterTabs`.
3. **«Начать сначала» после прохождения** → развилки снова закрыты, отметки чеклиста на месте,
   фокус на заголовке шага. Тест — задача 2, шаг 7, поля `afterRestart` и `forkLocked`.
4. **Сохранён шаг, которого больше нет** (сценарий укоротили, значение подправили руками) →
   безопасный шаг без ошибки. Тест — задача 1, шаг 1, строки `readState` с `step: 99` и `2.5`.
5. **Длинная строка без пробелов в терминале на 360 px** (путь `/etc/systemd/system/…`) →
   переносится, горизонтальной прокрутки нет. Тест — задача 2, шаг 11.

---

### Task 1: Сценарий и чистые функции

**Files:**
- Create: `homework-4/simulation/scenario.js`
- Create: `homework-4/simulation/simulation.js` (только раздел 1 — разделы 2–3 дописывает задача 2)
- Test: `$SCRATCH/sim-check.js` (вне репозитория)

**Interfaces:**
- Consumes: ничего из других задач. Для сверки текстов «Со мной» тест читает карточки секции
  `#steps` в `homework-4/index.html`.
- Produces (глобальные имена, их использует задача 2 и проверки):
  - `STEPS` — 10 шагов `{ id, title, why, screens, note?, fork?, terms, withMe }`; экран —
    `{ kind: "terminal", lines }`, `{ kind: "panel", title, rows }` или
    `{ kind: "chat", messages: [{ from: "me" | "bot", text }] }`; развилка —
    `{ question, options: [{ text, correct, result, screens? }] }`; слово — `{ word, meaning }`;
  - `WITH_ME` — 3 шага `{ title, text, terms: [] }`;
  - `CHECKLIST` — 10 пунктов `{ id, text, short }`;
  - `STORAGE_KEY` — `"zapushchu-simulation"`;
  - `compare(steps, withMe)` → `{ self: { steps, terms, forks }, withMe: { steps, terms, forks } }`;
  - `checklistToFormText(checklist, has)` → `string`; `formLink(text)` → `string`;
  - `checklistToCopyText(checklist, has)` → `string`;
  - `splitPrompt(line)` → `{ prompt, command } | null`;
  - `readState(raw, stepCount, checklistIds)` → `{ tab: "self" | "withMe", step, furthest, has }`.

- [ ] **Step 1: Написать проверку `$SCRATCH/sim-check.js`**

```js
// Проверки сценария и чистых функций демо «Сам или со мной» — раздел 12.1 спеки
const fs = require("fs");
const assert = require("assert");

const root = "E:/Domains/BELHARD/homework-4";
const scenario = fs.readFileSync(`${root}/simulation/scenario.js`, "utf8");
// Только раздел 1: разделы 2–3 обращаются к странице и в node не работают
const logic = fs.readFileSync(`${root}/simulation/simulation.js`, "utf8").split("// ===== 2. Сохранение =====")[0];
const api = new Function(`${scenario}\n${logic}\nreturn { STEPS, WITH_ME, CHECKLIST, STORAGE_KEY, compare, checklistToFormText, checklistToCopyText, formLink, splitPrompt, readState };`)();
const { STEPS, WITH_ME, CHECKLIST, STORAGE_KEY, compare, checklistToFormText, checklistToCopyText, formLink, splitPrompt, readState } = api;

// 1. Шаги и экраны
assert.deepStrictEqual(STEPS.map((step) => step.id), ["server", "ssh", "protect", "upload", "python", "secrets", "run", "autostart", "backups", "monitoring"]);
const checkScreen = (screen, where) => {
  const content = { terminal: "lines", panel: "rows", chat: "messages" }[screen.kind];
  assert.ok(content, `${where}: неизвестный kind ${screen.kind}`);
  assert.ok(Array.isArray(screen[content]) && screen[content].length > 0, `${where}: пустой экран`);
  if (screen.kind === "panel") {
    assert.ok(screen.title, `${where}: у панели нет title`);
  }
  if (screen.kind === "chat") {
    assert.ok(screen.messages.every((m) => (m.from === "me" || m.from === "bot") && m.text), `${where}: сообщение чата`);
  }
};
for (const step of STEPS) {
  for (const key of ["title", "why", "withMe"]) {
    assert.ok(typeof step[key] === "string" && step[key].trim(), `${step.id}.${key}`);
  }
  assert.ok(Array.isArray(step.screens), `${step.id}.screens`);
  assert.ok(Array.isArray(step.terms), `${step.id}.terms`);
  step.screens.forEach((screen) => checkScreen(screen, step.id));
  if (step.fork) {
    step.fork.options.forEach((option) => (option.screens || []).forEach((screen) => checkScreen(screen, `${step.id}/вариант`)));
  }
}

// 2. Развилки: три, по три варианта, ровно один верный — на местах 2, 3, 1
const forks = STEPS.filter((step) => step.fork);
assert.deepStrictEqual(forks.map((step) => step.id), ["upload", "python", "autostart"]);
assert.deepStrictEqual(forks.map((step) => step.fork.options.findIndex((o) => o.correct) + 1), [2, 3, 1]);
for (const step of forks) {
  assert.ok(step.fork.question.trim(), `${step.id}: вопрос`);
  assert.strictEqual(step.fork.options.length, 3, `${step.id}: вариантов`);
  assert.strictEqual(step.fork.options.filter((o) => o.correct === true).length, 1, `${step.id}: верных`);
  assert.strictEqual(new Set(step.fork.options.map((o) => o.text)).size, 3, `${step.id}: одинаковые варианты`);
  assert.ok(step.fork.options.every((o) => typeof o.result === "string" && o.result.trim()), `${step.id}: result`);
}

// 3. Каждое слово объясняется один раз
const words = STEPS.flatMap((step) => step.terms.map((term) => term.word.toLowerCase()));
assert.strictEqual(new Set(words).size, words.length, "слова повторяются между шагами");
assert.ok(STEPS.every((step) => step.terms.every((term) => term.meaning.trim())), "пустое объяснение слова");

// 4. «Со мной»: три шага без терминов, первые два — дословно с лендинга
assert.strictEqual(WITH_ME.length, 3);
assert.ok(WITH_ME.every((step) => Array.isArray(step.terms) && step.terms.length === 0), "у «Со мной» есть термины");
const landing = fs.readFileSync(`${root}/index.html`, "utf8");
const stepsStart = landing.indexOf('<section id="steps"');
const stepsSection = landing.slice(stepsStart, landing.indexOf("</section>", stepsStart));
const landingCards = [...stepsSection.matchAll(/<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/g)].map((m) => [m[1], m[2]]);
assert.deepStrictEqual(WITH_ME.slice(0, 2).map((step) => [step.title, step.text]), landingCards.slice(0, 2));

// 5. Чеклист
assert.deepStrictEqual(CHECKLIST.map((item) => item.id), ["server", "restart", "secrets", "protect", "backups", "monitoring", "logs", "domain", "owner", "howto"]);
assert.strictEqual(new Set(CHECKLIST.map((item) => item.short)).size, 10, "повторяются short");
assert.strictEqual(STORAGE_KEY, "zapushchu-simulation");

// 6. Сравнение
assert.deepStrictEqual(compare(STEPS, WITH_ME), { self: { steps: 10, terms: 17, forks: 3 }, withMe: { steps: 3, terms: 0, forks: 0 } });

// 7. Текст для формы и ссылка
const head = "Чеклист запуска из демо «Сам или со мной».";
const allShorts = "сервер или хостинг, автоперезапуск, ключи вне кода, защита сервера, резервные копии, мониторинг, журнал ошибок, домен и SSL (для сайта), доступы на вас, инструкция по обновлению";
assert.strictEqual(checklistToFormText(CHECKLIST, []), `${head}\nУже есть: ничего из списка.\nНет или не знаю: ${allShorts}.`);
assert.strictEqual(checklistToFormText(CHECKLIST, ["restart", "server"]), `${head}\nУже есть: сервер или хостинг, автоперезапуск.\nНет или не знаю: ключи вне кода, защита сервера, резервные копии, мониторинг, журнал ошибок, домен и SSL (для сайта), доступы на вас, инструкция по обновлению.`);
assert.strictEqual(checklistToFormText(CHECKLIST, CHECKLIST.map((item) => item.id)), `${head}\nУже есть: ${allShorts}.\nНет или не знаю: ничего из списка.`);
assert.strictEqual(formLink("а б\nв"), "../index.html?project=%D0%B0%20%D0%B1%0A%D0%B2#form");

// 8. Текст для копирования
assert.strictEqual(checklistToCopyText(CHECKLIST, ["server"]), [
  "Что должно быть у запущенного проекта",
  "[x] Проект работает на сервере или хостинге, а не на вашем компьютере.",
  "[ ] Он сам запускается после сбоя и после перезагрузки сервера.",
  "[ ] Ключи и пароли лежат не в коде, а в отдельном файле или настройках хостинга.",
  "[ ] Сервер защищён: обновления ставятся, вход по ключу, лишние входы закрыты.",
  "[ ] Резервные копии данных делаются сами и хранятся в другом месте.",
  "[ ] О поломке вы узнаёте раньше пользователей.",
  "[ ] Есть журнал, по которому видно, что и когда сломалось.",
  "[ ] Для сайта: домен и SSL-сертификат — замочек в адресной строке. Боту они не нужны.",
  "[ ] Сервер, хостинг и домен оформлены на вас, а не на исполнителя.",
  "[ ] Записано, как обновить код и перезапустить проект.",
].join("\n"));

// 9. Состояние из хранилища — таблица раздела 8.4 спеки
const ids = CHECKLIST.map((item) => item.id);
const clean = { tab: "self", step: 0, furthest: 0, has: [] };
const stateCases = [
  [null, clean],
  ["мусор", clean],
  ["[1,2]", clean],
  ['{"tab":"withMe","step":4,"furthest":6,"has":["server"]}', { tab: "withMe", step: 4, furthest: 6, has: ["server"] }],
  ['{"step":5,"furthest":2}', { tab: "self", step: 2, furthest: 2, has: [] }],
  ['{"step":99,"furthest":10}', { tab: "self", step: 0, furthest: 10, has: [] }],
  ['{"step":9,"furthest":10}', { tab: "self", step: 9, furthest: 10, has: [] }],
  ['{"step":2.5,"furthest":-1,"tab":"x"}', clean],
  ['{"has":["owner","nope","server","owner"]}', { tab: "self", step: 0, furthest: 0, has: ["server", "owner"] }],
];
for (const [raw, expected] of stateCases) {
  assert.deepStrictEqual(readState(raw, 10, ids), expected, `readState(${raw})`);
}

// 10. Приглашение командной строки — таблица раздела 8.5 спеки
assert.deepStrictEqual(splitPrompt("PS C:\\Users\\you> ssh root@203.0.113.24"), { prompt: "PS C:\\Users\\you>", command: "ssh root@203.0.113.24" });
assert.deepStrictEqual(splitPrompt("root@vps:/opt/bot# python3 bot.py"), { prompt: "root@vps:/opt/bot#", command: "python3 bot.py" });
assert.deepStrictEqual(splitPrompt("root@vps:~#"), { prompt: "root@vps:~#", command: "" });
assert.strictEqual(splitPrompt("root@203.0.113.24's password:"), null);
assert.strictEqual(splitPrompt("Rules updated"), null);
assert.strictEqual(splitPrompt("…"), null);

// 11–12. В сценарии нет ключей и цен
const strings = [];
const collect = (value) => {
  if (typeof value === "string") {
    strings.push(value);
  } else if (Array.isArray(value)) {
    value.forEach(collect);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collect);
  }
};
collect([STEPS, WITH_ME, CHECKLIST]);
const secretPatterns = [/(?:^|\D)(\d{8,10}:[A-Za-z0-9_-]{35})(?![\w-])/, /\bsk-[A-Za-z0-9_-]{20,}/];
assert.deepStrictEqual(strings.filter((s) => secretPatterns.some((p) => p.test(s))), [], "в сценарии ключ");
assert.deepStrictEqual(strings.filter((s) => /\d\s*(?:₽|руб|р\.|BYN|\$|€|USD|EUR)|(?:\$|€)\s*\d/i.test(s)), [], "в сценарии цена");

console.log("sim-check: все 12 групп проверок прошли");
```

- [ ] **Step 2: Запустить проверку — она должна упасть**

Run: `node "$SCRATCH/sim-check.js"`
Expected: FAIL — `ENOENT: no such file or directory, open 'E:/Domains/BELHARD/homework-4/simulation/scenario.js'`.

- [ ] **Step 3: Создать `homework-4/simulation/scenario.js`**

Весь файл:

```js
// Сценарий демо «Сам или со мной»: только данные, функций здесь нет.
// Экраны терминала сняты с настоящей Ubuntu 24.04 или сверены с исходниками программ —
// откуда какой, написано в разделе 13 спеки. Меняешь команду — перепроверь её вывод:
// знающий человек заметит выдуманную ошибку сразу.

// Шаги режима «Сам». Строка терминала, которая начинается с приглашения
// (PS …> — компьютер человека, root@vps:…# — сервер), — это команда, остальные строки — вывод.
// «…» — пропущенные строки вывода.
const STEPS = [
  {
    id: "server",
    title: "Арендовать сервер",
    why: "Ваш компьютер выключается и засыпает, а боту нужен компьютер, который работает круглосуточно. Такой компьютер арендуют в дата-центре — это и есть сервер.",
    screens: [
      {
        kind: "panel",
        title: "Новый сервер",
        rows: [
          ["Тариф", "1 ядро, 1 ГБ памяти, 25 ГБ диска"],
          ["Система", "Ubuntu 24.04 LTS"],
          ["IP-адрес", "203.0.113.24"],
          ["Логин", "root"],
          ["Пароль", "отправлен на почту"],
          ["Состояние", "работает"],
        ],
      },
    ],
    terms: [
      { word: "Сервер (VPS)", meaning: "Компьютер в дата-центре, который работает круглосуточно. VPS — виртуальный сервер: часть большого компьютера, которая ведёт себя как отдельный." },
      { word: "IP-адрес", meaning: "Номер сервера в интернете, по нему к серверу подключаются. 203.0.113.24 — адрес для примеров, настоящего сервера за ним нет." },
    ],
    withMe: "Сервер подбираю и арендую я, но оформляю на вас: он ваш, даже если мы перестанем работать вместе.",
  },
  {
    id: "ssh",
    title: "Подключиться к серверу",
    why: "У сервера нет экрана и мыши. Им управляют из командной строки через защищённое подключение — SSH.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "PS C:\\Users\\you> ssh root@203.0.113.24",
          "The authenticity of host '203.0.113.24 (203.0.113.24)' can't be established.",
          "ED25519 key fingerprint is SHA256:Xb3v9QpZ7m1Lk0Rw4tYc8NfJ2hGa5sDe6uIo1pA9zKq.",
          "This key is not known by any other names.",
          "Are you sure you want to continue connecting (yes/no/[fingerprint])? yes",
          "Warning: Permanently added '203.0.113.24' (ED25519) to the list of known hosts.",
          "root@203.0.113.24's password:",
          "Welcome to Ubuntu 24.04.5 LTS (GNU/Linux 6.8.0-146-generic x86_64)",
          "…",
          "root@vps:~#",
        ],
      },
    ],
    note: "Отпечаток ключа — «паспорт» сервера: при первом подключении его подтверждают, а дальше компьютер предупредит, если сервер подменят. Пароль при вводе не показывается, даже звёздочками.",
    terms: [
      { word: "SSH", meaning: "Защищённое подключение к серверу: всё, что вы вводите, шифруется." },
      { word: "Терминал", meaning: "Окно, где компьютером управляют текстовыми командами. На Windows это PowerShell." },
    ],
    withMe: "Подключаюсь я. Вам не нужно ничего устанавливать и запоминать команды.",
  },
  {
    id: "protect",
    title: "Защитить сервер",
    why: "Как только сервер появляется в интернете, программы-взломщики начинают подбирать к нему пароль. Поэтому первым делом ставят обновления, закрывают все входы, кроме SSH, и запрещают вход по паролю — только по ключу. Важен порядок: сначала кладут на сервер свой SSH-ключ, потом запрещают пароль, иначе можно запереть себя снаружи.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:~# apt update && apt upgrade -y",
          "…",
          "root@vps:~# ufw allow OpenSSH",
          "Rules updated",
          "Rules updated (v6)",
          "root@vps:~# ufw enable",
          "Command may disrupt existing ssh connections. Proceed with operation (y|n)? y",
          "Firewall is active and enabled on system startup",
          "root@vps:~# nano /etc/ssh/sshd_config.d/00-no-password.conf",
          "root@vps:~# cat /etc/ssh/sshd_config.d/00-no-password.conf",
          "PasswordAuthentication no",
          "root@vps:~# systemctl restart ssh",
        ],
      },
    ],
    note: "Файл называется 00-no-password.conf не случайно: на многих серверах уже лежит 50-cloud-init.conf, который разрешает вход по паролю, а побеждает настройка из файла, прочитанного первым.",
    terms: [
      { word: "Файрвол", meaning: "Сторож на входе в сервер: пропускает только разрешённые подключения. Здесь — только SSH." },
      { word: "SSH-ключ", meaning: "Пара файлов вместо пароля: секретная половина лежит у вас, открытая — на сервере. Подобрать ключ, в отличие от пароля, нельзя." },
    ],
    withMe: "Защиту настраиваю я.",
  },
  {
    id: "upload",
    title: "Перенести код на сервер",
    why: "Бот пока лежит в папке bot на вашем компьютере. Его нужно скопировать на сервер.",
    screens: [],
    fork: {
      question: "Как перенести код на сервер?",
      options: [
        {
          text: "Выложить в открытый репозиторий на GitHub и скачать оттуда",
          correct: false,
          result: "В коде лежат токен бота и ключ OpenAI. Открытые репозитории постоянно просматривают программы, которые ищут такие ключи. По ключу OpenAI начнут тратить деньги с вашего счёта, а через бота — рассылать чужие сообщения. Если так уже вышло, отзовите токен у @BotFather командой /revoke и удалите ключ в кабинете OpenAI: удалить файл из репозитория мало, ключ остаётся в истории.",
        },
        {
          text: "Скопировать папку на сервер командой scp",
          correct: true,
          result: "scp копирует файлы по тому же защищённому подключению, что и SSH. Код не проходит через чужие сервисы и нигде не публикуется.",
          screens: [
            {
              kind: "terminal",
              lines: [
                "PS C:\\Users\\you> scp -r bot root@203.0.113.24:/opt/",
                "bot.py                                        100% 1025    50.1KB/s   00:00",
              ],
            },
          ],
        },
        {
          text: "Переслать файлы себе в Telegram и открыть на сервере",
          correct: false,
          result: "На сервере нет ни Telegram, ни экрана — только командная строка. Файлы попадают туда по сети, командой.",
        },
      ],
    },
    terms: [
      { word: "scp", meaning: "Команда, которая копирует файлы на сервер по SSH." },
    ],
    withMe: "Код вы присылаете мне как удобно, а на сервер переношу его я.",
  },
  {
    id: "python",
    title: "Поставить библиотеки",
    why: "Бот использует готовый чужой код — библиотеки: aiogram для Telegram и openai для ChatGPT. Python на сервере уже есть, а библиотек нет.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:~# cd /opt/bot",
          "root@vps:/opt/bot# python3 bot.py",
          "Traceback (most recent call last):",
          "  File \"/opt/bot/bot.py\", line 4, in <module>",
          "    from aiogram import Bot, Dispatcher, types",
          "ModuleNotFoundError: No module named 'aiogram'",
        ],
      },
    ],
    fork: {
      question: "Бот не запустился: на сервере нет библиотеки aiogram. Что делаете?",
      options: [
        {
          text: "Выполнить команду из инструкции AI: pip install aiogram openai",
          correct: false,
          result: "Установщика библиотек pip на сервере нет. Но и после apt install python3-pip ничего не выйдет: Ubuntu 24.04 ответит error: externally-managed-environment. Она не даёт ставить библиотеки прямо в систему, чтобы не сломать собственные программы на Python.",
          screens: [
            {
              kind: "terminal",
              lines: [
                "root@vps:/opt/bot# pip install aiogram openai",
                "Command 'pip' not found, but can be installed with:",
                "apt install python3-pip",
              ],
            },
          ],
        },
        {
          text: "Скопировать папку с библиотеками со своего компьютера",
          correct: false,
          result: "Часть библиотек собрана под Windows и под вашу версию Python. На сервере с Linux они не запустятся, а новые ошибки будут непонятнее первой.",
        },
        {
          text: "Создать для бота отдельную папку с библиотеками — виртуальное окружение",
          correct: true,
          result: "Виртуальное окружение — отдельная папка venv с библиотеками только этого бота. По дороге Ubuntu попросила доставить пакет python3.12-venv — обычное дело: команды из инструкций AI часто упираются в такие мелочи. Библиотеку python-dotenv ставим сразу — она понадобится на следующем шаге.",
          screens: [
            {
              kind: "terminal",
              lines: [
                "root@vps:/opt/bot# python3 -m venv venv",
                "The virtual environment was not created successfully because ensurepip is not",
                "available.  On Debian/Ubuntu systems, you need to install the python3-venv",
                "package using the following command.",
                "",
                "    apt install python3.12-venv",
                "",
                "You may need to use sudo with that command.  After installing the python3-venv",
                "package, recreate your virtual environment.",
                "",
                "Failing command: /opt/bot/venv/bin/python3",
                "",
                "root@vps:/opt/bot# apt install -y python3.12-venv",
                "…",
                "Setting up python3.12-venv (3.12.3-1ubuntu0.17) ...",
                "root@vps:/opt/bot# python3 -m venv venv",
                "root@vps:/opt/bot# venv/bin/pip install aiogram openai python-dotenv",
                "…",
                "Successfully installed aiofiles-25.1.0 aiogram-3.31.0 … openai-3.22.1 … python-dotenv-1.2.3 …",
              ],
            },
          ],
        },
      ],
    },
    terms: [
      { word: "Библиотека", meaning: "Готовый чужой код, который программа подключает, чтобы не писать всё с нуля." },
      { word: "pip", meaning: "Установщик библиотек для Python." },
      { word: "Виртуальное окружение (venv)", meaning: "Отдельная папка с библиотеками для одной программы. Так программы на сервере не мешают друг другу." },
    ],
    withMe: "Окружение и библиотеки ставлю я и проверяю, что бот запускается.",
  },
  {
    id: "secrets",
    title: "Убрать ключи из кода",
    why: "Сейчас токен бота и ключ OpenAI записаны прямо в bot.py. Любой, кто увидит код — помощник, фрилансер, случайный скриншот, — получит бота и доступ к вашему счёту. Ключи переносят в отдельный файл .env: он остаётся только на сервере, и читать его может только владелец.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:/opt/bot# nano .env",
          "root@vps:/opt/bot# cat .env",
          "BOT_TOKEN=123456789:AAF…",
          "OPENAI_API_KEY=sk-…",
          "root@vps:/opt/bot# chmod 600 .env",
          "root@vps:/opt/bot# nano bot.py",
          "root@vps:/opt/bot# grep -n -E \"os\\.getenv|load_dotenv\" bot.py",
          "7:from dotenv import load_dotenv",
          "10:load_dotenv()",
          "11:BOT_TOKEN = os.getenv(\"BOT_TOKEN\")",
          "12:client = OpenAI(api_key=os.getenv(\"OPENAI_API_KEY\"))",
        ],
      },
    ],
    note: "Ключи на экране скрыты. В коде вместо них теперь os.getenv — «возьми значение из .env».",
    terms: [
      { word: ".env", meaning: "Файл с ключами и паролями рядом с кодом. Код можно показывать, а .env остаётся только на сервере." },
    ],
    withMe: "Ключи переношу в .env я — в коде их не останется.",
  },
  {
    id: "run",
    title: "Запустить",
    why: "Всё готово к первому запуску. Бот запускают из его папки через Python из виртуального окружения.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:/opt/bot# venv/bin/python bot.py",
        ],
      },
      {
        kind: "chat",
        messages: [
          { from: "me", text: "/start" },
          { from: "bot", text: "Привет! Я запишу вас на приём." },
        ],
      },
    ],
    note: "Терминал молчит — так и должно быть: пока всё в порядке, бот ничего туда не пишет. Проверяют его в самом Telegram.",
    terms: [],
    withMe: "Запускаю бота я. Вы пишете ему /start, когда он уже работает.",
  },
  {
    id: "autostart",
    title: "Сделать, чтобы бот не выключался",
    why: "Бот работает, пока открыто подключение к серверу. Настоящему боту нужно работать, когда ваш компьютер выключен, и подниматься самому после сбоя или перезагрузки сервера.",
    screens: [],
    fork: {
      question: "Вы закрыли окно терминала — и бот перестал отвечать. Что делаете?",
      options: [
        {
          text: "Сделать бота службой systemd",
          correct: true,
          result: "Теперь за ботом присматривает система: запускает его при включении сервера и перезапускает после любого сбоя (Restart=always). Работает бот от отдельного пользователя bot без прав администратора: найдут дыру в боте — не получат весь сервер.",
          screens: [
            {
              kind: "terminal",
              lines: [
                "root@vps:~# useradd --system --no-create-home --shell /usr/sbin/nologin bot",
                "root@vps:~# chown -R bot:bot /opt/bot",
                "root@vps:~# nano /etc/systemd/system/bot.service",
                "root@vps:~# cat /etc/systemd/system/bot.service",
                "[Unit]",
                "Description=Telegram bot",
                "After=network-online.target",
                "Wants=network-online.target",
                "",
                "[Service]",
                "User=bot",
                "WorkingDirectory=/opt/bot",
                "ExecStart=/opt/bot/venv/bin/python /opt/bot/bot.py",
                "Restart=always",
                "",
                "[Install]",
                "WantedBy=multi-user.target",
                "root@vps:~# systemctl enable --now bot",
                "Created symlink /etc/systemd/system/multi-user.target.wants/bot.service → /etc/systemd/system/bot.service.",
                "root@vps:~# systemctl is-active bot",
                "active",
              ],
            },
          ],
        },
        {
          text: "Запустить снова и не закрывать ноутбук",
          correct: false,
          result: "Бот живёт, пока открыто подключение к серверу. Ноутбук уснёт, пропадёт Wi-Fi, Windows уйдёт на обновление — и бот замолчит, а вы узнаете об этом от клиентов.",
        },
        {
          text: "Запустить через nohup, чтобы бот не зависел от терминала",
          correct: false,
          result: "Закрытие терминала бот теперь переживёт, но не перезагрузку сервера и не собственную ошибку: упадёт ночью — до утра его никто не поднимет.",
          screens: [
            {
              kind: "terminal",
              lines: [
                "root@vps:/opt/bot# nohup venv/bin/python bot.py &",
                "[1] 1168",
                "nohup: ignoring input and appending output to 'nohup.out'",
              ],
            },
          ],
        },
      ],
    },
    terms: [
      { word: "Служба (systemd)", meaning: "Программа, за которой присматривает сама система: запускает её при включении сервера и перезапускает после сбоя." },
    ],
    withMe: "Автозапуск настраиваю я: бот переживает перезагрузки без вашего участия.",
  },
  {
    id: "backups",
    title: "Настроить резервные копии",
    why: "Бот записывает клиентов в файл clients.db. Сломается диск или кто-то ошибётся командой — и записи пропадут. Поэтому каждую ночь делают копию и увозят её с сервера.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:~# apt install -y sqlite3 rclone",
          "…",
          "root@vps:~# mkdir -p /var/backups/bot",
          "root@vps:~# crontab -e",
          "…",
          "root@vps:~# crontab -l",
          "0 3 * * * sqlite3 /opt/bot/clients.db \".backup /var/backups/bot/clients-$(date +\\%F).db\"",
          "30 3 * * * rclone copy /var/backups/bot backup:bot",
        ],
      },
    ],
    terms: [
      { word: "Резервная копия", meaning: "Копия данных, которая хранится отдельно от сервера. Сломался сервер — данные восстанавливают из неё." },
      { word: "cron", meaning: "Расписание на сервере: например, «каждую ночь в 3:00 сделать копию»." },
      { word: "rclone", meaning: "Программа, которая копирует файлы в облачное хранилище, — так копия живёт не на том же сервере." },
    ],
    withMe: "Копии настраиваю я: они делаются сами и хранятся не на том же сервере.",
  },
  {
    id: "monitoring",
    title: "Следить, что бот жив",
    why: "Бот может упасть: кто-то отозвал токен, закончились деньги на счёте OpenAI, в коде нашлась ошибка. systemd будет перезапускать бота, но если причина не уходит, бот падает снова и снова, а клиенты видят тишину. Поэтому нужны журнал — чтобы понять причину, и мониторинг — чтобы узнать о поломке первым.",
    screens: [
      {
        kind: "terminal",
        lines: [
          "root@vps:~# journalctl -u bot -n 7 --no-pager",
          "Sep 30 19:31:28 vps python[1013]:     raise TelegramUnauthorizedError(method=method, message=description)",
          "Sep 30 19:31:28 vps python[1013]: aiogram.exceptions.TelegramUnauthorizedError: Telegram server says - Unauthorized",
          "Sep 30 19:31:28 vps systemd[1]: bot.service: Main process exited, code=exited, status=1/FAILURE",
          "Sep 30 19:31:28 vps systemd[1]: bot.service: Failed with result 'exit-code'.",
          "Sep 30 19:31:28 vps systemd[1]: bot.service: Consumed 2.232s CPU time.",
          "Sep 30 19:31:29 vps systemd[1]: bot.service: Scheduled restart job, restart counter is at 6.",
          "Sep 30 19:31:29 vps systemd[1]: Started bot.service - Telegram bot.",
        ],
      },
    ],
    note: "В журнале видно: Telegram не принимает токен (Unauthorized) — например, его отозвали. systemd перезапустил бота уже 6 раз, но без нового токена это не поможет. Чтобы узнать о таком первым, в бот добавляют несколько строк: раз в пять минут он подаёт сигнал внешнему сервису мониторинга, а если сигнал пропал — вам приходит сообщение.",
    terms: [
      { word: "Журнал (логи)", meaning: "Записи о том, что происходило с программой. По ним понимают, почему она упала." },
      { word: "Мониторинг", meaning: "Сторож снаружи: если бот перестал подавать сигнал «я жив», вам приходит сообщение." },
    ],
    withMe: "Мониторинг настраиваю я: о поломке первым узнаю я, а не ваши клиенты.",
  },
];

// Шаги режима «Со мной». Первые два — дословно с лендинга («Как это работает»),
// третий переписан под бота. terms пустые, но поле есть: сравнение считается по данным
const WITH_ME = [
  {
    title: "Вы присылаете код",
    text: "Архив, ссылку на GitHub или просто чат с AI. И пару слов о том, что программа должна делать.",
    terms: [],
  },
  {
    title: "Я оцениваю — бесплатно",
    text: "Смотрю код и называю срок и цену. Если что-то нужно поправить до запуска, скажу сразу.",
    terms: [],
  },
  {
    title: "Вы получаете работающего бота",
    text: "Имя бота в Telegram — он уже отвечает. И доступы, чтобы он был полностью вашим.",
    terms: [],
  },
];

// Чеклист в итоге: text — на странице и при копировании, short — в форму заявки
const CHECKLIST = [
  { id: "server", text: "Проект работает на сервере или хостинге, а не на вашем компьютере.", short: "сервер или хостинг" },
  { id: "restart", text: "Он сам запускается после сбоя и после перезагрузки сервера.", short: "автоперезапуск" },
  { id: "secrets", text: "Ключи и пароли лежат не в коде, а в отдельном файле или настройках хостинга.", short: "ключи вне кода" },
  { id: "protect", text: "Сервер защищён: обновления ставятся, вход по ключу, лишние входы закрыты.", short: "защита сервера" },
  { id: "backups", text: "Резервные копии данных делаются сами и хранятся в другом месте.", short: "резервные копии" },
  { id: "monitoring", text: "О поломке вы узнаёте раньше пользователей.", short: "мониторинг" },
  { id: "logs", text: "Есть журнал, по которому видно, что и когда сломалось.", short: "журнал ошибок" },
  { id: "domain", text: "Для сайта: домен и SSL-сертификат — замочек в адресной строке. Боту они не нужны.", short: "домен и SSL (для сайта)" },
  { id: "owner", text: "Сервер, хостинг и домен оформлены на вас, а не на исполнителя.", short: "доступы на вас" },
  { id: "howto", text: "Записано, как обновить код и перезапустить проект.", short: "инструкция по обновлению" },
];
```

- [ ] **Step 4: Создать `homework-4/simulation/simulation.js` — раздел 1**

Весь файл на этом шаге (разделы 2–3 дописывает задача 2):

```js
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
```

- [ ] **Step 5: Повторить проверку — теперь она должна пройти**

Run: `node "$SCRATCH/sim-check.js"`
Expected: `sim-check: все 12 групп проверок прошли`

- [ ] **Step 6: Commit**

```bash
cd /e/Domains/BELHARD && git add homework-4/simulation/scenario.js homework-4/simulation/simulation.js && git commit -q -F - <<'EOF'
homework-4: симуляция — сценарий и подсчёты

Десять шагов «Сам» с экранами, снятыми с настоящей Ubuntu 24.04, три
развилки, три шага «Со мной» и чеклист. Чистые функции: сравнение путей,
тексты для формы и копирования, разбор строки терминала, чтение
состояния из хранилища.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Страница — вкладки, шаги, развилки, итог

**Files:**
- Create: `homework-4/simulation/index.html`
- Create: `homework-4/simulation/simulation.css`
- Modify: `homework-4/simulation/simulation.js` (дописать разделы 2–3 в конец файла)

**Interfaces:**
- Consumes: из задачи 1 — `STEPS`, `WITH_ME`, `CHECKLIST`, `STORAGE_KEY`, `compare`,
  `checklistToFormText`, `formLink`, `checklistToCopyText`, `splitPrompt`, `readState`.
  Из `../styles.css` — `.container`, `.btn`, `.btn--small`, `.site-header`, `.site-header__inner`,
  `.logo`, `.section`, `.section--soft`, `.section-title`, `.section-intro`, `.cards`, `.card`,
  `.steps`, `.step`, `.site-footer`, `.site-footer__inner`. Класса `.link-button` в `styles.css`
  до задачи 3 нет (он переезжает туда из других демо), поэтому до неё кнопки «Начать сначала»,
  «← Назад», «Скопировать», «Распечатать» выглядят как обычные кнопки браузера. Проверки задачи 2
  их внешний вид не проверяют — это делает задача 3, шаг 5.
- Produces (разметка и поведение, их проверяют тесты и задача 3):
  `#tab-self`, `#tab-with-me` (`role="tab"`), `#panel-self`, `#panel-with-me`, `#step-progress`,
  `#restart`, `#step-title[tabindex="-1"]`, `#step-why`, `#step-screens`, `#step-note`,
  `#step-fork` (`.fork__option[aria-pressed]`, `.fork__verdict`), `#step-terms`, `#step-terms-list`,
  `#step-with-me`, `#prev`, `#next`, `#step-hint`, `#with-me-steps`, `#with-me-total`, `#summary`,
  `#summary-title[tabindex="-1"]`, `#compare-body`, `#checklist-items input[type="checkbox"][value]`,
  `a#send-checklist` с `href` вида `../index.html?project=<encodeURIComponent(текст)>#form`,
  `#copy-checklist`, `#print-checklist`, `#copy-status`; секция симуляции — `section.simulation`.

- [ ] **Step 1: Убедиться, что сервер работает**

Выполни шаг 1 раздела «Как проверять». Ожидается `200`.

- [ ] **Step 2: Запустить проверку страницы до правок — она должна упасть**

`browser_navigate` → `http://127.0.0.1:8765/homework-4/simulation/index.html`, затем
`browser_evaluate` с функцией:

```js
() => ({ title: document.getElementById("step-title").textContent })
```

Expected: FAIL — страницы ещё нет, сервер отдаёт 404, ошибка
`Cannot read properties of null (reading 'textContent')`.

- [ ] **Step 3: Создать `homework-4/simulation/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Сам или со мной — Запущу</title>
  <meta name="description" content="Пройдите запуск Telegram-бота по шагам — без риска что-то сломать — и сравните с запуском под ключ.">
  <!-- Как и лендинг: пока на сайте заглушки, страница закрыта от поисковиков -->
  <meta name="robots" content="noindex">
  <!-- Пустая иконка: браузер не запрашивает favicon.ico и не пишет 404 в консоль -->
  <link rel="icon" href="data:,">
  <!-- Цвета, кнопки и карточки — общие с лендингом; свои стили демо идут после них -->
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="simulation.css">
  <!-- defer: скрипты выполнятся по порядку, когда разметка уже готова. Сначала данные, потом логика -->
  <script src="scenario.js" defer></script>
  <script src="simulation.js" defer></script>
</head>
<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="../index.html">Запущу</a>
      <a class="btn btn--small" href="../index.html#form">Оценить проект</a>
    </div>
  </header>

  <main>
    <section class="section simulation">
      <div class="container">
        <h1 class="section-title">Сам или со мной</h1>
        <p class="section-intro">Запуск Telegram-бота по шагам — того же, что в <a href="../code-check/index.html">примере проверки кода</a>. Это запись настоящего запуска, а не живой сервер: ничего не запускается и не ломается, а «…» в записи — пропущенные строки. Если решите запускать сами, путь и чеклист в конце пригодятся.</p>
        <noscript>
          <p class="section-intro">Для симуляции нужен JavaScript. Если он выключен, просто <a href="../index.html#form">оставьте заявку</a> — я расскажу, что нужно вашему проекту.</p>
        </noscript>

        <!-- Вкладки: видна панель выбранной, вторая скрыта атрибутом hidden. Переключает simulation.js -->
        <div class="tabs" role="tablist" aria-label="Режим">
          <button id="tab-self" class="tab" type="button" role="tab" aria-selected="true" aria-controls="panel-self" tabindex="0">Сам</button>
          <button id="tab-with-me" class="tab" type="button" role="tab" aria-selected="false" aria-controls="panel-with-me" tabindex="-1">Со мной</button>
        </div>

        <div id="panel-self" class="tab-panel" role="tabpanel" aria-labelledby="tab-self">
          <div class="sim-progress">
            <p id="step-progress" class="sim-progress__text"></p>
            <button id="restart" class="link-button" type="button">Начать сначала</button>
          </div>
          <!-- Содержимое шага рисует simulation.js из таблицы STEPS -->
          <article class="card sim-step">
            <!-- tabindex="-1": на заголовок переносится фокус после «Назад» и «Дальше» -->
            <h2 id="step-title" class="sim-step__title" tabindex="-1"></h2>
            <p id="step-why" class="sim-step__why"></p>
            <div id="step-screens" class="screens"></div>
            <p id="step-note" class="sim-step__note" hidden></p>
            <div id="step-fork" class="fork" hidden></div>
            <div id="step-terms" class="terms" hidden>
              <h3 class="terms__title">Новые слова</h3>
              <dl id="step-terms-list" class="terms__list"></dl>
            </div>
            <p class="sim-step__with-me"><strong>Со мной:</strong> <span id="step-with-me"></span></p>
            <div class="sim-step__nav">
              <button id="prev" class="link-button" type="button">← Назад</button>
              <button id="next" class="btn" type="button">Дальше →</button>
            </div>
            <p id="step-hint" class="sim-step__hint" hidden>Чтобы идти дальше, выберите верный вариант.</p>
          </article>
        </div>

        <div id="panel-with-me" class="tab-panel" role="tabpanel" aria-labelledby="tab-with-me" hidden>
          <!-- Те же карточки с номерами, что в «Как это работает» на лендинге; заполняет simulation.js -->
          <ol id="with-me-steps" class="cards steps"></ol>
          <p id="with-me-total" class="with-me__total"></p>
          <p><a href="#summary">К итогу и чеклисту ↓</a></p>
        </div>
      </div>
    </section>

    <!-- Итог виден всегда: кому нужен только чеклист, не придётся проходить все шаги -->
    <section id="summary" class="section section--soft">
      <div class="container">
        <h2 id="summary-title" class="section-title" tabindex="-1">Итог</h2>
        <p class="summary__intro">Сравнение посчитано по самой симуляции.</p>
        <table class="compare">
          <thead>
            <tr>
              <td></td>
              <th scope="col">Сам</th>
              <th scope="col">Со мной</th>
            </tr>
          </thead>
          <!-- Строки с числами строит simulation.js из STEPS и WITH_ME -->
          <tbody id="compare-body"></tbody>
        </table>

        <fieldset class="checklist">
          <legend class="checklist__title">Что должно быть у запущенного проекта</legend>
          <p class="checklist__hint">Отметьте, что у вашего проекта уже есть. Отметки остаются в вашем браузере.</p>
          <!-- Пункты строит simulation.js из таблицы CHECKLIST -->
          <ul id="checklist-items" class="checklist__items"></ul>
        </fieldset>

        <div class="summary__actions">
          <!-- Адрес ссылки с текстом чеклиста собирает simulation.js -->
          <a id="send-checklist" class="btn" href="../index.html#form">Отправить чеклист на бесплатную оценку</a>
          <button id="copy-checklist" class="link-button" type="button">Скопировать</button>
          <button id="print-checklist" class="link-button" type="button">Распечатать</button>
        </div>
        <p id="copy-status" class="summary__status" role="status"></p>
        <p class="summary__note">Чеклист пригодится, даже если вы решите запускать сами.</p>
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

- [ ] **Step 4: Создать `homework-4/simulation/simulation.css`**

Весь файл:

```css
/* Стили демо «Сам или со мной». Цвета, кнопки и карточки — из ../styles.css. */

/* ===== 1. Вкладки и шаг ===== */

/* hidden должен прятать и блоки, которым ниже задан display: flex —
   иначе flex перебивает браузерное правило для hidden */
.simulation [hidden] {
  display: none;
}

.tabs {
  display: flex;
  margin-top: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  min-height: 44px; /* удобно попасть пальцем */
  padding: 0.75rem 1rem;
  border: 0;
  background: none;
  color: var(--color-muted);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* Выбранная вкладка подчёркнута тенью, а не рамкой: рамка сдвинула бы текст */
.tab[aria-selected="true"] {
  color: var(--color-text);
  box-shadow: inset 0 -3px 0 var(--color-accent);
}

.tab-panel {
  padding-top: 1.5rem;
}

.sim-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
}

.sim-progress__text {
  margin: 0;
  color: var(--color-muted);
  font-weight: 600;
}

/* Части шага идут столбиком с равными промежутками; скрытые места не занимают */
.sim-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sim-step .sim-step__title {
  margin: 0;
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
}

/* В общих стилях абзацы карточки приглушены — а «зачем» и «со мной» здесь главные */
.sim-step .sim-step__why {
  color: var(--color-text);
  font-size: 1.125rem;
}

.sim-step .sim-step__with-me {
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--color-accent-soft);
  color: var(--color-text);
}

.sim-step__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* В общих стилях у закрытой кнопки курсор «ждите» — он про отправку формы.
   Здесь кнопка ждёт не сервер, а ответ человека */
.sim-step__nav .btn:disabled {
  cursor: not-allowed;
}

.sim-step__nav .link-button:disabled {
  color: var(--color-muted);
  text-decoration: none;
  cursor: default;
}

.sim-step .sim-step__hint {
  font-size: 0.9375rem;
}

/* На телефоне карточке шага хватит отступа поменьше — останется место терминалу */
@media (max-width: 480px) {
  .sim-step {
    padding: 1rem;
  }
}

/* Развилка */
.fork {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fork .fork__question {
  margin: 0;
}

.fork__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fork__option {
  width: 100%;
  min-height: 44px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.fork__option:hover {
  border-color: var(--color-accent);
}

/* Выбранный вариант: рамка толще, а отступ меньше на столько же — текст не прыгает */
.fork__option[aria-pressed="true"] {
  padding: calc(0.75rem - 1px) calc(1rem - 1px);
  border: 2px solid var(--color-accent);
}

.fork__result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fork__result:empty {
  display: none;
}

/* Неверный ответ не красный: тон спокойный, это урок, а не провал */
.fork .fork__verdict {
  color: var(--color-text);
  font-weight: 700;
}

.fork .fork__verdict--correct {
  color: var(--color-accent);
}

.fork .fork__text {
  color: var(--color-text);
}

/* Новые слова шага */
.terms {
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.terms .terms__title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.terms__list {
  margin: 0;
}

.terms .terms__list dt {
  margin: 0;
  font-size: 1rem;
}

.terms .terms__list dd + dt {
  margin-top: 0.75rem;
}

/* Вкладка «Со мной» */
.with-me__total {
  margin: 1.5rem 0 0.5rem;
  font-weight: 600;
}

/* ===== 2. Экраны ===== */
.screens {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.screen {
  margin: 0;
}

.screen__caption {
  margin: 0 0 0.375rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

/* Терминал: светлый текст на тёмном — перевёрнутые общие цвета, новых нет.
   Строки переносятся, а не прокручиваются вбок: на телефоне так удобнее */
.terminal {
  margin: 0;
  padding: 1rem;
  border-radius: var(--radius);
  background: var(--color-text);
  color: var(--color-border);
  font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.terminal__prompt {
  color: var(--color-accent-soft);
  font-weight: 700;
}

.terminal__command {
  color: var(--color-bg);
}

@media (max-width: 480px) {
  .terminal {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }
}

/* Панель хостинга: пары «название — значение» */
.host-panel {
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.host-panel .host-panel__title {
  margin: 0 0 0.75rem;
  color: var(--color-text);
  font-weight: 700;
}

.host-panel__rows {
  display: grid;
  gap: 0.375rem;
  margin: 0;
}

.host-panel__row {
  display: grid;
  grid-template-columns: minmax(6rem, 1fr) 2fr;
  gap: 1rem;
}

.host-panel .host-panel__row dt {
  margin: 0;
  color: var(--color-muted);
  font-size: 1rem;
  font-weight: 400;
}

.host-panel .host-panel__row dd {
  margin: 0;
  color: var(--color-text);
  font-weight: 600;
}

/* Переписка: мои сообщения справа, бота — слева */
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
}

.chat .chat__message {
  max-width: 80%;
  margin: 0;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius);
  color: var(--color-text);
}

.chat .chat__message--me {
  align-self: flex-end;
  background: var(--color-accent-soft);
}

.chat .chat__message--bot {
  align-self: flex-start;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* ===== 3. Итог и чеклист ===== */
.summary__intro {
  color: var(--color-muted);
}

.compare {
  width: 100%;
  max-width: 40rem;
  border-collapse: collapse;
  background: var(--color-surface);
}

.compare th,
.compare td {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  text-align: center;
}

.compare tbody th {
  font-weight: 600;
  text-align: left;
}

/* min-width: 0 — иначе fieldset не сужается уже своего содержимого и распирает страницу */
.checklist {
  min-width: 0;
  margin: 2rem 0 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

/* float переносит legend с рамки внутрь блока — там он выглядит как обычный заголовок */
.checklist__title {
  float: left;
  width: 100%;
  margin: 0 0 0.5rem;
  padding: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.checklist__hint {
  clear: both;
  margin: 0 0 1rem;
  color: var(--color-muted);
}

.checklist__items {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0.5rem 0;
  cursor: pointer;
}

.checklist__box {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0.2rem 0 0;
  accent-color: var(--color-accent);
}

.summary__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 1.5rem;
}

.summary__status {
  min-height: 1.6em;
  margin: 0.75rem 0 0;
  font-weight: 600;
}

.summary__note {
  margin: 0;
  color: var(--color-muted);
}

/* ===== 4. Печать ===== */
/* На бумагу — только чеклист: заголовок и пункты с отметками */
@media print {
  .site-header,
  .site-footer,
  .simulation,
  #summary-title,
  .summary__intro,
  .compare,
  .checklist__hint,
  .summary__actions,
  .summary__status,
  .summary__note {
    display: none;
  }

  #summary {
    padding: 0;
    background: none;
  }

  .checklist {
    margin: 0;
    padding: 0;
    border: 0;
  }
}
```

- [ ] **Step 5: Дописать разделы 2–3 в конец `homework-4/simulation/simulation.js`**

```js

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
```

- [ ] **Step 6: Главный путь — все 10 шагов, развилки, вкладки, итог**

`about:blank`, затем демо, затем `browser_evaluate`:

```js
() => {
  localStorage.removeItem("zapushchu-simulation");
  return "очищено";
}
```

`about:blank`, снова демо, затем `browser_evaluate` с функцией:

```js
async () => {
  const $ = (id) => document.getElementById(id);
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const shown = (el) => el.getClientRects().length > 0;
  const next = $("next");
  const options = () => [...document.querySelectorAll(".fork__option")];
  const verdict = () => text(document.querySelector(".fork__verdict"));
  const pressed = () => options().map((b) => b.getAttribute("aria-pressed"));
  const result = { focusAfterLoad: document.activeElement === document.body, steps: [] };

  for (let i = 0; i < 10; i++) {
    const entry = {
      progress: text($("step-progress")),
      title: text($("step-title")),
      nextDisabled: next.disabled,
      nextText: text(next),
      hintShown: shown($("step-hint")),
      prevDisabled: $("prev").disabled,
      screens: [...document.querySelectorAll("#step-screens .screen__caption")].map(text),
      terms: [...document.querySelectorAll("#step-terms-list dt")].map(text),
      termsShown: shown($("step-terms")),
      noteShown: shown($("step-note")),
      forkShown: shown($("step-fork")),
    };
    if (entry.forkShown) {
      const correct = STEPS[i].fork.options.findIndex((o) => o.correct);
      const wrong = correct === 0 ? 1 : 0;
      options()[wrong].click();
      entry.wrong = { verdict: verdict(), nextDisabled: next.disabled, pressed: pressed() };
      options()[correct].click();
      entry.right = { verdict: verdict(), nextDisabled: next.disabled, hintShown: shown($("step-hint")) };
      options()[wrong].click();
      entry.wrongAgainDisabled = next.disabled;
      options()[correct].click();
    }
    next.click();
    entry.focusAfterNext = document.activeElement ? document.activeElement.id : null;
    result.steps.push(entry);
  }

  // Назад на пройденную развилку: верный ответ уже выбран
  $("prev").click();
  $("prev").click();
  result.backToFork = { title: text($("step-title")), nextDisabled: next.disabled, pressed: pressed(), verdict: verdict() };

  // Вкладки: клик и клавиши
  $("tab-with-me").click();
  result.withMe = {
    selfHidden: $("panel-self").hidden,
    withMeShown: shown($("panel-with-me")),
    selected: $("tab-with-me").getAttribute("aria-selected"),
    cards: [...document.querySelectorAll("#with-me-steps .card h3")].map(text),
    total: text($("with-me-total")),
  };
  const key = (target, name) => target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }));
  key($("tab-with-me"), "ArrowRight");
  result.arrowRight = { selected: $("tab-self").getAttribute("aria-selected"), focused: document.activeElement.id };
  key($("tab-self"), "End");
  result.end = $("tab-with-me").getAttribute("aria-selected");
  key($("tab-with-me"), "Home");
  result.home = { selected: $("tab-self").getAttribute("aria-selected"), tabindex: [$("tab-self").tabIndex, $("tab-with-me").tabIndex], stepKept: text($("step-title")) };

  // Итог
  result.compare = [...document.querySelectorAll("#compare-body tr")].map((tr) => [...tr.children].map(text));
  const boxes = [...document.querySelectorAll("#checklist-items input")];
  result.checklistCount = boxes.length;
  boxes[1].click();
  boxes[0].click();
  const href = $("send-checklist").getAttribute("href");
  result.hrefShape = [href.startsWith("../index.html?project="), href.endsWith("#form")];
  result.sendText = decodeURIComponent(href.slice("../index.html?project=".length, -"#form".length));
  result.saved = JSON.parse(localStorage.getItem("zapushchu-simulation"));
  $("copy-checklist").click();
  await new Promise((resolve) => setTimeout(resolve, 300));
  result.copyStatusOk = ["Чеклист скопирован.", "Не получилось скопировать. Выделите список и скопируйте вручную."].includes(text($("copy-status")));
  return result;
}
```

Expected (поле в поле):

```json
{
  "focusAfterLoad": true,
  "steps": [
    { "progress": "Шаг 1 из 10", "title": "Арендовать сервер", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": true, "screens": ["Пример панели хостинга"], "terms": ["Сервер (VPS)", "IP-адрес"], "termsShown": true, "noteShown": false, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 2 из 10", "title": "Подключиться к серверу", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": ["SSH", "Терминал"], "termsShown": true, "noteShown": true, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 3 из 10", "title": "Защитить сервер", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": ["Файрвол", "SSH-ключ"], "termsShown": true, "noteShown": true, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 4 из 10", "title": "Перенести код на сервер", "nextDisabled": true, "nextText": "Дальше →", "hintShown": true, "prevDisabled": false, "screens": [], "terms": ["scp"], "termsShown": true, "noteShown": false, "forkShown": true, "wrong": { "verdict": "Так не выйдет", "nextDisabled": true, "pressed": ["true", "false", "false"] }, "right": { "verdict": "Верно", "nextDisabled": false, "hintShown": false }, "wrongAgainDisabled": true, "focusAfterNext": "step-title" },
    { "progress": "Шаг 5 из 10", "title": "Поставить библиотеки", "nextDisabled": true, "nextText": "Дальше →", "hintShown": true, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": ["Библиотека", "pip", "Виртуальное окружение (venv)"], "termsShown": true, "noteShown": false, "forkShown": true, "wrong": { "verdict": "Так не выйдет", "nextDisabled": true, "pressed": ["true", "false", "false"] }, "right": { "verdict": "Верно", "nextDisabled": false, "hintShown": false }, "wrongAgainDisabled": true, "focusAfterNext": "step-title" },
    { "progress": "Шаг 6 из 10", "title": "Убрать ключи из кода", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": [".env"], "termsShown": true, "noteShown": true, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 7 из 10", "title": "Запустить", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер", "Пример переписки в Telegram"], "terms": [], "termsShown": false, "noteShown": true, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 8 из 10", "title": "Сделать, чтобы бот не выключался", "nextDisabled": true, "nextText": "Дальше →", "hintShown": true, "prevDisabled": false, "screens": [], "terms": ["Служба (systemd)"], "termsShown": true, "noteShown": false, "forkShown": true, "wrong": { "verdict": "Так не выйдет", "nextDisabled": true, "pressed": ["false", "true", "false"] }, "right": { "verdict": "Верно", "nextDisabled": false, "hintShown": false }, "wrongAgainDisabled": true, "focusAfterNext": "step-title" },
    { "progress": "Шаг 9 из 10", "title": "Настроить резервные копии", "nextDisabled": false, "nextText": "Дальше →", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": ["Резервная копия", "cron", "rclone"], "termsShown": true, "noteShown": false, "forkShown": false, "focusAfterNext": "step-title" },
    { "progress": "Шаг 10 из 10", "title": "Следить, что бот жив", "nextDisabled": false, "nextText": "К итогу ↓", "hintShown": false, "prevDisabled": false, "screens": ["Запись терминала, а не живой сервер"], "terms": ["Журнал (логи)", "Мониторинг"], "termsShown": true, "noteShown": true, "forkShown": false, "focusAfterNext": "summary-title" }
  ],
  "backToFork": { "title": "Сделать, чтобы бот не выключался", "nextDisabled": false, "pressed": ["true", "false", "false"], "verdict": "Верно" },
  "withMe": { "selfHidden": true, "withMeShown": true, "selected": "true", "cards": ["Вы присылаете код", "Я оцениваю — бесплатно", "Вы получаете работающего бота"], "total": "Все 10 шагов из режима «Сам» делаю я." },
  "arrowRight": { "selected": "true", "focused": "tab-self" },
  "end": "true",
  "home": { "selected": "true", "tabindex": [0, -1], "stepKept": "Сделать, чтобы бот не выключался" },
  "compare": [["Шагов", "10", "3"], ["Новых слов", "17", "0"], ["Развилок, где можно ошибиться", "3", "0"]],
  "checklistCount": 10,
  "hrefShape": [true, true],
  "sendText": "Чеклист запуска из демо «Сам или со мной».\nУже есть: сервер или хостинг, автоперезапуск.\nНет или не знаю: ключи вне кода, защита сервера, резервные копии, мониторинг, журнал ошибок, домен и SSL (для сайта), доступы на вас, инструкция по обновлению.",
  "saved": { "tab": "self", "step": 7, "furthest": 10, "has": ["server", "restart"] },
  "copyStatusOk": true
}
```

Затем `browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.

- [ ] **Step 7: Перезагрузка, «Начать сначала», вкладка посреди развилки**

`about:blank`, снова демо, затем `browser_evaluate`:

```js
async () => {
  const $ = (id) => document.getElementById(id);
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const checked = () => [...document.querySelectorAll("#checklist-items input:checked")].map((b) => b.value);
  const result = {
    afterReload: {
      tabSelf: $("tab-self").getAttribute("aria-selected"),
      title: text($("step-title")),
      nextDisabled: $("next").disabled,
      checked: checked(),
      sendKept: decodeURIComponent($("send-checklist").getAttribute("href")).includes("Уже есть: сервер или хостинг, автоперезапуск."),
    },
  };

  $("restart").click();
  result.afterRestart = { progress: text($("step-progress")), focused: document.activeElement.id, checked: checked() };

  $("next").click();
  $("next").click();
  $("next").click();
  result.forkLocked = { title: text($("step-title")), nextDisabled: $("next").disabled };

  document.querySelectorAll(".fork__option")[1].click();
  $("tab-with-me").click();
  $("tab-self").click();
  result.afterTabs = {
    nextDisabled: $("next").disabled,
    pressed: [...document.querySelectorAll(".fork__option")].map((b) => b.getAttribute("aria-pressed")),
    verdict: text(document.querySelector(".fork__verdict")),
  };

  // Уходим на «Со мной» — после перезагрузки должна открыться она
  $("tab-with-me").click();
  result.saved = JSON.parse(localStorage.getItem("zapushchu-simulation"));
  return result;
}
```

Expected:

```json
{
  "afterReload": { "tabSelf": "true", "title": "Сделать, чтобы бот не выключался", "nextDisabled": false, "checked": ["server", "restart"], "sendKept": true },
  "afterRestart": { "progress": "Шаг 1 из 10", "focused": "step-title", "checked": ["server", "restart"] },
  "forkLocked": { "title": "Перенести код на сервер", "nextDisabled": true },
  "afterTabs": { "nextDisabled": false, "pressed": ["false", "true", "false"], "verdict": "Верно" },
  "saved": { "tab": "withMe", "step": 3, "furthest": 3, "has": ["server", "restart"] }
}
```

`about:blank`, снова демо, затем `browser_evaluate`:

```js
() => ({
  withMeShown: document.getElementById("panel-with-me").getClientRects().length > 0,
  selfHidden: document.getElementById("panel-self").hidden,
  progress: document.getElementById("step-progress").textContent,
  nextDisabled: document.getElementById("next").disabled,
})
```

Expected: `{ "withMeShown": true, "selfHidden": true, "progress": "Шаг 4 из 10", "nextDisabled": true }`.

- [ ] **Step 8: Испорченное хранилище — чистый старт**

`browser_evaluate`:

```js
() => {
  localStorage.setItem("zapushchu-simulation", "мусор");
  return "испорчено";
}
```

`about:blank`, снова демо, затем `browser_evaluate`:

```js
() => ({
  tabSelf: document.getElementById("tab-self").getAttribute("aria-selected"),
  progress: document.getElementById("step-progress").textContent,
  checked: document.querySelectorAll("#checklist-items input:checked").length,
})
```

Expected: `{ "tabSelf": "true", "progress": "Шаг 1 из 10", "checked": 0 }`. Затем
`browser_console_messages` с `{"level": "error"}` — ни одного `[ERROR]`.

- [ ] **Step 9: Браузер запрещает хранилище (Review Focus 1)**

`browser_run_code_unsafe` с кодом:

```js
async (page) => {
  // Отдельная вкладка: скрипт-запрет остаётся только в ней и не мешает следующим проверкам
  const tab = await page.context().newPage();
  const errors = [];
  tab.on("pageerror", (error) => errors.push(error.message));
  await tab.addInitScript(() => {
    const blocked = () => {
      throw new DOMException("Доступ к хранилищу запрещён", "SecurityError");
    };
    Storage.prototype.getItem = blocked;
    Storage.prototype.setItem = blocked;
  });
  await tab.goto("http://127.0.0.1:8765/homework-4/simulation/index.html");
  const result = await tab.evaluate(() => {
    document.getElementById("next").click();
    document.querySelector('#checklist-items input[value="logs"]').click();
    return {
      progress: document.getElementById("step-progress").textContent,
      sendOk: decodeURIComponent(document.getElementById("send-checklist").getAttribute("href")).includes("Уже есть: журнал ошибок."),
    };
  });
  await tab.close();
  return { ...result, errors };
}
```

Expected: `{ "progress": "Шаг 2 из 10", "sendOk": true, "errors": [] }`.

- [ ] **Step 10: Печать — только чеклист**

`about:blank`, снова демо, затем `browser_run_code_unsafe`:

```js
async (page) => {
  await page.emulateMedia({ media: "print" });
  const result = await page.evaluate(() => {
    const shown = (selector) => [...document.querySelectorAll(selector)].some((el) => el.getClientRects().length > 0);
    return {
      legend: shown(".checklist__title"),
      items: [...document.querySelectorAll(".checklist__item")].filter((el) => el.getClientRects().length > 0).length,
      header: shown(".site-header"),
      footer: shown(".site-footer"),
      simulation: shown(".simulation"),
      summaryTitle: shown("#summary-title"),
      intro: shown(".summary__intro"),
      compare: shown(".compare"),
      hint: shown(".checklist__hint"),
      actions: shown(".summary__actions"),
      status: shown(".summary__status"),
      note: shown(".summary__note"),
    };
  });
  await page.emulateMedia({ media: "screen" });
  return result;
}
```

Expected: `{ "legend": true, "items": 10, "header": false, "footer": false, "simulation": false, "summaryTitle": false, "intro": false, "compare": false, "hint": false, "actions": false, "status": false, "note": false }`.

- [ ] **Step 11: Ширины 1280 и 360 px — без горизонтальной прокрутки (Review Focus 5)**

Для каждой ширины (сначала `{"width": 1280, "height": 900}`, потом `{"width": 360, "height": 800}`):
`browser_resize`, затем `browser_evaluate`:

```js
() => {
  localStorage.setItem("zapushchu-simulation", JSON.stringify({ tab: "self", step: 0, furthest: 10, has: [] }));
  return "все шаги пройдены";
}
```

`about:blank`, снова демо, затем `browser_evaluate`:

```js
() => {
  const overflow = [];
  for (let i = 0; i < 10; i++) {
    if (document.documentElement.scrollWidth > window.innerWidth) {
      overflow.push(STEPS[i].id);
    }
    if (i < 9) {
      document.getElementById("next").click();
    }
  }
  document.getElementById("tab-with-me").click();
  if (document.documentElement.scrollWidth > window.innerWidth) {
    overflow.push("with-me");
  }
  document.getElementById("tab-self").click();
  return overflow;
}
```

Expected на обеих ширинах: `[]`. Шаги с пройденными развилками показывают экраны верного ответа —
самые длинные строки (`python`, `autostart`, `monitoring`) проверяются этим же проходом.

На ширине 360 px вернись к шагу `autostart` (`browser_evaluate`:
`() => { document.getElementById("prev").click(); document.getElementById("prev").click(); return document.getElementById("step-title").textContent; }`
→ `"Сделать, чтобы бот не выключался"`) и сделай `browser_take_screenshot` на всю страницу
(`fullPage: true`). Посмотри на скриншот: терминал читается и переносит строки, кнопки навигации
видны, вкладки во всю ширину. Затем верни `browser_resize` на 1280 × 900 и проверь консоль — ни
одного `[ERROR]`.

- [ ] **Step 12: Прогнать проверку данных ещё раз**

Run: `node "$SCRATCH/sim-check.js"`
Expected: `sim-check: все 12 групп проверок прошли` — разделы 2–3 не задели раздел 1.

- [ ] **Step 13: Commit**

```bash
cd /e/Domains/BELHARD && git add homework-4/simulation/index.html homework-4/simulation/simulation.css homework-4/simulation/simulation.js && git commit -q -F - <<'EOF'
homework-4: симуляция — страница

Вкладки «Сам» и «Со мной», шаги с экранами терминала, панели хостинга и
чата, развилки с последствиями выбора, итог со сравнением и чеклистом:
отправка в форму, копирование, печать. Вкладка, шаг и отметки
сохраняются в браузере; без хранилища страница тоже работает.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Общая кнопка-ссылка, лендинг, оглавление, CLAUDE.md

**Files:**
- Modify: `homework-4/styles.css` (блок 1 — `.link-button`; блок 3 — `.steps-cta`)
- Modify: `homework-4/diagnostic/diagnostic.css` (удалить `.link-button`)
- Modify: `homework-4/code-check/code-check.css` (удалить `.link-button`)
- Modify: `homework-4/index.html` (строка со ссылкой в `#steps`)
- Modify: `index.html` в корне репозитория (пункт оглавления)
- Modify: `CLAUDE.md` в корне репозитория

**Interfaces:**
- Consumes: из задачи 2 — страница `homework-4/simulation/index.html`, `#checklist-items input[value]`,
  `a#send-checklist`. С лендинга — поле `#project` и подстановка `?project=` в `script.js`.
- Produces: `.link-button` в `styles.css` — общая для всех демо; `p.steps-cta > a[href="simulation/index.html"]`
  на лендинге.

- [ ] **Step 1: Снять, как выглядят кнопки-ссылки сейчас, и проверить, что ссылки на симуляцию нет**

Git Bash:

```bash
cd /e/Domains/BELHARD/homework-4 && grep -c "^\.link-button {" styles.css diagnostic/diagnostic.css code-check/code-check.css; grep -c "steps-cta" index.html styles.css
```

Expected (до правок): `styles.css:0`, `diagnostic/diagnostic.css:1`, `code-check/code-check.css:1`;
`index.html:0`, `styles.css:0`.

Для диагностики и проверки кода: `about:blank`, затем страница
(`http://127.0.0.1:8765/homework-4/diagnostic/index.html`, потом
`http://127.0.0.1:8765/homework-4/code-check/index.html`), на каждой `browser_evaluate`:

```js
() => [...document.querySelectorAll(".link-button")].map((el) => {
  const s = getComputedStyle(el);
  return [el.id, s.color, s.fontWeight, s.textDecorationLine, s.paddingTop, s.borderTopWidth, s.backgroundColor, s.cursor];
})
```

Expected — диагностика: `[["restart", "rgb(15, 118, 110)", "600", "underline", "0px", "0px", "rgba(0, 0, 0, 0)", "pointer"]]`;
проверка кода: те же значения для `"clear"` и `"check-another"`. Если значения другие — запиши
фактические: они и есть эталон для шага 5.

Лендинг: `about:blank`, затем `http://127.0.0.1:8765/homework-4/index.html`, `browser_evaluate`:

```js
() => {
  const link = document.querySelector("#steps .steps-cta a");
  return { href: link ? link.getAttribute("href") : null, fontSize: link ? getComputedStyle(link.parentElement).fontSize : null };
}
```

Expected FAIL: `{ "href": null, "fontSize": null }` вместо `{ "href": "simulation/index.html", "fontSize": "18px" }`.

- [ ] **Step 2: Перенести `.link-button` в блок 1 `homework-4/styles.css`**

Найти:

```css
.btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
}
```

Заменить на:

```css
.btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
}

/* Кнопка, которая выглядит как ссылка: второстепенное действие рядом с главным.
   Общая для всех демо — не копируй её в их стили */
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

- [ ] **Step 3: Удалить копии из `diagnostic/diagnostic.css` и `code-check/code-check.css`**

В обоих файлах удалить этот фрагмент целиком (вместе с пустой строкой перед ним):

```css

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

- [ ] **Step 4: Ссылка на симуляцию на лендинге**

В `homework-4/index.html` найти:

```html
            <p>Ссылку, по которой проект открывается, и доступы, чтобы он был полностью вашим.</p>
          </li>
        </ol>
```

Заменить на:

```html
            <p>Ссылку, по которой проект открывается, и доступы, чтобы он был полностью вашим.</p>
          </li>
        </ol>
        <p class="steps-cta">Хотите сначала посмотреть, как это делают вручную? <a href="simulation/index.html">Попробовать запустить бота самому — без риска что-то сломать</a></p>
```

В `homework-4/styles.css` найти:

```css
/* Строка со ссылкой на проверку кода — под карточками проблем */
.problem-cta {
```

Заменить на:

```css
/* Строки со ссылками на демо — под карточками проблем и под шагами */
.problem-cta,
.steps-cta {
```

- [ ] **Step 5: Повторить проверки шага 1 — теперь они должны пройти**

Git Bash — та же команда, что в шаге 1. Expected: `styles.css:1`, `diagnostic/diagnostic.css:0`,
`code-check/code-check.css:0`; `index.html:1`, `styles.css:1`.

Диагностика и проверка кода — та же функция, значения **совпадают** с шагом 1. Лендинг — та же
функция, Expected: `{ "href": "simulation/index.html", "fontSize": "18px" }`. Консоль на всех трёх
страницах — ни одного `[ERROR]`.

Страница симуляции: `about:blank`, затем демо, `browser_evaluate` с той же функцией, что для
диагностики. Expected: `restart`, `prev`, `copy-checklist`, `print-checklist` — с теми же
значениями, кроме `prev`: на шаге 1 он закрыт, поэтому `["prev", "rgb(82, 96, 109)", "600", "none", "0px", "0px", "rgba(0, 0, 0, 0)", "default"]`.
Если в хранилище остался шаг не первый — сначала `localStorage.removeItem("zapushchu-simulation")`
и перезагрузка.

- [ ] **Step 6: Сквозной путь — лендинг → симуляция → форма**

`browser_run_code_unsafe`:

```js
async (page) => {
  await page.goto("http://127.0.0.1:8765/homework-4/index.html");
  await page.click("#steps .steps-cta a");
  await page.waitForURL(/homework-4\/simulation\/index\.html$/);
  const reached = page.url().endsWith("/homework-4/simulation/index.html");
  await page.evaluate(() => localStorage.removeItem("zapushchu-simulation"));
  await page.goto("about:blank");
  await page.goto("http://127.0.0.1:8765/homework-4/simulation/index.html");
  await page.click('#checklist-items input[value="server"]');
  await page.click('#checklist-items input[value="restart"]');
  await page.click("#send-checklist");
  await page.waitForURL(/homework-4\/index\.html\?project=/);
  return { reached, formHash: page.url().endsWith("#form"), value: await page.inputValue("#project") };
}
```

Expected:

```json
{
  "reached": true,
  "formHash": true,
  "value": "Чеклист запуска из демо «Сам или со мной».\nУже есть: сервер или хостинг, автоперезапуск.\nНет или не знаю: ключи вне кода, защита сервера, резервные копии, мониторинг, журнал ошибок, домен и SSL (для сайта), доступы на вас, инструкция по обновлению."
}
```

- [ ] **Step 7: Пункт в корневом оглавлении `index.html`**

Найти:

```html
    <li><a href="homework-4/code-check/">homework-4/code-check — демо «Проверка кода»: разбор кода от AI прямо в браузере</a></li>
```

Заменить на:

```html
    <li><a href="homework-4/code-check/">homework-4/code-check — демо «Проверка кода»: разбор кода от AI прямо в браузере</a></li>
    <li><a href="homework-4/simulation/">homework-4/simulation — демо «Сам или со мной»: запуск Telegram-бота по шагам</a></li>
```

Проверка: `about:blank`, затем `http://127.0.0.1:8765/index.html`, `browser_evaluate`
`() => [...document.querySelectorAll("li a")].map((a) => a.getAttribute("href"))` → последний
элемент `"homework-4/simulation/"`. Затем перейти по этой ссылке (`browser_navigate` на
`http://127.0.0.1:8765/homework-4/simulation/`) — открывается симуляция, консоль без `[ERROR]`.

- [ ] **Step 8: Обновить `CLAUDE.md`**

1. Найти:

   ```
   start homework-4\code-check\index.html
   ```

   Заменить на:

   ```
   start homework-4\code-check\index.html
   start homework-4\simulation\index.html
   ```

2. Найти:

   ```
   **Демо — каждое в своей папке** (`diagnostic/`, `code-check/`; дальше по `demo.md` — симуляция). У демо свои html, css и js; общие цвета, кнопки и карточки берутся из `../styles.css`, свои цвета не заводятся.
   ```

   Заменить на:

   ```
   **Демо — каждое в своей папке** (`diagnostic/`, `code-check/`, `simulation/`). У демо свои html, css и js; общие цвета, кнопки (в том числе кнопка-ссылка `.link-button`) и карточки берутся из `../styles.css` — не копируй их в стили демо, свои цвета не заводятся.
   ```

3. Найти абзац, который начинается с `**Проверка кода `code-check/`**` и заканчивается
   `` Спека с эталонами и отрицательными случаями — `docs/superpowers/specs/2026-09-30-code-check-demo-design.md`. ``
   После него (через пустую строку) вставить:

   ```
   **Симуляция `simulation/`** — запуск Telegram-бота из примера проверки кода по шагам. Вкладка «Сам» — 10 шагов с экранами терминала и три развилки, вкладка «Со мной» — три шага клиента; под ними итог: сравнение путей и чеклист, отметки которого уходят в форму. Сценарий — таблицы `STEPS`, `WITH_ME`, `CHECKLIST` в `scenario.js`, логика — `simulation.js`. Числа в сравнении скрипт считает по таблицам — руками их не пиши. Экраны терминала сняты с настоящей Ubuntu 24.04 в Docker или сверены с исходниками программ (раздел 13 спеки): меняешь команду — перепроверь её вывод, иначе знающий человек заметит фальшь. В `localStorage` под ключом `zapushchu-simulation` — вкладка, шаг и отметки чеклиста. Спека — `docs/superpowers/specs/2026-09-30-simulation-demo-design.md`.
   ```

4. Найти последний пункт списка «Что проверять после правок» раздела homework-4 — он начинается с
   `- проверка кода: три примера дают эталонные отчёты из спеки;`. После него вставить:

   ```
   - симуляция: скрипт проверки сценария из плана `docs/superpowers/plans/2026-09-30-simulation-demo.md` (задача 1, шаг 1) проходит; все 10 шагов проходятся, «Дальше» на развилке закрыта до верного ответа; «Отправить чеклист на бесплатную оценку» открывает лендинг с заполненным полем «Что за проект»; при печати виден только чеклист.
   ```

Проверка: `grep -n "simulation" /e/Domains/BELHARD/CLAUDE.md` — строки из всех четырёх правок.

- [ ] **Step 9: Финальный прогон**

Run: `node "$SCRATCH/sim-check.js"` → `sim-check: все 12 групп проверок прошли`.
`git -C /e/Domains/BELHARD status --short` — изменены только файлы из списка задачи 3 (плюс
неотслеживаемые `.vscode/`, их не трогать).

- [ ] **Step 10: Commit**

```bash
cd /e/Domains/BELHARD && git add homework-4/styles.css homework-4/diagnostic/diagnostic.css homework-4/code-check/code-check.css homework-4/index.html index.html CLAUDE.md && git commit -q -F - <<'EOF'
homework-4: симуляция связана с лендингом, общая кнопка-ссылка

На лендинге под шагами «Как это работает» — ссылка «Попробовать
запустить бота самому». Кнопка-ссылка .link-button переехала в общий
styles.css вместо копий в каждом демо. Пункт в оглавлении и раздел про
симуляцию в CLAUDE.md.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Step 11: Ручная проверка по двойному клику (`file://`)**

Попросить автора открыть `homework-4\simulation\index.html` двойным кликом и пройти пару шагов:
Playwright `file://` не открывает. Ожидается то же, что по `http://`: шаги листаются, развилки
работают, «Отправить чеклист» открывает лендинг с заполненным полем, в консоли нет ошибок.
