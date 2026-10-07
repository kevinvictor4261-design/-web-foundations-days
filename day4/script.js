// Select DOM Elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Function: Update Counters & Warning Classes
function updateCounts() {
  const text = noteText.value;
  const numChars = text.length;

  // Calculate Word Count (trim whitespace, split by spaces/newlines, filter out empty strings)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const numWords = words.length;

  // Update Display Text
  charCount.textContent = `${numChars} / 200 characters`;
  wordCount.textContent = `${numWords} ${numWords === 1 ? 'word' : 'words'}`;

  // Reset Warning Classes
  charCount.classList.remove("warning", "over");

  // Apply Warning Classes
  if (numChars > 200) {
    charCount.classList.add("over");
  } else if (numChars > 180) {
    charCount.classList.add("warning");
  }
}

// Function: Clear Textarea, Reset Counters, and Delete Draft
function clearNote() {
  noteText.value = "";
  localStorage.removeItem("noteDraft");
  updateCounts();
}

// Function: Toggle Dark Mode & Persist Theme Selection
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  if (isDark) {
    themeToggle.textContent = "Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Dark mode";
    localStorage.setItem("theme", "light");
  }
}

// Function: Restore Initial Saved State on Page Load
function init() {
  // Restore Theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }

  // Restore Draft Text
  const savedDraft = localStorage.getItem("noteDraft");
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  // Calculate initial counts for restored draft
  updateCounts();
}

// Event Listeners
// 1. Textarea Input: Update counts and save draft on every character typed
noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("noteDraft", noteText.value);
});

// 2. Clear Button Click
clearBtn.addEventListener("click", clearNote);

// 3. Escape Key Press inside Textarea
noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

// 4. Theme Toggle Button Click
themeToggle.addEventListener("click", toggleTheme);

// Initialize App
init();