export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  // Редиректим только если это главная страница ("/")
  if (url.pathname !== "/") return next();

  // 1) Язык из заголовка "Accept-Language" браузера
  const acceptLang = request.headers.get("accept-language") || "";
  const lang = acceptLang.toLowerCase().startsWith("ru") ? "ru" : "ru"; // Здесь просто фиксируем "ru"

  // 2) Страна из Cloudflare
  const country = (request as any).cf?.country || "RU"; // ISO-2
  const countrySlug = country.toLowerCase(); // Пример: "ru"

  // 3) Город из Cloudflare (может быть null)
  const city = (request as any).cf?.city as string | undefined;

  // Маппинг города на slug
  const cityMap: Record<string, string> = {
    "Moscow": "1s-moskva", // если город Москва
    "Saint Petersburg": "1s-spb", // если город Санкт-Петербург
  };

  // Если город есть в мапе, выбираем его slug, иначе дефолтное значение
  const citySlug = city && cityMap[city] ? cityMap[city] : "1s-moskva";

  // Формируем итоговый путь
  const target = `/${lang}/${countrySlug}/${citySlug}/`;

  // Если это не страна/город из маппинга, то используем дефолтную страницу
  const defaultTarget = "/ru/ru/1s-moskva/";

  // Возвращаем редирект на нужную страницу
  return Response.redirect(new URL(target, url.origin).toString(), 302) || 
         Response.redirect(new URL(defaultTarget, url.origin).toString(), 302);
};
