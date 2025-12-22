// Function to open the project modal
window.openProjectModal = function (id) {
  // Get elements of the modal
  const modal = document.getElementById('projectModal');
  const projectContentContainer = document.getElementById('projectContentContainer');
  // Hide all project content
  const allProjectContents = projectContentContainer.querySelectorAll('.project-content');
  allProjectContents.forEach((content) => {
    content.classList.add('hidden');
  });
  // Show the selected project content
  const selectedProjectContent = projectContentContainer.querySelector(`.project-content[data-project-id="${id}"]`);
  if (selectedProjectContent) {
    selectedProjectContent.classList.remove('hidden');
  }
  // Show modal and disable body scroll
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Re-render Lucide icons inside the modal
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};
// Function to close the project modal
window.closeModal = function (e) {
  // Prevent closing if clicking on content, but allow closing if clicking on backdrop
  if (e && e.target.id !== 'projectModal') return;
  const modal = document.getElementById('projectModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
};
// Function to open the project details modal
window.openProjectDetailsModal = function (id) {
  // Get elements of the project details modal
  const projectDetailsModal = document.getElementById('projectDetailsModal');
  const projectDetailsContent = document.getElementById('projectDetailsContent');

  // Display content based on project ID
  if (id === '1') {
    // Special content for Rucken project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">Rucken: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Инженерная платформа, прожитая на практике</p>
                        
                        <div class="space-y-6">
                            <!-- Context and Duration -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-6 h-6 text-neo-pink"></i> Контекст и длительность работы</h2>
                                <p class="mb-4">Проект <strong>Rucken</strong> не имел чёткой даты начала и конца — он развивался <strong>параллельно с реальной работой</strong>.</p>
                                <p class="mb-4">В общей сложности:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>активная разработка заняла <strong>примерно 2–3 года</strong>,</li>
                                    <li>существовало <strong>несколько итераций и версий</strong>,</li>
                                    <li>часть истории коммитов не сохранилась, так как решения переезжали между проектами и репозиториями.</li>
                                </ul>
                                <p class="mb-6">Это был не «спринт», а <strong>длительный инженерный процесс</strong> с накоплением опыта и ошибок.</p>
                            </article>

                            <!-- Original Goal -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Исходная цель (напоминание)</h2>
                                <p class="mb-4"><strong>Rucken</strong> создавался, чтобы:</p>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>убрать повторяющиеся архитектурные решения,</li>
                                    <li>ускорить разработку backend / frontend / mobile,</li>
                                    <li>централизовать лучшие практики,</li>
                                    <li>выдерживать рост количества сущностей, таблиц и экранов.</li>
                                </ul>
                            </article>

                            <!-- Code Generation -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="code" class="w-6 h-6 text-neo-green"></i> Генерация кода: что сработало, а что нет</h2>
                                
                                <h3 class="text-xl font-bold mb-3 mt-6">Что оказалось полезным</h3>
                                <p class="mb-4">Генераторы кода действительно дали огромный плюс:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>массовое создание backend-кода,</li>
                                    <li>генерация frontend и mobile-частей,</li>
                                    <li>секунды вместо дней ручной работы,</li>
                                    <li>возможность быстро масштабировать проект по количеству сущностей.</li>
                                </ul>
                                <p class="mb-6">На старте и в фазе активного роста это <strong>работало отлично</strong>.</p>
                                
                                <h3 class="text-xl font-bold mb-3 mt-6">Где начались реальные проблемы</h3>
                                <p class="mb-4">Когда система стала сложной, вскрылись ограничения подхода.</p>
                                
                                <h4 class="text-lg font-bold mb-3 mt-4">1. Кастомизация под конкретные кейсы</h4>
                                <p class="mb-4">Реальные интерфейсы почти никогда не одинаковые.</p>
                                <p class="mb-2">Пример:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>связь по FK может быть:
                                        <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                            <li>выпадающим списком,</li>
                                            <li>модальным окном,</li>
                                            <li>автокомплитом,</li>
                                            <li>кастомным UI.</li>
                                        </ul>
                                    </li>
                                </ul>
                                <p class="mb-4">Если генератор создаёт «усреднённый» код, то:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>любую нестандартную логику нужно:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>встраивать в генератор,</li>
                                        <li>не поломать другие сценарии,</li>
                                        <li>поддерживать это дальше.</li>
                                    </ul>
                                </ul>
                                <p class="mb-6">Сложность генераторов росла <strong>быстрее, чем сложность продукта</strong>.</p>
                                
                                <h4 class="text-lg font-bold mb-3 mt-4">2. Ручные правки vs повторная генерация</h4>
                                <p class="mb-4">Появился ключевой конфликт:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>генератор хочет переписать файл,</li>
                                    <li>разработчик уже внёс в него ручные изменения.</li>
                                </ul>
                                <p class="mb-4">Чтобы решить это, я реализовал <strong>механизм текстового маркера</strong>:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>генератор при повторном запуске:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>сканирует существующие файлы,</li>
                                        <li>если находит <strong>маркер ручной модификации</strong> — файл не трогает,</li>
                                    </ul>
                                    <li>маркер явно показывает:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>«здесь код изменён вручную».</li>
                                    </ul>
                                </ul>
                                <p class="mb-6">Это позволило:</p>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>безопасно перегенерировать проект,</li>
                                    <li>не терять кастомные правки,</li>
                                    <li>работать с большим количеством файлов.</li>
                                </ul>
                                
                                <h4 class="text-lg font-bold mb-3 mt-4">3. Избыточность кода</h4>
                                <p class="mb-4">Из-за генерации:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>файлов становилось <strong>очень много</strong>,</li>
                                    <li>значительная часть:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>не использовалась,</li>
                                        <li>использовалась только в отдельных сценариях.</li>
                                    </ul>
                                </ul>
                                <p class="mb-4">Следствия:</p>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>линтование занимает много времени,</li>
                                    <li>Angular live-reload замедляется,</li>
                                    <li>NestJS hot-reload становится ощутимо медленным,</li>
                                    <li>билды начинают идти значительно дольше.</li>
                                </ul>
                            </article>

                            <!-- Key Conclusions -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="brain" class="w-6 h-6 text-neo-purple"></i> Главные выводы по генерации</h2>
                                <p class="mb-4">После 2–3 лет работы с этим подходом я пришёл к важным выводам:</p>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">✔️ Генерация кода — это хорошо, когда:</h3>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>нужно <strong>быстро создать много однотипного кода</strong>,</li>
                                    <li>проект находится в фазе активного роста,</li>
                                    <li>требования ещё не устоялись.</li>
                                </ul>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">⚠️ Генерация кода становится проблемой, когда:</h3>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>начинается глубокая кастомизация,</li>
                                    <li>каждый экран и сущность ведёт себя по-разному,</li>
                                    <li>генераторы становятся сложнее поддерживаемого кода,</li>
                                    <li>инфраструктура начинает тормозить разработку.</li>
                                </ul>
                            </article>

                            <!-- Conscious Pause -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="pause" class="w-6 h-6 text-neo-yellow"></i> Осознанная пауза</h2>
                                <p class="mb-4">После завершения этого проекта я сознательно:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li><strong>взял паузу</strong> в системах с тяжёлой генерацией кода,</li>
                                    <li>начал переосмысливать сам подход:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>к генерации,</li>
                                        <li>к масштабированию,</li>
                                        <li>к ускорению разработки.</li>
                                    </ul>
                                </ul>
                                <p class="mb-6">Цель паузы:</p>
                                <blockquote class="border-l-4 border-neo-pink pl-4 italic mb-6">
                                    <p>найти либо другой способ ускорения разработки,</p>
                                    <p>либо минимизировать те проблемы, которые проявились в Rucken.</p>
                                </blockquote>
                            </article>

                            <!-- Why Important -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="star" class="w-6 h-6 text-neo-pink"></i> Почему это важный результат</h2>
                                <p class="mb-6"><strong>Rucken</strong> ценен не только тем, что был сделан, а тем, <strong>какие выводы он позволил сделать</strong>:</p>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>где генерация действительно экономит время,</li>
                                    <li>где она начинает мешать,</li>
                                    <li>как архитектурные решения влияют на скорость команды,</li>
                                    <li>почему «ускорение» может в итоге замедлить.</li>
                                </ul>
                            </article>

                            <!-- Final Result -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="file-text" class="w-6 h-6 text-neo-blue"></i> Финальный итог</h2>
                                <p class="mb-6"><strong>Rucken</strong> — это:</p>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>2–3 года инженерной практики,</li>
                                    <li>десятки архитектурных решений,</li>
                                    <li>реальные ошибки и реальные выводы,</li>
                                    <li>опыт, который невозможно получить из теории.</li>
                                </ul>
                                <p class="mb-6">Это проект, который:</p>
                                <blockquote class="border-l-4 border-neo-pink pl-4 italic mb-6">
                                    <p>не просто решал задачи,</p>
                                    <p>а научил понимать границы инженерных решений.</p>
                                </blockquote>
                            </article>

                            <!-- Key Value -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-green"></i> Ключевая ценность проекта сегодня</h2>
                                <ul class="list-disc pl-6 mb-6 space-y-2">
                                    <li>Глубокое понимание проблем кодогенерации</li>
                                    <li>Опыт масштабирования архитектуры на практике</li>
                                    <li>Осознанный подход к декомпозиции</li>
                                    <li>Понимание стоимости «ускорения разработки»</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '2') {
    // Special content for KaufmanBot project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">KaufmanBot: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Архитектурный эксперимент и демонстрационная платформа</p>
                        
                        <div class="space-y-6">
                            <!-- Overall Idea -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Общая идея</h2>
                                <p class="mb-4"><strong>KaufmanBot</strong> — исследовательский и архитектурный проект, цель которого была:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>изучить и продемонстрировать <strong>мультипровайдинг в NestJS</strong></li>
                                    <li>построить <strong>плагинную архитектуру</strong> для Telegram-бота</li>
                                    <li>проверить различные инженерные и DevOps-подходы на живом проекте</li>
                                </ul>
                                <p class="mb-4">Проект задумывался не как продукт, а как <strong>демонстрационная и обучающая платформа</strong>.</p>
                            </article>

                            <!-- Key Architectural Idea -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="layers-3" class="w-6 h-6 text-neo-green"></i> Ключевая архитектурная идея — мультипровайдинг</h2>
                                <p class="mb-4">Я привык к мультипровайдингу в Angular и хотел получить аналогичное поведение в NestJS.<br>Так как NestJS не поддерживает это из коробки, я написал отдельную библиотеку:</p>
                                <p class="mb-4 font-mono text-sm bg-gray-100 p-3"><a href="https://github.com/EndyKaufman/nestjs-custom-injector" target="_blank" class="text-neo-black font-bold underline">nestjs-custom-injector</a></p>
                                <p class="mb-4">Что она даёт:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>несколько провайдеров под одним DI-токеном</li>
                                    <li>плагинную модель без ручной регистрации</li>
                                    <li>поведение, близкое к Angular multi providers</li>
                                </ul>
                                <p class="mb-4">Бот выступает как практический пример использования этой библиотеки.</p>
                            </article>

                            <!-- Plugin Architecture -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="plug" class="w-6 h-6 text-neo-purple"></i> Плагинная архитектура</h2>
                                <p class="mb-4">Каждая функциональность бота реализована как <strong>отдельный плагин (lib)</strong>:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>изолированная логика</li>
                                    <li>собственные зависимости</li>
                                    <li>независимое подключение</li>
                                    <li>единый контракт через мультипровайдинг</li>
                                </ul>
                            </article>

                            <!-- Plugin Examples -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="code" class="w-6 h-6 text-neo-yellow"></i> Примеры плагинов (сжато)</h2>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">Системные плагины</h3>
                                <p class="mb-2"><strong>Отладка</strong> — управление debug-режимом<br>
                                Команды: debug on/off/state/help, отладка включить/выключить<br>
                                Поддержка RU / EN и синонимов</p>
                                
                                <p class="mb-2"><strong>Короткие команды</strong> — сокращённые алиасы для длинных команд<br>
                                Команды: scmd state/help, кмд состояние/помощь</p>
                                
                                <p class="mb-2"><strong>Работа в группах</strong> — поддержка сценариев в групповых чатах<br>
                                Команды: groups help/meet, группы помощь/знакомство</p>
                                
                                <p class="mb-4"><strong>Переключение языка</strong> — управление локалью пользователя<br>
                                Команды: my locale, change locale to ru, мой язык</p>
                                
                                <h3 class="text-xl font-bold mb-3">Пользовательские и групповые плагины</h3>
                                <p class="mb-2"><strong>Конвертер валют</strong> — конвертация валют с контекстом<br>
                                Команды: convert 1 usd to eur, ещё / дальше</p>
                                
                                <p class="mb-2"><strong>Генератор фактов</strong> — случайные факты с продолжением<br>
                                Команды: get fact(s), дай факт(ы), ещё / дальше</p>
                                
                                <p class="mb-2"><strong>Генератор цитат</strong> — случайные цитаты<br>
                                Команды: get quote(s), дай цитату, ещё / дальше</p>
                                
                                <p class="mb-2"><strong>Генератор шуток</strong> — случайные шутки<br>
                                Команды: get joke(s), пошути, рассмеши, ещё / дальше</p>
                                
                                <p class="mb-2"><strong>Первое знакомство</strong> — многошаговый сценарий с сохранением состояния<br>
                                Команды: meet start/reset/help, знакомство начать</p>
                                
                                <p class="mb-4"><strong>Демо-заказ такси</strong> — пошаговый сценарий с несколькими экранами<br>
                                Команды: get taxi, дай такси</p>
                            </article>

                            <!-- Telegram Stack -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <article class="p-6 neo-border bg-white shadow-neo-sm">
                                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="message-circle" class="w-6 h-6 text-neo-pink"></i> Telegram-стек</h2>
                                    <h3 class="text-xl font-bold mb-3 mt-4">Эволюция библиотек</h3>
                                    <p class="mb-2">Изначально использовалась:</p>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>telegraf</li>
                                    </ul>
                                    <p class="mb-2">Проблемы:</p>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>слабая типизация</li>
                                        <li>ухудшение DX при усложнении логики</li>
                                    </ul>
                                    <p class="mb-2">В результате бот был переведён на:</p>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>grammy</li>
                                    </ul>
                                    <p class="mb-4">Причины:</p>
                                    <ul class="list-disc pl-6 space-y-1">
                                        <li>строгая типизация</li>
                                        <li>более прозрачный middleware</li>
                                        <li>лучше подходит для сложных сценариев</li>
                                    </ul>
                                </article>
                                
                                <article class="p-6 neo-border bg-white shadow-neo-sm">
                                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="bot" class="w-6 h-6 text-neo-blue"></i> Автоматические ответы и Dialogflow</h2>
                                    <p class="mb-4">На момент разработки нейросетей ещё не было, но хотелось «умных» ответов.</p>
                                    <p class="mb-4">Для этого был внедрён:</p>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>Google Dialogflow</li>
                                    </ul>
                                    <p class="mb-4">Использовался для:</p>
                                    <ul class="list-disc pl-6 space-y-1">
                                        <li>стандартного сценария приветствия</li>
                                        <li>ответов на типовые вопросы</li>
                                        <li>fallback, если команда не распознана</li>
                                    </ul>
                                </article>
                            </div>

                            <!-- Database and ORM -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="database" class="w-6 h-6 text-neo-green"></i> Работа с БД и ORM</h2>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">Prisma</h3>
                                <p class="mb-4">Проект использовался для изучения Prisma в сложной архитектуре:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>каждая библиотека имеет свою БД</li>
                                    <li>свои миграции</li>
                                    <li>деплой как отдельный npm-пакет</li>
                                </ul>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">Принципиальное решение</h3>
                                <p class="mb-4">В отличие от проекта Rucken:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>нет общих entity</li>
                                    <li>нет наследования между либами</li>
                                    <li>каждая либа автономна</li>
                                </ul>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">Миграции</h3>
                                <p class="mb-2">Использовался:</p>
                                <ul class="list-disc pl-6 mb-2 space-y-1">
                                    <li>Flyway</li>
                                </ul>
                                <p class="mb-4">Причины:</p>
                                <ul class="list-disc pl-6 space-y-1">
                                    <li>Prisma был новым инструментом</li>
                                    <li>хотелось полного контроля</li>
                                    <li>миграции писались вручную и идемпотентно</li>
                                </ul>
                            </article>

                            <!-- Localization -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <article class="p-6 neo-border bg-white shadow-neo-sm">
                                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="languages" class="w-6 h-6 text-neo-purple"></i> Локализация</h2>
                                    <p class="mb-4">Для работы с переводами использована консольная утилита из проекта Rucken:</p>
                                    <p class="mb-4 font-mono text-sm bg-gray-100 p-3"><a href="https://www.npmjs.com/package/rucken" target="_blank" class="text-neo-black font-bold underline">https://www.npmjs.com/package/rucken</a></p>
                                    <p class="mb-4">Что сделано в новой версии утилиты:</p>
                                    <ul class="list-disc pl-6 space-y-2">
                                        <li>полностью переписана на современные библиотеки</li>
                                        <li>адаптирована под Nx</li>
                                        <li>интегрирована в плагинную модель бота</li>
                                    </ul>
                                </article>
                                
                                <article class="p-6 neo-border bg-white shadow-neo-sm">
                                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="w-6 h-6 text-neo-yellow"></i> Schematics и автоматизация</h2>
                                    <p class="mb-4">Реализованы Nx schematics:</p>
                                    <ul class="list-disc pl-6 mb-4 space-y-2">
                                        <li>генерация нового бота</li>
                                        <li>генерация новых плагинов</li>
                                        <li>единый шаблон архитектуры</li>
                                    </ul>
                                    <p class="mb-4">Это значительно ускоряло разработку и эксперименты.</p>
                                </article>
                            </div>

                            <!-- DevOps and Deployment -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="server" class="w-6 h-6 text-neo-pink"></i> DevOps и деплой</h2>
                                <p class="mb-2">Локально:</p>
                                <ul class="list-disc pl-6 mb-2 space-y-1">
                                    <li>Docker Compose</li>
                                </ul>
                                <p class="mb-2">Продакшн:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-1">
                                    <li>Dokku</li>
                                </ul>
                                <p class="mb-4">Один и тот же подход использовался и для KaufmanBot, и для Rucken.</p>
                            </article>

                            <!-- Publications -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="book-open" class="w-6 h-6 text-neo-blue"></i> Публикации</h2>
                                <p class="mb-4">По проекту написан цикл статей:</p>
                                <p class="mb-4 font-mono text-sm bg-gray-100 p-3"><a href="https://dev.to/endykaufman/series/16805" target="_blank" class="text-neo-black font-bold underline">https://dev.to/endykaufman/series/16805</a></p>
                                <p class="mb-4">Темы:</p>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li>архитектура</li>
                                    <li>NestJS</li>
                                    <li>Nx</li>
                                    <li>деплой и окружение</li>
                                    <li>DevOps-практики</li>
                                </ul>
                            </article>

                            <!-- Practical Experience -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="lightbulb" class="w-6 h-6 text-neo-green"></i> Практический опыт и выводы</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Архитектура с мультипровайдингом была внедрена в 4 коммерческих проекта</li>
                                    <li>Подход рабочий, но:</li>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>плохо понимается Node.js-разработчиками</li>
                                        <li>неочевиден для команд</li>
                                        <li>усложняет поддержку</li>
                                    </ul>
                                </ul>
                                <p class="mb-4">В итоге:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>от мультипровайдинга я отказался</li>
                                    <li>проект остановился в развитии</li>
                                    <li>остался как reference и учебный материал</li>
                                </ul>
                            </article>

                            <!-- Additional Context -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="compass" class="w-6 h-6 text-neo-purple"></i> Дополнительный контекст и будущее</h2>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li>Бот жив и работает, обрабатывает команды и сценарии</li>
                                    <li>Возможны направления развития:</li>
                                    <ul class="list-disc pl-6 mb-2 space-y-1">
                                        <li>подключение нейросетей</li>
                                        <li>переписывание под другой стек</li>
                                        <li>новая архитектура без мультипровайдинга</li>
                                    </ul>
                                    <li>Проект остаётся примером инженерного подхода и DevOps-практик</li>
                                </ul>
                            </article>

                            <!-- Conclusion -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-yellow"></i> Итог</h2>
                                <p class="mb-4"><strong>KaufmanBot</strong> — это:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>архитектурный эксперимент</li>
                                    <li>демонстрация расширения DI NestJS</li>
                                    <li>плагинный Telegram-бот</li>
                                    <li>реальный DevOps-кейс</li>
                                    <li>пример эволюции инженерных решений</li>
                                </ul>
                                <p class="mb-4">Проект ценен не только реализацией, но и сделанными выводами.</p>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '3') {
    // Special content for NestJS-mod project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">NestJS-mod: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Моя fullstack-платформа для NestJS</p>
                        
                        <div class="space-y-6">
                            <!-- Introduction -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Моя fullstack-платформа для NestJS</h2>
                                <p class="mb-4"><strong>NestJS-mod</strong> — это мой инженерный проект и активная платформа для разработки backend- и fullstack-приложений на NestJS.</p>
                                <p class="mb-4">Это не эксперимент и не учебная библиотека, а живой инструмент, который я использую как в личных проектах, так и на работе. Проект решает проблему разрозненной архитектуры, хаотичных подходов в разных командах и высоких затрат на масштабирование приложений.</p>
                                <p class="mb-4">NestJS-mod подходит для продуктовых и B2B-команд, где важны единый подход, воспроизводимое качество и предсказуемость архитектурных решений.</p>
                            </article>

                            <!-- Project Goals -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="flag" class="w-6 h-6 text-neo-green"></i> Цели проекта</h2>
                                <p class="mb-4">Проект создан для решения следующих задач:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Зафиксировать архитектуру NestJS-приложений на уровне кода</li>
                                    <li>Упростить старт новых сервисов и fullstack-продуктов</li>
                                    <li>Снизить количество архитектурных ошибок при росте команды</li>
                                    <li>Стандартизировать конфигурацию, инфраструктуру и интеграции</li>
                                    <li>Предоставить готовые production-ready шаблоны</li>
                                </ul>
                            </article>

                            <!-- How the Project Was Born -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="lightbulb" class="w-6 h-6 text-neo-yellow"></i> Как появился проект</h2>
                                <p class="mb-4">Я всегда старался строить общие архитектурные решения на базе существующих возможностей фреймворков. Но столкнувшись с ограничениями DI в NestJS, я создал кастомную реализацию подключения провайдеров. Параллельно я работал в команде, где писали платформенные решения — обёртки над NestJS и Node.js библиотеками, решающие проблемы разношерстного кода в проектах и командах организации.</p>
                                <p class="mb-4">Там я увидел, какие задачи реально решают такие платформы:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>единый способ подключения env и конфигураций для модулей</li>
                                    <li>стандартизация архитектуры и снижение хаоса между проектами</li>
                                    <li>автоматическая генерация документации по структуре проекта через декораторы</li>
                                </ul>
                                <p class="mb-4">Имея многолетний опыт проектирования NestJS-приложений, я видел, что подобную платформу можно реализовать иначе — проще, гибче и ближе к реальной разработке. Так и родился <strong>NestJS-mod</strong>.</p>
                            </article>

                            <!-- Development Approach -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="w-6 h-6 text-neo-pink"></i> Подход к разработке</h2>
                                <h3 class="text-xl font-bold mb-3 mt-4">Скорость важнее идеального кода</h3>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>проект развивается быстро, код может выглядеть неидеально</li>
                                    <li>все ключевые логики покрыты тестами</li>
                                    <li>безопасный рефакторинг возможен в любой момент</li>
                                    <li>развитие идёт по мере появления реальной потребности</li>
                                </ul>
                                <p class="mb-4">Проект — практический инструмент, а не эталон «красивого» кода.</p>
                            </article>

                            <!-- Architectural Core -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="layers-3" class="w-6 h-6 text-neo-blue"></i> Архитектурное ядро</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Формализованная модель слоёв: Core, Feature, Integration, Infrastructure, System</li>
                                    <li>Чёткое разделение ответственности между модулями</li>
                                    <li>Архитектура фиксируется кодом, а не документацией</li>
                                    <li>Типобезопасная работа с конфигурацией и env-переменными</li>
                                    <li>Расширенный bootstrap приложений</li>
                                </ul>
                            </article>

                            <!-- Fullstack and Infrastructure -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="server" class="w-6 h-6 text-neo-green"></i> Fullstack и инфраструктура</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Включает шаблоны frontend-библиотек и проект админ-панели</li>
                                    <li>Возможность переиспользования частей фронтенда и backend</li>
                                    <li>CLI-схемы для генерации приложений и библиотек</li>
                                    <li>Поддержка Nx и монорепозиториев</li>
                                    <li>Интеграции с логированием, health-checks и markdown-отчётами</li>
                                    <li>Production-ready подход «из коробки»</li>
                                </ul>
                                <p class="mb-4">По сути, NestJS-mod — это полноценная fullstack-платформа, концептуально близкая к моему прежнему проекту Rucken, но с другим подходом к реализации.</p>
                            </article>

                            <!-- Migrations and Databases -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="database" class="w-6 h-6 text-neo-purple"></i> Миграции и базы данных</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Каждая feature-библиотека обязана иметь свои миграции</li>
                                    <li>Первая миграция всегда создаёт таблицу пользователей</li>
                                    <li>Фичи разрабатываются так, чтобы их можно было:</li>
                                    <ul class="list-disc pl-6 mb-2 ml-6 space-y-1">
                                        <li>задеплоить в отдельную базу</li>
                                        <li>или подключить к общей базе через один connection string</li>
                                    </ul>
                                    <li>Декомпозиция по доменам закладывается с самого начала</li>
                                </ul>
                                <p class="mb-4">Даже если в итоге используется одна база, проект изначально проектируется для масштабирования и изоляции фич.</p>
                            </article>

                            <!-- Ecosystem -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="package" class="w-6 h-6 text-neo-yellow"></i> Экосистема</h2>
                                
                                <h3 class="text-xl font-bold mb-3 mt-4">Core</h3>
                                <p class="mb-2"><strong>nestjs-mod</strong> — ядро и архитектурные утилиты</p>
                                
                                <h3 class="text-xl font-bold mb-3">Contrib</h3>
                                <p class="mb-2"><strong>nestjs-mod-contrib</strong> — дополнительные библиотеки, создаваемые по необходимости</p>
                                
                                <h3 class="text-xl font-bold mb-3">Шаблоны</h3>
                                <p class="mb-2"><strong>nestjs-mod-fullstack</strong> — production-ready fullstack boilerplate (NestJS + Angular)</p>
                                <p class="mb-2"><strong>nestjs-mod-sso</strong> — пример SSO и webhook-интеграций</p>
                                <p class="mb-4"><strong>nestjs-mod-example</strong> — демонстрационное приложение</p>
                            </article>

                            <!-- Practical Application -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="briefcase" class="w-6 h-6 text-neo-blue"></i> Практическое применение</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>все мои текущие проекты на NestJS строятся через NestJS-mod</li>
                                    <li>платформа используется на работе</li>
                                    <li>критические баги исправляются сразу</li>
                                    <li>служит эталоном архитектуры и обучающим материалом</li>
                                </ul>
                                <p class="mb-4">Проект постоянно проверяется реальной эксплуатацией, и я продолжаю его развивать.</p>
                            </article>

                            <!-- Development Plans -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="rocket" class="w-6 h-6 text-neo-pink"></i> Планы развития</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>скрипты и tooling для AI-агентов для лучшего понимания контекста проекта</li>
                                    <li>генерация приложений NestJS-mod через нейросети</li>
                                    <li>консольная утилита для работы с платформой</li>
                                    <li>генераторы frontend-кода</li>
                                </ul>
                                <p class="mb-4">NestJS-mod — это мой основной долгоживущий pet-проект.</p>
                            </article>

                            <!-- Conclusion -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-green"></i> Итог</h2>
                                <p class="mb-4"><strong>NestJS-mod</strong> — это не просто обёртка над NestJS и не учебная библиотека.</p>
                                <p class="mb-4">Это практическая, активно используемая платформа, отражающая мой подход к архитектуре:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>прагматично</li>
                                    <li>ориентировано на практику</li>
                                    <li>с фокусом на долгосрочную поддержку проектов</li>
                                    <li>с возможностью безопасного рефакторинга и масштабирования</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '4') {
    // Special content for ngx-dynamic-form-builder project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">ngx-dynamic-form-builder: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Моя библиотека для Angular</p>
                        
                        <div class="space-y-6">
                            <!-- Introduction -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Короткое описание</h2>
                                <p class="mb-4"><strong>ngx-dynamic-form-builder</strong> — это моя <strong>библиотека для Angular</strong>, созданная для динамического построения форм. Она позволяет генерировать структуры FormGroup на основе классов и метаданных, используя Angular FormBuilder вместе с class-transformer и class-validator. Поддерживаются мультиязычные сообщения об ошибках.</p>
                                <p class="mb-4">Библиотека обеспечивает типобезопасное создание динамических форм на основе классов с декораторами, поддержку валидаций и мультиязычных сообщений.</p>
                                <p class="mb-4">Ссылка на репозиторий: <a href="https://github.com/EndyKaufman/ngx-dynamic-form-builder" target="_blank" class="text-neo-blue underline">https://github.com/EndyKaufman/ngx-dynamic-form-builder</a></p>
                            </article>

                            <!-- Package Info -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="package" class="w-6 h-6 text-neo-green"></i> Пакет на npm</h2>
                                <p class="mb-4"><strong>ngx-dynamic-form-builder</strong>, версия 2.4.1 с поддержкой Angular 12–14.</p>
                            </article>

                            <!-- Creation History -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="history" class="w-6 h-6 text-neo-purple"></i> История создания и мотивация</h2>
                                <p class="mb-4">Когда Angular только появился и внедрили реактивные формы, я столкнулся с задачей: <strong>как использовать классы с декораторами валидации</strong>, которые я писал на NestJS в контроллерах, на фронтенде.</p>
                                
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Существующих решений я не нашёл.</li>
                                    <li>Тогда я решил написать <strong>обёртку</strong>, которая превращает валидаторы классов в валидаторы Angular Reactive Forms.</li>
                                    <li>В процессе библиотека многократно правилась по багам, которые присылало сообщество, и активно использовалась мной во всех проектах.</li>
                                </ul>
                                
                                <p class="mb-4">Главные преимущества моего подхода:</p>
                                
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Серверные DTO можно было <strong>шарить через npm-библиотеки на фронт</strong>.</li>
                                    <li>Валидации оставались <strong>типобезопасными</strong> и переиспользуемыми между бэком и фронтом.</li>
                                    <li>Работа с формами стала значительно проще, особенно когда бэк использовал те же классы DTO.</li>
                                </ul>
                            </article>

                            <!-- Key Features -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="star" class="w-6 h-6 text-neo-yellow"></i> Основные возможности библиотеки</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Генерация Angular Reactive Forms (FormGroup, FormControl, FormArray) из классов с декораторами</li>
                                    <li>Валидация с поддержкой class-validator-multi-lang, включая кастомные валидаторы</li>
                                    <li>Интеграция с class-transformer-global-storage для извлечения метаданных типов и построения форм</li>
                                    <li>Работа с массивами, вложенными объектами и типобезопасными моделями</li>
                                </ul>
                                
                                <p class="mb-4">Пример использования:</p>
                                <pre class="bg-gray-100 p-4 font-mono text-sm overflow-x-auto"><code>// Модель данных
@Exclude()
class Company {
  @Expose()
  id: number;

  @Validate(TextLengthMore15)
  @IsNotEmpty()
  @Expose()
  name: string;
}

// Создание формы
const fb = new DynamicFormBuilder();
this.form = fb.rootFormGroup(Company, { name: '' });</code></pre>
                            </article>

                            <!-- Testing -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="test-tube" class="w-6 h-6 text-neo-green"></i> Тестовая интеграция</h2>
                                <p class="mb-4">Я сделал демо-приложение и StackBlitz-пример, чтобы можно было протестировать генерацию форм прямо в браузере.</p>
                            </article>

                            <!-- Repository Statistics -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="bar-chart-3" class="w-6 h-6 text-neo-pink"></i> Статистика репозитория</h2>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Показатель</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Значение</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Stars</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">118</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Forks</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">29</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pull-requests</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~177 (28 открытых, 149 закрытых)</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Issues</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">открыто 2</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </article>

                            <!-- Development Stages -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="calendar" class="w-6 h-6 text-neo-purple"></i> Этапы разработки библиотеки</h2>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li><strong>2018</strong> — начальный функционал (v0.x)<br>
                                    Генератор форм без жёсткой привязки к Angular 9+, базовая поддержка class-transformer и валидаций.</li>
                                    <li><strong>2019–2021</strong> — развитие API<br>
                                    Улучшение поддержки валидаций и вложенных структур.</li>
                                    <li><strong>2022</strong> — крупное переписывание API (v2.0)<br>
                                    Полностью переписанный код, частичная обратная совместимость, строгий контроль @Expose/@Exclude.</li>
                                    <li><strong>2023</strong> — стабильная версия 2.4.1<br>
                                    Поддержка Angular 16 и Nx16, интеграция тестов, улучшения обработки ошибок.</li>
                                </ul>
                            </article>

                            <!-- Time Estimates -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-6 h-6 text-neo-blue"></i> Временные затраты</h2>
                                <div class="overflow-x-auto mb-4">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фаза разработки</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Примерная длительность</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Инициализация библиотеки</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~1–2 месяца</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">MVP динамических форм</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~3–4 месяца</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Интеграция class-transformer / class-validator</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~2–3 месяца</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Полный рефакторинг под Angular 13+</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~3–4 месяца</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Поддержка i18n и мультиязка</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~1–2 месяца</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Рефакторинг и тестирование</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">~2–3 месяца</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p class="mb-4">В сумме: <strong>около 12–18 месяцев активной разработки</strong>, включая major-рефакторинг и интеграцию типов/валидаций.</p>
                            </article>

                            <!-- Current Usage -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="globe" class="w-6 h-6 text-neo-green"></i> Текущее использование и контекст</h2>
                                <p class="mb-4">Сейчас я чаще использую <strong>Formly</strong>, где кастомизация форм и отображение ошибок DTO реализуется через возможности самой Formly.</p>
                                <p class="mb-4">Но библиотека остаётся актуальной, когда Formly <strong>не разрешено использовать</strong> работодателем.</p>
                                <p class="mb-4">Если бэк использует те же DTO, библиотека сильно упрощает работу с валидаторами и формами.</p>
                                
                                <p class="mb-4"><strong>Статус:</strong> пока на паузе. Я планировал обновить библиотеку под последние версии Angular, но с появлением <strong>сигнальных форм</strong> пока решил отложить.</p>
                            </article>

                            <!-- Application -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="settings" class="w-6 h-6 text-neo-yellow"></i> Применение библиотеки</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Проекты с динамическими объектами модели, где формы строятся на основе DTO-моделей</li>
                                    <li>Формы с сложной валидацией и многоязычными сообщениями об ошибках</li>
                                    <li>Админ-панели, CRUD-формы, требующие типобезопасности и масштабируемости</li>
                                    <li>Сценарии, где Formly использовать запрещено, но нужен типобезопасный фронт</li>
                                </ul>
                            </article>

                            <!-- Conclusion -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-pink"></i> Итог</h2>
                                <p class="mb-4"><strong>ngx-dynamic-form-builder</strong> — моя библиотека для Angular, обеспечивающая <strong>типобезопасное создание динамических форм на основе классов с декораторами</strong>, поддержку валидаций и мультиязычных сообщений.</p>
                                <p class="mb-4">Она выделяется своей модельно-ориентированной архитектурой и тесной интеграцией с серверными DTO, упрощая жизнь фронтенд-разработчику.</p>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '5') {
    // Special content for nest-permissions-seed project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">\`nest-permissions-seed\` — шаблон (бойлерплейт) проекта на NestJS</h1>
                        
                        <div class="space-y-6">
                            <!-- Context -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Контекст появления</h2>
                                <p class="mb-4">В общем, когда NestJS только появился, никто не знал, как на нём писать приложения, а информации в интернете было очень мало.</p>
                                
                                <p class="mb-4">У меня уже был опыт работы с разными технологиями:</p>
                                
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li><strong>Backend:</strong> .NET Core, Java Spring</li>
                                    <li><strong>Frontend:</strong> Angular</li>
                                    <li><strong>Домашние проекты:</strong> Django на Python</li>
                                </ul>
                                
                                <p class="mb-4">Я искал информацию в интернете и собрал <strong>шаблонный проект (бойлерплейт)</strong>, который начал использовать, чтобы показывать, <strong>как нужно писать на NestJS</strong>.</p>
                                
                                <p class="mb-4">Сейчас эти все практики не актуальны, мои подходы поменялись, но проект всё ещё полезен для новичков, так как демонстрирует <strong>основы NestJS без переусложнений</strong> — всё сделано в лоб.</p>
                            </article>

                            <!-- Purpose -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="flag" class="w-6 h-6 text-neo-green"></i> Назначение проекта</h2>
                                <p class="mb-4"><code>nest-permissions-seed</code> — это <strong>демо-шаблон / boilerplate</strong>:</p>
                                
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Показывает базовую архитектуру <strong>NestJS приложения</strong></li>
                                    <li>Демонстрирует <strong>permissions</strong> и роли пользователей (<code>admin</code>, <code>user</code>)</li>
                                    <li>Содержит <strong>JWT авторизацию и Guards</strong> для проверки прав</li>
                                    <li>Подключена база данных и миграции</li>
                                    <li>Swagger UI для тестирования API</li>
                                    <li>Seed-данные для быстрого старта</li>
                                </ul>
                                
                                <p class="mb-4">Цель: дать <strong>готовую стартовую точку</strong> для новичков и показать <strong>правильные подходы к структуре и организации кода</strong>.</p>
                            </article>

                            <!-- Structure -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="layout" class="w-6 h-6 text-neo-purple"></i> Структура бойлерплейта</h2>
                                <p class="mb-4">Проект минималистичный, типичный для NestJS, но упрощённый для обучения:</p>
                                
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li><strong>src/</strong> — исходный код приложения
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li><strong>modules/</strong> — модули (<code>permissions</code>, <code>auth</code>, <code>users</code>)</li>
                                            <li><strong>guards/</strong> — Guards для проверки ролей и разрешений</li>
                                            <li><strong>entities/</strong> — сущности базы данных (User, Role, Permission)</li>
                                            <li><strong>services/</strong> — бизнес-логика и работа с данными</li>
                                            <li><strong>controllers/</strong> — REST API контроллеры</li>
                                        </ul>
                                    </li>
                                    <li><strong>config/</strong> — настройки приложения и JWT</li>
                                    <li><strong>scripts/</strong> — миграции и инициализация базы</li>
                                    <li><strong>main.ts</strong> — точка входа приложения</li>
                                </ul>
                                
                                <p class="mb-4">Проект сделан <strong>наглядно и просто</strong>, без лишних абстракций.</p>
                            </article>

                            <!-- Technical Features -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="code" class="w-6 h-6 text-neo-yellow"></i> Технические особенности</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>TypeScript и стандартные возможности NestJS (модули, DI, Guards)</li>
                                    <li>JWT авторизация и проверка ролей через Guards</li>
                                    <li>Реляционная база данных (PostgreSQL/MySQL)</li>
                                    <li>Swagger UI локально и онлайн для тестирования API</li>
                                    <li>Seed-данные пользователей:
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li><code>admin@admin.com / 12345678</code> (admin)</li>
                                            <li><code>user1@user1.com / 12345678</code> (user)</li>
                                            <li><code>user2@user2.com / 12345678</code> (user)</li>
                                        </ul>
                                    </li>
                                </ul>
                            </article>

                            <!-- Usage Instructions -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="book-open" class="w-6 h-6 text-neo-pink"></i> Инструкция по использованию шаблона</h2>
                                <ol class="list-decimal pl-6 mb-4 space-y-2">
                                    <li>Клонировать репозиторий:<br>
                                        <code class="bg-gray-100 p-1">git clone --recursive https://github.com/EndyKaufman/nest-permissions-seed.git</code></li>
                                    <li>Установить Node.js ≥6 и NPM ≥3</li>
                                    <li><code>npm install</code> — установка зависимостей</li>
                                    <li>Скопировать <code>_env</code> в <code>.env</code> и настроить окружение</li>
                                    <li><code>npm run schema:sync</code> — создать таблицы базы данных</li>
                                    <li><code>npm run migrate:run</code> — выполнить миграции</li>
                                    <li><code>npm run start:prod</code> — запустить продакшн-сервер<br>
                                        (<code>npm run start:watch</code> — dev-сервер)</li>
                                    <li>Swagger: <a href="https://nest-permissions-seed.herokuapp.com/swagger" target="_blank" class="text-neo-blue underline">https://nest-permissions-seed.herokuapp.com/swagger</a></li>
                                </ol>
                            </article>

                            <!-- Time Estimates -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-6 h-6 text-neo-green"></i> Временные затраты на создание бойлерплейта</h2>
                                <div class="overflow-x-auto mb-4">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Этап</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Примерное время</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Инициация проекта и настройка NestJS</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2–4 часа</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Реализация модели Permissions + Guards</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4–8 часов</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">JWT авторизация и seed-данные</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3–6 часов</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Настройка Swagger и база данных</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2–5 часов</td>
                                            </tr>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Тестирование, документация, примеры</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2–4 часа</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <p class="mb-4"><strong>Итого:</strong> ~12–27 <strong>человекочасов</strong> для опытного разработчика.</p>
                            </article>

                            <!-- Relevance -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="w-6 h-6 text-neo-purple"></i> Актуальность</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Сейчас эти все практики не актуальны, мои подходы поменялись</li>
                                    <li>Проект ориентирован на <strong>новичков</strong> — демонстрирует основы NestJS без переусложнений</li>
                                    <li>Всё сделано максимально просто, как <strong>шаблон/бойлерплейт</strong>, чтобы наглядно показать структуру и подходы</li>
                                    <li>Отличная стартовая точка для изучения и дальнейшего расширения</li>
                                </ul>
                            </article>

                            <!-- Conclusion -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-yellow"></i> Итог</h2>
                                <p class="mb-4"><code>nest-permissions-seed</code> — это <strong>боилерплейт / шаблон проекта</strong>, созданный для обучения и быстрого старта на NestJS. Он показывает базовую архитектуру, работу с permissions, Guards и JWT, предоставляя готовый пример для дальнейшего использования.</p>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '6') {
    // Special content for typegraphql-prisma-nestjs project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">typegraphql-prisma-nestjs: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Мой форк оригинального генератора typegraphql-prisma</p>
                        
                        <div class="space-y-6">
                            <!-- Main Idea -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Основная идея</h2>
                                <p class="mb-4">Это <strong>мой форк оригинального генератора typegraphql-prisma</strong>, который я использую для <strong>быстрой генерации CRUD‑бэкенда на GraphQL</strong>.</p>
                                
                                <p class="mb-4">Оригинальный генератор перестал корректно работать с определённой версией <strong>NestJS</strong>: автор NestJS интегрировал части TypeGraphQL, что <strong>сломало обратную совместимость с декораторами</strong>. В итоге весь туллинг оригинального проекта перестал работать или работает частично.</p>
                                
                                <p class="mb-4">Моя версия форка решает эти проблемы:</p>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Поддержка NestJS интеграции на должном уровне.</li>
                                    <li>Корректные импорты и совместимость с последними версиями NestJS.</li>
                                    <li>Генератор CRUD Prisma для GraphQL остаётся доступным и полностью работоспособным.</li>
                                </ul>
                            </article>

                            <!-- What I Did -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="hammer" class="w-6 h-6 text-neo-green"></i> Что я сделал</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Форк с изменёнными <strong>импортами и адаптацией под NestJS</strong>.</li>
                                    <li>Добавил <strong>небольшие кастомизации по работе с CRUD</strong>, чтобы удобно использовать как в рабочих, так и домашних проектах.</li>
                                </ul>
                            </article>

                            <!-- Where It's Used -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="w-6 h-6 text-neo-yellow"></i> Где используется</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li><strong>На работе</strong>: активно применяю для ускоренной генерации CRUD API на NestJS + Prisma + GraphQL.</li>
                                    <li><strong>В домашних проектах</strong>: удобно для прототипирования и тестирования идей.</li>
                                </ul>
                                
                                <blockquote class="border-l-4 border-neo-pink pl-4 italic mb-4">
                                    <p>Важно: библиотека даёт полный доступ к базе, поэтому <strong>нужно внимательно контролировать, что шариcь наружу</strong>.</p>
                                </blockquote>
                            </article>

                            <!-- My Recommendations -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="lightbulb" class="w-6 h-6 text-neo-purple"></i> Мои рекомендации</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Генератор удобно использовать на этапе <strong>MVP проекта</strong>, чтобы быстро получить рабочие CRUD‑эндпоинты.</li>
                                    <li>Перед релизом: пройтись по всем эндпоинтам, <strong>ограничить вариации запросов и права доступа</strong>, чтобы обезопасить базу.</li>
                                    <li>Поддерживать форк актуальным относительно <strong>NestJS и Prisma</strong>, чтобы интеграция оставалась стабильной.</li>
                                </ul>
                            </article>

                            <!-- Differences from Original -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="git-compare" class="w-6 h-6 text-neo-blue"></i> Отличия моего форка от оригинала</h2>
                                
                                <div class="space-y-6">
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">1. Импорты для NestJS</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Оригинал использует: <code>import { Ctx, Query, Resolver } from "type-graphql"</code></li>
                                            <li>Мой форк: <code>import { Context, Query, Resolver } from "@nestjs/graphql"</code></li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">2. Поддержка модификации аргументов перед запросом к Prisma</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Добавлены функции <code>transformArgsIntoPrismaArgs</code> и <code>setTransformArgsIntoPrismaArgs</code>, позволяющие менять аргументы до отправки запроса к базе.</li>
                                            <li>PR в оригинальном проекте: 399</li>
                                            <li>Примеры форка и приложения доступны в репозиториях EndyKaufman.</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">3. Поддержка отметки части полей как опциональных</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Можно использовать: <code>@TypeGraphQL.optional(input: ["create", "update"])</code></li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">4. Поддержка вызова асинхронных событий после запроса к Prisma</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Позволяет выполнять дополнительную логику после обработки запроса, сохраняя результат.</li>
                                            <li>Пример использования: возможность вставлять коллбэки <code>afterProcessEvents</code> для обработки результата после запроса.</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">5. Опции для пропуска генерации методов и полей резолверов</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Настраиваются списки методов и свойств для генерации:</li>
                                            <li><code>emitActions</code> — методы CRUD и агрегирования (<code>findUnique, findMany, createOne…</code>)</li>
                                            <li><code>emitPropertyMethods</code> — методы работы с полями сущностей (<code>create, connectOrCreate, upsert…</code>)</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-xl font-bold mb-3">6. Интеграция с Dataloader для вложенных объектов</h3>
                                        <ul class="list-disc pl-6 mb-2 space-y-1">
                                            <li>Настройки:</li>
                                            <li><code>useDataloaderForResolveFields</code> — использовать Dataloader для сущностей</li>
                                            <li><code>useDataloaderForAllResolveFields</code> — использовать Dataloader для массивов сущностей</li>
                                            <li><code>useDataloaderMaxBatchSize</code> — ограничение на размер батча (<code>Infinity</code> по умолчанию)</li>
                                            <li><code>useDataloaderBatchScheduleFnDelay</code> — задержка для решения проблемы с nextTick</li>
                                            <li><code>useDataloaderCache</code> — включение/выключение кеширования ключей</li>
                                        </ul>
                                    </div>
                                </div>
                            </article>

                            <!-- Advantages -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="star" class="w-6 h-6 text-neo-green"></i> Преимущества</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Сильная интеграция с NestJS.</li>
                                    <li>Полностью работоспособный CRUD генератор Prisma для GraphQL.</li>
                                    <li>Возможность добавления собственных кастомизаций.</li>
                                    <li>Сокращает время разработки API и минимизирует рутинный код.</li>
                                    <li>Позволяет гибко управлять генерацией методов и аргументов, включая асинхронные события и Dataloader.</li>
                                </ul>
                            </article>

                            <!-- Important Note -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="alert-triangle" class="w-6 h-6 text-neo-red"></i> Важное замечание</h2>
                                <p class="mb-4">Это <strong>моя библиотека‑инструмент</strong>, а не полноценное приложение. Основная роль — <strong>автоматическая генерация типов и CRUD‑резолверов</strong>, без бизнес-логики. Использовать её безопасно можно на этапе прототипирования, а перед продакшеном следует провести ревью всех сгенерированных эндпоинтов.</p>
                            </article>
                        </div>
                    </div>
                `;
  } else if (id === '7') {
    // Special content for class-validator-multi-lang project
    projectDetailsContent.innerHTML = `
                    <div class="prose max-w-none">
                        <h1 class="text-4xl font-black uppercase mb-6 text-neo-pink">class‑validator‑multi‑lang: Презентация проекта</h1>
                        <p class="text-xl italic mb-8">Мой форк библиотеки для NestJS</p>
                        
                        <div class="space-y-6">
                            <!-- Essence -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="target" class="w-6 h-6 text-neo-blue"></i> Суть проекта</h2>
                                <p class="mb-4">Во всех моих проектах на <strong>NestJS</strong> я активно использую <strong>class‑validator</strong> для валидации DTO и моделей. Основная проблема: стандартная библиотека возвращает ошибки только на английском языке.</p>
                                
                                <p class="mb-4">Чтобы решить эту задачу, я создал <strong>форк class‑validator с поддержкой многоязычных сообщений об ошибках</strong>, с возможностью <strong>кастомизации и локализации ошибок на русский язык</strong>.</p>
                                
                                <p class="mb-4">Изначально я оформил изменения в виде <strong>pull request к оригинальной библиотеке</strong>, но несмотря на положительные отзывы сообщества, PR был <strong>отклонён</strong>. В итоге я опубликовал <strong>форк в npm</strong> как отдельный пакет, чтобы использовать его в своих проектах.</p>
                            </article>

                            <!-- Technical Implementation -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="hammer" class="w-6 h-6 text-neo-green"></i> Техническая реализация</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li><strong>Перевод сообщений</strong> реализован через <strong>PO-файлы</strong>.</li>
                                    <li>Подключён <strong>сервис Crowdin</strong> (<a href="https://crowdin.com/project/class-validator" target="_blank" class="text-neo-blue underline">https://crowdin.com/project/class-validator</a>), что позволяет <strong>любому пользователю предложить исправление или новый перевод</strong>.</li>
                                    <li>После пул-реквеста с переводом я <strong>апрувлю изменения и выпускаю новую версию библиотеки</strong>, если это необходимо.</li>
                                    <li>Поддержка библиотеки минимальна: я <strong>редко обновляю форк</strong>, так как оригинальная библиотека иногда вносит <strong>ломающие изменения</strong>, которые требуют дополнительного тестирования и адаптации.</li>
                                </ul>
                            </article>

                            <!-- Application -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="globe" class="w-6 h-6 text-neo-yellow"></i> Применение</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Используется <strong>во всех проектах NestJS</strong>, где требуется локализованная валидация.</li>
                                    <li>Библиотека обеспечивает <strong>удобство для конечного пользователя</strong>: ошибки валидации отображаются на понятном языке.</li>
                                    <li>Позволяет <strong>легко расширять и улучшать переводы</strong> через сообщество Crowdin.</li>
                                </ul>
                            </article>

                            <!-- Project Status -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="activity" class="w-6 h-6 text-neo-purple"></i> Состояние проекта</h2>
                                <ul class="list-disc pl-6 mb-4 space-y-2">
                                    <li>Проект <strong>живой</strong> и активно используется в продакшене.</li>
                                    <li>Обновления происходят <strong>по мере необходимости</strong> или при поступлении исправленных переводов.</li>
                                    <li>Форк полностью совместим с оригинальной библиотекой, но добавляет <strong>i18n функционал и кастомизацию сообщений</strong>.</li>
                                </ul>
                            </article>

                            <!-- Main Conclusion -->
                            <article class="p-6 neo-border bg-white shadow-neo-sm">
                                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i data-lucide="award" class="w-6 h-6 text-neo-pink"></i> Основной вывод</h2>
                                <p class="mb-4"><strong>class‑validator‑multi‑lang</strong> — это <strong>практическая библиотека‑форк</strong>, которая решает задачу локализованной валидации в NestJS и делает ошибки понятными для русскоязычных пользователей, оставаясь при этом удобной для разработчиков благодаря интеграции с Crowdin и PO-файлами.</p>
                            </article>
                        </div>
                    </div>
                `;
  } else {
    // Default content for other projects
    projectDetailsContent.innerHTML =
      '<div class="text-center py-10"><h2 class="text-4xl font-black uppercase mb-4 text-neo-pink">О ПРОЕКТЕ</h2></div>';
  }

  // Show modal and disable body scroll
  projectDetailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Re-render Lucide icons inside the details modal
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};
// Function to close the project details modal
window.closeProjectDetailsModal = function () {
  const projectDetailsModal = document.getElementById('projectDetailsModal');
  projectDetailsModal.classList.add('hidden');
  document.body.style.overflow = '';
};
