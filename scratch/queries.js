'use strict';

const knex = require('../knex');
// loads the knex.js file which loads the knexfile.js and returns a connection to the database which is assigned to knex.


// accepts a searchTerm and finds notes with titles which contain the term. It returns an array of objects:
// let searchTerm = 'gaga';
// knex
//   .select('id', 'title', 'content')
//   .from('notes')
//   //allows us to conditionally add a .where() clause depending on the state of searchterm. If searchTerm exists then find notes where the title is LIKE the searchTerm
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//Get Note By Id accepts an ID. It returns the note as an object not an array
// const id = '1001';
// knex
//   .select('id', 'title', 'content')
//   .from('notes')
//   .where('id', `${id}`)
//   .then(result => {
//     console.log(JSON.stringify(result));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//Update Note By Id accepts an ID and an object with the desired updates. It returns the updated note as an object
const otherid = '1002';
const updObj = {'title': 'diff', 'content': 'content123'};
knex
  .from('notes')
  .update(updObj)
  .where('id', `${otherid}`)
  .returning('*')
  .then(([result]) => {
    console.log('the result is ', result);
    console.log(JSON.stringify(result));
  })
  .catch(err => {
    console.error(err);
  });

//Create a Note accepts an object with the note properties and inserts it in the DB. It returns the new note (including the new id) as an object.
// const newObj = {'title': 'new', 'content': 'new123'};
// knex
//   .insert(newObj)
//   .into('notes')
//   .then(result => {
//     console.log(JSON.stringify(result));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// Delete Note By Id accepts an ID and deletes the note from the DB.
// const idagain = '1001';
// knex
//   .from('notes')
//   .where('id', `${idagain}`)
//   .del()
//   .then(result => {
//     console.log(JSON.stringify(result));
//   })
//   .catch(err => {
//     console.error(err);
//   });


//why dont we need to use "returning?"