// Select DOM Elements
const loadBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusEl = document.getElementById("status");
const usersList = document.getElementById("users-list");

// Store fetched users globally in memory
let allUsers = [];

// Function: Render users list using createElement and textContent
function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    statusEl.textContent = "No users match your filter.";
    return;
  }

  list.forEach(user => {
    const li = document.createElement("li");
    li.className = "user-item";

    const nameHeading = document.createElement("h3");
    nameHeading.textContent = user.name;

    const emailPara = document.createElement("p");
    emailPara.textContent = `Email: ${user.email}`;

    const cityPara = document.createElement("p");
    cityPara.textContent = `City: ${user.address.city}`;

    const companyPara = document.createElement("p");
    companyPara.textContent = `Company: ${user.company.name}`;

    li.appendChild(nameHeading);
    li.appendChild(emailPara);
    li.appendChild(cityPara);
    li.appendChild(companyPara);

    usersList.appendChild(li);
  });
}

// Function: Async fetch users with status handling
async function loadUsers() {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading users...";
  usersList.innerHTML = "";
  filterInput.value = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allUsers = await response.json();
    renderUsers(allUsers);
    statusEl.textContent = `Successfully loaded ${allUsers.length} users.`;
  } catch (error) {
    console.error("Failed to load users:", error);
    statusEl.textContent = `Failed to load users. Error: ${error.message}`;
  } finally {
    loadBtn.disabled = false;
  }
}

// Event Listener: Filter users in memory without making new requests
filterInput.addEventListener("input", () => {
  const query = filterInput.value.toLowerCase().trim();
  const filtered = allUsers.filter(user => user.name.toLowerCase().includes(query));
  
  renderUsers(filtered);

  if (filtered.length > 0 && allUsers.length > 0) {
    statusEl.textContent = `Showing ${filtered.length} of ${allUsers.length} users.`;
  }
});

// Event Listener: Load button click
loadBtn.addEventListener("click", loadUsers);