(function(){
  "use strict";

  var Timer = (function(){
    function Timer(msec){
      this._countMsec = msec;
      this._elapsedOffset = 0;
      this.onTick = [];
      this.onStop = [];
      this.onComplete = [];
      this._stopNext = false;
    }

    Timer.prototype.tick = function(){
      var self = this;
      var now = Date.now();
      var diff = now - this._startTime;
      var currentMsec = this._countMsec - diff - this._elapsedOffset;

      if(currentMsec < 0){
        currentMsec = 0;
        this.onTick.forEach(function(x){x(currentMsec);});
        this.onStop.forEach(function(x){x(currentMsec);});
        this.onComplete.forEach(function(x){x();});
        clearInterval(this._intervalId);
        return;
      }

      if(this._stopNext){
        clearInterval(this._intervalId);
        this._elapsedOffset += diff;
        this.onTick.forEach(function(x){x(currentMsec);});
        this.onStop.forEach(function(x){x(currentMsec);});
        this._stopNext = false;
        return;
      }

      this.onTick.forEach(function(x){x(currentMsec);});
    };

    Timer.prototype.start = function(){
      var self = this;
      this._startTime = Date.now();
      this.tick();
      this._intervalId = setInterval(function(){self.tick();}, 25);
    };

    Timer.prototype.stop = function(){
      this._stopNext = true;
    };

    return Timer;
  })();
//== end Timer decl.

  var TimerController = (function(){
    function TimerController(config){
      this._config = config;
      this._origTimeColor = $("#time").css("color");
    }

    TimerController.prototype.start = function(){
      var self = this;

      var lastTickSec;
      this._timer.onTick.push(function(msec){
        var min = Math.floor(msec/1000/60);
        var sec = Math.floor(msec/1000%60);

        if(min === 0 && lastTickSec !== undefined &&
            lastTickSec <= self._config.countdownBlink.sec && lastTickSec > sec){
          self._highlightSec();
        }
        self.updateDisplay(msec);
        lastTickSec = sec;
      });

      this._timer.onStop.push(function(msec){
        self._timer = null;
        self.applyTimeMsec(msec);
        $("#start-btn").css("display", "inline-block");
        $("#stop-btn").css("display", "none");
        $("#time-config").css("display", "block");
      });

      this._timer.onComplete.push(function(){
        self._highlightTime();
      });

      this._timer.start();

      $("#start-btn").css("display", "none");
      $("#stop-btn").css("display", "inline-block");
      $("#time-config").css("display", "none");
    };

    TimerController.prototype.stop = function(){
      this._timer.stop();
    };


    TimerController.prototype.updateDisplay = function(msec){
      var min = Math.floor(msec/1000/60);
      var sec = Math.floor(msec/1000%60);
      var ms = Math.floor(msec%1000/10);

      if(this._prevUpdateDisp === undefined || this._prevUpdateDisp.min !== min){
          $("#time-min").text(("0"+min).slice(-2));
      }

      if(this._prevUpdateDisp === undefined || this._prevUpdateDisp.sec !== sec){
          $("#time-sec").text(("0"+sec).slice(-2));
      }

      $("#time-ms").text(("0"+ms).slice(-2));
      this._prevUpdateDisp = {min: min, sec: sec, ms: ms};
    };

    TimerController.prototype.applyTime = function(min, sec, ms){
      var msec = min*60*1000 + sec*1000 + ms;
      this.applyTimeMsec(msec);
    };

    TimerController.prototype.applyTimeMsec = function(msec){
      if(msec > 0){
        $("#start-btn").removeAttr("disabled");
        this._timer = new Timer(msec);
        this.updateDisplay(msec);
      } else {
        $("#start-btn").attr("disabled","");
        this.updateDisplay(msec);
        this._timer = null;
      }
    };

    TimerController.prototype.applyCustomTimeInput = function(){
      var min = parseInt($("#min-input").val(), 10) || 0;
      var sec = parseInt($("#sec-input").val(), 10) || 0;
      min = min < 0 ? 0 : min;
      sec = sec < 0 ? 0 : sec;
      this.applyTime(min, sec, 0);
    };

    TimerController.prototype._highlightSec = function(){
      var ts = $("#time-sec");
      ts
        .animate({color: this._config.countdownBlink.color},150)
        .animate({color: this._origTimeColor},{
            duration: 500,
            complete: function(){ts.css("color","");}
        });
    };

    TimerController.prototype._highlightTime = function(){
      var tx = $("#time");
      tx
        .animate({color: this._config.completedBlink.color},200)
        .animate({color: this._origTimeColor},{
          duration: 800,
          complete: function(){tx.css("color","");}
        });
    };

    return TimerController;
  })();

//== end TimerController decl.

  var config = {
    countdownBlink:{sec:10,color:"#FF0000"},
    completedBlink:{color:"#2244FF"}
  }

  var currentTimerController = new TimerController(config);

  $("#start-btn").click(function(){
    currentTimerController.start();
  });

  $("#stop-btn").click(function(){
    currentTimerController.stop();
  });


  $(".nmin-apply-btn").click(function(){
    var min = parseInt($(this).attr("data-x-min"), 10);
    currentTimerController.applyTime(min, 0, 0);
  });

  $("#xmin-apply-btn").click(function(){
    currentTimerController.applyCustomTimeInput();
  });

  currentTimerController.applyCustomTimeInput();

})();

