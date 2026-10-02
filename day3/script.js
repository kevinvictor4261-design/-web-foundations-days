// Starting Data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" }
];

// 1. searchNotes(word)
function searchNotes(word) {
  if (!word) return [];
  const lowerWord = word.toLowerCase();
  return notes.filter(note => note.text.toLowerCase().includes(lowerWord));
}

// 2. longestNote()
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) => {
    return current.text.length > longest.text.length ? current : longest;
  }, notes[0]);
}

// 3. countByCategory()
function countByCategory() {
  const counts = {};
  notes.forEach(note => {
    const cat = note.category;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

// 4. getSummary()
function getSummary() {
  const total = notes.length;
  if (total === 0) return "0 notes.";

  const noteLabel = total === 1 ? "note" : "notes";
  const counts = countByCategory();

  const categoryParts = Object.entries(counts).map(([cat, count]) => `${count} ${cat}`);
  return `${total} ${noteLabel}: ${categoryParts.join(", ")}.`;
}

// 5. isDuplicate(text)
function isDuplicate(text) {
  if (typeof text !== "string") return false;
  const cleanText = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === cleanText);
}

// 6. addNote(text, category)
function addNote(text, category) {
  const allowedCategories = ["personal", "work", "study"];

  if (typeof text !== "string") {
    console.log("Failed to add note: Text must be a valid string.");
    return false;
  }

  const trimmedText = text.trim();

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Failed to add note: Length must be between 1 and 200 characters.");
    return false;
  }

  if (!allowedCategories.includes(category)) {
    console.log(`Failed to add note: Category must be one of (${allowedCategories.join(", ")}).`);
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Failed to add note: Duplicate note text detected.");
    return false;
  }

  const nextId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  notes.push({
    id: nextId,
    text: trimmedText,
    category: category
  });

  return true;
}

// ==========================================
// TESTING AND CONSOLE LOGS
// ==========================================

console.log("--- 1. searchNotes ---");
console.log("Search 'report':", searchNotes("report"));
// Expected output: [{ id: 3, text: "Email the project report to Grace", category: "work" }]

console.log("Search 'python' (no matches):", searchNotes("python"));
// Expected output: []


console.log("--- 2. longestNote ---");
console.log("Longest note:", longestNote());
// Expected output: { id: 3, text: "Email the project report to Grace", category: "work" }

// Edge case test for empty array
const savedNotes = [...notes];
notes = [];
console.log("Longest note (empty list):", longestNote());
// Expected output: null
notes = [...savedNotes]; // restore data


console.log("--- 3. countByCategory ---");
console.log("Category counts:", countByCategory());
// Expected output: { personal: 2, study: 2, work: 1 }

notes = [];
console.log("Category counts (empty list):", countByCategory());
// Expected output: {}
notes = [...savedNotes]; // restore data


console.log("--- 4. getSummary ---");
console.log("Summary:", getSummary());
// Expected output: "5 notes: 2 personal, 2 study, 1 work."

notes = [{ id: 1, text: "Solo note", category: "personal" }];
console.log("Summary (1 note):", getSummary());
// Expected output: "1 note: 1 personal."
notes = [...savedNotes]; // restore data


console.log("--- 5. isDuplicate ---");
console.log("Is duplicate ('Call mum'):", isDuplicate("Call mum"));
// Expected output: true

console.log("Is duplicate ('  buy MILK and BREAD   '):", isDuplicate("  buy MILK and BREAD   "));
// Expected output: true

console.log("Is duplicate ('Plan weekend trip'):", isDuplicate("Plan weekend trip"));
// Expected output: false


console.log("--- 6. addNote ---");
console.log("Add valid note:", addNote("Schedule dentist appointment", "personal"));
// Expected output: true

console.log("Add duplicate note:", addNote("Call mum", "personal"));
// Expected output: false (Logs: "Failed to add note: Duplicate note text detected.")

console.log("Add invalid category:", addNote("Read a book", "leisure"));
// Expected output: false (Logs: "Failed to add note: Category must be one of (personal, work, study).")

console.log("Add empty note:", addNote("   ", "work"));
// Expected output: false (Logs: "Failed to add note: Length must be between 1 and 200 characters.")