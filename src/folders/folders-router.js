const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

foldersRouter
  .route('/')
  .get((req,res,next) => {
    const db = req.app.get('db');
    FoldersService.getAllFolders(db)
      .then(folders => res.status(200).json(folders.map(serializeFolder)))
      .catch(next);
  })
  .post(jsonParser, (req,res,next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };
    const db = req.app.get('db');

    if(!folder_name) {
      return res.status(400).json( {error: {message: 'Folder name is required'}});
    }
    
    FoldersService.insertFolder(db,newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/:folderId')
  .all((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.folderId;
    FoldersService.getFolderById(db,id)
      .then(folder => {
        if(!folder) {
          return res.status(404).json( {error: {message: 'Folder does not exist'}});
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req,res,next) => {
    res.status(200).json(res.folder);
  })
  .delete((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.folderId;

    FoldersService.deleteFolder(db,id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req,res,next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };
    const db = req.app.get('db');
    const id = req.params.folderId;

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if(numberOfValues === 0) {
      return res.status(400).json( {error: {message: 'Request body must contain folder name'} });
    }

    FoldersService.updateFolder(db,id,folderToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;