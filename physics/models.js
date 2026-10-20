(function(root){
 'use strict';
 const C={g:9.81,h:6.62607015e-34,c:299792458,e:1.602176634e-19,me:9.1093837e-31,mp:1.672621924e-27,k:1.380649e-23,R:8.314462618,G:6.6743e-11,eps:8.8541878128e-12};C.ke=1/(4*Math.PI*C.eps);
 const rad=deg=>deg*Math.PI/180;
 function projectile(u,angle,t){const ux=u*Math.cos(rad(angle)),uy=u*Math.sin(rad(angle));return {x:ux*t,y:uy*t-.5*C.g*t*t,vx:ux,vy:uy-C.g*t,time:2*uy/C.g,range:2*ux*uy/C.g};}
 function collision(m1,m2,u1,u2,elastic){const v=elastic?[(u1*(m1-m2)+2*m2*u2)/(m1+m2),(u2*(m2-m1)+2*m1*u1)/(m1+m2)]:[(m1*u1+m2*u2)/(m1+m2),(m1*u1+m2*u2)/(m1+m2)];return {v1:v[0],v2:v[1],before:m1*u1+m2*u2,after:m1*v[0]+m2*v[1],keBefore:.5*m1*u1*u1+.5*m2*u2*u2,keAfter:.5*m1*v[0]*v[0]+.5*m2*v[1]*v[1]};}
 function snell(n1,n2,degrees){const s=n1*Math.sin(rad(degrees))/n2;return {tir:s>1,angle:s>1?null:Math.asin(Math.min(1,s))*180/Math.PI,critical:n1>n2?Math.asin(n2/n1)*180/Math.PI:null};}
 function photoelectric(f,work){const energy=C.h*f/C.e;return {energy,threshold:work*C.e/C.h,ke:Math.max(0,energy-work),emits:energy>work};}
 function rc(R,cap,V,t,charging){const tau=R*cap,decay=Math.exp(-t/tau),v=V*(charging?1-decay:decay),current=(charging?1:-1)*V/R*decay;return {tau,v,q:cap*v,current,energy:.5*cap*v*v};}
 function orbit(height){const mass=5.972e24,r=6.371e6+height;return {r,g:C.G*mass/r**2,potential:-C.G*mass/r,speed:Math.sqrt(C.G*mass/r),period:2*Math.PI*Math.sqrt(r**3/(C.G*mass)),escape:Math.sqrt(2*C.G*mass/r)};}
 function fit(points){const n=points.length,mx=points.reduce((s,p)=>s+p.x,0)/n,my=points.reduce((s,p)=>s+p.y,0)/n;let xx=0,xy=0;for(const p of points){xx+=(p.x-mx)**2;xy+=(p.x-mx)*(p.y-my);}const gradient=xy/xx;return {gradient,intercept:my-gradient*mx};}
 function shm(A,k,m,t){const omega=Math.sqrt(k/m);return {x:A*Math.cos(omega*t),v:-A*omega*Math.sin(omega*t),a:-A*omega**2*Math.cos(omega*t),period:2*Math.PI/omega,energy:.5*k*A*A};}
 function damped(z,t){const w=2*Math.PI;if(z<1)return Math.exp(-z*w*t)*(Math.cos(w*Math.sqrt(1-z*z)*t)+z/Math.sqrt(1-z*z)*Math.sin(w*Math.sqrt(1-z*z)*t));if(Math.abs(z-1)<1e-10)return (1+w*t)*Math.exp(-w*t);const a=w*(-z+Math.sqrt(z*z-1)),b=w*(-z-Math.sqrt(z*z-1));return (-b*Math.exp(a*t)+a*Math.exp(b*t))/(a-b);}
 const amplitude=(ratio,z)=>1/Math.sqrt((1-ratio*ratio)**2+(2*z*ratio)**2);
 function decay(N,half,t){const lambda=Math.log(2)/half;return {n:N*Math.exp(-lambda*t),activity:lambda*N*Math.exp(-lambda*t),lambda};}
 function scatter(energyMeV,impactFm){const mu=C.ke*79*2*C.e*C.e/(2*energyMeV*1e6*C.e)/1e-15;let x=-1500,y=impactFm,vx=Math.sqrt(1-2*mu/Math.hypot(x,y)),vy=0;const h=.5,points=[];let entered=false;for(let i=0;i<16000;i++){const r=Math.hypot(x,y),ax=mu*x/r**3,ay=mu*y/r**3,nx=x+vx*h+.5*ax*h*h,ny=y+vy*h+.5*ay*h*h,nr=Math.hypot(nx,ny);vx+=(ax+mu*nx/nr**3)*h/2;vy+=(ay+mu*ny/nr**3)*h/2;x=nx;y=ny;if(Math.abs(x)<360&&Math.abs(y)<360){entered=true;if(i%2===0)points.push({x,y});}else if(entered)break;}return {points,angle:2*Math.atan(mu/impactFm)*180/Math.PI,closest:2*mu};}
 const api={C,rad,projectile,collision,snell,photoelectric,rc,orbit,fit,shm,damped,amplitude,decay,scatter};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PhysicsModels=api;
})(typeof window==='undefined'?globalThis:window);
