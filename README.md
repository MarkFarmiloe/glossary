# README

### Glossary Project Back End

This project uses a MySQL database.  See the `server/glossaryDB.sql` for a dump of the database.

### API

1. `GET /terms` will return all terms as a JSON list
2. `POST /newTerm` will insert a new term.  Parameters are `term`, `definition`, `language` (programming language), `contributorId`
3. `GET /contributors` will return a list of contributors (id, name and email)
4. `POST /contributor/login` checks the email and password of a contributor.  Parameters are `email`, `password`.
5. `POST /newContributor` adds a new contributor to the database.  Parameters are `name`, `email`, `region`, `password`.

### Database

There are four tables:
1. `admins` containing administrator users (no API functions yet)
2. `contributors` containing all the contributors.
3. `terms` containing all the terms.  Terms require a valid contributor `id`.
4. `term_resources` this table will allow a link to be associated with a term.  It requires a term `id` and a `linktype` which is either `video` or `web`.

### To Do

1.  Add an API function to add term resources.
2.  Add an API function to edit a term or term resource
3.  Add some delete functions.
4.  The `programming_language` property of a term currently only allows one language.  This property probably should be moved to the term_resources table so that a term can have examples from different programming languages. 
