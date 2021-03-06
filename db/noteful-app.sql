-- 1. I started the server 
-- 2. I created the database
-- 3. I created this sql file
-- 4. Connected the db to this file by running psql -U dev -d noteful-app -f /Users/nikkiemashian/Documents/Thinkful/Week-4/Wednesday/many-to-many/nikkie-noteful-v2/db/noteful-app.sql
-- Now I can write the commands here and executing them on the command line!

-- All this does is populate the databse - we initilize it here 

-- this only gets run if we run the above command and we mainly using it for testing
SELECT CURRENT_DATE;

DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;
-- we run the above so that if the table exists we can delete it and make it again if we're running our commands multiple times 

-- create a table of folders and populate it 

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

-- Create a table: 
CREATE TABLE notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created timestamp DEFAULT now(),
  folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

CREATE TABLE tags (
  id serial PRIMARY KEY,
  name text NOT NULL 
);

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);


-- Bonus: make the id's start from 1000
-- ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

INSERT into tags (name) VALUES
('cute'),
('ugly'),
('smart');

-- Populate with notes: 
INSERT INTO notes (title, content, folder_id) VALUES 
  (
    '5 life lessons learned from cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    1
  ),
  (
    'What the government doesn''t want you to know about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a',
    2
  ),
  (
    'The most boring article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    3
  ),
  (
    '7 things lady gaga has in common with cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci.',
    4
  ),
  (
    'The most incredible article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, boring consectetur',
    4
  );

INSERT INTO notes_tags (note_id, tag_id) VALUES
(1,1),
(2,2),
(1,2),
(3,3);