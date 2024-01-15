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
