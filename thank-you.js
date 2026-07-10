(function(){
  'use strict';
  const frame=document.querySelector('[data-calendly-frame]');
  const url=window.LABOR_BPO_CONFIG&&window.LABOR_BPO_CONFIG.calendlyUrl;
  if(frame&&url){frame.removeAttribute('srcdoc');frame.src=url;}
})();
