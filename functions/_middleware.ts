export const onRequest: PagesFunction = async (context) => {
    const { request, next } = context;
    const url = new URL(request.url);
  
    // Редиректим только корень сайта
    if (url.pathname !== "/") return next();
  
    // 1) Язык из браузера (простая нормализация)
    const acceptLang = request.headers.get("accept-language") || "";
    const lang = acceptLang.toLowerCase().startsWith("ru") ? "ru" : "ru"; // пока фиксируем ru
  
    // 2) Страна из Cloudflare
    const country = (request as any).cf?.country || "RU"; // ISO-2
    const countrySlug = country.toLowerCase(); // "ru"
  
    // 3) Город (может быть null)
    const city = (request as any).cf?.city as string | undefined;
  
    // Маппинг города -> slug (пример)
    // Важно: city приходит на англ. (часто “Moscow”), лучше хранить англ. ключи
    const cityMap: Record<string, string> = {
      "Moscow": "1s-moskva",
      "Saint Petersburg": "1s-spb",
    };
  
    const citySlug = city && cityMap[city] ? cityMap[city] : "1s-moskva";
  
    const target = `/${lang}/${countrySlug}/${citySlug}/`;
  
    return Response.redirect(new URL(target, url.origin).toString(), 302);
  };
  