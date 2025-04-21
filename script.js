document.addEventListener('DOMContentLoaded', () => {
  const MIN_DATE = '2025-04-20';
  const startInput    = document.getElementById('start-date');
  const endInput      = document.getElementById('end-date');
  const accountFilter = document.getElementById('account-filter');
  const clearBtn      = document.getElementById('clear-search');
  const noResults     = document.getElementById('no-results');
  const summary       = document.getElementById('summary');
  const sections      = Array.from(document.querySelectorAll('.video-section'));

  // limita data mínima
  function clampDate(v) {
    if (!v) return null;
    return v < MIN_DATE ? MIN_DATE : v;
  }

  // formata USD
  function formatUSD(v) {
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  // marca badge “NOVO” no vídeo com data mais alta
  function markNewBadges() {
    // limpa existentes
    document
      .querySelectorAll('.video-item.new-badge')
      .forEach(el => el.classList.remove('new-badge'));

    // coleta todos os itens visíveis
    const items = Array.from(document.querySelectorAll('.video-item'))
      .filter(li => li.style.display !== 'none');

    if (!items.length) return;

    // determina data máxima
    const maxDate = items
      .map(li => li.dataset.date)
      .sort()
      .pop();

    // aplica classe no(s) item(ns) com essa data
    items
      .filter(li => li.dataset.date === maxDate)
      .forEach(li => li.classList.add('new-badge'));
  }

  function filterVideos() {
    const start = clampDate(startInput.value);
    const end   = clampDate(endInput.value);
    const acc   = accountFilter.value; // '' | 'real' | 'demo'

    let anyVisible = false;
    let banks = [];

    sections.forEach(sec => {
      const secType = sec.dataset.type;
      const items = Array.from(sec.querySelectorAll('.video-item'));
      let sectionVisible = false;

      items.forEach(li => {
        const date = li.dataset.date;
        let show = true;
        if (acc && secType !== acc) show = false;
        if (start && date < start)   show = false;
        if (end && date > end)       show = false;
        li.style.display = show ? '' : 'none';
        if (show) {
          anyVisible = true;
          sectionVisible = true;
          // extrai banca para resumo
          const txt = li.querySelector('.video-description').textContent;
          const m = txt.match(/inicial\s+de\s+\$([\d\.]+).*finalizamos\s+com\s+\$([\d\.]+)/i);
          if (m) banks.push({
            date: date,
            start: parseFloat(m[1]),
            end:   parseFloat(m[2])
          });
        }
      });

      // exibe/oculta seção inteira
      sec.style.display = sectionVisible ? '' : 'none';
    });

    noResults.hidden = anyVisible;

    // resumo de banca
    if (banks.length) {
      banks.sort((a,b) => a.date.localeCompare(b.date));
      const ini   = banks[0].start;
      const fim   = banks[banks.length - 1].end;
      const lucro = fim - ini;
      const fmtDate = iso => {
        const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`;
      };
      const pStart = start || banks[0].date;
      const pEnd   = end   || banks[banks.length - 1].date;

      summary.innerHTML = `
        <strong>Período:</strong> ${fmtDate(pStart)} até ${fmtDate(pEnd)}<br>
        <strong>Banca inicial:</strong> ${formatUSD(ini)}<br>
        <strong>Banca final:</strong> ${formatUSD(fim)}<br>
        <strong>Lucro líquido:</strong>
          <span class="${lucro>=0?'profit-positive':'profit-negative'}">
            ${formatUSD(lucro)}
          </span>`;
      summary.hidden = false;
    } else {
      summary.hidden = true;
    }

    // aplicar badge
    markNewBadges();
  }

  // listeners
  [startInput, endInput].forEach(el =>
    el.addEventListener('change', filterVideos)
  );
  accountFilter.addEventListener('change', filterVideos);
  clearBtn.addEventListener('click', () => {
    startInput.value = '';
    endInput.value   = '';
    accountFilter.value = '';
    filterVideos();
  });

  // toggle seções e itens
  document.querySelectorAll('.video-section-header').forEach(h =>
    h.addEventListener('click', () => {
      const sec = h.closest('.video-section');
      const open = sec.classList.toggle('open');
      h.querySelector('.toggle-btn').setAttribute('aria-expanded', open);
    })
  );
  document.querySelectorAll('.video-item-header').forEach(h =>
    h.addEventListener('click', () => {
      const it = h.closest('.video-item');
      const open = it.classList.toggle('open');
      h.querySelector('.item-toggle-btn').setAttribute('aria-expanded', open);
    })
  );

  // inicia filtro
  filterVideos();

  // back-to-top
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () =>
    backBtn.classList.toggle('show', window.scrollY > 200)
  );
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top:0, behavior:'smooth' })
  );
});
