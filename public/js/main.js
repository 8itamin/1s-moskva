$('input[name=tel]').inputmask('+49(999)999-99-99');


// SLIDER
$(".rev__slider").slick({
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  dots: false,
  prevArrow:
    '<button type="button" class="slick-prev"><img src="img/left.svg" class="svg"></button>',
  nextArrow:
    '<button type="button" class="slick-next"><img src="img/right.svg" class="svg"></button>',
  
});
$(".rewards").slick({
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: true
});
$(".header__slider").slick({
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: true,
});

$(".review__slider").slick({
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: true,
});

$(document).ready(function() {
    $('.work__select').select2({
    	minimumResultsForSearch: -1
    });
});

$(document).ready(function () {
 
    var show = true;
    var countbox = ".work__about";
    $(window).on("scroll load resize", function () {
        if (!show) return false; // Отменяем показ анимации, если она уже была выполнена
        var w_top = $(window).scrollTop(); // Количество пикселей на которое была прокручена страница
        var e_top = $(countbox).offset().top; // Расстояние от блока со счетчиками до верха всего документа
        var w_height = $(window).height(); // Высота окна браузера
        var d_height = $(document).height(); // Высота всего документа
        var e_height = $(countbox).outerHeight(); // Полная высота блока со счетчиками
        if (w_top + 900 >= e_top || w_height + w_top == d_height || e_height + e_top < w_height) {
            $('.work__span').spincrement({
                thousandSeparator: "",
                duration: 2500
            });
             
            show = false;
        }
    });
 
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("[data-city-modal]");
  const openButtons = document.querySelectorAll("[data-city-modal-open]");
  if (!modal || openButtons.length === 0) return;

  const closeButtons = modal.querySelectorAll("[data-city-modal-close]");

  const openModal = () => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
});
