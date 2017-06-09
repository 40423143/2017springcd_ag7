/*============================================================
  Filename: CangoDragAndDrop-2v00.js
  Rev 2
  By: A.R.Collins

  Description: Adds Drag and Drop handlers for Cango
  graphics.

  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/>

  Date    Description                                    |By
  -----------------------------------------------------------
  25Jul14 First release split off from Cango 5v16         ARC
  19Sep14 Reuse objects don't make new and depend on GC   ARC
  22Nov14 Rename DnD parent to target for clarity         ARC
  17Dec15 Add the zoom & pan utility to this module       ARC
 ============================================================*/

var initZoomPan;

Cango = (function(CangoCore)
{
  "use strict";

  function DnD(grabFn, dragFn, dropFn)
  {
    var savThis = this,
        nLrs, topCvs;

    this.cgo = null;                 // grahics context used, updated at render
    this.layer = null;    // layer Obj that DnD is working on, updated at render
    this.target = null;
    this.grabCallback = grabFn || null;
    this.dragCallback = dragFn || null;
    this.dropCallback = dropFn || null;
    this.dwgOrg = {x:0, y:0};           // target (Cobj) drawing origin in world coords
    this.grabOfs = {x:0, y:0};          // csr offset from target (Cobj) drawing origin

    this.grab = function(evt)
    {
      var event = evt||window.event,
          csrPosWC;

      // calc top canvas at grab time since layers can come and go
      nLrs = this.cgo.bkgCanvas.layers.length,
      topCvs = this.cgo.bkgCanvas.layers[nLrs-1].cElem;
      this.dwgOrg = this.target.dwgOrg;

      topCvs.onmouseup = function(e){savThis.drop(e);};
      topCvs.onmouseout = function(e){savThis.drop(e);};
      csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // copy the target drawing origin (for convenience)
      this.grabOfs.x = csrPosWC.x - this.dwgOrg.x;
      this.grabOfs.y = csrPosWC.y - this.dwgOrg.y;

      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }
      topCvs.onmousemove = function(e){savThis.drag(e);};
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
    }
  }

  function initDragAndDrop(savThis)
  {
    function dragHandler(evt)
    {
      var event = evt || window.event,
          csrPosX, csrPosY,
          testObj, nLyrs, lyr,
          j, k;

      function updateCursorPos(e)
      {
        // pass in any mouse event, returns the position of the cursor in raw pixel coords
        var rect = savThis.cnvs.getBoundingClientRect();

        csrPosX = e.clientX - rect.left;
        csrPosY = e.clientY - rect.top;
      }

      function hitTest(pathObj)
      {
        var i;
        // create the path (don't stroke it - no-one will see) to test for hit
        savThis.ctx.beginPath();
        if ((pathObj.type == 'TEXT')||(pathObj.type == 'IMG'))   // use bounding box not drawCmds
        {
          for (i=0; i<pathObj.bBoxCmds.length; i++)
          {
            savThis.ctx[pathObj.bBoxCmds[i].drawFn].apply(savThis.ctx, pathObj.bBoxCmds[i].parmsPx);
          }
        }
        else
        {
          for (i=0; i<pathObj.drawCmds.length; i++)
          {
            savThis.ctx[pathObj.drawCmds[i].drawFn].apply(savThis.ctx, pathObj.drawCmds[i].parmsPx);
          }
        }
/*
    // for diagnostics on hit region, uncomment
    savThis.ctx.strokeStyle = 'red';
    savThis.ctx.lineWidth = 4;
    savThis.ctx.stroke();
*/
        return savThis.ctx.isPointInPath(csrPosX, csrPosY);
      }

      updateCursorPos(event);
      nLyrs = savThis.bkgCanvas.layers.length;   // savThis is any Cango ctx on the canvas
      // run through all the registered objects and test if cursor pos is in their path
      loops:      // label to break out of nested loops
      for (j = nLyrs-1; j >= 0; j--)       // search top layer down the stack
      {
        lyr = savThis.bkgCanvas.layers[j];
        for (k = lyr.dragObjects.length-1; k >= 0; k--)  // search from last drawn to first (underneath)
        {
          testObj = lyr.dragObjects[k];
          if (hitTest(testObj))
          {
            // call the grab handler for this object (check it is still enabled)
            if (testObj.dragNdrop)
            {
              testObj.dragNdrop.grab(event);
              break loops;
            }
          }
        }
      }
    }

    // =========== Start Here ===========

    savThis.cnvs.onmousedown = dragHandler;   // added to all layers but only top layer will catch events
  }

  Cobj.prototype.enableDrag = function(grabFn, dragFn, dropFn)
  {
    // the DnD has the cango context saved as 'this.cgo'

    this.dragNdrop = new DnD(grabFn, dragFn, dropFn);
    // fill in the DnD properties for use by callBacks
    this.dragNdrop.target = this;
  };

  Cobj.prototype.disableDrag = function()
  {
    var aidx;

    if (!this.dragNdrop)
    {
      return;
    }
    // remove this object from array to be checked on mousedown
    // the DnD has the cango context saved as 'this.cgo'
    aidx = this.dragNdrop.layer.dragObjects.indexOf(this);
    this.dragNdrop.layers.dragObjects.splice(aidx, 1);
    this.dragNdrop = null;
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

    zpGC = new Cango(zpControlsId);
    // Zoom controls
    zpGC.clearCanvas();
    zpGC.setWorldCoords(-zpGC.rawWidth+44,-zpGC.rawHeight+44);

    // make a shaded rectiange for the controls
    bkg = new Cobj(shapeDefs.rectangle(114, 80), "SHAPE", {fillColor: "rgba(0, 50, 0, 0.12)"});
    bkg.translate(-17, 0);
    zpGC.render(bkg);

    rst = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    rst.enableDrag(null, null, resetZoomPan);
    zpGC.render(rst);

    rgt = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    // must always enable DnD before rendering !
    rgt.enableDrag(null, null, function(){pan(50, 0)});
    zpGC.render(rgt, 22, 0);

    up = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    up.enableDrag(null, null, function(){pan(0, -50)});
    zpGC.render(up, 0, 22);

    lft = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    lft.enableDrag(null, null, function(){pan(-50, 0)});
    zpGC.render(lft, -22, 0);

    dn = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    dn.enableDrag(null, null, function(){pan(0, 50)});
    zpGC.render(dn, 0, -22);

    zin = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    zin.enableDrag(null, null, function(){zoom(1/1.2)});
    zpGC.render(zin, -56, 11);

    zout = new Cobj(shapeDefs.rectangle(20, 20, 2), "SHAPE", {fillColor:"rgba(0,0,0,0.2)"});
    zout.enableDrag(null, null, function(){zoom(1.2)});
    zpGC.render(zout, -56, -11);

    zpGC.setPropertyDefault("strokeColor", "white");
    zpGC.setPropertyDefault("lineWidth", 2);
    arw = new Cobj(['m',-7,-2,'l',7,5,7,-5], "PATH");
    zpGC.render(arw, 0,22, 1, 0);
    zpGC.render(arw, 22,0, 1, -90);
    zpGC.render(arw, -22,0, 1, 90);
    zpGC.render(arw, 0,-22, 1, 180);
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

  var oldInit = CangoCore.prototype.initModules;   // function pointer

  CangoCore.prototype.initModules = function()
  {
    oldInit();
    initDragAndDrop(this);
  }

  return CangoCore;    // return the augmented Cango object, over-writing the existing

}(Cango));    // Take the existing Cango object and add Drag and Drop methods
