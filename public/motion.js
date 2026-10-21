(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boot = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(window.MotionPathPlugin);
    gsap.config({nullTargetWarn:false});
    if (!reduced) {
      gsap.utils.toArray('.motion-reveal').forEach(el => gsap.fromTo(el,{y:36,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
      gsap.fromTo('.hero-emblem',{rotateY:-16,rotateX:8,z:-30},{rotateY:0,rotateX:0,z:0,duration:1.2,ease:'power3.out',delay:.12});
      gsap.to('.hero-emblem',{y:-10,rotateY:4,duration:3.5,repeat:-1,yoyo:true,ease:'sine.inOut'});
      gsap.to('.orbit-one',{rotate:360,duration:32,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
      gsap.to('.orbit-two',{rotate:-360,duration:44,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
      gsap.utils.toArray('.division-card').forEach((card,i)=>gsap.fromTo(card,{y:60,rotateX:5,opacity:0},{y:0,rotateX:0,opacity:1,duration:.8,delay:i*.12,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',once:true}}));
      gsap.utils.toArray('.about-art,.about-copy,.contact-copy,.contact-form').forEach((el,i)=>gsap.fromTo(el,{y:35,opacity:0},{y:0,opacity:1,duration:.8,delay:i%2*.12,scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
      const art=document.querySelector('.hero-art');
      if(art && window.matchMedia('(pointer:fine)').matches){
        art.addEventListener('pointermove',e=>{const r=art.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to('.hero-emblem',{rotateY:x*16,rotateX:-y*12,duration:.45,ease:'power2.out',overwrite:true});});
        art.addEventListener('pointerleave',()=>gsap.to('.hero-emblem',{rotateY:0,rotateX:0,duration:.65,ease:'power3.out'}));
      }
      document.querySelectorAll('.product-tile,.shop-card').forEach(card=>{
        if(!window.matchMedia('(pointer:fine)').matches)return;
        card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(card,{rotateY:x*5,rotateX:-y*4,transformPerspective:900,duration:.35,ease:'power2.out',overwrite:true});});
        card.addEventListener('pointerleave',()=>gsap.to(card,{rotateY:0,rotateX:0,duration:.5,ease:'power3.out'}));
      });
    }
    const section=document.querySelector('.pin-section');
    if(section){
      const items=gsap.utils.toArray('.motion-list li',section),slides=gsap.utils.toArray('.pin-slide',section),fill=section.querySelector('.pin-fill');
      if(items.length && slides.length){
        const activate=i=>{items.forEach((el,j)=>el.classList.toggle('is-active',j===i));slides.forEach((el,j)=>el.classList.toggle('is-active',j===i));const d=section.querySelector('.pin-detail');if(d){d.querySelector('.detail-index').textContent='0'+(i+1)+' / 0'+items.length;d.querySelector('h3').textContent=items[i].dataset.title||items[i].textContent;d.querySelector('p').textContent=items[i].dataset.copy||'';}};
        activate(0);
        if(!reduced){
          const tl=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'+='+Math.max(160,items.length*45)+'%',pin:true,scrub:.6,anticipatePin:1,invalidateOnRefresh:true}});
          items.forEach((item,i)=>{if(i===0)return;tl.call(()=>activate(i),[],(i-1)/items.length);tl.fromTo(slides[i],{scale:.86,rotateY:12,z:-60},{scale:1,rotateY:0,z:0,duration:.25,ease:'power2.out'},(i-1)/items.length);});
          if(fill)tl.fromTo(fill,{scaleY:1/items.length},{scaleY:1,transformOrigin:'top',ease:'none',duration:1},0);
          gsap.to('.pin-orbit',{rotate:18,rotateY:60,scrollTrigger:{trigger:section,start:'top top',end:'+='+Math.max(160,items.length*45)+'%',scrub:1}});
        } else { items.forEach((item,i)=>item.addEventListener('click',()=>activate(i))); }
      }
    }
    window.ScrollTrigger.refresh();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();