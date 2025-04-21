document.addEventListener('DOMContentLoaded', () => {
  const MIN_DATE = '2025-04-20';
  const startInput    = document.getElementById('start-date');
  const endInput      = document.getElementById('end-date');
  const accountFilter = document.getElementById('account-filter');
  const clearBtn      = document.getElementById('clear-search');
  const noResults     = document.getElementById('no-results');
  const summary       = document.getElementById('summary');
  const sections      = Array.from(document.querySelectorAll('.video-section'));

  // Garante data mínima
  function clampDate(v) {
    return v && v < MIN_DATE ? MIN_DATE : v || null;
  }

  // Formata valor em USD
  function formatUSD(v) {
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  // Marca badge “NOVO” no(s) item(s) da data mais recente
  function markNewBadges() {
    document.querySelectorAll('.video-item.new-badge')
      .forEach(el => el.classList.remove('new-badge'));

    const items = Array.from(document.querySelectorAll('.video-item'))
      .filter(li => li.style.display !== 'none');
    if (!items.length) return;

    const maxDate = items.map(li => li.dataset.date).sort().pop();
    items.filter(li => li.dataset.date === maxDate)
         .forEach(li => li.classList.add('new-badge'));
  }

  function filterVideos() {
    const start  = clampDate(startInput.value);
    const end    = clampDate(endInput.value);
    const acc    = accountFilter.value; // '' | 'real' | 'demo'
    let anyVisible = false;
    const banks = [];

    // Filtra e coleta todos os bancos
    sections.forEach(sec => {
      const type = sec.dataset.type;
      let sectionHas = false;

      sec.querySelectorAll('.video-item').forEach(li => {
        const date = li.dataset.date;
        let show = true;
        if (acc && type !== acc) show = false;
        if (start && date < start) show = false;
        if (end && date > end)     show = false;

        li.style.display = show ? '' : 'none';
        if (show) {
          anyVisible = true;
          sectionHas = true;
          const txt = li.querySelector('.video-description').textContent;
          const m = txt.match(
            /inicial\s+de\s+\$([\d\.]+).*finalizamos\s+com\s+\$([\d\.]+)/i
          );
          if (m) banks.push({
            date:  date,
            start: parseFloat(m[1]),
            end:   parseFloat(m[2])
          });
        }
      });

      sec.style.display = sectionHas ? '' : 'none';
    });

    noResults.hidden = anyVisible;

    if (banks.length) {
      // datas do período
      const dates   = banks.map(b => b.date);
      const minDate = dates.reduce((a,b) => a < b ? a : b);
      const maxDate = dates.reduce((a,b) => a > b ? a : b);

      // menor start do dia mais antigo
      const ini = Math.min(...banks
        .filter(b => b.date === minDate)
        .map(b => b.start));

      // soma de todos os (end - start)
      const lucro = banks.reduce((sum,b) => sum + (b.end - b.start), 0);

      // saldo final = inicial + lucro
      const fim = ini + lucro;

      // conta wins e losses
      let wins = 0, losses = 0;
      banks.forEach(b => {
        const delta = b.end - b.start;
        if (delta > 0) wins++;
        else if (delta < 0) losses++;
      });

      // formata data
      const fmtDate = iso => {
        const [y,m,d] = iso.split('-');
        return `${d}/${m}/${y}`;
      };

      // monta painel
      summary.innerHTML = `
        <strong>Período:</strong> ${fmtDate(minDate)} até ${fmtDate(maxDate)}<br>
        <hr>
        <strong>Banca inicial:</strong> ${formatUSD(ini)}<br>
        <strong>Banca final:</strong> ${formatUSD(fim)}<br>
        <hr>
        <span class="win-badge">Win: ${wins}</span>
        <span class="loss-badge">Loss: ${losses}</span><br>
        <strong>Lucro líquido:</strong>
          <span class="${lucro>=0?'profit-positive':'profit-negative'}">
            ${formatUSD(lucro)}
          </span>
      `;
      summary.hidden = false;
    } else {
      summary.hidden = true;
    }

    markNewBadges();
  }

  // Listeners
  [startInput, endInput].forEach(el =>
    el.addEventListener('change', filterVideos)
  );
  accountFilter.addEventListener('change', filterVideos);
  clearBtn.addEventListener('click', () => {
    startInput.value    = '';
    endInput.value      = '';
    accountFilter.value = '';
    filterVideos();
  });

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

  // Roda filtro inicial e configura back-to-top
  filterVideos();
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () =>
    backBtn.classList.toggle('show', window.scrollY > 200)
  );
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
});
