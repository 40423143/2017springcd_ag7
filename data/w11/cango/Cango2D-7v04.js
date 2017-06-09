/*==========================================================================
  Filename: Cango2D-7v04.js
  Rev: 7
  By: A.R.Collins
  Description: A 2D graphics library for the canvas element designed for
               simple animated applications.
  License: Released into the public domain, latest version at
           <http://www.arc.id.au/CanvasGraphics.html>
           Please give credit to A.R.Collins <http://www.arc.id.au>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  12Sep13 Version 1.00 release, from Rev 0v86                            ARC
  23May14 Update to include improvements made to Cango-4v09
          Released as Version 2v00                                       ARC
  29May14 Added ellipse to shapeDefs
          Use setProperty in constructor not duplicated code             ARC
  30May14 Drop fontWeight arugument from compileText
          Changed font to Inconsolata (Inconsolata-dz)                   ARC
  07Jun14 Changed font to Consolas, Monaco, "Andale Mono", monospace
          Removed redundant Obj2D hardtransform code                     ARC
  09Jun14 Restored immediate hardTransform not redundant after all       ARC
  14Jun14 bugfix: grp.enableDrag only 2 generations deep, make recursive ARC
  15Jun14 renamed Drag2D parent to target for clarity                    ARC
  18Jun14 Revamp the Drag2D add target and grabCsrPos
          bugfix: check type of cgo not pathObj in clipPath              ARC
  22Jun14 Remove useless iso references                                  ARC
  18Jul14 Upgrade appendPath to use clone not reference to drawCmds      ARC
  21Jul14 Remove global buffers use canvas properties instead.
          Add support for Obj2D borders.
          Add dropShadow support.                                        ARC
  22Jul14 bugfix: scl, rot, rev animateTransform ignoring static values  ARC
  23Jul14 Re-write animation methods use Timeline object to synchronise
          animations across all layers.
          Inhibit layers creating layers on themselves.                  ARC
  24Jul14 bugfix: layer position not correcting for bkgCanvas borders    ARC
  27Jul14 Upgrade layer handling using Layer object
          Upgrade dragNdrop so obj or groups on any layer are draggable  ARC
  28Jul14 Use Drag2D not DnD, that is for the simpler Cango version      ARC
  04Aug14 bugfix: TEXT border not drawn, text filled with strokeColor    ARC
  09Aug14 bugfix: vpW & vpH not duplicated by dupCtx.
          Modify text render to use 'bottom' baseline, it has consistant
          behaviour across all browsers.                                 ARC
  21Nov14 Change font size units from points to pixels
          Added fontFamily as Obj2D property                             ARC
  18Dec14 Use relative SVG coords in shapeDefs so concat works           ARC
  11Jan15 Added shapeDefs.rectangle with optional rounded corners        ARC
  10Feb15 Drop the compile commands, chnage draw command arguments
          Add dashed line support                                        ARC
  11Feb15 bugfix: Group2D.scale was used the same x and y scaling
          Released as Version 4v00                                       ARC
  16Feb15 Add LinearGradient and RadialGraient global objects
          Drop lineraGradientFill & radialGradientFill methods
          Drop setDropShadow method just use Cobj properties             ARC
  23Mar15 bugfix: Bad radius scaling of radial gradients for path/shapes
          Change DrawCmd parms to be [[x,y],[x1,y1], ... ] so reduce,
          map and forEach can be used to clean up code
          Change to delayed Image load (slower but more robust)          ARC
  24Mar15 Released as Version 5                                          ARC
  21Jun15 Add transform.skew                                             ARC
  22Jun15 Add Obj2D.transform.distort and Distorter constructor          ARC
  23Jun15 Added parmsOrg property to DrawCmd object for use by distort   ARC
  24Jun15 Make Distorter's internal add transform.bend                   ARC
  25Jun15 Removed offscreen buffering, modern browsers handle this
          Cleaned up transform matrix code for brevity
          Apply bend to Group2Ds by recusion                             ARC
  26Jun15 Refactor the way the transforms are applied to the tree        ARC
  27Jun15 Claned up recursive functions with forEach                     ARC
  02Jul15 Drop animateTransform in favour of transform using Tweeners
          Released as Version 6                                          ARC
  12Jul15 Accumulate transforms as Distrorter objects not matrices
          bugfix: skew angles were not +ve CCW                           ARC
  13Jul15 For simplicity don't use matrices in PATH  & SHAPE transforms  ARC
  17Jul15 bugfix: grpTfm for TEXT and IMG not updated in applyXfms
          use local variables for group transform references             ARC
  11Aug15 Created Path,Shape,Img & Text types
          Don't wait till render time to load images                     ARC
	17Jan16 Convert animation to the Timeline style                        ARC
  20Jan16 Do recursive reset of ofsTfmAry after each animation frame
          Redefine the old Tweener to be the new interpolater
          Do the recursive transform.reset for all render calls
          drawSpahe, path etc no longer return their Obj2D               ARC
  21Jan16 Add lineWidthWC that scales (lineWidth in pixels doesn't).
          Don't set Obj2D.lineWidth else cgo.penWid is ignored.
          Don't set Obj2D.lineCap else Cango.lineCap is ignored.
          Support pre-loaded Image as IMG Obj2D data.
          Add zoom and pan support with initZoomPan global.
          Make resetClip behave as 2012 Canvas Spec: count clipPath
          calls and call same number of ctx.restore's.                   ARC
  22Jan16 Rewrite clipPath using new Obj2D type "CLIP"                   ARC
  23Jan16 Re-write clipping to use a new "CLIP" type of Obj2D            ARC
  24Jan16 Dropped renderFrame as unnecessary                             ARC
  25Jan16 debugged lineWidth behaviour                                   ARC
  31Jan16 bugfix: lineWidth should not scale with hard scale
          remove redundant resize listener in Cango2D constructor
          Released as Version 7                                          ARC
  13Feb16 Define animation keyTimes in percentage of duration            ARC
  21Feb16 bugfix: Group2D.deleteObj deleting even when indexOf == -1     ARC
  08Jun16 bugfix: paintText scaled bounding box pixel size twice         ARC
  09Jun16 Font zoom scaling re-written to avoid fractional pixel values  ARC
  ==========================================================================*/

  // exposed globals
var Obj2D, LinearGradient, RadialGradient, Group2D, Tweener, initZoomPan,
    svgToCgo2D, // SVG path data string conversion utility function
    shapeDefs;  // predefined geometric shapes in Cgo2D format

