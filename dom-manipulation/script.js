// script.js

// --- Initial Setup and Data Keys ---
const QUOTES_KEY = "quotes";
let quotes = []; // The main array that holds all quote objects.

// --- DOM Element References ---
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteButton = document.getElementById("addQuoteButton");
const exportButton = document.getElementById("exportQuotes");
const manualSyncButton = document.getElementById("manualSyncButton");

const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ==========================================================
// TASK 1: LOCAL STORAGE & JSON PERSISTENCE
// ==========================================================

// Saves the current state of the quotes array to Local Storage
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// Loads quotes from Local Storage or uses a default set
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
// TASK 0: DOM MANIPULATION & ADD QUOTE
// ==========================================================

// Adds a new quote from the input fields
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both the quote text and category.");
    return;
  }

  const newQuote = { text: text, category: category };
  quotes.push(newQuote);

  saveQuotes();
  populateCategories(); // Task 2: Update the filter dropdown
  filterQuotes(); // Task 2: Refresh the displayed list

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert(`Quote added successfully! (${quotes.length} total quotes now.)`);
}

// Displays a single random quote (used by the 'Show Random Quote' button)
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
// TASK 2: DYNAMIC FILTERING
// ==========================================================

// Extracts unique categories and populates the filter dropdown
function populateCategories() {
  const categories = new Set();
  quotes.forEach((quote) => {
    categories.add(quote.category);
  });

  // Clear existing dynamic options (keep the default 'All Categories' at index 0)
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

// Filters quotes based on selected category and updates the display
function filterQuotes() {
  const selectedCategory = categoryFilter.value;

  // Save the filter choice (Task 2 persistence)
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

// Displays ALL quotes in the given array (used by filterQuotes)
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
// TASK 1: JSON IMPORT/EXPORT
// ==========================================================

// Exports the current quotes array to a downloadable JSON file
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

// Imports quotes from a user-uploaded JSON file
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
      populateCategories(); // Update filters after import
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
// TASK 3: SERVER SYNC & CONFLICT RESOLUTION
// ==========================================================

// Simulates fetching mock data from a server API
async function fetchServerQuotes() {
  try {
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

// Syncs local data with server data and resolves conflicts
async function syncQuotes() {
  syncStatus.textContent = "Syncing data with server...";

  const serverQuotes = await fetchServerQuotes();

  if (serverQuotes.length === 0) {
    syncStatus.textContent = "Sync complete. No new server data.";
    return;
  }

  let mergedQuotes = [...quotes];
  let conflictCount = 0;

  // Server data takes precedence if text is unique (simple resolution)
  serverQuotes.forEach((sQuote) => {
    // Check if a quote with the EXACT same text already exists locally
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
  // 1. Load data from Local Storage (Task 1)
  loadQuotes();

  // 2. Populate categories and restore filter (Task 2)
  populateCategories();
  const lastFilter = localStorage.getItem("lastCategoryFilter");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
  filterQuotes();

  // 3. Attach main interaction events
  newQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", addQuote);
  exportButton.addEventListener("click", exportQuotes);
  manualSyncButton.addEventListener("click", syncQuotes);

  // 4. Run initial sync after everything is set up (Task 3)
  syncQuotes();

  // 5. Setup periodic sync every 60 seconds (Task 3)
  setInterval(syncQuotes, 60000);
});

// Note: The import function is attached via 'onchange' in the HTML.
