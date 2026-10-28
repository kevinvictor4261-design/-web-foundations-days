Markdown
# TicketHub Event Ticketing System Design

## 1. Requirements

### Functional Requirements
* Users can browse and search upcoming concerts and events.
* Users can view interactive seating charts and real-time seat availability.
* Users can temporarily hold selected seats during checkout (e.g., 10-minute hold).
* Users can securely process payments and complete ticket purchases.
* Users can view their purchased tickets and order history.

### Non-Functional Requirements
* **Speed:** Event pages and seat maps must load in under 200ms.
* **Correctness & Zero Double-Booking:** Under no circumstances can two users successfully purchase the same seat.
* **Fairness & Availability:** High-demand flash sales must remain accessible and stable under massive traffic spikes without crashing.

---

## 2. Traffic & Load Estimates

### Normal Day Traffic
* **Registered Users:** 2,000,000
* **Daily Visitors (DAU):** 50,000 visitors/day
* **Page Views:** $50,000 \times 10 = 500,000\text{ page views/day}$
* **Read RPS (Average):** $\frac{500,000}{86,400\text{ sec}} \approx \mathbf{5.8\text{ reads/sec}}$
* **Ticket Sales (Writes):** 5,000 tickets sold/day $\rightarrow \frac{5,000}{86,400} \approx \mathbf{0.058\text{ writes/sec}}$

### Big Sale Peak (Popular Concert Flash Sale)
* **Spike Load:** 200,000 users attempting to buy 20,000 seats within the first 10 minutes ($600\text{ seconds}$).
* **Peak Write Surge (Checkouts):** $\frac{20,000\text{ tickets}}{600\text{ sec}} \approx \mathbf{33.3\text{ checkouts/sec}}$ (with peak burst traffic hitting thousands of concurrent seat reservation requests per second).
* **Comparison:** The flash sale generates a write and read surge hundreds of times higher than normal daily operations, requiring specialized traffic throttling (virtual waiting rooms) and distributed locking mechanisms.

---

## 3. REST API Specification

Base URL: `https://api.tickethub.com/v1`

### 1. List Events
* **Method:** `GET`
* **Path:** `/events`
* **Description:** Retrieves a list of upcoming concerts and events.
* **Success Status Code:** `200 OK`

### 2. View Seat Availability
* **Method:** `GET`
* **Path:** `/events/{id}/seats`
* **Description:** Retrieves the real-time status of all seats for a specific event.
* **Success Status Code:** `200 OK`

### 3. Temporarily Hold Seats
* **Method:** `POST`
* **Path:** `/seats/hold`
* **Description:** Temporarily locks selected seats for a user during the checkout window.
* **Example Request Body:**
json
{
"eventId": 102,
"userId": 4512,
"seatIds": [12, 13]
}

* **Success Status Code:** `200 OK`

### 4. Process Payment & Create Order
* **Method:** `POST`
* **Path:** `/orders`
* **Description:** Processes payment and finalizes ticket booking for held seats.
* **Success Status Code:** `201 Created`

### 5. View User Tickets
* **Method:** `GET`
* **Path:** `/users/{id}/tickets`
* **Description:** Retrieves all active tickets owned by an authenticated user.
* **Success Status Code:** `200 OK`

---

## 4. Data Model & Schema

### Tables
1. **`users`**: Stores user account credentials (`id`, `username`, `email`, `password_hash`, `created_at`).
2. **`events`**: Stores concert details (`id`, `title`, `artist`, `venue`, `event_date`, `total_seats`, `created_at`).
3. **`seats`**: Stores individual seat records (`id`, `event_id`, `seat_number`, `status` [available, held, booked], `version`).
4. **`orders`**: Stores transaction records (`id`, `user_id`, `event_id`, `total_amount`, `status` [pending, completed, cancelled], `created_at`).

### Relationships
* `users` to `orders` is **One-to-Many** (one user can place multiple orders).
* `events` to `seats` is **One-to-Many** (one event has many seats).
* `events` to `orders` is **One-to-Many** (one event has many orders).

---

## 5. Preventing Double-Booking (Concurrency Control)
To ensure two users can never buy the same seat during high-concurrency flash sales, TicketHub employs a **Two-Layer Concurrency Strategy**:

1. **Distributed Locks (Redis TTL):** When a user selects seats, a Redis atomic key (`seat:lock:{seat_id}`) is created with a 10-minute Time-To-Live (TTL). If another user attempts to select that same seat, the Redis check immediately rejects the request before hitting the database.
2. **Database Optimistic Locking & ACID Transactions:** When the user completes payment (`POST /orders`), the database executes an atomic SQL update with a version check or state validation:
sql
UPDATE seats
SET status = 'booked', version = version + 1
WHERE id = 12 and status = 'held';

If zero rows are updated (because another concurrent transaction grabbed or expired the seat), the database transaction rolls back immediately, preventing double-booking and notifying the user.

---

## 6. Architecture Diagram & Flash Sale Survival

text
[ Clients / Mobile & Web Apps ]
│
▼
[ CDN (Cloudflare) ]
│
▼
[ Virtual Waiting Room (Redis / Queue) ]  <-- (Throttles 200k users into manageable batches)
│
▼
[ Load Balancer (Nginx / ALB) ]
│
┌───────┴───────┐
▼               ▼
[ App Server 1 ] [ App Server 2 ] ──(Cache & Distributed Locks: Redis)
│                       │
├───────────────────────┼─────────────┐
▼                       ▼             ▼
[ Primary DB ]       [ Read Replica ]  [ Payment Gateway Integration ]
(Transactional Writes) (Browse Events)


### Surviving the Big Sale
During a flash sale spike of 200,000 users, direct traffic would instantly overwhelm application servers and database connections. TicketHub uses a **Virtual Waiting Room** queue at the edge. When a popular concert goes on sale, incoming users are placed into a fair-access FIFO (First-In, First-Out) queue and released into the checkout funnel in controlled batches (e.g., 2,000 users at a time). This protects backend app servers and databases from connection exhaustion.

---

## 7. Architectural Trade-offs
* **Trade-off 1: Virtual Waiting Room vs. Direct Access**
  * *Pro:* Protects infrastructure from crashing and ensures fairness during high-demand flash sales.
  * *Con:* Adds friction and wait times for legitimate fans who want immediate access.
* **Trade-off 2: Strict Synchronous Database Transactions vs. Eventual Consistency**
  * *Pro:* Guarantees absolute correctness and prevents overselling tickets.
  * *Con:* Introduces database row contention and slight checkout latency under extreme concu