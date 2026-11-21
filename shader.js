// Hero WebGL background: flowing domain-warped noise reacting to cursor & scroll
(function(){
  const c = document.getElementById('gl');
  if(!c) return;
  const gl = c.getContext('webgl',{antialias:false,premultipliedAlpha:false});
  if(!gl){ c.style.background='radial-gradient(circle at 60% 40%,#2a1d55,#07070a 70%)'; return; }

  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs = `
  precision highp float;
  uniform vec2 r; uniform float t; uniform vec2 m; uniform float s;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/r; vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
    vec2 mm=(m-.5)*vec2(r.x/r.y,1.);
    float d=length(p-mm);
    float T=t*.06;
    vec2 q=vec2(fbm(p*1.6+T),fbm(p*1.6-T+4.2));
    vec2 w=vec2(fbm(p*1.4+2.*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.4+2.*q+vec2(8.3,2.8)-T));
    w+= .35*exp(-d*3.)*normalize(p-mm+.001);
    float f=fbm(p*1.2+2.2*w);
    vec3 c1=vec3(.03,.03,.05);
    vec3 c2=vec3(.36,.22,.95);   // violet
    vec3 c3=vec3(.78,1.,.25);    // acid lime
    vec3 col=mix(c1,c2,smoothstep(.35,.85,f));
    col=mix(col,c3,smoothstep(.62,.95,f*length(w)*.9)*.75);
    // contour lines
    float lines=abs(fract(f*14.)-.5);
    col+=vec3(.9,1.,.6)*smoothstep(.04,.0,lines)*.06*smoothstep(.3,.8,f);
    col+=c3*.18*exp(-d*5.);
    col*=1.-s*.6;
    col*=.55+.45*smoothstep(1.3,.1,length(p*vec2(.8,1.)));
    gl_FragColor=vec4(col,1.);
  }`;
  function sh(type,src){const o=gl.createShader(type);gl.shaderSource(o,src);gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o;}
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const U={r:gl.getUniformLocation(pr,'r'),t:gl.getUniformLocation(pr,'t'),m:gl.getUniformLocation(pr,'m'),s:gl.getUniformLocation(pr,'s')};

  const DPR=Math.min(window.devicePixelRatio||1,1.5)*0.6; // render at reduced res for perf
  function resize(){c.width=c.clientWidth*DPR;c.height=c.clientHeight*DPR;gl.viewport(0,0,c.width,c.height);}
  resize();addEventListener('resize',resize);

  let mx=.6,my=.5,tx=.6,ty=.5,visible=true;
  addEventListener('pointermove',e=>{tx=e.clientX/innerWidth;ty=1-e.clientY/innerHeight;});
  new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(c);
  const t0=performance.now();
  (function loop(){
    requestAnimationFrame(loop);
    if(!visible) return;
    mx+=(tx-mx)*.05;my+=(ty-my)*.05;
    const s=Math.min(scrollY/innerHeight,1);
    gl.uniform2f(U.r,c.width,c.height);
    gl.uniform1f(U.t,(performance.now()-t0)/1000+20);
    gl.uniform2f(U.m,mx,my);
    gl.uniform1f(U.s,s);
    gl.drawArrays(gl.TRIANGLES,0,3);
  })();
})();
