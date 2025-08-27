document.addEventListener("DOMContentLoaded", () => {
  const categories = [
    { id: "tech", name: "Technology & Programming" },
    { id: "science", name: "Science & Nature" },
    { id: "arts", name: "Arts & Humanities" },
    { id: "history", name: "History & Civilization" },
    { id: "skills", name: "Life Skills & Hobbies" },
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
      title: "The Art of Storytelling",
      description: "Craft compelling and memorable narratives.",
      icon: "auto_stories",
      category: "arts",
    },
    {
      title: "Introduction to Philosophy",
      description: "Think about life's biggest questions.",
      icon: "self_improvement",
      category: "arts",
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
      title: "Public Speaking Mastery",
      description: "Build confidence and deliver powerful speeches.",
      icon: "campaign",
      category: "skills",
    },
  ];

  const container = document.getElementById("all-recommendations-container");
  if (!container) return;

  let fullHtml = "";

  categories.forEach((category) => {
    const categoryCards = allRecommendations.filter(
      (rec) => rec.category === category.id
    );
    if (categoryCards.length === 0) return;

    const cardsHtml = categoryCards
      .map(
        (rec, index) => `
        <div class="card-enter" style="animation-delay: ${index * 50}ms;">
          <div class="rec-card bg-white/5 p-6 rounded-2xl border border-white/10 text-left h-full w-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 block shadow-md hover:shadow-lg cursor-pointer"
               data-title="${rec.title}">
            <div class="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-4 text-3xl pointer-events-none">
              <span class="material-symbols-outlined">${rec.icon}</span>
            </div>
            <h3 class="font-bold text-white text-lg pointer-events-none">${
              rec.title
            }</h3>
            <p class="text-gray-400 text-sm mt-2 pointer-events-none">${
              rec.description
            }</p>
          </div>
        </div>
      `
      )
      .join("");

    fullHtml += `
      <section>
        <h2 class="text-3xl font-bold text-white mb-8 border-l-4 border-green-500 pl-4">${category.name}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          ${cardsHtml}
        </div>
      </section>
    `;
  });

  container.innerHTML = fullHtml;

  // -------------------
  // Click handler: redirect to search
  // -------------------
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".rec-card");
    if (!card) return;

    const query = card.dataset.title;
    if (query) {
      window.location.href = `/?search=${encodeURIComponent(query)}`;
    }
  });
});
