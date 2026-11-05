/* 61 — Campanha Procura-se 61 · landings /procura-se/ape e /procura-se/apartamento · publicação 05/11/2026
   Envio: formsubmit.co → pablo@61imoveis.com (mesmo mecanismo de /app/vender), esperando a confirmação antes de mostrar sucesso.
   Nenhum dado digitado vai para URL, console, armazenamento ou analytics. */
'use strict';
const EMAIL_LEADS = 'pablo@61imoveis.com';
const WHATS = '5561998786161';
const ENVIO_TIMEOUT_MS = 15000;
const form = document.getElementById('owner-form');
const VARIANTE = form.dataset.variante || '';
const nameInput = document.getElementById('owner-name');
const phoneInput = document.getElementById('owner-phone');
const result = document.getElementById('form-result');
const errBox = document.getElementById('form-error');
const submitBtn = form.querySelector('button[type="submit"]');
const fields = [...form.children].filter(el => el !== result);
const ev = (n, p) => { try { if (window.T61 && window.T61.ev) window.T61.ev(n, Object.assign({variante_pagina: VARIANTE}, p || {})); if (window.fbq && n === 'generate_lead') fbq('track', 'Lead'); } catch (e) {} };
const UTM = (() => { try { const q = new URLSearchParams(location.search); return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].filter(k => q.get(k)).map(k => k + '=' + q.get(k).slice(0, 100)).join(' · '); } catch (e) { return ''; } })();
let sending = false, started = false;

function clearError(input, errorId) { input.removeAttribute('aria-invalid'); document.getElementById(errorId).textContent = ''; }
nameInput.addEventListener('input', () => clearError(nameInput, 'name-error'));
phoneInput.addEventListener('input', () => clearError(phoneInput, 'phone-error'));
form.addEventListener('input', () => { if (!started) { started = true; ev('form_start'); } if (!sending) errBox.hidden = true; });
document.querySelectorAll('input[name="neighborhood"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('neighborhood-error').textContent = '';
    document.querySelectorAll('input[name="neighborhood"]').forEach(el => el.removeAttribute('aria-invalid'));
  });
});

async function envia(d) {
  const body = Object.assign({_subject: 'Procura-se 61 · novo proprietário: ' + d['Nome'] + ' · ' + d['Bairro do imóvel'] + ' (' + d['Versão da página'] + ')', _template: 'table', _captcha: 'false'}, d);
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ENVIO_TIMEOUT_MS) : null;
  try {
    const res = await fetch('https://formsubmit.co/ajax/' + EMAIL_LEADS, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined});
    if (!res.ok) return false;
    let data = null; try { data = await res.json(); } catch (e) { return false; }
    return !!data && (data.success === true || data.success === 'true');
  } catch (e) { return false; } finally { if (timer) clearTimeout(timer); }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  errBox.hidden = true;
  let firstInvalid = null;
  clearError(nameInput, 'name-error');
  clearError(phoneInput, 'phone-error');
  document.getElementById('neighborhood-error').textContent = '';
  if (nameInput.value.trim().length < 2) {
    document.getElementById('name-error').textContent = 'Preencha um nome com pelo menos 2 letras.';
    nameInput.setAttribute('aria-invalid', 'true'); firstInvalid = nameInput;
  }
  const digits = phoneInput.value.replace(/\D/g, '');
  const validPhone = /^(?:55)?\d{10,11}$/.test(digits) && !/^(\d)\1+$/.test(digits);
  if (!validPhone) {
    document.getElementById('phone-error').textContent = 'Informe um telefone com DDD, como (61) 99999-9999.';
    phoneInput.setAttribute('aria-invalid', 'true'); firstInvalid ||= phoneInput;
  }
  const selected = form.querySelector('input[name="neighborhood"]:checked');
  if (!selected) {
    document.getElementById('neighborhood-error').textContent = 'Escolha Asa Sul ou Asa Norte.';
    form.querySelectorAll('input[name="neighborhood"]').forEach(el => el.setAttribute('aria-invalid', 'true'));
    firstInvalid ||= form.querySelector('input[name="neighborhood"]');
  }
  if (firstInvalid) { ev('form_validation_error'); firstInvalid.focus(); return; }
  const d = {
    'Nome': nameInput.value.trim().slice(0, 100),
    'Telefone / WhatsApp': phoneInput.value.trim().slice(0, 20),
    'Bairro do imóvel': selected.value,
    'Tipo de imóvel': document.getElementById('property-type').value || 'não informado',
    'Versão da página': VARIANTE === 'apartamento' ? 'APARTAMENTO' : 'APÊ',
    'Origem': UTM || document.referrer || 'direto',
    'Página': location.href.split('?')[0].split('#')[0],
    'Data e hora': new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})
  };
  sending = true; submitBtn.setAttribute('aria-busy', 'true'); submitBtn.disabled = true;
  ev('form_submit_attempt');
  const ok = await envia(d);
  sending = false; submitBtn.removeAttribute('aria-busy'); submitBtn.disabled = false;
  if (ok) {
    form.reset();
    fields.forEach(el => el.hidden = true);
    result.hidden = false;
    result.focus({preventScroll: true});
    ev('generate_lead', {bairro_61: selected.value === 'Asa Sul' ? 'asa_sul' : 'asa_norte'});
  } else {
    ev('form_submit_error');
    errBox.innerHTML = '<strong>Não conseguimos enviar agora.</strong> Seus dados continuam na ficha: tente de novo em instantes. Se preferir, <a href="https://wa.me/' + WHATS + '" target="_blank" rel="noopener">fale com a 61 pelo WhatsApp</a> ou ligue (61) 3686-2430.';
    errBox.hidden = false;
  }
});

// O link do anúncio pré-seleciona o bairro (bairro=asa-sul | asa-norte).
const campaignArea = new URLSearchParams(location.search).get('bairro');
if (campaignArea === 'asa-sul' || campaignArea === 'asa-norte') {
  form.querySelector(`input[value="${campaignArea === 'asa-sul' ? 'Asa Sul' : 'Asa Norte'}"]`).checked = true;
}

// Abas da inteligência (teclado e clique), como no original.
const intelligenceTabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  intelligenceTabs.forEach(item => { const s = item === tab; item.setAttribute('aria-selected', String(s)); item.tabIndex = s ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !s; });
}
intelligenceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % intelligenceTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + intelligenceTabs.length) % intelligenceTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = intelligenceTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); activateTab(intelligenceTabs[next]); intelligenceTabs[next].focus();
  });
});
