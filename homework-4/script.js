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

// Демо-страницы (например, diagnostic/) передают результат в адресе: index.html?project=…#form.
// Подставляем его в поле «Что за проект», чтобы человеку не пришлось писать заново.
// Текст пишется в value, а не в разметку, поэтому чужая ссылка ничего не внедрит в страницу.
const projectFromDemo = new URLSearchParams(window.location.search).get("project");
if (projectFromDemo) {
  const projectField = form.elements.project;
  projectField.value = projectFromDemo.slice(0, projectField.maxLength);
}

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
    .filter((field) => field.required)
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
