# MAXIMUS.BOATS
Статус: FINAL SOURCE PACKAGE · Версия: 2.0.0 · Дата: 26 сентября 2026 года

Отдельный проект лендинга для GitHub и Vercel. Исходники, компоненты, контент, стили, браузерная логика и серверный обработчик разделены. Удалены декоративные звёздочки. Использованы только изображения и видео из предоставленных sources. Коммерческие контакты и ссылка на инвестиционный клуб сохранены.

## Запуск
Требуется Node.js 22 и npm. Внешние npm-зависимости не требуются.
```sh
npm ci
npm run check:all
npm run dev
```
Адреса: `http://localhost:3000/ru/` и `http://localhost:3000/en/`.
После изменения исходников повторите `npm run build` или перезапустите `npm run dev`. Автоматический hot reload не включён.

## Структура
```text
src/components/        Отдельные HTML-компоненты и функции рендеринга
src/content/           Контакты, данные моделей и реестр медиа
src/styles/            Стили по разделам и финальная дизайн-система v2
src/client/modules/    Навигация, вкладки, диалоги, форма
shared/                Общая валидация и форматирование запроса
server/                Конфигурация и обработка запроса
server/services/       Адаптеры Turnstile и Resend
api/contact.js         Входная точка Vercel Function
public/media/          13 исходных изображений и одно видео
scripts/               Сборка, сервер, проверки, экспорт превью
tests/                 Автоматические тесты без отправки писем
docs/                  Архитектура, источники, QA и риск-лог
.github/workflows/     Проверки при push/PR
vercel.json            Настройки сборки и функции
.env.example           Поля конфигурации без реальных ключей
```
Стек: предрендеренный HTML, CSS, JavaScript ES modules, Node.js. Это не React/Next.js проект. Компоненты собираются в реальные документы, а не в одностраничный клиентский роутер.

## Редактирование
Контакты: `src/content/site.js`. Данные четырёх моделей: `src/content/projects.json`. Общие блоки: `src/components/*.html`. Переводы текстовых элементов хранятся в атрибутах data-en/data-ru и разрешаются при сборке. Внешний вид: `src/styles/direction-v2.css`; порядок подключения — `src/styles/order.json`.

## Публикация на Vercel
Загрузите содержимое этой папки в корень репозитория, сохранив скрытые файлы `.github`, `.gitignore`, `.env.example`, `.nvmrc`. Рекомендуется первоначально закрытый репозиторий.
Framework preset: Other. Node.js: 22.x. Build: `npm run build`. Output directory: `dist`. Install: `npm ci --ignore-scripts`. Настройки записаны в `vercel.json`.
Не загружайте один файл превью вместо проекта. Не переносите `api/contact.js` в `dist`. Не добавляйте SPA-rewrite всех URL на index.html: страницы имеют собственные маршруты.
Репозиторий GitHub: NOT PROVIDED. Проект Vercel: NOT PROVIDED. Публичный домен: NOT PROVIDED. Удалённая публикация в рамках подготовки пакета не выполнялась.

## Форма
По умолчанию `CONTACT_MODE=mailto`: письмо открывается в почтовом приложении посетителя, отправку выполняет посетитель. Есть копирование подготовленного текста. Приложение не сохраняет запросы в базу данных.
Опциональная серверная отправка реализована через Resend и Cloudflare Turnstile. Для неё необходимы заполненные переменные из `.env.example`, проверенный отправитель и разрешённые origins. Ключи и аккаунты не создавались. Успех API означает принятие почтовым провайдером, а не гарантированную доставку во входящие. Перед включением публичной серверной формы настройте инфраструктурное ограничение частоты запросов.

## Индексация
Индексация выключена по умолчанию. После утверждения домена и содержания задайте `SITE_URL` и `PUBLIC_INDEXABLE=true`. Noindex не является защитой доступа к конфиденциальному превью.

## Превью и проверки
```sh
npm run build
npm run export:preview
```
Создаётся `artifacts/MAXIMUS_BOATS_PREVIEW.html` — автономное превью со встроенными медиа, двумя языками и переходами между страницами моделей. Это просмотрная копия, не замена исходников.
`npm run check:all`: проверка синтаксиса, 61 тест, SHA-256 медиа и сборка 12 локализованных страниц, корневой страницы и 404.
Опционально: `python scripts/browser-qa.py --chromium /usr/bin/chromium`. Для этой проверки нужны Python, Playwright и Chromium; они не являются зависимостями сайта.

## Источники и IP
Привязка каждого изображения к исходному PDF, странице и контрольным суммам — `docs/asset-manifest.json`. Исходные PDF и регистрационные сертификаты в публичную папку не включены. Происхождение файла не заменяет подтверждение прав на публикацию.
MIPA обозначена для IP-обращений. Запись в реестр MIPA не выполнялась; номер записи: NOT PROVIDED. DIFC-чек-лист и риск-лог — `docs/RELEASE_CHECKLIST.md`.

## Автономное интерактивное превью
After building, run `npm run export:preview`. This creates `artifacts/MAXIMUS_BOATS_PREVIEW.html`, containing the built EN/RU pages, images, video and browser interactions in one file. This viewing artifact is not the production repository or API deployment. Use the regular source and `vercel.json` for GitHub/Vercel.
