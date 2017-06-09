/*=============================================================
  Filename: canvasStack1v06.js
  Rev: 1
  By: A.R.Collins
  Description: Utilities to create multiple transparent
  canvas layers suitable for animation.
  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/CanvasLayers.html>

  Date   |Description                                      |By
  -------------------------------------------------------------
  30Oct09 Rev 1.00 First release                            ARC
  08Sep12 bugfix: test for emulator failed in IE9           ARC
  02Mar13 Re-write to use screen canvas as background       ARC
  28Jul13 remove getOverlayCanvas (use getElementById)
          Tidy for JSLint                                   ARC
  20Jul14 Setup a resize handler for layers, required when
          canvas size changes on window resize (width in %).
          Dropped excanvas support                          ARC
  =============================================================*/

var CanvasStack;

(function()
{
  "use strict";

  if (addEvent === undefined)
  {
    var addEvent = function(element, eventType, handler)
    {
      if (element.attachEvent)
      {
       return element.attachEvent('on'+eventType, handler);
      }
      return element.addEventListener(eventType, handler, false);
    };
  }

  CanvasStack = function(cvsID)
  {
    var stkId, stackHTML,
        savThis = this;

    function resizeLayers()
    {
      var j, ovl,
          stk = document.getElementById(stkId),
          w = savThis.bkgCvs.offsetWidth,
          h = savThis.bkgCvs.offsetHeight;

      stk.style.width = w+"px";
      stk.style.height = h+"px";
      for (j=0; j<savThis.overlays.length; j++)
      {
        ovl = document.getElementById(savThis.overlays[j]);
        if (ovl)
        {
          ovl.style.width = w+'px';
          ovl.style.height = h+'px';
        }
      }
    }

    this.overlays = [];   // array of overlay canvases
    this.ovlyNumber = 0;  // counter to generate unique IDs
    this.bkgCvsId = cvsID;
    this.bkgCvs = document.getElementById(this.bkgCvsId);
    stkId = this.bkgCvsId+'_stk';
    // create a holder div for the stack of canvases
    stackHTML = "<div id='"+stkId+"' style='position:absolute;'></div>";
    this.bkgCvs.insertAdjacentHTML('afterend', stackHTML);
    // make it the same size as the background canvas
    this.stack = document.getElementById(stkId);
    this.stack.style.backgroundColor = "transparent";
    this.stack.style.left = this.bkgCvs.offsetLeft+'px';
    this.stack.style.top = this.bkgCvs.offsetTop+'px';
    this.stack.style.width = this.bkgCvs.offsetWidth+'px';
    this.stack.style.height = this.bkgCvs.offsetHeight+'px';

    addEvent(window, 'resize', resizeLayers);
  };

  CanvasStack.prototype.getBackgroundCanvasId = function()
  {
    return this.bkgCvsId;
  };

  CanvasStack.prototype.getBackgroundCanvas = function()
  {
    return this.bkgCvs;
  };

  CanvasStack.prototype.createLayer = function()
  {
    var newCvs = document.createElement('canvas'),
        ovlId = this.bkgCvsId+"_ovl_"+this.ovlyNumber;

    this.ovlyNumber++;   // increment the count to make unique ids
    newCvs.setAttribute('id', ovlId);
    newCvs.setAttribute('width', this.bkgCvs.offsetWidth);
    newCvs.setAttribute('height', this.bkgCvs.offsetHeight);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.position = "absolute";
    newCvs.style.left = "0px";
    newCvs.style.top = "0px";
    newCvs.style.width = this.bkgCvs.offsetWidth+'px';
    newCvs.style.height = this.bkgCvs.offsetHeight+'px';

    this.stack.appendChild(newCvs);
    // save the ID in an array to facilitate removal
    this.overlays.push(ovlId);

    return ovlId;    // return the new canavs id for call to getGraphicsContext
  };

  CanvasStack.prototype.deleteLayer = function(ovlyId)
  {
    var i, ovlNode, idx = -1;
    for (i=0; i<this.overlays.length; i++)
    {
      if (this.overlays[i] === ovlyId)
      {
        idx = i;
        break;
      }
    }
    if (idx === -1)
    {
      alert("overlay not found");
      return;
    }
    ovlNode = document.getElementById(ovlyId);
    if (!ovlNode)       // there is a id stored but no actual canvas
    {
      alert("overlay node not found");
    }
    else
    {
      this.stack.removeChild(ovlNode);
    }
    // now delete _overlay array element
    this.overlays.splice(idx,1);       // delete the id
  };

  CanvasStack.prototype.deleteAllLayers = function()
  {
    var i, ovlNode;
    for (i=this.overlays.length-1; i>=0; i--)
    {
      ovlNode = document.getElementById(this.overlays[i]);
      if (ovlNode)
      {
        this.stack.removeChild(ovlNode);
      }
      // now delete overlays array element
      this.overlays.splice(i,1);
    }
  };

}());
