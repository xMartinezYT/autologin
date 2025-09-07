// Filtrado por texto y etiquetas
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
    const cardText = card.querySelector(".card-title").textContent.toLowerCase();
    const cardDesc = card.querySelector(".card-description").textContent.toLowerCase();
    const cardTags = card.dataset.tags.split(" ");

    const matchesSearch = cardText.includes(text) || cardDesc.includes(text);
    const matchesTag = activeTag === "all" || cardTags.includes(activeTag);

    card.style.display = matchesSearch && matchesTag ? "flex" : "none";
  });
}
