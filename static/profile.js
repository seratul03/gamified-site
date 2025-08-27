document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("profile-tabs");
  const tabButtons = tabsContainer
    ? [...tabsContainer.querySelectorAll(".tab-btn")]
    : [];
  const contentDivs = {
    articles: document.getElementById("tab-content-articles"),
    videos: document.getElementById("tab-content-videos"),
    history: document.getElementById("tab-content-history"),
  };

  function setActiveTab(tabName, clickedTab) {
    tabButtons.forEach((btn) => {
      const isActive = btn === clickedTab;
      if (isActive) {
        btn.classList.add("bg-green-500", "text-white", "shadow");
        btn.classList.remove("bg-white/10", "text-gray-300");
      } else {
        btn.classList.remove("bg-green-500", "text-white", "shadow");
        btn.classList.add("bg-white/10", "text-gray-300");
      }
    });

    Object.values(contentDivs).forEach((div) => div?.classList.add("hidden"));
    contentDivs[tabName]?.classList.remove("hidden");
  }

  // Default tab = Articles
  if (tabButtons.length) {
    setActiveTab("articles", tabButtons[0]);
  }

  tabsContainer?.addEventListener("click", (e) => {
    const clickedTab = e.target.closest(".tab-btn");
    if (!clickedTab) return;
    const tabName = clickedTab.dataset.tab;
    setActiveTab(tabName, clickedTab);
  });

  // Chart.js
  const ctx = document.getElementById("learningChart");
  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Hours Studied",
            data: [2, 1, 3, 4, 2, 5, 3],
            borderColor: "rgba(34,197,94,1)",
            backgroundColor: "rgba(34,197,94,0.3)",
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "rgba(34,197,94,1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#9CA3AF" } },
          y: { ticks: { color: "#9CA3AF" } },
        },
      },
    });
  }
});
