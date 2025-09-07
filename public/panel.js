// Datos de herramientas
const tools = [
  // AI
  { name: "WinningHunter", desc: "Encuentra productos ganadores con IA.", url: "https://app.winninghunter.com/login", tags: ["ai"], category: "AI", badge: "Popular", logo: "WH" },
  { name: "Elevenlabs", desc: "Voces sintéticas realistas.", url: "https://elevenlabs.io/sign-in", tags: ["ai"], category: "AI", badge: "Trial", logo: "EL" },
  { name: "ChatGPT", desc: "Asistente conversacional potente.", url: "https://chat.openai.com/auth/login", tags: ["ai","copy"], category: "AI", badge: "Pro", logo: "CG" },
  { name: "HeyGen", desc: "Videos con avatares IA.", url: "https://app.heygen.com/login", tags: ["ai"], category: "AI", badge: "New", logo: "HG" },
  { name: "Fish Audio", desc: "Edición de voz con IA.", url: "https://fishaudio.com/login", tags: ["ai"], category: "AI", badge: "Beta", logo: "FA" },
  { name: "Peeksta", desc: "Investigación de productos con IA.", url: "https://app.peeksta.com/login", tags: ["ai"], category: "AI", badge: "Pro", logo: "PK" },
  { name: "Perplexity", desc: "Búsqueda y respuestas con IA.", url: "https://www.perplexity.ai/login", tags: ["ai"], category: "AI", badge: "Top", logo: "PX" },
  { name: "Insmind", desc: "Herramientas de IA creativa.", url: "https://insmind.com/login", tags: ["ai"], category: "AI", badge: "New", logo: "IM" },
  { name: "Loom", desc: "Grabación de pantalla con IA.", url: "https://www.loom.com/login", tags: ["ai"], category: "AI", badge: "Trial", logo: "LM" },
  { name: "Cramly", desc: "Notas y resúmenes con IA.", url: "https://app.cramly.ai/login", tags: ["ai"], category: "AI", badge: "Pro", logo: "CR" },

  // SEO
  { name: "GetHookd", desc: "Retargeting y funnels avanzados.", url: "https://gethookd.com/login", tags: ["seo"], category: "SEO", badge: "Trial", logo: "GH" },
  { name: "Pipiads", desc: "Espía anuncios TikTok e inspiraciones.", url: "https://app.pipiads.com/login", tags: ["seo"], category: "SEO", badge: "Popular", logo: "PA" },
  { name: "Kalodata", desc: "Análisis de productos y mercado.", url: "https://www.kalodata.com/login", tags: ["seo"], category: "SEO", badge: "Pro", logo: "KD" },
  { name: "Viralityc", desc: "Analítica de tendencias sociales.", url: "https://viralityc.com/login", tags: ["seo"], category: "SEO", badge: "New", logo: "VC" },
  { name: "ShopHunter", desc: "Investiga productos en marketplaces.", url: "https://app.shophunter.io/login", tags: ["seo"], category: "SEO", badge: "Trial", logo: "SH" },
  { name: "HideMyAss", desc: "VPN para seguridad online.", url: "https://my.hidemyass.com/en-us/login", tags: ["seo"], category: "SEO", badge: "Secure", logo: "HM" },
  { name: "SellTheTrend", desc: "Descubre productos virales.", url: "https://app.sellthetrend.com/login", tags: ["seo"], category: "SEO", badge: "Pro", logo: "ST" },
  { name: "Adsparo", desc: "Gestión de campañas publicitarias.", url: "https://app.adsparo.com/login", tags: ["seo"], category: "SEO", badge: "Trial", logo: "AD" },

  // Design
  { name: "CapCut Pro", desc: "Edición de video profesional.", url: "https://www.capcut.com/login/en", tags: ["design"], category: "Design", badge: "Popular", logo: "CC" },
  { name: "DesignBeast", desc: "Kit de herramientas gráficas.", url: "https://app.designbeast.com/login", tags: ["design"], category: "Design", badge: "Pro", logo: "DB" },
  { name: "FlutterFlow", desc: "Builder visual para apps.", url: "https://app.flutterflow.io/login", tags: ["design"], category: "Design", badge: "Trial", logo: "FF" },
  { name: "Figma", desc: "Diseño colaborativo de interfaces.", url: "https://www.figma.com/login", tags: ["design"], category: "Design", badge: "Team", logo: "FG" },
  { name: "Pacdora", desc: "Diseño 3D de packaging.", url: "https://www.pacdora.com/login", tags: ["design"], category: "Design", badge: "Beta", logo: "PC" },

  // Copy
  { name: "DeepL", desc: "Traducciones de alta calidad.", url: "https://www.deepl.com/login", tags: ["copy"], category: "Copy", badge: "Pro", logo: "DL" },

  // Tools (miscelánea)
  { name: "30+ Bonus Tools", desc: "Colección de marketing y automatización.", url: "#", tags: ["tools"], category: "Tools", badge: "Bonus", logo: "BT" },
  { name: "GetStacked", desc: "Estrategia competitiva con datos reales.", url: "#", tags: ["seo","ai"], category: "Tools", badge: "Bajo costo", logo: "GS" }
];

// Categorías a mostrar
const categories = ["AI", "SEO", "Design", "Copy", "Tools"];

// Construir el panel
const container = document.getElementById("categoriesContainer");
categories.forEach(cat => {
  const section = document.createElement("section");
  section.className = "category";
  section.dataset.category = cat.toLowerCase();
  section.innerHTML = `<h2 class="category-title">${cat}</h2><div class="cards"></div>`;
  container.appendChild(section);
});

// Crear tarjetas dentro de cada sección
tools.forEach(tool => {
  const card = document.createElement("a");
  card.className = "card";
  card.href = tool.url;
  card.target = "_blank";
  card.rel = "noopener";
  card.dataset.tags = tool.tags.join(" ");
  card.innerHTML = `
    <div class="card-icon">${tool.logo}</div>
    <h3 class="card-title">${tool.name}</h3>
    <p class="card-description">${tool.desc}</p>
    <div class="card-footer">
      <span class="badge">${tool.badge}</span>
      <div class="tags">
        ${tool.tags.map(t => `<span class="tag">${t.toUpperCase()}</span>`).join("")}
      </div>
    </div>
  `;
  const sect = document.querySelector(`.category[data-category="${tool.category.toLowerCase()}"] .cards`);
  if (sect) sect.appendChild(card);
});

// Filtro por texto y etiquetas
const searchInput = document.getElementById("search");
const tagButtons = document.querySelectorAll(".filter-tags .tag");
const cards = Array.from(document.getElementsByClassName("card"));
let activeTag = "all";

searchInput.addEventListener("input", filterCards);
tagButtons.forEach(btn => btn.addEventListener("click", () => {
  tagButtons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeTag = btn.dataset.tag;
  filterCards();
}));

function filterCards() {
  const text = searchInput.value.toLowerCase();
  cards.forEach(card => {
    const title = card.querySelector(".card-title").textContent.toLowerCase();
    const desc = card.querySelector(".card-description").textContent.toLowerCase();
    const tags = card.dataset.tags.split(" ");
    const matchesSearch = title.includes(text) || desc.includes(text);
    const matchesTag = activeTag === "all" || tags.includes(activeTag);
    card.style.display = matchesSearch && matchesTag ? "flex" : "none";
  });
}

// Sidebar desplegable
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarToggle.textContent = sidebar.classList.contains("open") ? "×" : "☰";
});
