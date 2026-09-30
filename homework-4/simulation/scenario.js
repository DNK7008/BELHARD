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
    note: "Свой SSH-ключ на сервер положили заранее: ssh-keygen на вашем компьютере создаёт пару ключей, а открытую половину дописывают в файл ~/.ssh/authorized_keys на сервере — в записи этот шаг пропущен. Файл называется 00-no-password.conf не случайно: на многих серверах уже лежит 50-cloud-init.conf, который разрешает вход по паролю, а побеждает настройка из файла, прочитанного первым.",
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
    note: "Перед этим rclone один раз настраивают командой rclone config: подключают облачное хранилище и называют его backup — в записи этот шаг пропущен. Без этого ночная копия никуда не уедет.",
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
