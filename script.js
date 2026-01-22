// 🌗 Appliquer le fondu à l’arrivée
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});

document.addEventListener("DOMContentLoaded", () => {
  // 🌙 Initialisation du thème sombre
  const toggle = document.getElementById("toggle-dark");
  const isDark = localStorage.getItem("dark-mode") === "enabled";

  if (isDark) {
    document.body.classList.add("dark-mode");
  }

  if (toggle) {
    toggle.checked = isDark;
    toggle.addEventListener("change", () => {
      const value = toggle.checked;
      document.body.classList.toggle("dark-mode", value);
      localStorage.setItem("dark-mode", value ? "enabled" : "disabled");
    });
  }

  // 🌀 Cadran Yo-kai
  const btn = document.querySelector(".radial-button");
  const cadran = document.querySelector(".yokai-cadran");
  const overlay = document.querySelector(".overlay");

  if (btn && cadran && overlay) {
    btn.addEventListener("click", () => {
      cadran.classList.toggle("active");
      overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", () => {
      cadran.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  // 🔍 Recherche + Filtres
  const searchInput = document.getElementById("search-yokai");
  const yokaiListContainer = document.getElementById("yo-kai-list");
  const btnFiltres = document.getElementById("open-filtres");
  const filterMenu = document.getElementById("filter-menu-column");
  const activeFiltersBox = document.getElementById("active-filters");
  const resetBtn = document.getElementById("btn-reset-filters");

  let yokaiList = [];
  let filtreState = {
    tribu: null,
    rang: null,
    categorie: null,
    attribut: null,
    jeux: null
  };

  const optionsMap = {
    tribu: ["Mignon", "Vaillant", "Mysterieux", "Costauds", "Bienveillants", "Sombres", "Sinistres", "Insaisissables", "Perfides", "Enmas", "Wandroïdes" , "Boss"],
    rang: ["S", "A", "B", "C", "D", "E"],
    categorie: ["Legendaires", "Rares", "Boss", "Big Boss", "Trésor", "Pionniers", "Mericain", "Yo-criminels", "Fusionnés", "Gemnyan", "Perfides Fusionnés", "Yo-Kai Éveillé"],
    attribut: ["Feu", "Eau", "Terre", "Glace", "Foudre", "Vent", "Absorption", "Restauration"],
    jeux: ["Yo-kai Watch 1", "Yo-kai Watch 2", "Yo-kai Watch 3"]
  };

  const jeuxSubMap = {
    "Yo-kai Watch 2": ["Toutes Versions", "Fantômes Bouffis", "Esprits Farceurs", "Spectres Psychiques"],
    "Yo-kai Watch 3": ["Toutes Versions", "Sushi", "Tempura", "Sukiyaki"]
  };

  fetch("yokaidata.json")
    .then(res => res.json())
    .then(data => {
      console.log("Données récupérées :", data);
      yokaiList = data;
      applyFilters();
    })
    .catch(err => {
      console.error("Erreur de chargement JSON :", err);
    });

  btnFiltres.addEventListener("click", e => {
    e.stopPropagation();
    if (filterMenu.classList.contains("active")) {
      filterMenu.classList.remove("active");
      filterMenu.innerHTML = "";
    } else {
      filterMenu.classList.add("active");
      filterMenu.innerHTML = "";
      Object.keys(optionsMap).forEach(type => {
        const typeBtn = document.createElement("button");
        typeBtn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeBtn.dataset.type = type;
        typeBtn.classList.add("type-selector");
        typeBtn.addEventListener("click", e => {
          e.stopPropagation();
          showFilterOptions(type);
        });
        filterMenu.appendChild(typeBtn);
      });
    }
  });

  document.addEventListener("click", event => {
    const target = event.target;
    const isInside = filterMenu.contains(target) || btnFiltres.contains(target);
    if (!isInside && filterMenu.classList.contains("active")) {
      filterMenu.classList.remove("active");
      filterMenu.innerHTML = "";
    }
  });

  function showFilterOptions(type) {
    filterMenu.innerHTML = "";

    if (type === "jeux") {
      optionsMap.jeux.forEach(main => {
        const mainBtn = document.createElement("button");
        mainBtn.textContent = main;
        mainBtn.addEventListener("click", e => {
          e.stopPropagation();
          if (jeuxSubMap[main]) {
            filterMenu.innerHTML = "";
            jeuxSubMap[main].forEach(sub => {
              const subBtn = document.createElement("button");
              subBtn.textContent = sub;
              subBtn.addEventListener("click", () => {
                filtreState.jeux = sub;
                applyFilters();
                filterMenu.classList.remove("active");
                filterMenu.innerHTML = "";
              });
              filterMenu.appendChild(subBtn);
            });
          } else {
            filtreState.jeux = main;
            applyFilters();
            filterMenu.classList.remove("active");
            filterMenu.innerHTML = "";
          }
        });
        filterMenu.appendChild(mainBtn);
      });
    } else {
      optionsMap[type].forEach(option => {
        const optBtn = document.createElement("button");
        optBtn.textContent = option;
        optBtn.addEventListener("click", e => {
          e.stopPropagation();
          filtreState[type] = option;
          applyFilters();
          filterMenu.classList.remove("active");
          filterMenu.innerHTML = "";
        });
        filterMenu.appendChild(optBtn);
      });
    }
  }

  searchInput.addEventListener("input", applyFilters);
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") applyFilters();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      filtreState = {
        tribu: null,
        rang: null,
        categorie: null,
        attribut: null,
        jeux: null
      };
      applyFilters();
    });
  }

  if (activeFiltersBox) {
    activeFiltersBox.addEventListener("click", e => {
      if (e.target.classList.contains("remove-filter")) {
        const type = e.target.dataset.type;
        filtreState[type] = null;
        applyFilters();
      }
    });
  }

  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const { tribu, rang, categorie, attribut, jeux } = filtreState;

    const filtered = yokaiList.filter(yokai => {
      const matchSearch = yokai.nom.toLowerCase().includes(term) || (yokai.description || "").toLowerCase().includes(term);
      const matchTribu = !tribu || yokai.tribu === tribu;
      const matchRang = !rang || yokai.rang === rang;
      const matchCat = !categorie || (Array.isArray(yokai.categorie) ? yokai.categorie.includes(categorie) : yokai.categorie === categorie);
      const matchAttr = !attribut || yokai.attribut === attribut;
      const matchJeux =
        !jeux ||
        yokai.jeux === jeux ||
        (jeux === "Toutes Versions" &&
          ["Fantômes Bouffis", "Esprits Farceurs", "Spectres Psychiques", "Sushi", "Tempura", "Sukiyaki"].includes(yokai.jeux));

      return matchSearch && matchTribu && matchRang && matchCat && matchAttr && matchJeux;
    });

    displayYokaiCards(filtered);
    updateActiveFiltersDisplay();
  }

  function displayYokaiCards(array) {
    yokaiListContainer.innerHTML = "";
    array.forEach(yokai => {
      const card = document.createElement("div");
      card.className = `yokai-card tribu-${yokai.tribu.toLowerCase()}`;
      card.innerHTML = `
        <img src="yokai-images/${yokai.image}" alt="${yokai.nom}" class="yokai-img" />
        <div class="yokai-infos">
          <h3>${yokai.nom}</h3>
          <p>${yokai.description || ""}</p>
          <div class="tags-row">
            ${yokai.rang ? `<img src="yokai-images/icones/rang-${yokai.rang}.png" alt="Rang ${yokai.rang}" class="icon-tag" />` : ""}
            ${yokai.tribu ? `<img src="yokai-images/icones/tribu-${yokai.tribu.toLowerCase()}.png" alt="${yokai.tribu}" class="icon-tag" />` : ""}
            ${yokai.attribut ? `<img src="yokai-images/icones/element-${yokai.attribut.toLowerCase()}.png" alt="${yokai.attribut}" class="icon-tag" />` : ""}
          </div>
        </div>
      `;
      yokaiListContainer.appendChild(card);
    });
  }

    function formatCategories(cat) {
    if (Array.isArray(cat)) {
      return cat.map(c => `<span class="tag extra">${c}</span>`).join("");
    }
    return `<span class="tag extra">${cat}</span>`;
  }

  function updateActiveFiltersDisplay() {
    const { tribu, rang, categorie, attribut, jeux } = filtreState;
    activeFiltersBox.innerHTML = "";

    Object.entries({ tribu, rang, categorie, attribut, jeux }).forEach(([type, value]) => {
      if (value) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${value} <button class="remove-filter" data-type="${type}">✖️</button>`;
        activeFiltersBox.appendChild(tag);
      }
    });

    if (resetBtn) {
      activeFiltersBox.appendChild(resetBtn);
    }
  }

  // 🌙 Transition cosmique entre les pages
  const transitionOverlay = document.getElementById("page-transition");

  document.querySelectorAll("a[href]").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");

      if (href && !href.startsWith("#") && !link.hasAttribute("target")) {
        e.preventDefault();
        if (transitionOverlay) {
          transitionOverlay.classList.add("active");
        }

        setTimeout(() => {
          window.location.href = href;
        }, 400);
      }
    });
  });
});
