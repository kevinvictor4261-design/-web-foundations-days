# School Database Design Specification

## Table Explanations
* **`students`**: Stores personal and contact information for each student enrolled in the institution. Each student has a unique ID and a unique email address.
* **`courses`**: Stores catalog information for available classes, including course titles and unique course codes.
* **`enrolments`**: Acts as a join table linking students to courses while tracking the academic grade earned by the student in that specific course.

---

## Relationships & The Join Table
* **Relationships:** 
  * `students` to `enrolments` is a **one-to-many** relationship (one student can have multiple enrolments).
  * `courses` to `enrolments` is a **one-to-many** relationship (one course can have multiple enrolments).
  * `students` and `courses` share a **many-to-many relationship** (one student takes many courses, and one course has many students).
* **Why a Join Table is Needed:** Relational databases cannot natively store multi-valued arrays in a single column while maintaining normal form (First Normal Form). The `enrolments` join table bridges this gap by breaking the many-to-many relationship into two manageable one-to-many relationships, while also holding relational attributes specific to the connection (such as the `grade`).

---

## Database Indexing
* **Recommended Index:** An index on `enrolments(student_id)` and `enrolments(course_id)`.
* **Reason:** Foreign key columns in join tables are frequently searched and filtered during `JOIN` operations. Indexing these columns accelerates database lookups when querying a student's schedule or a course's roster, avoiding full table scans as the dataset grows.

---

## SQL vs. NoSQL Architecture Decision
For a school management and student enrollment system, **SQL (Relational Database)** is the correct choice. Educational systems rely heavily on strict data integrity, foreign key constraints, ACID compliance, and complex relational queries (such as tracking student grades, prerequisites, and multi-table joins). A relational database guarantees that orphan records cannot exist and enforces rules like preventing duplicate enrolments or invalid student references, which are critical requirements for academic record-keeping.