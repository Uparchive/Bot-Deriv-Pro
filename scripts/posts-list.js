// Lista de posts (mesmo padrão do script.js)
const posts = [
  {
    file: 'posts/post-prejuizo-29-04-25.html',
    title: 'Prejuízo na Operação do Dia 29/04/2025',
    desc: 'Resumo da operação do dia 29/04: começamos à meia-noite, mas após 13 minutos tivemos prejuízo. Veja detalhes e baixe o relatório em PDF.',
    date: '29/04/2025',
    img: 'img/prejuizo-dia-29-capa.jpg'
  },
  {
    file: 'posts/post1.html',
    title: 'Bem-vindo ao Bot Deriv Pro: O que é e para que serve?',
    desc: 'Descubra o propósito do site, como acompanhar resultados, novidades e tudo sobre o Bot Deriv Pro.',
    date: '29/04/2025',
    img: 'img/botposter.png'
  }
  // Adicione novos posts aqui seguindo o mesmo padrão
];

// Ordena do mais recente para o mais antigo
posts.sort((a, b) => b.date.split('/').reverse().join('-').localeCompare(a.date.split('/').reverse().join('-')));

const list = document.getElementById('all-posts-list');
const searchInput = document.getElementById('posts-search-input');
const noPostsFound = document.getElementById('no-posts-found');

function renderPosts(filteredPosts) {
  list.innerHTML = '';
  if (!filteredPosts.length) {
    noPostsFound.hidden = false;
    return;
  }
  noPostsFound.hidden = true;
  filteredPosts.forEach(post => {
    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = '../' + post.file;
    card.style.textDecoration = 'none';
    card.tabIndex = 0;
    card.target = '_blank';
    card.innerHTML = `
      <img src="${post.img}" alt="${post.title}" class="news-card-img"/>
      <div class="news-card-content">
        <h3 class="news-card-title">${post.title}</h3>
        <p class="news-card-desc">${post.desc}</p>
        <span class="news-card-date">${post.date}</span>
        <span class="news-card-link">Leia mais</span>
      </div>
    `;
    list.appendChild(card);
  });
}

function filterPosts() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderPosts(posts);
    return;
  }
  const filtered = posts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.desc.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

searchInput.addEventListener('input', filterPosts);

// Inicializa com todos os posts
renderPosts(posts);
