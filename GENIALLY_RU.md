# Публикация и вставка в Genially

1. Распакуйте Dracula_Monster_Check.zip. Загрузите содержимое в корень репозитория GitHub, сохранив папку assets. Сам ZIP публиковать вместо файлов не нужно.
2. В репозитории откройте Settings → Pages. Выберите Deploy from a branch → main → /(root) → Save.
3. Дождитесь HTTPS-адреса вида https://ВАШ-ЛОГИН.github.io/ИМЯ-РЕПОЗИТОРИЯ/. Проверьте игру по этому адресу.
4. В редакторе Genially откройте Insert → Others → Insert external content. Вставьте iframe из EMBED_GENIALLY.txt, подставив адрес опубликованной игры.
5. Выставьте объекту пропорции 16:9: например, 1280×720 или 960×540. Не обрезайте iframe. Все экраны масштабируются целиком без прокрутки.

В комплекте есть embed-preview.html для локальной проверки вставки. Изображения, CSS, анимации и сценарии находятся внутри проекта, внешние CDN не нужны. На телефоне удобнее горизонтальная ориентация: в вертикальной ориентации игра сохраняет композицию, но становится мельче.

Игра опубликована: https://natalifilonovets.github.io/halloween1/. Вставка в редактор Genially не выполнялась; работа во вложенном iframe проверена. Ограничения браузера на сохранение, буфер обмена и установленные голоса могут влиять на эти функции внутри стороннего iframe; в финале отображается золотой ключ.

Официальные инструкции: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [внешний iframe в Genially](https://help.genially.com/en_us/embed-a-google-sheets-chart-in-genially-Skq3qwr3j).
