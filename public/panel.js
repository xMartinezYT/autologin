// Sidebar desplegable
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarToggle.textContent = sidebar.classList.contains("open") ? "×" : "☰";
});

// Filtrado por búsqueda y etiquetas
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
