import jq from "jquery";
import Inputmask from "inputmask";

// стили slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export async function initMain() {
  // 1️⃣ jQuery → глобально
  const $ = jq;
  window.$ = window.jQuery = $;

  // 2️⃣ jQuery-плагины — ТОЛЬКО после этого
  await import("slick-carousel");
  await import("select2/dist/js/select2.full.js"); // 🔥 ВАЖНО
  await import("../vendor/jquery.spincrement.min.js");

  // (опционально) css select2
  await import("select2/dist/css/select2.css");

  // ====== дальше твой код ======

  // маска телефона
  $('input[name=tel]').each(function () {
    Inputmask("+7(999)999-99-99").mask(this);
  });

  // slick helper
  const ensureSlick = ($el, opts) => {
    if ($el.length && !$el.hasClass("slick-initialized")) $el.slick(opts);
  };

  ensureSlick($(".header__slider"), {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  });

  // select2
  if ($(".work__select").length && $.fn.select2) {
    $(".work__select").select2({ minimumResultsForSearch: -1 });
  }

  // spincrement
  let show = true;
  const countbox = $(".work__about");

  const runSpincrementIfNeeded = () => {
    if (!show || !countbox.length) return;

    if ($(window).scrollTop() + 900 >= countbox.offset().top) {
      $(".work__span").spincrement({
        thousandSeparator: "",
        duration: 2500,
      });
      show = false;
    }
  };

  $(window).on("scroll load resize", runSpincrementIfNeeded);
  runSpincrementIfNeeded();
}
