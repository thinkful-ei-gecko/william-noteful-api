const NotesService = {
  getAllNotes(db) {
    return db
      .select('*')
      .from('note_table');
  },

  getNoteById(db,id) {
    return db
      .select('*')
      .from('note_table')
      .where( {id} )
      .first();
  },

  insertNote(db,newNote) {
    return db
      .insert(newNote)
      .into('note_table')
      .returning('*')
      .then(rows => rows[0]);
  },

  deleteNote(db,id) {
    return db
      .from('note_table')
      .where( {id} )
      .delete();
  },

  updateNote(db,id,newNoteFields) {
    return db
      .update(newNoteFields)
      .from('note_table')
      .where( {id} );
  }
};

module.exports = NotesService;