/*==========================================================================
  Filename: timeline2v13.js
  By: A.R.Collins

  JavaScript animation library. Multiple objects are controlled by a master
  timeline. Each Animation object can have its own path and draw methods.

  Kindly give credit to Dr A R Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  23Sep13 Version 2 using requestAnimationFrame                          ARC
  27Feb13 Ignore rAF callback parameter - not consistent in all browsers ARC
  13Mar13 Made anims and dur to being a properties not just local vars   ARC
  03May13 Added 'stepTime' property                                      ARC
  14Jun13 Tidy code to make JSLint happy                                 ARC
  15Jun13 Restrict globals                                               ARC
  14Nov15 Tidy, update JavaScript style, delete RAF shim                 ARC
  15Nov15 Use options object rather than arguments for optional parms
          bugfix: use correct 'this' in step                             ARC
  16Nov15 Add Timeline.redraw                                            ARC
  18Nov15 Give state objects a 'time' proerty and update it each frame   ARC
  22Nov15 Make currState clone of nextState after initFn called          ARC
 ===========================================================================*/

// exposed globals
var Timeline, Animation;

(function() {
  "use strict";

  Timeline = function(animationObj, duration, looping)
  {
    var savThis = this;
    var PAUSED = 1, STOPPED = 2, PLAYING = 3, STEPPING = 4,
        loop = (looping == true)? true: false,    // convert to boolean
        mode = STOPPED,
        prevMode = STOPPED,
        startTime = 0,    // system time when animation started
        currTime = 0,     // msecs along timeline when current frame drawn
        timer = null;

    this.stepTime = 50;   // msec time interval between single steps
    this.anims = animationObj;   // anims can be an array of animation objects or just one
    if (this.anims instanceof Array)
    {
      this.anims.forEach(function(an){an.timeline = savThis;});  // save a reference to timeline
    }
    else
    {
      this.anims.timeline = this;
    }

    this.dur = -1;     // if 0 or negative value entered: go forever
    if (duration > 0)
    {
      this.dur = duration;
    }

    function stepper()
    {
      var time = Date.now(),   // generate local time stamp, browsers pass different time types
          localTime;

      if (prevMode == STOPPED)
      {
        startTime = time;     // forces localTime = 0
      }
      localTime = time - startTime;    // millsecs along timeline
      if ((localTime > savThis.dur) && (savThis.dur > 0))
      {
        if (loop)
        {
          startTime = time;   // we will re-start
          localTime = 0;      // pass this to pathFn to re-initialize
        }
        else                  // end of the animation
        {
          savThis.stop();
          return;
        }
      }
      // now draw each animated object for the new frame
      if (savThis.anims instanceof Array)
      {
        savThis.anims.forEach(function(an){an.nextFrame(localTime);});
      }
      else
      {
        savThis.anims.nextFrame(localTime);
      }
      // drawing done
      currTime = localTime;      // timestamp of what is currently on screen
      if (mode === STEPPING)
      {
        prevMode = PAUSED;
        mode = PAUSED;
      }
      if (mode === PLAYING)
      {
        prevMode = PLAYING;
        timer = window.requestAnimationFrame(stepper);
      }
    }

    this.play = function()
    {
      if (mode === PLAYING)
      {
        return;
      }
      if (mode === PAUSED)
      {
        startTime = Date.now() - currTime;  // move timeline as if currFrame just drawn
      }
      prevMode = mode;
      mode = PLAYING;
      timer = window.requestAnimationFrame(stepper);
    };

    this.step = function()
    {
      // equivalent to play for one frame and pause
      if (mode === PLAYING)
      {
        return;
      }
      if (mode === PAUSED)
      {
        startTime = Date.now() - currTime;  // move timeline as if currFrame just drawn
      }
      prevMode = mode;
      mode = STEPPING;
      window.setTimeout(function(){stepper.call(savThis);}, savThis.stepTime);
    };

    this.redraw = function()
    {
      // equivalent to play for one frame and pause
      if (mode === PLAYING)
      {
        return;
      }
      startTime = Date.now() - currTime;  // move timeline as if currFrame just drawn
      stepper();
    };

    this.pause = function()
    {
      if (timer)
      {
        window.cancelAnimationFrame(timer);
      }
      prevMode = mode;
      mode = PAUSED;
    };

    this.stop = function()
    {
      if (timer)
      {
        window.cancelAnimationFrame(timer);
      }
      prevMode = mode;
      mode = STOPPED;
      // reset the currTime so play and step know to start again
      currTime = 0;
    };

    // draw the initial frame of the animation
    timer = window.requestAnimationFrame(stepper);
  };

  Animation = function(initObj, draw, path, options) // pass additional arguments in options object
  {
    var savThis = this,
        i;

    this.timeline = null;           // Initialized by the parent Timeline constructor
    this.obj = null;                // object to be animated
    this.drawFn = draw;             // drawFn draws this.obj in this.nextSate
    this.pathFn = path;             // pathFn takes current time, calculates nextState vector
    this.currState = {time:0};      // current (as drawn) state vector
    this.nextState = {time:0};      // pathFn return next state vector here

    if (typeof initObj === "function")
    {
      this.obj = initObj.call(this, options);  // call object creation code
    }
    else if (typeof initObj === "object")
    {
      this.obj = initObj;           // object exists already use it
    }
    for (i in this.nextState)   // if initFn creates new porperties make currState match
    {
      this.currState[i] = this.nextState[i];
    }

    this.nextFrame = function(t)
    {
      var tmp;

      savThis.pathFn(t, options);
      savThis.drawFn(savThis.obj, savThis.nextState, options); // pass the new state
      // swap state pointers
      tmp = savThis.currState;
      savThis.currState = savThis.nextState; // save current state vector, pathFn will use it
      savThis.nextState = tmp;
      savThis.currState.time = t;     // save the frame draw time for use in next call to pathFn
    };
  };
}());