(function($) {

  var validToggleModes = ['toggleClass', 'addClass', 'removeClass']
  var validToggleEvents = ['click', 'hover', 'mouseover', 'mouseout', 'mousedown', 'mouseup', 'visible'];

  function checkValid(option, list, value, required) {
    if (!value) {
        if (required) {
          checkRequired(option);
        } else {
          // Nothing to check
          return;
        }
    }

    if (list.indexOf(value) === -1) {
      throw new Error(
        'Invalid value %s for option %s. Available values are %s'
          .replace('%s', value)
          .replace('%s', option)
          .replace('%s', list.join(', '))
      );
    }
  }

  function checkRequired(option, value) {
    if (!value) {
      throw new Error('The option %s is required!'.replace('%s', option));
    }
  }

  function Toggler(element, options) {
    this.$element = $(element);
    this.options = Object.assign({}, options || {});
    this.visible = false;

    checkRequired('class', this.options.class);
    checkValid('mode', validToggleModes, this.options.mode);
    checkValid('event', validToggleEvents, this.options.event);

    this.mode = this.options.mode || 'toggleClass';
    this.event = this.options.event || 'click';
    this.delay = parseInt(this.options.delay, 10) || 0;

    this.$target = $(this.options.target || element);
    this.class = this.options.class;
    this.altClass = this.options.altClass;

    this.init();
  }

  Toggler.prototype.init = function(action) {
    switch(this.event) {
      case 'visible':
        this.listenScroll(function(show, hide) {
          if (show) this.handleClass('addClass');
          if (hide) this.handleClass('removeClass');
        }.bind(this));
        break;

      case 'hover':
        this.$element
          .on({
            'mouseover.jqmt': function() {
                this.handleClass('addClass');
              }.bind(this),
            'mouseout.jqmt': function() {
                this.handleClass('removeClass');
              }.bind(this)
          });
        break;

      default:
        this._handleEvent = function(event) { this.handleClass(); }.bind(this);
        this.$element.on(this.event + '.jqmt', this._handleEvent);
        break;
    }
  }

  Toggler.prototype.listenScroll = function(fn) {
    this.unlistenScroll();

    this._scrollListener = function(event) {
      var visible = this.isVisible();
      if (this.visible !== visible) {
        fn(visible, !visible);
      }
      this.visible = visible;
    }.bind(this);

    $(window)
      .on('scroll resize', this._scrollListener)
      .trigger('resize');
  }

  Toggler.prototype.unlistenScroll = function() {
    if (this._scrollListener) {
      this._scrollListener = null;
    }
  }

  Toggler.prototype.isVisible = function() {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = this.$element.offset().top;
    var elemBottom = elemTop + this.$element.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }

  Toggler.prototype.handleClass = function(customMode) {
    this.$target.each(function() {
      var $target = $(this);
      var delay = $target.data('delay')
        ? parseInt($target.data('delay'), 10)
        : this.delay;

      setTimeout(function() {
        switch(customMode || this.mode) {
          case "toggleClass":
            this.$target.toggleClass(this.class);
            if (this.altClass) {
              if (this.$target.hasClass(this.class)) {
                this.$target.removeClass(this.altClass);
              } else {
                this.$target.addClass(this.altClass);
              }
            }
            break;

          case "addClass":
            this.$target.addClass(this.class);
            if (this.altClass) {
              this.$target.removeClass(this.altClass);
            }
            break;

          case "removeClass":
            this.$target.removeClass(this.class);
            if (this.altClass) {
              this.$target.addClass(this.altClass);
            }
            break;
        }
      }.bind(this), delay);
    }.bind(this));
  }

  // jQuery integration
  $.fn.masterToggler = function(opt) {
    return this.each(function() {
      var $element = $(this);
      var toggler = $element.data('jqmt');
      if (!toggler) {
        var options = Object.assign({}, $element.data(), opt || {});
        toggler = new Toggler(this, options);
        $element.data('jqmt', toggler);
      }
    });
  }

})(window.jQuery);
