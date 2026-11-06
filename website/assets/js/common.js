(function(){
 document.documentElement.classList.add('js');
 const header=document.getElementById('site-header');
 const footer=document.getElementById('site-footer');
 const current=location.pathname.split('/').pop()||'index.html';
 const nav=[['index.html','Home'],['projects.html','Projects'],['index.html#services','Services'],['team.html','About'],['index.html#contact','Contact'],['/admin','Admin']];
 if(header){header.innerHTML=`<header class="site-header"><div class="shell nav-wrap"><a class="brand" href="index.html" aria-label="ProjectHub home"><span class="brand-mark">✳</span> ProjectHub</a><nav class="nav-links" id="nav-links" aria-label="Main navigation">${nav.map(([url,label],index)=>`<a href="${url}" class="${current===url?'active':''}" style="--nav-i:${index}">${label}</a>`).join('')}</nav><div class="nav-actions"><a class="btn primary nav-cta" href="enroll.html">Start your project <span class="arrow-up-right">↗</span></a><button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">◐</button><button class="menu-toggle" id="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="nav-links">☰</button></div></div></header><button class="nav-backdrop" type="button" aria-label="Close navigation"></button>`;}
 if(footer){footer.innerHTML=`<footer class="site-footer"><div class="shell footer-inner"><div><b>✳ ProjectHub</b><div>Ideas organised. Projects in motion.</div></div><div class="footer-links"><a href="projects.html">Projects</a><a href="index.html#services">Services</a><a href="enroll.html">Submit a project</a><a href="team.html">About</a><a href="index.html#contact">Contact</a><a href="/admin">Admin</a></div><span>© ${new Date().getFullYear()} ProjectHub</span></div></footer>`;}
 const saved=localStorage.getItem('projecthub_theme');if(saved==='dark'||saved==='light')document.body.dataset.theme=saved;
 document.getElementById('theme-toggle')?.addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='light'?'dark':'light';localStorage.setItem('projecthub_theme',document.body.dataset.theme);});
 const menuToggle=document.getElementById('menu-toggle');
 const navLinks=document.getElementById('nav-links');
 const navBackdrop=header?.querySelector('.nav-backdrop');
 let previousBodyOverflow='';
 const setMenuOpen=open=>{
  if(!menuToggle||!navLinks)return;
  if(open)previousBodyOverflow=document.body.style.overflow;
  navLinks.classList.toggle('open',open);
  navBackdrop?.classList.toggle('open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  document.body.style.overflow=open?'hidden':previousBodyOverflow;
 };
 menuToggle?.addEventListener('click',()=>setMenuOpen(menuToggle.getAttribute('aria-expanded')!=='true'));
 navBackdrop?.addEventListener('click',()=>setMenuOpen(false));
 navLinks?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenuOpen(false)));
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true')setMenuOpen(false);
 });
 window.ProjectHub={
  getEnrolled(){try{return JSON.parse(localStorage.getItem(ProjectData.key)||'[]')}catch(e){return[]}},
  saveEnrolled(items){localStorage.setItem(ProjectData.key,JSON.stringify(items))},
  all(){return ProjectData.built.map(p=>({...p,status:'Built'})).concat(this.getEnrolled().map(p=>({...p,status:'Community'})))},
  escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 };
})();