ALTER TABLE note_table
  ADD COLUMN
  modified TIMESTAMP DEFAULT now() NOT NULL;