document.addEventListener('DOMContentLoaded', () => {
  const MIN_DATE_ISO = '2025-04-20';

  const startInput    = document.getElementById('start-date');
  const endInput      = document.getElementById('end-date');
  const accountFilter = document.getElementById('account-filter');
  const clearBtn      = document.getElementById('clear-search');
  const noResults     = document.getElementById('no-results');
  const summaryDiv    = document.getElementById('summary');
  const body          = document.body;
  let timer;

  // formatações de moeda
  const fmtUsd = v =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // conversão de datas
  function parseToIso(raw) {
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split('/');
      return `${y}-${m}-${d}`;
    }
    return null;
  }
  function clampIso(iso) {
    if (!iso) return null;
    return iso < MIN_DATE_ISO ? MIN_DATE_ISO : iso;
  }
  function todayLocalIso() {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = String(now.getMonth() + 1).padStart(2, '0');
    const d   = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // marca o badge "NOVO" no primeiro item da data mais recente visível
  function markNewBadge() {
    document.querySelectorAll('.video-item.new-badge')
      .forEach(el => el.classList.remove('new-badge'));
    const secs = Array.from(document.querySelectorAll('.video-section'))
      .filter(sec => sec.style.display !== 'none');
    if (!secs.length) return;
    const maxIso = secs.map(s => s.dataset.date).sort().pop();
    const secMax = secs.find(s => s.dataset.date === maxIso);
    if (!secMax) return;
    const first = secMax.querySelector('.video-item');
    if (first) first.classList.add('new-badge');
  }

  // abre/fecha seções
  document.querySelectorAll('.video-section-header').forEach(h => {
    h.addEventListener('click', () => {
      const sec = h.closest('.video-section');
      const open = sec.classList.toggle('open');
      h.querySelector('.toggle-btn').setAttribute('aria-expanded', open);
    });
  });
  // abre/fecha vídeos
  document.querySelectorAll('.video-item-header').forEach(h => {
    h.addEventListener('click', () => {
      const it = h.closest('.video-item');
      const open = it.classList.toggle('open');
      h.querySelector('.item-toggle-btn').setAttribute('aria-expanded', open);
    });
  });

  // função principal de filtragem, resumo e badge
  function applyFilter() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const sIso = clampIso(parseToIso(startInput.value));
      const eIso = clampIso(parseToIso(endInput.value));
      const tp   = accountFilter.value; // '' | 'real' | 'demo'

      if (sIso || eIso || tp) body.classList.add('filter-active');
      else                    body.classList.remove('filter-active');

      let anyVisible = false;
      const banks = [];

      document.querySelectorAll('.video-section').forEach(sec => {
        const iso  = sec.dataset.date;
        const type = sec.dataset.type;
        let vis = true;
        if (sIso && iso < sIso) vis = false;
        if (eIso && iso > eIso) vis = false;
        if (tp   && type !== tp) vis = false;
        sec.style.display = vis ? '' : 'none';
        if (vis) {
          anyVisible = true;
          sec.querySelectorAll('.video-item').forEach(it => {
            const txt = it.querySelector('.video-description').textContent;
            const m   = txt.match(
              /banca\s+(?:inicial|iniciou)\s+de\s*\$?([\d.,]+).*(?:finalizamos|terminou)\s+com\s*\$?([\d.,]+)/i
            );
            if (m) banks.push({
              iso,
              start: parseFloat(m[1].replace(',', '.')),
              end:   parseFloat(m[2].replace(',', '.'))
            });
          });
        }
      });

      noResults.hidden = anyVisible;

      if (banks.length) {
        banks.sort((a, b) => a.iso.localeCompare(b.iso));
        const ini   = banks[0].start;
        const fim   = banks[banks.length - 1].end;
        const lucro = fim - ini;

        const fmtDate = iso => {
          const [y, m, d] = iso.split('-');
          return `${d}/${m}/${y}`;
        };
        const periodo = [
          sIso ? fmtDate(sIso) : fmtDate(banks[0].iso),
          eIso ? fmtDate(eIso) : fmtDate(banks[banks.length - 1].iso)
        ].join(' até ');

        summaryDiv.innerHTML =
          `<strong>Período:</strong> ${periodo}<br>` +

          `<strong>Banca inicial (USD):</strong> ${fmtUsd(ini)} ` +
          `<a class="info-icon" target="_blank" ` +
            `href="https://www.xe.com/currencyconverter/convert/?Amount=${ini}&From=USD&To=BRL" ` +
            `title="Converter USD → BRL no XE.com">?</a><br>` +

          `<strong>Banca final (USD):</strong> ${fmtUsd(fim)} ` +
          `<a class="info-icon" target="_blank" ` +
            `href="https://www.xe.com/currencyconverter/convert/?Amount=${fim}&From=USD&To=BRL" ` +
            `title="Converter USD → BRL no XE.com">?</a><br>` +

          `<strong>Lucro líquido (USD):</strong> ` +
            `<span class="${lucro >= 0 ? 'profit-positive' : 'profit-negative'}">` +
              fmtUsd(lucro) +
            `</span> ` +
          `<a class="info-icon" target="_blank" ` +
            `href="https://www.xe.com/currencyconverter/convert/?Amount=${lucro}&From=USD&To=BRL" ` +
            `title="Converter USD → BRL no XE.com">?</a>`;
        summaryDiv.hidden = false;
      } else {
        summaryDiv.hidden = true;
      }

      markNewBadge();
    }, 200);
  }

  // init padrão
  (function initDefaults() {
    startInput.value    = MIN_DATE_ISO;
    endInput.value      = todayLocalIso();
    accountFilter.value = 'real';
    applyFilter();
  })();

  // listeners
  [startInput, endInput].forEach(el => {
    el.addEventListener('change', applyFilter);
    el.addEventListener('input', applyFilter);
  });
  accountFilter.addEventListener('change', applyFilter);
  clearBtn.addEventListener('click', () => {
    startInput.value    = '';
    endInput.value      = '';
    accountFilter.value = '';
    applyFilter();
  });

  // back to top
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () =>
    backBtn.classList.toggle('show', window.scrollY > 200)
  );
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
});
