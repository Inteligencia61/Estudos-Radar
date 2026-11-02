/* 61 — Venda com a 61 (app) · /app/vender
   Validação: a mesma da página de captação da campanha (deixe-meu-imovel/fontes/app.js).
   Envio: o mesmo mecanismo da página /venda (formsubmit.co → 61@61imoveis.com), aqui aguardando a resposta.
   Dados do Pulso 61: copiados de /venda (edição de 29/10/2026), sem alteração.
   Nenhum dado pessoal vai para URL, console, armazenamento ou analytics. */
'use strict';

// Só a cópia de revisão (artifact) troca para true: lá o navegador bloqueia o envio externo.
const PREVIA_ARTIFACT = false;

const WHATS = '5561998786161';
const EMAIL_LEADS = '61@61imoveis.com';
const SITE = 'https://estudos.inteligencia61imoveis.com.br/';
const PULSO = SITE;
const ENVIO_TIMEOUT_MS = 15000;
const UTM = (() => { try { const q = new URLSearchParams(location.search); return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].filter(k => q.get(k)).map(k => k + '=' + q.get(k)).join(' · '); } catch (e) { return ''; } })();
const DE = (() => { try { return (new URLSearchParams(location.search).get('de') || '').replace(/[^\w\-]/g, '').slice(0, 60); } catch (e) { return ''; } })();
const ORIGEM_INTERNA = 'app-vender' + (DE ? ' · ' + DE : '');

// Pulso 61 · edição de 29/10/2026 — mesmos números de /venda.
const P = [{"id": "asa-sul", "nome": "Asa Sul", "tipo": "apartamentos", "recorte": "Endereços SQS · 2+ quartos · R$ 1 a 5 mi", "n": 238, "m2": 14433.155080213903, "valor": 1890000.0, "area": 133.0, "meses": 4.135416271392252, "giro": 0.2418136251283198}, {"id": "asa-norte", "nome": "Asa Norte", "tipo": "apartamentos", "recorte": "Endereços SQN · 2+ quartos · R$ 1 a 5 mi", "n": 292, "m2": 13761.904761904761, "valor": 1750000.0, "area": 125, "meses": 4.25494685486632, "giro": 0.23502056173893562}, {"id": "sudoeste", "nome": "Sudoeste", "tipo": "apartamentos", "recorte": "Endereços SQSW · 2+ quartos · R$ 1 a 5 mi", "n": 172, "m2": 15478.547854785478, "valor": 2220000.0, "area": 128, "meses": 4.083198333003561, "giro": 0.24490605609755176}, {"id": "noroeste", "nome": "Noroeste", "tipo": "apartamentos", "recorte": "Endereços SQNW · 2+ quartos · R$ 1 a 5 mi", "n": 349, "m2": 17003.923647932133, "valor": 2499000, "area": 155.0, "meses": 7.39459668909115, "giro": 0.1352338798240675}, {"id": "lago-sul", "nome": "Lago Sul", "tipo": "casas", "recorte": "Endereços SHIS (QI e QL) · casas · todos os preços", "n": 555, "m2": 10261.017628205129, "valor": 6000000, "area": 699.5, "meses": 8.885796221322538, "giro": 0.11253915519696249}, {"id": "lago-norte", "nome": "Lago Norte", "tipo": "casas", "recorte": "Endereços SHIN (QI e QL) · casas · todos os preços", "n": 316, "m2": 6629.166666666666, "valor": 3500000.0, "area": 539.0, "meses": null, "giro": null}, {"id": "aguas-claras", "nome": "Águas Claras", "tipo": "apartamentos", "recorte": "Sul e Norte · 2+ quartos · a partir de R$ 900 mil", "n": 796, "m2": 9585.055096418733, "valor": 1350000.0, "area": 149.0, "meses": 5.658108339029392, "giro": 0.17673751368492582}];
const PREP = {'Asa Sul': 'na', 'Asa Norte': 'na', 'Sudoeste': 'no', 'Noroeste': 'no', 'Lago Sul': 'no', 'Lago Norte': 'no', 'Águas Claras': 'em'};
const PDE = {'Asa Sul': 'da', 'Asa Norte': 'da', 'Sudoeste': 'do', 'Noroeste': 'do', 'Lago Sul': 'do', 'Lago Norte': 'do', 'Águas Claras': 'de'};

const nf = (x, d = 0) => Number(x).toLocaleString('pt-BR', {minimumFractionDigits: d, maximumFractionDigits: d});
// Mesmos eventos de /venda; só disparam se gtag/fbq existirem na página. Nunca com valores digitados.
const ev = (n, p) => { try { if (window.gtag) gtag('event', n, p || {}); if (window.fbq && n === 'generate_lead') fbq('track', 'Lead'); } catch (e) {} };
document.querySelectorAll('[data-ev]').forEach(a => a.addEventListener('click', () => ev(a.dataset.ev)));

