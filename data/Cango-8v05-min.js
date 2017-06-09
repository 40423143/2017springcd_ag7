var Cango,Cobj,LinearGradient,RadialGradient,DrawCmd,svgToCgoRHC,svgToCgoSVG,cgoRHCtoSVG,shapeDefs
!function(){"use strict"
function t(t,s,i){return t.attachEvent?t.attachEvent("on"+s,i):t.addEventListener(s,i,!0)}function s(t){var i,e=Array.isArray(t)?[]:{}
for(i in t)t[i]&&"object"==typeof t[i]?e[i]=s(t[i]):e[i]=t[i]
return e}function i(t){return"[object Array]"===Object.prototype.toString.call(t)}function e(t){return i(t)?t.reduce(function(t,s){var r=[].concat(s).some(i)
return t.concat(r?e(s):s)},[]):[t]}function r(t){this.type="PATH",this.drawCmds=l(t),this.dwgOrg={x:0,y:0},this.dragNdrop=null,this.iso=!1,this.border=!1,this.strokeCol=null,this.lineWidth=null,this.lineWidthWC=null,this.lineCap=null,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.dashed=null,this.dashOffset=0}function o(t){r.call(this,t),this.type="SHAPE",this.iso=!0}function a(t){this.type="IMG","string"==typeof t?(this.drawCmds=t,this.imgBuf=new Image,this.imgBuf.src=t):t instanceof Image&&(this.imgBuf=t,this.drawCmds=t.src),this.bBoxCmds=[],this.dwgOrg={x:0,y:0},this.width=0,this.height=0,this.imgX=0,this.imgY=0,this.imgLorgX=0,this.imgLorgY=0,this.imgXscale=1,this.imgYscale=1,this.imgDegs=0,this.lorg=1,this.dragNdrop=null,this.border=!1,this.strokeCol=null,this.lineWidth=null,this.lineWidthWC=null,this.lineCap=null,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000"}function h(t){this.type="TEXT",this.drawCmds=t,this.bBoxCmds=[],this.dwgOrg={x:0,y:0},this.imgX=0,this.imgY=0,this.imgLorgX=0,this.imgLorgY=0,this.imgXscale=1,this.imgYscale=1,this.imgDegs=0,this.lorg=1,this.dragNdrop=null,this.border=!1,this.fillCol=null,this.fontSize=null,this.fontSizeWC=null,this.fontWeight=null,this.fontFamily=null,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.bgFillColor="rgba(0,0,0,0.0)"}function n(t,s){this.id=t,this.cElem=s,this.dragObjects=[]}var c,l,d=0
c=function(){function t(t,s,i){return 0===i&&"string"!=typeof s&&t.push("M"),"string"==typeof s&&(f.hasOwnProperty(s.toUpperCase())||(console.log("unknown command string '"+s+"'"),t.badCmdFound=!0,t.length=0)),t.badCmdFound||t.push(s),t}function s(t,s,i,e){var r
if(0===i&&(t.nextCmdPos=0),"string"==typeof s){if(i<t.nextCmdPos)return console.log("bad number of parameters for '"+s+"' at index "+i),t.badParameter=!0,t.push(0),t
t.currCmd=s.toUpperCase(),t.uc=s.toUpperCase()===s,t.nextCmdPos=i+f[t.currCmd].parmCount+1,t.push(s)}else i<t.nextCmdPos?t.push(s):(t.currCmd=f[t.currCmd].extCmd,r=t.uc?t.currCmd:t.currCmd.toLowerCase(),t.push(r,s),t.nextCmdPos=i+f[t.currCmd].parmCount)
return i===e.length-1&&t.badParameter&&(t.length=0),t}function e(t,s){return"string"==typeof s&&t.push([]),t[t.length-1].push(s),t}function r(t,s,i){var e,r
return void 0===t.px&&(t.px=0,t.py=0),e=f[s[0].toUpperCase()],r=e.toAbs(t,s,i),t.push(r),t}function o(t,s,i){var e=s[0],r=f[e]
return r.toCangoVersion(t,s,i),t}function a(t){var s=t[0],i=t.slice(1)
return new DrawCmd(f[s].canvasMethod,i)}function h(t,s){var i,e,r=s[0]
return t.push(r),i=s.slice(1),e=i.match(/\S+/g),e&&e.forEach(function(s){var i=parseFloat(s)
isNaN(i)||t.push(i)}),t}function n(t){var s=t[0],i=f[s]
return i.invertCoords(t)}function c(t){var s=t[0],i=f[s],e=this.xOfs||0,r=this.yOfs||0
return i.addXYoffset(t,e,r)}function l(t,s){return t.concat(s)}var d=function(t,s,i,e,r,o,a,h){var n=h*r,c=-a*o,l=a*r,d=h*o,p=.5*(e-i),f=8/3*Math.sin(.5*p)*Math.sin(.5*p)/Math.sin(p),g=t+Math.cos(i)-f*Math.sin(i),u=s+Math.sin(i)+f*Math.cos(i),C=t+Math.cos(e),m=s+Math.sin(e),x=C+f*Math.sin(e),y=m-f*Math.cos(e)
return[n*g+c*u,l*g+d*u,n*x+c*y,l*x+d*y,n*C+c*m,l*C+d*m]},p=function(t,s,i,e,r,o,a,h,n){function c(t){return Math.abs(t)<1e-5?0:t}var l,p,f,g,u,C,m,x,y,v,w,b,O,W,k,M,P,X,Y,S,H,A,L=r*(Math.PI/180),T=Math.sin(L),B=Math.cos(L),E=Math.abs(i),N=Math.abs(e),I=B*(t-h)*.5+T*(s-n)*.5,j=B*(s-n)*.5-T*(t-h)*.5,D=I*I/(E*E)+j*j/(N*N),F=[]
for(D>1&&(D=Math.sqrt(D),E*=D,N*=D),l=B/E,p=T/E,f=-T/N,g=B/N,u=l*t+p*s,C=f*t+g*s,m=l*h+p*n,x=f*h+g*n,y=(m-u)*(m-u)+(x-C)*(x-C),v=1/y-.25,0>v&&(v=0),w=Math.sqrt(v),a===o&&(w=-w),b=.5*(u+m)-w*(x-C),O=.5*(C+x)+w*(m-u),W=Math.atan2(C-O,u-b),k=Math.atan2(x-O,m-b),M=k-W,0>M&&1===a?M+=2*Math.PI:M>0&&0===a&&(M-=2*Math.PI),P=Math.ceil(Math.abs(M/(.5*Math.PI+.001))),S=0;P>S;S++)H=W+S*M/P,A=W+(S+1)*M/P,X=d(b,O,H,A,E,N,T,B),Y=X.map(c),F.push(Y)
return F},f={M:{canvasMethod:"moveTo",parmCount:2,extCmd:"L",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2]
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
return["V",-s]}},C:{canvasMethod:"bezierCurveTo",parmCount:6,extCmd:"C",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4],n=s[5],c=s[6]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py,n+=t.px,c+=t.py),i=[e,r,o,a,h,n,c],t.px=n,t.py=c,i},toCangoVersion:function(t,s){var i=s[5],e=s[6]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4],h=t[5],n=t[6]
return e+=s,r+=i,o+=s,a+=i,h+=s,n+=i,["C",e,r,o,a,h,n]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4],o=t[5],a=t[6]
return["C",s,-i,e,-r,o,-a]}},S:{parmCount:4,extCmd:"S",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py),i=[e,r,o,a,h],t.px=a,t.py=h,i},toCangoVersion:function(t,s,i){var e,r=0,o=0,a=s[1],h=s[2],n=s[3],c=s[4],l=t[i-1]
"C"===l[0]&&(r=t.px-l[l.length-4],o=t.py-l[l.length-3]),r+=t.px,o+=t.py,e=["C",r,o,a,h,n,c],t.px=n,t.py=c,t.push(e)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4]
return e+=s,r+=i,o+=s,a+=i,["S",e,r,o,a]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4]
return["S",s,-i,e,-r]}},Q:{canvasMethod:"quadraticCurveTo",parmCount:4,extCmd:"Q",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4]
return e!==s[0]&&(r+=t.px,o+=t.py,a+=t.px,h+=t.py),i=[e,r,o,a,h],t.px=a,t.py=h,i},toCangoVersion:function(t,s){var i=s[3],e=s[4]
t.px=i,t.py=e,t.push(s)},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4]
return e+=s,r+=i,o+=s,a+=i,["Q",e,r,o,a]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4]
return["Q",s,-i,e,-r]}},T:{parmCount:2,extCmd:"T",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2]
return e!==s[0]&&(r+=t.px,o+=t.py),i=[e,r,o],t.px=r,t.py=o,i},toCangoVersion:function(t,s,i){var e,r=0,o=0,a=s[1],h=s[2],n=t[i-1]
"Q"===n[0]&&(r=t.px-n[n.length-4],o=t.py-n[n.length-3]),r+=t.px,o+=t.py,e=["Q",r,o,a,h],t.px=a,t.py=h,t.push(e)},addXYoffset:function(t,s,i){var e=t[1],r=t[2]
return e+=s,r+=i,["T",e,r]},invertCoords:function(t){var s=t[1],i=t[2]
return["T",s,-i]}},A:{parmCount:7,extCmd:"A",toAbs:function(t,s){var i,e=s[0].toUpperCase(),r=s[1],o=s[2],a=s[3],h=s[4],n=s[5],c=s[6],l=s[7]
return e!==s[0]&&(c+=t.px,l+=t.py),i=[e,r,o,a,h,n,c,l],t.px=c,t.py=l,i},toCangoVersion:function(t,s){var i,e=s[1],r=s[2],o=s[3],a=s[4],h=s[5],n=s[6],c=s[7]
i=p(t.px,t.py,e,r,o,a,h,n,c),i.forEach(function(s){t.push(["C"].concat(s))}),t.px=n,t.py=c},addXYoffset:function(t,s,i){var e=t[1],r=t[2],o=t[3],a=t[4],h=t[5],n=t[6],c=t[7]
return n+=s,c+=i,["A",e,r,o,a,h,n,c]},invertCoords:function(t){var s=t[1],i=t[2],e=t[3],r=t[4],o=t[5],a=t[6],h=t[7]
return["A",s,i,-e,r,1-o,a,-h]}},Z:{canvasMethod:"closePath",parmCount:0,toAbs:function(t,s){var i=s[0].toUpperCase(),e=[i]
return e},toCangoVersion:function(t,s){t.push(s)},addXYoffset:function(t,s,i){return["Z"]},invertCoords:function(t){return["Z"]}}}
return{svg2cartesian:function(i,o,a){var d,p,f=o||0,g=a||0
return"string"!=typeof i||0===i.length?[]:(d=i.replace(RegExp(",","g")," "),p=d.split(/(?=[a-df-z])/i),p.reduce(h,[]).reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).map(c,{xOfs:f,yOfs:g}).map(n).reduce(l,[]))},svg2cgosvg:function(i,o,a){var n,d,p=o||0,f=a||0
return"string"!=typeof i||0===i.length?[]:(n=i.replace(RegExp(",","g")," "),d=n.split(/(?=[a-df-z])/i),d.reduce(h,[]).reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).map(c,{xOfs:p,yOfs:f}).reduce(l,[]))},cartesian2svg:function(t){return""+t.reduce(s,[]).reduce(e,[]).reduce(r,[]).map(n).reduce(l,[])},cgo2drawcmds:function(h){return i(h)&&0!==h.length?h.reduce(t,[]).reduce(s,[]).reduce(e,[]).reduce(r,[]).reduce(o,[]).map(a):[]}}}(),svgToCgoRHC=c.svg2cartesian,svgToCgoSVG=c.svg2cgosvg,cgoRHCtoSVG=c.cartesian2svg,l=c.cgo2drawcmds,void 0===shapeDefs&&(shapeDefs={circle:function(t){var s=t||1
return["m",-.5*s,0,"c",0,-.27614*s,.22386*s,-.5*s,.5*s,-.5*s,"c",.27614*s,0,.5*s,.22386*s,.5*s,.5*s,"c",0,.27614*s,-.22386*s,.5*s,-.5*s,.5*s,"c",-.27614*s,0,-.5*s,-.22386*s,-.5*s,-.5*s]},ellipse:function(t,s){var i=t||1,e=i
return"number"==typeof s&&s>0&&(e=s),["m",-.5*i,0,"c",0,-.27614*e,.22386*i,-.5*e,.5*i,-.5*e,"c",.27614*i,0,.5*i,.22386*e,.5*i,.5*e,"c",0,.27614*e,-.22386*i,.5*e,-.5*i,.5*e,"c",-.27614*i,0,-.5*i,-.22386*e,-.5*i,-.5*e]},square:function(t){var s=t||1
return["m",.5*s,-.5*s,"l",0,s,-s,0,0,-s,"z"]},rectangle:function(t,s,i){var e,r=.55228475
return void 0===i||0>=i?["m",-t/2,-s/2,"l",t,0,0,s,-t,0,"z"]:(e=Math.min(t/2,s/2,i),["m",-t/2+e,-s/2,"l",t-2*e,0,"c",r*e,0,e,(1-r)*e,e,e,"l",0,s-2*e,"c",0,r*e,(r-1)*e,e,-e,e,"l",-t+2*e,0,"c",-r*e,0,-e,(r-1)*e,-e,-e,"l",0,-s+2*e,"c",0,-r*e,(1-r)*e,-e,e,-e])},triangle:function(t){var s=t||1
return["m",.5*s,-.289*s,"l",-.5*s,.866*s,-.5*s,-.866*s,"z"]},cross:function(t){var s=t||1
return["m",-.5*s,0,"l",s,0,"m",-.5*s,-.5*s,"l",0,s]},ex:function(t){var s=t||1
return["m",-.3535*s,-.3535*s,"l",.707*s,.707*s,"m",-.707*s,0,"l",.707*s,-.707*s]},arrow:function(t,s,i,e,r,o,a){function h(t,s){return{x:t,y:s}}function n(t,s){return Math.sqrt((t.x-s.x)*(t.x-s.x)+(t.y-s.y)*(t.y-s.y))}function c(t,s){var i=Math.sin(s),e=Math.cos(s)
return{x:t.x*e-t.y*i,y:t.x*i+t.y*e}}function l(t,s,i){return{x:t.x+s,y:t.y+i}}var d,p,f,g,u,C,m,x,y,v,w,b,O,W=1,k=r||1,M=o||4,P=.5*k,X=i-t,Y=e-s,S=0,H=21*Math.PI/180,A=M*k,L=A*Math.cos(H)
return a instanceof Cango&&(W=Math.abs(a.yscl/a.xscl),Y*=W),S=Math.atan2(Y,X),d=new h(t,s*W),p=new h(i,e*W),f=n(d,p),g=new h(0,P),u=new h(f-L,P),C=new h(u.x,A*Math.sin(H)),v=new h(f,0),m=new h(C.x,-C.y),x=new h(u.x,-u.y),y=new h(g.x,-g.y),w=[g,u,C,v,m,x,y],b=w.map(function(t){var s=c(t,S),i=l(s,d.x,d.y)
return i}),O=b.reduce(function(t,s){return t.push(s.x,s.y),t},["M"]),O.splice(3,0,"L"),O.push("Z"),O},arrowArc:function(t,s,i,e,r,o,a){function h(t){for(;0>t;)t+=360
for(;t>=360;)t-=360
return parseFloat(t)}var n,c,l,d,p,f,g,u,C,m,x,y,v,w,b,O,W,k,M,P,X,Y,S=h(s),H=h(i),A=e?1:0,L=S>H?1:0,T=Math.PI/180,B=r||1,E=o||4,N=.5*B,I=t-N,j=t+N,D=.95*E*B,F=D/t,G=-1
return l=L?S-H:H-S,(L&&!A||!L&&A)&&(l=360-l),d=T*l,p=l>180?1:0,F>d&&(F=d),a instanceof Cango&&a.yscl>0?(p=1-p,G=1):A=1-A,n=G*T*H,c=G*T*S,f=A?n-G*F:n+G*F,C=t-.35*D,m=t+.35*D,b=I*Math.cos(c),O=I*Math.sin(c)*G,W=I*Math.cos(f),k=I*Math.sin(f)*G,M=j*Math.cos(c),P=j*Math.sin(c)*G,X=j*Math.cos(f),Y=j*Math.sin(f)*G,g=t*Math.cos(n),u=t*Math.sin(n)*G,x=C*Math.cos(f),y=C*Math.sin(f)*G,v=m*Math.cos(f),w=m*Math.sin(f)*G,["M",M,P,"A",j,j,0,p,A,X,Y,"L",v,w,"A",m,m,0,0,A,g,u,"A",C,C,0,0,1-A,x,y,"L",W,k,"A",I,I,0,p,1-A,b,O,"Z"]}}),LinearGradient=function(t,s,i,e){this.grad=[t,s,i,e],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},RadialGradient=function(t,s,i,e,r,o){this.grad=[t,s,i,e,r,o],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},DrawCmd=function(t,s){var i
for(this.drawFn=t,this.parms=[],i=0;i<s.length;i+=2)this.parms.push(s.slice(i,i+2))
this.parmsPx=[]},r.prototype.translate=function(t,s){this.drawCmds.forEach(function(i){i.parms=i.parms.map(function(i){return[i[0]+t,i[1]+s]})})},r.prototype.rotate=function(t){var s=Math.PI*t/180,i=Math.sin(s),e=Math.cos(s)
this.drawCmds.forEach(function(t){t.parms=t.parms.map(function(t){return[t[0]*e-t[1]*i,t[0]*i+t[1]*e]})})},r.prototype.scale=function(t,s){var i=t||1,e=s||i
this.drawCmds.forEach(function(t){t.parms=t.parms.map(function(t){return[t[0]*i,t[1]*e]})}),this.lineWidthWC&&(this.lineWidthWC*=i)},r.prototype.appendPath=function(t,i){var e=s(t.drawCmds)
i?this.drawCmds=this.drawCmds.concat(e.slice(1)):this.drawCmds=this.drawCmds.concat(e)},r.prototype.revWinding=function(){function t(t){return t.reduceRight(function(t,s){return t.push(s[0],s[1]),t},[])}var s,i,e,r,o,a=null,h=[]
for("closePath"===this.drawCmds[this.drawCmds.length-1].drawFn?(s=this.drawCmds.slice(0,-1),a=this.drawCmds.slice(-1)):s=this.drawCmds.slice(0),i=s.length-1,e=s[i].parms.length,o=new DrawCmd("moveTo",s[i].parms[e-1]),h.push(o),s[i].parms=s[i].parms.slice(0,-1);i>0;)r=t(s[i].parms),e=s[i-1].parms.length,r=r.concat(s[i-1].parms[e-1]),o=new DrawCmd(s[i].drawFn,r),h.push(o),s[i-1].parms=s[i-1].parms.slice(0,-1),i--
a&&h.push(a),this.drawCmds=h},o.prototype=new r,a.prototype.translate=function(t,s){this.imgX+=t,this.imgY+=s},a.prototype.rotate=function(t){this.imgDegs+=t},a.prototype.scale=function(t,s){var i=t||1,e=s||i
this.imgXscale*=i,this.imgYscale*=e,this.imgX*=i,this.imgY*=e,this.lineWidthWC&&(this.lineWidthWC*=i)},a.prototype.formatImg=function(){var t,s,i,e,r,o,a,h,n,c,l,d,p,f=0,g=0
this.imgBuf.width||console.log("in image onload handler yet image NOT loaded!"),this.width&&this.height?(t=this.width,s=this.height):this.width&&!this.height?(t=this.width,s=this.height||t*this.imgBuf.height/this.imgBuf.width):this.height&&!this.width?(s=this.height,t=this.width||s*this.imgBuf.width/this.imgBuf.height):(t=this.imgBuf.width,s=this.imgBuf.height),i=t/2,e=s/2,p=[0,[0,0],[i,0],[t,0],[0,e],[i,e],[t,e],[0,s],[i,s],[t,s]],void 0!==p[this.lorg]&&(f=-p[this.lorg][0],g=-p[this.lorg][1]),this.imgLorgX=f,this.imgLorgY=g,this.width=t,this.height=s,r=this.imgX+f,o=this.imgY+g,a=this.imgX+f,h=this.imgY+g+s,n=this.imgX+f+t,c=this.imgY+g+s,l=this.imgX+f+t,d=this.imgY+g,this.bBoxCmds[0]=new DrawCmd("moveTo",[r,-o]),this.bBoxCmds[1]=new DrawCmd("lineTo",[a,-h]),this.bBoxCmds[2]=new DrawCmd("lineTo",[n,-c]),this.bBoxCmds[3]=new DrawCmd("lineTo",[l,-d]),this.bBoxCmds[4]=new DrawCmd("closePath",[])},h.prototype.translate=function(t,s){this.imgX+=t,this.imgY+=s},h.prototype.rotate=function(t){this.imgDegs+=t},h.prototype.scale=function(t,s){var i=t||1,e=s||i
this.imgXscale*=i,this.imgYscale*=e,this.imgX*=i,this.imgY*=e},h.prototype.formatText=function(t){var s,i,e,r,o,a,h,n,c,l,d,p,f,g=this.fontSize||t.fontSize,u=this.fontFamily||t.fontFamily,C=this.fontWeight||t.fontWeight,m=this.lorg||1,x=0,y=0
this.orgXscl||(this.orgXscl=t.xscl),this.fontSizeWC=g/this.orgXscl,t.ctx.save(),t.ctx.font=C+" "+g+"px "+u,s=t.ctx.measureText(this.drawCmds).width,t.ctx.restore(),s/=this.orgXscl,i=g/this.orgXscl,e=s/2,r=i/2,o=[0,[0,i],[e,i],[s,i],[0,r],[e,r],[s,r],[0,0],[e,0],[s,0]],void 0!==o[m]&&(x=-o[m][0],y=-o[m][1]),this.imgLorgX=x,this.imgLorgY=y+.25*i,this.width=s,this.height=i,a=this.imgX+x,h=this.imgY-y,n=this.imgX+x,c=this.imgY-y-i,l=this.imgX+x+s,d=this.imgY-y-i,p=this.imgX+x+s,f=this.imgY-y,this.bBoxCmds[0]=new DrawCmd("moveTo",[a,-h]),this.bBoxCmds[1]=new DrawCmd("lineTo",[n,-c]),this.bBoxCmds[2]=new DrawCmd("lineTo",[l,-d]),this.bBoxCmds[3]=new DrawCmd("lineTo",[p,-f]),this.bBoxCmds[4]=new DrawCmd("closePath",[])},Cobj=function(t,s,i){var e,n,c,l=r
switch(s){case"PATH":l=r
break
case"SHAPE":l=o
break
case"IMG":l=a
break
case"TEXT":l=h}l.call(this,t),e=new l
for(c in e)"function"==typeof e[c]&&(this[c]=e[c])
n="object"==typeof i?i:{}
for(c in n)n.hasOwnProperty(c)&&this.setProperty(c,n[c])},Cobj.prototype.setProperty=function(t,s){if("string"==typeof t&&void 0!==s)switch(t.toLowerCase()){case"fillcolor":this.fillCol=s
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
default:return}},Cobj.prototype.dup=function(){var t=new Cobj
return t.type=this.type,t.drawCmds=s(this.drawCmds),t.imgBuf=this.imgBuf,t.bBoxCmds=s(this.bBoxCmds),t.dwgOrg=s(this.dwgOrg),t.iso=this.iso,t.border=this.border,t.strokeCol=this.strokeCol,t.fillCol=this.fillCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.width=this.width,t.height=this.height,t.imgX=this.imgX,t.imgY=this.imgY,t.imgLorgX=this.imgLorgX,t.imgLorgY=this.imgLorgY,t.imgXscale=this.imgXscale,t.imgYscale=this.imgYscale,t.imgDegs=this.imgDegs,t.lorg=this.lorg,t.dragNdrop=null,t.fontSize=this.fontSize,t.fontWeight=this.fontWeight,t.fontFamily=this.fontFamily,t.bgFillColor=this.bgFillColor,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t.dashed=this.dashed,t.dashOffset=this.dashOffset,t},Cango=function(s){function i(){var t,s,i=o.bkgCanvas.offsetTop+o.bkgCanvas.clientTop,e=o.bkgCanvas.offsetLeft+o.bkgCanvas.clientLeft,r=o.bkgCanvas.offsetWidth,a=o.bkgCanvas.offsetHeight
if(o.bkgCanvas.timeline&&o.bkgCanvas.timeline.animTasks.length&&o.deleteAllAnimations(),o.rawWidth=r,o.rawHeight=a,o.aRatio=r/a,o.bkgCanvas===o.cnvs)for(o.cnvs.setAttribute("width",r),o.cnvs.setAttribute("height",a),o.buffered&&(o.cnvs.buf.setAttribute("width",r),o.cnvs.buf.setAttribute("height",a)),t=1;t<o.bkgCanvas.layers.length;t++)s=o.bkgCanvas.layers[t].cElem,s&&(s.style.top=i+"px",s.style.left=e+"px",s.style.width=r+"px",s.style.height=a+"px",s.setAttribute("width",r),s.setAttribute("height",a),s.buf&&(s.buf.setAttribute("width",r),s.buf.setAttribute("height",a)))}var e,r,o=this
return this.cId=s,this.cnvs=document.getElementById(s),null===this.cnvs?void alert("can't find canvas "+s):(this.bkgCanvas=this.cnvs,-1!==s.indexOf("_ovl_")&&(e=s.slice(0,s.indexOf("_ovl_")),this.bkgCanvas=document.getElementById(e)),this.rawWidth=this.cnvs.offsetWidth,this.rawHeight=this.cnvs.offsetHeight,this.aRatio=this.rawWidth/this.rawHeight,this.widthPW=100,this.heightPW=this.widthPW/this.aRatio,this.bkgCanvas.hasOwnProperty("layers")||(this.bkgCanvas.layers=[],r=new n(this.cId,this.cnvs),this.bkgCanvas.layers[0]=r,t(this.bkgCanvas,"resize",i)),"undefined"==typeof CgoTimeline||this.bkgCanvas.hasOwnProperty("timeline")||(this.bkgCanvas.timeline=new CgoTimeline),this.cnvs.hasOwnProperty("resized")||(this.cnvs.setAttribute("width",this.rawWidth),this.cnvs.setAttribute("height",this.rawHeight),this.cnvs.resized=!0),this.buffered&&!this.cnvs.buf&&(this.cnvs.buf=document.createElement("canvas"),this.cnvs.buf.setAttribute("width",this.rawWidth),this.cnvs.buf.setAttribute("height",this.rawHeight),this.bufCtx=this.cnvs.buf.getContext("2d")),this.ctx=this.cnvs.getContext("2d"),this.yDown=!1,this.vpW=this.rawWidth,this.vpH=this.rawHeight,this.vpOrgX=0,this.vpOrgY=this.rawHeight,this.xscl=1,this.yscl=-1,this.xoffset=0,this.yoffset=0,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset},this.ctx.textAlign="left",this.ctx.textBaseline="alphabetic",this.penCol="rgba(0, 0, 0, 1.0)",this.penWid=1,this.lineCap="butt",this.paintCol="rgba(128,128,128,1.0)",this.fontSize=12,this.fontWeight=400,this.fontFamily="Consolas, Monaco, 'Andale Mono', monospace",this.clipCount=0,this.getUnique=function(){return d+=1},void this.initModules())},Cango.prototype.initModules=function(){},Cango.prototype.getHostLayer=function(){var t,s=this.bkgCanvas.layers[0]
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
void 0!==this.ctx.shadowOffsetX&&("SHAPE"===t.type||"PATH"===t.type&&!t.iso?(o*=this.xscl,a*=this.yscl):(o*=this.xscl,a*=-this.xscl),this.ctx.shadowOffsetX=s*o,this.ctx.shadowOffsetY=i*a,this.ctx.shadowBlur=e*o,this.ctx.shadowColor=r)},Cango.prototype.render=function(s,r,o,a,h){function n(s){function i(){s.formatImg(),c.paintImg(s,r,o,a,h)}return"object"==typeof s&&s instanceof Cobj?void("IMG"===s.type?s.imgBuf.complete?i():t(s.imgBuf,"load",i):"TEXT"===s.type?(s.formatText(c),c.paintText(s,r,o,a,h)):c.paintPath(s,r,o,a,h)):void console.warn("Cango.render: object not instanceof of Cobj")}var c=this
i(s)?e(s).forEach(n):s&&n(s)},Cango.prototype.paintImg=function(t,s,i,e,r){function o(t){return[t[0]*n-t[1]*h,t[0]*h+t[1]*n]}var a,h,n,c,l,d=this,p=t.imgBuf,f=s||0,g=i||0,u=e||1,C=u*t.imgXscale,m=r||0
this.ctx.save(),this.dropShadow(t),this.ctx.translate(this.vpOrgX+this.xoffset+f*this.xscl,this.vpOrgY+this.yoffset+g*this.yscl),m+=t.imgDegs,m&&(a=this.yscl>0?-m*Math.PI/180:m*Math.PI/180,h=Math.sin(a),n=Math.cos(a),this.ctx.rotate(-a)),this.ctx.drawImage(p,this.xscl*C*(t.imgX+t.imgLorgX),this.xscl*C*(t.imgY+t.imgLorgY),this.xscl*C*t.width,this.xscl*C*t.height),this.ctx.restore(),t.bBoxCmds.forEach(function(t){var s,i
t.parms.length&&(s=m?o(t.parms[0]):[t.parms[0][0],t.parms[0][1]],s[0]*=C*d.xscl,s[1]*=-C*d.xscl,i=d.toPixelCoords(f,g),t.parmsPx[0]=s[0]+i.x,t.parmsPx[1]=s[1]+i.y)}),t.border&&(this.ctx.save(),this.ctx.beginPath(),t.bBoxCmds.forEach(function(t){d.ctx[t.drawFn].apply(d.ctx,t.parmsPx)}),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*C*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke(),this.ctx.restore()),t.dwgOrg.x=f,t.dwgOrg.y=g,null!==t.dragNdrop&&(c=this.getHostLayer(),c!==t.dragNdrop.layer&&t.dragNdrop.layer&&(l=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==l&&t.dragNdrop.layer.dragObjects.splice(l,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=c,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.paintPath=function(t,s,i,e,r){function o(t,s){var i,e=t.grad[0],r=t.grad[1],o=t.grad[2],a=t.grad[3],h=C.xscl,n=C.yscl
return s&&(n=C.yscl>0?C.xscl:-C.xscl),i=C.ctx.createLinearGradient(h*e,n*r,h*o,n*a),t.colorStops.forEach(function(t){i.addColorStop(t[0],t[1])}),i}function a(t,s){var i,e=t.grad[0],r=t.grad[1],o=t.grad[2],a=t.grad[3],h=t.grad[4],n=t.grad[5],c=C.xscl,l=C.yscl
return s&&(l=C.yscl>0?C.xscl:-C.xscl),i=C.ctx.createRadialGradient(c*e,l*r,c*o,c*a,l*h,c*n),t.colorStops.forEach(function(t){i.addColorStop(t[0],t[1])}),i}function h(t){return[t[0]*l-t[1]*c,t[0]*c+t[1]*l]}var n,c,l,d,p,f,g,u,C=this,m=s||0,x=i||0,y=e||1,v=r||0,w=this.vpOrgX+this.xoffset+m*this.xscl,b=this.vpOrgY+this.yoffset+x*this.yscl,O=this.xscl,W=this.yscl
t.iso&&(W=this.yscl>0?this.xscl:-this.xscl),v&&(n=this.yscl>0?-v*Math.PI/180:v*Math.PI/180,c=Math.sin(n),l=Math.cos(n)),this.ctx.save(),this.dropShadow(t),this.ctx.translate(w,b),this.ctx.beginPath(),t.drawCmds.forEach(function(t){t.parmsPx=[],t.parms.forEach(function(s){var i
i=v?h(s):[s[0],s[1]],i[0]*=y*O,i[1]*=y*W,t.parmsPx.push(i[0],i[1])}),C.ctx[t.drawFn].apply(C.ctx,t.parmsPx)}),"SHAPE"===t.type&&(p=t.fillCol||this.paintCol,p instanceof LinearGradient?(f=o(p,t.iso),this.ctx.fillStyle=f):p instanceof RadialGradient?(f=a(p,t.iso),this.ctx.fillStyle=f):this.ctx.fillStyle=p,this.ctx.fill(),this.ctx.shadowOffsetX=0,this.ctx.shadowOffsetY=0,this.ctx.shadowBlur=0),("PATH"===t.type||t.border)&&(t.dashed&&(this.ctx.setLineDash(t.dashed),this.ctx.lineDashOffset=t.dashOffset),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*y*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke()),this.ctx.restore(),t.drawCmds.forEach(function(t){for(d=0;d<t.parms.length;d++)t.parmsPx[2*d]=t.parmsPx[2*d]*y+w,t.parmsPx[2*d+1]=t.parmsPx[2*d+1]*y+b}),t.dwgOrg.x=m,t.dwgOrg.y=x,null!==t.dragNdrop&&(g=this.getHostLayer(),g!==t.dragNdrop.layer&&t.dragNdrop.layer&&(u=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==u&&t.dragNdrop.layer.dragObjects.splice(u,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=g,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.paintText=function(t,s,i,e,r){function o(t){return[t[0]*d-t[1]*l,t[0]*l+t[1]*d]}var a,h,n=this,c=0,l=0,d=1,p=s||0,f=i||0,g=e||1,u=g*t.imgXscale,C=r||0,m=this.xscl*u*t.fontSizeWC,x=t.fontFamily||this.fontFamily,y=t.fontWeight||this.fontWeight
C+=t.imgDegs,C&&(c=this.yscl>0?-C*Math.PI/180:C*Math.PI/180,l=Math.sin(c),d=Math.cos(c)),t.bBoxCmds.forEach(function(t){var s,i
t.parms.length&&(s=C?o(t.parms[0]):[t.parms[0][0],t.parms[0][1]],s[0]*=u*n.xscl,s[1]*=-u*n.xscl,i=n.toPixelCoords(p,f),t.parmsPx[0]=s[0]+i.x,t.parmsPx[1]=s[1]+i.y)}),"rgba(0,0,0,0.0)"!=t.bgFillColor&&(this.ctx.save(),this.ctx.beginPath(),t.bBoxCmds.forEach(function(t){n.ctx[t.drawFn].apply(n.ctx,t.parmsPx)}),this.ctx.fillStyle=t.bgFillColor,this.ctx.strokeStyle=t.bgFillColor,this.ctx.lineWidth=.1*m,this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()),this.ctx.save(),this.dropShadow(t),this.ctx.translate(this.vpOrgX+this.xoffset+p*this.xscl,this.vpOrgY+this.yoffset+f*this.yscl),C&&this.ctx.rotate(-c),this.ctx.font=y+" "+m+"px "+x,this.ctx.fillStyle=t.fillCol||this.paintCol,this.ctx.fillText(t.drawCmds,this.xscl*u*(t.imgX+t.imgLorgX),-this.xscl*u*(t.imgY+t.imgLorgY)),t.border&&(this.ctx.shadowOffsetX=0,this.ctx.shadowOffsetY=0,this.ctx.shadowBlur=0,t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.strokeText(t.drawCmds,this.xscl*u*(t.imgX+t.imgLorgX),-this.xscl*u*(t.imgY+t.imgLorgY))),this.ctx.restore(),t.dwgOrg.x=p,t.dwgOrg.y=f,null!==t.dragNdrop&&(a=this.getHostLayer(),a!==t.dragNdrop.layer&&t.dragNdrop.layer&&(h=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==h&&t.dragNdrop.layer.dragObjects.splice(h,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=a,-1===t.dragNdrop.layer.dragObjects.indexOf(t)&&t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.drawPath=function(t,s,i,e){var r=new Cobj(t,"PATH",e)
return this.render(r,s,i),r},Cango.prototype.drawShape=function(t,s,i,e){var r=new Cobj(t,"SHAPE",e)
return this.render(r,s,i),r},Cango.prototype.drawText=function(t,s,i,e){var r=new Cobj(t,"TEXT",e)
return this.render(r,s,i),r},Cango.prototype.drawImg=function(t,s,i,e){var r=new Cobj(t,"IMG",e)
return this.render(r,s,i),r},Cango.prototype.clipPath=function(t,s,i,e,r){function o(t){return[t[0]*n-t[1]*h,t[0]*h+t[1]*n]}var a,h,n,c=this,l=s||0,d=i||0,p=e||1,f=r||0,g=this.vpOrgX+this.xoffset+l*this.xscl,u=this.vpOrgY+this.yoffset+d*this.yscl,C=this.xscl,m=this.yscl
"IMG"!==t.type&&"TEXT"!==t.type&&(t.iso&&(m=this.yscl>0?this.xscl:-this.xscl),f&&(a=this.yscl>0?-f*Math.PI/180:f*Math.PI/180,h=Math.sin(a),n=Math.cos(a)),this.ctx.save(),this.ctx.beginPath(),t.drawCmds.forEach(function(t){t.parmsPx=[],t.parms.forEach(function(s){var i
i=f?o(s):[s[0],s[1]],i[0]=g+C*p*i[0],i[1]=u+m*p*i[1],t.parmsPx.push(i[0],i[1])}),c.ctx[t.drawFn].apply(c.ctx,t.parmsPx)}),this.ctx.clip(),this.clipCount++)},Cango.prototype.resetClip=function(){for(;this.clipCount>0;)this.ctx.restore(),this.clipCount--},Cango.prototype.createLayer=function(){var t,s,i,e,r,o,a=this.rawWidth,h=this.rawHeight,c=this.bkgCanvas.layers.length
return-1!==this.cId.indexOf("_ovl_")?(console.log("canvas layers can't create layers"),""):(i=this.getUnique(),e=this.cId+"_ovl_"+i,t="<canvas id='"+e+"' style='position:absolute' width='"+a+"' height='"+h+"'></canvas>",o=this.bkgCanvas.layers[c-1].cElem,o.insertAdjacentHTML("afterend",t),s=document.getElementById(e),s.style.backgroundColor="transparent",s.style.left=this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft+"px",s.style.top=this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop+"px",s.style.width=this.bkgCanvas.offsetWidth+"px",s.style.height=this.bkgCanvas.offsetHeight+"px",r=new n(e,s),this.bkgCanvas.layers.push(r),e)},Cango.prototype.deleteLayer=function(t){var s,i
for(i=1;i<this.bkgCanvas.layers.length;i++)this.bkgCanvas.layers[i].id===t&&(s=this.bkgCanvas.layers[i].cElem,s&&(s.alphaOvl&&s.alphaOvl.parentNode&&s.alphaOvl.parentNode.removeChild(s.alphaOvl),s.parentNode.removeChild(s)),this.bkgCanvas.layers.splice(i,1))},Cango.prototype.deleteAllLayers=function(){var t,s
for(t=this.bkgCanvas.layers.length-1;t>0;t--)s=this.bkgCanvas.layers[t].cElem,s&&(s.alphaOvl&&s.alphaOvl.parentNode&&s.alphaOvl.parentNode.removeChild(s.alphaOvl),s.parentNode.removeChild(s)),this.bkgCanvas.layers.splice(t,1)},Cango.prototype.dupCtx=function(t){this.vpW=t.vpW,this.vpH=t.vpH,this.vpOrgX=t.vpOrgX,this.vpOrgY=t.vpOrgY,this.xscl=t.xscl,this.yscl=t.yscl,this.xoffset=t.xoffset,this.yoffset=t.yoffset,this.savWC=s(t.savWC),this.penCol=t.penCol.slice(0),this.penWid=t.penWid,this.lineCap=t.lineCap.slice(0),this.paintCol=t.paintCol.slice(0),this.fontFamily=t.fontFamily.slice(0),this.fontSize=t.fontSize,this.fontWeight=t.fontWeight},Cango.prototype.toImgObj=function(t){var s,i,e,r,o,a,h,n,c,l,d,p,f=this.xscl,g=this.yscl,u=new Cobj("","IMG")
if("PATH"!==t.type&&"SHAPE"!==t.type)return null
for(t.iso&&(g=this.yscl>0?this.xscl:-this.xscl),r=i=t.drawCmds[0].parms[0][0],e=s=t.drawCmds[0].parms[0][1],d=1;d<t.drawCmds.length;d++)for(p=0;p<t.drawCmds[d].parms.length;p++)t.drawCmds[d].parms[p][0]>i&&(i=t.drawCmds[d].parms[p][0]),t.drawCmds[d].parms[p][0]<r&&(r=t.drawCmds[d].parms[p][0]),t.drawCmds[d].parms[p][1]>s&&(s=t.drawCmds[d].parms[p][1]),t.drawCmds[d].parms[p][1]<e&&(e=t.drawCmds[d].parms[p][1])
return o=r*f-2,a=this.yscl>0?e*g-2:e*g+2,h=(i-r)*f+4,n=this.yscl>0?(s-e)*g+4:(e-s)*g+4,c=document.createElement("canvas"),c.setAttribute("width",h),c.setAttribute("height",n),l=new Cango(this.cId),l.dupCtx(this),l.cnvs=c,l.cId="_sprite_",l.ctx=l.cnvs.getContext("2d"),l.rawWidth=h,l.rawHeight=n,l.vpW=l.rawWidth,l.vpH=l.rawHeight,l.vpOrgX=0,l.vpOrgY=this.yscl>0?0:l.rawHeight,l.xoffset=-o,l.yoffset=-a,this.paintPath.call(l,t),u.imgXscale=1/this.xscl,u.imgBuf.src=l.cnvs.toDataURL(),u}}()