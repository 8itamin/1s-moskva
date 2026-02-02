export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. Если путь неполный (например /ru или /ru/ru), редиректим на дефолт
  const defaultTarget = "/ru/ru/1s-moskva/";

  if (
    url.pathname === "/ru" ||   // Если путь просто /ru
    url.pathname === "/ru/ru" || // Если путь /ru/ru
    url.pathname === "/"         // Если это главная страница
  ) {
    return Response.redirect(new URL(defaultTarget, url.origin).toString(), 302);
  }

  // 2) Язык из заголовка "Accept-Language" браузера
  const acceptLang = request.headers.get("accept-language") || "";
  const lang = acceptLang.toLowerCase().startsWith("ru") ? "ru" : "ru"; // Просто фиксируем "ru"

  // 3) Страна из Cloudflare
  const country = (request as any).cf?.country || "RU"; // ISO-2 (если нет страны — используем RU)
  const countrySlug = country.toLowerCase(); // Пример: "ru"

  // 4) Город из Cloudflare (может быть null)
  const city = (request as any).cf?.city as string | undefined;

  // Маппинг города на slug
  const cityMap: Record<string, string> = {
    "Moscow": "1s-moskva", // если город Москва
    "Saint Petersburg": "1s-spb", // если город Санкт-Петербург
  };

  // Если город есть в маппе, выбираем его slug, иначе дефолтное значение
  const citySlug = city && cityMap[city] ? cityMap[city] : "1s-moskva";

  // Формируем итоговый путь
  const target = `/${lang}/${countrySlug}/${citySlug}/`;

  // 5) Если путь неполный (например, не указан город или страна), редиректим на дефолтную страницу
  if (!citySlug || countrySlug === "th") {
    return Response.redirect(new URL(defaultTarget, url.origin).toString(), 302);
  }

  // Если путь полный и корректный, направляем на нужную страницу
  return Response.redirect(new URL(target, url.origin).toString(), 302);
};
