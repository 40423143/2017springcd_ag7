/*===================================================================
  Filename: CangoAxes-1v34.js
  Rev 1
  By: Dr A.R.Collins

  Description: Adds Axes drawing methods and Arrow
  drawing methods and drawHTMLtext to the Cango graphics
  library. Also adds the global utility functions:
  sprintf, toEngFixed, toEngPrec, engNotation.

  License: Released into the public domain
  link to latest version at
  <http://www/arc.id.au/CanvasGraphics.html>
  Report bugs to tony at arc.id.au

  Date    Description                                            |By
  -------------------------------------------------------------------
  30Apr14 First beta                                              ARC
  06May14 Don't set color=null to get cgo.penCol                  ARC
  10May14 Added sprintf
          Added arrowArc                                          ARC
  11May14 Rev 1.00 released                                       ARC
  30May14 Mod to handle no fontWeight in compileText              ARC
  25Jul14 Use Javascript Module format                            ARC
  29Jul14 Abandon isoGC it gives rounding errors                  ARC
  07Aug14 Add renderBoxText                                       ARC
  13Aug14 bugfix: toEngFixed not exported as global               ARC
  14Aug14 bugfix: toEngPrec allowed 1.00e+2                       ARC
  08Nov14 Convert labels to use default font size                 ARC
  21Nov14 Stretch the background of boxtext by 10%                ARC
  07Feb15 Removed conditionals for inverted axes                  ARC
  08Feb15 Update for Cango Ver 6                                  ARC
  14Feb15 bugfix: arrowArc had bad sweep calc for inverted coords ARC
  25Feb15 Re-write to use 'options' object to pass parameters     ARC
  27Feb15 Add 'auto' as an option for major tic values
          Drop drawXYaxes all covered by drawAxes with options
          Rename some optional parameters for clarity
          Allow strokeCVolor and fillColor for text as options
          Converted drawBoxAxes to new options style              ARC
  28Feb15 Add largeArc optional parameter to arrowArc
          enable drawBoxAxes labels to be inverted                ARC
  01Mar15 Fixed arrowArc for inverted version                     ARC
  04Mar15 Change arrowArc arguments use 'clockwise' drop largeArc ARC
  05Mar15 Re-wrote arrow so that it requires iso to be set like
          arrowArc and other fixed shapes
          bugfix: bad test for xmin, xmax etc being undefined     ARC
  06Mar15 bugfix: boxAxes yTickInterval should default to 'auto'  ARC
  11Mar15 Make tickLength a property                              ARC
  13Mar15 Fix label positions for SVG coordinate space            ARC
  18Mar15 Added font properties as options for Axes & BoxAxes     ARC
  13Oct15 Allow xTickInterval=0, yTickInerval=0 to mean no ticks  ARC
  23Dec15 Remove arrowArc and arrow (now shapeDefs)               ARC
  13Jun16 Drop renderBoxText, functionality has moved into core   ARC
 ====================================================================*/

var sprintf, toEngFixed, toEngPrec;