// WhatsApp: só link, mensagem genérica, sem dados do formulário.
const waBase = t => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`;
const WA_URL = waBase('Olá, 61! Quero vender o meu imóvel e gostaria de uma avaliação.');
['waDuv'].forEach(id => { const a = document.getElementById(id); if (a) a.href = WA_URL; });

/* ——— Seu bairro (números do Pulso) ——— */
const chips = document.getElementById('chips');
const painel = document.getElementById('painel');
let bSel = P[0].nome;
const un = b => b.tipo === 'casas' ? 'casas' : 'imóveis';
function mostra(id, manual) {
  const b = P.find(x => x.id === id); if (!b) return;
  bSel = b.nome;
  chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.id === id)));
  painel.innerHTML = `<div><small>R$/m² mediano pedido</small><b>R$ ${nf(b.m2)}</b><span>${b.tipo} à venda</span></div><div><small>À venda agora</small><b>${nf(b.n)}</b><span>${un(b)} no recorte do Pulso</span></div><div><small>Preço mediano pedido</small><b>R$ ${nf(b.valor / 1e6, 2)} mi</b><span>${nf(b.area)} m² de área mediana</span></div><div><small>Tempo de estoque</small><b>${b.meses ? nf(b.meses, 1) + ' meses' : 'em formação'}</b><span>${b.meses ? 'estoque médio ÷ saídas por mês' : 'leitura iniciada em outubro'}</span></div>`;
  document.getElementById('recorte').textContent = `Recorte ${PDE[b.nome]} ${b.nome}: ${b.recorte}.`;
  document.getElementById('ctaBairro').textContent = `Avaliar meu imóvel ${PREP[b.nome] || 'em'} ${b.nome}`;
  const pp = document.getElementById('pPulso'); pp.href = PULSO + '#' + b.id; pp.textContent = `Ver o mercado ${PDE[b.nome]} ${b.nome} no Pulso →`;
  if (manual) ev('ver_bairro', {bairro: b.nome});
}
chips.innerHTML = P.map(b => `<button type="button" data-id="${b.id}" aria-pressed="false">${b.nome}</button>`).join('');
chips.querySelectorAll('button').forEach(x => x.addEventListener('click', () => { aplica(x.dataset.id, true); ev('trocar_bairro', {bairro: x.dataset.id}); }));

/* ——— Formulário: campos e validação da captação; envio real como em /venda ——— */
const form = document.getElementById('property-form');
const result = document.getElementById('form-result');
const submit = form.querySelector('[type="submit"]');
const submitLabel = submit.innerHTML;
submit.disabled = false;
let attempted = false;
let sending = false;

document.getElementById('ctaBairro').addEventListener('click', () => prefillRegion(bSel, true));
function prefillRegion(nome, force) {
  const region = form.elements.namedItem('region');
  if (nome && (force || !region.value.trim())) region.value = nome;
}

function errorFor(name, message) {
  document.getElementById(`${name}-error`).textContent = message;
  const fields = name === 'intent' ? form.querySelectorAll('[name="intent"]') : [form.elements.namedItem(name)];
  fields.forEach(field => {
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (name === 'intent') field.setAttribute('aria-describedby', 'intent-error');
  });
}

function validate() {
  const value = name => form.elements.namedItem(name).value.trim();
  const contact = value('contact');
  const digits = contact.replace(/\D/g, '');
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const phoneValid = /^[+\d\s().-]+$/.test(contact) && (digits.length === 10 || digits.length === 11 || ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')));
  const errors = {
    intent: value('intent') ? '' : 'Selecione vender, alugar ou ainda decidir.',
    name: value('name').length >= 2 ? '' : 'Informe um nome com pelo menos 2 caracteres.',
    contact: emailValid || phoneValid ? '' : 'Informe um e-mail válido ou telefone com DDD.',
    kind: value('kind') ? '' : 'Escolha o tipo de imóvel.',
    region: value('region').length >= 2 ? '' : 'Informe o bairro ou a região (pelo menos 2 caracteres).'
  };
  Object.entries(errors).forEach(([name, message]) => errorFor(name, message));
  return Object.keys(errors).filter(name => errors[name]);
}

const INTENT_LABEL = {vender: 'Vender', alugar: 'Alugar', conversar: 'Ainda decidir'};

function setSending(on) {
  sending = on;
  submit.disabled = on;
  submit.setAttribute('aria-busy', String(on));
  submit.innerHTML = on ? 'Enviando… <span aria-hidden="true">→</span>' : submitLabel;
}

function showResult(kind, html) {
  result.className = 'result' + (kind === 'error' ? ' is-error' : kind === 'preview' ? ' is-preview' : '');
  result.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  result.innerHTML = html;
  result.hidden = false;
  result.focus();
}

async function envia() {
  const v = name => form.elements.namedItem(name).value.trim();
  const d = {
    'Intenção': INTENT_LABEL[v('intent')] || v('intent'),
    'Nome': v('name'),
    'Contato': v('contact'),
    'Tipo': v('kind'),
    'Bairro': v('region'),
    'Origem': UTM || document.referrer || 'direto',
    'Origem interna': ORIGEM_INTERNA,
    'Página': location.href.split('?')[0].split('#')[0],
    'Data e hora': new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})
  };
  const body = Object.assign({_subject: 'Novo proprietário pela página da 61 (app): ' + d['Nome'] + ' · ' + d['Bairro'], _template: 'table', _captcha: 'false'}, d);
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ENVIO_TIMEOUT_MS) : null;
  try {
    const res = await fetch('https://formsubmit.co/ajax/' + EMAIL_LEADS, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    });
    if (!res.ok) return false;
    let data = null;
    try { data = await res.json(); } catch (e) { return false; }
    return !!data && (data.success === true || data.success === 'true');
  } catch (e) {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return; // sem envio duplicado
  attempted = true;
  result.hidden = true;
  const errors = validate();
  if (errors.length) {
    const first = errors[0] === 'intent' ? form.querySelector('[name="intent"]') : form.elements.namedItem(errors[0]);
    first.focus();
    return;
  }
  if (PREVIA_ARTIFACT) {
    showResult('preview', '<strong>Prévia de revisão.</strong>Nesta cópia o envio fica desligado (a prévia não acessa a internet). No site publicado, este botão envia o contato para a equipe da 61. Seus dados continuam no formulário.');
    return;
  }
  setSending(true);
  const ok = await envia();
  setSending(false);
  if (ok) {
    form.reset();
    attempted = false;
    form.querySelectorAll('[aria-invalid]').forEach(f => f.setAttribute('aria-invalid', 'false'));
    showResult('success', '<strong>Recebemos o seu contato.</strong>Obrigado! Um especialista da 61 vai falar com você para combinar os próximos passos e a avaliação gratuita.');
    ev('generate_lead', {origem_interna: ORIGEM_INTERNA});
  } else {
    showResult('error', `<strong>Não conseguimos enviar agora.</strong>Seus dados continuam no formulário: tente de novo em instantes. Se preferir, <a href="${WA_URL}" target="_blank" rel="noopener">fale com a 61 pelo WhatsApp</a> ou ligue (61) 3686-2430.`);
  }
});

form.addEventListener('input', () => {
  if (attempted) validate();
  if (!result.hidden && !sending) result.hidden = true;
});
form.addEventListener('change', () => {
  if (attempted) validate();
});

/* ——— Personalização por bairro (?bairro=slug), como em /venda ——— */
function aplica(slug, manual) {
  const b = P.find(x => x.id === slug) || null;
  document.getElementById('sub').textContent = b ? `Vai vender ${PREP[b.nome]} ${b.nome}? Da avaliação à escritura, a 61 cuida de cada detalhe com você.` : 'Vai vender? Da avaliação à escritura, a 61 cuida de cada detalhe com você.';
  document.getElementById('eyeb').textContent = b ? `Venda com a 61 · ${b.nome}` : 'Venda com a 61 · para quem vai vender';
  document.title = b ? `Vender imóvel ${PREP[b.nome]} ${b.nome} · Cuidamos do seu imóvel com carinho · 61 Imóveis` : 'Vender imóvel em Brasília · Cuidamos do seu imóvel com carinho · 61 Imóveis';
  document.querySelectorAll('[data-noseu]').forEach(s => {
    if (!s.dataset.noseu) s.dataset.noseu = /^do /.test(s.textContent) ? 'do' : 'no';
    s.textContent = b ? (s.dataset.noseu === 'do' ? `${PDE[b.nome]} ${b.nome}` : `${PREP[b.nome]} ${b.nome}`) : (s.dataset.noseu === 'do' ? 'do seu bairro' : 'no seu bairro');
  });
  const hl = document.getElementById('hlinks'); hl.hidden = !b;
  if (b) {
    const hp = document.getElementById('hPulso'); hp.href = PULSO + '#' + b.id; hp.textContent = `Ver o mercado ${PDE[b.nome]} ${b.nome} no Pulso →`;
    const hb = document.getElementById('hBairros'); hb.href = SITE + 'bairros/' + b.id; hb.textContent = `Como é morar ${PREP[b.nome]} ${b.nome} →`;
    document.getElementById('lkBairros').href = SITE + 'bairros/' + b.id;
    if (!manual) prefillRegion(b.nome, false); // só via ?bairro= na URL (ou pelo botão Avaliar meu imóvel)
  }
  mostra(b ? b.id : (P.find(x => x.nome === bSel) || P[0]).id, manual);
  if (manual) { try { const q = new URLSearchParams(location.search); b ? q.set('bairro', b.id) : q.delete('bairro'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); } catch (e) {} }
}
aplica((() => { try { return new URLSearchParams(location.search).get('bairro') || ''; } catch (e) { return ''; } })());
