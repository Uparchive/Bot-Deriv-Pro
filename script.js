document.addEventListener('DOMContentLoaded', () => {
  const MIN_DATE_ISO   = '2025-04-20';
  const startInput     = document.getElementById('start-date');
  const endInput       = document.getElementById('end-date');
  const accountFilter  = document.getElementById('account-filter');
  const clearBtn       = document.getElementById('clear-search');
  const noResults      = document.getElementById('no-results');
  const summaryDiv     = document.getElementById('summary');
  const body           = document.body;
  let timer;

  // Abre/fecha seções
  document.querySelectorAll('.video-section-header').forEach(h => {
    h.addEventListener('click', () => {
      const sec = h.closest('.video-section');
      const open = sec.classList.toggle('open');
      h.querySelector('.toggle-btn').setAttribute('aria-expanded', open);
    });
  });

  // Abre/fecha vídeos
  document.querySelectorAll('.video-item-header').forEach(h => {
    h.addEventListener('click', () => {
      const it = h.closest('.video-item');
      const open = it.classList.toggle('open');
      h.querySelector('.item-toggle-btn').setAttribute('aria-expanded', open);
    });
  });

  // Converte ISO ou dd/mm/aaaa → YYYY-MM-DD
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

  // Marca “NOVO” no primeiro vídeo da data mais recente visível
  function markNewBadge() {
    // Remove marcações antigas
    document.querySelectorAll('.video-item.new-badge')
      .forEach(el => el.classList.remove('new-badge'));

    // Coleta seções visíveis
    const visibleSecs = Array.from(
      document.querySelectorAll('.video-section')
    ).filter(sec => sec.style.display !== 'none');
    if (!visibleSecs.length) return;

    // Encontra data máxima
    const maxIso = visibleSecs
      .map(sec => sec.dataset.date)
      .sort()
      .pop();

    // Seleciona a seção dessa data e marca o primeiro item
    const secMax = visibleSecs.find(sec => sec.dataset.date === maxIso);
    if (secMax) {
      const firstItem = secMax.querySelector('.video-item');
      if (firstItem) firstItem.classList.add('new-badge');
    }
  }

  // Filtra seções, calcula resumo e marca “NOVO”
  function applyFilter() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const sIso    = clampIso(parseToIso(startInput.value));
      const eIso    = clampIso(parseToIso(endInput.value));
      const typeVal = accountFilter.value; // '' | 'real' | 'demo'

      // Controla estilo de filtro ativo
      if (sIso || eIso || typeVal) body.classList.add('filter-active');
      else                          body.classList.remove('filter-active');

      let anyVisible = false;
      const banks = [];

      document.querySelectorAll('.video-section').forEach(sec => {
        const iso  = sec.dataset.date;
        const type = sec.dataset.type;
        let visible = true;
        if (sIso && iso < sIso) visible = false;
        if (eIso && iso > eIso) visible = false;
        if (typeVal && type !== typeVal) visible = false;

        sec.style.display = visible ? '' : 'none';
        if (visible) {
          anyVisible = true;
          sec.querySelectorAll('.video-item').forEach(item => {
            const txt = item.querySelector('.video-description').textContent;
            const m = txt.match(
              /banca\s+(?:inicial|iniciou)\s+de\s*\$?([\d.,]+).*(?:finalizamos|terminou)\s+com\s*\$?([\d.,]+)/i
            );
            if (m) {
              banks.push({
                iso,
                start: parseFloat(m[1].replace(',', '.')),
                end:   parseFloat(m[2].replace(',', '.'))
              });
            }
          });
        }
      });

      noResults.hidden = anyVisible;

      // Monta resumo de banca
      if (banks.length) {
        banks.sort((a, b) => a.iso.localeCompare(b.iso));
        const primeira = banks[0].start;
        const ultima   = banks[banks.length - 1].end;
        const lucro    = ultima - primeira;

        const fmtCurr = v => v.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL'
        });
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
          `<strong>Banca inicial:</strong> ${fmtCurr(primeira)}<br>` +
          `<strong>Banca final:</strong> ${fmtCurr(ultima)}<br>` +
          `<strong>Lucro líquido:</strong> ` +
          `<span class="${lucro >= 0 ? 'profit-positive' : 'profit-negative'}">` +
            fmtCurr(lucro) +
          `</span>`;
        summaryDiv.hidden = false;
      } else {
        summaryDiv.hidden = true;
      }

      // Finalmente marca o vídeo “NOVO”
      markNewBadge();
    }, 200);
  }

  // Inicialização padrão (20/04/2025 até hoje, conta real)
  (function initDefaults() {
    startInput.value    = MIN_DATE_ISO;
    endInput.value      = todayLocalIso();
    accountFilter.value = 'real';
    applyFilter();
  })();

  // Listeners
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

  // Back to top
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () =>
    backBtn.classList.toggle('show', window.scrollY > 200)
  );
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
});
