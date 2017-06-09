/*==========================================================================*
  Filename: threadUtils-03.js
  By: Dr A.R.Collins

  JavaScript metric thread drawing utilities.
  Requires:
  Cango graphics library but may be simply converted for use in SVG.

  Kindly give credit to Dr A.R.Collins <http://www.arc.id.au/>
  Report bugs to tony(at)arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  04Feb15 First public release                                           ARC
  10Feb15 bugfix: threadLengths[3] had 'txt' instead of 'txts' element   ARC
  15Mar15 Convert sweep for "A" commands to RHC coordinates sense        ARC
 *==========================================================================*/

  // exposed globals
  var threadLengths =
      [
        {"M":5, "txts":["25 mm", "30 mm", "35 mm", "40 mm", "45 mm"],
                "vals":[25, 30, 35, 40, 45]},
        {"M":6, "txts":["25 mm", "30 mm", "35 mm", "40 mm", "45 mm", "50 mm", "55 mm", "60 mm", "65 mm",
                        "70 mm", "75 mm", "80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                "vals":[25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":8, "txts":["30 mm", "35 mm", "40 mm", "45 mm", "50 mm", "55 mm", "60 mm", "65 mm", "70 mm",
                       "75 mm", "80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                "vals":[30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":10, "txts":["35 mm", "40 mm", "45 mm", "50 mm", "55 mm", "60 mm", "65 mm", "70 mm",
                         "75 mm", "80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                 "vals":[35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":12, "txts":["40 mm", "45 mm", "50 mm", "55 mm", "60 mm", "65 mm", "70 mm", "75 mm",
                         "80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                 "vals":[40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":16, "txts":["50 mm", "55 mm", "60 mm", "65 mm", "70 mm", "75 mm", "80 mm", "85 mm",
                         "90 mm", "100 mm", "110 mm", "120 mm"],
                 "vals":[50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":20, "txts":["60 mm", "65 mm", "70 mm", "75 mm", "80 mm", "85 mm", "90 mm", "100 mm",
                         "110 mm", "120 mm"],
                 "vals":[60, 65, 70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":24, "txts":["70 mm", "75 mm", "80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                 "vals":[70, 75, 80, 85, 90, 100, 110, 120]},
        {"M":30, "txts":["80 mm", "85 mm", "90 mm", "100 mm", "110 mm", "120 mm"],
                 "vals":[80, 85, 90, 100, 110, 120]}
      ],
      prefLength = {"5": 30,
                    "6": 40,
                    "8": 50,
                    "10": 60,
                    "12": 70,
                    "16": 80,
                    "20": 90,
                    "24": 100,
                    "30": 110 },
      prefPitch = { "5": 0.8,
                    "6": 1,
                    "8": 1.25,
                    "10": 1.5,
                    "12": 1.75,
                    "16": 2,
                    "20": 2.5,
                    "24": 3,
                    "30": 3.5 },
      genThreadOutline, genEndOutline, genHexHeadOutline;

(function()
{
  "use strict";

  genThreadOutline = function(pitch, diameter)
  {
    var P = pitch,
        Dc = diameter,             // diameter across thread crests
        sp = 0.15915*P,
        sc = 0.5*Dc,               // crest profile Y coordinate scale factor
        sr = 0.5*Dc - 0.6134*P,    // root profile Y coordinate scale factor
        topL    = ["l",0.3125*P,-0.5413*P, "a",0.1443*P,0.1443*P,0,0,1,0.125*P,-0.0722*P],   //from (tl)
        topR    = ["a",0.1443*P,0.1443*P,0,0,1,0.125*P,0.0722*P, "l",0.3125*P,0.5413*P],     //from (tr)
        topC    = ["l",0.125*P,0],                                                           //from (tc)
        bottomL = ["a",0.1443*P,0.1443*P,0,0,1,-0.125*P,-0.0722*P, "l",-0.3125*P,-0.5413*P], //from (bl)
        bottomR = ["l",-0.3125*P,0.5413*P, "a",0.1443*P,0.1443*P,0,0,1,-0.125*P,0.0722*P],   //from (br)
        bottomC = ["l",-0.125*P,0],                                                          //from (bc)
        crestR  = ["c",0.5708*sp,0, 1.0595*sp,-0.4887*sc, 1.5708*sp,-sc,
                    "s",sp,-sc, 1.5708*sp,-sc],                                              //from (cf)
        crestL  = ["c",-0.5708*sp,0, -1.0595*sp,0.4887*sc, -1.5708*sp,sc,
                    "s",-sp,sc, -1.5708*sp,sc],                                              //from (cr)
        rootL   = ["c",0.5708*sp,0, 1.0595*sp,-0.4887*sr, 1.5708*sp,-sr,
                    "s",sp,-sr, 1.5708*sp,-sr],                                              //from (rf)
        rootR   = ["c",-0.5708*sp,0, -1.0595*sp,0.4887*sr, -1.5708*sp,sr,
                    "s",-sp,sr, -1.5708*sp,sr],                                              //from (rr)
        startL, startR, startC,
        flankL, flankR, crest;

    startL = ["M",0.0625*P,0.5*Dc];
    flankL = startL.concat(topL).concat(rootL).concat(bottomL);
      // for closed shape: flankL.concat(crestL);

    startR = ["M",0.5*P, sr];
    flankR = startR.concat(topR).concat(crestR).concat(bottomR);
      // for closed shape: flankR.concat(rootR);

    startC = ["M",0.9375*P,0.5*Dc];
    crest = startC.concat(topC).concat(crestR).concat(bottomC);
      // for closed shape: crest.concat(crestL);

    return flankL.concat(flankR).concat(crest);
  };

  genEndOutline = function(pitch, diameter)
  {
    var P = pitch,
        H = 0.86603*pitch,
        Dc = diameter,             // diameter across thread crests
        pi = Math.PI,
        sp = 0.15915*P,
        sc = 0.5*Dc,               // crest profile Y coordinate scale factor
        sr = 0.5*Dc - 0.6134*P,    // root profile Y coordinate scale factor
        sx = 0.625*P/(2*pi),       // X scale factor for cosine 0..pi to 0..end crest pitch
        se = 0.5*Dc - 0.3789*P,    // Y scale cosine amplitude 1 to end crest diameter/2
        topL    = ["l",0.3125*P,-0.5413*P, "a",0.1443*P,0.1443*P,0,0,1,0.125*P,-0.0722*P],
        rootL   = ["c",0.5708*sp,0, 1.0595*sp,-0.4887*sr, 1.5708*sp,-sr,"c",0.5113*sp,-0.5113*sr, sp,-sr, 1.5708*sp,-sr],
        bottomL = ["a",0.1443*P,0.1443*P,0,0,1,-0.125*P,-0.0722*P, "l",-0.3125*P,-0.5413*P],
        crestL  = ["c",-0.5708*sp,0, -1.0595*sp,0.4887*sc, -1.5708*sp,sc,"s",-sp,sc, -1.5708*sp,sc],
        endTopR    = ["m",0,0, "a",0.1443*P,0.1443*P,0,0,1,0.125*P,0.0722*P, "l",0.1875*P,0.3248*P],
        endCrestR = ["m",0,0, "c",0.5708*sx,0, 1.0595*sx,-0.4887*se, 1.5708*sx,-se, "s",sx,-se, 1.5708*sx,-se],
        endBottomR = ["m",0,0, "a",0.1443*P,0.1443*P,0,0,1,-0.125*P,0.0722*P],
        rootR   = ["c",-0.5708*sp,0, -1.0595*sp,0.4887*sr, -1.5708*sp,sr,"s",-sp,sr, -1.5708*sp,sr],
        endCap  = ["m",0,0, "l", 0.3847*P,-0.3969*P, 0,1.2269*P-Dc, -0.0722*P,-0.0722*P],
        endCrestL = ["m",0,0, "c",-0.5708*sx,0, -1.0595*sx,0.4887*se, -1.5708*sx,se, "s",-sx,se, -1.5708*sx,se],
        startL, startR, startE,
        flankL, endFlankR, end;

    startL = ["M",P/16,Dc/2];
    flankL = startL.concat(topL).concat(rootL).concat(bottomL);
    // for closed shape: flankL.concat(crestL);

    startR = ["M",P/2, sr];
    endFlankR  = startR.concat(endTopR).concat(endCrestR).concat(endBottomR);
    // for closed shape: endFlankR.concat(rootR);

    startE = ["M",13*P/16, Dc/2-H/4];
    end = startE.concat(endCap);
    // for closed shape: end.concat(endCrestL);

    return flankL.concat(endFlankR).concat(end);
  };

  genHexHeadOutline = function(diameter, length)
  {
    function r3p(x1,y1, x2,y2, x3,y3) // radius of circle through 3 given points
    {
      var num = Math.sqrt(((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))*((x2-x3)*(x2-x3)+
                          (y2-y3)*(y2-y3))*((x3-x1)*(x3-x1)+(y3-y1)*(y3-y1))),
          den = 2*Math.abs(x1*y2+x2*y3+x3*y1-x1*y3-x2*y1-x3*y2);

      return num/den;
    }

    var P = prefPitch[diameter],
        Dc = diameter,
        t = 2*Dc/3,                                              // thickness of head
        daf = (Dc>10)? Math.round(1.5*Dc): Math.round(1.625*Dc), // across flats (valid M5..M33)
        dap = 2*daf/Math.sqrt(3),                                // diameter across the points
        dx = Math.tan(30*Math.PI/180)*(dap-daf)/2,   // 30deg chamfer cuts dx off hex points
        f = dap/2,                      // width of flats
        r1 = r3p(dx,-f/2,0,0,dx,f/2),   // radius of flat top edge
        pr1 = r3p(dx,-f/4,0,0,dx,f/4),  // projected (turn by 60deg) r1
        fEdge = t - dx,                 // length of flat axial edges
        turns = Math.ceil((2*Dc+6)/P),  // Thread length is (2*Dc+6)mm
        slen = length - (turns+1)*P,        // shank length from start of thread to base of head
        sp = 0.15915*P,
        sc = 0.5*Dc,               // crest profile Y coordinate scale factor
        crestR, shankData, headData, arcsData, topData;

    crestR  = ["M", P/16,Dc/2, "c",0.5708*sp,0, 1.0595*sp,-0.4887*sc, 1.5708*sp,-sc,"s",sp,-sc, 1.5708*sp,-sc];
    shankData = ["M", 9*P/16,-Dc/2, "L", -slen, -Dc/2, "M", P/16,Dc/2, "L", -slen, Dc/2];
    headData = ["M", -slen-fEdge,-dap/2, "L",-slen,-dap/2, -slen,dap/2, -slen-fEdge,dap/2,
                "M", -slen,f/2, "L",-slen-fEdge,f/2, "M", -slen,-f/2, "L",-slen-fEdge,-f/2];
    arcsData = ["M", -slen-fEdge,-dap/2, "A", pr1,pr1,0,0,0,-slen-fEdge,-f/2,
                "A", r1,r1,0,0,0,-slen-fEdge,f/2, "A", pr1,pr1,0,0,0,-slen-fEdge,dap/2];
    topData = ["M", -slen-t,-3*f/4, "L", -slen-t,3*f/4];

    return crestR.concat(shankData).concat(headData).concat(arcsData).concat(topData);
  };

}());
