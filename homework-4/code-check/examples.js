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
