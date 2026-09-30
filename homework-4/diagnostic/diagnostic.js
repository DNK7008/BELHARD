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
