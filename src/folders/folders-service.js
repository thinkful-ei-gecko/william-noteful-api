const FoldersService = {
  getAllFolders(db) {
    return db
      .select('*')
      .from('folder_table');
  },

  getFolderById(db,id) {
    return db
      .select('*')
      .from('folder_table')
      .where( {id} )
      .first();
  },

  insertFolder(db,newFolder) {
    return db
      .insert(newFolder)
      .into('folder_table')
      .returning('*')
      .then(rows => rows[0]);
  },

  deleteFolder(db,id) {
    return db
      .from('folder_table')
      .where( {id} )
      .delete();
  },

  updateFolder(db,id,newFolderFields) {
    return db
      .from('folder_table')
      .update(newFolderFields)
      .where( {id} );
  }
};

module.exports = FoldersService;