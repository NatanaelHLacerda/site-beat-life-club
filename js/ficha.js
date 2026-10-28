/* The Beat Life Club · Parcerias · ficha de parceria em modal.
   Envia para o CRM de Parcerias (função pública enviar_ficha): a empresa entra no funil como "Empresa recebida".
   Sem JS, os botões [data-ficha] abrem a ficha do próprio CRM. */
(function () {
  var CRM = window.CRM_PARCERIAS || {
    url: 'https://yhtdvdwfcwcsxdvcvsdj.supabase.co',
    chave: 'sb_publishable_DoScVIyQKxHdSiI7XlA6hA_8EA1tEsf' // chave pública: o banco decide o que ela pode fazer
  };

  var d = document, dialog = d.getElementById('ficha');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var form = d.getElementById('ficha-form'), ok = dialog.querySelector('.ficha-ok');
  var passos = form.querySelectorAll('.ficha-passo'), marcas = form.querySelectorAll('.ficha-etapas li');
  var voltar = form.querySelector('[data-voltar]'), avancar = form.querySelector('[data-avancar]');
  var erroGeral = form.querySelector('.ficha-erro');
  var titulos = ['Sobre a empresa', 'Quem é o responsável', 'Sobre a parceria', 'Envio'];
  var seta = avancar.querySelector('svg').outerHTML;
  var atual = 1, aberta = 0, origem = null, enviando = false;

  var obrigatorios = {
    1: ['cnpj', 'razao_social', 'marca', 'segmento', 'cidade', 'uf', 'tempo_atuacao', 'faixa_funcionarios', 'faixa_faturamento'],
    2: ['contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email'],
    3: ['motivo_parceria', 'objetivo', 'publico']
  };

  /* mesma regra do CRM (src/regras/formato.ts e cnpj_valido no banco) */
  function cnpjValido(v) {
    var n = String(v).replace(/\D/g, '');
    if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
    function dv(base) {
      var pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], soma = 0;
      for (var i = 0; i < base.length; i++) soma += +base[i] * pesos[i];
      var r = soma % 11; return r < 2 ? 0 : 11 - r;
    }
    return dv(n.slice(0, 12)) === +n[12] && dv(n.slice(0, 13)) === +n[13];
  }

  function valor(nome) { var c = form.elements[nome]; return c ? String(c.value || '').trim() : ''; }
  function marcados(nome) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + nome + '"]:checked'), function (i) { return i.value; }); }

  function marcarErro(nome, texto) {
    var campo = form.querySelector('[data-campo="' + nome + '"]'); if (!campo) return;
    var span = d.getElementById('e-' + nome), entrada = form.elements[nome];
    campo.classList.toggle('invalid', !!texto);
    if (span) span.textContent = texto || '';
    if (entrada && entrada.setAttribute) {
      entrada.setAttribute('aria-invalid', texto ? 'true' : 'false');
      if (texto) entrada.setAttribute('aria-describedby', 'e-' + nome); else entrada.removeAttribute('aria-describedby');
    }
  }

  function validar(passo) {
    var erros = {};
    (obrigatorios[passo] || []).forEach(function (n) { if (!valor(n)) erros[n] = 'Preencha este campo.'; });
    if (passo === 1) {
      if (valor('cnpj') && !cnpjValido(valor('cnpj'))) erros.cnpj = 'CNPJ inválido.';
      if (!valor('site') && !valor('instagram')) erros.instagram = 'Informe o site ou o Instagram.';
      if (valor('segmento') === 'outro' && !valor('segmento_outro')) erros.segmento_outro = 'Preencha este campo.';
    }
    if (passo === 2 && valor('contato_email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor('contato_email'))) erros.contato_email = 'E-mail inválido.';
    if (passo === 3 && !marcados('busca').length) erros.busca = 'Escolha pelo menos uma opção.';
    if (passo === 4) {
      if (!form.elements.aceite_nao_proposta.checked) erros.aceite_nao_proposta = 'Marque que o envio não é uma proposta.';
      if (!form.elements.consentimento.checked) erros.consentimento = 'Marque o consentimento de privacidade para enviar.';
    }
    passos[passo - 1].querySelectorAll('[data-campo]').forEach(function (c) { marcarErro(c.getAttribute('data-campo'), erros[c.getAttribute('data-campo')]); });
    var primeiro = Object.keys(erros)[0];
    if (primeiro) {
      var alvo = form.querySelector('[data-campo="' + primeiro + '"] input, [data-campo="' + primeiro + '"] select, [data-campo="' + primeiro + '"] textarea');
      if (alvo) alvo.focus();
      return false;
    }
    return true;
  }

  function irPara(passo) {
    atual = passo;
    passos.forEach(function (p, i) { p.hidden = i !== passo - 1; });
    marcas.forEach(function (m, i) {
      m.classList.toggle('feito', i < passo - 1); m.classList.toggle('atual', i === passo - 1);
      if (i === passo - 1) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
    });
    form.querySelector('[data-atual]').textContent = passo;
    form.querySelector('[data-titulo]').textContent = titulos[passo - 1];
    voltar.hidden = passo === 1;
    avancar.innerHTML = (passo === 4 ? 'Enviar ficha ' : 'Continuar ') + seta;
    erroGeral.hidden = true;
    form.querySelector('.ficha-corpo').scrollTop = 0;
    var primeiro = passos[passo - 1].querySelector('input:not([tabindex="-1"]), select, textarea');
    if (primeiro && aberta) primeiro.focus();
  }

  function dados() {
    var f = {};
    ['cnpj', 'razao_social', 'marca', 'cidade', 'uf', 'segmento', 'segmento_outro', 'site', 'instagram', 'tempo_atuacao', 'faixa_faturamento',
      'faixa_funcionarios', 'unidades', 'contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email', 'quem_decide', 'quem_decide_outro',
      'motivo_parceria', 'objetivo', 'publico', 'parcerias_anteriores', 'inicio_desejado', 'duracao', 'datas_interesse',
      'indicado_por', 'site_empresa_confirmacao'].forEach(function (n) { f[n] = valor(n); });
    f.cnpj = f.cnpj.replace(/\D/g, '');
    f.busca = marcados('busca');
    f.aceite_nao_proposta = form.elements.aceite_nao_proposta.checked;
    f.consentimento = form.elements.consentimento.checked;
    f.segundos = Math.round((Date.now() - aberta) / 1000);
    return f;
  }

  function enviar() {
    if (enviando) return;
    enviando = true; avancar.disabled = true; avancar.textContent = 'Enviando…'; erroGeral.hidden = true;
    fetch(CRM.url + '/rest/v1/rpc/enviar_ficha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CRM.chave },
      body: JSON.stringify({ dados: dados(), arquivos: [] })
    }).then(function (r) {
      if (r.ok) { form.hidden = true; ok.hidden = false; ok.querySelector('[data-fechar]').focus(); return; }
      return r.json().catch(function () { return {}; }).then(function (e) {
        throw new Error(e && e.message && !/permission|function|schema|JWT|apikey/i.test(e.message) ? e.message : 'Não foi possível enviar a ficha agora. Tente de novo em instantes.');
      });
    }).catch(function (e) {
      erroGeral.textContent = e.message && e.message !== 'Failed to fetch' ? e.message : 'Sem conexão com o servidor. Confira a internet e tente de novo.';
      erroGeral.hidden = false;
    }).then(function () {
      enviando = false; avancar.disabled = false; avancar.innerHTML = 'Enviar ficha ' + seta;
    });
  }

  var campoSegmentoOutro = d.getElementById('campo-segmento_outro');
  var campoQuemDecideOutro = d.getElementById('campo-quem_decide_outro');
  function atualizarCondicionais() {
    if (campoSegmentoOutro) {
      var mostrarSeg = valor('segmento') === 'outro';
      campoSegmentoOutro.hidden = !mostrarSeg;
      if (!mostrarSeg) { form.elements.segmento_outro.value = ''; marcarErro('segmento_outro', ''); }
    }
    if (campoQuemDecideOutro) {
      var mostrarQD = valor('quem_decide') === 'outra pessoa';
      campoQuemDecideOutro.hidden = !mostrarQD;
      if (!mostrarQD) { form.elements.quem_decide_outro.value = ''; marcarErro('quem_decide_outro', ''); }
    }
  }
  form.elements.segmento.addEventListener('change', atualizarCondicionais);
  form.elements.quem_decide.addEventListener('change', atualizarCondicionais);

  function abrir(ev) {
    if (ev) ev.preventDefault();
    origem = d.activeElement;
    /* depois de um envio, a próxima abertura começa uma ficha nova */
    if (!ok.hidden) { form.reset(); form.hidden = false; ok.hidden = true; atualizarConta(); irPara(1); }
    atualizarCondicionais();
    aberta = Date.now();
    d.documentElement.classList.add('ficha-aberta');
    dialog.showModal();
    irPara(atual);
  }

  function fechar() { dialog.close(); }

  dialog.addEventListener('close', function () {
    d.documentElement.classList.remove('ficha-aberta');
    if (origem && origem.focus) origem.focus();
  });
  /* clique fora da caixa fecha */
  dialog.addEventListener('click', function (ev) { if (ev.target === dialog) fechar(); });
  dialog.querySelectorAll('[data-fechar]').forEach(function (b) { b.addEventListener('click', fechar); });
  d.querySelectorAll('[data-ficha]').forEach(function (a) { a.addEventListener('click', abrir); });

  voltar.addEventListener('click', function () { if (atual > 1) irPara(atual - 1); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!validar(atual)) return;
    if (atual < 4) irPara(atual + 1); else enviar();
  });
  /* o erro some assim que a pessoa corrige o campo */
  form.addEventListener('input', function (ev) {
    var campo = ev.target.closest('[data-campo]');
    if (campo && campo.classList.contains('invalid')) marcarErro(campo.getAttribute('data-campo'), '');
    if (ev.target.name === 'site' && valor('site')) marcarErro('instagram', '');
  });

  var conta = form.querySelector('[data-conta]');
  function atualizarConta() { if (conta) conta.textContent = valor('motivo_parceria').length; }
  form.elements.motivo_parceria.addEventListener('input', atualizarConta);
})();
