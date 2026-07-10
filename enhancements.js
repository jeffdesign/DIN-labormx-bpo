(function(){
  'use strict';
  const PERSONAL_EMAILS = ['gmail.com','hotmail.com','outlook.com','yahoo.com','live.com','icloud.com','proton.me','protonmail.com'];
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function waitForPage(){
    if(!$('#hero') || !$('#faq') || $$('.lm-service-flip').length < 4 || !$('.lm-usecase-timeline') || !$('.lm-faq-timeline') || $$('.lm-process-card').length < 3) return setTimeout(waitForPage,120);
    init();
  }

  function init(){
    if(document.documentElement.dataset.lmEnhanced) return;
    document.documentElement.dataset.lmEnhanced='true';
    initProgress();
    initNav();
    initParticles();
    initHeadings();
    initCTAs();
    initServiceFlipCards();
    initCards();
    initTimelineBehavior();
    initProcessTimeline();
    initParallax();
    initCursor();
    initForms();
    initModal();
    initAutoPopup();
    speedMarquees();
  }

  function initProgress(){
    const bar=document.createElement('div');bar.id='lm-scroll-progress';document.body.appendChild(bar);
    const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?(scrollY/max)*100:0)+'%'};
    addEventListener('scroll',update,{passive:true});update();
  }

  function initNav(){
    const nav=$('nav'); if(!nav) return; nav.classList.add('lm-nav');
    const children=Array.from(nav.children); if(children[1]) children[1].classList.add('lm-nav-links'); if(children[2]) children[2].classList.add('lm-nav-actions');
    const btn=document.createElement('button');btn.className='lm-menu-button';btn.type='button';btn.setAttribute('aria-label','Abrir menú');btn.innerHTML='☰';nav.appendChild(btn);
    const panel=document.createElement('div');panel.className='lm-mobile-panel';panel.innerHTML=`<a href="#services">Servicios</a><a href="#use-cases">Casos de uso</a><a href="#process">Proceso</a><a href="#results">Resultados</a><a href="#contact-form">Agendar llamada</a>`;document.body.appendChild(panel);
    btn.addEventListener('click',()=>{const open=panel.classList.toggle('lm-open');btn.innerHTML=open?'×':'☰';btn.setAttribute('aria-expanded',String(open))});
    panel.addEventListener('click',()=>{panel.classList.remove('lm-open');btn.innerHTML='☰'});
    const scroll=()=>nav.classList.toggle('lm-nav-scrolled',scrollY>36);addEventListener('scroll',scroll,{passive:true});scroll();
  }

  function initParticles(){
    ['#hero','#use-cases','#process','#contact-form','footer'].forEach(sel=>{const el=$(sel);if(el)el.classList.add('lm-particles','lm-dark')});
    $$('section').forEach(sec=>{const bg=getComputedStyle(sec).backgroundColor;if(bg==='rgb(21, 35, 85)')sec.classList.add('lm-particles','lm-dark')});
  }

  function splitHeading(el){
    if(!el || el.dataset.split) return; el.dataset.split='1';el.classList.add('lm-kinetic-heading');
    const text=el.textContent.trim(); if(!text) return;
    el.setAttribute('aria-label',text); el.innerHTML='';
    const words=text.split(/\s+/);words.forEach((word,i)=>{const s=document.createElement('span');s.className='lm-word';const clean=word.toLowerCase().replace(/[^a-záéíóúüñ0-9]/g,'');if(['48','sla','calidad','estructura','resultados'].includes(clean)||((i>0)&&words[i-1].replace(/[^0-9]/g,'')==='48'))s.classList.add('lm-accent-word');s.style.setProperty('--i',i);s.textContent=word;el.appendChild(s)});
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('lm-heading-visible');io.unobserve(e.target)}}),{threshold:.35});io.observe(el);
  }
  function initHeadings(){
    $$('h1, section h2').forEach(splitHeading);
  }

  function initCTAs(){
    $$('a,button').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      if(t.includes('agendar')||t.includes('cotizar')||t.includes('ver los servicios')||el.type==='submit')el.classList.add('lm-cta');
    });
    if(reduced) return;
    $$('.lm-cta').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.07}px,${y*.10}px) translateY(-2px)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }


  function initServiceFlipCards(){
    $$('.lm-service-flip').forEach(card=>{
      const toggle=()=>{const open=card.classList.toggle('lm-flipped');card.setAttribute('aria-pressed',String(open))};
      card.addEventListener('click',toggle);
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
      card.addEventListener('pointerleave',()=>{if(matchMedia('(hover:hover)').matches){card.classList.remove('lm-flipped');card.setAttribute('aria-pressed','false')}});
    });
  }

  function initTimelineBehavior(){
    $$('.lm-auto-timeline').forEach(timeline=>{
      let hoverPaused=false;
      const centerActive=()=>{
        const active=timeline.querySelector('.lm-timeline-marker[aria-selected="true"],.lm-timeline-marker[data-active="true"]');
        if(active && innerWidth<901) active.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest',inline:'center'});
      };
      const observer=new MutationObserver(centerActive);
      observer.observe(timeline,{subtree:true,attributes:true,attributeFilter:['aria-selected','data-active']});
      centerActive();

      const visibilityObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
        const button=timeline.querySelector('.lm-timeline-toggle');
        if(!button) return;
        if(!entry.isIntersecting && /Pausar/i.test(button.textContent)){
          button.click();
          timeline.dataset.viewportPaused='1';
        }else if(entry.isIntersecting && timeline.dataset.viewportPaused==='1' && /Reanudar/i.test(button.textContent)){
          button.click();
          delete timeline.dataset.viewportPaused;
        }
      }),{threshold:.12});
      visibilityObserver.observe(timeline);

      if(!matchMedia('(hover:hover)').matches) return;
      const pause=()=>{
        const button=timeline.querySelector('.lm-timeline-toggle');
        if(button && /Pausar/i.test(button.textContent)){button.click();hoverPaused=true}
      };
      const resume=()=>{
        const button=timeline.querySelector('.lm-timeline-toggle');
        if(button && hoverPaused && /Reanudar/i.test(button.textContent)){button.click()}
        hoverPaused=false;
      };
      timeline.addEventListener('pointerenter',pause);
      timeline.addEventListener('pointerleave',resume);
      timeline.addEventListener('focusin',pause);
      timeline.addEventListener('focusout',e=>{if(!timeline.contains(e.relatedTarget))resume()});
    });
  }

  function initCards(){
    const selectors=['#approach [style*="border-radius:20px"]','#results [style*="border-radius:24px"]','#use-cases [style*="border-radius:20px"]'];
    let cards=[];selectors.forEach(s=>cards.push(...$$(s)));cards=[...new Set(cards.filter(el=>el.children.length>1))];
    cards.forEach(card=>{
      card.classList.add('lm-tilt-card');
      if(reduced) return;
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;card.style.setProperty('--mx',(px*100)+'%');card.style.setProperty('--my',(py*100)+'%');card.style.transform=`perspective(900px) rotateX(${(0.5-py)*5}deg) rotateY(${(px-.5)*6}deg) translateY(-4px)`});
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
    $$('#hero [style*="position:absolute"]').filter(el=>el.textContent.includes('48h')||el.textContent.includes('CS2 aprobado')).forEach(el=>el.classList.add('lm-float-badge'));
  }

  function initProcessTimeline(){
    const section=$('#process');if(!section)return;
    const grid=$('.lm-process-track',section);if(!grid)return;const cards=$$('.lm-process-card',grid);if(cards.length<2)return;
    let active=0,timer=null,visible=false;
    const set=i=>{active=(i+cards.length)%cards.length;cards.forEach((c,n)=>c.classList.toggle('lm-active',n===active));grid.style.setProperty('--lm-process-progress',cards.length>1?(active/(cards.length-1)*76)+'%':'0%');if(innerWidth<901)cards[active].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})};
    const play=()=>{clearInterval(timer);timer=setInterval(()=>visible&&set(active+1),2600)};
    cards.forEach((c,i)=>c.addEventListener('click',()=>{set(i);play()}));
    const io=new IntersectionObserver(es=>es.forEach(e=>{visible=e.isIntersecting;if(visible)set(active)}),{threshold:.25});io.observe(grid);set(0);play();
    document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):play());
  }

  function initParallax(){
    if(reduced)return;const hero=$('#hero');if(!hero)return;const visual=hero.querySelector('.lm-bpo-hero-visual');if(!visual)return;visual.classList.add('lm-hero-visual');
    hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;visual.style.transform=`translate3d(${x*14}px,${y*10}px,0)`});hero.addEventListener('pointerleave',()=>visual.style.transform='');
  }

  function initCursor(){
    if(reduced||matchMedia('(pointer:coarse)').matches)return;const dot=document.createElement('div'),ring=document.createElement('div');dot.className='lm-cursor-dot';ring.className='lm-cursor-ring';document.body.append(dot,ring);let x=0,y=0,rx=0,ry=0;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;dot.style.transform=`translate(${x-3}px,${y-3}px)`;document.body.classList.add('lm-cursor-ready')});
    const loop=()=>{rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.transform=`translate(${rx-17}px,${ry-17}px) scale(${ring.classList.contains('lm-hover')?1.55:1})`;requestAnimationFrame(loop)};loop();
    document.addEventListener('mouseover',e=>{if(e.target.closest('a,button,input,select,textarea,.lm-tilt-card'))ring.classList.add('lm-hover')});document.addEventListener('mouseout',e=>{if(e.target.closest('a,button,input,select,textarea,.lm-tilt-card'))ring.classList.remove('lm-hover')});
  }

  function corporateEmailValid(email){const parts=String(email).toLowerCase().trim().split('@');return parts.length===2&&!PERSONAL_EMAILS.includes(parts[1])}
  function initForms(){
    $$('form').forEach(form=>{
      form.addEventListener('submit',e=>{
        e.preventDefault();const email=form.querySelector('input[type="email"]');if(email&&!corporateEmailValid(email.value)){showFormMessage(form,'Utiliza un correo corporativo para continuar.');email.focus();return}
        const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;const old=btn.textContent;btn.textContent='Enviando…';setTimeout(()=>{btn.textContent='Solicitud recibida ✓';showFormMessage(form,'Gracias. Un especialista revisará tu solicitud.',true);setTimeout(()=>{btn.disabled=false;btn.textContent=old},2600)},900)}
      });
    });
  }
  function showFormMessage(form,msg,ok=false){let p=form.querySelector('.lm-inline-message');if(!p){p=document.createElement('p');p.className='lm-inline-message';p.style.cssText='margin:12px 0 0;text-align:center;font-size:13px;font-weight:700';form.appendChild(p)}p.textContent=msg;p.style.color=ok?'#73e2ad':'#ff9a94'}

  function modalMarkup(){return `<div class="lm-modal" id="lm-lead-modal" aria-hidden="true">
    <div class="lm-modal-backdrop" data-close-modal></div>
    <section class="lm-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="lm-modal-title" tabindex="-1">
      <button class="lm-modal-close" type="button" aria-label="Cerrar formulario" data-close-modal><span></span><span></span></button>
      <aside class="lm-modal-side lm-particles">
        <div>
          <img src="assets/logo-white.png" alt="Labor Mexicana" width="240" height="61">
          <p class="lm-modal-eyebrow">Respuesta en menos de 24 horas</p>
          <h2 id="lm-modal-title">Agenda una llamada</h2>
          <p>Cuéntanos tu situación y un ingeniero de calidad te contactará para validar el siguiente paso.</p>
        </div>
        <div class="lm-modal-side-proof" aria-label="Características del servicio">
          <span><i>✓</i> Activación en menos de 48 horas</span>
          <span><i>✓</i> SLA contractual</span>
          <span><i>✓</i> Cobertura en México y Estados Unidos</span>
        </div>
      </aside>
      <div class="lm-modal-form-wrap">
        <div class="lm-form-topline">
          <span class="lm-form-step-label">Paso <strong data-step-current>1</strong> de 2</span>
          <span class="lm-form-helper">BPO de Calidad</span>
        </div>
        <div class="lm-form-progress"><span data-form-progress></span></div>
        <form id="lm-modal-form" novalidate>
          <div class="lm-form-step is-active" data-step="1">
            <h3>Datos de contacto</h3>
            <p class="lm-step-intro">Comparte tus datos para que podamos revisar tu caso.</p>
            <div class="lm-field-grid lm-field-grid-two">
              <label class="lm-field"><span>Tu nombre</span><input name="name" autocomplete="name" required placeholder="Nombre completo"></label>
              <label class="lm-field"><span>Correo corporativo</span><input name="email" type="email" autocomplete="email" required placeholder="correo@empresa.com" data-corporate-email><small data-email-error></small></label>
              <label class="lm-field"><span>Teléfono</span><input name="phone" type="tel" autocomplete="tel" required placeholder="+52 55 0000 0000"></label>
              <label class="lm-field"><span>Empresa / planta</span><input name="company" autocomplete="organization" required placeholder="Nombre de empresa"></label>
            </div>
            <div class="lm-form-actions lm-form-actions-end">
              <button class="lm-form-button lm-form-button-primary lm-cta" type="button" data-next-step>Continuar <span aria-hidden="true">→</span></button>
            </div>
          </div>
          <div class="lm-form-step" data-step="2" hidden>
            <h3>Cuéntanos el reto</h3>
            <p class="lm-step-intro">Ayúdanos a identificar el siguiente paso para tu operación.</p>
            <div class="lm-field-grid lm-field-grid-two">
              <label class="lm-field"><span>¿Cuándo necesitas arrancar?</span><select name="start" required><option value="">Selecciona una opción</option><option>Hoy o mañana</option><option>Este mes</option><option>De 1 a 3 meses</option><option>No lo tengo claro</option></select></label>
              <label class="lm-field"><span>¿Qué necesitas resolver?</span><select name="need" required><option value="">Selecciona una opción</option><option>Contención / sorteo</option><option>CS2</option><option>Quality Liaison</option><option>Scrap crónico</option><option>PPAP / APQP</option><option>Otro</option></select></label>
              <label class="lm-field lm-field-full"><span>Contexto</span><textarea name="context" rows="5" placeholder="Describe brevemente el reto de calidad"></textarea></label>
            </div>
            <div class="lm-form-error" role="status" aria-live="polite"></div>
            <div class="lm-form-actions lm-form-actions-split">
              <button class="lm-form-button lm-form-button-secondary" type="button" data-prev-step>← Regresar</button>
              <button class="lm-form-button lm-form-button-primary lm-cta" type="submit" data-submit-button>Agendar llamada <span aria-hidden="true">↗</span></button>
            </div>
          </div>
        </form>
      </div>
    </section>
  </div>`}

  function initModal(){
    document.body.insertAdjacentHTML('beforeend',modalMarkup());
    const modal=$('#lm-lead-modal'),dialog=$('.lm-modal-dialog',modal),form=$('#lm-modal-form'),stepCurrent=$('[data-step-current]',modal),progress=$('[data-form-progress]',modal),error=$('.lm-form-error',form),submit=$('[data-submit-button]',form);
    let currentStep=1,lastFocus=null;
    const config=window.LABOR_BPO_CONFIG||{};
    const trackingKeys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];

    function setStep(step){
      currentStep=step;
      $$('.lm-form-step',form).forEach(panel=>{const active=Number(panel.dataset.step)===step;panel.hidden=!active;panel.classList.toggle('is-active',active)});
      if(stepCurrent)stepCurrent.textContent=String(step);
      if(progress)progress.style.width=step===1?'50%':'100%';
      setTimeout(()=>$('.lm-form-step:not([hidden]) input,.lm-form-step:not([hidden]) select,.lm-form-step:not([hidden]) textarea',form)?.focus({preventScroll:true}),80);
    }
    function validateStep(step){
      const panel=$(`.lm-form-step[data-step="${step}"]`,form);if(!panel)return true;
      const fields=$$('input,select,textarea',panel).filter(el=>!el.disabled);
      let valid=true;
      fields.forEach(el=>{el.setCustomValidity('');el.closest('.lm-field')?.classList.remove('lm-invalid')});
      const email=$('[data-corporate-email]',panel);
      if(email&&email.value&&!corporateEmailValid(email.value)){
        email.setCustomValidity('Utiliza un correo corporativo para continuar.');
        email.closest('.lm-field')?.classList.add('lm-invalid');
        const message=$('[data-email-error]',email.closest('.lm-field'));if(message)message.textContent='Utiliza un correo corporativo para continuar.';
      }
      for(const el of fields){if(!el.checkValidity()){valid=false;el.closest('.lm-field')?.classList.add('lm-invalid')}}
      if(!valid){const first=fields.find(el=>!el.checkValidity());first?.reportValidity();first?.focus()}
      return valid;
    }
    function open(trigger){
      lastFocus=trigger||document.activeElement;sessionStorage.setItem('lmBpoPopupSeen','1');modal.classList.add('lm-open');modal.setAttribute('aria-hidden','false');document.documentElement.classList.add('lm-scroll-lock');setStep(1);setTimeout(()=>dialog.focus({preventScroll:true}),80);
    }
    function shut(){modal.classList.remove('lm-open');modal.setAttribute('aria-hidden','true');document.documentElement.classList.remove('lm-scroll-lock');lastFocus?.focus?.({preventScroll:true})}
    function addTracking(){
      const params=new URLSearchParams(location.search);
      trackingKeys.forEach(key=>{const value=params.get(key);if(value&&!form.elements[key]){const input=document.createElement('input');input.type='hidden';input.name=key;input.value=value;form.appendChild(input)}});
      if(!form.elements.page_url){const input=document.createElement('input');input.type='hidden';input.name='page_url';input.value=location.href;form.appendChild(input)}
    }
    async function sendForm(data){
      if(!config.webhookUrl){await new Promise(resolve=>setTimeout(resolve,750));return}
      const response=await fetch(config.webhookUrl,{method:'POST',body:data});if(!response.ok&&response.type!=='opaque')throw new Error('No fue posible enviar el formulario.');
    }
    function thankYouUrl(){const target=new URL(config.thankYouUrl||'thank-you.html',location.href);target.searchParams.set('submitted','1');const params=new URLSearchParams(location.search);trackingKeys.forEach(key=>{if(params.get(key))target.searchParams.set(key,params.get(key))});return target.href}

    window.LMOpenLeadModal=open;
    $$('a[href="#contact-form"],button[data-open-modal]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();open(el)}));
    $$('[data-close-modal]',modal).forEach(el=>el.addEventListener('click',shut));
    $('[data-next-step]',form)?.addEventListener('click',()=>{if(validateStep(1))setStep(2)});
    $('[data-prev-step]',form)?.addEventListener('click',()=>setStep(1));
    const email=$('[data-corporate-email]',form);email?.addEventListener('input',()=>{email.setCustomValidity('');email.closest('.lm-field')?.classList.remove('lm-invalid');const m=$('[data-email-error]',email.closest('.lm-field'));if(m)m.textContent=''});
    document.addEventListener('keydown',e=>{
      if(!modal.classList.contains('lm-open'))return;
      if(e.key==='Escape'){e.preventDefault();shut();return}
      if(e.key!=='Tab')return;
      const focusable=$$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',dialog).filter(el=>!el.closest('[hidden]'));
      if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    });
    form.addEventListener('submit',async e=>{
      e.preventDefault();if(!validateStep(2))return;addTracking();error.textContent='';submit.disabled=true;submit.innerHTML='Enviando… <span aria-hidden="true">↗</span>';
      try{await sendForm(new FormData(form));error.classList.add('lm-success');error.textContent='Solicitud enviada. Te redirigiremos en un momento.';setTimeout(()=>location.href=thankYouUrl(),450)}
      catch(err){error.classList.remove('lm-success');error.textContent='No pudimos enviar la solicitud. Inténtalo nuevamente.';submit.disabled=false;submit.innerHTML='Agendar llamada <span aria-hidden="true">↗</span>'}
    });
  }

  function initAutoPopup(){
    const footer=$('footer');if(!footer)return;let fired=false;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!fired&&!sessionStorage.getItem('lmBpoPopupSeen')){fired=true;sessionStorage.setItem('lmBpoPopupSeen','1');setTimeout(()=>window.LMOpenLeadModal&&window.LMOpenLeadModal(),500)}}),{threshold:.35});io.observe(footer);
  }
  function speedMarquees(){$$('[style*="lm-marquee"]').forEach(el=>el.classList.add('lm-marquee-fast'))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForPage);else waitForPage();
})();
