// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $(function() {
    var AppView, Automation, HandleActions, Router, appRouter;
    Automation = {};
    HandleActions = (function() {

      function HandleActions() {
        this.callController = __bind(this.callController, this);
        this.loadingId = "img.loading";
        this.input = "#speech-input";
        this.clear = "#speech-input-clear";
        this.speachUrl = {
          "base": "../audio/",
          "fileType": "mp3"
        };
        this.controllerUrl = "http://10.227.48.114/iPHC2.1/IPHC-process.php?q=";
        this.options = {
          "lamp": {
            "on": "A1+off",
            "off": "A1+on",
            "dim": "A1+dim",
            "bright": "A1+bright"
          },
          "light": {
            "on": "A4+off",
            "off": "A4+on",
            "dim": "A4+dim",
            "bright": "A4+bright"
          },
          "fan": {
            "on": "A2+off",
            "off": "A2+on"
          },
          "mood": {
            "on": "A3+off",
            "off": "A3+on"
          },
          "study": {
            "on": "B1+off",
            "off": "B1+on"
          },
          "reading": {
            "on": "B2+off",
            "off": "B2+on"
          },
          "party": {
            "on": "B3+off",
            "off": "B3+on"
          },
          "lights": {
            "on": "B4+on",
            "off": "B5+off"
          }
        };
        $(this.loadingId).hide();
        this.setupButtons();
      }

      HandleActions.prototype.isTouchDevice = function() {
        return !!(__indexOf.call(window, 'ontouchstart') >= 0);
      };

      HandleActions.prototype.callController = function(device, action) {
        var buttonEl, file, speakingCallback, url,
          _this = this;
        device = device.toLowerCase();
        action = action.toLowerCase();
        speakingCallback = function(data) {
          console.log("speaking callback");
          $(_this.input).val('');
          $(_this.clear).hide();
          return $(_this.loadingId).hide();
        };
        setTimeout(speakingCallback, 3000);
        url = this.controllerUrl + this.options[device][action];
        $.get(url, speakingCallback);
        file = this.speachUrl.base + device + "-" + action + "." + this.speachUrl.fileType;
        $("#audio-control").attr('src', file);
        buttonEl = $("#" + device);
        if (buttonEl.hasClass("on")) {
          return buttonEl.removeClass("on");
        } else {
          return buttonEl.addClass("on");
        }
      };

      HandleActions.prototype.setupButtons = function() {
        var buttonClicked, event,
          _this = this;
        buttonClicked = function(event) {
          var action, device, el;
          el = $(event.target);
          device = event.target.id;
          if (el.hasClass("on")) {
            action = "off";
          } else {
            action = "on";
          }
          return _this.callController(device, action);
        };
        event = this.isTouchDevice ? "tap" : "click";
        return $("ul", "#shortcuts").on(event, buttonClicked);
      };

      HandleActions.prototype.processCommand = function(phrase) {
        var action, device, phraseArry, processWords, speak,
          _this = this;
        if (!(phrase != null)) {
          return;
        }
        device = null;
        action = null;
        phraseArry = phrase.split(" ");
        speak = function(_device, _action) {
          _this.callController(_device, _action);
          return $(_this.loadingId).show();
        };
        processWords = function(words) {
          var word, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = words.length; _i < _len; _i++) {
            word = words[_i];
            word = word.toLowerCase();
            if (device != null) {
              if (_this.options[device][word] != null) {
                action = word;
                console.log("action: " + action);
                speak(device, action);
                break;
              } else {
                _results.push(void 0);
              }
            } else if (_this.options[word] != null) {
              device = word;
              console.log("device: " + device);
              processWords(words);
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        return processWords(phraseArry);
      };

      return HandleActions;

    })();
    AppView = (function(_super) {
      var clear_tag, el_tag, input_tag;

      __extends(AppView, _super);

      function AppView() {
        this.initialize = __bind(this.initialize, this);
        return AppView.__super__.constructor.apply(this, arguments);
      }

      el_tag = "#home-wrapper";

      input_tag = "#speech-input";

      clear_tag = "#speech-input-clear";

      AppView.prototype.el = $(el_tag);

      AppView.prototype.events = {
        "keypress #speech-input": "createOnEnter",
        "input #speech-input": "inputChanged",
        "mousedown #speech-input-clear": "clearCompleted"
      };

      AppView.prototype.initialize = function() {
        console.log("init app view");
        this.input = this.$(input_tag);
        this.clearBtn = this.$(clear_tag);
        return this.clearBtn.hide();
      };

      AppView.prototype.inputChanged = function(e) {
        var val;
        val = this.input.val();
        if (val.length > 0) {
          Automation.actions.processCommand(val);
          return this.clearBtn.show();
        } else {
          return this.clearBtn.hide();
        }
      };

      AppView.prototype.createOnEnter = function(e) {
        var val;
        if (e.keyCode !== 13) {
          return;
        }
        val = this.input.val();
        Automation.actions.processCommand(val);
        if (e) {
          return e.preventDefault();
        }
      };

      AppView.prototype.clearCompleted = function(e) {
        this.input.val("");
        this.clearBtn.hide();
        if (e) {
          return e.preventDefault();
        }
      };

      return AppView;

    })(Backbone.View);
    Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        return Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        "": "defaultRoute"
      };

      Router.prototype.initialize = function() {
        return console.log("init router");
      };

      Router.prototype.defaultRoute = function() {
        console.log("default route");
        Automation.actions = new HandleActions();
        return Automation.app = new AppView();
      };

      return Router;

    })(Backbone.Router);
    appRouter = new Router();
    return Backbone.history.start();
  });

}).call(this);
