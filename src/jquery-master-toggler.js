(function($) {

  var validToggleModes = ['toggleClass', 'addClass', 'removeClass']

  var validToggleEvents = ['click', 'hover', 'mouseover', 'mouseout', 'mousedown',
   'mouseup', 'visible', 'first-visible'];

  var reverseModes = {
    toggleClass: 'toggleClass',
    addClass: 'removeClass',
    removeClass: 'addClass',
  };

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
    this.options = Object.assign({}, Toggler.defaults, options || {});
    this.visible = false;

    checkRequired('class', this.options.class);
    checkValid('mode', validToggleModes, this.options.mode);
    checkValid('event', validToggleEvents, this.options.event);

    this.mode = this.options.mode;
    this.event = this.options.event;
    this.delay = parseInt(this.options.delay, 10) || 0;

    // Try first direct parent from current element
    this.$root = this.$element.closest(this.options.parent);

    // Then try a global search
    if (!this.$root.length) {
      this.$root = $(this.options.parent);
    }

    this.$target = this.$root.find(this.options.target || element);
    this.$others = this.options.others
      && this.$root.find(this.options.others).not(this.$target);
    this.class = this.options.class;
    this.altClass = this.options.altClass;

    this.init();
  }

  Toggler.prototype.init = function(action) {
    switch(this.event) {
      case 'visible':
        this.listenScroll(function(show, hide) {
          if (show) {
            this.handleClass(this.$target, 'addClass');
            if (this.$others) this.handleClass(this.$others, 'removeClass');
          }
          if (hide) {
            this.handleClass(this.$target, 'removeClass');
            if (this.$others) this.handleClass(this.$others, 'addClass');
          }
        }.bind(this));
        break;

      case 'first-visible':
        this.listenScroll(function(show, hide) {
          if (show) {
            this.handleClass(this.$target, this.mode);
            if (this.$others) this.handleClass(this.$others, reverseModes[this.mode]);
            this.unlistenScroll();
          }
        }.bind(this));
        break;

      case 'hover':
        this.$element
          .on({
            'mouseover.jqmt': function() {
                this.handleClass(this.$target, 'addClass');
                if (this.$others) this.handleClass(this.$others, 'removeClass');
              }.bind(this),
            'mouseout.jqmt': function() {
                this.handleClass(this.$target, 'removeClass');
                if (this.$others) this.handleClass(this.$others, 'addClass');
              }.bind(this)
          });
        break;

      default:
        this._handleEvent = function(event) {
          this.handleClass(this.$target, this.mode);
          if (this.$others) this.handleClass(this.$others, reverseModes[this.mode]);
        }.bind(this);
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
      $(window).off('scroll resize', this._scrollListener);
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

  Toggler.prototype.handleClass = function($target, mode) {
    var className = this.class;
    var altClassName = this.altClass;
    var delay = this.delay;

    $target.each(function(index, el) {
      var $target = $(el);
      var delay = $target.data('delay')
        ? parseInt($target.data('delay'), 10)
        : this.delay;

      setTimeout(function() {
        switch(mode) {
          case "toggleClass":
            $target.toggleClass(className);
            if (altClassName) {
              if ($target.hasClass(className)) {
                $target.removeClass(altClassName);
              } else {
                $target.addClass(altClassName);
              }
            }
            break;

          case "addClass":
            $target.addClass(className);
            if (altClassName) {
              $target.removeClass(altClassName);
            }
            break;

          case "removeClass":
            $target.removeClass(className);
            if (altClassName) {
              $target.addClass(altClassName);
            }
            break;
        }
      }.bind(this), delay);
    }.bind(this));
  }

  Toggler.defaults = {
    mode: 'toggleClass',
    event: 'click',
    parent: 'body',
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