var Cango2D = (function()
{
  "use strict";

  var uniqueVal = 0,    // used to generate unique value for different Cango2D instances
      svgParser,
      cgo2DtoDrawCmd;

  function addEvent(element, eventType, handler)
  {
    if (element.attachEvent)
    {
     return element.attachEvent('on'+eventType, handler);
    }
    return element.addEventListener(eventType, handler);
  }

  function clone(orgItem)
  {
    var newItem = (isArray(orgItem)) ? [] : {},
        i;
    for (i in orgItem)
    {
      if (orgItem[i] && typeof orgItem[i] === "object")
      {
        newItem[i] = clone(orgItem[i]);
      }
      else
      {
        newItem[i] = orgItem[i];
      }
    }
    return newItem;
  }

  if (!Date.now)
  {
    Date.now = function now()
    {
      return new Date().getTime();
    };
  }

  var isArray = function(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  if (!Array.prototype.contains)
  {
    Array.prototype.contains = function (v)
    {
      return this.indexOf(v) > -1;
    };
  }

  /* =============================================================================
   * Convert Cgo2D data array ['M',x,y, 'L',x1,y1, ... 'Q',cx,cy,x2,y2, 'A',r,r ...]
   * to array of canvas DrawCmd {drawFn:'moveTo', [x,y]}
   * ----------------------------------------------------------------------------*/
  svgParser = (function ()
  {
    var segmentToBezier = function(cx, cy, th0, th1, rx, ry, sin_th, cos_th) {
          var a00 = cos_th * rx,
              a01 = -sin_th * ry,
              a10 = sin_th * rx,
              a11 = cos_th * ry,
              th_half = 0.5 * (th1 - th0),
              t = (8/3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half),
              x1 = cx + Math.cos(th0) - t * Math.sin(th0),
              y1 = cy + Math.sin(th0) + t * Math.cos(th0),
              x3 = cx + Math.cos(th1),
              y3 = cy + Math.sin(th1),
              x2 = x3 + t * Math.sin(th1),
              y2 = y3 - t * Math.cos(th1);

          return [ a00 * x1 + a01 * y1, a10 * x1 + a11 * y1,
                   a00 * x2 + a01 * y2, a10 * x2 + a11 * y2,
                   a00 * x3 + a01 * y3, a10 * x3 + a11 * y3 ];
        },
        arcToBezier = function(ox, oy, radx, rady, rotateX, large, sweep, x, y)
        {
          var th = rotateX * (Math.PI/180),
              sin_th = Math.sin(th),
              cos_th = Math.cos(th),
              rx = Math.abs(radx),
              ry = Math.abs(rady),
              px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5,
              py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5,
              pl = (px*px) / (rx*rx) + (py*py) / (ry*ry),
              a00, a01, a10, a11,
              x0, y0, x1, y1,
              d,
              sfactor_sq,
              sfactor,
              xc, yc,
              th0, th1,
              th_arc,
              segments,
              seg, tidySeg,
              result = [],
              i, th2, th3;

          function roundZeros(coord)
          {
            return ((Math.abs(coord) < 0.00001)? 0: coord);
          }

          if (pl > 1)
          {
            pl = Math.sqrt(pl);
            rx *= pl;
            ry *= pl;
          }
          a00 = cos_th / rx;
          a01 = sin_th / rx;
          a10 = -sin_th / ry;
          a11 = cos_th / ry;
          x0 = a00 * ox + a01 * oy;
          y0 = a10 * ox + a11 * oy;
          x1 = a00 * x + a01 * y;
          y1 = a10 * x + a11 * y;
          d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0);
          sfactor_sq = 1 / d - 0.25;
          if (sfactor_sq < 0)
          {
            sfactor_sq = 0;
          }
          sfactor = Math.sqrt(sfactor_sq);
          if (sweep === large)
          {
            sfactor = -sfactor;
          }
          xc = 0.5 * (x0 + x1) - sfactor * (y1-y0);
          yc = 0.5 * (y0 + y1) + sfactor * (x1-x0);
          th0 = Math.atan2(y0-yc, x0-xc);
          th1 = Math.atan2(y1-yc, x1-xc);
          th_arc = th1-th0;
          if (th_arc < 0 && sweep === 1)
          {
            th_arc += 2*Math.PI;
          }
          else if (th_arc > 0 && sweep === 0)
          {
            th_arc -= 2 * Math.PI;
          }
          segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
          for (i=0; i<segments; i++)
          {
            th2 = th0 + i * th_arc / segments;
            th3 = th0 + (i+1) * th_arc / segments;
            seg = segmentToBezier(xc, yc, th2, th3, rx, ry, sin_th, cos_th);
            tidySeg = seg.map(roundZeros);
            result.push(tidySeg);
          }

          return result;
        },
        /*===============================================
         *
         * svgProtocol object defining each command
         * with methods to convert to Cgo2D for both
         * cartesian and SVG coordinate systems
         *
         *==============================================*/
        svgProtocol = {
          "M": {
            canvasMethod: "moveTo",
            parmCount: 2,
            extCmd: "L",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
                  x = curr[1],
                  y = curr[2],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = curr[1],
                  y = curr[2];

              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(curr); // push the curr, "M" is a Cango internal command
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var x = curr[1],
                  y = curr[2];

              x += xOfs;
              y += yOfs;
              return ["M", x, y];   // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var x = curr[1],
                  y = curr[2];

              return ["M", x, -y];   // invert y coords to make Cgo2D format
            }
          },
          "L": {
            canvasMethod: "lineTo",
            parmCount: 2,
            extCmd: "L",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
                  x = curr[1],
                  y = curr[2],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = curr[1],
                  y = curr[2];

              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(curr); // push the curr, "L" is a Cango internal command
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var x = curr[1],
                  y = curr[2];

              x += xOfs;
              y += yOfs;
              return ["L", x, y];   // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var x = curr[1],
                  y = curr[2];

              return ["L", x, -y];   // invert y coords to make Cgo2D format
            }
          },
          "H": {
            parmCount: 1,
            extCmd: "H",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),   // uppercase command means absolute coords
                  x = curr[1],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                x += acc.px;
              }
              currAbs = [cmd, x];
              acc.px = x;        // save the new pen position
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = curr[1],
                  y = acc.py,
                  cangoVer = ["L", x, y];

              acc.px = x;        // save the new pen position
              acc.push(cangoVer);
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var x = curr[1];

              x += xOfs;
              return ["H", x];
            },
            invertCoords: function(curr){
              var x = curr[1];

              return ["H", x];
            }
          },
          "V": {
            parmCount: 1,
            extCmd: "V",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),   // uppercase command means absolute coords
                  y = curr[1],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                y += acc.py;
              }
              currAbs = [cmd, y];
              acc.py = y;        // save the new pen position
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = acc.px,
                  y = curr[1],
                  cangoVer = ["L", x, y];

              acc.py = y;        // save the new pen position
              acc.push(cangoVer);
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var y = curr[1];

              y += yOfs;
              return ["V", y];    // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var y = curr[1];

              return ["V", -y];    // invert y coords to make Cgo2D format
            }
          },
          "C": {       // Cubic Bezier curve
            canvasMethod: "bezierCurveTo",
            parmCount: 6,
            extCmd: "C",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
                  c1x = curr[1],
                  c1y = curr[2],
                  c2x = curr[3],
                  c2y = curr[4],
                  x = curr[5],
                  y = curr[6],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                c1x += acc.px;
                c1y += acc.py;
                c2x += acc.px;
                c2y += acc.py;
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, c1x, c1y, c2x, c2y, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = curr[5],
                  y = curr[6];

              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(curr); // push the curr, "C" is a Cango internal command
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var c1x = curr[1],
                  c1y = curr[2],
                  c2x = curr[3],
                  c2y = curr[4],
                  x = curr[5],
                  y = curr[6];

                c1x += xOfs;
                c1y += yOfs;
                c2x += xOfs;
                c2y += yOfs;
                x += xOfs;
                y += yOfs;
              return ["C", c1x, c1y, c2x, c2y, x, y]; // invert y coords
            },
            invertCoords: function(curr){
              var c1x = curr[1],
                  c1y = curr[2],
                  c2x = curr[3],
                  c2y = curr[4],
                  x = curr[5],
                  y = curr[6];

              return ["C", c1x, -c1y, c2x, -c2y, x, -y]; // invert y coords
            }
          },
          "S": {         // Smooth cubic Bezier curve
            parmCount: 4,
            extCmd: "S",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase means absolute coords
                  c2x = curr[1],
                  c2y = curr[2],
                  x = curr[3],
                  y = curr[4],
                  currAbs;

              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                c2x += acc.px;
                c2y += acc.py;
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, c2x, c2y, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr, idx) {
              var c1x = 0,    // relative coords of first (mirrored) control point
                  c1y = 0,
                  c2x = curr[1],
                  c2y = curr[2],
                  x = curr[3],
                  y = curr[4],
                  prevSeg = acc[idx-1],
                  cangoVer;

              // if prev segment was a cubic Bezier, mirror its last control point as cp1
              if (prevSeg[0] === "C")              {
                c1x = acc.px - prevSeg[prevSeg.length-4];   // relative coords of cp1
                c1y = acc.py - prevSeg[prevSeg.length-3];
              }
              // make cp1 absolute (all the curr coords are already absolute)
              c1x += acc.px;
              c1y += acc.py;
              cangoVer = ["C", c1x, c1y, c2x, c2y, x, y];  // Cubic Bezier
              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(cangoVer);
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var c2x = curr[1],
                  c2y = curr[2],
                  x = curr[3],
                  y = curr[4];

              c2x += xOfs;
              c2y += yOfs;
              x += xOfs;
              y += yOfs;
              return ["S", c2x, c2y, x, y];    // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var c2x = curr[1],
                  c2y = curr[2],
                  x = curr[3],
                  y = curr[4];

              return ["S", c2x, -c2y, x, -y];    // invert y coords to make Cgo2D format
            }
          },
          "Q": {         // Quadratic Bezier curve
            canvasMethod: "quadraticCurveTo",
            parmCount: 4,
            extCmd: "Q",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase command means absolute coords
                  c1x = curr[1],
                  c1y = curr[2],
                  x = curr[3],
                  y = curr[4],
                  currAbs;
              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                c1x += acc.px;
                c1y += acc.py;
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, c1x, c1y, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var x = curr[3],
                  y = curr[4];

              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(curr); // push the curr, "Q" is a Cango internal command
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var c1x = curr[1],
                  c1y = curr[2],
                  x = curr[3],
                  y = curr[4];

              c1x += xOfs;
              c1y += yOfs;
              x += xOfs;
              y += yOfs;
              return ["Q", c1x, c1y, x, y];    // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var c1x = curr[1],
                  c1y = curr[2],
                  x = curr[3],
                  y = curr[4];

              return ["Q", c1x, -c1y, x, -y];    // invert y coords to make Cgo2D format
            }
          },
          "T": {         // Smooth Quadratic Bezier curve
            parmCount: 2,
            extCmd: "T",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),  // uppercase means absolute coords
                  x = curr[1],
                  y = curr[2],
                  currAbs;

              // Check if 'curr' was a relative (lowercase) command
              if (cmd !== curr[0]) {
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr, idx) {
              var c1x = 0,    // relative coords of first (mirrored) control point
                  c1y = 0,
                  x = curr[1],
                  y = curr[2],
                  prevSeg = acc[idx-1],
                  cangoVer;

              // if prev segment was quadratic Bezier, mirror its last control point as cp1
              if (prevSeg[0] === "Q")            {
                c1x = acc.px - prevSeg[prevSeg.length-4];   // relative coords of first cp1
                c1y = acc.py - prevSeg[prevSeg.length-3];
              }
              // make cp1 absolute
              c1x += acc.px;
              c1y += acc.py;
              cangoVer = ["Q", c1x, c1y, x, y];   // Quadratic Bezier
              acc.px = x;  // update the pen position for next command
              acc.py = y;
              acc.push(cangoVer);
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var x = curr[1],
                  y = curr[2];

              x += xOfs;
              y += yOfs;
              return ["T", x, y];    // invert y coords to make Cgo2D format
            },
            invertCoords: function(curr){
              var x = curr[1],
                  y = curr[2];

              return ["T", x, -y];    // invert y coords to make Cgo2D format
            }
          },
          "A" : {      // Circular arc
            parmCount: 7,
            extCmd: "A",
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),
                  rx = curr[1],
                  ry = curr[2],
                  xrot = curr[3],     // opposite to SVG in Cartesian coords
                  lrg = curr[4],
                  swp = curr[5],      // opposite to SVG in Cartesian coords
                  x = curr[6],
                  y = curr[7],
                  currAbs;
              // Check if current is a relative (lowercase) command
              if (cmd !== curr[0]) {
                x += acc.px;
                y += acc.py;
              }
              currAbs = [cmd, rx, ry, xrot, lrg, swp, x, y];
              acc.px = x;
              acc.py = y;
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              var rx = curr[1],
                  ry = curr[2],
                  xrot = curr[3],     // opposite to SVG in Cartesian coords
                  lrg = curr[4],
                  swp = curr[5],      // opposite to SVG in Cartesian coords
                  x = curr[6],
                  y = curr[7],
                  sectors;

              // convert to (maybe multiple) cubic Bezier curves
              sectors = arcToBezier(acc.px, acc.py, rx, ry, xrot, lrg, swp, x, y);
              // sectors is an array of arrays of Cubic Bezier coords,
              // make a 'C' command from each sector and push it out
              sectors.forEach(function(coordAry){
                acc.push(["C"].concat(coordAry));
              });

              acc.px = x;  // update the pen position for next command
              acc.py = y;
            },
            addXYoffset: function(curr, xOfs, yOfs){
              var rx = curr[1],
                  ry = curr[2],
                  xrot = curr[3],
                  lrg = curr[4],
                  swp = curr[5],
                  x = curr[6],
                  y = curr[7];

              x += xOfs;
              y += yOfs;
              return ["A", rx, ry, xrot, lrg, swp, x, y];  // invert y coords
            },
            invertCoords: function(curr){
              var rx = curr[1],
                  ry = curr[2],
                  xrot = curr[3],
                  lrg = curr[4],
                  swp = curr[5],
                  x = curr[6],
                  y = curr[7];

              return ["A", rx, ry, -xrot, lrg, 1-swp, x, -y];  // invert coords
            }
          },
          "Z": {
            canvasMethod: "closePath",
            parmCount: 0,
            toAbs: function(acc, curr) {
              var cmd = curr[0].toUpperCase(),
                  currAbs = [cmd];
              // leave pen position where it is in case of multi-segment path
              return currAbs;
            },
            toCangoVersion: function(acc, curr) {
              // leave pen position where it is in case of multi-segment path
              acc.push(curr); // push the curr, "Z", its a Cango internal command
            },
            addXYoffset: function(curr, xOfs, yOfs){
              return ["Z"];
            },
            invertCoords: function(curr){
              return ["Z"];
            }
          }
        };
    // ========= end of vars =========

    /*==================================================
     * svgCmdCheck (a function for use with Array.reduce)
     * -------------------------------------------------
     * Checks each element, if a string it must be
     * one of the keys in the SVG proptocol. If no bad
     * cmds found then the array is returned without
     * alteration, if not an empty array is returned.
     *=================================================*/
    function svgCmdCheck(acc, current, idx)
    {
      // make a concession to SVG standard and allow all number array
      if (idx === 0)
      {
        if (typeof current !== 'string')
        {
          acc.push("M");
          // now we will fall through to normal checking
        }
      }
      // if we see a command string, check it is in SVG protocol
      if (typeof current === "string") {  // check each string element
        if (!svgProtocol.hasOwnProperty(current.toUpperCase()))
        {
          console.log("unknown command string '"+current+"'");
          acc.badCmdFound = true;
          acc.length = 0;   // any bad command will force e,pty array to be retruned
        }
      }
      if (!acc.badCmdFound)
      {
        acc.push(current);
      }
      // always return when using reduce...
      return acc;
    }

    /*======================================================
     * unExtend  (a function for use with Array.reduce)
     * -----------------------------------------------------
     * Undo the extension of commands given the svg protocol.
     * Each entry in the protocol has an extCmd property which
     * is usually the same as the command key but for "M"
     * which may be extended by a series of "L" commands.
     * Extending a command means that multiple sets of paramaeters
     * may follow a command letter without the need to repeat
     * the command letter in front of each set eg.
     * The 'reduce' accumulator is used to hold the current
     * command as a property (not an array elemet) and make it
     * available to the next element.
     *
     * var a = ['M', 1, 2, 'L', 3, 4, 5, 6, 7, 8, 'A', 5, 6, 7, 8, 3, 0, 2]
     * var b = a.reduce(unExtend, [])
     *
     * >> ['M', 1, 2, 'L', 3, 4, 'L', 5, 6, 'L', 7, 8, 'A', 5, 6, 7, 8, 3, 0, 2]
     *
     * This assumes no invalid commands are in the string -
     * so array should be sanitized before running unExtend
     *======================================================*/
    function unExtend(acc, current, idx, ary)
    {
      var newCmd;

      if (idx === 0)
      {
        acc.nextCmdPos = 0;  // set expected position of next command string as first element
      }
      // Check if current is a command in the protocol (protocol only indexed by upperCase)
      if (typeof current === 'string')
      {
        if (idx < acc.nextCmdPos)
        {
          // we need another number but found a string
          console.log("bad number of parameters for '"+current+"' at index "+idx);
          acc.badParameter = true;  // raise flag to bailout processing this
          acc.push(0);  // try to get out without crashing (acc data will be ditched any way)
          return acc;
        }
        // its a command the protocol knows, remember it across iterations of elements
        acc.currCmd = current.toUpperCase();  // save as a property of the acc Array object (not an Array element)
        acc.uc = (current.toUpperCase() === current);  // upperCase? true or false
        // calculate where the next command should be
        acc.nextCmdPos = idx + svgProtocol[acc.currCmd].parmCount + 1;
        acc.push(current);
      }
      else if (idx < acc.nextCmdPos)   // processing parameters
      {
        // keep shoving parameters
        acc.push(current);
      }
      else
      {
        // we have got a full set of paramaters but hit another number
        // instead of a command string, it must be a command extention
        // push a the extension command (same as current except for M which extend to L)
        // into the accumulator
        acc.currCmd = svgProtocol[acc.currCmd].extCmd;  // NB: don't change the acc.uc boolean
        newCmd = (acc.uc)? acc.currCmd: acc.currCmd.toLowerCase();
        acc.push(newCmd, current);
        // calculate where the next command should be
        acc.nextCmdPos = idx + svgProtocol[acc.currCmd].parmCount;
      }

      if (idx === ary.length-1)   // done processing check if all was ok
      {
        if (acc.badParameter)
        {
          acc.length = 0;
        }
      }
      // always return when using reduce...
      return acc;
    }

    /*==================================================
     * svgCmdSplitter (a function for use with Array.reduce)
     * -------------------------------------------------
     * Split an array on a string type element, e.g.
     *
     * var a = ['a', 1, 2, 'b', 3, 4, 'c', 5, 6, 7, 8]
     * var b = a.reduce(svgCmdSplitter, [])
     *
     * >> [['a', 1, 2],['b', 3, 4], ['c', 5, 6, 7, 8]]
     *
     *=================================================*/
    function svgCmdSplitter(acc, curr)
    {
      // if we see a command string, start a new array element
      if (typeof curr === "string") {
          acc.push([]);
      }
      // add this element to the back of the acc's last array
      acc[acc.length-1].push(curr);
      // always return when using reduce...
      return acc;
    }

    /*===========================================================
     * toAbsoluteCoords  (a function for use with Array.reduce)
     * ----------------------------------------------------------
     * Reduce is needed even though the same size elements are
     * returned because the accumulator is used to hold the pen
     * x,y coords and make them available to the next element.
     * Assumes 'current' argument is an array of form ["M", 2, 7]
     * if command letter is lower case the protocol.toAbs
     * function will add the current pen x and y values to
     * the coordinates and update the pen x, y. The
     * absolute coord version of the cmd and its coords will
     * be returned and then pushed into acc.
     *
     * eg. ['M', 1, 2, 'l', 3, 4, 'a', 5, 6, 7, 8, 3, 0, 2, 'z']
     * >>  ['M', 1, 2, 'L', 4, 6, 'A', 5, 6, 7, 8, 3, 4, 8, 'Z']
     *===========================================================*/
    function toAbsoluteCoords(acc, current, idx)
    {
      var currCmd, currAbs;

      if (acc.px === undefined)
      {
        acc.px = 0;
        acc.py = 0;
      }
      // get protocol object for this command, indexed by uppercase only
      currCmd = svgProtocol[current[0].toUpperCase()];
      // call protocol toAbs function for this command
      // it returns absolute coordinate version based on current
      // pen position stored in acc.px, acc.py
      currAbs = currCmd.toAbs(acc, current, idx);
      acc.push(currAbs);
      // always return when using reduce...
      return acc;
    }

    /*==================================================================================
     * toCangoCmdSet  (a function for use with Array.reduce)
     * ---------------------------------------------------------------------------------
     * Assumes 'current' argument is an array of form ["M", 2, 7]
     * All commands letters are uppercase and all coordinates
     * are absolute (referenced to world coordinate origin).
     * This function will convert "H", "V", "S", "T", and "A"
     * commands to Cango internal command set "M", "L", "Q", "C", "Z"
     * All coordinates will be returned in separate array
     *
     * eg. [['M', 1, 2], ['L', 3, 4], ['H', 3], ['A', 5, 6, 7, 8, 3, 0, 2], ['Z']]
     * >>  [['M', 1, 2], [['L', 3, 4], ['L', 3, 4], ['C', cp, cp, cp, cp, x, y], ['Z']]
     *==================================================================================*/
    function toCangoCmdSet(acc, current, idx)
    {
      var currCmd = current[0],
          currSvgObj = svgProtocol[currCmd];

      // call protocol toCangoVersion function for this command
      // it converts all SVG to just "M", "L", "Q", "C", "Z" command and coords
      // and pushes them into the acc
      currSvgObj.toCangoVersion(acc, current, idx);
      // always return when using reduce...
      return acc;
    }

    /*==============================================
     * toDrawCmds  (a function for use with Array.reduce)
     * ----------------------------------------------
     * Convert a Cgo2D data array to an array
     * of Cango DrawCmd objects e.g.
     *
     * [['M', 0.1, 0.2], ['L', 1, 2, 'C', 3, 4, 5, 6, 2, 9], ['Z']]
     *
     * will become
     * [{ drawFn: "moveTo",
     *    parms: [0.1, 0.2],
     *    ...
     *  },
     *  { drawFn: "lineTo",
     *    parms: [1, 2],
     *    ...
     *  },
     *  ...
     *  ]
     *
     *===============================================*/
    function toDrawCmds(current)
    {
      // first element is a command...
      var cmd = current[0],   // grab command string
          parameters = current.slice(1); // make an array of the rest

      // the array elements have been checked as all valid
      // make a new element starting with an empty array
      return new DrawCmd(svgProtocol[cmd].canvasMethod, parameters);
    }

    /*==================================================
     * strToCgo2D (a function for use with Array.reduce)
     * -------------------------------------------------
     * Assumes 'current' argument is a string of form
     * "M  2 7" or "v 7  " or "z" which always has a
     * command string as the first character
     * and the rest is numbers separated by white space
     * This function will reduce (combine) to a single
     * array in Cgo2D format ["M", 2, 7, "v", 7, "z"]
     *=================================================*/
    function strToCgo2D(acc, current)
    {
      var cmd = current[0],
          parmsStr, numberStrs;

      // push the single char command as an element
      acc.push(cmd);
      // strip off the front cmd
      parmsStr = current.slice(1);
      // convert to an array of strings, each one number
      numberStrs = parmsStr.match(/\S+/g);   // returns null if no matches (not empty array)
      if (numberStrs)      // z has no numbers to follow
      {
        // parse each to a float and push it into acc
        numberStrs.forEach(function(s){
          var num = parseFloat(s);
          if (!isNaN(num))
          {
            acc.push(num);
          }
        });
      }
      // always return when using reduce...
      return acc;
    }

    /*===========================================================
     * flipCoords  (a function for use with Array.map)
     * ----------------------------------------------------------
     * Assumes 'current' argument is an array of form ["M", 2, 7]
     * All coordinates will be be in absolute format
     * The protocol will have an 'invertCoords' method for each
     * possible command key this will return the current array
     * with the sign of the Y coords flipped and sense of arcs reversed
     * reversed
     *
     * current = ['A', 2, 2,  30, 0, 1, 3,  4]
     *       >>  ['A', 2, 2, -30, 0, 0, 3, -4]
     *===========================================================*/
    function flipCoords(current)
    {
      var currCmd = current[0],
          currSvgObj = svgProtocol[currCmd];

      // call protocol.invertCoords function for this command
      // it flips the sign of the y coords, for 'A' commands it flips
      // sweep and xRotation values and returns the modified array
      return currSvgObj.invertCoords(current);
    }

    /*===========================================================
     * translateOrigin  (a function for use with Array.map)
     * ----------------------------------------------------------
     * Assumes it is called with 'this' object having
     * properties {xOfs: value, yOfs: value}
     * Assumes 'current' argument is an array of form ["M", 2, 7]
     * All coordinates will be be in absolute format
     * The protocol will have an 'addXYoffset method for each
     * possible command key this will return the current array
     * with the X and Y offsets added to the coordinate elements.
     *
     * eg. if 'this = {xOfs: 100, yOfs: 10}
     * current = ['M', 1, 2]
     * >>  ['M', 101, 12]
     *===========================================================*/
    function translateOrigin(current)
    {
      var currCmd = current[0],
          currSvgObj = svgProtocol[currCmd],
          xofs = this.xOfs || 0,
          yofs = this.yOfs || 0;

      return currSvgObj.addXYoffset(current, xofs, yofs);
    }

    /*===========================================================
     * flatten2Dary  (a function for use with Array.reduce)
     * ----------------------------------------------------------
     * Assumes curr is an array, push each element into the acc
     * to form a 1D array.

     * eg. [['M', 1, 2], ['V',2],['Z']]
     * >>  ['M', 1, 2, 'V', 2, 'Z']
     *===========================================================*/
    function flatten2Dary(acc, curr){
      return acc.concat(curr);
    }

    // auto run this code to create this object holding the two translator fns
    // and return it as the svgParser
    return {
      svg2cartesian: function(svgStr, xShft, yShft) {
        var dx = xShft || 0,
            dy = yShft || 0,
            noCommas,
            cmdStrs;

        if ((typeof svgStr !== 'string')||(svgStr.length === 0))
        {
          return [];
        }
        // this SVG processor can handle comma separated or whitespace separated or mixed
        // replace any commas with spaces
        noCommas = svgStr.replace(new RegExp(',', 'g'), ' ');
        // now we have a string of commands and numbers separated by whitespace
        // split it at command chars
        cmdStrs = noCommas.split(/(?=[a-df-z])/i);  // avoid e in exponents

        return cmdStrs.reduce(strToCgo2D, [])
                      .reduce(svgCmdCheck, [])
                      .reduce(unExtend, [])
                      .reduce(svgCmdSplitter, [])
                      .reduce(toAbsoluteCoords, [])
                      .map(translateOrigin, {xOfs: dx, yOfs: dy})
                      .map(flipCoords)
                      .reduce(flatten2Dary, []);
      },
      cgo2drawcmds: function(cgo2Dary) {
        if (!isArray(cgo2Dary) || (cgo2Dary.length === 0))
        {
          return [];
        }
        return cgo2Dary.reduce(svgCmdCheck, [])
                       .reduce(unExtend, [])
                       .reduce(svgCmdSplitter, [])
                       .reduce(toAbsoluteCoords, [])
                       .reduce(toCangoCmdSet, [])
                       .map(toDrawCmds);

      }
    };

  }());

  /* =============================================================================
   * Convert Cgo2D data array ['M',x,y, 'L',x1,y1, ... 'Q',cx,cy,x2,y2, 'A',r,r ]
   * to array of canvas DrawCmd {drawFn:'moveTo', [x,y]}
   * ----------------------------------------------------------------------------*/
  cgo2DtoDrawCmd = svgParser.cgo2drawcmds;

  if (shapeDefs === undefined)
  {
    shapeDefs = {'circle': function(diameter){
                            var d = diameter || 1;
                            return ["m", -0.5*d,0,
                            "c", 0,-0.27614*d, 0.22386*d,-0.5*d, 0.5*d,-0.5*d,
                            "c", 0.27614*d,0, 0.5*d,0.22386*d, 0.5*d,0.5*d,
                            "c", 0,0.27614*d, -0.22386*d,0.5*d, -0.5*d,0.5*d,
                            "c", -0.27614*d,0, -0.5*d,-0.22386*d, -0.5*d,-0.5*d];},

                'ellipse': function(width, height){
                            var w = width || 1,
                                h = w;
                            if ((typeof height === 'number')&&(height>0))
                            {
                              h = height;
                            }
                            return ["m", -0.5*w,0,
                            "c", 0,-0.27614*h, 0.22386*w,-0.5*h, 0.5*w,-0.5*h,
                            "c", 0.27614*w,0, 0.5*w,0.22386*h, 0.5*w,0.5*h,
                            "c", 0,0.27614*h, -0.22386*w,0.5*h, -0.5*w,0.5*h,
                            "c", -0.27614*w,0, -0.5*w,-0.22386*h, -0.5*w,-0.5*h];},

                'square': function(width){
                            var w = width || 1;
                            return ['m', 0.5*w, -0.5*w, 'l', 0, w, -w, 0, 0, -w, 'z'];},

                'rectangle': function(w, h, rad){
                            var r;
                            if ((rad === undefined)||(rad<=0))
                            {
                              return ["m",-w/2,-h/2, "l",w,0, 0,h, -w,0, 'z'];
                            }
                            r = Math.min(w/2, h/2, rad);
                            return ["m", -w/2+r,-h/2, "l",w-2*r,0, "a",r,r,0,0,1,r,r, "l",0,h-2*r,
                                    "a",r,r,0,0,1,-r,r, "l",-w+2*r,0, "a",r,r,0,0,1,-r,-r, "l",0,-h+2*r,
                                    "a",r,r,0,0,1,r,-r];},

                'triangle': function(side){
                            var s = side || 1;
                            return ['m', 0.5*s, -0.289*s, 'l', -0.5*s, 0.866*s, -0.5*s, -0.866*s, 'z'];},

                'cross': function(width){
                            var w = width || 1;
                            return ['m', -0.5*w, 0, 'l', w, 0, 'm', -0.5*w, -0.5*w, 'l', 0, w];},

                'ex': function(diagonal){
                            var d = diagonal || 1;
                            return ['m', -0.3535*d,-0.3535*d, 'l',0.707*d,0.707*d,
                                    'm',-0.707*d,0, 'l',0.707*d,-0.707*d];}
                };
  }

  function Drag2D(grabFn, dragFn, dropFn)
  {
    var savThis = this,
        nLrs, topCvs;

    this.cgo = null;                    // filled in by render
    this.layer = null;                  // filled in by render
    this.target = null;                 // filled by enableDrag method
    this.parent = null;                 // filled in on grab
    this.grabCallback = grabFn || null;
    this.dragCallback = dragFn || null;
    this.dropCallback = dropFn || null;
    this.grabCsrPos = {x:0, y:0};
    this.dwgOrg = {x:0, y:0};           // target drawing origin in world coords
    this.dwgOrgOfs = {x:0, y:0};        // target dwgOrg offset from target's parent dwgOrg
    this.grabOfs = {x:0, y:0};          // csr offset from target (maybe Obj or Group) drawing origin
    // the following closures hold the scope of the Drag2D instance so 'this' points to the Drag2D
    // multiple Obj2D may use this Drag2D, hitTest passes back which it was
    this.grab = function(evt, grabbedObj)
    {
      var event = evt||window.event,
          csrPosWC;
      // this Drag2D may be attached to Obj2D's Group2D parent
      if (grabbedObj.dragNdrop !== null)
      {
        this.parent = grabbedObj;      // the parent is an Obj2D
      }
      else  // cant find the dragNdrop for this grab
      {
        return true;
      }

      // calc top canvas at grab time since layers can come and go
      nLrs = this.cgo.bkgCanvas.layers.length;
      topCvs = this.cgo.bkgCanvas.layers[nLrs-1].cElem;

      topCvs.onmouseup = function(e){savThis.drop(e);};
      topCvs.onmouseout = function(e){savThis.drop(e);};
      csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // save the cursor pos its very useful
      this.grabCsrPos.x = csrPosWC.x;
      this.grabCsrPos.y = csrPosWC.y;
      // copy the parent drawing origin (for convenience)
      this.dwgOrg.x = this.target.dwgOrg.x;
      this.dwgOrg.y = this.target.dwgOrg.y;
      if (this.target.parent)
      {
        // save the cursor offset from the parent's parent Group2D drawing origin (world coords)
        this.dwgOrgOfs = {x:this.target.dwgOrg.x - this.target.parent.dwgOrg.x,
                          y:this.target.dwgOrg.y - this.target.parent.dwgOrg.y};
      }
      else
      {
        // no parent, so same as adding 0s
        this.dwgOrgOfs = {x:this.target.dwgOrg.x,
                          y:this.target.dwgOrg.y};
      }
      this.grabOfs = {x:csrPosWC.x - this.dwgOrgOfs.x,
                      y:csrPosWC.y - this.dwgOrgOfs.y};

      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }

      topCvs.onmousemove = function(event){savThis.drag(event);};
      if (event.preventDefault)       // prevent default browser action (W3C)
      {
        event.preventDefault();
      }
      else                        // shortcut for stopping the browser action in IE
      {
        window.event.returnValue = false;
      }
      return false;
    };

    this.drag = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      if (this.dragCallback)
      {
        this.dragCallback(csrPosWC);
      }
    };

    this.drop = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      topCvs.onmouseup = null;
      topCvs.onmouseout = null;
      topCvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    };

    // version of drop that can be called from an app to stop a drag before the mouseup event
    this.cancelDrag = function(mousePos)
    {
      topCvs.onmouseup = null;
      topCvs.onmouseout = null;
      topCvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(mousePos);
      }
    };
  }

  LinearGradient = function(p1x, p1y, p2x, p2y)
  {
    this.grad = [p1x, p1y, p2x, p2y];
    this.colorStops = [];
    this.addColorStop = function(){this.colorStops.push(arguments);};
  };

  RadialGradient = function(p1x, p1y, r1, p2x, p2y, r2)
  {
    this.grad = [p1x, p1y, r1, p2x, p2y, r2];
    this.colorStops = [];
    this.addColorStop = function(){this.colorStops.push(arguments);};
  };

  function DrawCmd(cmdStr, coords)   // canvas syntax draw commands
  {
    // coords = world coordinates in [cp1x,cp1y, cp2x,cp2y, ... x,y]
    var i;

    this.drawFn = cmdStr;       // String version of the canvas command to call
    this.parms = [];
    this.parmsPx = [];          // parms transformed into pixel coords
    this.parmsOrg = [];
    for (i=0; i<coords.length; i+=2)
    {
      this.parms.push(coords.slice(i, i+2));
      this.parmsOrg.push(coords.slice(i, i+2));     // original path parms for distort methods (in world coords)
    }
  }

  Tweener = function(delay, duration, loopStr)    // a pre-defined pathFn
  {
		this.delay = delay || 0;
    this.dur = duration || 5000;
    this.reStartOfs = 0;
    this.loop = false;
    this.loopAll = false;

    var savThis = this,
        loopParm = "noloop";

    if (typeof loopStr === 'string')
    {
      loopParm = loopStr.toLowerCase();
    }
    if (loopParm === 'loop')
    {
      this.loop = true;
    }
    else if (loopParm === 'loopall')
    {
      this.loopAll = true;
    }

    this.getVal = function(time, vals, keyTimes)  // vals is an array of key frame values (or a static number)
    {
      var numSlabs, slabDur, slab, frac, i,
					t = 0,
					tFrac,
					localTime,
					values, times;

      if (time === 0)       // re-starting after a stop, otherwise this can increase forever (looping is handled here)
      {
        savThis.reStartOfs = 0;     // reset this to prevent negative times
      }
      localTime = time - savThis.reStartOfs;       // handles local looping
      if ((localTime > savThis.dur+savThis.delay) && (savThis.dur > 0) && (savThis.loop || savThis.loopAll))
      {
        savThis.reStartOfs = savThis.loop? time - savThis.delay : time;      // we will correct external time to re-start
        localTime = 0;          // force re-start at frame 0 now too
      }
      t = 0;    // t is the actual local time value used for interpolating
      if (localTime > savThis.delay)    // repeat initial frame (t=0) if there is a delay to start
      {
        t = localTime - savThis.delay;   // localTime is contrained to 0 < localTime < this.dur
      }

      if (!isArray(vals))    // not an array, just a static value, return it every time
      {
        return vals;
      }
      if (!vals.length)
      {
        return 0;
      }
      if (vals.length === 1)
      {
        return vals[0];
      }
      // we have at least 2 element array of values
      if (t === 0)
      {
        return vals[0];
      }
      if (t >= savThis.dur)
      {
        return vals[vals.length-1];  // freeze at end value
      }
      numSlabs = vals.length-1;
      if (!isArray(keyTimes) || (vals.length !== keyTimes.length))
      {
        slabDur = savThis.dur/numSlabs;
        slab = Math.floor(t/slabDur);
        frac = (t - slab*slabDur)/slabDur;

        return vals[slab] + frac*(vals[slab+1] - vals[slab]);
      }

      // we have keyTimes to play work with copies of arrays
      values = [].concat(vals);
      times = [].concat(keyTimes);
      // make sure times start with 0
      if (times[0] !== 0)
      {
        values.unshift(values[0]);
        times.unshift(0);
      }
      // make sure times end with 100
      if (times[times.length-1] !== 100)
      {
        values.push(values[values.length-1]);
        times.push(100);
      }
      i = 0;
      tFrac = t/savThis.dur;
      while ((i < times.length-1) && (times[i+1]/100 < tFrac))
      {
        i++;
      }
      slabDur = (times[i+1]-times[i])/100;
      frac = (tFrac - times[i]/100)/slabDur;    // convert percentage time to fraction

      return values[i] + frac*(values[i+1] - values[i]);
    };
  };

  // Generate a 2D identity matrix
  function identityMatrix()
  {
    return [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]];
  }

  // Generate a 2D translation matrix
  function translateMatrix(tx, ty)
  {
    var x = tx || 0,
        y = ty || 0;

    return [[1, 0, 0],
            [0, 1, 0],
            [x, y, 1]];
  }

  // Generate a 2D rotate matrix, angle in degrees
  function rotateMatrix(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t);

    return [[c, -s, 0],
            [s,  c, 0],
            [0,  0, 1]];
  }

  // Skew matrix, angle in degrees applied before translate
  function skewMatrix(degH, degV)
  {
    var ha = degH || 0,
        va = degV || 0,
        rad = Math.PI/180.0,
        htn	= Math.tan(-ha*rad),
        vtn	= Math.tan(va*rad);

    return [[1,   vtn, 0],
            [htn, 1,   0],
            [0,   0,   1]];
  }

  // Generate a 2D revolve (identical to rotate) but may be applied after soft translate.
  function revolveMatrix(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t);

    return [[c, -s, 0],
            [s,  c, 0],
            [0,  0, 1]];
  }

  // Generate a 2D scale matrix
  function scaleMatrix(xScale, yScale)
  {
    var sx = xScale || 1,
        sy = yScale || sx;

    return [[sx, 0, 0],
            [0, sy, 0],
            [0, 0,  1]];
  }

  /*===============================================
   * Object holding an array of 3 1x3 arrays,
   * representing a 3x3 matrix and methods to
   * apply matrix tranforms.
   *----------------------------------------------*/
  function TransformMatrix()
  {
    this.matrix = identityMatrix();
  }

  // Reset the matrix to the identity matrix
  TransformMatrix.prototype.reset = function()
  {
    this.matrix[0][0] = 1;
    this.matrix[0][1] = 0;
    this.matrix[0][2] = 0;
    this.matrix[1][0] = 0;
    this.matrix[1][1] = 1;
    this.matrix[1][2] = 0;
    this.matrix[2][0] = 0;
    this.matrix[2][1] = 0;
    this.matrix[2][2] = 1;
  };

  TransformMatrix.prototype.applyTransform = function(m)
  {
    // apply a transform by multiplying this.matrix by matrix 'm'
    var a11 = this.matrix[0][0],
        a12 = this.matrix[0][1],
        a13 = this.matrix[0][2],
        a21 = this.matrix[1][0],
        a22 = this.matrix[1][1],
        a23 = this.matrix[1][2],
        a31 = this.matrix[2][0],
        a32 = this.matrix[2][1],
        a33 = this.matrix[2][2],
        b11 = m[0][0],
        b12 = m[0][1],
        b13 = m[0][2],
        b21 = m[1][0],
        b22 = m[1][1],
        b23 = m[1][2],
        b31 = m[2][0],
        b32 = m[2][1],
        b33 = m[2][2];

    this.matrix[0][0] = a11 * b11 + a12 * b21 + a13 * b31;
    this.matrix[0][1] = a11 * b12 + a12 * b22 + a13 * b32;
    this.matrix[0][2] = a11 * b13 + a12 * b23 + a13 * b33;
    this.matrix[1][0] = a21 * b11 + a22 * b21 + a23 * b31;
    this.matrix[1][1] = a21 * b12 + a22 * b22 + a23 * b32;
    this.matrix[1][2] = a21 * b13 + a22 * b23 + a23 * b33;
    this.matrix[2][0] = a31 * b11 + a32 * b21 + a33 * b31;
    this.matrix[2][1] = a31 * b12 + a32 * b22 + a33 * b32;
    this.matrix[2][2] = a31 * b13 + a32 * b23 + a33 * b33;
  };

  // Multiply two matricies
  function matrixMult(a, b)
  {
    var a11 = a[0][0],
        a12 = a[0][1],
        a13 = a[0][2],
        a21 = a[1][0],
        a22 = a[1][1],
        a23 = a[1][2],
        a31 = a[2][0],
        a32 = a[2][1],
        a33 = a[2][2],
        b11 = b[0][0],
        b12 = b[0][1],
        b13 = b[0][2],
        b21 = b[1][0],
        b22 = b[1][1],
        b23 = b[1][2],
        b31 = b[2][0],
        b32 = b[2][1],
        b33 = b[2][2];

    return [[a11 * b11 + a12 * b21 + a13 * b31,
             a11 * b12 + a12 * b22 + a13 * b32,
             a11 * b13 + a12 * b23 + a13 * b33],
            [a21 * b11 + a22 * b21 + a23 * b31,
             a21 * b12 + a22 * b22 + a23 * b32,
             a21 * b13 + a22 * b23 + a23 * b33],
            [a31 * b11 + a32 * b21 + a33 * b31,
             a31 * b12 + a32 * b22 + a33 * b32,
             a31 * b13 + a32 * b23 + a33 * b33]];
  }

  function transformPoint(px, py, m)
  {
    var a1 = px,
        a2 = py,
        a3 = 1,
        b11 = m[0][0],
        b12 = m[0][1],
        b21 = m[1][0],
        b22 = m[1][1],
        b31 = m[2][0],
        b32 = m[2][1];

    return {x:a1 * b11 + a2 * b21 + a3 * b31 , y: a1 * b12 + a2 * b22 + a3 * b32};
  }

  function translater(args)      // will be called with 'this' pointing to an Obj2D
  {
    var savThis = this,
        x = args[0] || 0,
        y = args[1] || 0,
				transMat = [[1, 0, 0],
										[0, 1, 0],
										[x, y, 1]];

    if (this instanceof Obj2D)    // this transformer may be called on point object {x:, y: }
    {
      this.ofsTfm.applyTransform(transMat);      // used for TEXT obj, IMG obj and gradient fills
      if ((this.type === "PATH")||(this.type === "SHAPE")||(this.type === "CLIP"))
      {
        this.drawCmds.forEach(function(cmd){
          cmd.parms = cmd.parms.map(function(p){
            return [p[0] + x, p[1] + y];
          });
        });
      }
    }
    else
    {
      return {x:savThis.x + x, y:savThis.y + y};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function bender(args)  
  {
    var savThis = this,
        deg = args[0],
        A = deg*Math.PI/180, 
				sinA, cosA,
        max;

    if (this instanceof Obj2D)    // this transformer may be called on point object {x:, y: }
    {
      // calc the distance to the furthest node, it will rotate the full 'deg'
      max = this.drawCmds.reduce(function(acc, currCmd){
        currCmd.parms.forEach(function(coord){
          var d = Math.sqrt(coord[0]*coord[0] + coord[1]*coord[1]);
          if (d > acc)
          {
            acc = d;
          }
        });
        return acc;
      }, 0);
      // calc the fraction of obj length to each node and rotate it by that fraction of 'deg'
      this.drawCmds.forEach(function(cmd){
        cmd.parms = cmd.parms.map(function(p){
          var r = Math.sqrt(p[0]*p[0] + p[1]*p[1]), // distance of p from dwg org
              fracA = A*r/(max);                    // fraction of angle is fraction of node distance from dwg org
          sinA = Math.sin(-fracA);
          cosA = Math.cos(-fracA);

          return [p[0]*cosA + p[1]*sinA, -p[0]*sinA + p[1]*cosA];  // rotate each node by some fraction of total angle
        });
      });
    }
    else
    {
      sinA = Math.sin(-deg*Math.PI/180);    // just do a rotate
      cosA = Math.cos(-deg*Math.PI/180);
      return {x:savThis.x*cosA + savThis.y*sinA, y:-savThis.x*sinA + savThis.y*cosA}; // return an Object {x:, y: }
    }
  }

  function skewer(args)    
  {
    // Skew matrix, angles in degrees applied before translate or revolve
    var savThis = this,
        ha = args[0] || 0,
        va = args[1] || 0,
        rad = Math.PI/180.0,
				htn	= Math.tan(-ha*rad),
				vtn	= Math.tan(va*rad),
				skewMat = [[1,   vtn, 0],
									 [htn, 1,   0],
									 [0,   0,   1]];

    if (this instanceof Obj2D)    // this transformer may be called on point object {x:, y: }
    {
      this.ofsTfm.applyTransform(skewMat);
      if ((this.type === "PATH")||(this.type === "SHAPE")||(this.type === "CLIP"))
      {
        this.drawCmds.forEach(function(cmd){
          cmd.parms = cmd.parms.map(function(p){
            return [p[0] + p[1]*htn, p[0]*vtn + p[1]];
          });
        });
      }
    }
    else
    {
      return {x:savThis.x + savThis.y*htn, y:savThis.x*vtn + savThis.y};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function scaler(args)      // will be called with 'this' pointing to an Obj2D
  {
    // scale matrix, applied before translate or revolve
    var savThis = this,
        sx = args[0] || 1,
        sy = args[1] || sx,
				sclMat = [[sx, 0, 0],
									[0, sy, 0],
									[0,  0, 1]];

    if (this instanceof Obj2D)
    {
      this.ofsTfm.applyTransform(sclMat);
      if ((this.type === "PATH")||(this.type === "SHAPE")||(this.type === "CLIP"))
      {
        this.drawCmds.forEach(function(cmd){
          cmd.parms = cmd.parms.map(function(p){
            return [p[0]*sx, p[1]*sy];
          });
        });
      }
      // save scaling to handle lineWidth
      this.savScale *= sx;
    }
    else    // this transformer may be called on point object {x:, y: }
    {
      return {x:savThis.x*sx, y:savThis.y*sy};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function rotater(args)      // will be called with 'this' pointing to an Obj2D or point {x:, y: }
  {
    // rotate matrix, angles in degrees applied before translate or revolve
    var savThis = this,
        angle = args[0] || 0,
        rad = Math.PI/180.0,
				s	= Math.sin(-angle*rad),
				c	= Math.cos(-angle*rad),
				rotMat = [[c, -s, 0],
									[s,  c, 0],
									[0,  0, 1]];

    if (this instanceof Obj2D)
    {
      this.ofsTfm.applyTransform(rotMat);
      if ((this.type === "PATH")||(this.type === "SHAPE")||(this.type === "CLIP"))
      {
        this.drawCmds.forEach(function(cmd){
          cmd.parms = cmd.parms.map(function(p){
            return [p[0]*c + p[1]*s, -p[0]*s + p[1]*c];
          });
        });
      }
    }
    else     // this transformer may be called on point object {x:, y: }
    {
      return {x:savThis.x*c + savThis.y*s, y:-savThis.x*s + savThis.y*c};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function revolver(args)      // will be called with 'this' pointing to an Obj2D or point {x:, y: }
  {
    // Rotate matrix, angles in degrees can be applied after tranlation away from World Coord origin
    var savThis = this,
        angle = args[0] || 0,
        rad = Math.PI/180.0,
				s	= Math.sin(-angle*rad),
				c	= Math.cos(-angle*rad),
				revMat = [[c, -s, 0],
									[s,  c, 0],
									[0,  0, 1]];

    if (this instanceof Obj2D)
    {
      this.ofsTfm.applyTransform(revMat);
      if ((this.type === "PATH")||(this.type === "SHAPE")||(this.type === "CLIP"))
      {
        // calc the fraction of obj length to each node and rotate it by that fraction of 'deg'
        this.drawCmds.forEach(function(cmd){
          cmd.parms = cmd.parms.map(function(p){
            return [p[0]*c + p[1]*s, -p[0]*s + p[1]*c];
          });
        });
      }
    }
    else  // point
    {
      return {x:savThis.x*c + savThis.y*s, y:-savThis.x*s + savThis.y*c};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function Distorter(type, fn)  // and other arguments
  {
    var argAry = Array.prototype.slice.call(arguments).slice(2);     // skip type and fn parameters save the rest

    this.type = type;
    this.distortFn = fn;
    this.args = argAry;     // array of arguments
  }

  function TfmTools(obj)
  {
    var savThis = this;

    this.parent = obj;
    // container for to add transforming methods to a Group2D or Obj2D
    // each method adds Distorter Object to the ofsTfmAry to be applied to the Obj2D when rendered
    this.translate = function(tx, ty)
    {
      var trnsDstr = new Distorter("TRN", translater, tx, ty);
      savThis.parent.ofsTfmAry.push(trnsDstr);
    };
    this.scale = function(scaleX, scaleY)
    {
      var sclDstr = new Distorter("SCL", scaler, scaleX, scaleY);
      savThis.parent.ofsTfmAry.unshift(sclDstr);
    };
    this.rotate = function(deg)
    {
      var rotDstr = new Distorter("ROT", rotater, deg);
      savThis.parent.ofsTfmAry.unshift(rotDstr);
    };
    this.skew = function(degH, degV)
    {
      var skwDstr = new Distorter("SKW", skewer, degH, degV);
      savThis.parent.ofsTfmAry.unshift(skwDstr);
    };
    this.revolve = function(deg)
    {
      var revDstr = new Distorter("REV", revolver, deg);
      savThis.parent.ofsTfmAry.push(revDstr);
    };
    this.bend = function(deg)   
    {
      var bendDstr = new Distorter("BND", bender, deg);
      savThis.parent.ofsTfmAry.unshift(bendDstr);
    };
    this.reset = function()
    {
      savThis.parent.ofsTfmAry = [];
      savThis.parent.ofsTfm.reset();  // reset the accumulation matrix
    };
  }

  Group2D = function()
  {
    this.type = "GRP";                    // enum of type to instruct the render method
    this.parent = null;                   // pointer to parent group if any
    this.children = [];                   // only Groups have children
    this.dwgOrg = {x:0, y:0};             // drawing origin (0,0) may get translated
    this.ofsTfmAry = [];                  // transforms re-built after render
    this.netTfmAry = [];
    this.ofsTfm = new TransformMatrix();  // sum total of ofsTfmAry actions
    this.netTfm = new TransformMatrix();
    // enable grp.transform.rotate etc. API
    this.transform = new TfmTools(this);
    // add any objects passed by forwarding them to addObj
    this.addObj.apply(this, arguments);
  };

  Group2D.prototype.deleteObj = function(obj)
  {
    // remove from children array
    var idx = this.children.indexOf(obj);

    if (idx >= 0)
    {
      this.children.splice(idx, 1);
    }
  };

  Group2D.prototype.addObj = function()
  {
    var args = Array.prototype.slice.call(arguments), // grab array of arguments
        i, j;
    for (i=0; i<args.length; i++)
    {
      if (isArray(args[i]))
      {
        // check that only Groups or Obj2Ds are passed
        for (j=0; j<args[i].length; j++)
        {
          if (args[i][j].type)
          {
            // point the Obj2D or Group2D parent property at this Group2D
            if (args[i][j].parent !== null)      // already a member of a Group2D, remove it
            {
              args[i][j].parent.deleteObj(args[i][j]);
            }
            args[i][j].parent = this;           // now its a free agent link it to this group
            this.children.push(args[i][j]);
            // enable drag and drop if this group has drag
            if (!args[i][j].dragNdrop && this.dragNdrop)
            {
              args[i][j].dragNdrop = this.dragNdrop;
            }
          }
        }
      }
      else
      {
        if (args[i].type)
        {
          // point the Obj2D or Group2D parent property at this Group2D
          if (args[i].parent !== null)       // already a member of a Group2D, remove it
          {
            args[i].parent.deleteObj(args[i]);
          }
          args[i].parent = this;            // now its a free agent link it to this group
          this.children.push(args[i]);
          // enable drag and drop if this group has drag
          if (!args[i].dragNdrop && this.dragNdrop)
          {
            args[i].dragNdrop = this.dragNdrop;
          }
        }
      }
    }
  };

  /*======================================
   * Recursively apply a hard translation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.translate = function(x, y)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else
        {
          childNode.translate(x, y);
        }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard rotation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.rotate = function(degs)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else
        {
          childNode.rotate(degs);
        }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard skew
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.skew = function(degH, degV)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else
        {
          childNode.skew(degH, degV);
        }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard scale
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.scale = function(xsc, ysc)
  {
    var xScl = xsc,
        yScl = ysc ||xScl;

    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else
        {
          childNode.scale(xScl, yScl);
        }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively add drag object to Obj2D
   * decendants.
   * When rendered all these Obj2D will be
   * added to dragObjects to be checked on
   * mousedown
   *-------------------------------------*/
  Group2D.prototype.enableDrag = function(grabFn, dragFn, dropFn)
  {
    var savThis = this;

  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else   // Obj2D
        {
          if (childNode.dragNdrop === null)    // don't over-write if its already assigned a handler
          {
            childNode.enableDrag(grabFn, dragFn, dropFn);
            childNode.dragNdrop.target = savThis;     // the Group2D is the target being dragged
          }
        }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Disable dragging on Obj2D children
   *-------------------------------------*/
  Group2D.prototype.disableDrag = function()
  {
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  			if (childNode.type === "GRP")
        {
  				iterate(childNode);
        }
        else
        {
          childNode.disableDrag();
        }
  		});
  	}

    iterate(this);
  };

  function ClipPath(commands)
  {
    this.type = "CLIP";               // type string to instruct the render method
    this.drawCmds = cgo2DtoDrawCmd(commands);   // send the Cgo2D (SVG) commands off to the Cgo2D (SVG) processor
    this.hardOfsTfm = new TransformMatrix();  // hard offset from any parent Group2D's transform
    this.lineWidthWC = null;          // not used by Clip but referenced in scale method (which is inherited by Path and Shape)
    this.savScale = 1;                // not used by Clip but referenced in scale method (which is inherited by Path and Shape)
  }

  ClipPath.prototype.applyHardOfsTfm = function()
  {
    var savThis = this;
    // apply hardOfsTfm for CLIP, PATH and SHAPE Obj2Ds immediately so appendPath and revWinding are valid
    this.drawCmds.forEach(function(cmd){
      cmd.parms = cmd.parms.map(function(p){    // assumes p is a 2 element array [x, y]
        var tp = transformPoint(p[0], p[1], savThis.hardOfsTfm.matrix);
        return [tp.x, tp.y];
      });
      cmd.parmsOrg = clone(cmd.parms);  // do a deep copy of the new array of arrays
    });

    // to avoid applying twice, reset the hardOfsTfm to identity matrix
    this.hardOfsTfm.reset();
  };

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipPath.prototype.translate = function(x, y)
  {
    this.hardOfsTfm.applyTransform(translateMatrix(x, y));
    this.applyHardOfsTfm();
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipPath.prototype.rotate = function(degs)
  {
    this.hardOfsTfm.applyTransform(rotateMatrix(degs));
    this.applyHardOfsTfm();
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipPath.prototype.skew = function(degH, degV)
  {
    this.hardOfsTfm.applyTransform(skewMatrix(degH, degV));
    this.applyHardOfsTfm();
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipPath.prototype.scale = function(xScl, yScl)
  {
    this.hardOfsTfm.applyTransform(scaleMatrix(xScl, yScl));
    this.applyHardOfsTfm();
    if (this.lineWidthWC)
    {
      this.lineWidthWC *= xScl;
    }
  };

  ClipPath.prototype.appendPath = function(obj, delMove)
  {
    var dcs = clone(obj.drawCmds);  // make new element not references

    if (delMove)  // delete the inital 'moveTo' command
    {
      this.drawCmds = this.drawCmds.concat(dcs.slice(1));
    }
    else
    {
      this.drawCmds = this.drawCmds.concat(dcs);
    }
  };

  function Path(commands)
  {
    // build all the ClipPath properties and assign them to this Object's properties
    ClipPath.call(this, commands);

    this.type = "PATH";               // type string to instruct the render method
    this.dragNdrop = null;
    // properties set by setProperty method, if undefined render uses Cango2D default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;            // render will stroke a path in this color
    this.lineWidth = null;            // in pixels will not scale with xscl changes or cobj.scale
    this.lineCap = null;              // round butt or square
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
    // dashed line properties
    this.dashed = null;
    this.dashOffset = 0;
  }

  Path.prototype = new ClipPath();       // make the ClipPath methods the methods of this Path object

  Path.prototype.revWinding = function()
  {
    // reverse the direction of drawing around a path, stops holes in shapes being filled
    var cmds,
        zCmd = null,
        revCmds = [],
        k, len,
        dParms, dCmd;

    function revPairs(ary)
    {
      // return a single array of x,y coords made by taking array of [x,y] arrays and reversing the order
      // eg. [[1,2], [3,4], [5,6]] returns [5,6,3,4,1,2]
      return ary.reduceRight(function(acc, curr){
        acc.push(curr[0], curr[1]);
        return acc;
      }, []);
    }

    if (this.drawCmds[this.drawCmds.length-1].drawFn === "closePath")
    {
      cmds = this.drawCmds.slice(0, -1);  // leave off 'closePath'
      zCmd = this.drawCmds.slice(-1);
    }
    else
    {
      cmds = this.drawCmds.slice(0);  // copy the whole array
    }
    // now step back along the path
    k = cmds.length-1;    // k points at the last segment DrawCmd
    len = cmds[k].parms.length;  // length of last DrawCmd's parms array
    dCmd = new DrawCmd("moveTo", cmds[k].parms[len-1]);   // make a 'M' command from final coord pair
    revCmds.push(dCmd);         // make this the first command of the output
    cmds[k].parms = cmds[k].parms.slice(0,-1);  // weve used the last point so slice it off
    while (k>0)
    {
      dParms = revPairs(cmds[k].parms);   // dParms is a flat array
      len = cmds[k-1].parms.length;       // find the last DrawCmd of the next segment back
      dParms = dParms.concat(cmds[k-1].parms[len-1]); // add the last point of next cmd
      dCmd = new DrawCmd(cmds[k].drawFn, dParms);     // construct the DrawCmd for this segment
      revCmds.push(dCmd);                             // shove it out
      cmds[k-1].parms = cmds[k-1].parms.slice(0,-1);  // weve used the last point so slice it off
      k--;
    }
    // add the 'z' if it was a closed path
    if (zCmd)
    {
      revCmds.push(zCmd);
    }

    this.drawCmds = revCmds;
  };

  function Shape(commands)
  {
    // build all the Path properties and assign them to this Object's properties
    Path.call(this, commands);

    this.type = "SHAPE";
    this.fillCol = null;              // only used if type == SHAPE
  }

  Shape.prototype = new Path();       // make the Path methods the methods of this Shape object

  function Img(imgData)
  {
    this.type = "IMG";
    if (typeof imgData === "string")
    {
      this.drawCmds = imgData;      // URL passed save it for loading
      this.imgBuf = new Image();    // pointer to the Image object when image is loaded
      this.imgBuf.src = imgData;    // start loading the image immediately
    }
    else if (imgData instanceof Image)
    {
      this.imgBuf = imgData;        // pre-loaded Image passed
      this.drawCmds = imgData.src;  // save the URL
    }
    this.parent = null;               // pointer to parent group if any
    this.bBoxCmds = [];               // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};         // drawing origin (0,0) may get translated
    this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;                  //     "
    this.imgLorgX = 0;                //     "
    this.imgLorgY = 0;                //     "
    this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
    this.dragNdrop = null;
    this.hardOfsTfm = new TransformMatrix();  // hard offset from any parent Group2D's transform
    // properties set by setProperty method, if undefined render uses Cango2D default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;            // render will stroke a path in this color
    this.lineWidthWC = null;          // in case border is wanted
    this.lineWidth = null;
    this.lineCap = null;              // round, butt or square
    this.savScale = 1;                // save accumulated scale factors to correct lineWidth of borders and shadows
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
  }

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.translate = function(x, y)
  {
    this.hardOfsTfm.applyTransform(translateMatrix(x, y));
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.rotate = function(degs)
  {
    this.hardOfsTfm.applyTransform(rotateMatrix(degs));
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.skew = function(degH, degV)
  {
    this.hardOfsTfm.applyTransform(skewMatrix(degH, degV));
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.scale = function(xScl, yScl)
  {
    this.hardOfsTfm.applyTransform(scaleMatrix(xScl, yScl));
    if (this.lineWidthWC)
    {
      this.lineWidthWC *= xScl;
    }

    this.savScale *= xScl;
  };

  Img.prototype.formatImg = function()
  {
    var wid, hgt, wid2, hgt2,
        dx = 0,
        dy = 0,
        ulx, uly, llx, lly, lrx, lry, urx, ury,
        lorgWC;

    if (!this.imgBuf.width)
    {
      console.log("in image onload handler yet image NOT loaded!");
    }
    if (this.width && this.height)
    {
      wid = this.width;
      hgt = this.height;
    }
    else if (this.width && !this.height)  // width only passed height is auto
    {
      wid = this.width;
      hgt = this.height || wid*this.imgBuf.height/this.imgBuf.width;  // default keep aspect ratio
    }
    else if (this.height && !this.width)  // height only passed width is auto
    {
      hgt = this.height;
      wid = this.width || hgt*this.imgBuf.width/this.imgBuf.height;    // default to keep aspect ratio
    }
    else    // no width or height default to natural size;
    {
      wid = this.imgBuf.width;    // default to natural width if none passed
      hgt = this.imgBuf.height;   // default to natural height if none passed
    }
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, 0],    [wid2, 0],   [wid, 0],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, hgt],  [wid2, hgt],  [wid, hgt]];
    if (lorgWC[this.lorg] !== undefined)
    {
      dx = -lorgWC[this.lorg][0];
      dy = -lorgWC[this.lorg][1];
    }
    this.imgLorgX = dx;     // world coords offset to drawing origin
    this.imgLorgY = dy;
    this.width = wid;   // in case it was not set and natural used
    this.height = hgt;
    // construct the DrawCmds for the text bounding box
    ulx = dx; uly = dy;
    llx = dx; lly = dy+hgt;
    lrx = dx+wid; lry = dy+hgt;
    urx = dx+wid; ury = dy;
    this.bBoxCmds[0] = new DrawCmd("moveTo", [ulx, -uly]);
    this.bBoxCmds[1] = new DrawCmd("lineTo", [llx, -lly]);
    this.bBoxCmds[2] = new DrawCmd("lineTo", [lrx, -lry]);
    this.bBoxCmds[3] = new DrawCmd("lineTo", [urx, -ury]);
    this.bBoxCmds[4] = new DrawCmd("closePath", []);
  };

  function Text(txtString)
  {
    this.type = "TEXT";               // type string to instruct the render method
    this.parent = null;               // pointer to parent group if any
    this.drawCmds = txtString;        // just store the text String
    this.bBoxCmds = [];               // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};         // drawing origin (0,0) may get translated
    this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;                  //     "
    this.imgLorgX = 0;                //     "
    this.imgLorgY = 0;                //     "
    this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
    this.dragNdrop = null;
    this.hardOfsTfm = new TransformMatrix();  // hard offset from any parent Group2D's transform
    // properties set by setProperty method, if undefined render uses Cango2D default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.fillCol = null;              // only used if type == SHAPE or TEXT
    this.strokeCol = null;            // render will stroke a path in this color
    this.fontSize = null;             // fontSize in pixels (TEXT only)
    this.fontSizeZC = null;           // fontSize zoom corrected, scaled for any change in contrext xscl
    this.fontWeight = null;           // fontWeight 100..900 (TEXT only)
    this.fontFamily = null;           // (TEXT only)
    this.lineWidthWC = null;          // in case border is wanted
    this.lineWidth = null;
    this.lineCap = null;              // round, butt or square
    this.savScale = 1;                // save accumulated scale factors to correct lineWidth of borders and shadows
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
  }

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.translate = function(x, y)
  {
    this.hardOfsTfm.applyTransform(translateMatrix(x, y));
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.rotate = function(degs)
  {
    this.hardOfsTfm.applyTransform(rotateMatrix(degs));
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.skew = function(degH, degV)
  {
    this.hardOfsTfm.applyTransform(skewMatrix(degH, degV));
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.scale = function(xScl, yScl)
  {
    this.hardOfsTfm.applyTransform(scaleMatrix(xScl, yScl));
    if (this.lineWidth)
    {
      this.lineWidth /= xScl;
    }
  };

  Text.prototype.formatText = function(gc)
  {
    var fntSz = this.fontSize || gc.fontSize,     // fontSize in pxls
        fntFm = this.fontFamily || gc.fontFamily,
        fntWt = this.fontWeight || gc.fontWeight,
        lorg = this.lorg || 1,
        wid, hgt,   // Note: char cell is ~1.4*fontSize pixels high
        wid2, hgt2,
        lorgWC,
        dx = 0,
        dy = 0,
        ulx, uly, llx, lly, lrx, lry, urx, ury,
        fntScl;

    // support for zoom and pan
    if (!this.orgXscl)
    {
      // first time drawn save the scale
      this.orgXscl = gc.xscl;
    }
    fntScl = gc.xscl/this.orgXscl;   // scale for any zoom factor
    this.fontSizeZC = fntSz*fntScl;
    // set the drawing context to measure the size
    gc.ctx.save();
    gc.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    wid = 1.05*gc.ctx.measureText(this.drawCmds).width;   // drawCmds = text string to render, add 5% for linewidth effects
    gc.ctx.restore();

    wid *= fntScl;      // convert to world coords
    hgt = fntSz*fntScl;  // TEXT dimensions are 'iso', height from bottom of decender to top of capitals
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, 0],    [wid2, 0],    [wid, 0]];
    if (lorgWC[lorg] !== undefined)
    {
      dx = -lorgWC[lorg][0];
      dy = lorgWC[lorg][1];
    }
    this.imgLorgX = dx;      // pixel offsets to drawing origin
    this.imgLorgY = dy-0.25*hgt;  // correct for alphabetic baseline, its offset about 0.25*char height
    this.width = wid;
    this.height = hgt;

    // construct the DrawCmds for the text bounding box (world coords)
    ulx = dx;
    uly = dy;
    llx = dx;
    lly = dy-hgt;
    lrx = dx+wid;
    lry = dy-hgt;
    urx = dx+wid;
    ury = dy;
    this.bBoxCmds[0] = new DrawCmd("moveTo", [ulx, -uly]);
    this.bBoxCmds[1] = new DrawCmd("lineTo", [llx, -lly]);
    this.bBoxCmds[2] = new DrawCmd("lineTo", [lrx, -lry]);
    this.bBoxCmds[3] = new DrawCmd("lineTo", [urx, -ury]);
    this.bBoxCmds[4] = new DrawCmd("closePath", []);
  };

  Obj2D = function(data, objtype, options)
  {
    var classObj,    // default to a Path type Cobj
        objClass,
        opt, prop;

    switch (objtype)
    {
      default:
      case "PATH":
        classObj = Path;
        break;
      case "SHAPE":
        classObj = Shape;
        break;
      case "IMG":
        classObj = Img;
        break;
      case "TEXT":
        classObj = Text;
        break;
      case "CLIP":
        classObj = ClipPath;
        break;
    }

    // build all the properties of the Object and make them properties of this Cobj
    classObj.call(this, data);
    // make an instance of the Object type so we can inherit its methods
    objClass = new classObj();
    for (prop in objClass)
    {
      if (typeof objClass[prop] === "function")    // copy references to the methods only
      {
        this[prop] = objClass[prop];
      }
    }

    this.parent = null;                       // pointer to parent group if any
    this.dwgOrg = {x:0, y:0};                 // drawing origin (0,0) may get translated
    // properties handling transform inheritance
    this.ofsTfmAry = [];                      // soft offset from any parent Group2D's transform
    this.netTfmAry = [];                      // ofsTfmAry with grpTfmAry concatinated
    this.ofsTfm = new TransformMatrix();      // product of hard & ofs tfm actions, filled in at render
    this.netTfm = new TransformMatrix();      // parent Group2D netTfm applied to this.ofsTfm
    this.zIndex = 0;                          // depth sort on this
    // enable obj.transform.rotate etc. API
    this.transform = new TfmTools(this);

    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        this.setProperty(prop, opt[prop]);
      }
    }
  };

  Obj2D.prototype.enableDrag = function(grabFn, dragFn, dropFn)
  {
    this.dragNdrop = new Drag2D(grabFn, dragFn, dropFn);
    // fill in the Drag2D properties for use by callBacks
    this.dragNdrop.target = this;
  };

  Obj2D.prototype.disableDrag = function()
  {
    var aidx;

    if (!this.dragNdrop)
    {
      return;
    }
    // remove this object from array to be checked on mousedown
    aidx = this.dragNdrop.layer.dragObjects.indexOf(this);
    this.dragNdrop.layers.dragObjects.splice(aidx, 1);
    this.dragNdrop = null;
  };

  Obj2D.prototype.setProperty = function(propertyName, value)
  {
    var lorgVals = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if ((typeof propertyName !== "string")||(value === undefined)||(value === null)||(this.type === "CLIP"))
    {
      return;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        this.fillCol = value;
        break;
      case "strokecolor":
        this.strokeCol = value;
        break;
      case "linewidth":
      case "strokewidth":                 // for backward compatability
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidth = value;
        }
        break;
      case "linewidthwc":
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidthWC = value;
        }
        break;
      case "linecap":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "butt")||(value ==="round")||(value === "square"))
        {
          this.lineCap = value;
        }
        break;
      case "dashed":
        if (Array.isArray(value) && value[0])
        {
          this.dashed = value;
        }
        else     // setDashed() will clear dashed settings
        {
          this.dashed = null;
        }
        break;
      case "dashoffset":
        this.dashOffset = value || 0;
        break;
      case "border":
        if (value === true)
        {
          this.border = true;
        }
        if (value === false)
        {
          this.border = false;
        }
        break;
      case "fontsize":
        if ((typeof value === "number")&&(value > 0))
        {
          this.fontSize = value;
        }
        break;
      case "fontweight":
        if ((typeof value === "string")||((typeof value === "number")&&(value>=100)&&(value<=900)))
        {
          this.fontWeight = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      case "imgwidth":
        this.width = Math.abs(value);
        break;
      case "imgheight":
        this.height = Math.abs(value);
        break;
      case "lorg":
        if (lorgVals.indexOf(value) !== -1)
        {
          this.lorg = value;
        }
        break;
      case "zindex":
        this.zIndex = 1*value;   // force it to be a number
        break;
      case "shadowoffsetx":
        this.shadowOffsetX = value || 0;
        break;
      case "shadowoffsety":
        this.shadowOffsetY = value || 0;
        break;
      case "shadowblur":
        this.shadowBlur = value || 0;
        break;
      case "shadowcolor":
        this.shadowColor = value;
        break;
      default:
        return;
    }
  };

  Obj2D.prototype.dup = function()
  {
    var newObj = new Obj2D();

    newObj.type = this.type;
    newObj.drawCmds = clone(this.drawCmds);
    newObj.imgBuf = this.imgBuf;         // just copy reference
    newObj.bBoxCmds = clone(this.bBoxCmds);
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.hardOfsTfm = clone(this.hardOfsTfm);  // hard offset from any parent Group2D's transform
    newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group2D's transform
    newObj.border = this.border;
    newObj.strokeCol = this.strokeCol;
    newObj.fillCol = this.fillCol;
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.savScale = this.savScale;
    newObj.dashed = this.dashed;
    newObj.dashOffset = this.dashOffset;
    newObj.width = this.width;
    newObj.height = this.height;
    newObj.imgLorgX = this.imgLorgX;
    newObj.imgLorgY = this.imgLorgY;
    newObj.lorg = this.lorg;
    newObj.fontSize = this.fontSize;
    newObj.fontWeight = this.fontWeight;
    newObj.fontFamily = this.fontFamily;
    newObj.zIndex = this.zIndex;                  // depth sort on this
    newObj.shadowOffsetX = this.shadowOffsetX;
    newObj.shadowOffsetY = this.shadowOffsetY;
    newObj.shadowBlur = this.shadowBlur;
    newObj.shadowColor = this.shadowColor;
    // The other objects are dynamic, calculated at render

    return newObj;         // return a object which inherits Obj2D properties
  };

  function transformCtx(ctx, xfm)  // apply a matrix transform to a canvas 2D context
  {
    if (xfm === undefined)
    {
      ctx.setTransform(1, 0, 0,
                       0, 1, 0);
    }
    else
    {
      ctx.setTransform(xfm.matrix[0][0], xfm.matrix[0][1], xfm.matrix[1][0],
                       xfm.matrix[1][1], xfm.matrix[2][0], xfm.matrix[2][1]);
    }
  }

//===============================================================================

  function Animation(id, gc, obj, initFn, pathFn, options)
  {
    var prop;

    this.id = id;
    this.gc = gc;        // the Cango context to do the drawing
    this.obj = obj;
    // each obj2d in the family tree knows how to generate the frame tranforms given the localTime value
    this.pathFn = pathFn;    // root object (Obj2D or Group2D) of scene to be draw
    this.options = options;
    this.currState = {time:0};  // any user defined properties can be added to this
    this.nextState = {time:0};  // generated by the pathFn (becomes the currState after frame is drawn)
    this.gc.ctx.save();
    if (typeof initFn === "function")
    {
      initFn.call(this, options);  // call object creation code
    }
    // draw the object as setup by initFn (pathFn not called yet)
    this.gc.render(this.obj);
    this.gc.resetClip();    // if init calls clipPath, it must be reset so next frame doesn't combine clip areas
    this.gc.ctx.restore();  // if initFn makes changes to ctx restore to pre-initFn state
		this.obj.ofsTfmAry = []; // clearout the ofsTfmAry pathFn will build a new one
    // now it has been drawn save the currState values (nextState values are generated by pathFn)
    for (prop in this.nextState)   // if initFn creates new properties, make currState match
    {
      if (this.nextState.hasOwnProperty(prop))
      {
        this.currState[prop] = this.nextState[prop];
      }
    }
  }

  // this is the actual animator that draws the frame
  function drawFrame(timeline)
  {
		var localTime,
				temp,
				prevAt = null,
				clearIt = false,
				time = Date.now();    // use this as a time stamp, browser don't all pass the same time code

		if (timeline.prevAnimMode === timeline.modes.STOPPED)
		{
			timeline.startTime = time - timeline.startOfs;                // forces localTime = 0 to start from beginning
		}
		localTime =  time - timeline.startTime;
		
		// step through all the animation tasks
		timeline.animTasks.forEach(function(at){
			if (at.gc.cId !== prevAt)
			{
				// check for new layer, only clear a layer once, there maybe several Cango contexts on each canvas
				clearIt = true;
				prevAt = at.gc.cId;
			}
			at.gc.ctx.save();
			// if re-starting after a stopAnimation reset the currState.time so pathFn doesn't get negative time between frames
			if (timeline.prevAnimMode === timeline.modes.STOPPED)
			{
				at.currState.time = 0;    // avoid -ve dT (=localTime-currState.time) in pathFn
			}
      // handle clearCanvas here in case pathFn calls clipPath
      if (clearIt)
      {
        at.gc.clearCanvas();
      }
			if (typeof(at.pathFn) === 'function')  // static objects may have null or undefined
			{
				at.pathFn.call(at, localTime, at.options);
			}
			at.gc.render(at.obj);
			clearIt = false;
			at.gc.resetClip();   // if pathFn calls clipPath, it must be reset so next frame doesn't combine clip areas
			at.gc.ctx.restore(); // if pathFn changes any ctx properties restore to pre pathFn state
			// now swap the currState and nextState vectors (pathFn may use currState to gen nextState)
			temp = at.currState;
			at.currState = at.nextState; // save current state vector, pathFn will use it
			at.nextState = temp;
			// save the draw time for pathFn
			at.currState.time = localTime;  // save the localtime along the timeline for use by pathFn
		});

		timeline.currTime = localTime;      // timestamp of what is currently on screen
 	}
	
  function Timeline()
  {
    this.animTasks = [];    // each layer can push an Animation object in here
    this.timer = null;                // need to save the rAF id for cancelling
    this.modes = {PAUSED:1, STOPPED:2, PLAYING:3, STEPPING:4};     // animation modes
    this.animMode = this.modes.STOPPED;
    this.prevAnimMode = this.modes.STOPPED;
    this.startTime = 0;               // animation start time (relative to 1970)
    this.startOfs = 0;                // used if play calls with non-zero start time
    this.currTime = 0;                // timestamp of frame on screen
    this.stepTime = 50;               // animation step time interval (in msec)
  }

  Timeline.prototype.stopAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STOPPED;
    // reset the currTime so play and step know to start again
    this.currTime = 0;
    this.startOfs = 0;
  };

  Timeline.prototype.pauseAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PAUSED;
  };

  Timeline.prototype.stepAnimation = function()
  {
    var savThis = this;

    // this is the actual animator that draws the frame
    function drawIt()
    {
      drawFrame(savThis);
      savThis.prevAnimMode = savThis.modes.PAUSED;
      savThis.animMode = savThis.modes.PAUSED;
		}

    // eqivalent to play for one frame and pause
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    if (this.animMode === this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STEPPING;

    setTimeout(drawIt, this.stepTime);
  };

  Timeline.prototype.redrawAnimation = function()
  {
    // eqivalent to play for one frame and pause
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn

    drawFrame(this);
  };

  Timeline.prototype.playAnimation = function(startOfs, stopOfs)
  {
    var savThis = this;

    // this is the actual animator that draws each frame
    function drawIt()
    {
      drawFrame(savThis);
      savThis.prevAnimMode = savThis.modes.PLAYING;
      if (stopOfs)
      {
        if (savThis.currTime < stopOfs)
        {
          savThis.timer = window.requestAnimationFrame(drawIt);
        }
        else
        {
          savThis.stopAnimation();     // go back to start of time line
        }
      }
      else
      {
        savThis.timer = window.requestAnimationFrame(drawIt);   // go forever
      }
    }

    this.startOfs = startOfs || 0;
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    if (this.animMode === this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PLAYING;

    this.timer = window.requestAnimationFrame(drawIt);
  };
	
	//===============================================================================

  function Layer(canvasID, canvasElement)
  {
    this.id = canvasID;
    this.cElem = canvasElement;
    this.dragObjects = [];
  }

  function getLayer(cgo)
  {
    var i, lyr = cgo.bkgCanvas.layers[0];

    for (i=1; i < cgo.bkgCanvas.layers.length; i++)
    {
      if (cgo.bkgCanvas.layers[i].id === cgo.cId)
      {
        lyr = cgo.bkgCanvas.layers[i];
        break;
      }
    }
    return lyr;    // Layer object
  }

  function initDragAndDrop(savThis)
  {
    function dragHandler(evt)
    {
      var event = evt || window.event,
          csrPos, testObj, nLyrs, lyr,
          j, k;

      function getCursorPos(e)
      {
        // pass in any mouse event, returns the position of the cursor in raw pixel coords
        var rect = savThis.cnvs.getBoundingClientRect();

        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
      }

      function hitTest(pathObj, csrX, csrY)
      {
        // create the path (don't stroke it - no-one will see) to test for hit
        savThis.ctx.beginPath();
        if ((pathObj.type === 'TEXT')||(pathObj.type === 'IMG'))   // use bounding box not drawCmds
        {
          pathObj.bBoxCmds.forEach(function(dCmd){
            savThis.ctx[dCmd.drawFn].apply(savThis.ctx, dCmd.parmsPx);
          });
        }
        else
        {
          pathObj.drawCmds.forEach(function(dCmd){
            savThis.ctx[dCmd.drawFn].apply(savThis.ctx, dCmd.parmsPx);
          });
        }
/*
    // for diagnostics on hit region, uncomment
    savThis.ctx.strokeStyle = 'red';
    savThis.ctx.lineWidth = 4;
    savThis.ctx.stroke();
*/
        return savThis.ctx.isPointInPath(csrX, csrY);
      }

      csrPos = getCursorPos(event);  // savThis is any Cango ctx on the canvas
      nLyrs = savThis.bkgCanvas.layers.length;
      // run through all the registered objects and test if cursor pos is in their path
      loops:      // label to break out of nested loops
      for (j = nLyrs-1; j >= 0; j--)       // search top layer down the stack
      {
        lyr = savThis.bkgCanvas.layers[j];
        for (k = lyr.dragObjects.length-1; k >= 0; k--)  // search from last drawn to first (underneath)
        {
          testObj = lyr.dragObjects[k];
          if (hitTest(testObj, csrPos.x, csrPos.y))
          {
            // call the grab handler for this object (check it is still enabled)
            if (testObj.dragNdrop)
            {
              testObj.dragNdrop.grab(event, testObj);
              break loops;
            }
          }
        }
      }
    }

    // =========== Start Here ===========

    savThis.cnvs.onmousedown = dragHandler;   // added to all layers but only top layer will catch events
  }

  function Cango2D(canvasId)
  {
    var savThis = this,
        bkgId, bkgL;

    function resizeLayers()
    {
      var j, ovl,
          t = savThis.bkgCanvas.offsetTop + savThis.bkgCanvas.clientTop,
          l = savThis.bkgCanvas.offsetLeft + savThis.bkgCanvas.clientLeft,
          w = savThis.bkgCanvas.offsetWidth,
          h = savThis.bkgCanvas.offsetHeight;

      // kill off any animations on resize (else they stil contiune along with any new ones)
      if (savThis.bkgCanvas.timeline && savThis.bkgCanvas.timeline.animTasks.length)
      {
        savThis.deleteAllAnimations();
      }
      // fix all Cango contexts to know about new size
      savThis.rawWidth = w;
      savThis.rawHeight = h;
      savThis.aRatio = w/h;
      // there may be multiple Cango contexts a layer, try to only fix actual canvas properties once
      if (savThis.bkgCanvas !== savThis.cnvs)
      {
        return undefined;
      }
      savThis.cnvs.setAttribute('width', w);    // reset canvas pixels width
      savThis.cnvs.setAttribute('height', h);   // don't use style for this
      // step through the stack of canvases (if any)
      for (j=1; j<savThis.bkgCanvas.layers.length; j++)  // bkg is layer[0]
      {
        ovl = savThis.bkgCanvas.layers[j].cElem;
        if (ovl)
        {
          ovl.style.top = t+'px';
          ovl.style.left = l+'px';
          ovl.style.width = w+'px';
          ovl.style.height = h+'px';
          ovl.setAttribute('width', w);    // reset canvas pixels width
          ovl.setAttribute('height', h);   // don't use style for this
        }
      }
    }

    this.cId = canvasId;
    this.cnvs = document.getElementById(canvasId);
    if (this.cnvs === null)
    {
      alert("can't find canvas "+canvasId);
      return undefined;
    }
    this.bkgCanvas = this.cnvs;  // this is a background canvas so bkgCanvas points to itself
    // check if this is a context for an overlay
    if (canvasId.indexOf("_ovl_") !== -1)
    {
      // this is an overlay. get a reference to the backGround canvas
      bkgId = canvasId.slice(0,canvasId.indexOf("_ovl_"));
      this.bkgCanvas = document.getElementById(bkgId);
    }
    this.rawWidth = this.cnvs.offsetWidth;
    this.rawHeight = this.cnvs.offsetHeight;
    this.aRatio = this.rawWidth/this.rawHeight;
    if (!this.bkgCanvas.hasOwnProperty('layers'))
    {
      // create an array to hold all the overlay canvases for this canvas
      this.bkgCanvas.layers = [];
      // make a Layerobject for the bkgCanvas
      bkgL = new Layer(this.cId, this.cnvs);
      this.bkgCanvas.layers[0] = bkgL;
      // make sure the overlay canvases always match the bkgCanvas size
      addEvent(this.bkgCanvas, 'resize', resizeLayers);
    }
    if ((typeof Timeline !== "undefined") && !this.bkgCanvas.hasOwnProperty('timeline'))
    {
      // create a single timeline for all animations on all layers
      this.bkgCanvas.timeline = new Timeline();
    }
    if (!this.cnvs.hasOwnProperty('resized'))
    {
      // make canvas native aspect ratio equal style box aspect ratio.
      // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
      this.cnvs.setAttribute('width', this.rawWidth);    // reset canvas pixels width
      this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
      this.cnvs.resized = true;
    }
    this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
    this.vpW = this.rawWidth;         // vp width in pixels (no more viewport so use full canvas)
    this.vpH = this.rawHeight;        // vp height in pixels, canvas height = width/aspect ratio
    this.vpLLx = 0;                   // vp lower left of viewport (not used) from canvas left, in pixels
    this.vpLLy = this.rawHeight;      // vp lower left of viewport from canvas top
    this.xscl = 1;                    // world x axis scale factor, default: pixels
    this.yscl = -1;                   // world y axis scale factor, +ve up (always -xscl since isotropic)
    this.xoffset = 0;                 // world x origin offset from viewport left in pixels
    this.yoffset = 0;                 // world y origin offset from viewport bottom in pixels
    this.savWC = {"xscl":this.xscl,
                  "yscl":this.yscl,
                  "xoffset":this.xoffset,
                  "yoffset":this.yoffset};  // save world coords for zoom/pan
    this.ctx.textAlign = "left";      // all offsets are handled by lorg facility
    this.ctx.textBaseline = "alphabetic";
    this.penCol = "rgba(0, 0, 0, 1.0)";           // black
    this.penWid = 1;                  // pixels
    this.lineCap = "butt";
    this.paintCol = "rgba(128, 128, 128, 1.0)";   // gray
    this.fontSize = 12;               // pixels
    this.fontWeight = 400;            // 100..900, 400 = normal,700 = bold
    this.fontFamily = "Consolas, Monaco, 'Andale Mono', monospace";
    this.clipCount = 0;               // count clipPath calls for use by resetClip

    this.worldToPixel = new TransformMatrix();

    this.getUnique = function()
    {
      uniqueVal += 1;     // a private 'global'
      return uniqueVal;
    };

    initDragAndDrop(this);
  }

  Cango2D.prototype.animate = function(obj, init, path, options)
  {
    var animObj,
        animId;

    animId = this.cId+"_"+this.getUnique();
    animObj = new Animation(animId, this, obj, init, path, options);
    // push this into the Cango animations array
    this.stopAnimation();   // make sure we are not still running an old animation
    this.bkgCanvas.timeline.animTasks.push(animObj);

    return animObj.id;   // so the animation just created can be deleted if required
  };

  Cango2D.prototype.pauseAnimation = function()
  {
    this.bkgCanvas.timeline.pauseAnimation();
  };

  Cango2D.prototype.playAnimation = function(startTime, stopTime)
  {
    this.bkgCanvas.timeline.playAnimation(startTime, stopTime);
  };

  Cango2D.prototype.stopAnimation = function()
  {
    this.bkgCanvas.timeline.stopAnimation();
  };

  Cango2D.prototype.stepAnimation = function()
  {
    this.bkgCanvas.timeline.stepAnimation();
  };

  Cango2D.prototype.deleteAnimation = function(animId)
  {
    var idx = -1,
        i;

    this.pauseAnimation();   // pause all animations
    for (i=0; i<this.bkgCanvas.timeline.animTasks.length; i++)
    {
      if (this.bkgCanvas.timeline.animTasks[i].id === animId)
      {
        idx = i;
        break;
      }
    }
    if (idx === -1)
    {
      // not found
      return;
    }
    this.bkgCanvas.timeline.animTasks.splice(idx,1);       // delete the animation object
  };

  Cango2D.prototype.deleteAllAnimations = function()
  {
    this.stopAnimation();
    this.bkgCanvas.timeline.animTasks = [];
  };

  Cango2D.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    var xPx = this.vpLLx+this.xoffset+x*this.xscl,
        yPx = this.vpLLy+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango2D.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    var xW = (xPx - this.vpLLx - this.xoffset)/this.xscl,
        yW = (yPx - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango2D.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    var e = evt||window.event,
        rect = this.cnvs.getBoundingClientRect(),
        xW = (e.clientX - rect.left - this.vpLLx - this.xoffset)/this.xscl,
        yW = (e.clientY - rect.top - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango2D.prototype.clearCanvas = function(fillColor)
  {
    var savThis = this,
        layerObj;

    function genLinGrad(lgrad)
    {
      var p1 = savThis.toPixelCoords(lgrad.grad[0], lgrad.grad[1]),
          p2 = savThis.toPixelCoords(lgrad.grad[2], lgrad.grad[3]),
          grad = savThis.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);

      lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function genRadGrad(rgrad)
    {
      var p1 = savThis.toPixelCoords(rgrad.grad[0], rgrad.grad[1]),
          r1 = rgrad.grad[2]*savThis.xscl,
          p2 = savThis.toPixelCoords(rgrad.grad[3], rgrad.grad[4]),
          r2 = rgrad.grad[5]*savThis.xscl,
          grad = savThis.ctx.createRadialGradient(p1.x, p1.y, r1, p2.x, p2.y, r2);

      rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    if (fillColor)
    {
      this.ctx.save();
      if (fillColor instanceof LinearGradient)
      {
        this.ctx.fillStyle = genLinGrad(fillColor);
      }
      else if (fillColor instanceof RadialGradient)
      {
        this.ctx.fillStyle = genRadGrad(fillColor);
      }
      else
      {
        this.ctx.fillStyle = fillColor;
      }
      this.ctx.fillRect(0, 0, this.rawWidth, this.rawHeight);
      this.ctx.restore();
    }
    else
    {
      this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
    }
    // all drawing erased, but graphics contexts remain intact
    // clear the dragObjects array, draggables put back when rendered
    layerObj = getLayer(this);
    layerObj.dragObjects.length = 0;
  };

  Cango2D.prototype.setWorldCoords = function(lowerLeftX, lowerLeftY, spanX)
  {
    var vpLLxWC = lowerLeftX || 0,     // viewport lower left x in world coords
        vpLLyWC = lowerLeftY || 0;     // viewport lower left y in world coords
    if ((spanX === undefined) || (spanX <= 0))
    {
      this.xscl = 1;                    // use pixel units
    }
    else
    {
      this.xscl = this.vpW/spanX;
    }
    this.yscl = -this.xscl;             // isotropic scale
    this.xoffset = -vpLLxWC*this.xscl;
    this.yoffset = -vpLLyWC*this.yscl;
    // save these values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango2D.prototype.setPropertyDefault = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.paintCol = value;
        }
        break;
      case "strokecolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.penCol = value;
        }
        break;
      case "linewidth":
      case "strokewidth":
        this.penWid = value;
        break;
      case "linecap":
        if ((typeof value === "string")&&((value === "butt")||(value ==="round")||(value === "square")))
        {
          this.lineCap = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      case "fontsize":
        this.fontSize = value;
        break;
      case "fontweight":
        if ((typeof value === "string")||((value >= 100)&&(value <= 900)))
        {
          this.fontWeight = value;
        }
        break;
      case "steptime":
        if ((value >= 15)&&(value <= 500))
        {
          this.stepTime = value;
        }
        break;
      default:
        return;
    }
  };

  // this method allows the Object Group2D to be passed the Cango2D environment if necessary
  Cango2D.prototype.createGroup2D = function()
  {
    var grp = new Group2D();
    grp.addObj.apply(grp, arguments);

    return grp;
  };

  Cango2D.prototype.dropShadow = function(obj, scl)
  {
    var xOfs = obj.shadowOffsetX || 0,
        yOfs = obj.shadowOffsetY || 0,
        radius = obj.shadowBlur || 0,
        color = obj.shadowColor || "#000000",
        xScale = scl || 1,
        yScale = scl || 1;

    if (this.ctx.shadowOffsetX !== undefined)     // check if supported
    {
      xScale *= this.xscl;
      yScale *= -this.xscl;

      this.ctx.shadowOffsetX = xOfs*xScale;
      this.ctx.shadowOffsetY = yOfs*yScale;
      this.ctx.shadowBlur = radius*xScale;
      this.ctx.shadowColor = color;
    }
  };

  /*=============================================
   * render will draw a Group2D or Obj2D.
   * If an Obj2D is passed, update the netTfm
   * and render it.
   * If a Group2D is passed, recursively update
   * the netTfm of the group's family tree,
   * then render all Obj2Ds.
   *--------------------------------------------*/
  Cango2D.prototype.render = function(rootObj, clear)
  {
    var savThis = this,
        objAry; 

    function applyXfms(obj)
    {
      var grpTfmAry, grpTfm;

      if (obj.parent)
      {
        grpTfmAry = obj.parent.netTfmAry;    // grpTfm is always netTfm of the parent Group2D
        grpTfm = obj.parent.netTfm;
      }
      else                                   // must be the rootObj has no parent
      {
        grpTfmAry = [];
        grpTfm = new TransformMatrix();
      }
      obj.ofsTfm.reset();       // clear out previous transforms
      // now generate the group's netTfm which will be passed on to its kids (start with empty array)
      obj.netTfmAry = obj.ofsTfmAry.concat(grpTfmAry);
      // apply the transforms to the dwgOrg of the Group2 or the Obj2D
      obj.dwgOrg = {x:0, y:0};
      obj.netTfmAry.forEach(function(dtr){
        // call the user distort fn to do the distorting now
        obj.dwgOrg = dtr.distortFn.call(obj.dwgOrg, dtr.args);
      });
      if (obj.type !== "GRP")    // must be a Obj2D
      {
        if ((obj.type === "PATH")||(obj.type === "SHAPE")||(obj.type === "CLIP"))
        {
          // reset the parms to original for each render
          obj.drawCmds.forEach(function(dc){
            dc.parms = clone(dc.parmsOrg);
          });  // make a copy
        }
        // apply the net transform to the obj2D (rotate, scale, skew and bend first, while dwgOrg is 0,0
        obj.netTfmAry.forEach(function(dtr){
					// call the user distort fn to do the distorting now
					dtr.distortFn.call(obj, dtr.args);
        });
        // update the matrix transforms for TEXT obj, IMG obj and gradient fills
        obj.netTfm.matrix = matrixMult(obj.hardOfsTfm.matrix, obj.ofsTfm.matrix); // apply softTfm to hardTfm
        obj.netTfm.applyTransform(grpTfm.matrix);     // apply inherited group tfms
      }
    }

    function recursiveApplyXfms()
    {
      var flatAry = [];

      // task:function, grp: group with children
    	function iterate(task, obj)
    	{
     		task(obj);
    	  if (obj.type === "GRP")    // find Obj2Ds to draw
        {
      		obj.children.forEach(function(childNode){
    				iterate(task, childNode);
    		  });
        }
        else
        {
          flatAry.push(obj);       // just push into the array to be drawn
        }
    	}
      // now propagate the current grpXfm through the tree of children
      iterate(applyXfms, rootObj);

      return flatAry;
    }

    function paintersSort(p1, p2)
    {
      return p1.zIndex - p2.zIndex;
    }

    function processObj2D(obj)
    {
      function imgLoaded()
      {
        obj.formatImg();
        savThis.paintImg(obj);
      }

      if (obj.type === "IMG")
      {
        if (obj.imgBuf.complete)    // see if already loaded
        {
          imgLoaded();
        }
        else
        {
          addEvent(obj.imgBuf, 'load', imgLoaded);
        }
      }
      else if (obj.type === "TEXT")
      {
        obj.formatText(savThis);
        savThis.paintText(obj);
      }
      else if (obj.type === "CLIP")
      {
        savThis.applyClipMask(obj);
      }
      else    // PATH, SHAPE
      {
        savThis.paintPath(obj);
      }
    }

  	function iterativeReset(obj)
  	{
   		obj.transform.reset();
      obj.savScale = 1;          // reset accumulated scaling
  	  if (obj.type === "GRP")    // find Obj2Ds to draw
      {
    		obj.children.forEach(function(childNode){
  				iterativeReset(childNode);
  		  });
      }
  	}

// ============ Start Here =====================================================

    if (clear === true)
    {
      this.clearCanvas();
    }
    if (rootObj.type === "GRP")
    {
      // recursively apply transforms and return the flattened tree as an array of Obj2D to be drawn
      objAry = recursiveApplyXfms();
      objAry.sort(paintersSort);   // Depth sort Obj2Ds within group
      // now render the Obj2Ds onto the canvas
      objAry.forEach(processObj2D);
    }
    else   // Obj2D
    {
      applyXfms(rootObj);
      // draw the single Obj2D onto the canvas
      processObj2D(rootObj);
    }
    // all rendering done so recursively reset the dynamic ofsTfmAry
    iterativeReset(rootObj);
  };

  Cango2D.prototype.paintImg = function(pathObj)
  {
    // should only be called after image has been loaded into drawCmds
    var savThis = this,
        tp,
        img = pathObj.imgBuf,  // this is the place the image is stored in object
        currLr, aidx;

    this.ctx.save();   // save the clean ctx
    // set up dropShadow if any
    this.dropShadow(pathObj, 1);
    // NOTE: these transforms get applied in reverse order
    this.worldToPixel.reset();   // reset to identity matrix
    // these transforms aprear as if in reverse order
    this.worldToPixel.applyTransform(scaleMatrix(1, -1));    // invert all world coords values
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix); // apply net translates, scale and rotations
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));    // world coords to pixels
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx + this.xoffset, this.vpLLy + this.yoffset)); //  viewport offset
    transformCtx(this.ctx, this.worldToPixel);
    // now insert the image scaled in  pixels
    this.ctx.drawImage(img, pathObj.imgLorgX, pathObj.imgLorgY, pathObj.width, pathObj.height);
    this.ctx.restore();    // undo the transforms
    // make a hitRegion boundary path around the image to be checked on mousedown
    pathObj.bBoxCmds.forEach(function(dCmd){
      if (dCmd.parms.length)    // last cmd is closePath has no parms
      {
        tp = transformPoint(dCmd.parms[0][0], dCmd.parms[0][1], pathObj.netTfm.matrix);
        dCmd.parmsPx[0] = savThis.vpLLx+savThis.xoffset+tp.x*savThis.xscl;
        dCmd.parmsPx[1] = savThis.vpLLy+savThis.yoffset+tp.y*savThis.yscl;
      }
    });
    if (pathObj.border)
    {
      this.ctx.beginPath();
      pathObj.bBoxCmds.forEach(function(dCmd){
        savThis.ctx[dCmd.drawFn].apply(savThis.ctx, dCmd.parmsPx);
      });
      // support for zoom and pan changing lineWidth
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.penWid;  // undo scaling in netTfm
      }
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      // if properties are undefined use Cango2D default
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.stroke();
    }

    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canvas
      currLr = getLayer(this);
      if (currLr !== pathObj.dragNdrop.layer)
      {
        if (pathObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = pathObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            pathObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      pathObj.dragNdrop.cgo = this;
      pathObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!pathObj.dragNdrop.layer.dragObjects.contains(pathObj))
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango2D.prototype.paintPath = function(pathObj)
  {
    // used for type: PATH, SHAPE
    var savThis = this,
        lineWd,
        col, gradFill,
        currLr, aidx,
        dashedPx = [],
        xsc = this.xscl;

    function genLinGrad(lgrad)
    {
      var p1x = lgrad.grad[0],
          p1y = lgrad.grad[1],
          p2x = lgrad.grad[2],
          p2y = lgrad.grad[3],
          grad = savThis.ctx.createLinearGradient(p1x, p1y, p2x, p2y);

      lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function genRadGrad(rgrad)
    {
      var p1x = rgrad.grad[0],
          p1y = rgrad.grad[1],
          r1 = rgrad.grad[2],
          p2x = rgrad.grad[3],
          p2y = rgrad.grad[4],
          r2 = rgrad.grad[5],
          grad = savThis.ctx.createRadialGradient(p1x, p1y, r1, p2x, p2y, r2);

      rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    this.ctx.save();   // save current context
    this.dropShadow(pathObj, 1); // set up dropShadow if any
    this.worldToPixel.reset();   // reset to identity matrix
    // convert world coordinates to pixel coords for raw canvas commands
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));  // isotropic (yscl = -xscl)
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset));
    transformCtx(this.ctx, this.worldToPixel);
    // now draw the path onto the canvas in pixel coords
    this.ctx.beginPath();
    pathObj.drawCmds.forEach(function(dCmd){
      var flatAry = [];   // start with new array
      dCmd.parms.forEach(function(coord){
        flatAry.push(coord[0], coord[1]);
      });
      savThis.ctx[dCmd.drawFn].apply(savThis.ctx, flatAry); // add the path segment
    });
    // apply the matrix transforms to canvas we stroke and fill
    this.ctx.save();   // save current context
    this.worldToPixel.reset();   // reset to identity matrix
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset));
    transformCtx(this.ctx, this.worldToPixel);   // scaled to pixels with all transforms applied
    if (pathObj.type === "SHAPE")
    {
      // if a SHAPE, fill with color
      col = pathObj.fillCol || this.paintCol;
      if (col instanceof LinearGradient)
      {
        gradFill = genLinGrad(col);
        this.ctx.fillStyle = gradFill;
      }
      else if (col instanceof RadialGradient)
      {
        gradFill = genRadGrad(col);
        this.ctx.fillStyle = gradFill;
      }
      else
      {
        this.ctx.fillStyle = col;
      }
      this.ctx.fill();
      // clear drop shadow its done (and we might want to stroke border)
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 0;
    }
    if ((pathObj.type === "PATH")|| pathObj.border)
    {
      // handle dashed lines
      if (pathObj.dashed)
      {
        pathObj.dashed.forEach(function(d, i){dashedPx[i] = d/xsc;});   // undo the effect of pixel scaling
        this.ctx.setLineDash(dashedPx);
        this.ctx.lineDashOffset = pathObj.dashOffset/xsc;
      }
      // support for zoom and pan changing line width
      if (pathObj.lineWidthWC)
      {
        lineWd = pathObj.lineWidthWC*xsc;
      }
      else
      {
        lineWd = pathObj.lineWidth/pathObj.savScale || this.penWid/pathObj.savScale;
      }
      this.ctx.lineWidth = lineWd/xsc;  // lineWidth in pixels and we are currently scaled to WC
      // pathObj.strokeCol may be a function that generates dynamic color (so call it)
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.stroke();
    }
    this.ctx.restore();   // undo the matrix transforms
    this.ctx.restore();   // undo world to pixels
    if (pathObj.dragNdrop !== null)
    {
      // generate the outline path in pixel coords for hit testing
      pathObj.drawCmds.forEach(function(dCmd){
        dCmd.parmsPx = [];
        dCmd.parms.forEach(function(coord){
          dCmd.parmsPx.push(savThis.vpLLx+savThis.xoffset+coord[0]*savThis.xscl);
          dCmd.parmsPx.push(savThis.vpLLy+savThis.yoffset+coord[1]*savThis.yscl);
        });
      });
      // update dragNdrop layer to match this canvas
      currLr = getLayer(this);
      if (currLr !== pathObj.dragNdrop.layer)
      {
        if (pathObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = pathObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            pathObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      pathObj.dragNdrop.cgo = this;
      pathObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!pathObj.dragNdrop.layer.dragObjects.contains(pathObj))
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango2D.prototype.applyClipMask = function(pathObj)
  {
    // used for type CLIP
    var savThis = this;

    this.ctx.save();
    // apply the matrix transforms to canvas we stroke and fill
    this.worldToPixel.reset();   // reset to identity matrix
    // convert world coordinates to pixel coords for raw canvas commands
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));  // isotropic (yscl = -xscl)
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset));
    transformCtx(this.ctx, this.worldToPixel);
    // now draw the path onto the canvas in pixel coords
    this.ctx.beginPath();
    pathObj.drawCmds.forEach(function(dCmd){
      var flatAry = [];   // start with new array
      dCmd.parms.forEach(function(coord){
        flatAry.push(coord[0], coord[1]);
      });
      savThis.ctx[dCmd.drawFn].apply(savThis.ctx, flatAry); // add the path segment
    });
    // apply the matrix transforms to canvas we stroke and fill
    this.worldToPixel.reset();   // reset to identity matrix
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset));
    transformCtx(this.ctx, this.worldToPixel);   // scaled to pixels with all transforms applied

    this.ctx.clip();
    this.clipCount++;
  };

  Cango2D.prototype.paintText = function(pathObj)
  {
    var savThis = this,
        tp,
        lineWd,
        fntWt, fntSz, fntFm,
        currLr, aidx;

    this.ctx.save();   // save the clean ctx
    // set up dropShadow if any
    this.dropShadow(pathObj, 1);  // compensate for world coord scaling
    this.worldToPixel.reset();   // reset to identity matrix



    this.worldToPixel.applyTransform(scaleMatrix(1/this.xscl, 1/this.yscl));    // text is in pixels, make it world coords
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);  // apply offsets scale and rotations (now in wolrd ccords)
    this.worldToPixel.applyTransform(scaleMatrix(this.xscl, this.yscl));       // world to pixels ready to renders
    this.worldToPixel.applyTransform(translateMatrix(this.vpLLx + this.xoffset, this.vpLLy + this.yoffset)); // move origin px
    transformCtx(this.ctx, this.worldToPixel);

    // if Obj2D fontWeight or fontSize undefined use Cango2D default
    fntWt = pathObj.fontWeight || this.fontWeight;
    fntSz = pathObj.fontSizeZC;        // font size in pixels corrected for any zoom scaling factor
    fntFm = pathObj.fontFamily || this.fontFamily;
    this.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    this.ctx.fillStyle = pathObj.fillCol || this.paintCol;
    this.ctx.fillText(pathObj.drawCmds, pathObj.imgLorgX, pathObj.imgLorgY); // imgLorgX,Y are in pixels for text
    if (pathObj.border)
    {
      // fill done, if dropShadow dont apply to the border (it will be on top of fill)
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 0;
      // support for zoom and pan changing lineWidth
      if (pathObj.lineWidthWC)
      {
        lineWd = pathObj.lineWidthWC*this.xscl;
      }
      else
      {
        lineWd = pathObj.lineWidth || this.penWid;
      }
      this.ctx.lineWidth = lineWd;  // lineWidth in pixels and we are currently scaled to WC
      // if properties are undefined use Cango2D default
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.strokeText(pathObj.drawCmds, pathObj.imgLorgX, pathObj.imgLorgY);
    }
    // undo the transforms
    this.ctx.restore();

    // make a hitRegion boundary path around the text to be checked on mousedown
    pathObj.bBoxCmds.forEach(function(dCmd){
      if (dCmd.parms.length)    // last cmd is closePath has no parms
      {
        tp = transformPoint(dCmd.parms[0][0]/savThis.xscl, dCmd.parms[0][1]/savThis.xscl, pathObj.netTfm.matrix);
        dCmd.parmsPx[0] = savThis.vpLLx+savThis.xoffset+tp.x*savThis.xscl;
        dCmd.parmsPx[1] = savThis.vpLLy+savThis.yoffset+tp.y*savThis.yscl;
      }
    });
    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canavs
      currLr = getLayer(this);
      if (currLr !== pathObj.dragNdrop.layer)
      {
        if (pathObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = pathObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            pathObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      pathObj.dragNdrop.cgo = this;
      pathObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!pathObj.dragNdrop.layer.dragObjects.contains(pathObj))
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango2D.prototype.drawPath = function(path, x, y, options)
  {
    var pathObj = new Obj2D(path, "PATH", options);

    if ((typeof x === 'number')&&(typeof y === 'number'))
    {
      pathObj.transform.translate(x, y);
    }
    this.render(pathObj);
  };

  Cango2D.prototype.drawShape = function(path, x, y, options)
  {
    // outline the same as fill color
    var pathObj = new Obj2D(path, "SHAPE", options);

    if ((typeof x === 'number')&&(typeof y === 'number'))
    {
      pathObj.transform.translate(x, y);
    }
    this.render(pathObj);
  };

  Cango2D.prototype.drawText = function(str, x, y, options)
  {
    var txtObj = new Obj2D(str, "TEXT", options);

    if ((typeof x === 'number')&&(typeof y === 'number'))
    {
      txtObj.transform.translate(x, y);
    }
    this.render(txtObj);
  };

  Cango2D.prototype.drawImg = function(imgRef, x, y, options)  // just load img then call render
  {
    var imgObj = new Obj2D(imgRef, "IMG", options);  // imgObj.drawCmds = new image object

    if ((typeof x === 'number')&&(typeof y === 'number'))
    {
      imgObj.transform.translate(x, y);
    }
    this.render(imgObj);
  };

  Cango2D.prototype.resetClip = function()
  {
    while (this.clipCount > 0)
    {
      this.ctx.restore();
      this.clipCount--;
    }
  };

  Cango2D.prototype.createLayer = function()
  {
    var ovlHTML, newCvs,
        w = this.rawWidth,
        h = this.rawHeight,
        unique, ovlId,
        nLyrs = this.bkgCanvas.layers.length,  // bkg is layer 0 so at least 1
        newL,
        topCvs;

    // do not create layers on overlays - only an background canvases
    if (this.cId.indexOf("_ovl_") !== -1)
    {
      // this is an overlay canvas - can't have overlays itself
      console.log("canvas layers can't create layers");
      return "";
    }

    unique = this.getUnique();
    ovlId = this.cId+"_ovl_"+unique;
    ovlHTML = "<canvas id='"+ovlId+"' style='position:absolute' width='"+w+"' height='"+h+"'></canvas>";
    topCvs = this.bkgCanvas.layers[nLyrs-1].cElem;  // eqv to this.cnvs.layers since only bkgCanavs can get here
    topCvs.insertAdjacentHTML('afterend', ovlHTML);
    newCvs = document.getElementById(ovlId);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.left = (this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft)+'px';
    newCvs.style.top = (this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop)+'px';
    // make it the same size as the background canvas
    newCvs.style.width = this.bkgCanvas.offsetWidth+'px';
    newCvs.style.height = this.bkgCanvas.offsetHeight+'px';
//    newCvs.style.pointerEvents = 'none';    // allow mouse events to pass down to bkgCanvas
    newL = new Layer(ovlId, newCvs);
    // save the ID in an array to facilitate removal
    this.bkgCanvas.layers.push(newL);

    return ovlId;    // return the new canvas id for call to new Cango(id)
  };

  Cango2D.prototype.deleteLayer = function(ovlyId)
  {
    var ovlNode, i;

    for (i=1; i<this.bkgCanvas.layers.length; i++)
    {
      if (this.bkgCanvas.layers[i].id === ovlyId)
      {
        ovlNode = this.bkgCanvas.layers[i].cElem;
        if (ovlNode)
        {
          // in case the CangoHTMLtext extension is used
          if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
          {
            ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
          }
          ovlNode.parentNode.removeChild(ovlNode);
        }
        // now delete layers array element
        this.bkgCanvas.layers.splice(i,1);       // delete the id
      }
    }
  };

  Cango2D.prototype.deleteAllLayers = function()
  {
    var i, ovlNode;

    for (i = this.bkgCanvas.layers.length-1; i>0; i--)   // don't delete layers[0] its the bakg canavs
    {
      ovlNode = this.bkgCanvas.layers[i].cElem;
      if (ovlNode)
      {
        // in case the CangoHTMLtext extension is used
        if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
        {
          ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
        }
        ovlNode.parentNode.removeChild(ovlNode);
      }
      // now delete layers array element
      this.bkgCanvas.layers.splice(i,1);
    }
  };

  // copy the basic graphics context values (for an overlay)
  Cango2D.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.vpW = src_graphCtx.vpW;          // vp width in pixels
    this.vpH = src_graphCtx.vpH;          // vp height in pixels
    this.vpLLx = src_graphCtx.vpLLx;      // vp lower left from canvas left in pixels
    this.vpLLy = src_graphCtx.vpLLy;      // vp lower left from canvas top
    this.xscl = src_graphCtx.xscl;        // world x axis scale factor
    this.yscl = src_graphCtx.yscl;        // world y axis scale factor
    this.xoffset = src_graphCtx.xoffset;  // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;  // world y origin offset from viewport bottom in pixels
    this.savWC = clone(src_graphCtx.savWC);
    this.penCol = src_graphCtx.penCol.slice(0);   // copy value not reference
    this.penWid = src_graphCtx.penWid;    // pixels
    this.lineCap = src_graphCtx.lineCap.slice(0);
    this.paintCol = src_graphCtx.paintCol.slice(0);
    this.fontSize = src_graphCtx.fontSize;
    this.fontWeight = src_graphCtx.fontWeight;
    this.fontFamily = src_graphCtx.fontFamily.slice(0);
  };

  /*----------------------------------------------------------
   * 'initZoomPan' creates a Cango context on the overlay
   * canvas whose ID is passed as 'zpControlId'.
   * All the Cango context that is to be zoomed or panned
   * is passed in 'gc'. 'gc' may be an array of Cango contexts
   * if more than one canvas layer needs zooming.
   * The user defined function 'redraw' will be called to
   * redraw all the Cobjs on all the canvases in the new
   * zoomed or panned size or position.
   *---------------------------------------------------------*/
  initZoomPan = function(zpControlsId, gc, redraw)
  {
    var arw = ['m',-7,-2,'l',7,5,7,-5],
        crs = ['m',-6,-6,'l',12,12,'m',0,-12,'l',-12,12],
        pls = ['m',-7,0,'l',14,0,'m',-7,-7,'l',0,14],
        mns = ['m',-7,0,'l',14,0],
        zin, zout, rst, up, dn, lft, rgt,
        zpGC, bkg, gAry;

    function zoom(z)
    {
      function zm(g)
      {
        var org = g.toPixelCoords(0, 0),
            cx = g.rawWidth/2 - org.x,
            cy = g.rawHeight/2 - org.y;

        g.xoffset += cx - cx/z;
        g.yoffset += cy - cy/z;
        g.xscl /= z;
        g.yscl /= z;
      }

      gAry.forEach(zm);
      redraw();
    }

    function pan(sx, sy)
    {
      function pn(g)
      {
        g.xoffset -= sx;
        g.yoffset -= sy;
      }

      gAry.forEach(pn);
      redraw();
    }

    function resetZoomPan()
    {
      function rstzp(g)
      {
        g.xscl = g.savWC.xscl;
        g.yscl = g.savWC.yscl;
        g.xoffset = g.savWC.xoffset;
        g.yoffset = g.savWC.yoffset;
      }

      gAry.forEach(rstzp);
      redraw();
    }

    zpGC = new Cango2D(zpControlsId);
    // Zoom controls
    zpGC.clearCanvas();
    zpGC.setWorldCoords(-zpGC.rawWidth+44,-zpGC.rawHeight+44);

    // make a shaded rectiange for the controls
    bkg = new Obj2D(shapeDefs.rectangle(114, 80), "SHAPE", {fillColor: "rgba(0, 50, 0, 0.12)"});
    bkg.translate(-17, 0);
    zpGC.render(bkg);

    rst = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    rst.enableDrag(null, null, resetZoomPan);
    zpGC.render(rst);

    rgt = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    // must always enable DnD before rendering !
    rgt.enableDrag(null, null, function(){pan(50, 0);});
    rgt.translate(22, 0);
    zpGC.render(rgt);

    up = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    up.enableDrag(null, null, function(){pan(0, -50);});
    up.translate(0, 22);
    zpGC.render(up);

    lft = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    lft.enableDrag(null, null, function(){pan(-50, 0);});
    lft.translate(-22, 0);
    zpGC.render(lft);

    dn = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    dn.enableDrag(null, null, function(){pan(0, 50);});
    dn.translate(0, -22);
    zpGC.render(dn);

    zin = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    zin.enableDrag(null, null, function(){zoom(1/1.2);});
    zin.translate(-56, 11);
    zpGC.render(zin);

    zout = new Obj2D(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    zout.enableDrag(null, null, function(){zoom(1.2);});
    zout.translate(-56, -11);
    zpGC.render(zout);

    zpGC.setPropertyDefault("strokeColor", "white");
    zpGC.setPropertyDefault("lineWidth", 2);
    arw = new Obj2D(['m',-7,-2,'l',7,5,7,-5], "PATH");
    arw.transform.translate(0,22);
    zpGC.render(arw);
    arw.transform.translate(22,0);
    arw.transform.rotate(-90);
    zpGC.render(arw);
    arw.transform.translate(-22,0);
    arw.transform.rotate(90);
    zpGC.render(arw);
    arw.transform.translate(0,-22);
    arw.transform.rotate(180);
    zpGC.render(arw);
    zpGC.drawPath(pls, -56,11);
    zpGC.drawPath(mns, -56,-11);
    zpGC.drawPath(crs);

    if (Array.isArray(gc))
    {
      gAry = gc;
    }
    else
    {
      gAry = [];
      gAry[0] = gc;
    }
  };

  svgToCgo2D = svgParser.svg2cartesian;

  return Cango2D;
}());
