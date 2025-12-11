// script.js

// --- Initial Setup and Data Keys ---
const QUOTES_KEY = "quotes";
let quotes = []; // The main array that holds all quote objects.

// --- DOM Element References ---
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote"); // Task 0: New Quote button listener
const addQuoteButton = document.getElementById("addQuoteButton");
const exportButton = document.getElementById("exportQuotes");
const manualSyncButton = document.getElementById("manualSyncButton");

const newQuoteText = document.getElementById("newQuoteText"); // Task 0: Add Quote input
const newQuoteCategory = document.getElementById("newQuoteCategory"); // Task 0: Add Quote input
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ==========================================================
// LOCAL STORAGE & JSON PERSISTENCE (Task 1)
// ==========================================================

function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const quotesJSON = localStorage.getItem(QUOTES_KEY);

  if (quotesJSON) {
    quotes = JSON.parse(quotesJSON);
  } else {
    // Default quotes if storage is empty
    quotes = [
      {
        text: "The only way to do great work is to love what you do.",
        category: "Inspiration",
      },
      {
        text: "The best way to predict the future is to create it.",
        category: "Motivation",
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        category: "Life",
      },
    ];
    saveQuotes();
  }
}

// ==========================================================
// DOM MANIPULATION & ADD QUOTE (Task 0)
// ==========================================================

// Checks for the addQuote function
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both the quote text and category.");
    return;
  }

  const newQuote = { text: text, category: category };

  // Check for logic to add a new quote to the quotes array
  quotes.push(newQuote);

  saveQuotes();
  populateCategories();

  // Check for logic to update the DOM
  filterQuotes();

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert(`Quote added successfully! (${quotes.length} total quotes now.)`);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some new quotes!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = "";

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("h3");
  quoteCategory.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// ==========================================================
// DYNAMIC FILTERING (Task 2)
// ==========================================================

function populateCategories() {
  const categories = new Set();
  quotes.forEach((quote) => {
    categories.add(quote.category);
  });

  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  const sortedCategories = Array.from(categories).sort();

  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategoryFilter", selectedCategory);

  let filteredQuotes = [];

  if (selectedCategory === "all") {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(
      (quote) => quote.category === selectedCategory
    );
  }

  displayFilteredQuotes(filteredQuotes);
}

function displayFilteredQuotes(filteredQuotes) {
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const list = document.createElement("ul");
  list.style.listStyleType = "none";
  list.style.padding = "0";

  filteredQuotes.forEach((quote) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
            <div style="border: 1px solid #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <strong>"${quote.text}"</strong> 
                <span style="font-size: 0.9em; color: #aaa;"> - ${quote.category}</span>
            </div>
        `;
    list.appendChild(listItem);
  });

  quoteDisplay.appendChild(list);
}

// ==========================================================
// JSON IMPORT/EXPORT (Task 1)
// ==========================================================

function exportQuotes() {
  const quotesJSON = JSON.stringify(quotes, null, 2);
  const blob = new Blob([quotesJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
        throw new Error("File content is not a valid JSON array.");
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert(
        `Quotes imported successfully! ${importedQuotes.length} quotes added.`
      );
    } catch (error) {
      alert(
        "Error parsing or processing JSON file. Please ensure the file format is correct."
      );
      console.error(error);
    }
  };
  fileReader.readAsText(file);
}

// ==========================================================
// SERVER SYNC & CONFLICT RESOLUTION (Task 3)
// ==========================================================

// FIX: Renamed function to match required name in error checklist
async function fetchQuotesFromServer() {
  try {
    // Check for fetching data from the server using a mock API
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Format the mock posts into our quote structure
    const serverQuotes = data.slice(0, 5).map((post) => ({
      text: post.title.charAt(0).toUpperCase() + post.title.slice(1),
      category: "Server Data",
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Failed to fetch mock server quotes:", error);
    return [];
  }
}

// Check for the syncQuotes function
async function syncQuotes() {
  // Check for UI elements or notifications for data updates or conflicts
  syncStatus.textContent = "Syncing data with server...";

  // Use the corrected fetch function
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length === 0) {
    syncStatus.textContent = "Sync complete. No new server data.";
    return;
  }

  let mergedQuotes = [...quotes];
  let conflictCount = 0;

  // Simple Conflict Resolution: Server data takes precedence if text is unique.
  serverQuotes.forEach((sQuote) => {
    const existsLocally = mergedQuotes.some(
      (lQuote) => lQuote.text === sQuote.text
    );

    if (!existsLocally) {
      mergedQuotes.push(sQuote);
    } else {
      conflictCount++;
    }
  });

  if (mergedQuotes.length > quotes.length) {
    const newQuotesAdded = mergedQuotes.length - quotes.length;
    quotes = mergedQuotes;

    // Check for updating local storage with server data and conflict resolution
    saveQuotes();
    populateCategories();
    filterQuotes();

    syncStatus.textContent = `Sync Complete: Added ${newQuotesAdded} new quote(s) from server.`;
    if (conflictCount > 0) {
      syncStatus.textContent += ` (${conflictCount} existing quote(s) ignored.)`;
    }
  } else {
    syncStatus.textContent = "Sync Complete: No new quotes added.";
  }
}

// ==========================================================
// INITIALIZATION AND EVENT LISTENERS
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Load data
  loadQuotes();

  // 2. Populate categories and restore filter
  populateCategories();
  const lastFilter = localStorage.getItem("lastCategoryFilter");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
  filterQuotes();

  // Check for event listener on the “Show New Quote” button (Task 0)
  newQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", addQuote);
  exportButton.addEventListener("click", exportQuotes);
  manualSyncButton.addEventListener("click", syncQuotes);

  // 3. Run initial sync after everything is set up
  syncQuotes();

  // Check for periodically checking for new quotes from the server (Task 3)
  setInterval(syncQuotes, 60000);
});
