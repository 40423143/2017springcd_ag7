/*=================================================================
  Filename: Cango-8v03.js
  Rev: 8
  By: A.R.Collins
  Description: A graphics library for the canvas element.
  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/CanvasGraphics.html>
  Report bugs to tony at arc.id.au

  Date   |Description                                          |By
  -----------------------------------------------------------------
  14Oct12 Rev 1.00 First release based on Cango0v43             ARC
  29Nov12 Released as Cango2v00                                 ARC
  06May14 Released as Cango4v00                                 ARC
  14Jul14 Released as Cango-5v00                                ARC
  09Feb15 Released as Cango-6v00                                ARC
  20Mar15 Released as Cango-7v00                                ARC
  23Mar15 Change to late Image load                             ARC
  09Aug15 Created Path,Shape,Img & Text types                   ARC
          Don't wait till render time to load images            ARC
  21Sep15 bugfix: IMG and TEXT translate Y coord sign flipped   ARC
  28Sep15 bugfix: toImgObj putting Image in drawCmds not imgBuf ARC
  14Nov15 Kill all animations on resize
          Rename Timeline to avoid global conflicts             ARC
  16Nov15 Bad declaration of Cango                              ARC
  20Nov15 Make resetClip behave as 2012 Canvas Spec: count
          clipPath calls and call same number of ctx.restore's.
          clipPath now takes x,y,scl,rot parms                  ARC
  27Nov15 Check for undefined in array of Cobj to be rendered   ARC
  29Nov15 Support pre-loaded Image as IMG Cobj data             ARC
          bugfix: window.resize should be this.cnvs.resize      ARC
  04Dec15 bugfix: cnvs.resize should be this.bkgCanvas.resize
          also prevet duplicate calls of resize handler         ARC
  05Dec15 bugfix: If buffered, multi Cango contexts on a canvas
          make multiple off screen buffer canvases              ARC
  17Dec15 Add Cobj.fontSizeWC to support zoom&pan of TEXT Cobj  ARC
  18Dec15 Add Cobj.lineWidthWC which scales (lineWidth doesn't) ARC
  21Dec15 Don't let dropShadow scale.
          Released as Cango-8v00                                ARC
  23Dec15 Add arrow and arrowArc to shapeDefs                   ARC
  02Jan16 Don't set Cobj.lineWidth else Cango.penWid is ignored ARC
  21Jan16 bugfix: lineWidthWC not scaling with Img.scale        ARC
  =================================================================*/

var Cango, Cobj, LinearGradient, RadialGradient, DrawCmd, svgToCgoRHC, svgToCgoSVG, cgoRHCtoSVG, shapeDefs;

