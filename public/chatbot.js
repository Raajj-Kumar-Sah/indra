(() => {
  const boot=()=>{
    if(document.getElementById('iiChatPanel'))return;
    const root=document.createElement('div');
    root.innerHTML=`
      <button class="ii-chat-launcher" id="iiChatLauncher" type="button" aria-label="Open Indira Industries AI assistant" aria-expanded="false" aria-controls="iiChatPanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 10h8M8 14h5"/></svg><span class="ii-chat-label">ASK INDIRA AI</span></button>
      <section class="ii-chat-panel" id="iiChatPanel" role="dialog" aria-label="Indira Industries AI assistant" aria-hidden="true">
        <header class="ii-chat-head"><div class="ii-chat-avatar">IND</div><div class="ii-chat-headcopy"><strong>Indira Assistant</strong><small><span class="ii-chat-status"></span>AI product & business guide</small></div><button class="ii-chat-close" id="iiChatClose" aria-label="Close assistant">×</button></header>
        <div class="ii-chat-messages" id="iiChatMessages" aria-live="polite" aria-relevant="additions text"><div class="ii-chat-message bot">Hello! 👋 Welcome to Indira Industries. I can help you explore our divisions, find catalogue products, and connect with our team. What would you like to know?</div></div>
        <div class="ii-chat-suggestions" id="iiChatSuggestions"><button type="button">Explore products</button><button type="button">Distribution enquiry</button><button type="button">Contact the team</button></div>
        <form class="ii-chat-compose" id="iiChatForm"><textarea id="iiChatInput" rows="1" maxlength="1800" aria-label="Your message" placeholder="Ask us something…" required></textarea><button class="ii-chat-send" id="iiChatSend" type="submit" aria-label="Send message">↑</button></form>
        <div class="ii-chat-disclaimer">AI responses may be imperfect. Confirm specifications, pricing and availability with our team. Don't share passwords, OTPs or payment details.</div>
      </section>`;
    document.body.appendChild(root);
    const $=id=>document.getElementById(id),launcher=$('iiChatLauncher'),panel=$('iiChatPanel'),messages=$('iiChatMessages'),form=$('iiChatForm'),input=$('iiChatInput'),send=$('iiChatSend'),suggestions=$('iiChatSuggestions');
    const history=[];let busy=false;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function toggle(open){
      panel.classList.toggle('is-open',open);panel.setAttribute('aria-hidden',String(!open));launcher.setAttribute('aria-expanded',String(open));
      if(window.gsap&&!reduced&&open){window.gsap.fromTo(panel,{opacity:0,y:14,scale:.97},{opacity:1,y:0,scale:1,duration:.28,ease:'power2.out'});}
      if(open)setTimeout(()=>input.focus(),80);
    }
    launcher.addEventListener('click',()=>toggle(!panel.classList.contains('is-open')));
    $('iiChatClose').addEventListener('click',()=>{toggle(false);launcher.focus();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('is-open')){toggle(false);launcher.focus();}});
    function addMessage(text,who){
      const el=document.createElement('div');el.className='ii-chat-message '+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;
    }
    function typing(){
      const el=document.createElement('div');el.className='ii-chat-message bot';el.setAttribute('aria-label','Assistant is typing');el.innerHTML='<span class="ii-chat-typing"><i></i><i></i><i></i></span>';messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;
    }
    async function ask(text){
      text=String(text||'').trim();if(!text||busy)return;
      if(text.length>1800)text=text.slice(0,1800);
      busy=true;send.disabled=true;input.disabled=true;suggestions.hidden=true;addMessage(text,'user');const wait=typing();
      try{
        const response=await fetch('/api/chatbot',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({message:text,history:history.slice(-8)})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||'The assistant is temporarily unavailable.');
        const reply=String(data.reply||'').slice(0,6000);if(!reply)throw new Error('I could not prepare an answer. Please try again.');
        wait.remove();addMessage(reply,'bot');history.push({role:'user',text},{role:'model',text:reply});if(history.length>8)history.splice(0,history.length-8);
      }catch(error){wait.remove();addMessage(error.message||'Sorry, I am unable to connect right now. Please call +91 78270 32808 or email admin@indiraindustries.co.in.','bot');}
      finally{busy=false;send.disabled=false;input.disabled=false;input.focus();}
    }
    form.addEventListener('submit',e=>{e.preventDefault();const value=input.value;input.value='';input.style.height='auto';ask(value);});
    input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,100)+'px';});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
    suggestions.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>ask(button.textContent==='Explore products'?'What product categories and divisions do you offer?':button.textContent==='Distribution enquiry'?'How can I enquire about distribution or becoming a business partner?':'How can I contact the Indira Industries team?')));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();