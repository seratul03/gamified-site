document.addEventListener("DOMContentLoaded", () => {
  let selectedLanguage = { code: "en", name: "English" };
  let selectedCategory = "all";
  let currentTopic = "";
  let searchHistory = []; // For storing search history

  const contentArea = document.getElementById("content-area");
  const sidebarContainer = document.getElementById("sidebar-container");
  const searchBarTrigger = document.getElementById("search-bar-trigger");
  const searchBarText = searchBarTrigger?.querySelector("span");
  const searchOverlay = document.getElementById("search-overlay");
  const searchOverlayPanel = document.getElementById("search-overlay-panel");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("search-suggestions");
  const trendingTopicsContainer = document.querySelector(
    "#trending-topics div"
  );
  const langMenuContainer = document.getElementById("language-menu-container");
  const avatarBtn = document.getElementById("avatarBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "hi", name: "हिन्दी" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];
  const categories = [
    { id: "all", name: "All" },
    { id: "tech", name: "Technology" },
    { id: "science", name: "Science" },
    { id: "arts", name: "Arts" },
    { id: "history", name: "History" },
    { id: "skills", name: "Life Skills" },
  ];
  const allRecommendations = [
    {
      title: "Introduction to Python",
      description: "Start your programming journey.",
      icon: "code",
      category: "tech",
    },
    {
      title: "How Do Neural Networks Work?",
      description: "Explore the core concepts behind AI.",
      icon: "hub",
      category: "tech",
    },
    {
      title: "Fundamentals of UI/UX",
      description: "Principles of user-friendly design.",
      icon: "design_services",
      category: "tech",
    },
    {
      title: "What is Blockchain?",
      description: "Understand the tech behind crypto.",
      icon: "link",
      category: "tech",
    },
    {
      title: "JavaScript ES6 Features",
      description: "Unlock modern JavaScript capabilities.",
      icon: "javascript",
      category: "tech",
    },
    {
      title: "The Theory of Relativity",
      description: "Grasp Einstein's ideas on space and time.",
      icon: "rocket_launch",
      category: "science",
    },
    {
      title: "Quantum Computing Explained",
      description: "Dive into the world of quantum bits.",
      icon: "memory",
      category: "science",
    },
    {
      title: "CRISPR Gene Editing",
      description: "Learn how scientists can edit DNA.",
      icon: "biotech",
      category: "science",
    },
    {
      title: "The Human Brain",
      description: "A journey into the complexities of our mind.",
      icon: "psychology",
      category: "science",
    },
    {
      title: "The Roman Empire",
      description: "Explore the rise and fall of a great civilization.",
      icon: "castle",
      category: "history",
    },
    {
      title: "Ancient Egypt Mythology",
      description: "Discover the gods and myths of the pharaohs.",
      icon: "account_balance",
      category: "history",
    },
    {
      title: "Basics of Personal Finance",
      description: "Master budgeting, saving, and investing.",
      icon: "attach_money",
      category: "skills",
    },
    {
      title: "The Art of Storytelling",
      description: "Craft compelling and memorable narratives.",
      icon: "auto_stories",
      category: "arts",
    },
    {
      title: "Public Speaking Mastery",
      description: "Build confidence and deliver powerful speeches.",
      icon: "campaign",
      category: "skills",
    },
    {
      title: "Introduction to Philosophy",
      description: "Think about life's biggest questions.",
      icon: "self_improvement",
      category: "arts",
    },
  ];
  const trendingTopics = [
    "History of Ancient Rome",
    "Quantum Computing Explained",
    "Basics of Stoic Philosophy",
    "The Art of Japanese Woodblock Prints",
    "Neural Networks for Beginners",
  ];

  const saveHistory = () => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  };

  const loadHistory = () => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      searchHistory = JSON.parse(storedHistory);
    }
  };

  const renderSearchHistory = () => {
    if (!sidebarContainer) return;
    if (searchHistory.length === 0) {
      sidebarContainer.innerHTML = `
        <div class="sticky top-28">
            <h3 class="font-bold text-lg text-white mb-4 border-l-2 border-green-500 pl-3">Search History</h3>
            <p class="text-gray-400 text-sm pl-3">Your recent searches will appear here.</p>
        </div>`;
      return;
    }
    const historyHtml = searchHistory
      .map(
        (topic) =>
          `<button class="history-item w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors" data-topic="${topic}">${topic}</button>`
      )
      .join("");
    sidebarContainer.innerHTML = `
        <div class="sticky top-28">
            <h3 class="font-bold text-lg text-white mb-4 border-l-2 border-green-500 pl-3">Search History</h3>
            <div class="space-y-2">${historyHtml}</div>
        </div>`;
  };

  const renderLoader = () =>
    `<div class="flex justify-center py-12"><span class="loader"></span></div>`;
  const renderError = (message) =>
    `<p class="text-center text-red-400">Error: ${message}</p>`;

  const updateSearchBarText = (topic) => {
    if (searchBarText) {
      if (topic) {
        searchBarText.textContent = topic;
        searchBarText.classList.remove("text-gray-300");
      } else {
        searchBarText.textContent = "What do you want to learn today?";
        searchBarText.classList.add("text-gray-300");
      }
    }
  };

  const renderLanguageMenu = () => {
    if (!langMenuContainer) return;
    const itemsHtml = languages
      .map(
        (lang) =>
          ` <button data-lang-code="${
            lang.code
          }" class="lang-item group flex rounded-md items-center justify-between w-full px-2 py-2 text-sm text-gray-300 hover:bg-green-500 hover:text-white"> <span>${
            lang.name
          }</span> ${
            selectedLanguage.code === lang.code
              ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>'
              : ""
          } </button> `
      )
      .join("");
    langMenuContainer.innerHTML = ` <button id="lang-menu-button" class="flex items-center justify-center w-12 h-12 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200"> <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg> </button> <div id="lang-menu-items" class="absolute right-0 w-48 mt-2 origin-top-right bg-gray-800 border border-white/20 rounded-md shadow-lg hidden"> <div class="px-1 py-1">${itemsHtml}</div> </div>`;
  };

  const renderForYou = () => {
    if (!contentArea) return;
    const filtered =
      selectedCategory === "all"
        ? allRecommendations
        : allRecommendations.filter((rec) => rec.category === selectedCategory);
    const recommendationsToShow = filtered.slice(0, 10);
    const categoryButtonsHtml = categories
      .map(
        (cat) =>
          `<button class="category-btn px-4 py-2 text-sm font-semibold rounded-full border transition-colors duration-200 ${
            selectedCategory === cat.id
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white/5 border-white/20 text-gray-300 hover:border-green-500"
          }" data-category-id="${cat.id}">${cat.name}</button>`
      )
      .join("");
    const recommendationCardsHtml = recommendationsToShow
      .map(
        (rec, index) =>
          ` <div class="card-enter" style="animation-delay: ${
            index * 50
          }ms;"><button class="for-you-card bg-white/5 p-6 rounded-xl border border-white/10 text-left h-full w-full hover:bg-white/10 hover:border-white/20 transition-all duration-300" data-topic="${
            rec.title
          }"><div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4 text-3xl"><span class="material-symbols-outlined">${
            rec.icon
          }</span></div><h3 class="font-bold text-white text-lg">${
            rec.title
          }</h3><p class="text-gray-400 text-sm mt-1">${
            rec.description
          }</p></button></div>`
      )
      .join("");
    contentArea.innerHTML = ` <h2 class="text-2xl font-bold text-white mb-4">Recommended For You</h2> <p class="text-gray-400 mb-6">Not sure what to learn? Select an interest to get started.</p> <div class="flex flex-wrap items-center gap-2 mb-8">${categoryButtonsHtml}</div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">${recommendationCardsHtml}</div> <div class="text-center mt-16"><a href="/recommendations" class="inline-block bg-green-500 text-white font-bold rounded-full px-8 py-4 text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"><strong>Explore All Topics &rarr;</strong></a></div>`;
    currentTopic = "";
    updateSearchBarText(null);
    renderSearchHistory();
  };

  const renderLearningSection = (data) => {
    if (!contentArea) return;
    const {
      aiExplanationShort,
      aiExplanationLong,
      youtubeVideos,
      articles,
      keyConcepts,
    } = data;
    let html = "";
    if (aiExplanationShort && aiExplanationLong) {
      const fullTextHtml = aiExplanationLong
        .split(/\n\s*\n/)
        .map(
          (p) => `<p class="mb-4 text-gray-200 leading-relaxed">${p.trim()}</p>`
        )
        .join("");
      html += ` <div class="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm card-enter"> <h2 class="result-card-heading">AI Explanation</h2> <div id="ai-explanation-content" data-full-text="${encodeURIComponent(
        fullTextHtml
      )}"> <p class="mb-4 text-gray-200 leading-relaxed">${aiExplanationShort}</p> </div> <button id="see-more-ai" class="mt-2 text-green-400 font-semibold hover:text-green-300 transition-colors">Read Full Explanation &rarr;</button> </div>`;
    }
    if (youtubeVideos?.length > 0) {
      const videosHtml = youtubeVideos
        .map(
          (video) =>
            `<div class="group relative">
               <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" class="block">
                 <div class="relative">
                   <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-auto rounded-lg object-cover aspect-video transition-transform duration-300 group-hover:scale-105" />
                   <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                   </div>
                 </div>
                 <p class="mt-2 text-sm text-gray-300 group-hover:text-green-400 transition-colors duration-200">${video.title}</p>
               </a>
               <button class="save-btn absolute top-2 right-2 bg-black/50 text-white px-3 py-1 text-xs rounded-md hover:bg-green-500 transition-colors"
                       data-type="video"
                       data-id="${video.id}"
                       data-title="${video.title}"
                       data-thumbnail="${video.thumbnail}">Save</button>
             </div>`
        )
        .join("");
      html += `<div class="bg-white/5 border border-white/10 rounded-xl p-6 mt-8 backdrop-blur-sm card-enter" style="animation-delay: 0.2s"><h2 class="result-card-heading">Top YouTube Videos</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${videosHtml}</div></div>`;
    }
    if (articles?.length > 0) {
      const articlesHtml = articles
        .map(
          (article) =>
            `<div class="block p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors group relative">
               <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                 <h3 class="text-green-400 font-semibold group-hover:underline">${article.title}</h3>
                 <p class="text-sm text-gray-400 mt-1 line-clamp-2">${article.snippet}</p>
                 <p class="text-xs text-gray-500 mt-2 truncate">${article.link}</p>
               </a>
               <button class="save-btn absolute top-2 right-2 bg-black/50 text-white px-3 py-1 text-xs rounded-md hover:bg-green-500 transition-colors"
                       data-type="article"
                       data-title="${article.title}"
                       data-link="${article.link}"
                       data-snippet="${article.snippet}">Save</button>
             </div>`
        )
        .join("");
      html += `<div class="bg-white/5 border border-white/10 rounded-xl p-6 mt-8 backdrop-blur-sm card-enter" style="animation-delay: 0.4s"><h2 class="result-card-heading">Recommended Articles</h2><div class="space-y-4">${articlesHtml}</div></div>`;
    }

    const quizTopic = encodeURIComponent(currentTopic);
    const quizUrl = `/quiz?topic=${quizTopic}&num_questions=15`;
    html += `
        <div class="text-center mt-12 card-enter" style="animation-delay: 0.6s;">
            <a href="${quizUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full px-10 py-5 text-xl hover:scale-105 transition-transform duration-300 shadow-lg">
                🧠 Test Your Knowledge
            </a>
        </div>
    `;

    contentArea.innerHTML = `<div class="w-full space-y-8">${html}</div>`;
    if (keyConcepts?.length > 0) {
      const conceptsHtml = keyConcepts
        .map(
          (concept) =>
            `<div class="bg-white/5 p-4 rounded-lg border border-white/10"><h4 class="font-bold text-white">${concept.term}</h4><p class="text-sm text-gray-400 mt-1">${concept.definition}</p></div>`
        )
        .join("");
      sidebarContainer.innerHTML = `<div class="sticky top-28"><h3 class="font-bold text-lg text-white mb-4 border-l-2 border-green-500 pl-3">Key Concepts</h3><div class="space-y-3">${conceptsHtml}</div></div>`;
    } else {
      sidebarContainer.innerHTML = "";
    }
  };

  const handleSearch = async (topic) => {
    if (!topic || !topic.trim()) return;

    searchHistory = searchHistory.filter(
      (item) => item.toLowerCase() !== topic.toLowerCase()
    );
    searchHistory.unshift(topic);
    if (searchHistory.length > 7) searchHistory.pop();
    saveHistory();

    currentTopic = topic;
    updateSearchBarText(topic);
    contentArea.innerHTML = renderLoader();
    sidebarContainer.innerHTML = "";
    history.pushState(
      { type: "search", topic },
      "",
      `/?search=${encodeURIComponent(topic)}`
    );
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, language: selectedLanguage.code }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      renderLearningSection(data);
      closeSearchOverlay();
    } catch (error) {
      console.error("Search failed:", error);
      contentArea.innerHTML = renderError(error.message);
    }
  };

  const handleSave = async (btn) => {
    const type = btn.dataset.type;
    const url = `/api/save/${type}`;
    let payload;

    if (type === "article") {
      payload = {
        title: btn.dataset.title,
        link: btn.dataset.link,
        snippet: btn.dataset.snippet,
      };
    } else {
      // video
      payload = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        thumbnail: btn.dataset.thumbnail,
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Save failed");
      const result = await response.json();
      console.log(result.message);
      btn.textContent = "Saved!";
      btn.disabled = true;
      btn.classList.add("bg-green-500");
    } catch (error) {
      console.error("Error saving item:", error);
      btn.textContent = "Error";
    }
  };

  const openSearchOverlay = () => {
    if (!searchOverlay || !searchOverlayPanel) return;
    searchInput.value = currentTopic;
    searchOverlay.classList.add("visible");
    searchOverlayPanel.classList.add("visible");
    searchInput.focus();
    if (currentTopic) searchInput.select();
  };
  const closeSearchOverlay = () => {
    if (!searchOverlay || !searchOverlayPanel) return;
    searchOverlay.classList.remove("visible");
    searchOverlayPanel.classList.remove("visible");
    searchInput.value = "";
    if (suggestionsBox) suggestionsBox.classList.add("hidden");
  };
  const handleInitialPageLoad = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTopic = urlParams.get("search");
    if (searchTopic) {
      handleSearch(searchTopic);
    } else {
      if (contentArea) renderForYou();
    }
  };

  if (searchBarTrigger)
    searchBarTrigger.addEventListener("click", openSearchOverlay);

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) handleSearch(query);
    });
  }

  const showSuggestions = (query) => {
    if (!suggestionsBox) return;
    if (!query || query.trim().length < 2) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.add("hidden");
      return;
    }
    const pool = [...allRecommendations.map((r) => r.title), ...trendingTopics];
    const filtered = pool
      .filter((title) => title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    if (filtered.length === 0) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.add("hidden");
      return;
    }
    suggestionsBox.innerHTML = filtered
      .map(
        (topic) =>
          `<div class="px-4 py-2 cursor-pointer hover:bg-green-500/20 text-white transition-colors" data-suggestion="${topic}">${topic}</div>`
      )
      .join("");
    suggestionsBox.classList.remove("hidden");
  };
  if (searchInput) {
    searchInput.addEventListener("input", (e) =>
      showSuggestions(e.target.value)
    );
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearchOverlay();
    });
  }

  document.body.addEventListener("click", (e) => {
    if (
      searchOverlay?.classList.contains("visible") &&
      !searchOverlayPanel?.contains(e.target) &&
      !searchBarTrigger?.contains(e.target)
    ) {
      closeSearchOverlay();
    }

    const saveBtn = e.target.closest(".save-btn");
    if (saveBtn) {
      handleSave(saveBtn);
      return;
    }

    const historyItem = e.target.closest(".history-item");
    if (historyItem) {
      const topic = historyItem.dataset.topic;
      if (topic) handleSearch(topic);
      return;
    }

    const suggestionItem = e.target.closest("[data-suggestion]");
    if (suggestionItem) {
      const topic = suggestionItem.dataset.suggestion;
      searchInput.value = topic;
      if (suggestionsBox) suggestionsBox.classList.add("hidden");
      handleSearch(topic);
    }
    if (e.target?.id === "see-more-ai") {
      const contentDiv = document.getElementById("ai-explanation-content");
      if (contentDiv?.dataset.fullText) {
        contentDiv.innerHTML = decodeURIComponent(contentDiv.dataset.fullText);
        e.target.style.display = "none";
      }
    }
    const forYouCard = e.target.closest(".for-you-card");
    if (forYouCard) {
      e.preventDefault();
      handleSearch(forYouCard.dataset.topic);
    }
    const categoryBtn = e.target.closest(".category-btn");
    if (categoryBtn) {
      selectedCategory = categoryBtn.dataset.categoryId;
      renderForYou();
    }
    const langMenuButton = e.target.closest("#lang-menu-button");
    const langMenuItems = document.getElementById("lang-menu-items");
    if (langMenuButton) {
      langMenuItems?.classList.toggle("hidden");
    } else if (!e.target.closest("#language-menu-container")) {
      langMenuItems?.classList.add("hidden");
    }
    const langItem = e.target.closest(".lang-item");
    if (langItem) {
      selectedLanguage = languages.find(
        (l) => l.code === langItem.dataset.langCode
      );
      document.getElementById("lang-menu-items")?.classList.add("hidden");
      renderLanguageMenu();
      if (currentTopic) handleSearch(currentTopic);
    }
  });

  window.addEventListener("popstate", (e) => {
    if (e.state?.type === "search" && e.state.topic) {
      handleSearch(e.state.topic);
    } else {
      renderForYou();
    }
  });

  if (avatarBtn && profileDropdown) {
    avatarBtn.addEventListener("click", () => {
      profileDropdown.classList.toggle("show");
      profileDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (
        !avatarBtn.contains(e.target) &&
        !profileDropdown.contains(e.target)
      ) {
        profileDropdown.classList.remove("show");
        profileDropdown.classList.add("hidden");
      }
    });
  }

  loadHistory();
  renderLanguageMenu();
  handleInitialPageLoad();
  if (trendingTopicsContainer) {
    trendingTopicsContainer.innerHTML = trendingTopics
      .map(
        (topic) =>
          `<button class="for-you-card bg-white/10 px-4 py-2 rounded-full text-sm text-gray-200 hover:bg-white/20 hover:text-white transition-colors" data-topic="${topic}">${topic}</button>`
      )
      .join("");
  }
});
