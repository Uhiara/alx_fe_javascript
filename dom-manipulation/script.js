// script.js

// 1. Define the initial array of quote objects
const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Inspiration",
  },
  {
    text: "If you want to achieve greatness stop asking for permission.",
    category: "Motivation",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    category: "Inspiration",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    category: "Life",
  },
  {
    text: "The best way to predict the future is to create it.",
    category: "Motivation",
  },
];

// 2. Get the quote display container and the button
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// 3. Define function to display a random quote
function displayRandomQuote() {
  // Generate a random index based on the length of the quotes array
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // clear the previous content in the quote display container
  quoteDisplay.innerHTML = "";

  // Create the elements (DOM Manipulation: createElement)
  const quoteText = document.createElement("p");
  const quoteCateory = document.createElement("h3");

  // Set the text content of the elements
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteCateory.textContent = `Category: ${randomQuote.category}`;

  // Append the elements to the quote display container (DOM Manipulation: appendChild)
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCateory);
}

// 4. Add event listener to the button to display a new quote on click
newQuoteButton.addEventListener("click", displayRandomQuote);

// 5. Display an initial quote when the page loads
displayRandomQuote();

// 6. Get new elements for the quote form
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const addQuoteButton = document.getElementById("addQuoteButton");

// 7. Define the function to add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  // Validate input
  if (text === "" || category === "") {
    alert("Please enter both quote text and author.");
    return;
  }
  // Create a new quote object
  const newQuote = {
    text: text,
    category: category,
  };
  // Add the new quote to the quotes array
  quotes.push(newQuote);

  // Clear the input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Optional: Show the newly added quote immediately
  alert(`Quote added successfully! (${quotes.length} total quotes now.)`);
  showRandomQuote();
}

// 8. Add event listener to the add quote button
addQuoteButton.addEventListener("click", addQuote);