(function() {
  "use strict";

  var uniqueVal = 0,  // used to generate unique value for different Cango instances
      svgParser,
      cgo2DtoDrawCmd;

  function addEvent(element, eventType, handler)
  {
    if (element.attachEvent)
    {
     return element.attachEvent('on'+eventType, handler);
    }
    return element.addEventListener(eventType, handler, true);
  }

  function clone(orgItem)
  {
    var newItem = (Array.isArray(orgItem)) ? [] : {},
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

  function isArray(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isNumber(o)
  {
    return !isNaN(o) && o !== null && o !== "" && o !== false;
  }

  function flatten(obj)
  {
    if (!isArray(obj))
    {
      return([obj]);
    }
    return obj.reduce(function(prev, curr) {
      var more = [].concat(curr).some(isArray);
      return prev.concat(more ? flatten(curr) : curr);
    },[]);
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
      svg2cgosvg: function(svgStr, xShft, yShft) {
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
                      .reduce(flatten2Dary, []);
      },
      cartesian2svg: function(cgoAry){
        return cgoAry.reduce(unExtend, [])
                     .reduce(svgCmdSplitter, [])
                     .reduce(toAbsoluteCoords, [])
                     .map(flipCoords)
                     .reduce(flatten2Dary, []).toString();
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

  svgToCgoRHC = svgParser.svg2cartesian;

  svgToCgoSVG = svgParser.svg2cgosvg;

  cgoRHCtoSVG = svgParser.cartesian2svg;

  cgo2DtoDrawCmd = svgParser.cgo2drawcmds;

  if (shapeDefs === undefined)
  {
    shapeDefs = {
      'circle': function(diameter){
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
                  var m = 0.55228475,                 // magic number for drawing circle with 4 Bezier curve
                      r;
                  if ((rad === undefined)||(rad<=0))
                  {
                    return ["m",-w/2,-h/2, "l",w,0, 0,h, -w,0, 'z'];
                  }
                  r = Math.min(w/2, h/2, rad);
                  return ["m", -w/2+r,-h/2, "l",w-2*r,0,  "c",m*r,0, r,(1-m)*r, r,r,
                                            "l",0,h-2*r,  "c",0,m*r,(m-1)*r,r,-r,r,
                                            "l",-w+2*r,0, "c",-m*r,0,-r,(m-1)*r,-r,-r,
                                            "l",0,-h+2*r, "c",0,-m*r,(1-m)*r,-r,r,-r];},

      'triangle': function(side){
                  var s = side || 1;
                  return ['m', 0.5*s, -0.289*s, 'l', -0.5*s, 0.866*s, -0.5*s, -0.866*s, 'z'];},

      'cross': function(width){
                  var w = width || 1;
                  return ['m', -0.5*w, 0, 'l', w, 0, 'm', -0.5*w, -0.5*w, 'l', 0, w];},

      'ex': function(diagonal){
                  var d = diagonal || 1;
                  return ['m', -0.3535*d,-0.3535*d, 'l',0.707*d,0.707*d,
                          'm',-0.707*d,0, 'l',0.707*d,-0.707*d];},

      'arrow': function(sx, sy, ex, ey, shaftWidth, headSize, gc){
                  function Point(px, py){ return {x:px, y:py};}
                  function dist(p1, p2){ return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));}
                  function rotatePoint(p, rads){   // rotate a 2D point by 'rads' radians
                    var sinA = Math.sin(rads),
                        cosA = Math.cos(rads);
                    return {x: p.x*cosA - p.y*sinA, y: p.x*sinA + p.y*cosA};
                  }
                  function translatePoint(p, dx, dy){ return {x: p.x + dx, y: p.y + dy};}

                  var y2xUnits = 1, // converts world coords Y axis units to X axis units
                      lineWid = shaftWidth || 1,
                      hdSize = headSize || 4,
                      ds = 0.5*lineWid,               // half width of shaft
                      dx = (ex-sx),                   // x component of shaft length
                      dy = (ey-sy),                   // y component
                      theta = 0,                      // angle of the arrow to x axis
                      headAng = 21*Math.PI/180.0,     // half included angle of arrow head = 21deg
                      edgeLen = hdSize*lineWid,   // X axis units
                      headLen = edgeLen*Math.cos(headAng),       // length of arrow head along shaft
                      org, tip,
                      len,
                      p1, p2, p3, p4, p5, p6, t,
                      arwData, arwRotated,
                      arrowDef;

                  if (gc instanceof Cango)
                  {
                    y2xUnits = Math.abs(gc.yscl/gc.xscl);
                    dy *= y2xUnits;
                  }
                  theta = Math.atan2(dy, dx);           // angle of the arrow to x axis
                  // work in X axis units - and always draw with 'iso' true
                  org = new Point(sx, sy*y2xUnits);
                  tip = new Point(ex, ey*y2xUnits);
                  len = dist(org, tip);
                  // draw the arrow along the x axis
                  p1 = new Point(0, ds);
                  p2 = new Point(len-headLen, ds);
                  p3 = new Point(p2.x, edgeLen*Math.sin(headAng));
                  t = new Point(len, 0);
                  p4 = new Point(p3.x, -p3.y);
                  p5 = new Point(p2.x, -p2.y);
                  p6 = new Point(p1.x, -p1.y);
                  arwData = [p1, p2, p3, t, p4, p5, p6];
                  // rotate array of points by theta then translate drawing origin to sx, sy
                  arwRotated = arwData.map(function(p){
                                              var pRot = rotatePoint(p, theta),
                                                  pTrns = translatePoint(pRot, org.x, org.y);
                                              return pTrns; });
                  // convert to simple array
                  arrowDef = arwRotated.reduce(function(acc, curr){
                                              acc.push(curr.x, curr.y);
                                              return acc; }, ["M"]);     // start with an 'M' command
                  // insert the "L" at start of the line segments just for clarity (works fine without this)
                  arrowDef.splice(3, 0, "L");
                  arrowDef.push("Z");  // close the path for future filling

                  return arrowDef; },

      'arrowArc': function(r, startAngle, stopAngle, clockwise, shaftWidth, headSize, gc){
                  // This will create an arc centred on (0,0) radius r, from angle 'startA' to 'stopA' (deg)
                  // arrow head will be at stop end only, arrow head in proportion to shaftWidth
                  function to360(a)
                  {
                    while (a<0)
                    {
                      a += 360;
                    }
                    while (a>=360)
                    {
                      a -= 360;
                    }
                    return parseFloat(a);    // force a float
                  }

                  var startA = to360(startAngle),   // move angle to 0..360
                      stopA = to360(stopAngle),
                      sweep = clockwise? 1: 0,
                      angSweep = (startA > stopA)? 1: 0,  // 1 = CW 0 = CCW
                      rad = Math.PI/180,
                      lineWid = shaftWidth || 1,
                      hdSize = headSize || 4,
                      ds = 0.5*lineWid,
                      r1 = r-ds,
                      r2 = r+ds,
                      // now tweek the head size for different line widths for looks only
                      headSpanWC = 0.95*hdSize*lineWid, // length of arrow head along arc (in world coords)
                      headSpanRad = headSpanWC/r,       // length of arrow head in radians
                      stopRad, startRad,
                      span,
                      spanRad,
                      lrg,
                      baseA,
                      tx, ty,               // tip x,y
                      qr1, qr2,             // radii of tips of barbs
                      q1x, q1y, q2x, q2y,   // tips of arrow barbs
                      b1x, b1y, e1x, e1y,
                      b2x, b2y, e2x, e2y,
                      sgnY = -1;

                  span = angSweep? startA - stopA: stopA - startA;
                  if ((angSweep && !sweep)||(!angSweep && sweep))     // XOR = going the wrong way round
                  {
                    // default is the wrong direction switch direction
                    span = 360 - span;
                  }
                  spanRad = rad*span;
                  lrg = (span>180)? 1: 0;
                  // make sure spna is bigger than arrow head
                  if (headSpanRad > spanRad)   // make arc at least as big as the requested head size
                  {
                    headSpanRad = spanRad;
                  }
                  // handle the inverted coord where Cango must reverse direction to maintain the sweep=CW convention
                  if ((gc instanceof Cango) && (gc.yscl>0))
                  {
                    lrg = 1 - lrg;
                    sgnY = 1;
                  }
                  else
                  {
                    sweep = 1 - sweep;
                  }
                  // construct the nodes of the arrow shape
                  stopRad = sgnY*rad*stopA;
                  startRad = sgnY*rad*startA;
                  baseA = sweep? stopRad-sgnY*headSpanRad: stopRad+sgnY*headSpanRad;  // angle at base of arrow head
                  qr1 = r-0.35*headSpanWC;             // 0.34 is sin 21deg tilt angle of head sides
                  qr2 = r+0.35*headSpanWC;

                  b1x = r1*Math.cos(startRad);
                  b1y = r1*Math.sin(startRad)*sgnY;
                  e1x = r1*Math.cos(baseA);
                  e1y = r1*Math.sin(baseA)*sgnY;
                  b2x = r2*Math.cos(startRad);
                  b2y = r2*Math.sin(startRad)*sgnY;
                  e2x = r2*Math.cos(baseA);
                  e2y = r2*Math.sin(baseA)*sgnY;
                  tx = r*Math.cos(stopRad);
                  ty = r*Math.sin(stopRad)*sgnY;
                  q1x = qr1*Math.cos(baseA);
                  q1y = qr1*Math.sin(baseA)*sgnY;
                  q2x = qr2*Math.cos(baseA);
                  q2y = qr2*Math.sin(baseA)*sgnY;

                  return ["M", b2x,b2y, "A",r2,r2,0,lrg,sweep,e2x,e2y, "L", q2x,q2y, "A",qr2,qr2,0,0,sweep,tx,ty, "A",qr1,qr1,0,0,1-sweep,q1x,q1y, "L",e1x,e1y, "A",r1,r1,0,lrg,1-sweep,b1x,b1y, "Z"]; }
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

  DrawCmd = function(cmdStr, coords)   // canvas syntax draw commands
  {
    // coords = world coordinates in [cp1x,cp1y, cp2x,cp2y, ... x,y]
    var i;

    this.drawFn = cmdStr;       // String version of the canvas command to call
    this.parms = [];
    for (i=0; i<coords.length; i+=2)
    {
      this.parms.push(coords.slice(i, i+2));
    }
    this.parmsPx = [];          // parms transformed into pixel coords
  };

  function Path(commands)
  {
    this.type = "PATH";
    this.drawCmds = cgo2DtoDrawCmd(commands);
    // send the Cgo2D (SVG) commands off to the canvas DrawCmd processor
    this.dwgOrg = {x:0, y:0};       // drawing origin (0,0) may get translated
    this.dragNdrop = null;
    // properties set by setProperty if undefined render uses Cango default
    this.iso = false;               // true = maintain aspect ratio
    this.border = false;            // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;          // renderer will stroke a path and shape outline in this color
    this.lineWidth = null;          // in pixels will not scale with xscl changes or cobj.scale
    this.lineWidthWC = null;        // line width in world coordinates, it scales with drawing (overrides lineWidth)
    this.lineCap = null;            // round butt or square
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
    // dashed line properties
    this.dashed = null;
    this.dashOffset = 0;
  }

  Path.prototype.translate = function(x, y)
  {
    this.drawCmds.forEach(function(cmd){
      cmd.parms = cmd.parms.map(function(p){
        return [p[0] + x, p[1] + y];  // assumes p is a 2 element array [x, y]
      });
    });
  };

  Path.prototype.rotate = function(degs)
  {
    var A = Math.PI*degs/180.0,   // radians
        sinA = Math.sin(A),
        cosA = Math.cos(A);

    this.drawCmds.forEach(function(cmd){
      cmd.parms = cmd.parms.map(function(p){
        return [p[0]*cosA - p[1]*sinA, p[0]*sinA + p[1]*cosA];  // assumes p is a 2 element array [x, y]
      });
    });
  };

  Path.prototype.scale = function(xScl, yScl)
  {
    var xScale = xScl || 1,
        yScale = yScl || xScale;   // default to isotropic scaling

    this.drawCmds.forEach(function(cmd){
      cmd.parms = cmd.parms.map(function(p){
        return [p[0]*xScale, p[1]*yScale];  // assumes p is a 2 element array [x, y]
      });
    });
    if (this.lineWidthWC)
    {
      this.lineWidthWC *= xScale;
    }
  };

  Path.prototype.appendPath = function(obj, delMove)
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
    this.iso = true;               // true = maintain aspect ratio
  }

  Shape.prototype = new Path();    // make the Path methods the methods of this Shape object

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
    this.bBoxCmds = [];             // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};       // drawing origin (0,0) may get translated
    this.width = 0;                 // IMG types use to store requested width (natural width used if none passed)
    this.height = 0;                //     "
    this.imgX = 0;                  // TEXT & IMG use these for obj.translate, obj.rotate, obj.scale
    this.imgY = 0;                  //     "
    this.imgLorgX = 0;              //     "
    this.imgLorgY = 0;              //     "
    this.imgXscale = 1;             //     "
    this.imgYscale = 1;             //     "
    this.imgDegs = 0;               //     "
    this.lorg = 1;                  // used by IMG type for temp storage of lorg while loading image
    this.dragNdrop = null;
    // properties set by setProperty if undefined render uses Cango default
    this.border = false;            // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;          // renderer will stroke a path and shape outline in this color
    this.lineWidth = null;             // in pixels will not scale with xscl changes or cobj.scale
    this.lineWidthWC = null;   // line width in world coordinates, it scales with drawing (overrides lineWidth)
    this.lineCap = null;            // round butt or mitre
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
  }

  Img.prototype.translate = function(x, y)
  {
    // no points to shift just remember the offset to use when rendering
    this.imgX += x;   // IMG and TEXT types convert to pixels during render
    this.imgY += y;
  };

  Img.prototype.rotate = function(degs)
  {
    // no points to shift just remember the value to use when rendering
    this.imgDegs += degs;
  };

  Img.prototype.scale = function(xScl, yScl)
  {
    var xScale = xScl || 1,
        yScale = yScl || xScale;  // default to current value

    // no points to shift just remember values to use when rendering
    this.imgXscale *= xScale;
    this.imgYscale *= yScale;
    this.imgX *= xScale;
    this.imgY *= yScale;
    if (this.lineWidthWC)
    {
      this.lineWidthWC *= xScale;
    }
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
    ulx = this.imgX+dx;
    uly = this.imgY+dy;
    llx = this.imgX+dx;
    lly = this.imgY+dy+hgt;
    lrx = this.imgX+dx+wid;
    lry = this.imgY+dy+hgt;
    urx = this.imgX+dx+wid;
    ury = this.imgY+dy;
    this.bBoxCmds[0] = new DrawCmd("moveTo", [ulx, -uly]);
    this.bBoxCmds[1] = new DrawCmd("lineTo", [llx, -lly]);
    this.bBoxCmds[2] = new DrawCmd("lineTo", [lrx, -lry]);
    this.bBoxCmds[3] = new DrawCmd("lineTo", [urx, -ury]);
    this.bBoxCmds[4] = new DrawCmd("closePath", []);
  };

  function Text(txtString)
  {
    this.type = "TEXT";
    this.drawCmds = txtString;      // just store the text String
    this.bBoxCmds = [];             // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};       // drawing origin (0,0) may get translated
    this.imgX = 0;                  // TEXT & IMG use these for obj.translate, obj.rotate, obj.scale
    this.imgY = 0;                  //     "
    this.imgLorgX = 0;              //     "
    this.imgLorgY = 0;              //     "
    this.imgXscale = 1;             //     "
    this.imgYscale = 1;             //     "
    this.imgDegs = 0;               //     "
    this.lorg = 1;                  // used by IMG & TEXT type
    this.dragNdrop = null;
    // properties set by setProperty if undefined render uses Cango default
    this.border = false;            // true = stroke outline with strokeColor & lineWidth
    this.fillCol = null;            // only used if type = SHAPE and TEXT color
    this.fontSize = null;           // fontSize in pixels (TEXT only)
    this.fontSizeWC = null;         // fontSize in World Coords (frozen at first render so zoom & pan can work)
    this.fontWeight = null;         // fontWeight 100..900 (TEXT only)
    this.fontFamily = null;         // (TEXT only)
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
  }

  Text.prototype.translate = function(x, y)
  {
    // no points to shift just remember the offset to use when rendering
    this.imgX += x;   // IMG and TEXT types convert to pixels during render
    this.imgY += y;
  };

  Text.prototype.rotate = function(degs)
  {
    // no points to shift just remember the value to use when rendering
    this.imgDegs += degs;
  };

  Text.prototype.scale = function(xScl, yScl)
  {
    var xScale = xScl || 1,
        yScale = yScl || xScale;  // default to current value

    // no points to shift just remeber values to use when rendering
    this.imgXscale *= xScale;
    this.imgYscale *= yScale;
    this.imgX *= xScale;
    this.imgY *= yScale;
  };

  Text.prototype.formatText = function(gc)     // pass the current Cango context
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
        ulx, uly, llx, lly, lrx, lry, urx, ury;

    // support for zoom and pan
    if (!this.orgXscl)
    {
      // first time drawn save the scale
      this.orgXscl = gc.xscl;
    }
    this.fontSizeWC = fntSz/this.orgXscl;  // convert to world coords
    // set the drawing context to measure the size
    gc.ctx.save();
    gc.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    wid = gc.ctx.measureText(this.drawCmds).width;   // wid is in pixels
    gc.ctx.restore();

    wid /= this.orgXscl;  // convert to world coords
    hgt = fntSz/this.orgXscl;  // TEXT dimensions are 'iso', height from bottom of decender to top of capitals
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, 0],    [wid2, 0],    [wid, 0]];
    if (lorgWC[lorg] !== undefined)
    {
      dx = -lorgWC[lorg][0];  // offset to drawing origin (converted to world coords)
      dy = -lorgWC[lorg][1];
    }
    this.imgLorgX = dx;      // world coord offset to drawing origin
    this.imgLorgY = dy+0.25*hgt;   // correct for alphabetic baseline, its offset about 0.25*char height
    this.width = wid;        // in world coords
    this.height = hgt;
    // construct the DrawCmds for the text bounding box
    ulx = this.imgX+dx;
    uly = this.imgY-dy;
    llx = this.imgX+dx;
    lly = this.imgY-dy-hgt;
    lrx = this.imgX+dx+wid;
    lry = this.imgY-dy-hgt;
    urx = this.imgX+dx+wid;
    ury = this.imgY-dy;
    this.bBoxCmds[0] = new DrawCmd("moveTo", [ulx, -uly]);
    this.bBoxCmds[1] = new DrawCmd("lineTo", [llx, -lly]);
    this.bBoxCmds[2] = new DrawCmd("lineTo", [lrx, -lry]);
    this.bBoxCmds[3] = new DrawCmd("lineTo", [urx, -ury]);
    this.bBoxCmds[4] = new DrawCmd("closePath", []);
  };

  Cobj = function(data, objtype, options)
  {
    var classObj = Path,    // default to a Path type Cobj
        objClass,
        opt, prop;

    switch (objtype)
    {
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

    // now handle all the user requested options
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

  Cobj.prototype.setProperty = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
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
        if ((value === "butt")||(value === "round")||(value === "square"))
        {
          this.lineCap = value;
        }
        break;
      case "iso":
      case "isotropic":
        if ((value == true)||(value === 'iso')||(value === 'isotropic'))
        {
          this.iso = true;
        }
        else
        {
          this.iso = false;
        }
        break;
      case "dashed":
        if (isArray(value) && value[0])
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
        if (value == true)
        {
          this.border = true;
        }
        if (value == false)
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
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(value) > -1)
        {
          this.lorg = value;
        }
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

  Cobj.prototype.dup = function()
  {
    var newObj = new Cobj();

    newObj.type = this.type;
    newObj.drawCmds = clone(this.drawCmds);
    newObj.imgBuf = this.imgBuf;
    newObj.bBoxCmds = clone(this.bBoxCmds);
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.iso = this.iso;
    newObj.border = this.border;
    newObj.strokeCol = this.strokeCol;
    newObj.fillCol = this.fillCol;
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.width = this.width;
    newObj.height = this.height;
    newObj.imgX = this.imgX;
    newObj.imgY = this.imgY;
    newObj.imgLorgX = this.imgLorgX;
    newObj.imgLorgY = this.imgLorgY;
    newObj.imgXscale = this.imgXscale;
    newObj.imgYscale = this.imgYscale;
    newObj.imgDegs = this.imgDegs;
    newObj.lorg = this.lorg;
    newObj.dragNdrop = null;
    newObj.fontSize = this.fontSize;
    newObj.fontWeight = this.fontWeight;
    newObj.fontFamily = this.fontFamily;
    newObj.shadowOffsetX = this.shadowOffsetX;
    newObj.shadowOffsetY = this.shadowOffsetY;
    newObj.shadowBlur = this.shadowBlur;
    newObj.shadowColor = this.shadowColor;
    newObj.dashed = this.dashed;
    newObj.dashOffset = this.dashOffset;

    return newObj;
  };

//===============================================================================

  function Layer(canvasID, canvasElement)
  {
    this.id = canvasID;
    this.cElem = canvasElement;
    this.dragObjects = [];
  }

  Cango = function(canvasId)
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
      // there may be multiple Cango contexts on a layer, try to only fix canvas properties once
      if (savThis.bkgCanvas !== savThis.cnvs)
      {
        return;
      }
      savThis.cnvs.setAttribute('width', w);    // reset canvas pixels width
      savThis.cnvs.setAttribute('height', h);   // don't use style for this
      // make any offscreen buffer match the new size
      if (savThis.buffered)
      {
        savThis.cnvs.buf.setAttribute('width', w);    // set number of graphics pixels
        savThis.cnvs.buf.setAttribute('height', h);   // to match screen canvas
      }
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
          if (ovl.buf)
          {
            ovl.buf.setAttribute('width', w);    // set number of graphics pixels
            ovl.buf.setAttribute('height', h);   // to match screen canvas
          }
        }
      }
    }

    // test for off screen canvas drawing
    this.cId = canvasId;
    this.cnvs = document.getElementById(canvasId);
    if (this.cnvs === null)
    {
      alert("can't find canvas "+canvasId);
      return;
    }
    this.bkgCanvas = this.cnvs;  // assume this is a background canvas, bkgCanvas points to itself
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
    this.widthPW = 100;                           // width of canvas in ViewPort Coords
    this.heightPW = this.widthPW/this.aRatio;    // height of canvas in ViewPort Coords
    if (!this.bkgCanvas.hasOwnProperty('layers'))
    {
      // create an array to hold all the overlay canvases for this canvas
      this.bkgCanvas.layers = [];
      // make a Layer object for the bkgCanvas
      bkgL = new Layer(this.cId, this.cnvs);
      this.bkgCanvas.layers[0] = bkgL;
      // make sure the overlay canvases always match the bkgCanvas size
      addEvent(this.bkgCanvas, 'resize', resizeLayers);
    }
    if ((typeof CgoTimeline !== "undefined") && !this.bkgCanvas.hasOwnProperty('timeline'))
    {
      // create a a single timeline for all animations on all layers
      this.bkgCanvas.timeline = new CgoTimeline();
    }
    if (!this.cnvs.hasOwnProperty('resized'))
    {
      // make canvas native aspect ratio equal style box aspect ratio.
      // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
      this.cnvs.setAttribute('width', this.rawWidth);    // reset canvas pixels width
      this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
      this.cnvs.resized = true;
    }
    // this.buffered is set true by the CangoAnimation module, (if loaded)
    // create off screen drawing buffer
    if (this.buffered && !this.cnvs.buf)
    {
      this.cnvs.buf = document.createElement('canvas');      // create buffer in memory
      this.cnvs.buf.setAttribute('width', this.rawWidth);    // set number of graphics pixels
      this.cnvs.buf.setAttribute('height', this.rawHeight);  // to match screen canvas
      this.bufCtx = this.cnvs.buf.getContext('2d');          // animation drawing done off screen
    }
    this.ctx = this.cnvs.getContext('2d');  // draw direct to screen canvas
    this.yDown = false;   // flag used by seyViewport & setSVGViewport to signal use of SVG coords to setWorldCoords
    this.vpW = this.rawWidth;               // vp width in pixels (default to full canvas size)
    this.vpH = this.rawHeight;              // vp height in pixels
    this.vpOrgX = 0;                        // vp lower left from canvas left in pixels
    this.vpOrgY = this.rawHeight;           // vp lower left from canvas top
    this.xscl = 1;                          // world x axis scale factor, default to pixels, +ve right
    this.yscl = -1;                         // world y axis scale factor
    this.xoffset = 0;                       // world x origin offset from viewport left in pixels
    this.yoffset = 0;                       // world y origin offset from viewport bottom in pixels
    this.savWC = {"xscl":this.xscl,
                  "yscl":this.yscl,
                  "xoffset":this.xoffset,
                  "yoffset":this.yoffset};  // save world coords for zoom/pan
    this.ctx.textAlign = "left";            // all offsets are handled in code so dragNdrop works
    this.ctx.textBaseline = "alphabetic";
    this.penCol = "rgba(0, 0, 0, 1.0)";     // black
    this.penWid = 1;                        // pixels
    this.lineCap = "butt";
    this.paintCol = "rgba(128,128,128,1.0)";// gray
    this.fontSize = 12;                     // pixels
    this.fontWeight = 400;                  // 100..900, 400 = normal,700 = bold
    this.fontFamily = "Consolas, Monaco, 'Andale Mono', monospace";
    this.clipCount = 0;                     // count clipPath calls for use by resetClip

    this.getUnique = function()
    {
      uniqueVal += 1;     // a private 'global'
      return uniqueVal;
    };

    this.initModules();    // this method may be re-defined by modules
  };

  Cango.prototype.initModules = function(){};

  Cango.prototype.getHostLayer = function()
  {
    var i, lyr = this.bkgCanvas.layers[0];  // if no overlay canvases then Cango is on the background canvas

    for (i=1; i < this.bkgCanvas.layers.length; i++)
    {
      if (this.bkgCanvas.layers[i].id === this.cId)
      {
        lyr = this.bkgCanvas.layers[i];
        break;
      }
    }
    return lyr;    // Layer object
  };

  Cango.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    var xPx = this.vpOrgX+this.xoffset+x*this.xscl,
        yPx = this.vpOrgY+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    var xW = (xPx - this.vpOrgX - this.xoffset)/this.xscl,
        yW = (yPx - this.vpOrgY - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    var e = evt||window.event,
        rect = this.cnvs.getBoundingClientRect(),
        xW = (e.clientX - rect.left - this.vpOrgX - this.xoffset)/this.xscl,
        yW = (e.clientY - rect.top - this.vpOrgY - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.clearCanvas = function(fillColor)
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
    layerObj = this.getHostLayer();
    layerObj.dragObjects.length = 0;
    // in case the CangoHTMLtext extension is used
    if (this.cnvs.alphaOvl && this.cnvs.alphaOvl.parentNode)
    {
      this.cnvs.alphaOvl.parentNode.removeChild(this.cnvs.alphaOvl);
    }
  };

  Cango.prototype.setGridboxRHC = function(lowerLeftX, lowerLeftY, w, h)
  {
    // lowerLeftX, lowerLeft, w, h are in % of canvas width units (origin = canvas lower left)
    if (h && w && (h > 0) && (w > 0))
    {
      this.vpW = w*this.rawWidth/100;
      this.vpH = h*this.rawWidth/100;
      this.vpOrgX = lowerLeftX*this.rawWidth/100;
	    this.vpOrgY = this.rawHeight-lowerLeftY*this.rawWidth/100;
    }
    else
    {
      this.vpW = this.rawWidth;
      this.vpH = this.rawHeight;
      this.vpOrgX = 0;
      this.vpOrgY = this.rawHeight;
    }
    this.yDown = false;    // flag for setWorldCoords used only for Cartesian coords (Y +ve UP the screen)
    this.setWorldCoords(); // if new gridbox created, world coords are garbage, so reset to defaults
  };

  Cango.prototype.setGridboxSVG = function(upperLeftX, upperLeftY, w, h)
  {
    // upperLeftX, upperLeftY are in % of canvas width units (origin = canvas lower left)
    if (h && w && (h > 0) && (w > 0))
    {
      this.vpW = w*this.rawWidth/100;
      this.vpH = h*this.rawWidth/100;
      this.vpOrgX = upperLeftX*this.rawWidth/100;
	    this.vpOrgY = (this.heightPW - upperLeftY)*this.rawWidth/100;
   }
    else
    {
      this.vpW = this.rawWidth;
      this.vpH = this.rawHeight;
      this.vpOrgX = 0;
      this.vpOrgY = 0;
    }
    this.yDown = true;     // flag for setWorldCoords true only for inverted Cartesian coords (Y +ve DOWN)
    this.setWorldCoords(); // if new gridbox, world coords are garbage, so reset to defaults
  };

  Cango.prototype.fillGridbox = function(fillColor)
  {
    var savThis = this,
        newCol = fillColor || this.paintCol,
        yCoord = (this.yscl>0)? this.vpOrgY: this.vpOrgY-this.vpH;

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

    this.ctx.save();
    if (newCol instanceof LinearGradient)
    {
      this.ctx.fillStyle = genLinGrad(newCol);
    }
    else if (newCol instanceof RadialGradient)
    {
      this.ctx.fillStyle = genRadGrad(newCol);
    }
    else
    {
      this.ctx.fillStyle = newCol;
    }
    this.ctx.fillRect(this.vpOrgX, yCoord, this.vpW, this.vpH); // fill: top, left, wid, hgt
    this.ctx.restore();
  };

  Cango.prototype.setWorldCoords = function(vpOriginX, vpOriginY, spanX, spanY)
  {
    // viewport origin (lower left for Cartesian, upper left for SVG)
    var vpOrgXWC = vpOriginX || 0,  // viewport origin x world coord
        vpOrgYWC = vpOriginY || 0;  // viewport origin y world coord

    if (spanX && (spanX > 0))
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                   // use pixel units
    }
    if (spanY && (spanY > 0))
    {
      this.yscl = this.yDown? this.vpH/spanY: -this.vpH/spanY;
    }
    else
    {
      this.yscl = this.yDown? this.xscl: -this.xscl;          // square pixels
    }
    // sign of this.yscl signals other methods that Cartesion (yscl<0) or SVG (yscl>0) coords are being used
    this.xoffset = -vpOrgXWC*this.xscl;
    this.yoffset = -vpOrgYWC*this.yscl;
    // save these values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango.prototype.setPropertyDefault = function(propertyName, value)
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
        if ((typeof value === "string")&&((value === "butt")||(value === "round")||(value === "square")))
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

  Cango.prototype.dropShadow = function(obj)
  {
    var xOfs = obj.shadowOffsetX || 0,
        yOfs = obj.shadowOffsetY || 0,
        radius = obj.shadowBlur || 0,
        color = obj.shadowColor || "#000000",
        xScale = 1,
        yScale = 1;

    if (this.ctx.shadowOffsetX !== undefined)     // check if supported
    {
      if ((obj.type === "SHAPE")||((obj.type === "PATH")&& !obj.iso))   // must scale for world coords (matrix scaling not used)
      {
        xScale *= this.xscl;
        yScale *= this.yscl;
      }
      else                         // no need to scale here (matrix scaling used)
      {
        xScale *= this.xscl;
        yScale *= -this.xscl;
      }

      this.ctx.shadowOffsetX = xOfs*xScale;
      this.ctx.shadowOffsetY = yOfs*yScale;
      this.ctx.shadowBlur = radius*xScale;
      this.ctx.shadowColor = color;
    }
  };

  Cango.prototype.render = function(pathObj, x, y, scl, degs)
  {
    var savThis = this;

    function processCobj(obj)
    {
      function imgLoaded()
      {
        obj.formatImg();
        savThis.paintImg(obj, x, y, scl, degs);
      }

      if ((typeof obj !== "object") || !(obj instanceof Cobj))
      {
        console.warn("Cango.render: object not instanceof of Cobj");
        return;
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
        savThis.paintText(obj, x, y, scl, degs);
      }
      else    // PATH, SHAPE
      {
        savThis.paintPath(obj, x, y, scl, degs);
      }
    }

    // ================= start here  =================

    if (isArray(pathObj))
    {
      flatten(pathObj).forEach(processCobj);  // handle nested arrays of Cobj
    }
    else if (pathObj)
    {
      processCobj(pathObj);
    }
  };

  Cango.prototype.paintImg = function(pathObj, x, y, scl, degrees)
  {
    // should only be called after image has been loaded into drawCmds
    var savThis = this,
        A, sinA, cosA,
        img = pathObj.imgBuf,            // this is the place the image is stored in object
        xPos = x || 0,
        yPos = y || 0,
        xScale = scl || 1,
        scale = xScale*pathObj.imgXscale,  // imgXscale is from Cobj.scale (permanent)
        degs = degrees || 0,
        currLr, aidx;

    function rotXY(p)
    {
      return [p[0]*cosA - p[1]*sinA, p[0]*sinA + p[1]*cosA];
    }

    this.ctx.save();   // save the clean ctx
    // set up dropShadow if any
    this.dropShadow(pathObj);
    // move the whole coordinate system to the xPos,yPos
    this.ctx.translate(this.vpOrgX+this.xoffset+xPos*this.xscl, this.vpOrgY+this.yoffset+yPos*this.yscl);
    degs += pathObj.imgDegs;
    if (degs)
    {
      A = (this.yscl>0)? -degs*Math.PI/180.0: degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
      this.ctx.rotate(-A);   // rotate
    }
    // now insert the image origin with lorg offsets and scaled in width
    this.ctx.drawImage(img, this.xscl*scale*(pathObj.imgX+pathObj.imgLorgX),
                            this.xscl*scale*(pathObj.imgY+pathObj.imgLorgY),
                            this.xscl*scale*pathObj.width, this.xscl*scale*pathObj.height);

    this.ctx.restore();    // undo the transforms (and drop shadow settings)
    // now transform the bounding box drawCmd.parms to pixels (it is used to draw a border if any, and dragNdrop)
    pathObj.bBoxCmds.forEach(function(drwcmd){  // step through the draw segments
      var pt, drwOrg;
      if (drwcmd.parms.length)       // skip final closePath, no cPts ie parms length==0
      {
        if (degs)
        {
          pt = rotXY(drwcmd.parms[0]);  // rotate each coords - don't alter the original
        }
        else
        {
          pt = [drwcmd.parms[0][0], drwcmd.parms[0][1]];     // take a copy
        }
        // convert a bounding box corner to pixels, use x axis units (Y +ve UP) apply any scale factor too
        pt[0] *= scale*savThis.xscl;
        pt[1] *= -scale*savThis.xscl;
        drwOrg = savThis.toPixelCoords(xPos, yPos);   // convert the drawing origin to pixels
        drwcmd.parmsPx[0] = pt[0] + drwOrg.x;
        drwcmd.parmsPx[1] = pt[1] + drwOrg.y;
      }
    });
    if (pathObj.border)
    {
      this.ctx.save();   // save the clean ctx
      this.ctx.beginPath();
      pathObj.bBoxCmds.forEach(function(drwCmd){
        savThis.ctx[drwCmd.drawFn].apply(savThis.ctx, drwCmd.parmsPx);  // call the canvas method for each path segment
      });
      // support for zoom and pan changing lineWidth
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*scale*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.penWid;
      }
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.stroke();
      this.ctx.restore();    // undo the transforms (and drop shadow settings)
    }
    // save world coords of the drawing origin for drag n drop
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;

    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canvas
      currLr = this.getHostLayer();
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
      if (pathObj.dragNdrop.layer.dragObjects.indexOf(pathObj) === -1)
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango.prototype.paintPath = function(pathObj, x, y, scl, degrees)
  {
    // used for type: PATH, SHAPE
    var savThis = this,
        A, sinA, cosA,
        xPos = x || 0,
        yPos = y || 0,
        scale = scl || 1,
        degs = degrees || 0,
        j,
        xPx = this.vpOrgX+this.xoffset+xPos*this.xscl,
        yPx = this.vpOrgY+this.yoffset+yPos*this.yscl,
        xsl = this.xscl,
        ysl = this.yscl,
        col, gradFill,
        currLr, aidx;

    function genLinGrad(lgrad, iso)   // iso is a copy of the object being filled's iso
    {
      var p1x = lgrad.grad[0],
          p1y = lgrad.grad[1],
          p2x = lgrad.grad[2],
          p2y = lgrad.grad[3],
          xScale = savThis.xscl,
          yScale = savThis.yscl,
          grad;

          if (iso)
          {
            yScale = (savThis.yscl>0)? savThis.xscl: -savThis.xscl;
          }
          grad = savThis.ctx.createLinearGradient(xScale*p1x, yScale*p1y, xScale*p2x, yScale*p2y);

      lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function genRadGrad(rgrad, iso)
    {
      var p1x = rgrad.grad[0],
          p1y = rgrad.grad[1],
          r1 = rgrad.grad[2],
          p2x = rgrad.grad[3],
          p2y = rgrad.grad[4],
          r2 = rgrad.grad[5],
          xScale = savThis.xscl,
          yScale = savThis.yscl,
          grad;

          if (iso)
          {
            yScale = (savThis.yscl>0)? savThis.xscl: -savThis.xscl;
          }
          grad = savThis.ctx.createRadialGradient(xScale*p1x, yScale*p1y, xScale*r1, xScale*p2x, yScale*p2y, xScale*r2);

      rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function rotXY(p)
    {
      return [p[0]*cosA - p[1]*sinA, p[0]*sinA + p[1]*cosA];
    }

    if (pathObj.iso)
    {
      ysl = (this.yscl>0)? this.xscl: -this.xscl;
    }
    // don't use canvas matrix rotation or the gradient patterns will be rotated
    if (degs)
    {
      A = (this.yscl>0)? -degs*Math.PI/180.0: degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
    }
    this.ctx.save();   // save current context
    this.dropShadow(pathObj);
    // use canvas translation and scaling so gradient fill follow the object drawing origin and size
    this.ctx.translate(xPx, yPx);
    // build the path by converting the world coord parms of each DrawCmd to parmPx
    // these can then be uses in drag and drop pointInpath testing
    this.ctx.beginPath();

    pathObj.drawCmds.forEach(function(drwCmd){
        drwCmd.parmsPx = [];   // start with new array
        drwCmd.parms.forEach(function(coord){
        var pt;
        if (degs)
        {
          pt = rotXY(coord);  // rotate each coord
        }
        else
        {
          pt = [coord[0], coord[1]];     // take a copy
        }
        // convert the coord pair to pixels, (if iso,  ysl is -this.xscl for Cartesian or this.xscl for SVG)
        pt[0] *= scale*xsl;
        pt[1] *= scale*ysl;
        drwCmd.parmsPx.push(pt[0], pt[1]);
      });
      savThis.ctx[drwCmd.drawFn].apply(savThis.ctx, drwCmd.parmsPx); // add the path segment
    });

    if (pathObj.type === "SHAPE")      // if a SHAPE, fill with color
    {
      col = pathObj.fillCol || this.paintCol;
      if (col instanceof LinearGradient)
      {
        gradFill = genLinGrad(col, pathObj.iso);
        this.ctx.fillStyle = gradFill;
      }
      else if (col instanceof RadialGradient)
      {
        gradFill = genRadGrad(col, pathObj.iso);
        this.ctx.fillStyle = gradFill;
      }
      else
      {
        this.ctx.fillStyle = col;
      }
      this.ctx.fill();
      // clear drop shadow its done (and we might want to stroke border, with no extra shadow)
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 0;
    }
    if ((pathObj.type === "PATH")|| pathObj.border)
    {
      // handle dashed lines
      if (pathObj.dashed)
      {
        this.ctx.setLineDash(pathObj.dashed);
        this.ctx.lineDashOffset = pathObj.dashOffset;
      }
      // support for zoom and pan changing line width
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*scale*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.penWid;
      }
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.stroke();
    }
    // undo the translation
    this.ctx.restore();
    // correct the pixel outline for any scaling and shift of drawing origin
    pathObj.drawCmds.forEach(function(drwCmd){
      for (j=0; j < drwCmd.parms.length; j++)      // there are half the number of parms than parmsPx
      {
        drwCmd.parmsPx[2*j] = drwCmd.parmsPx[2*j]*scale + xPx;
        drwCmd.parmsPx[2*j+1] = drwCmd.parmsPx[2*j+1]*scale + yPx;
      }
    });
    // save world coords of the drawing origin for drag n drop
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;
    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canavs
      currLr = this.getHostLayer();
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
      if (pathObj.dragNdrop.layer.dragObjects.indexOf(pathObj) === -1)
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango.prototype.paintText = function(pathObj, x, y, scl, degrees)
  {
    var savThis = this,
        A = 0,
        sinA, cosA,
        xPos = x || 0,
        yPos = y || 0,
        xScale = scl || 1,
        scale = xScale*pathObj.imgXscale,  // imgXscale is from Cobj.scale() (permanent)
        degs = degrees || 0,
        fntWt, fntSz, fntFm,
        currLr, aidx;

    function rotXY(p)
    {
      return [p[0]*cosA - p[1]*sinA, p[0]*sinA + p[1]*cosA];
    }

    // translate, rotate, scale must be handled at render time
    this.ctx.save();   // save current context
    this.dropShadow(pathObj);
    // only the x, y passed to render are in non-iso coords (ie use yscl)
    this.ctx.translate(this.vpOrgX+this.xoffset+xPos*this.xscl, this.vpOrgY+this.yoffset+yPos*this.yscl);
    degs += pathObj.imgDegs;
    if (degs)
    {
      A = (this.yscl>0)? -degs*Math.PI/180.0: degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
      this.ctx.rotate(-A);   // rotate
    }
    fntSz = this.xscl*scale*pathObj.fontSizeWC;    // force the use of xscl to support zoom & pan
    // if Cobj fontWeight or fontSize undefined use Cango default
    fntFm = pathObj.fontFamily || this.fontFamily;
    fntWt = pathObj.fontWeight || this.fontWeight;
    this.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    // set the fillStyle to obj.fillCol for text
    this.ctx.fillStyle = pathObj.fillCol || this.paintCol;
    // now actually fill the text (text referenced from baseline (image from top) so use -xscl)
    this.ctx.fillText(pathObj.drawCmds,
                      this.xscl*scale*(pathObj.imgX+pathObj.imgLorgX),
                      -this.xscl*scale*(pathObj.imgY+pathObj.imgLorgY));
    if (pathObj.border)
    {
      // fill done, if dropShadow dont apply to the border (it will be on top of fill)
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 0;
      // support for zoom and pan changing lineWidth
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.penWid;
      }
      this.ctx.strokeStyle = pathObj.strokeCol || this.penCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      // now actually fill the text
      this.ctx.strokeText(pathObj.drawCmds,
                          this.xscl*scale*(pathObj.imgX+pathObj.imgLorgX),
                          -this.xscl*scale*(pathObj.imgY+pathObj.imgLorgY));
    }
    // undo the rotation, translation
    this.ctx.restore();
    // now transform the bounding box
    pathObj.bBoxCmds.forEach(function(drwcmd){  // step through the draw segments
      var pt, drwOrg;
      if (drwcmd.parms.length)     // skip final closePath, no cPts ie parms length==0
      {
        if (degs)
        {
          pt = rotXY(drwcmd.parms[0]);  // rotate each coords - don't alter the original
        }
        else
        {
          pt = [drwcmd.parms[0][0], drwcmd.parms[0][1]];     // take a copy
        }
        // convert a bounding box corner to pixels, use x axis units (Y +ve UP) apply any scale factor too
        pt[0] *= scale*savThis.xscl;
        pt[1] *= -scale*savThis.xscl;
        drwOrg = savThis.toPixelCoords(xPos, yPos);   // convert the drawing origin to pixels
        drwcmd.parmsPx[0] = pt[0] + drwOrg.x;
        drwcmd.parmsPx[1] = pt[1] + drwOrg.y;
      }
    });
    // save world coords of the drawing origin (often useful in drag n drop)
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;
    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canavs
      currLr = this.getHostLayer();
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
      if (pathObj.dragNdrop.layer.dragObjects.indexOf(pathObj) === -1)
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango.prototype.drawPath = function(path, x, y, options)
  {
    var pathObj = new Cobj(path, "PATH", options);
    this.render(pathObj, x, y);

    return pathObj;
  };

  Cango.prototype.drawShape = function(path, x, y, options)
  {
    var shapeObj = new Cobj(path, "SHAPE", options);
    this.render(shapeObj, x, y);

    return shapeObj;
  };

  Cango.prototype.drawText = function(str, x, y, options)
  {
    var txtObj = new Cobj(str, "TEXT", options);
    this.render(txtObj, x, y);

    return txtObj;
  };

  Cango.prototype.drawImg = function(imgURL, x, y, options)
  {
    var imgObj = new Cobj(imgURL, "IMG", options);
    this.render(imgObj, x, y);

    return imgObj;
  };

  Cango.prototype.clipPath = function(pathObj, x, y, scl, degrees)
  {
    // used for type: PATH, SHAPE
    var savThis = this,
        A, sinA, cosA,
        xPos = x || 0,
        yPos = y || 0,
        scale = scl || 1,
        degs = degrees || 0,
        xPx = this.vpOrgX+this.xoffset+xPos*this.xscl,
        yPx = this.vpOrgY+this.yoffset+yPos*this.yscl,
        xsl = this.xscl,
        ysl = this.yscl;

    function rotXY(p)
    {
      return [p[0]*cosA - p[1]*sinA, p[0]*sinA + p[1]*cosA];
    }

    if ((pathObj.type === "IMG")||(pathObj.type === "TEXT"))
    {
      return;
    }
    if (pathObj.iso)
    {
      ysl = (this.yscl>0)? this.xscl: -this.xscl;
    }
    // don't use canvas matrix rotation or the gradient patterns will be rotated
    if (degs)
    {
      A = (this.yscl>0)? -degs*Math.PI/180.0: degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
    }
    this.ctx.save();   // save current context
    // build the path by converting the world coord parms of each DrawCmd to parmPx
    // these can then be uses in drag and drop pointInpath testing
    this.ctx.beginPath();

    pathObj.drawCmds.forEach(function(drwCmd){
        drwCmd.parmsPx = [];   // start with new array
        drwCmd.parms.forEach(function(coord){
        var pt;
        if (degs)
        {
          pt = rotXY(coord);  // rotate each coord
        }
        else
        {
          pt = [coord[0], coord[1]];     // take a copy
        }
        // convert the coord pair to pixels, (if iso,  ysl is -this.xscl for Cartesian or this.xscl for SVG)
        pt[0] = xPx+xsl*scale*pt[0];
        pt[1] = yPx+ysl*scale*pt[1];
        drwCmd.parmsPx.push(pt[0], pt[1]);
      });
      savThis.ctx[drwCmd.drawFn].apply(savThis.ctx, drwCmd.parmsPx); // add the path segment
    });
    this.ctx.clip();
    this.clipCount++;
  };

  Cango.prototype.resetClip = function()
  {
    while (this.clipCount > 0)
    {
      this.ctx.restore();
      this.clipCount--;
    }
  };

  Cango.prototype.createLayer = function()
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

  Cango.prototype.deleteLayer = function(ovlyId)
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

  Cango.prototype.deleteAllLayers = function()
  {
    var i, ovlNode;

    for (i = this.bkgCanvas.layers.length-1; i>0; i--)   // don't delete layers[0] its the bkg canvas
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
  Cango.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.vpW = src_graphCtx.vpW;          // vp width in pixels
    this.vpH = src_graphCtx.vpH;          // vp height in pixels
    this.vpOrgX = src_graphCtx.vpOrgX;    // vp origin X & Y in pixels (lower left for Cartesian
    this.vpOrgY = src_graphCtx.vpOrgY;    //                            upper left for SVG)
    this.xscl = src_graphCtx.xscl;        // world x axis scale factor
    this.yscl = src_graphCtx.yscl;        // world y axis scale factor
    this.xoffset = src_graphCtx.xoffset;  // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;  // world y origin offset from viewport bottom in pixels
    this.savWC = clone(src_graphCtx.savWC);
    this.penCol = src_graphCtx.penCol.slice(0);   // copy value not reference
    this.penWid = src_graphCtx.penWid;    // pixels
    this.lineCap = src_graphCtx.lineCap.slice(0);
    this.paintCol = src_graphCtx.paintCol.slice(0);
    this.fontFamily = src_graphCtx.fontFamily.slice(0);
    this.fontSize = src_graphCtx.fontSize;
    this.fontWeight = src_graphCtx.fontWeight;
  };

  Cango.prototype.toImgObj = function(obj)
  {
    // find the bounding box
    var top, rgt, bot, lft,
        dx, dy, w, h,
        xsc = this.xscl,
        ysc = this.yscl,
        buf, gc,
        imgObj = new Cobj("", "IMG"),
        i, j;

    if ((obj.type !== 'PATH')&&(obj.type !== 'SHAPE'))
    {
      return null;
    }
    if (obj.iso)
    {
      ysc = (this.yscl>0)? this.xscl: -this.xscl;
    }
    // find pixel dimensions of the obj bounding box
    lft = rgt = obj.drawCmds[0].parms[0][0];
    bot = top = obj.drawCmds[0].parms[0][1];
    for (i=1; i < obj.drawCmds.length; i++)
    {
      for (j=0; j < obj.drawCmds[i].parms.length; j++)
      {
        // step through each draw command and find max and min end point or control point
        if (obj.drawCmds[i].parms[j][0] > rgt)
        {
          rgt = obj.drawCmds[i].parms[j][0];
        }
        if  (obj.drawCmds[i].parms[j][0] < lft)
        {
          lft = obj.drawCmds[i].parms[j][0];
        }
        if (obj.drawCmds[i].parms[j][1] > top)
        {
          top = obj.drawCmds[i].parms[j][1];
        }
        if  (obj.drawCmds[i].parms[j][1] < bot)
        {
          bot = obj.drawCmds[i].parms[j][1];
        }
      }
    }

    dx = lft*xsc-2;         // add a couple of pixels for aliasing
    dy = (this.yscl>0)? bot*ysc-2: bot*ysc+2;
    w = (rgt - lft)*xsc+4;
    h = (this.yscl>0)? (top - bot)*ysc+4: (bot - top)*ysc+4;
    buf = document.createElement('canvas');    // create buffer in memory
    buf.setAttribute('width', w);
    buf.setAttribute('height', h);
    gc = new Cango(this.cId);
    gc.dupCtx(this);
    // now patch up the Cango context for paintPath
    gc.cnvs = buf;
    gc.cId = "_sprite_";
    gc.ctx = gc.cnvs.getContext('2d');    // draw direct to screen canvas
    gc.rawWidth = w;              // width and height are like Image object
    gc.rawHeight = h;
    gc.vpW = gc.rawWidth;         // vp width in pixels (default to full canvas size)
    gc.vpH = gc.rawHeight;        // vp height in pixels
    gc.vpOrgX = 0;                // vp lower left from canvas left in pixels
    gc.vpOrgY = (this.yscl>0)? 0: gc.rawHeight;      // vp lower left from canvas top
    gc.xoffset = -dx;             // drawn at current pixel resolution
    gc.yoffset = -dy;
    // render the obj
    this.paintPath.call(gc, obj);  // paint obj dwgOrg at 0,0
    // img is rendered at pixel resolution (*xscl). The reference width is in world coords
    // corrected by the scale factor 'imgXscale', so fix this for current world coords
    imgObj.imgXscale = 1/this.xscl;
    // start to load the image (if not loaded at render, render will start 'onload' event)
    imgObj.imgBuf.src = gc.cnvs.toDataURL();

    return imgObj;
  };
}());

