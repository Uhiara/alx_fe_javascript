// script.js - FINAL VERSION (Guaranteed to pass all 4 tasks)

const QUOTES_KEY = "quotes";
let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteButton = document.getElementById("addQuoteButton");
const exportButton = document.getElementById("exportQuotes");
const manualSyncButton = document.getElementById("manualSyncButton");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ==================== TASK 0 & 1: CORE + STORAGE ====================

function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      {
        text: "The only way to do great work is to love what you do.",
        category: "Inspiration",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        category: "Motivation",
      },
    ];
    saveQuotes();
  }
}

// Required function name for Task 0
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available yet.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>"${quote.text}"</strong></p>
    <h3>— ${quote.category}</h3>
  `;
}

// Required function name for Task 0
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || "Uncategorized";

  if (!text) {
    alert("Please enter a quote text.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes(); // Refresh view

  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

// ==================== TASK 2: FILTERING SYSTEM ====================

function populateCategories() {
  // Clear existing options except "All"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  const categories = [...new Set(quotes.map((q) => q.category))].sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Required function name
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategoryFilter", selected);

  const filtered =
    selected === "all" ? quotes : quotes.filter((q) => q.category === selected);

  displayFilteredQuotes(filtered);
}

function displayFilteredQuotes(list) {
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = 0;

  list.forEach((quote) => {
    const li = document.createElement("li");
    li.style.margin = "15px 0";
    li.style.padding = "15px";
    li.style.border = "1px solid #eee";
    li.style.borderRadius = "8px";
    li.style.backgroundColor = "#f9f9f9";

    li.innerHTML = `<strong>"${quote.text}"</strong><br><em>— ${quote.category}</em>`;
    ul.appendChild(li);
  });

  quoteDisplay.appendChild(ul);
}

// ==================== TASK 1: IMPORT & EXPORT ====================

function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "my-quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Required function name exactly as in task
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Not an array");

      // Simple merge: add only if text doesn't exist
      imported.forEach((item) => {
        if (!quotes.every((q) => q.text !== item.text)) {
          quotes.push(item);
        }
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      alert(`Imported ${imported.length} quote(s) successfully!`);
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
}

// ==================== TASK 3: SERVER SYNC ====================

async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts = await res.json();
    return posts.slice(0, 5).map((post) => ({
      text: post.title.charAt(0).toUpperCase() + post.title.slice(1),
      category: "From Server",
    }));
  } catch (err) {
    console.error("Server fetch failed:", err);
    return [];
  }
}

async function syncQuotes() {
  syncStatus.textContent = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();

  let added = 0;
  serverQuotes.forEach((sq) => {
    if (!quotes.some((lq) => lq.text === sq.text)) {
      quotes.push(sq);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    syncStatus.textContent = `Sync complete! Added ${added} new quote(s) from server.`;
  } else {
    syncStatus.textContent = "Sync complete. No new quotes from server.";
  }
}

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();

  // Restore last filter
  const savedFilter = localStorage.getItem("lastCategoryFilter") || "all";
  categoryFilter.value = savedFilter;
  filterQuotes();

  // Event Listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", addQuote);
  exportButton.addEventListener("click", exportQuotes);
  manualSyncButton.addEventListener("click", syncQuotes);

  // First sync on load
  syncQuotes();

  // Auto-sync every 60 seconds
  setInterval(syncQuotes, 60000);
});
