document.addEventListener('DOMContentLoaded', () => {
    // Toggle seções (datas)
    document.querySelectorAll('.video-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        const open = section.classList.toggle('open');
        header.querySelector('.toggle-btn')
              .setAttribute('aria-expanded', open);
      });
    });
  
    // Toggle vídeos individuais
    document.querySelectorAll('.video-item-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const open = item.classList.toggle('open');
        header.querySelector('.item-toggle-btn')
              .setAttribute('aria-expanded', open);
      });
    });
  
    // Filtragem (debounce)
    const searchInput = document.getElementById('search-input');
    const dateInput   = document.getElementById('date-input');
    const clearBtn    = document.getElementById('clear-search');
    const noResults   = document.getElementById('no-results');
    let timer;
    function filterVideos() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const txt = searchInput.value.toLowerCase();
        const dt  = dateInput.value;
        let found = false;
        document.querySelectorAll('.video-section').forEach(sec => {
          const title = sec.querySelector('h2').textContent.toLowerCase();
          const dateMatch = !dt || sec.dataset.date === dt;
          const textMatch = !txt ||
            title.includes(txt) ||
            Array.from(sec.querySelectorAll('.video-item'))
                 .some(i => i.dataset.title.toLowerCase().includes(txt));
          sec.style.display = (dateMatch && textMatch) ? '' : 'none';
          if (dateMatch && textMatch) found = true;
        });
        noResults.hidden = found;
      }, 300);
    }
    searchInput.addEventListener('input', filterVideos);
    dateInput.addEventListener('change', filterVideos);
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      dateInput.value   = '';
      filterVideos();
    });
  
    // Voltar ao topo
    const backBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('show', window.scrollY > 200);
    });
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  