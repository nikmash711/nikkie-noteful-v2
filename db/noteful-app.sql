-- 1. I started the server 
-- 2. I created the database
-- 3. I created this sql file
-- 4. Connected the db to this file by running psql -U dev -d noteful-app -f /Users/nikkiemashian/Documents/Thinkful/Week-4/Monday/noteful-app.sql
-- Now I can write the commands here and executing them on the command line!

-- All this does is populate the databse - we initilize it here 

-- this only gets run if we run the above command and we mainly using it for testing
SELECT CURRENT_DATE;

DROP TABLE IF EXISTS notes;
-- we run the above so that if the table exists we can delete it and make it again if we're running our commands multiple times 

-- Create a table: 
CREATE TABLE notes(
   id serial PRIMARY KEY,
   title text NOT NULL, 
   content text,
   created timestamp DEFAULT current_timestamp
);

-- Bonus: make the id's start from 1000
ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

-- Populate with notes: 
INSERT INTO notes (title, content) VALUES 
  (
    '5 life lessons learned from cats',
    'Lorem ipsum dolor sit amet'
  ),
  (
    'What the government doesn''t want you to know about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a'
  ),
  (
    'The most boring article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
  ),
  (
    '7 things lady gaga has in common with cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci.'
  ),
  (
    'The most incredible article about cats you''ll ever read',
    'Lorem ipsum dolor sit amet, boring consectetur'
  ),
  (
    '10 ways cats can help you live to 100',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.'
  ),
  (
    '9 reasons you can blame the recession on cats',
    'Lorem ipsum dolor sit amet'
  ),
  (
    '10 ways marketers are making you addicted to cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a'
  ),
  (
    '11 ways investing in cats can make you a millionaire',
    'Lorem ipsum dolor sit amet, consectetur adipiscing'
  ),
  (
    'Why you should forget everything you learned about cats',
    'Posuere sollicitudin aliquam ultrices sagittis orci a.'
  );