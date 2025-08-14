(function(){
  // Simple utilities
  function escapeHTML(str){ return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function highlight(text, term){
    if(!term) return escapeHTML(text);
    try{
      const rx = new RegExp('('+term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')','gi');
      return escapeHTML(text).replace(rx,'<mark>$1</mark>');
    }catch(e){
      return escapeHTML(text);
    }
  }

  if(!window.LAW_TEXT || !window.LAW_TEXT.trim()){
    document.addEventListener('DOMContentLoaded', ()=>{
      const res = document.getElementById('results');
      res.innerHTML = '<div class="card"><p>Não consegui carregar o texto da lei. Verifique os arquivos.</p></div>';
    });
    return;
  }

  // Normalize line breaks
  const LAW = window.LAW_TEXT.replace(/\r/g,'').replace(/\u00a0/g,' ').trim();

  // Build quick index of articles: find "Art. N"
  const articleRegex = /(^|\n)(Art\.\s*\d+[ºo]?)(\s*[\u2013\-–—]\s*)?/g; // e.g., "Art. 11 –"
  let match, indices = [];
  while((match = articleRegex.exec(LAW))){
    indices.push({idx: match.index + (match[1] ? match[1].length : 0)});
  }
  // Compute slices for each article until next article or end
  const articles = [];
  for(let i=0;i<indices.length;i++){
    const start = indices[i].idx;
    const end = (i+1<indices.length)? indices[i+1].idx : LAW.length;
    const chunk = LAW.slice(start, end).trim();
    // Extract number
    const m = chunk.match(/^Art\.\s*(\d+)[ºo]?/);
    if(m){
      articles.push({num: parseInt(m[1],10), text: chunk});
    }
  }
  // Also build headings for a simple TOC (Title/Chapter/Section)
  const headingRx = /(T[ÍI]TULO\s+[IVXLCDM]+.*|CAP[ÍI]TULO\s+[IVXLCDM]+.*|Se[cç][aã]o\s+[IVXLCDM]+.*|SEÇÃO\s+[IVXLCDM]+.*)/g;
  const toc = [];
  let hm;
  while((hm = headingRx.exec(LAW))){
    toc.push(hm[0].trim());
  }

  function renderArticle(n){
    const res = document.getElementById('results');
    const found = articles.find(a => a.num === n);
    if(!found){
      res.innerHTML = `<div class="card"><p>Nenhum artigo <code class="badge">Art. ${n}</code> encontrado.</p></div>`;
      return;
    }
    res.innerHTML = `<article class="card">
      <h3>Art. ${n}</h3>
      <pre style="white-space:pre-wrap">${escapeHTML(found.text)}</pre>
      <p class="meta">Total de artigos detectados: ${articles.length}</p>
    </article>`;
  }

  function renderKeyword(q){
    const res = document.getElementById('results');
    if(!q || !q.trim()){
      res.innerHTML = `<div class="card"><p>Digite uma palavra para pesquisar.</p></div>`;
      return;
    }
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const hits = articles.filter(a => rx.test(a.text));
    if(hits.length === 0){
      res.innerHTML = `<div class="card"><p>Nenhum resultado para "<strong>${escapeHTML(q)}</strong>".</p></div>`;
      return;
    }
    res.innerHTML = hits.slice(0,50).map(a => `
      <article class="card">
        <h3>Art. ${a.num}</h3>
        <pre style="white-space:pre-wrap">${highlight(a.text, q)}</pre>
      </article>
    `).join('') + (hits.length>50? `<div class="card"><p>Mostrando 50 de ${hits.length} resultados. Refine a busca.</p></div>` : '');
  }

  function renderTOC(){
    const res = document.getElementById('results');
    if(toc.length===0){
      res.innerHTML = `<div class="card"><p>Sumário não detectado.</p></div>`;
      return;
    }
    res.innerHTML = `<div class="card"><h3>Sumário detectado</h3><ul>${toc.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>`;
  }

  function setup(){
    const rNumero = document.querySelector('input[value="numero"]');
    const rPalavra = document.querySelector('input[value="palavra"]');
    const boxNum = document.getElementById('search-by-number');
    const boxKW  = document.getElementById('search-by-keyword');
    rNumero.addEventListener('change', ()=>{
      boxNum.classList.remove('hidden'); boxKW.classList.add('hidden');
    });
    rPalavra.addEventListener('change', ()=>{
      boxKW.classList.remove('hidden'); boxNum.classList.add('hidden');
    });

    document.getElementById('btnBuscarArt').addEventListener('click', ()=>{
      const v = document.getElementById('artInput').value.trim();
      const n = parseInt(v, 10);
      if(Number.isFinite(n)) renderArticle(n);
      else document.getElementById('results').innerHTML = '<div class="card"><p>Digite um número de artigo válido.</p></div>';
    });

    document.getElementById('btnBuscarKW').addEventListener('click', ()=>{
      const v = document.getElementById('kwInput').value.trim();
      renderKeyword(v);
    });

    document.getElementById('btnListarTodos').addEventListener('click', renderTOC);

    document.getElementById('btnCompartilhar').addEventListener('click', async ()=>{
      const url = location.href;
      if(navigator.share){
        try{ await navigator.share({title: document.title, url}); }catch(e){ /* ignore */ }
      }else{
        navigator.clipboard.writeText(url).then(()=>{
          alert('Link copiado para a área de transferência!');
        }, ()=>{
          prompt('Copie o link:', url);
        });
      }
    });

    // If URL has ?art=NN or ?q=palavra, prefill
    const params = new URLSearchParams(location.search);
    if(params.has('art')){
      const n = parseInt(params.get('art'), 10);
      if(Number.isFinite(n)){ 
        document.querySelector('input[value="numero"]').checked = true;
        boxNum.classList.remove('hidden'); boxKW.classList.add('hidden');
        document.getElementById('artInput').value = String(n);
        renderArticle(n);
      }
    } else if(params.has('q')){
      const q = params.get('q') || '';
      document.querySelector('input[value="palavra"]').checked = true;
      boxKW.classList.remove('hidden'); boxNum.classList.add('hidden');
      document.getElementById('kwInput').value = q;
      renderKeyword(q);
    }
  }

  document.addEventListener('DOMContentLoaded', setup);
})();