document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('date-input');
  const clearBtn  = document.getElementById('clear-search');
  const noResults = document.getElementById('no-results');
  const body      = document.body;
  let timer;

  // Toggle de abrir/fechar seção
  document.querySelectorAll('.video-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const sec  = header.closest('.video-section');
      const open = sec.classList.toggle('open');
      header.querySelector('.toggle-btn')
            .setAttribute('aria-expanded', open);
    });
  });

  // Toggle de cada vídeo
  document.querySelectorAll('.video-item-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.video-item');
      const open = item.classList.toggle('open');
      header.querySelector('.item-toggle-btn')
            .setAttribute('aria-expanded', open);
    });
  });

  // Função de filtro só por data (ISO ou “dd/mm/aaaa”)
  function filterByDate() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const raw = dateInput.value.trim();
      if (raw) body.classList.add('filter-active');
      else     body.classList.remove('filter-active');

      let found = false;
      document.querySelectorAll('.video-section').forEach(sec => {
        const iso    = sec.dataset.date;             // ex: "2025-04-20"
        let match    = false;

        if (!raw) {
          match = true;
        } else {
          // se veio em ISO (YYYY-MM-DD)
          if (iso === raw) match = true;
          // se veio em dd/mm/aaaa
          else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
            const [d,m,y] = raw.split('/');
            if (`${y}-${m}-${d}` === iso) match = true;
          }
        }

        sec.style.display = match ? '' : 'none';
        if (match) found = true;
      });

      noResults.hidden = found;
    }, 200);
  }

  dateInput.addEventListener('change', filterByDate);
  dateInput.addEventListener('input', filterByDate);
  clearBtn.addEventListener('click', () => {
    dateInput.value = '';
    filterByDate();
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
