<h1>Gemini Nano</h1>
<p>Gemini Nano доступна в Chrome Canary, который можно скачать по <a href="https://www.google.com/chrome/canary/">ссылке</a>.</p>

<h2>Как включить Gemini Nano в Chrome:</h2>
<ol>
    <li>Установите <a href="https://www.google.com/chrome/canary/">Chrome Canary</a>.</li>
    <li>Включите Prompt API for Gemini Nano: Введите chrome://flags/#prompt-api-for-gemini-nano в адресную строку и установите значение «Enabled».</li>
    <li>Включите Optimization Guide on Device Model: Введите chrome://flags/#optimization-guide-on-device-model в адресную строку и установите значение «Enabled BypassPerfRequirement».</li>
    <li>Перезапустите Chrome.</li>
    <li>Перейдите в chrome://components и проверьте наличие обновления для «Optimization Guide On Device Model» (версия должна быть 2024.6.5.2205 или выше).</li>
    <li>Проверьте настройку: откройте веб-страницу, нажмите клавишу F12 и проверьте в консоли.window.ai</li>
</ol>

<h2>Тестовый код:</h2>
<pre><code>
const model = await window.ai.createTextSession();
await model.prompt("Who are you?");
</code></pre>

<p>После этого установите расширение.</p>

<h1>Gemini-Nano-Chat</h1>
<p>"Gemini Nano Chat" - расширение для  Chrome, которое сделает вашу работу с Gemini Nano проще и удобнее!</p>

<h2>Вот пошаговая инструкция, как упаковать и установить это расширение для браузера Chrome:</h2>

<h3>Упаковка расширения:</h3>
<ol>
    <li>Откройте страницу управления расширениями, перейдя по этому URL: chrome://extensions.</li>
    <li>Если рядом с режимом разработчика есть “+”, нажмите на него.</li>
    <li>Нажмите кнопку “Упаковать расширение” (Pack extension).</li>
    <li>В появившемся диалоговом окне в поле “Корневой каталог расширения” (Extension root directory) укажите путь к папке расширения, например, c:\myext1.</li>
    <li>Нажмите "ОК".</li>
    <li>После этого вы получите файл .crx, который является упакованным расширением.</li>
</ol>

<h3>Установка расширения:</h3>
<ol>
    <li>Перейдите на страницу расширений Chrome, введя chrome://extensions/ в адресной строке.</li>
    <li>Включите “Режим разработчика” в верхнем правом углу страницы.</li>
    <li>Перетащите файл .crx расширения на страницу расширений.</li>
    <li>В появившемся диалоговом окне нажмите “Добавить расширение” (Add extension).</li>
    <li>Теперь расширение установлено и готово к использованию.</li>
</ol>

<p>или установите распакованное решение.</p>
<p>Скриншот</p>
<img src="https://goroshcko.ru/wp-content/uploads/2024/06/snimok-jekrana-2024-06-26-113407.png"><br>
<h3>Автор расширения: Горошко Андрей</h3>
<p>Разработано <a href="https://goroshcko.ru/" target="_blank">Goroshcko.ru</a></p>
