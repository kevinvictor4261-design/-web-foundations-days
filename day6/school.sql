-- ==========================================
-- 1. CREATE TABLES
-- ==========================================

-- Students table
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Courses table
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

-- Enrolments junction table (Many-to-Many relationship)
CREATE TABLE enrolments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (student_id, course_id) -- Prevents duplicate enrolments for the same course
);


-- ==========================================
-- 2. INSERT SAMPLE DATA
-- ==========================================

-- Insert Students (at least 3 + 1 extra without enrolments for testing left join)
INSERT INTO students (name, email) VALUES 
  ('Alice Smith', 'alice@example.com'),
  ('Bob Jones', 'bob@example.com'),
  ('Charlie Brown', 'charlie@example.com'),
  ('Diana Prince', 'diana@example.com'); -- Has no enrolments

-- Insert Courses (at least 3)
INSERT INTO courses (title, code) VALUES 
  ('Web Development', 'CS101'),
  ('Database Systems', 'CS102'),
  ('Python Programming', 'CS103');

-- Insert Enrolments (at least 5 linking students to courses)
INSERT INTO enrolments (student_id, course_id, grade) VALUES 
  (1, 1, 'A'),   -- Alice in Web Dev
  (1, 2, 'B+'),  -- Alice in Databases
  (2, 1, 'A-'),  -- Bob in Web Dev
  (2, 3, 'B'),   -- Bob in Python
  (3, 2, 'A');   -- Charlie in Databases


-- ==========================================
-- 3. FIVE REQUIRED QUERIES
-- ==========================================

-- Query 1: All courses for one student (by name, e.g., 'Alice Smith')
SELECT 
  s.name AS student_name,
  c.title AS course_title,
  c.code AS course_code,
  e.grade
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE s.name = 'Alice Smith';


-- Query 2: All students on one course (e.g., 'Web Development')
SELECT 
  c.title AS course_title,
  s.name AS student_name,
  s.email,
  e.grade
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON s.id = e.student_id
WHERE c.title = 'Web Development';


-- Query 3: The number of students per course
SELECT 
  c.title AS course_title,
  c.code,
  COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id, c.title, c.code;


-- Query 4: Students who have no enrolments (using LEFT JOIN)
SELECT 
  s.id,
  s.name,
  s.email
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.id IS NULL;


-- Query 5: Update one enrolment's grade (e.g., update Alice's grade in Web Dev to 'A+')
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1 AND course_id = 1;