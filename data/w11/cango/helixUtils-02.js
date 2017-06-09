/*==========================================================================*
  Filename: helixUtils-02.js
  By: Dr A.R.Collins

  JavaScript helix drawing utilities.
  Requires:
  'createHelicalArc' and 'createHelixgenerate' functions return Cgo3D arrays
  for direct use in Cango3D graphics library but Bezier node values are
  easily extracted.

  Kindly give credit to Dr A.R.Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  21Feb14 First public release                                           ARC
  02Mar15 Tidy multiple vars etc                                         ARC
  ==========================================================================*/

  // exposed globals
  var createHelicalArc, createHelix;

  (function()
  {
    "use strict";

    /*----------------------------------------------------------------------------
      createHelicalArc
      Create Cgo3D array to define cubic Bezier approximation to a segment of
      a cylindrical helix.
      Parms: radius, helix pitch, included angle (degrees) <180, <120 recommended
     ----------------------------------------------------------------------------*/
    createHelicalArc = function(r, pitch, incAngle)
    {
      // References:
      // 1. A. Riskus, "Approximation of a Cubic Bezier Curve by Circular Arcs and Vice Versa"
      // 2. Imre Juhasz, "Approximating the helix with rational cubic Bezier curves"

      var alpha = incAngle*Math.PI/360.0,  // half included angle
          p = pitch/(2*Math.PI),    // helix height per radian
          ax = r*Math.cos(alpha),
          ay = r*Math.sin(alpha),
          b = p*alpha*(r - ax)*(3*r - ax)/(ay*(4*r - ax)*Math.tan(alpha)),
          b0 = {x:ax, y:-ay, z:-alpha*p},
          b1 = {x:(4*r - ax)/3, y:-(r - ax)*(3*r - ax)/(3*ay), z:-b},
          b2 = {x:(4*r - ax)/3, y:(r - ax)*(3*r - ax)/(3*ay), z:b},
          b3 = {x:ax, y:ay, z:alpha*p};

      return ["M", b0.x,b0.y,b0.z, "C", b1.x,b1.y,b1.z, b2.x,b2.y,b2.z, b3.x,b3.y,b3.z];
    }

    /*-------------------------------------------------------------------------
      createHelix
      Create Cgo3D array to define cubic Bezier approximation to a cylindical
      helix.
      Parms: radius, pitch, number of turns (may include a fraction of a turn)
     -------------------------------------------------------------------------*/
    createHelix = function(r, pitch, turns)
    {
      var incAngle, arcsPerTurn, nArcs,
          seg, i,
          s, c1, c2, e,
          arcData, arc, helix,
          alpha, theta, dz;

      function XYrotate(v, degs)
      {
        // rotate a 3D vector around the Z axis
        var A = Math.PI*degs/180.0,   // radians
            sinA = Math.sin(A),
            cosA = Math.cos(A);

        return {x: v.x*cosA - v.y*sinA, y: v.x*sinA + v.y*cosA, z:v.z};
      }

      function Ztranslate(v, d)
      {
        // translate a 3D vector along z axis
        return {x:v.x , y:v.y , z:v.z+d};
      }

      // find integer number of segments needed with 90<incAngle<120 deg
      nArcs = turns < 1? Math.ceil(3*turns): Math.floor(4*turns);
      arcsPerTurn = nArcs/turns;
      incAngle = 360/arcsPerTurn;

      arcData = createHelicalArc(r, pitch, incAngle);
      alpha = incAngle/2;
      dz = pitch/(2*arcsPerTurn);
      // rotate to 1st quadrant and translate to start in XY plane
      s = {x:arcData[1], y:arcData[2], z:arcData[3]};
      s = XYrotate(s, alpha);
      s = Ztranslate(s, dz);
      c1 = {x:arcData[5], y:arcData[6], z:arcData[7]};
      c1 = XYrotate(c1, alpha);
      c1 = Ztranslate(c1, dz);
      c2 = {x:arcData[8], y:arcData[9], z:arcData[10]};
      c2 = XYrotate(c2, alpha);
      c2 = Ztranslate(c2, dz);
      e = {x:arcData[11], y:arcData[12], z:arcData[13]};
      e = XYrotate(e, alpha);
      e = Ztranslate(e, dz);

      arc = ["M", s.x,s.y,s.z, "C",c1.x,c1.y,c1.z, c2.x,c2.y,c2.z, e.x,e.y,e.z];

      // start helix SVG array with first segment
      helix = arc.slice(0);
      // copy, rotate and translate successive curve segments and append to helix array
      for (i = 1; i<nArcs; i++)
      {
        theta = incAngle*(i % arcsPerTurn);
        dz = i*pitch/arcsPerTurn;

        c1 = XYrotate({x:arc[5], y:arc[6], z:arc[7]}, theta);
        c1 = Ztranslate(c1, dz);
        c2 = XYrotate({x:arc[8], y:arc[9], z:arc[10]}, theta);
        c2 = Ztranslate(c2, dz);
        e = XYrotate({x:arc[11], y:arc[12], z:arc[13]}, theta);
        e = Ztranslate(e, dz);

        helix.push(c1.x,c1.y,c1.z, c2.x,c2.y,c2.z, e.x,e.y,e.z);
      }

      return helix;
    }

  }());
