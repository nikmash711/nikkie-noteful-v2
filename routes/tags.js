'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//Gonna use our new database now!
const knex = require('../knex');
// loads the knex.js file which loads the knexfile.js and returns a connection to the database which is assigned to knex.

//Get All tags (no search filter needed)
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(tags => {
      res.json(tags);
    })
    .catch(err => next(err));
});

//Get tag by id:
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  //it returns an array, but we want an object 
  knex
    .select('id', 'name')
    .from('tags')
    .where('id', `${id}`)
    .then(([tag]) => {
      if (tag) {
        console.log(tag);
        res.status(200).json(tag);
      } else {
        next();
      }
    })
    .catch(err => {
      err.status = 404;
      next(err);
    });
});

// Update Tag
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateTag = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateTag[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateTag.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('tags')
    .update(updateTag)
    .where('id', `${id}`)
    .returning('*')
    .then(([tag]) => {
      if (tag) {
        res.status(200).json(tag);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE ITEM ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

//Delete tag
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('tags')
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