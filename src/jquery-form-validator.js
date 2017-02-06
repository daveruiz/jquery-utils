(function($) {

  var validators = {

    required: function(input) {
      if (input.type === 'checkbox' || input.type === 'radio') {
        return input.checked;
      }

      return !!input.value.toString().trim();
    },

    number: function(input) {
      var number = parseFloat(input.value);
      return !input.value.toString() || (typeof number === 'number' && !isNaN(number));
    },

    min: function(input, minValue) {
      return !input.value.toString() || parseFloat(input.value) >= parseFloat(minValue);
    },

    max: function(input, maxValue) {
      return !input.value.toString() || parseFloat(input.value) <= parseFloat(maxValue);
    },

    email: function(input) {
      return !input.value.toString() || input.value.toString().match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }

  };

  var Validator = function(form, options) {
    this.$form = $(form);
    this.errorClass = options.errorClass || 'has-error';
    this.errorWrapper = options.errorWrapper || '.form-group';
    if (!this.$form.filter('form').length) {
      throw new Error('The element must be a form type');
    }

    this.$form.on('submit', this.validateForm.bind(this));
  }

  Validator.prototype.validateForm = function(event) {
    var valid = true;

    this.findInputs().each(function(index, input) {
      var $input = $(input);
      var validatorKeys = Object.keys(validators);
      var fieldValid = true;

      for (var i=0; i<validatorKeys.length; i++) {
        var key = validatorKeys[i];
        var validator = validators[key];

        var keyWordCase = key.replace(/(^.|[^a-z0-9][a-z0-9])/i, function(v) {
          return v.replace(/[^a-z0-9]/i, '').toUpperCase();
        });
        var validatorValue = $input.data('validate' + keyWordCase);
        if (typeof validatorValue !== 'undefined') {
          fieldValid = fieldValid && validator(input, validatorValue);
        }
      }

      valid = valid && fieldValid;
      this.setInputStatus(input, fieldValid);
    }.bind(this));

    if (!valid) {
      event.preventDefault();
    }
  }

  Validator.prototype.setInputStatus = function(input, valid) {
    var $input = $(input);
    var $wrapper = this.errorWrapper && $input.closest(this.errorWrapper);
    if ($wrapper && $wrapper.length) {
      $wrapper[valid?'removeClass':'addClass'](this.errorClass);
    } else {
      $input[valid?'removeClass':'addClass'](this.errorClass);
    }
  }

  Validator.prototype.findInputs = function() {
    return this.$form.find('input,textarea,select');
  }

  // jQuery integration
  $.fn.validateForm = function(opt) {
    return this.each(function() {
      var $element = $(this);
      var toggler = $element.data('jqmv');
      if (!toggler) {
        var options = Object.assign({}, $element.data(), opt || {});
        toggler = new Validator(this, options);
        $element.data('jqmv', toggler);
      }
    });
  }

})(window.jQuery);
