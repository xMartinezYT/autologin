(() => {
  /* ---------- CSS ---------- */
  const style = document.createElement("style");
  style.textContent = `
  :root {
    --bg-color: #121826;
    --sidebar-bg: #1a2130;
    --card-bg: #1c2435;
    --text-color: #e5e7eb;
    --accent-color: #00acee;
    --tag-bg: #2b3245;
    --badge-bg: #ffcd4d;
    --transition: 0.2s ease;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Poppins", sans-serif; }
  body { display: flex; background: var(--bg-color); color: var(--text-color); min-height: 100vh; }
  .sidebar { width: 70px; background: var(--sidebar-bg); display: flex; flex-direction: column; padding-top: 20px; align-items: center; }
  .nav-item { width: 40px; height: 40px; margin-bottom: 20px; background: var(--tag-bg); border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: var(--transition); }
  .nav-item:hover { background: var(--accent-color); }
  .content { flex: 1; padding: 20px; }
  .header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px; }
  .logo { font-size: 1.8rem; font-weight: 600; }
  .search-wrapper { position: relative; width: 100%; }
  .search-wrapper input { width: 100%; padding: 10px 35px 10px 15px; background: var(--card-bg); border: none; border-radius: 8px; color: var(--text-color); }
  .search-wrapper input::placeholder { color: #8891a5; }
  .search-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #8891a5; }
  .filter-tags { display: flex; gap: 10px; flex-wrap: wrap; }
  .filter-tags .tag { padding: 6px 12px; background: var(--tag-bg); color: #bbb; border-radius: 20px; cursor: pointer; transition: var(--transition); font-size: 0.9rem; }
  .filter-tags .tag.active, .filter-tags .tag:hover { background: var(--accent-color); color: #fff; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .card { background: var(--card-bg); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: var(--transition); }
  .card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
  .card-icon { width: 50px; height: 50px; border-radius: 12px; background: var(--accent-color); display: flex; align-items: center; justify-content: center; }
  .card-title { font-size: 1.25rem; font-weight: 600; }
  .card-description { font-size: 0.95rem; line-height: 1.4; color: #c1c5d0; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
  .badge { background: var(--badge-bg); color: #000; padding: 4px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
  .tags .tag { padding: 4px 8px; background: var(--tag-bg); border-radius: 8px; font-size: 0.8rem; color: #ccc; }
  @media (max-width: 768px) { .sidebar { display: none; } .content { padding: 10px; } .header { gap: 15px; } }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */
  document.body.innerHTML = `
  <aside class="sidebar">
    <a href="#" class="nav-item">🏠</a>
    <a href="#" class="nav-item">🛠️</a>
    <a href="#" class="nav-item">🔗</a>
    <a href="#" class="nav-item">⚙️</a>
  </aside>
  <main class="content">
    <header class="header">
      <h1 class="logo">EcomPro</h1>
      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Search for a tool..." aria-label="Search tools"/>
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-tags">
        <button class="tag active" data-tag="all">All</button>
        <button class="tag" data-tag="seo">SEO</button>
        <button class="tag" data-tag="design">Design</button>
        <button class="tag" data-tag="copy">Copy</button>
        <button class="tag" data-tag="ai">AI</button>
      </div>
    </header>

    <section class="cards" id="cardsContainer">
      <article class="card" data-tags="seo ai">
        <div class="card-icon">🛠️</div>
        <h2 class="card-title">GetStacked</h2>
        <p class="card-description">
          Diseño de estrategia competitiva. Compara con datos reales, descubre brechas y crea tu ventaja ganadora.
        </p>
        <div class="card-footer">
          <span class="badge">Bajo costo</span>
          <div class="tags"><span class="tag">SEO</span><span class="tag">AI</span></div>
        </div>
      </article>

      <article class="card" data-tags="design">
        <div class="card-icon">🛠️</div>
        <h2 class="card-title">Pikpads</h2>
        <p class="card-description">
          Catálogo de imágenes para Facebook, TikTok, IG y más. Diferencia tu marca en un mar de anuncios repetidos.
        </p>
        <div class="card-footer">
          <span class="badge">Avanzado</span>
          <div class="tags"><span class="tag">Design</span></div>
        </div>
      </article>

      <article class="card" data-tags="ai">
        <div class="card-icon">🛠️</div>
        <h2 class="card-title">Gemini</h2>
        <p class="card-description">
          Consigue un asistente personal que te escriba copys, responda correos y automatice tareas con IA.
        </p>
        <div class="card-footer">
          <span class="badge">Experimental</span>
          <div class="tags"><span class="tag">AI</span></div>
        </div>
      </article>
    </section>
  </main>
  `;

  /* ---------- JS: Filtrado ---------- */
  const searchInput = document.getElementById("search");
  const tagButtons = document.querySelectorAll(".filter-tags .tag");
  const cardsContainer = document.getElementById("cardsContainer");
  const cards = Array.from(cardsContainer.getElementsByClassName("card"));
  let activeTag = "all";

  searchInput.addEventListener("input", filterCards);
  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tagButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      activeTag = button.dataset.tag;
      filterCards();
    });
  });

  function filterCards() {
    const text = searchInput.value.toLowerCase();
    cards.forEach((card) => {
      const title = card.querySelector(".card-title").textContent.toLowerCase();
      const desc = card.querySelector(".card-description").textContent.toLowerCase();
      const tags = card.dataset.tags.split(" ");
      const matchesSearch = title.includes(text) || desc.includes(text);
      const matchesTag = activeTag === "all" || tags.includes(activeTag);
      card.style.display = matchesSearch && matchesTag ? "flex" : "none";
    });
  }
})();