Cango = (function(CangoCore)
{
  "use strict";

  toEngFixed = function(val, decPlaces)      // rounds to X dec places and no stripping of 0s
  {
    var unit = "pnum kMG",
        man, pwr,
        expt = 0,
        str = "";

    if ((decPlaces === undefined)||(decPlaces<0)||(decPlaces>10))
    {
      decPlaces = 2;
    }
    man = 0.0;
    if (Math.abs(val)>1.0E-12)
    {
      pwr = Math.log(Math.abs(val))/(3.0*Math.LN10);
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to decPlaces
    str = man.toFixed(decPlaces);
    // now add the symbol for the exponent
    return str+unit.charAt(expt/3+4);
  };

  toEngPrec = function(val, sigFigs)      // rounds to X dec places and no stripping of 0s
  {
    var unit = "pnum kMG",
        man, pwr, delta,
        expt = 0,
        str = "";

    if ((sigFigs === undefined)||(sigFigs<3)||(sigFigs>10))
    {
      sigFigs = 3;
    }
    man = 0.0;
    delta = 1+Math.pow(10, -sigFigs);
    if (Math.abs(val)>1.0E-12)
    {
      pwr = Math.log(Math.abs(delta*val))/(3.0*Math.LN10);
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to sigFigs
    str = (1000*man).toPrecision(sigFigs);
    str = (parseFloat(str, 10)/1000).toString();
    // now add the symbol for the exponent
    return str+unit.charAt(expt/3+4);
  };

  function isArray(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isNumber(o)
  {
    return !isNaN(o) && o !== null && o !== "" && o !== false;
  }

  function engNotation(val, tenthsOK)        // rounds to 2 dec places and strips trailing 0s
  {
    var unit = "pnum kMG",
        man = 0.0,
        pwr,
        expt = 0,
        str = "";

    if (Math.abs(val)>1.0E-12)
    {
      if (tenthsOK)
      {
        pwr = Math.log(Math.abs(10*val))/(3.0*Math.LN10); // calc exp on 10 x val allows .9 not 900m
      }
      else
      {
        pwr = Math.log(Math.abs(val))/(3.0*Math.LN10);
      }
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to decPlaces
    str = man.toFixed(2);
    // now strip trailing 0s
    while (str.charAt(str.length-1) === '0')
    {
      str = str.substring(0,str.length-1);
    }
    if (str.charAt(str.length-1) === '.')
    {
      str = str.substring(0,str.length-1);
    }
    // now add the symbol for the exponent
    if (expt)
    {
      return str+unit.charAt(expt/3+4);
    }

    return str;                   // dont add unnecessary space
  }

  function AxisTicsAuto(mn, mx, majorStep)
  {
    /* Calculate the tic mark spacing for graph plotting
     * Given the minimum and maximum values of the axis
     * returns the first tic value and the tic spacing.
     * The algorithm gives tic spacing of 1, 2, 5, 10, 20 etc
     * and a number of ticks from ~5 to ~11
     */
    var mj = majorStep || 0,
        dx,		// tolerance for avoiding maths noise
        pwr, spanman, stepman,
        stepVal,
        spanexp, stepexp;

    this.tic1 = 0;
    this.ticStep = 0;
    this.lblStep = 0;

    if (mn>=mx)
    {
      alert("Max must be greater than Min!");
      return;
    }

    pwr = Math.log(mx-mn)/Math.LN10;
    if (pwr<0.0)
    {
      spanexp = Math.floor(pwr) - 1;
    }
    else
    {
      spanexp = Math.floor(pwr);
    }
    spanman = (mx-mn)/Math.pow(10.0, spanexp);
    if(spanman>=5.5)
    {
      spanexp += 1;
      spanman /= 10.0;
    }
    stepman = 0.5;
    if(spanman<2.2)
    {
      stepman = 0.2;
    }
    if(spanman<1.1)
    {
      stepman = 0.1;
    }
    stepexp = 3*Math.floor(spanexp/3);
    if((spanexp < 0)&&(spanexp%3 !== 0))
    {
      stepexp -= 3;
    }
    stepVal = stepman*Math.pow(10.0, (spanexp-stepexp));
    this.ticStep = stepVal*Math.pow(10.0, stepexp);

    if(mn>=0.0)
    {
      this.tic1 = (Math.floor((mn/this.ticStep)-0.01)+1)*this.ticStep;   // avoid math noise
    }
    else
    {
      this.tic1 = -Math.floor((-mn/this.ticStep)+0.01)*this.ticStep;   // avoid math noise
    }

    // Calc the step size between major/labeled tics, it must be a multiple of ticStep
    stepman *= 10;  // now 1, 2 or 5
    if (mj === "auto")
    {
      this.lblStep = (stepman === 0.2)? this.ticStep*5: this.ticStep*2;
    }
		else if (mj>0)
		{
			this.lblStep = this.ticStep*Math.round(mj/this.ticStep);
		}
		dx = 0.01*this.ticStep;
    this.lbl1 = this.lblStep*Math.ceil((mn-dx)/this.lblStep);

  /*  var str = "";
      str += "ymin="+mn+"  ymax="+mx+"\n";
      str += "tic1= "+this.tic1+ "\n";
      str += "ticStep= "+this.ticStep+ "\n";
      alert(str);
  */
  }

  function AxisTicsManual(xmin, xmax,	xMn, xMj)
	{
		var dx;		// tolerance for avoiding maths noise

    this.tic1 = 0;
    this.ticStep = 0;
    this.lbl1 = 0;
    this.lblStep = 0;
    this.ticScl = 0;     // reserved for future use

		if ((xmin===undefined)||(xmax===undefined)||(xMn===undefined)||(xMn<=0))
    {
			return;
    }

		dx = 0.01*xMn;
		this.tic1 = xMn*Math.ceil((xmin-dx)/xMn);
    this.ticStep = xMn;

		if ((xMj!==undefined)&&(xMj>0))
		{
			this.lblStep = this.ticStep*Math.round(xMj/xMn);
			dx = 0.01*xMn;
			this.lbl1 = this.lblStep*Math.ceil((xmin-dx)/this.lblStep);
		}
    // OPTION:
    // to make all labels have same scale factor, calc lastTic and corresponding tag "m kMG" etc
    // calc engnotation for xTic1 exp=xTicScl, tag=xTicTag
    // plot x = xtic1 + n*xTicStep
    // label x/xTicScl+xTicTag
	}

  function setPropertyValue(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xorigin":
        this.xOrg = value;
        break;
      case "yorigin":
        this.yOrg = value;
        break;
      case "xmin":
        this.xMin = value;
        break;
      case "xmax":                 // for backward compatability
        this.xMax = value;
        break;
      case "ymin":
        this.yMin = value;
        break;
      case "ymax":
        this.yMax = value;
        break;
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "xlabel":
        if (typeof value === "string")
        {
          this.xLabel = value;
        }
        break;
      case "ylabel":
        if (typeof value === "string")
        {
          this.yLabel = value;
        }
        break;
      case "xtickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
        this.yMinTic = value;
        break;
      case "xlabelinterval":
        this.xMajTic = value;
        break;
      case "ylabelinterval":                 // for backward compatability
        this.yMajTic = value;
        break;
      case "ticklength":
        this.tickLength = value;
        break;
      case "labelticklength":
        this.majTickLength = value;
        break;
      case "x10thsok":
        this.x10ths = (value === true);
        break;
      case "y10thsok":
        this.y10ths = (value === true);
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
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
      default:
        return;
    }
  }

  function setBoxAxesProperties(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "title":
        if (typeof value === "string")
        {
          this.title = value;
        }
        break;
      case "xtickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
        this.yMinTic = value;
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "gridcolor":
        this.fillColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
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
      default:
        return;
    }
  }

  CangoCore.prototype.drawAxes = function(xMin, xMax, yMin, yMax, options)
  {
    var opt, prop,
        x, y,
        pos,
        data = [],
        ticLen,
        majTicLen,
        xLblOfs = 9/this.yscl,   // will remain 9 when converted to pixels
        yLblOfs = 9/this.xscl,    // pixels
        dataCmds,
        xOfs = 40,
        yOfs = 40,      // pixels
      	lorg = 1,
        side = 1,                 // 1 or -1 depending on the side of the axis to label
        xU = "", yU = "",
        xL = "", yL = "",
        isoGC,                    // for plotting in pixels
        tickCmds, bigTickCmds,
        xTics, yTics,
        parms = {
          xOrg: xMin || 0,     // default to edge of plot area
          yOrg: yMin || 0,
          xMinTic: "auto",
          yMinTic: "auto",
          xMajTic: "auto",
          yMajTic: "auto",
          tickLength: 7,      // in pixels (default = 7 pixels)
          majTickLength: 10,
          x10ths: false,
          y10ths: false,
          xUnits: "",
          yUnits: "",
          xLabel: "",
          yLabel: "",
          strokeColor: null,
          fillColor: null,
          fontSize: null,
          fontWeight: null,
          fontFamily: null,
          setProperty: setPropertyValue };

    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opt[prop]);
      }
    }

    // to get uniform label positions create a isotropic
    // set of world coords where x axis is 100 units
    isoGC = new Cango(this.cId);   // copy the canvas ID from current context
    isoGC.dupCtx(this);
    isoGC.setGridboxSVG();        // full screen pixels style (=SVG)
    isoGC.setWorldCoords();        // pixel coords

    // draw all ticks defined in pixels and drawn in world coords (convert px/cgo.xscl with iso=true)
    ticLen = parms.tickLength/this.xscl;     // in pixels (default = 5 pixels)
    majTicLen = parms.majTickLength/this.xscl;     // in pixels (default = 10 pixels)
    tickCmds = new Cobj(['M', -ticLen/2, 0, 'L', ticLen/2, 0], "PATH", {
      'iso':true,
      'strokeColor':parms.strokeColor});
    bigTickCmds = new Cobj(['M', -majTicLen/2, 0, 'L', majTicLen/2, 0], "PATH", {
      'iso':true,
      'strokeColor':parms.strokeColor});

    if ((parms.xMinTic === undefined)||(parms.xMinTic === null)||(parms.xMinTic === "auto"))  // xMinTic===0 means no x ticks
    {
      xTics = new AxisTicsAuto(xMin, xMax, parms.xMajTic);
    }
    else
    {
      xTics = new AxisTicsManual(xMin, xMax, parms.xMinTic, parms.xMajTic);
    }
    if ((parms.yMinTic === undefined)||(parms.yMinTic === null)||(parms.yMinTic === "auto"))  // yMinTic===0 means no y ticks
    {
      yTics = new AxisTicsAuto(yMin, yMax, parms.yMajTic);
    }
    else
    {
      yTics = new AxisTicsManual(yMin, yMax, parms.yMinTic, parms.yMajTic);
    }

    // draw axes
    data = ['M', xMin, parms.yOrg, 'L', xMax, parms.yOrg, 'M', parms.xOrg, yMin, 'L', parms.xOrg, yMax];
    this.drawPath(data, 0, 0, {"strokeColor":parms.strokeColor});
    // X axis tick marks
    if (xTics.ticStep)
    {
      for(x=xTics.tic1; x<=xMax; x+=xTics.ticStep)
      {
        this.render(tickCmds, x, parms.yOrg, 1, -90);     // maintain aspect ratio, rotate 90deg
      }
    }
    // Y axis tick marks
    if (yTics.ticStep)
    {
      for(y=yTics.tic1; y<=yMax; y+=yTics.ticStep)
      {
        this.render(tickCmds, parms.xOrg, y, 1, 0);
      }
    }
    // major ticks X axis
    if (xTics.lblStep)
    {
      for(x=xTics.lbl1; x<=xMax; x+=xTics.lblStep)
      {
        this.render(bigTickCmds, x, parms.yOrg, 1, -90);
      }
    }
    // major ticks Y axis
    if (yTics.lblStep)
    {
      for(y=yTics.lbl1; y<=yMax; y+=yTics.lblStep)
      {
        this.render(bigTickCmds, parms.xOrg, y, 1, 0);
      }
    }

    // now label the axes
		if (xTics.lblStep)
		{
    	// X axis, decide whether to label above or below X axis
  		if ((parms.yOrg<yMin+0.55*(yMax-yMin)) && (this.yscl<0))
    	{   // x axis on bottom half of screen
    		side = -1;
    		lorg = 2;
    	}
    	else
    	{
    	  side = 1;
    		lorg = 8;
    	}
    	for (x = xTics.lbl1; x<=xMax; x += xTics.lblStep)
    	{
  			// skip label at the origin if it would be on the other axis
  			if ((x===parms.xOrg)&&(parms.yOrg>yMin)&&(parms.yOrg<yMax))
        {
  				continue;
        }
        this.drawText(engNotation(x, parms.x10ths), x, parms.yOrg-side*xLblOfs, {
          "lorg":lorg,
          "fillColor":parms.fillColor,
          "fontSize":parms.fontSize,
          "fontWeight":parms.fontWeight,
          "fontFamily":parms.fontFamily });
    	}
    }

		if (yTics.lblStep)
		{
    	// Y axis, decide whether to label to right or left of Y axis
      if (parms.xOrg<xMin+0.5*(xMax-xMin))
    	{  // y axis on left half of screen
    		side = 1;
    		lorg = 6;
    	}
    	else
    	{
    	  side = 1;
    		lorg = 6;
    	}
    	for (y = yTics.lbl1; y<=yMax; y += yTics.lblStep)
    	{
  			// skip label at the origin if it would be on the other axis
  			if ((y===parms.yOrg)&&(parms.xOrg>xMin)&&(parms.xOrg<xMax))
        {
  				continue;
        }
        this.drawText(engNotation(y, parms.y10ths), parms.xOrg-side*yLblOfs, y, {
          "lorg":lorg,
          "fillColor":parms.fillColor,
          "fontSize":parms.fontSize,
          "fontWeight":parms.fontWeight,
          "fontFamily":parms.fontFamily});
    	}
    }

    if (parms.xUnits.length>0)
    {
      xU = "("+parms.xUnits+")";
    }
    if (parms.yUnits.length>0)
    {
      yU = "("+parms.yUnits+")";
    }

    if (parms.xLabel.length>0)
    {
      xL = parms.xLabel;
    }
  	if (((parms.yOrg<yMin+0.55*(yMax-yMin)) && !(this.yscl<0))||((parms.yOrg>yMin+0.45*(yMax-yMin)) && (this.yscl<0)))
    {
      side = -1;
      lorg = 3;
    }
    else
    {
      side = 1;
      lorg = 9;
    }
    pos = this.toPixelCoords(xMax, parms.yOrg);
    dataCmds = new Cobj(xL+xU, "TEXT", {
      "lorg":lorg,
      "fillColor":parms.fillColor,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    isoGC.render(dataCmds, pos.x, pos.y + side*xOfs);

    if (parms.yLabel.length>0)
    {
      yL = parms.yLabel;
    }
  	// Y axis, decide whether to label to right or left of Y axis
  	if (parms.xOrg<xMin+0.5*(xMax-xMin))
  	{
  		// y axis on left half of screen
  		side = -1;
      lorg = (this.yscl>0)? 7: 9;
  	}
  	else
  	{
  	  side = 1;
      lorg = (this.yscl>0)? 1: 3;
  	}
    pos = this.toPixelCoords(parms.xOrg, yMax);
    dataCmds = new Cobj(yL+yU, "TEXT", {
      "lorg":lorg,
      "fillColor":parms.fillColor,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    isoGC.render(dataCmds, pos.x + side*yOfs, pos.y, 1, -90);
  };

  CangoCore.prototype.drawBoxAxes = function(xMin, xMax, yMin, yMax, options)
  {
		var opt, prop,
        pos,
        x, y,
        data = [],
        ticLen = 4/this.xscl,     // will be 4 when converted to pixels
        xLblOfs = 8/this.yscl,    // pixels
        yLblOfs = 8/this.xscl,    // pixels
        lorg,
      	lbl, lbl2 = "/div",
        tickCmds,
        tickRot = (this.yscl<0)? 90: -90,
    		xTics, yTics,
        parms = {
          xMinTic: "auto",
          yMinTic: "auto",
          xUnits: "",
          yUnits: "",
          title: "",
          strokeColor: '#ffffff',
          fillColor: '#cccccc',
          gridColor: 'rgba(255,255,255,0.2)',
          fontSize: null,
          fontWeight: null,
          fontFamily: null,
          setProperty: setBoxAxesProperties };

    if (this.yscl<0)
    {
      xLblOfs *= -1;
    }
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opt[prop]);
      }
    }

    tickCmds = new Cobj(['M', 0, 0, 'L', -ticLen, 0], "PATH", {"strokeColor":parms.strokeColor, 'iso':true});

    if ((!parms.xMinTic)||(parms.xMinTic === "auto"))
    {
      xTics = new AxisTicsAuto(xMin, xMax);
    }
    else
    {
      xTics = new AxisTicsManual(xMin, xMax, parms.xMinTic);
    }
    if ((!parms.yMinTic)||(parms.yMinTic === "auto"))
    {
      yTics = new AxisTicsAuto(yMin, yMax);
    }
    else
    {
      yTics = new AxisTicsManual(yMin, yMax, parms.yMinTic);
    }
		// Draw box axes
    data = ['M', xMin, yMin, 'L', xMin, yMax, xMax, yMax, xMax, yMin, 'z'];
    this.drawPath(data, 0, 0, {"strokeColor":parms.fillColor});

  	for (x=xTics.tic1; x<=xMax; x += xTics.ticStep)
  	{
      this.render(tickCmds, x, yMin, 1, tickRot);  // just draw the tick mark
      if ((x !== xMin)&&(x !== xMax))        // no dots on the box
      {
        this.drawPath(['M', x, yMin, 'L', x, yMax], 0, 0, {"strokeColor":'rgba(255,255,255,0.2)'});
      }
  	}
  	for (y=yTics.tic1; y<=yMax; y += yTics.ticStep)
  	{
      this.render(tickCmds, xMin, y, 1, 0);      // just draw the tick mark
      if ((y !== yMin)&&(y !== yMax))
      {
        this.drawPath(['M', xMin, y, 'L', xMax, y], 0, 0, {"strokeColor":'rgba(255,255,255,0.2)'});
      }
  	}
		// Now labels, X axis, label only first and last tic below X axis
    lorg = (this.yscl<0)? 1: 7;
		x = xTics.tic1;
    this.drawText(engNotation(x), x, yMin - xLblOfs, {
      "fillColor":parms.fillColor,
      "lorg":lorg,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
  	while(x+xTics.ticStep <= 1.05*xMax)
    {
  		x += xTics.ticStep;
    }
    lorg = (this.yscl<0)? 3: 9;
    pos = this.toPixelCoords(x, yMin);
    this.drawText(engNotation(x), x, yMin - xLblOfs, {
      "fillColor":parms.fillColor,
      "lorg":lorg,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });

		// Y axis, label bottom and top tics to left of Y axis
 		y = yTics.tic1;
    pos = this.toPixelCoords(xMin, y);
    this.drawText(engNotation(y), xMin - yLblOfs, y, {
      "fillColor":parms.fillColor,
      "lorg":6,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
  	while (y + yTics.ticStep <= 1.05*yMax)
    {
			y += yTics.ticStep;
    }
    this.drawText(engNotation(y), xMin - yLblOfs, y, {
      "fillColor":parms.fillColor,
      "lorg":6,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    // x axis label
    if (typeof parms.xUnits === "string")
    {
      lbl = engNotation(xTics.ticStep)+parms.xUnits+"/div";
    }
    else
    {
      lbl = engNotation(xTics.ticStep)+"/div";
    }
    lorg = (this.yscl<0)? 2: 8;
    x = xMin+(xMax-xMin)/2;
    pos = this.toPixelCoords(x, yMin);
    this.drawText(lbl, x, yMin - xLblOfs, {
      "fillColor":parms.fillColor,
      "lorg":lorg,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    // y axis label
    if (parms.yUnits.length)
    {
      lbl = engNotation(yTics.ticStep)+parms.yUnits;
    }
    else
    {
      lbl = engNotation(yTics.ticStep);
    }
    if (this.yscl<0)
    {
      lbl2 = lbl.slice(0);       // copy lbl
      lbl = "/div";              // swap them
    }
    y = yMin+(yMax-yMin)/2;
    pos = this.toPixelCoords(xMin, y);
    this.drawText(lbl, xMin - yLblOfs, y-xLblOfs, {
      "fillColor":parms.fillColor,
      "lorg":6,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    y = yMin+(yMax-yMin)/2;
    this.drawText(lbl2, xMin - yLblOfs, y+xLblOfs, {
      "fillColor":parms.fillColor,
      "lorg":6,
      "fontSize":parms.fontSize,
      "fontWeight":parms.fontWeight,
      "fontFamily":parms.fontFamily });
    // title
    lorg = (this.yscl<0)? 7: 1;
    if (typeof parms.title === "string")
    {
      this.drawText(parms.title, xMin, yMax + xLblOfs, {
        "fillColor":parms.fillColor,
        "lorg":lorg,
        "fontSize":parms.fontSize,
        "fontWeight":parms.fontWeight,
        "fontFamily":parms.fontFamily });
    }
	};

  CangoCore.prototype.drawHTMLtext = function(str, x, y, color, fontSz, fontWt)
  {
    var size = fontSz || this.fontSize,   // fontSize in pts
        weight = this.fontWeight,         // default = 400
        p, topPx, leftPx,
        xOfs = x || 0,
        yOfs = y || 0,
        txtCol = this.penCol,
        divNode;

    function createHTMLoverlay(gc)
    {
      var ovlHTML, newOvl,
          ovlId,
          cvs = gc.cnvs,
          currOvl;

      ovlId = gc.cId+"_aovl_";
      // create 1px square DIV place at top left to give position reference to HTML children
      ovlHTML = "<div id='"+ovlId+"' style='position:absolute; width:1px; height:1px;'></div>";
      if (document.getElementById(ovlId))
      {
        currOvl = document.getElementById(ovlId);
        currOvl.parentNode.removeChild(currOvl);
      }
      cvs.insertAdjacentHTML('afterend', ovlHTML);
      // make it the same size as the background canvas
      newOvl = document.getElementById(ovlId);
      newOvl.style.backgroundColor = 'transparent';
      newOvl.style.left = gc.cnvs.offsetLeft+'px';
      newOvl.style.top = gc.cnvs.offsetTop+'px';
      newOvl.style.fontFamily = gc.fontFamily;
      newOvl.style.lineHeight = '1.4em';

      return newOvl;
    }

    if (document.getElementById(this.cId+"_aovl_") === null)
    {
      this.cnvs.alphaOvl = createHTMLoverlay(this);
    }
    if (typeof str !== 'string')
    {
      return;
    }
    if (typeof fontWt === 'string')
    {
      weight = fontWt;           // 'bold' etc
    }
    else if (isNumber(fontWt) && (fontWt >= 100) && (fontWt <= 900))
    {
      weight = fontWt;           // 100 .. 900
    }
    if (typeof color === "string")
    {
      txtCol = color;
    }

    size *= 1.3;    // size = 1em, convert to pixels

    divNode = document.createElement("div");
    divNode.style.position = "absolute";
    divNode.style.backgroundColor = "transparent";
    // to calc label top position
    p = this.toPixelCoords(xOfs, yOfs);
    // style the div depending of the lorg value eg set text-align to left right or center
    topPx = p.y.toFixed(0);
    leftPx = p.x.toFixed(0);
    divNode.style.cssText += "top:"+topPx+"px; left:"+leftPx+"px; color:"+txtCol+"; font-size:"+size+"px; font-weight:"+weight;
    divNode.innerHTML = str;
    this.cnvs.alphaOvl.appendChild(divNode);
  };

 /* ==========================================================================
  // http://kevin.vanzonneveld.net
  // +   original by: Ash Searle (http://hexmen.com/blog/)
  // + namespaced by: Michael White (http://getsprink.com)
  // +    tweaked by: Jack
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Paulo Freitas
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Dj
  // +   improved by: Allidylls
  // *     example 1: sprintf("%01.2f", 123.1);
  // *     returns 1: 123.10
  // *     example 2: sprintf("[%10s]", 'monkey');
  // *     returns 2: '[    monkey]'
  // *     example 3: sprintf("[%'#10s]", 'monkey');
  // *     returns 3: '[####monkey]'
  // *     example 4: sprintf("%d", 123456789012345);
  // *     returns 4: '123456789012345'
 *==========================================================================*/
  sprintf = function()
  {
    var regex = /%%|%(\d+\$)?([\-\+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,
        a = arguments,
        i = 0,
        format = a[i++];

    function pad(str, len, chr, leftJustify)
    {
      var padding;

      if (!chr)
      {
        chr = ' ';
      }
      padding = (str.length >= len) ? '' : new Array(1 + len - str.length).join(chr);
      return leftJustify ? str + padding : padding + str;
    }

    // justify()
    function justify(value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
    {
      var diff = minWidth - value.length;
      if (diff > 0)
      {
        if (leftJustify || !zeroPad)
        {
          value = pad(value, minWidth, customPadChar, leftJustify);
        }
        else
        {
          value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
        }
      }
      return value;
    }

    // formatBaseX()
    function formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad)
    {
      // Note: casts negative numbers to positive ones
      var number = value >> 0;
      prefix = prefix && number && ({'2': '0b','8': '0', '16': '0x'}[base] || '');
      value = prefix + pad(number.toString(base), precision || 0, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    }

    // formatString()
    function formatString(value, leftJustify, minWidth, precision, zeroPad, customPadChar)
    {
      if (precision !== null)
      {
        value = value.slice(0, precision);
      }
      return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    }

    // doFormat()
    function doFormat(substring, valueIndex, flags, minWidth, _, precision, type)
    {
      var number,
          prefix,
          method,
          textTransform,
          value,
          leftJustify = false,
          positivePrefix = '',
          zeroPad = false,
          prefixBaseX = false,
          customPadChar = ' ',
          flagsl = flags.length,
          j;

      if (substring === '%%')
      {
        return '%';
      }

      for (j = 0; flags && j < flagsl; j++)
      {
        switch (flags.charAt(j))
        {
          case ' ':
            positivePrefix = ' ';
            break;
          case '+':
            positivePrefix = '+';
            break;
          case '-':
            leftJustify = true;
            break;
          case "'":
            customPadChar = flags.charAt(j + 1);
            break;
          case '0':
            zeroPad = true;
            break;
          case '#':
            prefixBaseX = true;
            break;
        }
      }

      // parameters may be null, undefined, empty-string or real valued
      // we want to ignore null, undefined and empty-string values
      if (!minWidth)
      {
        minWidth = 0;
      }
      else if (minWidth === '*')
      {
        minWidth = +a[i++];
      }
      else if (minWidth.charAt(0) === '*')
      {
        minWidth = +a[minWidth.slice(1, -1)];
      }
      else
      {
        minWidth = +minWidth;
      }

      // Note: undocumented perl feature:
      if (minWidth < 0)
      {
        minWidth = -minWidth;
        leftJustify = true;
      }

      if (!isFinite(minWidth))
      {
        throw new Error('sprintf: (minimum-)width must be finite');
      }

      if (!precision)
      {
        precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
      }
      else if (precision === '*')
      {
        precision = +a[i++];
      }
      else if (precision.charAt(0) === '*')
      {
        precision = +a[precision.slice(1, -1)];
      }
      else
      {
        precision = +precision;
      }

      // grab value using valueIndex if required?
      value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

      switch (type)
      {
        case 's':
          return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
        case 'c':
          return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
        case 'b':
          return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'o':
          return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'x':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'X':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
        case 'u':
          return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'i':
        case 'd':
          number = +value || 0;
          number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
          prefix = number < 0 ? '-' : positivePrefix;
          value = prefix + pad(String(Math.abs(number)), precision, '0', false);
          return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case 'e':
        case 'E':
        case 'f': // Should handle locales (as per setlocale)
        case 'F':
        case 'g':
        case 'G':
          number = +value;
          prefix = number < 0 ? '-' : positivePrefix;
          method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
          textTransform = ['toString', 'toUpperCase'][('eEfFgG'.indexOf(type)) % 2];
          value = prefix + Math.abs(number)[method](precision);
          return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
        default:
          return substring;
      }
    }

    return format.replace(regex, doFormat);
  };

  return CangoCore;    // return the augmented Cango object, over-writing the existing

}(Cango));    // Take the existing Cango object and add Axes drawing methods

