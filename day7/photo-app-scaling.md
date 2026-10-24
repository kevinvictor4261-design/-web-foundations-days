# SnapShare System Scaling Plan

## 1. Assumptions & Daily Active Users (DAU)
* **Total Registered Users:** 10,000,000
* **Activity Rate:** 10% active per day
* **Daily Active Users (DAU):** $10,000,000 \times 0.10 = \mathbf{1,000,000\text{ users/day}}$
* **User Actions:** Each active user uploads 1 photo per day and views 50 feed pages per day.
* **File Sizes:** Average photo = $2\text{ MB}$; Thumbnail = $50\text{ KB}$ ($0.05\text{ MB}$).

---

## 2. Traffic & Storage Calculations
* **Uploads per Second (Writes):**
  $$\frac{1,000,000\text{ uploads}}{86,400\text{ seconds}} \approx \mathbf{11.6\text{ writes/sec}}$$
* **Feed Views per Second (Reads):**
  * Average: $\frac{1,000,000\text{ users} \times 50\text{ views}}{86,400\text{ seconds}} \approx \mathbf{578.7\text{ reads/sec}}$
  * Peak ($5\times$ multiplier): $578.7 \times 5 \approx \mathbf{2,894\text{ reads/sec}}$
* **Storage per Year:**
  * Daily photo storage: $1,000,000 \times (2\text{ MB} + 0.05\text{ MB}) = 2,050,000\text{ MB/day} = 2.05\text{ TB/day}$
  * Annual storage: $2.05\text{ TB/day} \times 365\text{ days} = \mathbf{748.25\text{ TB/year}}$

---

## 3. Traffic Profile: Read-Heavy System
SnapShare is **heavily read-heavy** (~2,894 peak read requests/sec vs. ~12 write requests/sec). 
* **Design Implication:** The architecture must prioritize scaling read paths. We will rely heavily on Content Delivery Networks (CDNs), database read replicas, and caching layers to serve feed requests instantly without overwhelming the primary database.

---

## 4. Why Photos Do Not Belong in the Database
Relational databases are optimized for structured tabular data, fast querying, and ACID transactions—not for storing large binary blobs (megabytes of image data). Storing raw images directly in a database would bloat database file sizes, drastically slow down backup/restore times, consume expensive RAM cache for binary data instead of indexes, and make horizontal scaling extremely difficult. 
* **Alternative:** Photos are stored in **Cloud Object Storage** (e.g., AWS S3), while only lightweight metadata (image URLs, user IDs, captions, timestamps) is stored in the relational database.

---

## 5. Architecture Diagram text
[ Clients / Mobile Apps ]
│
▼
[ CDN (Cloudflare) ] ──(Cached Images/Thumbnails)
│
▼
[ Load Balancer (Nginx) ]
│
┌───────┴───────┐
▼               ▼
[ App Server 1 ] [ App Server 2 ] ──(Cache: Redis)
│                       │
├───────────────────────┼─────────────┐
▼                       ▼             ▼
[ Primary DB ]       [ Read Replica ]  [ Object Storage (S3) ]
(Writes/Updates)       (Read Feeds)    (Raw Photos & Thumbnails)
│
▼
[ Message Queue (RabbitMQ / SQS) ]
│
▼
[ Thumbnail Worker ] ──> (Generates & saves 50KB thumbnail to S3)


---

## 6. Component Explanations
* **CDN (Content Delivery Network):** Caches and serves static media files (photos and thumbnails) globally from edge locations closest to the user, offloading bandwidth from backend servers.
* **Load Balancer:** Distributes incoming client HTTP traffic evenly across multiple application servers to prevent single-server bottlenecks and ensure high availability.
* **App Servers:** Stateless servers that handle incoming API requests, authenticate users, execute business logic, and construct user feeds.
* **Cache (Redis):** In-memory data store used to cache frequent queries and pre-computed user feeds to accelerate read response times.
* **Primary Database:** Handles all write operations, user registrations, relationship graphs, and metadata updates with full transactional integrity.
* **Read Replica:** A synchronized read-only copy of the primary database that absorbs high-volume feed and profile query traffic.
* **Object Storage (S3):** Scalable, durable cloud storage engineered to house high-resolution raw photo binaries and generated thumbnails.
* **Message Queue:** Asynchronous buffer that decouples slow background tasks (like image processing) from the main user request thread.
* **Thumbnail Worker:** Background service that picks jobs off the queue, resizes uploaded images into 50 KB thumbnails, and uploads them to object storage.

---

## 7. Step-by-Step Upload Flow
1. **Client Request:** The user selects a photo on their mobile app and clicks upload. The app sends an HTTP `POST` request with the image file and metadata to the Load Balancer.
2. **Routing:** The Load Balancer forwards the request to an available Application Server.
3. **Object Storage Upload:** The App Server immediately uploads the raw binary photo file to Object Storage (S3), receiving back a permanent secure image URL.
4. **Metadata Persistence:** The App Server saves the metadata (user ID, caption, and S3 photo URL) into the Primary Database.
5. **Queue Job Dispatch:** The App Server pushes a background job payload (containing the photo reference ID and S3 path) into the Message Queue and returns a `201 Created` success response to the client.
6. **Asynchronous Processing:** A Thumbnail Worker picks up the job from the queue, downloads the raw image from S3, generates a 50 KB thumbnail version, uploads the thumbnail back to S3, and updates the database record with the thumbnail URL.

---

## 8. Architectural Trade-offs
* **Trade-off 1: Asynchronous Thumbnail Processing vs. Instant Availability**
  * *Decision:* We process thumbnails asynchronously via a queue.
  * *Pro:* The upload API responds instantly to the user without making them wait for image resizing.
  * *Con:* Newly uploaded photos might briefly display a placeholder or raw image before the thumbnail worker finishes processing.
* **Trade-off 2: Database Read Replicas vs. Replication Lag**
  * *Decision:* We route read-heavy feed queries to Database Read Replicas.
  * *Pro:* Dramatically scales read capacity to handle ~2,894 requests/sec without overloading the primary database.
  * *Con:* Introduces eventual consistency—a user who updates their profile
