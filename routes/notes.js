'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//Gonna use our new database now!
const knex = require('../knex');
// loads the knex.js file which loads the knexfile.js and returns a connection to the database which is assigned to knex.


// accepts a searchTerm and finds notes with titles which contain the term. It returns an array of objects:
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId; 

  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    //filter the results by a folderId
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});


//Get Note By Id accepts an ID. It returns the note as an object not an array
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  //it returns an array, but we want an object 
  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', `${id}`)
    .then(([note]) => {
      if (note) {
        console.log(note);
        res.status(200).json(note);
      } else {
        next();
      }
    })
    .catch(err => {
      err.status = 404;
      next(err);
    });
});

//Update Note By Id accepts an ID and an object with the desired updates. It returns the updated note as an object
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('notes')
    .update(updateObj)
    .where('id', `${id}`)
    .returning('*')
    .then(([note]) => {
      if (note) {
        res.status(200).json(note); //this repsonse is a number so why is it working 
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// accepts an object with the note properties and inserts it in the DB. It returns the new note (including the new id) as an object.
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newItem)
    .into('notes')
    .returning('*')
    .then(([note]) => {
      if (note) {
        console.log('the note is:', note);
        res.location(`http://${req.headers.host}/api/notes/${note.id}`).status(201).json(note);
      }
    })
    .catch(err => {
      next(err);
    });
});

// Delete Note By Id accepts an ID and deletes the note from the DB.
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('notes')
    .where('id', `${id}`)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
