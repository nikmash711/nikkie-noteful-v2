'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//Gonna use our new database now!
const knex = require('../knex');
// loads the knex.js file which loads the knexfile.js and returns a connection to the database which is assigned to knex.

//Get All Folders (no search filter needed)
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(folders => {
      res.json(folders);
    })
    .catch(err => next(err));
});

//Get Folder by id:
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  //it returns an array, but we want an object 
  knex
    .select('id', 'name')
    .from('folders')
    .where('id', `${id}`)
    .then(([folder]) => {
      if (folder) {
        console.log(folder);
        res.status(200).json(folder);
      } else {
        next();
      }
    })
    .catch(err => {
      err.status = 404;
      next(err);
    });
});

//Update Folder - The noteful app does not use this endpoint but we'll create it in order to round out our API
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateFolder = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateFolder[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateFolder.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('folders')
    .update(updateFolder)
    .where('id', `${id}`)
    .returning('*')
    .then(([folder]) => {
      if (folder) {
        res.status(200).json(folder);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//Create a Folder accepts an object with a name and inserts it in the DB. Returns the new item along the new id.
router.post('/', (req, res, next) => {
  const {name} = req.body;

  const newFolder = {name};
  /***** Never trust users - validate input *****/
  if (!newFolder.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newFolder)
    .into('folders')
    .returning('*')
    .then(([folder]) => {
      if (folder) {
        res.location(`http://${req.headers.host}/api/folders/${folder.id}`).status(201).json(folder);
      }
    })
    .catch(err => {
      next(err);
    });
});

//Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status.
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('folders')
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