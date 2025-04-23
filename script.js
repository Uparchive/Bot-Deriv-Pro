// script.js

document.addEventListener('DOMContentLoaded', () => {
  // === CONFIGURAÇÃO DE VISIBILIDADE E CONTAGEM REGRESSIVA DO BOTÃO ===
  const buyBtn   = document.getElementById('buy-bot');
  const startAt  = new Date('2025-04-21T01:00:00').getTime();
  const endAt    = new Date('2025-04-21T01:00:00').getTime();
  let countdownInterval;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateBuyBtn() {
    const now = Date.now();
    if (now < startAt || now > endAt) {
      buyBtn.style.display = 'none';
      clearInterval(countdownInterval);
      return;
    }
    buyBtn.style.display = '';
    const remaining = endAt - now;
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    buyBtn.textContent = `Comprar Bot Deriv Pro V17 (${pad(h)}:${pad(m)}:${pad(s)})`;
  }

  updateBuyBtn();
  countdownInterval = setInterval(updateBuyBtn, 1000);

  window.comprarBot = () => window.open('', '_blank');

  // === FILTRAGEM DE VÍDEOS ===
  const MIN_DATE = '2025-04-20';
  const startInput    = document.getElementById('start-date');
  const endInput      = document.getElementById('end-date');
  const accountFilter = document.getElementById('account-filter');
  const clearBtn      = document.getElementById('clear-search');
  const noResults     = document.getElementById('no-results');
  const summary       = document.getElementById('summary');
  const sections      = Array.from(document.querySelectorAll('.video-section'));

  function clampDate(value) {
    return value && value < MIN_DATE ? MIN_DATE : value || null;
  }

  function formatUSD(number) {
    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  function markNewBadges() {
    document.querySelectorAll('.video-item.new-badge')
      .forEach(el => el.classList.remove('new-badge'));

    const visibleItems = Array.from(document.querySelectorAll('.video-item'))
      .filter(li => li.style.display !== 'none');
    if (!visibleItems.length) return;

    const latestDate = visibleItems
      .map(li => li.dataset.date)
      .sort()
      .pop();

    visibleItems
      .filter(li => li.dataset.date === latestDate)
      .forEach(li => li.classList.add('new-badge'));
  }

  function filterVideos() {
    const start  = clampDate(startInput.value);
    const end    = clampDate(endInput.value);
    const acc    = accountFilter.value;
    let anyVisible = false;
    const banks = [];

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
          const match = txt.match(
            /inicial\s+de\s+\$([\d\.]+).*finalizamos\s+com\s+\$([\d\.]+)/i
          );
          if (match) {
            banks.push({
              date:  li.dataset.date,
              start: parseFloat(match[1]),
              end:   parseFloat(match[2])
            });
          }
        }
      });

      sec.style.display = sectionHas ? '' : 'none';
    });

    noResults.hidden = anyVisible;

    if (banks.length) {
      const dates   = banks.map(b => b.date);
      const minDate = dates.reduce((a, b) => a < b ? a : b);
      const maxDate = dates.reduce((a, b) => a > b ? a : b);

      const ini = Math.min(
        ...banks.filter(b => b.date === minDate).map(b => b.start)
      );
      const lucro = banks.reduce((sum, b) => sum + (b.end - b.start), 0);
      const fim   = ini + lucro;

      let wins = 0, losses = 0;
      banks.forEach(b => {
        const delta = b.end - b.start;
        if (delta > 0) wins++;
        else if (delta < 0) losses++;
      });

      const fmtDate = iso => {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
      };

      summary.innerHTML = `
        <strong>Período:</strong> ${fmtDate(minDate)} até ${fmtDate(maxDate)}<br>
        <hr>
        <strong>Banca inicial:</strong> ${formatUSD(ini)}<br>
        <strong>Banca final:</strong> ${formatUSD(fim)}<br>
        <hr>
        <span class="win-badge">Win: ${wins}</span>
        <span class="loss-badge">Loss: ${losses}</span><br>
        <strong>Lucro líquido:</strong>
          <span class="${lucro >= 0 ? 'profit-positive' : 'profit-negative'}">
            ${formatUSD(lucro)}
          </span>
      `;
      summary.hidden = false;
    } else {
      summary.hidden = true;
    }

    markNewBadges();
  }

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

  filterVideos();

  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () =>
    backBtn.classList.toggle('show', window.scrollY > 200)
  );
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
});
