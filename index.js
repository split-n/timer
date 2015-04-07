(function(){
  "use strict";

  var Timer = (function(){
    var Timer = function(msec){
      this._restMsec = msec;
      this.onTick = [];
      this.onStop = [];
      this.onComplete = [];
      this._stopNext = false;
    }

    Timer.prototype.tick = function(){
      var self = this;
      var now = Date.now();
      var diff = now - this._prevTime;
      this._prevTime = now;
      this._restMsec -= diff;

      if(this._restMsec < 0){
        this._restMsec = 0;
        this.onTick.forEach(function(x){x(self._restMsec);});
        this.onStop.forEach(function(x){x();});
        this.onComplete.forEach(function(x){x();});
        clearInterval(this._intervalId);
        return;
      }

      if(this._stopNext){
        this.onTick.forEach(function(x){x(self._restMsec);});
        this.onStop.forEach(function(x){x();});
        clearInterval(this._intervalId);
        this._stopNext = false;
        return;
      }

      this.onTick.forEach(function(x){x(self._restMsec);});
    };

    Timer.prototype.start = function(){
      var self = this;
      this._prevTime = Date.now();
      this.tick();
      this._intervalId = setInterval(function(){self.tick();}, 25);
    };

    Timer.prototype.stop = function(){
      this._stopNext = true;
    };

    return Timer;
  })();
//== end Timer decl.

  function updateDisplay(min, sec, ms){
      $("#time-min").text(("0"+min).slice(-2));
      $("#time-sec").text(("0"+sec).slice(-2));
      $("#time-ms").text(("0"+ms).slice(-2));
      $("#start-btn").removeAttr("disabled");
  }

  function applyTimeConfig(){
    var min = $("#min-input").val() || 0;
    var sec = $("#sec-input").val() || 0;
    updateDisplay(min, sec, 0);
  }

  function parseTimeAsMsec(){
    var min = $("#time-min").text();
    var sec = $("#time-sec").text();
    var ms = $("#time-ms").text();
    var msec = parseInt(min)*60*1000 + parseInt(sec)*1000 + parseInt(ms);
    return msec;
  }

  function highlightSec(){
    var ts = $("#time-sec");
    var origColor = ts.css("color");
    ts
      .animate({color: "#FF0000"},150)
      .animate({color: origColor},{
          duration: 500,
          complete: function(){ts.css("color","")
          }});
  }

  function highlightTime(){
    var tx = $("#time");
    var origColor = tx.css("color");
    tx
      .animate({color: "#2244FF"},200)
      .animate({color: origColor},{
        duration: 800,
        complete: function(){tx.css("color","")
        }});
  }

  function startTimer(){
    var msec = parseTimeAsMsec();
    var timer = new Timer(msec);

    var lastTickSec;
    timer.onTick.push(function(msec){
      var min = Math.floor(msec/1000/60);
      var sec = Math.floor(msec/1000%60);
      var ms = Math.floor(msec%1000/10);

      if(min === 0 && lastTickSec !== undefined &&
          lastTickSec <= 10 && lastTickSec != sec){
        highlightSec();
      }
      updateDisplay(min, sec, ms);
      lastTickSec = sec;
    });

    timer.onStop.push(function(){
      $("#start-btn").css("display", "inline-block");
      $("#stop-btn").css("display", "none");
      $("#time-config").css("display", "block");
    });

    timer.onComplete.push(function(){
      $("#start-btn").attr("disabled", "");
      highlightTime();
    });
    timer.start();

    $("#start-btn").css("display", "none");
    $("#stop-btn").css("display", "inline-block");
    $("#time-config").css("display", "none");

    return timer;
  }
//== end functions decl.

  var currentTimer;

  $("#start-btn").click(function(){
    currentTimer = startTimer();
  });

  $("#stop-btn").click(function(){
    currentTimer.stop();
    currentTimer = null;
  });


  $(".nmin-apply-btn").click(function(){
    var min = parseInt($(this).attr("data-x-min"));
    updateDisplay(min, 0, 0);
  });

  $("#xmin-apply-btn").click(function(){
    applyTimeConfig();
  });

  applyTimeConfig();

})();

