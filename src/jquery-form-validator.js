(function($) {

  var Validator = function(element, options) {

  }

  // jQuery integration
  $.fn.validateForm = function(opt) {
    return this.each(function() {
      var $element = $(this);
      var toggler = $element.data('jqmv');
      if (!toggler) {
        var options = Object.assign({}, $element.data(), opt || {});
        toggler = new Validator(this, options);
        $element.data('jqmt', toggler);
      }
    });
  }

})(window.jQuery);
