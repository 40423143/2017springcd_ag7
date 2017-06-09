var Cango,Path,Shape,Img,Text,LinearGradient,RadialGradient,DrawCmd,svgToCgoRHC,svgToCgoSVG,cgoRHCtoSVG,shapeDefs
!function(){"use strict"
function t(t,s,i){return t.attachEvent?t.attachEvent("on"+s,i):t.addEventListener(s,i,!0)}function s(t){var i,e=Array.isArray(t)?[]:{}
for(i in t)t[i]&&"object"==typeof t[i]?e[i]=s(t[i]):e[i]=t[i]
return e}function i(t){return"[object Array]"===Object.prototype.toString.call(t)}function e(t){return i(t)?t.reduce(function(t,s){var r=[].concat(s).some(i)
return t.concat(r?e(s):s)},[]):[t]}function r(t,s){if("string"==typeof t&&void 0!==s)switch(t.toLowerCase()){case"fillcolor":this.fillCol=s
break
case"strokecolor":this.strokeCol=s
break
case"linewidth":case"strokewidth":"number"==typeof s&&s>0&&(this.lineWidth=s)
break
case"linewidthwc":"number"==typeof s&&s>0&&(this.lineWidthWC=s)
break
case"linecap":if("string"!=typeof s)return;("butt"===s||"round"===s||"square"===s)&&(this.lineCap=s)
break
case"iso":case"isotropic":1==s||"iso"===s||"isotropic"===s?this.iso=!0:this.iso=!1
break
case"dashed":i(s)&&s[0]?this.dashed=s:this.dashed=null
break
case"dashoffset":this.dashOffset=s||0
break
case"border":1==s&&(this.border=!0),0==s&&(this.border=!1)
break
case"fontsize":"number"==typeof s&&s>0&&(this.fontSize=s)
break
case"fontweight":("string"==typeof s||"number"==typeof s&&s>=100&&900>=s)&&(this.fontWeight=s)
break
case"fontfamily":"string"==typeof s&&(this.fontFamily=s)
break
case"bgfillcolor":this.bgFillColor=s
break
case"imgwidth":this.width=Math.abs(s)
break
case"imgheight":this.height=Math.abs(s)
break
case"lorg":[1,2,3,4,5,6,7,8,9].indexOf(s)>-1&&(this.lorg=s)
break
case"shadowoffsetx":this.shadowOffsetX=s||0
break
case"shadowoffsety":this.shadowOffsetY=s||0
break
case"shadowblur":this.shadowBlur=s||0
break
case"shadowcolor":this.shadowColor=s
break
default:return}}function o(t,i){var e=s(t.drawCmds)
i?this.drawCmds=this.drawCmds.concat(e.slice(1)):this.drawCmds=this.drawCmds.concat(e)}function a(){function t(t){return t.reduceRight(function(t,s){return t.push(s[0],s[1]),t},[])}var s,i,e,r,o,a=null,h=[]
for("closePath"===this.drawCmds[this.drawCmds.length-1].drawFn?(s=this.drawCmds.slice(0,-1),a=this.drawCmds.slice(-1)):s=this.drawCmds.slice(0),i=s.length-1,e=s[i].parms.length,o=new DrawCmd("moveTo",s[i].parms[e-1]),h.push(o),s[i].parms=s[i].parms.slice(0,-1);i>0;)r=t(s[i].parms),e=s[i-1].parms.length,r=r.concat(s[i-1].parms[e-1]),o=new DrawCmd(s[i].drawFn,r),h.push(o),s[i-1].parms=s[i-1].parms.slice(0,-1),i--
a&&h.push(a),this.drawCmds=h}function h(t,s){this.id=t,this.cElem=s,this.dragObjects=[]}var n,d,l=0
n=function(){function t(t,s,i){return 0===i&&"string"!=typeof s&&t.push("M"),"string"==typeof s&&(g.hasOwnProperty(s.toUpperCase())||(console.log("unknown command string '"+s+"'"),t.badCmdFound=!0,t.length=0)),t.badCmdFound||t.push(s),t}function s(t,s,i,e){var r
if(0===i&&(t.nextCmdPos=0),"string"==typeof s){if(i<t.nextCmdPos)return console.log("bad number of parameters for '"+s+"' at index "+i),t.badParameter=!0,t.push(0),t
t.currCmd=s.toUpperCase(),t.uc=s.toUpperCase()===s,t.nextCmdPos=i+g[t.currCmd].parmCount+1,t.push(s)}else i<t.nextCmdPos?t.push(s):(t.currCmd=g[t.currCmd].extCmd,r=t.uc?t.currCmd:t.currCmd.toLowerCase(),t.push(r,s),t.nextCmdPos=i+g[t.currCmd].parmCount)
return i===e.length-1&&t.badParameter&&(t.length=0),t}function e(t,s){return"string"==typeof s&&t.push([]),t[t.length-1].push(s),t}function r(t,s,i){var e,r
return void 0===t.px&&(t.px=0,t.py=0),e=g[s[0].toUpperCase()],r=e.toAbs(t,s,i),t.push(r),t}function o(t,s,i){var e=s[0],r=g[e]
return r.toCangoVersion(t,s,i),t}function a(t){var s=t[0],i=t.slice(1)
return new DrawCmd(g[s].canvasMethod,i)}function h(t,s){var i,e,r=s[0]
return t.push(r),i=s.slice(1),e=i.match(/\S+/g),e&&e.forEach(function(s){var i=parseFloat(s)
isNaN(i)||t.push(i)}),t}function n(t){var s=t[0],i=g[s]
return i.invertCoords(t)}function d(t){var s=t[0],i=g[s],e=this.xOfs||0,r=this.yOfs||0
return i.addXYoffset(t,e,r)}function l(t,s){return t.concat(s)}var c=function(t,s,i,e,r,o,a,h){var n=h*r,d=-a*o,l=a*r,c=h*o,p=.5*(e-i),g=8/3*Math.sin(.5*p)*Math.sin(.5*p)/Math.sin(p),f=t+Math.cos(i)-g*Math.sin(i),u=s+Math.sin(i)+g*Math.cos(i),m=t+Math.cos(e),C=s+Math.sin(e),x=m+g*Math.sin(e),y=C-g*Math.cos(e)
return[n*f+d*u,l*f+c*u,n*x+d*y,l*x+c*y,n*m+d*C,l*m+c*C]},p=function(t,s,i,e,r,o,a,h,n){function d(t){return Math.abs(t)<1e-5?0:t}var l,p,g,f,u,m,C,x,y,v,w,b,O,W,P,k,X,Y,S,M,T,B,L=r*(Math.PI/180),H=Math.sin(L),I=Math.cos(L),N=Math.abs(i),A=Math.abs(e),E=I*(t-h)*.5+H*(s-n)*.5,D=I*(s-n)*.5-H*(t-h)*.5,F=E*E/(N*N)+D*D/(A*A),G=[]
for(F>1&&(F=Math.sqrt(F),N*=F,A*=F),l=I/N,p=H/N,g=-H/A,f=I/A,u=l*t+p*s,m=g*t+f*s,C=l*h+p*n,x=g*h+f*n,y=(C-u)*(C-u)+(x-m)*(x-m),v=1/y-.25,0>v&&(v=0),w=Math.sqrt(v),a===o&&(w=-w),b=.5*(u+C)-w*(x-m),O=.5*(m+x)+w*(C-u),W=Math.atan2(m-O,u-b),P=Math.atan2(x-O,C-b),k=P-W,0>k&&1===a?k+=2*Math.PI:k>0&&0===a&&(k-=2*Math.PI),X=Math.ceil(Math.abs(k/(.5*Math.PI+.001))),M=0;X>M;M++)T=W+M*k/X,B=W+(M+1)*k/X,Y=c(b,O,T,B,N,A,H,I),S=Y.map(d),G.push(S)
return G},g={M:{canvasMethod:"moveTo",parmCount:2,extCmd:"L",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2]
return e!==s[0]&&(r+=t.px,o+=t.py),i=[e,r,o],t.px=r,t.py=o,i},toCangoVersion:function(t,s){var i=s[1],e=s[2]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2]
return e+=s,r+=i,["M",e,r]},invertCoords:function(t){var s=t[1],i=t[2]
return["M",s,-i]}},L:{canvasMethod:"lineTo",parmCount:2,extCmd:"L",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2]
return e!==s[0]&&(r+=t.px,o+=t.py),i=[e,r,o],t.px=r,t.py=o,i},toCangoVersion:function(t,s){var i=s[1],e=s[2]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2]
return e+=s,r+=i,["L",e,r]},invertCoords:function(t){var s=t[1],i=t[2]
return["L",s,-i]}},H:{parmCount:1,extCmd:"H",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1]
return e!==s[0]&&(r+=t.px),i=[e,r],t.px=r,i},toCangoVersion:function(t,s){var i=s[1],e=t.py,r=["L",i,e]
t.px=i,t.push(r)},addXYoffset:function(t,s,i){var e=t[1]
return e+=s,["H",e]},invertCoords:function(t){var s=t[1]
return["H",s]}},V:{parmCount:1,extCmd:"V",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1]
return e!==s[0]&&(r+=t.py),i=[e,r],t.py=r,i},toCangoVersion:function(t,s){var i=t.px,e=s[1],r=["L",i,e]
t.py=e,t.push(r)},addXYoffset:function(t,s,i){var e=t[1]
return e+=i,["V",e]},invertCoords:function(t){var s=t[1]
return["V",-s]}},C:{canvasMethod:"bezierCurveTo",parmCount:6,extCmd:"C",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4],n=s[5],d=s[6]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py,n+=t.px,d+=t.py),i=[e,r,o,a,h,n,d],t.px=n,t.py=d,i},toCangoVersion:function(t,s){var i=s[5],e=s[6]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4],h=t[5],n=t[6]
return e+=s,r+=i,o+=s,a+=i,h+=s,n+=i,["C",e,r,o,a,h,n]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4],o=t[5],a=t[6]
return["C",s,-i,e,-r,o,-a]}},S:{parmCount:4,extCmd:"S",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py),i=[e,r,o,a,h],t.px=a,t.py=h,i},toCangoVersion:function(t,s,i){var e,r=0,o=0,a=s[1],h=s[2],n=s[3],d=s[4],l=t[i-1]
"C"===l[0]&&(r=t.px-l[l.length-4],o=t.py-l[l.length-3]),r+=t.px,o+=t.py,e=["C",r,o,a,h,n,d],t.px=n,t.py=d,t.push(e)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4]
return e+=s,r+=i,o+=s,a+=i,["S",e,r,o,a]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4]
return["S",s,-i,e,-r]}},Q:{canvasMethod:"quadraticCurveTo",parmCount:4,extCmd:"Q",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py),i=[e,r,o,a,h],t.px=a,t.py=h,i},toCangoVersion:function(t,s){var i=s[3],e=s[4]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4]
return e+=s,r+=i,o+=s,a+=i,["Q",e,r,o,a]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4]
return["Q",s,-i,e,-r]}},T:{parmCount:2,extCmd:"T",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2]
return e!==s[0]&&(r+=t.px,o+=t.py),i=[e,r,o],t.px=r,t.py=o,i},toCangoVersion:function(t,s,i){var e,r=0,o=0,a=s[1],h=s[2],n=t[i-1]
"Q"===n[0]&&(r=t.px-n[n.length-4],o=t.py-n[n.length-3]),r+=t.px,o+=t.py,e=["Q",r,o,a,h],t.px=a,t.py=h,t.push(e)},addXYoffset:function(t,s,i){var e=t[1],r=t[2]
return e+=s,r+=i,["T",e,r]},invertCoords:function(t){var s=t[1],i=t[2]
return["T",s,-i]}},A:{parmCount:7,extCmd:"A",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4],n=s[5],d=s[6],l=s[7]
return e!==s[0]&&(d+=t.px,l+=t.py),i=[e,r,o,a,h,n,d,l],t.px=d,t.py=l,i},toCangoVersion:function(t,s){var i,e=s[1],r=s[2],o=s[3],a=s[4],h=s[5],n=s[6],d=s[7]
i=p(t.px,t.py,e,r,o,a,h,n,d),i.forEach(function(s){t.push(["C"].concat(s))}),t.px=n,t.py=d},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4],h=t[5],n=t[6],d=t[7]
return n+=s,d+=i,["A",e,r,o,a,h,n,d]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4],o=t[5],a=t[6],h=t[7]
return["A",s,i,-e,r,1-o,a,-h]}},Z:{canvasMethod:"closePath",parmCount:0,toAbs:function(t,s){var i=s[0].toUpperCase(),e=[i]
return e},toCangoVersion:function(t,s){t.push(s)},addXYoffset:function(t,s,i){return["Z"]},invertCoords:function(t){return["Z"]}}}
return{svg2cartesian:function(i,o,a){var c,p,g=o||0,f=a||0
return"string"!=typeof i||0===i.length?[]:(c=i.replace(RegExp(",","g")," "),p=c.split(/(?=[a-df-z])/i),p.reduce(h,[]).reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).map(d,{xOfs:g,yOfs:f}).map(n).reduce(l,[]))},svg2cgosvg:function(i,o,a){var n,c,p=o||0,g=a||0
return"string"!=typeof i||0===i.length?[]:(n=i.replace(RegExp(",","g")," "),c=n.split(/(?=[a-df-z])/i),c.reduce(h,[]).reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).map(d,{xOfs:p,yOfs:g}).reduce(l,[]))},cartesian2svg:function(t){return""+t.reduce(s,[]).reduce(e,[]).reduce(r,[]).map(n).reduce(l,[])},cgo2drawcmds:function(h){return i(h)&&0!==h.length?h.reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).reduce(o,[]).map(a):[]}}}(),svgToCgoRHC=n.svg2cartesian,svgToCgoSVG=n.svg2cgosvg,cgoRHCtoSVG=n.cartesian2svg,d=n.cgo2drawcmds,void 0===shapeDefs&&(shapeDefs={circle:function(t){var s=t||1
return["m",-.5*s,0,"c",0,-.27614*s,.22386*s,-.5*s,.5*s,-.5*s,"c",.27614*s,0,.5*s,.22386*s,.5*s,.5*s,"c",0,.27614*s,-.22386*s,.5*s,-.5*s,.5*s,"c",-.27614*s,0,-.5*s,-.22386*s,-.5*s,-.5*s]},ellipse:function(t,s){var i=t||1,e=i
return"number"==typeof s&&s>0&&(e=s),["m",-.5*i,0,"c",0,-.27614*e,.22386*i,-.5*e,.5*i,-.5*e,"c",.27614*i,0,.5*i,.22386*e,.5*i,.5*e,"c",0,.27614*e,-.22386*i,.5*e,-.5*i,.5*e,"c",-.27614*i,0,-.5*i,-.22386*e,-.5*i,-.5*e]},square:function(t){var s=t||1
return["m",.5*s,-.5*s,"l",0,s,-s,0,0,-s,"z"]},rectangle:function(t,s,i){var e,r=t||1,o=s||r,a=.55228475
return void 0===i||0>=i?["m",-r/2,-o/2,"l",r,0,0,o,-r,0,"z"]:(e=Math.min(r/2,o/2,i),["m",-r/2+e,-o/2,"l",r-2*e,0,"c",a*e,0,e,(1-a)*e,e,e,"l",0,o-2*e,"c",0,a*e,(a-1)*e,e,-e,e,"l",-r+2*e,0,"c",-a*e,0,-e,(a-1)*e,-e,-e,"l",0,-o+2*e,"c",0,-a*e,(1-a)*e,-e,e,-e])},triangle:function(t){var s=t||1
return["m",.5*s,-.289*s,"l",-.5*s,.866*s,-.5*s,-.866*s,"z"]},cross:function(t,s){var i=t||1,e=s||i
return["m",-.5*i,0,"l",i,0,"m",-.5*i,-.5*e,"l",0,e]},ex:function(t){var s=t||1
return["m",-.3535*s,-.3535*s,"l",.707*s,.707*s,"m",-.707*s,0,"l",.707*s,-.707*s]}}),LinearGradient=function(t,s,i,e){this.grad=[t,s,i,e],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},RadialGradient=function(t,s,i,e,r,o){this.grad=[t,s,i,e,r,o],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},DrawCmd=function(t,s){var i
for(this.drawFn=t,this.parms=[],i=0;i<s.length;i+=2)this.parms.push(s.slice(i,i+2))
this.parmsPx=[]},Path=function(t,s){var i,e
this.type="PATH",this.drawCmds=d(t),this.bBoxCmds=[],this.dwgOrg={x:0,y:0},this.dragNdrop=null,this.iso=!1,this.fillCol=null,this.strokeCol=null,this.lineWidth=null,this.lineWidthWC=null,this.lineCap=null,this.dragNdrop=null,this.border=!1,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.dashed=null,this.dashOffset=0,this.renderOptions={x:0,y:0,scl:1,degs:0},i="object"==typeof s?s:{}
for(e in i)i.hasOwnProperty(e)&&this.setProperty(e,i[e])},Path.prototype.setProperty=r,Path.prototype.appendPath=o,Path.prototype.revWinding=a,Path.prototype.translate=function(t,s){this.drawCmds.forEach(function(i){i.parms=i.parms.map(function(i){return[i[0]+t,i[1]+s]})})},Path.prototype.rotate=function(t){var s=Math.PI*t/180,i=Math.sin(s),e=Math.cos(s)
this.drawCmds.forEach(function(t){t.parms=t.parms.map(function(t){return[t[0]*e-t[1]*i,t[0]*i+t[1]*e]})})},Path.prototype.scale=function(t,s){var i=t||1,e=s||i
this.drawCmds.forEach(function(t){t.parms=t.parms.map(function(t){return[t[0]*i,t[1]*e]})}),this.lineWidthWC&&(this.lineWidthWC*=i)},Path.prototype.dup=function(){var t=new Path
return t.type=this.type,t.drawCmds=s(this.drawCmds),t.bBoxCmds=s(this.bBoxCmds),t.dwgOrg=s(this.dwgOrg),t.iso=this.iso,t.fillCol=this.fillCol,t.strokeCol=this.strokeCol,t.border=this.border,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t.dashed=this.dashed,t.dashOffset=this.dashOffset,t},Shape=function(t,s){var i,e=s||{}
return i=new Path(t,s),i.type="SHAPE",e.hasOwnProperty("iso")?i.setProperty("iso",e.iso):e.hasOwnProperty("isotropic")?i.setProperty("isotropic",e.isotropic):i.setProperty("iso",!0),i},Img=function(t,s){var i,e
this.type="IMG","string"==typeof t?(this.drawCmds=t,this.imgBuf=new Image,this.imgBuf.src=t):t instanceof Image&&(this.imgBuf=t,this.drawCmds=t.src),this.bBoxCmds=[],this.dwgOrg={x:0,y:0},this.width=0,this.height=0,this.imgX=0,this.imgY=0,this.imgLorgX=0,this.imgLorgY=0,this.imgXscale=1,this.imgYscale=1,this.imgDegs=0,this.lorg=1,this.dragNdrop=null,this.border=!1,this.strokeCol=null,this.lineWidth=null,this.lineWidthWC=null,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.renderOptions={x:0,y:0,scl:1,degs:0},i="object"==typeof s?s:{}
for(e in i)i.hasOwnProperty(e)&&this.setProperty(e,i[e])},Img.prototype.translate=function(t,s){this.imgX+=t,this.imgY+=s},Img.prototype.rotate=function(t){this.imgDegs+=t},Img.prototype.scale=function(t,s){var i=t||1,e=s||i
this.imgXscale*=i,this.imgYscale*=e,this.imgX*=i,this.imgY*=e,this.lineWidthWC&&(this.lineWidthWC*=i)},Img.prototype.formatImg=function(){var t,s,i,e,r,o,a,h,n,d,l,c,p,g=0,f=0
this.imgBuf.width||console.log("in image onload handler yet image NOT loaded!"),this.width&&this.height?(t=this.width,s=this.height):this.width&&!this.height?(t=this.width,s=this.height||t*this.imgBuf.height/this.imgBuf.width):this.height&&!this.width?(s=this.height,t=this.width||s*this.imgBuf.width/this.imgBuf.height):(t=this.imgBuf.width,s=this.imgBuf.height),i=t/2,e=s/2,p=[0,[0,0],[i,0],[t,0],[0,e],[i,e],[t,e],[0,s],[i,s],[t,s]],void 0!==p[this.lorg]&&(g=-p[this.lorg][0],f=-p[this.lorg][1]),this.imgLorgX=g,this.imgLorgY=f,this.width=t,this.height=s,r=this.imgX+g,o=this.imgY+f,a=this.imgX+g,h=this.imgY+f+s,n=this.imgX+g+t,d=this.imgY+f+s,l=this.imgX+g+t,c=this.imgY+f,this.bBoxCmds[0]=new DrawCmd("moveTo",[r,-o]),this.bBoxCmds[1]=new DrawCmd("lineTo",[a,-h]),this.bBoxCmds[2]=new DrawCmd("lineTo",[n,-d]),this.bBoxCmds[3]=new DrawCmd("lineTo",[l,-c]),this.bBoxCmds[4]=new DrawCmd("closePath",[])},Img.prototype.setProperty=r,Img.prototype.dup=function(){var t=new Img
return t.type=this.type,t.drawCmds=s(this.drawCmds),t.imgBuf=this.imgBuf,t.bBoxCmds=s(this.bBoxCmds),t.dwgOrg=s(this.dwgOrg),t.border=this.border,t.strokeCol=this.strokeCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.width=this.width,t.height=this.height,t.imgX=this.imgX,t.imgY=this.imgY,t.imgLorgX=this.imgLorgX,t.imgLorgY=this.imgLorgY,t.imgXscale=this.imgXscale,t.imgYscale=this.imgYscale,t.imgDegs=this.imgDegs,t.lorg=this.lorg,t.dragNdrop=null,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t.dashed=this.dashed,t.dashOffset=this.dashOffset,t},Text=function(t,s){var i,e
this.type="TEXT",this.drawCmds=t,this.bBoxCmds=[],this.dwgOrg={x:0,y:0},this.imgX=0,this.imgY=0,this.imgLorgX=0,this.imgLorgY=0,this.imgXscale=1,this.imgYscale=1,this.imgDegs=0,this.lorg=1,this.dragNdrop=null,this.border=!1,this.fillCol=null,this.fontSize=null,this.fontSizeWC=null,this.fontWeight=null,this.fontFamily=null,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.bgFillColor="rgba(0,0,0,0.0)",this.renderOptions={x:0,y:0,scl:1,degs:0},i="object"==typeof s?s:{}
for(e in i)i.hasOwnProperty(e)&&this.setProperty(e,i[e])},Text.prototype.setProperty=r,Text.prototype.translate=function(t,s){this.imgX+=t,this.imgY+=s},Text.prototype.rotate=function(t){this.imgDegs+=t},Text.prototype.scale=function(t,s){var i=t||1,e=s||i
this.imgXscale*=i,this.imgYscale*=e,this.imgX*=i,this.imgY*=e},Text.prototype.formatText=function(t){var s,i,e,r,o,a,h,n,d,l,c,p,g,f=this.fontSize||t.fontSize,u=this.fontFamily||t.fontFamily,m=this.fontWeight||t.fontWeight,C=this.lorg||1,x=0,y=0
this.orgXscl||(this.orgXscl=t.xscl),this.fontSizeWC=f/this.orgXscl,t.ctx.save(),t.ctx.font=m+" "+f+"px "+u,s=t.ctx.measureText(this.drawCmds).width,t.ctx.restore(),s/=this.orgXscl,i=f/this.orgXscl,e=s/2,r=i/2,o=[0,[0,i],[e,i],[s,i],[0,r],[e,r],[s,r],[0,0],[e,0],[s,0]],void 0!==o[C]&&(x=-o[C][0],y=-o[C][1]),this.imgLorgX=x,this.imgLorgY=y+.25*i,this.width=s,this.height=i,a=this.imgX+x,h=this.imgY-y,n=this.imgX+x,d=this.imgY-y-i,l=this.imgX+x+s,c=this.imgY-y-i,p=this.imgX+x+s,g=this.imgY-y,this.bBoxCmds[0]=new DrawCmd("moveTo",[a,-h]),this.bBoxCmds[1]=new DrawCmd("lineTo",[n,-d]),this.bBoxCmds[2]=new DrawCmd("lineTo",[l,-c]),this.bBoxCmds[3]=new DrawCmd("lineTo",[p,-g]),this.bBoxCmds[4]=new DrawCmd("closePath",[])},Text.prototype.dup=function(){var t=new Text
return t.type=this.type,t.drawCmds=s(this.drawCmds),t.bBoxCmds=s(this.bBoxCmds),t.dwgOrg=s(this.dwgOrg),t.border=this.border,t.strokeCol=this.strokeCol,t.fillCol=this.fillCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.imgX=this.imgX,t.imgY=this.imgY,t.imgLorgX=this.imgLorgX,t.imgLorgY=this.imgLorgY,t.imgXscale=this.imgXscale,t.imgYscale=this.imgYscale,t.imgDegs=this.imgDegs,t.lorg=this.lorg,t.dragNdrop=null,t.fontSize=this.fontSize,t.fontWeight=this.fontWeight,t.fontFamily=this.fontFamily,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t.dashed=this.dashed,t.dashOffset=this.dashOffset,t.bgFillColor=this.bgFillColor,t},Cango=function(s){function i(){var t,s,i=o.bkgCanvas.offsetTop+o.bkgCanvas.clientTop,e=o.bkgCanvas.offsetLeft+o.bkgCanvas.clientLeft,r=o.bkgCanvas.offsetWidth,a=o.bkgCanvas.offsetHeight
if(o.bkgCanvas.timeline&&o.bkgCanvas.timeline.animTasks.length&&o.deleteAllAnimations(),o.rawWidth=r,o.rawHeight=a,o.aRatio=r/a,o.bkgCanvas===o.cnvs)for(o.cnvs.setAttribute("width",r),o.cnvs.setAttribute("height",a),t=1;t<o.bkgCanvas.layers.length;t++)s=o.bkgCanvas.layers[t].cElem,s&&(s.style.top=i+"px",s.style.left=e+"px",s.style.width=r+"px",s.style.height=a+"px",s.setAttribute("width",r),s.setAttribute("height",a),s.buf&&(s.buf.setAttribute("width",r),s.buf.setAttribute("height",a)))}var e,r,o=this
return this.cId=s,this.cnvs=document.getElementById(s),null===this.cnvs?void alert("can't find canvas "+s):(this.bkgCanvas=this.cnvs,-1!==s.indexOf("_ovl_")&&(e=s.slice(0,s.indexOf("_ovl_")),this.bkgCanvas=document.getElementById(e)),this.rawWidth=this.cnvs.offsetWidth,this.rawHeight=this.cnvs.offsetHeight,this.aRatio=this.rawWidth/this.rawHeight,this.widthPW=100,this.heightPW=this.widthPW/this.aRatio,this.bkgCanvas.hasOwnProperty("layers")||(this.bkgCanvas.layers=[],r=new h(this.cId,this.cnvs),this.bkgCanvas.layers[0]=r,t(this.bkgCanvas,"resize",i)),"undefined"==typeof CgoTimeline||this.bkgCanvas.hasOwnProperty("timeline")||(this.bkgCanvas.timeline=new CgoTimeline),this.cnvs.hasOwnProperty("resized")||(this.cnvs.setAttribute("width",this.rawWidth),this.cnvs.setAttribute("height",this.rawHeight),this.cnvs.resized=!0),this.ctx=this.cnvs.getContext("2d"),this.yDown=!1,this.vpW=this.rawWidth,this.vpH=this.rawHeight,this.vpOrgX=0,this.vpOrgY=this.rawHeight,this.xscl=1,this.yscl=-1,this.xoffset=0,this.yoffset=0,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset},this.ctx.textAlign="left",this.ctx.textBaseline="alphabetic",this.penCol="rgba(0, 0, 0, 1.0)",this.penWid=1,this.lineCap="butt",this.paintCol="rgba(128,128,128,1.0)",this.fontSize=12,this.fontWeight=400,this.fontFamily="Consolas, Monaco, 'Andale Mono', monospace",this.clipCount=0,this.renderOptions={x:0,y:0,scl:1,degs:0},this.getUnique=function(){return l+=1},void this.initModules())},Cango.prototype.initModules=function(){},Cango.prototype.getHostLayer=function(){var t,s=this.bkgCanvas.layers[0]
for(t=1;t<this.bkgCanvas.layers.length;t++)if(this.bkgCanvas.layers[t].id===this.cId){s=this.bkgCanvas.layers[t]
break}return s},Cango.prototype.toPixelCoords=function(t,s){var i=this.vpOrgX+this.xoffset+t*this.xscl,e=this.vpOrgY+this.yoffset+s*this.yscl
return{x:i,y:e}},Cango.prototype.toWorldCoords=function(t,s){var i=(t-this.vpOrgX-this.xoffset)/this.xscl,e=(s-this.vpOrgY-this.yoffset)/this.yscl
return{x:i,y:e}},Cango.prototype.getCursorPosWC=function(t){var s=t||window.event,i=this.cnvs.getBoundingClientRect(),e=(s.clientX-i.left-this.vpOrgX-this.xoffset)/this.xscl,r=(s.clientY-i.top-this.vpOrgY-this.yoffset)/this.yscl
return{x:e,y:r}},Cango.prototype.clearCanvas=function(t){function s(t){var s=r.toPixelCoords(t.grad[0],t.grad[1]),i=r.toPixelCoords(t.grad[2],t.grad[3]),e=r.ctx.createLinearGradient(s.x,s.y,i.x,i.y)
return t.colorStops.forEach(function(t){e.addColorStop(t[0],t[1])}),e}function i(t){var s=r.toPixelCoords(t.grad[0],t.grad[1]),i=t.grad[2]*r.xscl,e=r.toPixelCoords(t.grad[3],t.grad[4]),o=t.grad[5]*r.xscl,a=r.ctx.createRadialGradient(s.x,s.y,i,e.x,e.y,o)
return t.colorStops.forEach(function(t){a.addColorStop(t[0],t[1])}),a}var e,r=this
t?(this.ctx.save(),t instanceof LinearGradient?this.ctx.fillStyle=s(t):t instanceof RadialGradient?this.ctx.fillStyle=i(t):this.ctx.fillStyle=t,this.ctx.fillRect(0,0,this.rawWidth,this.rawHeight),this.ctx.restore()):this.ctx.clearRect(0,0,this.rawWidth,this.rawHeight),e=this.getHostLayer(),e.dragObjects.length=0,this.cnvs.alphaOvl&&this.cnvs.alphaOvl.parentNode&&this.cnvs.alphaOvl.parentNode.removeChild(this.cnvs.alphaOvl)},Cango.prototype.setGridboxRHC=function(t,s,i,e){e&&i&&e>0&&i>0?(this.vpW=i*this.rawWidth/100,this.vpH=e*this.rawWidth/100,this.vpOrgX=t*this.rawWidth/100,this.vpOrgY=this.rawHeight-s*this.rawWidth/100):(this.vpW=this.rawWidth,this.vpH=this.rawHeight,this.vpOrgX=0,this.vpOrgY=this.rawHeight),this.yDown=!1,this.setWorldCoords()},Cango.prototype.setGridboxSVG=function(t,s,i,e){e&&i&&e>0&&i>0?(this.vpW=i*this.rawWidth/100,this.vpH=e*this.rawWidth/100,this.vpOrgX=t*this.rawWidth/100,this.vpOrgY=(this.heightPW-s)*this.rawWidth/100):(this.vpW=this.rawWidth,this.vpH=this.rawHeight,this.vpOrgX=0,this.vpOrgY=0),this.yDown=!0,this.setWorldCoords()},Cango.prototype.fillGridbox=function(t){function s(t){var s=e.toPixelCoords(t.grad[0],t.grad[1]),i=e.toPixelCoords(t.grad[2],t.grad[3]),r=e.ctx.createLinearGradient(s.x,s.y,i.x,i.y)
return t.colorStops.forEach(function(t){r.addColorStop(t[0],t[1])}),r}function i(t){var s=e.toPixelCoords(t.grad[0],t.grad[1]),i=t.grad[2]*e.xscl,r=e.toPixelCoords(t.grad[3],t.grad[4]),o=t.grad[5]*e.xscl,a=e.ctx.createRadialGradient(s.x,s.y,i,r.x,r.y,o)
return t.colorStops.forEach(function(t){a.addColorStop(t[0],t[1])}),a}var e=this,r=t||this.paintCol,o=this.yscl>0?this.vpOrgY:this.vpOrgY-this.vpH
this.ctx.save(),r instanceof LinearGradient?this.ctx.fillStyle=s(r):r instanceof RadialGradient?this.ctx.fillStyle=i(r):this.ctx.fillStyle=r,this.ctx.fillRect(this.vpOrgX,o,this.vpW,this.vpH),this.ctx.restore()},Cango.prototype.setWorldCoords=function(t,s,i,e){var r=t||0,o=s||0
i&&i>0?this.xscl=this.vpW/i:this.xscl=1,e&&e>0?this.yscl=this.yDown?this.vpH/e:-this.vpH/e:this.yscl=this.yDown?this.xscl:-this.xscl,this.xoffset=-r*this.xscl,this.yoffset=-o*this.yscl,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset}},Cango.prototype.setPropertyDefault=function(t,s){if("string"==typeof t&&void 0!==s&&null!==s)switch(t.toLowerCase()){case"fillcolor":("string"==typeof s||"object"==typeof s)&&(this.paintCol=s)
break
case"strokecolor":("string"==typeof s||"object"==typeof s)&&(this.penCol=s)
break
case"linewidth":case"strokewidth":this.penWid=s
break
case"linecap":"string"!=typeof s||"butt"!==s&&"round"!==s&&"square"!==s||(this.lineCap=s)
break
case"fontfamily":"string"==typeof s&&(this.fontFamily=s)
break
case"fontsize":this.fontSize=s
break
case"fontweight":("string"==typeof s||s>=100&&900>=s)&&(this.fontWeight=s)
break
case"steptime":s>=15&&500>=s&&(this.stepTime=s)
break
default:return}},Cango.prototype.dropShadow=function(t){var s=t.shadowOffsetX||0,i=t.shadowOffsetY||0,e=t.shadowBlur||0,r=t.shadowColor||"#000000",o=1,a=1
void 0!==this.ctx.shadowOffsetX&&("SHAPE"===t.type||"PATH"===t.type&&!t.iso?(o*=this.xscl,a*=this.yscl):(o*=this.xscl,a*=-this.xscl),this.ctx.shadowOffsetX=s*o,this.ctx.shadowOffsetY=i*a,this.ctx.shadowBlur=e*o,this.ctx.shadowColor=r)},Cango.prototype.render=function(s,r){function o(s){function i(){s.formatImg(),a.paintImg(s)}s.renderOptions.x=h.x||0,s.renderOptions.y=h.y||0,s.renderOptions.scl=h.scl||1,s.renderOptions.degs=h.degs||0,"IMG"===s.type?s.imgBuf.complete?i():t(s.imgBuf,"load",i):"TEXT"===s.type?(s.formatText(a),a.paintText(s)):a.paintPath(s)}var a=this,h="object"==typeof r?r:{}
i(s)?e(s).forEach(o):s&&o(s)},Cango.prototype.paintImg=function(t){function s(t){return[t[0]*r-t[1]*e,t[0]*e+t[1]*r]}var i,e,r,o,a,h=this,n=t.imgBuf,d=t.renderOptions.x,l=t.renderOptions.y,c=t.renderOptions.scl*t.imgXscale,p=t.renderOptions.degs
this.ctx.save(),this.dropShadow(t),this.ctx.translate(this.vpOrgX+this.xoffset+d*this.xscl,this.vpOrgY+this.yoffset+l*this.yscl),p+=t.imgDegs,p&&(i=this.yscl>0?-p*Math.PI/180:p*Math.PI/180,e=Math.sin(i),r=Math.cos(i),this.ctx.rotate(-i)),this.ctx.drawImage(n,this.xscl*c*(t.imgX+t.imgLorgX),this.xscl*c*(t.imgY+t.imgLorgY),this.xscl*c*t.width,this.xscl*c*t.height),this.ctx.restore(),t.bBoxCmds.forEach(function(t){var i,e
t.parms.length&&(i=p?s(t.parms[0]):[t.parms[0][0],t.parms[0][1]],i[0]*=c*h.xscl,i[1]*=-c*h.xscl,e=h.toPixelCoords(d,l),t.parmsPx[0]=i[0]+e.x,t.parmsPx[1]=i[1]+e.y)}),t.border&&(this.ctx.save(),this.ctx.beginPath(),t.bBoxCmds.forEach(function(t){h.ctx[t.drawFn].apply(h.ctx,t.parmsPx)}),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*c*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke(),this.ctx.restore()),t.dwgOrg.x=d,t.dwgOrg.y=l,null!==t.dragNdrop&&(o=this.getHostLayer(),o!==t.dragNdrop.layer&&t.dragNdrop.layer&&(a=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==a&&t.dragNdrop.layer.dragObjects.splice(a,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=o,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.paintPath=function(t){function s(t){var s=t.grad[0],i=t.grad[1],e=t.grad[2],r=t.grad[3],o=c.ctx.createLinearGradient(x*s,y*i,x*e,y*r)
return t.colorStops.forEach(function(t){o.addColorStop(t[0],t[1])}),o}function i(t){var s=t.grad[0],i=t.grad[1],e=t.grad[2],r=t.grad[3],o=t.grad[4],a=t.grad[5],h=c.ctx.createRadialGradient(x*s,y*i,x*e,x*r,y*o,x*a)
return t.colorStops.forEach(function(t){h.addColorStop(t[0],t[1])}),h}function e(t){return[t[0]*a-t[1]*o,t[0]*o+t[1]*a]}var r,o,a,h,n,d,l,c=this,p=t.renderOptions.x,g=t.renderOptions.y,f=t.renderOptions.scl,u=t.renderOptions.degs,m=this.vpOrgX+this.xoffset+p*this.xscl,C=this.vpOrgY+this.yoffset+g*this.yscl,x=this.xscl,y=this.yscl,v=t.iso
v&&(y=this.yscl>0?this.xscl:-this.xscl),u&&(r=this.yscl>0?-u*Math.PI/180:u*Math.PI/180,o=Math.sin(r),a=Math.cos(r)),this.ctx.save(),this.dropShadow(t),this.ctx.translate(m,C),this.ctx.beginPath(),t.drawCmds.forEach(function(t){t.parmsPx=[],t.parms.forEach(function(s){var i
i=u?e(s):[s[0],s[1]],i[0]*=f*x,i[1]*=f*y,t.parmsPx.push(i[0],i[1])}),c.ctx[t.drawFn].apply(c.ctx,t.parmsPx)}),"SHAPE"===t.type&&(n=t.fillCol||this.paintCol,n instanceof LinearGradient?this.ctx.fillStyle=s(n):n instanceof RadialGradient?this.ctx.fillStyle=i(n):this.ctx.fillStyle=n,this.ctx.fill(),this.ctx.shadowOffsetX=0,this.ctx.shadowOffsetY=0,this.ctx.shadowBlur=0),("PATH"===t.type||t.border)&&(t.dashed&&(this.ctx.setLineDash(t.dashed),this.ctx.lineDashOffset=t.dashOffset),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*f*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke()),this.ctx.restore(),t.drawCmds.forEach(function(t){for(h=0;h<t.parms.length;h++)t.parmsPx[2*h]=t.parmsPx[2*h]*f+m,t.parmsPx[2*h+1]=t.parmsPx[2*h+1]*f+C}),t.dwgOrg.x=p,t.dwgOrg.y=g,null!==t.dragNdrop&&(d=this.getHostLayer(),d!==t.dragNdrop.layer&&t.dragNdrop.layer&&(l=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==l&&t.dragNdrop.layer.dragObjects.splice(l,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=d,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.paintText=function(t){function s(t){return[t[0]*h-t[1]*a,t[0]*a+t[1]*h]}var i,e,r=this,o=0,a=0,h=1,n=t.renderOptions.x,d=t.renderOptions.y,l=t.renderOptions.scl*t.imgXscale,c=t.renderOptions.degs,p=this.xscl*l*t.fontSizeWC,g=t.fontFamily||this.fontFamily,f=t.fontWeight||this.fontWeight
c+=t.imgDegs,c&&(o=this.yscl>0?-c*Math.PI/180:c*Math.PI/180,a=Math.sin(o),h=Math.cos(o)),t.bBoxCmds.forEach(function(t){var i,e
t.parms.length&&(i=c?s(t.parms[0]):[t.parms[0][0],t.parms[0][1]],i[0]*=l*r.xscl,i[1]*=-l*r.xscl,e=r.toPixelCoords(n,d),t.parmsPx[0]=i[0]+e.x,t.parmsPx[1]=i[1]+e.y)}),"rgba(0,0,0,0.0)"!=t.bgFillColor&&(this.ctx.save(),this.ctx.beginPath(),t.bBoxCmds.forEach(function(t){r.ctx[t.drawFn].apply(r.ctx,t.parmsPx)}),this.ctx.fillStyle=t.bgFillColor,this.ctx.strokeStyle=t.bgFillColor,this.ctx.lineWidth=.1*p,this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()),this.ctx.save(),this.dropShadow(t),this.ctx.translate(this.vpOrgX+this.xoffset+n*this.xscl,this.vpOrgY+this.yoffset+d*this.yscl),c&&this.ctx.rotate(-o),this.ctx.font=f+" "+p+"px "+g,this.ctx.fillStyle=t.fillCol||this.paintCol,this.ctx.fillText(t.drawCmds,this.xscl*l*(t.imgX+t.imgLorgX),-this.xscl*l*(t.imgY+t.imgLorgY)),t.border&&(this.ctx.shadowOffsetX=0,this.ctx.shadowOffsetY=0,this.ctx.shadowBlur=0,t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.strokeText(t.drawCmds,this.xscl*l*(t.imgX+t.imgLorgX),-this.xscl*l*(t.imgY+t.imgLorgY))),this.ctx.restore(),t.dwgOrg.x=n,t.dwgOrg.y=d,null!==t.dragNdrop&&(i=this.getHostLayer(),i!==t.dragNdrop.layer&&t.dragNdrop.layer&&(e=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==e&&t.dragNdrop.layer.dragObjects.splice(e,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=i,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.drawPath=function(t,s){var i=s||{},e=new Path(t,i)
this.render(e,{x:i.x,y:i.y,scl:i.scl,degs:i.degs})},Cango.prototype.drawShape=function(t,s){var i=s||{},e=new Shape(t,i)
this.render(e,{x:i.x,y:i.y,scl:i.scl,degs:i.degs})},Cango.prototype.drawText=function(t,s){var i=s||{},e=new Text(t,i)
this.render(e,{x:i.x,y:i.y,scl:i.scl,degs:i.degs})},Cango.prototype.drawImg=function(t,s){var i=s||{},e=new Img(t,i)
this.render(e,{x:i.x,y:i.y,scl:i.scl,degs:i.degs})},Cango.prototype.clipPath=function(t,s){function i(t){return[t[0]*o-t[1]*r,t[0]*r+t[1]*o]}var e,r,o,a,h,n,d,l,c,p,g,f=this,u="object"==typeof s?s:{}
"IMG"!==t.type&&"TEXT"!==t.type&&(a=u.x||0,h=u.y||0,n=u.scl||1,d=u.degs||0,l=this.vpOrgX+this.xoffset+a*this.xscl,c=this.vpOrgY+this.yoffset+h*this.yscl,p=this.xscl,g=this.yscl,t.iso&&(g=this.yscl>0?this.xscl:-this.xscl),d&&(e=this.yscl>0?-d*Math.PI/180:d*Math.PI/180,r=Math.sin(e),o=Math.cos(e)),this.ctx.save(),this.ctx.beginPath(),t.drawCmds.forEach(function(t){t.parmsPx=[],t.parms.forEach(function(s){var e
e=d?i(s):[s[0],s[1]],e[0]=l+p*n*e[0],e[1]=c+g*n*e[1],t.parmsPx.push(e[0],e[1])}),f.ctx[t.drawFn].apply(f.ctx,t.parmsPx)}),this.ctx.clip(),this.ctx.save(),this.ctx.fillStyle="rgba(0, 0, 0, 0.0)",this.ctx.fillRect(0,0,1,1),this.ctx.restore(),this.clipCount++)},Cango.prototype.resetClip=function(){for(;this.clipCount>0;)this.ctx.restore(),this.clipCount--},Cango.prototype.createLayer=function(){var t,s,i,e,r,o,a=this.rawWidth,n=this.rawHeight,d=this.bkgCanvas.layers.length
return-1!==this.cId.indexOf("_ovl_")?(console.log("canvas layers can't create layers"),""):(i=this.getUnique(),e=this.cId+"_ovl_"+i,t="<canvas id='"+e+"' style='position:absolute' width='"+a+"' height='"+n+"'></canvas>",o=this.bkgCanvas.layers[d-1].cElem,o.insertAdjacentHTML("afterend",t),s=document.getElementById(e),s.style.backgroundColor="transparent",s.style.left=this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft+"px",s.style.top=this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop+"px",s.style.width=this.bkgCanvas.offsetWidth+"px",s.style.height=this.bkgCanvas.offsetHeight+"px",r=new h(e,s),this.bkgCanvas.layers.push(r),e)},Cango.prototype.deleteLayer=function(t){var s,i
for(i=1;i<this.bkgCanvas.layers.length;i++)this.bkgCanvas.layers[i].id===t&&(s=this.bkgCanvas.layers[i].cElem,s&&(s.alphaOvl&&s.alphaOvl.parentNode&&s.alphaOvl.parentNode.removeChild(s.alphaOvl),s.parentNode.removeChild(s)),this.bkgCanvas.layers.splice(i,1))},Cango.prototype.deleteAllLayers=function(){var t,s
for(t=this.bkgCanvas.layers.length-1;t>0;t--)s=this.bkgCanvas.layers[t].cElem,s&&(s.alphaOvl&&s.alphaOvl.parentNode&&s.alphaOvl.parentNode.removeChild(s.alphaOvl),s.parentNode.removeChild(s)),this.bkgCanvas.layers.splice(t,1)},Cango.prototype.dupCtx=function(t){this.vpW=t.vpW,this.vpH=t.vpH,this.vpOrgX=t.vpOrgX,this.vpOrgY=t.vpOrgY,this.xscl=t.xscl,this.yscl=t.yscl,this.xoffset=t.xoffset,this.yoffset=t.yoffset,this.savWC=s(t.savWC),this.penCol=t.penCol.slice(0),this.penWid=t.penWid,this.lineCap=t.lineCap.slice(0),this.paintCol=t.paintCol.slice(0),this.fontFamily=t.fontFamily.slice(0),this.fontSize=t.fontSize,this.fontWeight=t.fontWeight,this.renderOptions=s(t.renderOptions)},Cango.prototype.toImgObj=function(t){var s,i,e,r,o,a,h,n,d,l,c,p,g,f=this.xscl,u=this.yscl
if("PATH"!==t.type&&"SHAPE"!==t.type)return null
for(t.iso&&(u=this.yscl>0?this.xscl:-this.xscl),r=i=t.drawCmds[0].parms[0][0],e=s=t.drawCmds[0].parms[0][1],p=1;p<t.drawCmds.length;p++)for(g=0;g<t.drawCmds[p].parms.length;g++)t.drawCmds[p].parms[g][0]>i&&(i=t.drawCmds[p].parms[g][0]),t.drawCmds[p].parms[g][0]<r&&(r=t.drawCmds[p].parms[g][0]),t.drawCmds[p].parms[g][1]>s&&(s=t.drawCmds[p].parms[g][1]),t.drawCmds[p].parms[g][1]<e&&(e=t.drawCmds[p].parms[g][1])
return o=r*f-2,a=this.yscl>0?e*u-2:e*u+2,h=(i-r)*f+4,n=this.yscl>0?(s-e)*u+4:(e-s)*u+4,d=document.createElement("canvas"),d.setAttribute("width",h),d.setAttribute("height",n),l=new Cango(this.cId),l.dupCtx(this),l.cnvs=d,l.cId="_sprite_",l.ctx=l.cnvs.getContext("2d"),l.rawWidth=h,l.rawHeight=n,l.vpW=l.rawWidth,l.vpH=l.rawHeight,l.vpOrgX=0,l.vpOrgY=this.yscl>0?0:l.rawHeight,l.xoffset=-o,l.yoffset=-a,this.paintPath.call(l,t),c=new Img(l.cnvs.toDataURL()),c.imgXscale=1/this.xscl,c}}()