# Library REST API Specification

Base URL: `https://api.librarysystem.com/v1`

---

## Endpoints

### 1. List All Books
* **Method:** `GET`
* **Path:** `/books`
* **Description:** Retrieves a paginated list of all books in the library catalog.
* **Success Status Code:** `200 OK`

### 2. List Books by Author (Query Parameter)
* **Method:** `GET`
* **Path:** `/books?author=Jane+Austen`
* **Description:** Retrieves a filtered list of books written by a specific author.
* **Success Status Code:** `200 OK`

### 3. Get a Single Book
* **Method:** `GET`
* **Path:** `/books/{id}`
* **Description:** Retrieves detailed information for a specific book by its unique ID.
* **Success Status Code:** `200 OK`

### 4. Create a Book
* **Method:** `POST`
* **Path:** `/books`
* **Description:** Adds a new book record to the library catalog.
* **Example Request Body:**