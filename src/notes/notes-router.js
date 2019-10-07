const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  folder: note.folder
});

notesRouter
  .route('/')
  .get((req,res,next) => {
    const db = req.app.get('db');
    NotesService.getAllNotes(db)
      .then(notes => res.status(200).json(notes.map(serializeNote)))
      .catch(next);
  })
  .post(jsonParser, (req,res,next) => {
    const { note_name, content, folder } = req.body;
    const newNote = { note_name, content, folder };
    const db = req.app.get('db');

    if(!note_name) {
      return res.status(400).json( {error: {message: 'Note name is required'}} );
    }
    if(!content) {
      return res.status(400).json( {error: {message: 'Content is required'}} );
    }
    if(!folder) {
      return res.status(400).json( {error: {message: 'Folder is required'}} );
    }

    NotesService.insertNote(db,newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${note.Id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:noteId')
  .all((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.noteId;

    NotesService.getNoteById(db,id)
      .then(note => {
        if(!note) {
          return res.status(404).json( {error: {message: `Note doesn't exist`}} );
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req,res,next) => {
    res.status(200).json(res.note);
  })
  .delete((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.noteId;

    NotesService.deleteNote(db,id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req,res,next) => {
    const { note_name, content, folder } = req.body;
    const noteToUpdate = { note_name, content, folder }; // We are allowing notes to be moved into different folders

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if(numberOfValues === 0) {
      return res.status(400).json( {error: {message: `Request body must contain either 'note name', 'content', or 'folder'`}});
    }

    const db = req.app.get('db');
    const id = req.params.noteId;

    NotesService.updateNote(db,id,noteToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;