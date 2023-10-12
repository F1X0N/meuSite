(function ($) {

  "use strict";

  // COLOR MODE
  $('#color-mode-checkbox').change(function () {
    if ($(this).is(':checked')) {
      $('.color-mode-icon').addClass('active');
      $('body').addClass('dark-mode');
    } else {
      $('.color-mode-icon').removeClass('active');
      $('body').removeClass('dark-mode');
    }
  });

function isHorarioNoIntervalo() {
  const agora = new Date();
  const hora = agora.getHours();

  return hora >= 18 || hora < 6;
}

const horarioCheckbox = document.getElementById("color-mode-checkbox");

horarioCheckbox.checked = isHorarioNoIntervalo();
  

  // HEADER
  $(".navbar").headroom();

  // PROJECT CAROUSEL
  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    margin: 10,
    nav: true
  });

  // SMOOTHSCROLL
  $(function () {
    $('.nav-link, .custom-btn-link').on('click', function (event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - 49
      }, 1000);
      event.preventDefault();
    });
  });

  // TOOLTIP
  $('.social-links a').tooltip();

})(jQuery);
