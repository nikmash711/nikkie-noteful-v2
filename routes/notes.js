'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//Gonna use our new database now!
const knex = require('../knex');
// loads the knex.js file which loads the knexfile.js and returns a connection to the database which is assigned to knex.

//prevents dupliicates of each note being written for each tag associated with it 
const hydrateNotes = require('../utils/hydrateNotes');

// accepts a searchTerm and finds notes with titles which contain the term. It returns an array of objects:
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId; 
  const tagId = req.query.tagId;
  
  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName',  'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
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
  //filter the results by a tagId
    .modify(function (queryBuilder) {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      const hydrated = hydrateNotes(results);
      res.json(hydrated);
    })
    .catch(err => next(err));
});


//Get Note By Id accepts an ID. It returns the note as an object not an array
router.get('/:id', (req, res, next) => {
  const noteId = req.params.id;
  
  //it returns an array, but we want an object 
  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', noteId)
    .then(note => {
      if (note) {
        console.log(note);
        const hydrated = hydrateNotes(note);
        res.json(hydrated[0]);
      } else {
        next();
      }
    })
    .catch(err => {
      err.status = 404;
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content, folderId, tags = [] } = req.body;
  
  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  const updateItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };
  
  knex('notes').update(updateItem).where('id', noteId)
    .then(() => {
      return knex.del().from('notes_tags').where('note_id', noteId);
    })
    .then(() => {
      const tagsInsert = tags.map(tid => ({ note_id: noteId, tag_id: tid }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      return knex.select('notes.id', 'title', 'content',
        'folder_id as folderId', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const [hydrated] = hydrateNotes(result);
        res.json(hydrated);
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
  const { title, content, folderId, tags } = req.body; // Add `folderId` to object destructure
  
  const newItem = {
    title: title,
    content: content,
    folder_id: folderId,
    tags: tags  // Add `folderId`
  };
  
  
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  let noteId;
  
  // Insert new note into notes table
  knex.insert(newItem).into('notes').returning('id')
    .then(([id]) => {
    // Insert related tags into notes_tags table
      noteId = id;
      //converts an array of tagIds in to an array of objects with a note_id and a tag_id
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      // inserts them into the notes_tags table
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
    // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
      // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  knex.del()
    .where('id', req.params.id)
    .from('notes')
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});
module.exports = router;