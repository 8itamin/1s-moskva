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

  const bindCityModal = () => {
    const triggers = document.querySelectorAll("[data-city-modal-open]");
    if (!triggers.length) return;

    const openModal = (modal) => {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    };

    const closeModal = (modal) => {
      modal.hidden = true;
      document.body.style.overflow = "";
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const container = trigger.closest(".nav__contacts") ?? document;
        const modal =
          container.querySelector("[data-city-modal]") ??
          document.querySelector("[data-city-modal]");
        if (modal) openModal(modal);
      });
    });

    document.querySelectorAll("[data-city-modal]").forEach((modal) => {
      modal
        .querySelectorAll("[data-city-modal-close]")
        .forEach((button) => {
          button.addEventListener("click", () => closeModal(modal));
        });

      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document.querySelectorAll("[data-city-modal]").forEach((modal) => {
        if (!modal.hidden) closeModal(modal);
      });
    });
  };

  bindCityModal();
}
