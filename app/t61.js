/* 61 — medição das páginas do App do Proprietário (/app e /app/vender) · 04/11/2026
   Mesmas tags do site 61imoveis.com: Google Analytics 4 (G-VNTRT32BF0) e pixel da Meta (820470936707053).
   Mede: página vista, tempo ativo na página (eventos tempo_ativo_10/30/60/120/300, só com a aba visível), rolagem (rolagem_25/50/75/90),
   cliques nos botões, passos do cadastro e cadastro enviado (generate_lead / Lead).
   Nunca envia nada que a pessoa digitou: só nomes de eventos, página e a campanha (UTM). */
(function () {
  'use strict';
  var GA = 'G-VNTRT32BF0', PIXEL = '820470936707053';
  var pagina = /\/app\/vender/.test(location.pathname) ? 'app_vender' : 'app';
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { var v = q && q.get(k); if (v) utm[k] = v.slice(0, 100); });
  // Guarda a campanha da sessão, para o caso de a pessoa ir de /app para /app/vender.
  try {
    if (utm.utm_campaign) sessionStorage.setItem('t61_utm', JSON.stringify(utm));
    else { var s = sessionStorage.getItem('t61_utm'); if (s) utm = JSON.parse(s) || {}; }
  } catch (e) {}
  window.T61 = {pagina: pagina, utm: utm};

  // Google Analytics 4
  var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA; document.head.appendChild(g);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA, {pagina_61: pagina, campanha_61: utm.utm_campaign || '(sem campanha)', variante_61: utm.utm_content || '(sem variante)'});

  // Pixel da Meta
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL); fbq('track', 'PageView');

  function ev(nome, p) {
    try {
      var params = Object.assign({pagina_61: pagina, campanha_61: utm.utm_campaign || '(sem campanha)', variante_61: utm.utm_content || '(sem variante)'}, p || {});
      gtag('event', nome, params);
    } catch (e) {}
  }
  window.T61.ev = ev;

  // Tempo ativo (só conta com a aba visível)
  var ativo = 0, marcos = [10, 30, 60, 120, 300], prox = 0;
  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    ativo++;
    if (prox < marcos.length && ativo >= marcos[prox]) {
      ev('tempo_ativo_' + marcos[prox], {segundos: marcos[prox]});
      if (marcos[prox] === 30) try { fbq('trackCustom', 'Leu30s', {pagina: pagina}); } catch (e) {}
      prox++;
    }
  }, 1000);

  // Rolagem
  var rol = [25, 50, 75, 90], rolFeito = {};
  function checaRolagem() {
    var h = document.documentElement, alto = Math.max(h.scrollHeight - window.innerHeight, 1), pct = Math.round(100 * (window.scrollY || h.scrollTop) / alto);
    rol.forEach(function (r) { if (pct >= r && !rolFeito[r]) { rolFeito[r] = 1; ev('rolagem_' + r, {percentual: r}); } });
  }
  window.addEventListener('scroll', function () { clearTimeout(checaRolagem.t); checaRolagem.t = setTimeout(checaRolagem, 200); }, {passive: true});

  // Cliques nos botões e links de contato (sem nenhum texto digitado)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var tipo = a.dataset.cta ? 'cta_' + a.dataset.cta : (a.dataset.ev || '');
    if (!tipo && /wa\.me|whatsapp/i.test(href)) tipo = 'whatsapp';
    else if (!tipo && /\/app\/vender/.test(href)) tipo = 'ir_para_vender';
    else if (!tipo && /apps\.apple|play\.google/.test(href)) tipo = 'loja_app';
    if (!tipo) return;
    ev('clique_61', {botao: tipo});
    if (/whatsapp|wa_/.test(tipo)) { ev('contato_whatsapp', {botao: tipo}); try { fbq('track', 'Contact'); } catch (e2) {} }
  }, true);
})();
