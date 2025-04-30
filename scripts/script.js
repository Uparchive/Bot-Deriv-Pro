// script.js

// === GERAR CARDS DE POSTS AUTOMATICAMENTE ===
function loadNewsCards() {
  // Lista manual dos posts (pode ser automatizada via backend futuramente)
  const posts = [
    {
      file: 'posts/post1.html',
      title: 'Bem-vindo ao Bot Deriv Pro: O que é e para que serve?',
      desc: 'Descubra o propósito do site, como acompanhar resultados, novidades e tudo sobre o Bot Deriv Pro.',
      date: '29/04/2025',
      img: 'img/botposter.png'
    }
    // Adicione novos posts aqui seguindo o mesmo padrão
  ];

  // Ordena por data (opcional, se quiser garantir ordem)
  posts.sort((a, b) => b.date.split('/').reverse().join('-').localeCompare(a.date.split('/').reverse().join('-')));

  const list = document.getElementById('news-cards-list');
  list.innerHTML = '';
  posts.slice(0, 5).forEach(post => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <img src="${post.img}" alt="${post.title}" class="news-card-img"/>
      <div class="news-card-content">
        <h3 class="news-card-title">${post.title}</h3>
        <p class="news-card-desc">${post.desc}</p>
        <span class="news-card-date">${post.date}</span>
        <a href="${post.file}" class="news-card-link">Leia mais</a>
      </div>
    `;
    list.appendChild(card);
  });
}

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
  // Adiciona suporte para filtrar seção News

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
          // Só processa bancos para seção real
          if (type === 'real') {
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

  loadNewsCards();
});

// Chat de Sugestões - EmailJS
(function() {
  const openBtn = document.getElementById('open-chat-btn');
  const closeBtn = document.getElementById('close-chat-btn');
  const modal = document.getElementById('suggestion-chat-modal');
  const form = document.getElementById('suggestion-chat-form');
  const status = document.getElementById('chat-status');

  openBtn.onclick = () => modal.classList.add('open');
  closeBtn.onclick = () => modal.classList.remove('open');

  form.onsubmit = function(e) {
    e.preventDefault();
    status.textContent = 'Enviando...';
    // Substitua pelos seus IDs do EmailJS:
    emailjs.send('service_svqj01e', 'SEU_TEMPLATE_ID', {
      message: document.getElementById('chat-message').value,
      email: document.getElementById('chat-email').value
    }, 'SEU_USER_ID')
    .then(function() {
      status.textContent = 'Mensagem enviada com sucesso!';
      form.reset();
      setTimeout(() => modal.classList.remove('open'), 1500);
    }, function(error) {
      status.textContent = 'Erro ao enviar. Tente novamente.';
    });
  };
})();
