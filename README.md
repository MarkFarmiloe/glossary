# README

## Glossary Project Back End

This project uses a MySQL database.  See the `server/glossaryDB.sql` for a dump of the database.

### Terms

Terms consist of the term itself and its definition.  The database also holds the name of the contributor who created it (or last edited it), plus the creation date and the last edit date.  Each term has a unique `id`

### Term resources

Term resources are associated with a specific term.  They need the `id` of the term they are associated with, plus a `link` and a `linktype`.  The link type is either `video` (for YouTube or other video resources) or `web` for links to web sites.  Finally each term resource has a `language` property to identify the programming language.

### Authentication

The API uses JSON Web Tokens for authentication.  The `/contributor/login` function will return a token which is valid for one hour.
```
{
    "auth": "eyJhbGciOiJIUz.."
}
```
The client should return an `Authorization` header containing the token for all operations that add/edit/delete terms or their resources.  The header should look like this:
```
Authorization: Bearer "eyJhbGciOiJIUz.."
```

### API

1. `GET /terms` will return all terms as a JSON list
2. `POST /terms/add` will insert a new term.  Parameters are `term`, `definition`, `language` (programming language), `contributorId` (AUTH)
3. `POST /terms/update` will update a term.  Parameters are `termid`, `term`, `definition`, `language` (programming language), `contributorId` (AUTH)
4. `POST /terms/delete` will delete a term.  Parameters are `termid` (AUTH)
5. `GET /term/resources` will return all resources associated with a term.  Parameters are `termid`
6. `POST /terms/resources/add` will insert a new resource for a specific term.  Parameters are `termid`, `link`, `linktype` (`video` or `web`), `language` (AUTH)
7. `POST /terms/resources/update` will update a resource for a specific term.  Parameters are `resourceid`, `termid`, `link`, `linktype` (`video` or `web`), `language` (AUTH)
8. `POST /terms/resources/delete` will delete a resource.  Parameters are `resourceid` (AUTH)
9. `GET /contributors` will return a list of contributors (id, name and email) (AUTH)
10. `POST /contributor/login` checks the email and password of a contributor.  Parameters are `email`, `password`.
11. `POST /newContributor` adds a new contributor to the database.  Parameters are `name`, `email`, `region`, `password`. (AUTH)

### Database

There are four tables:
1. `admins` containing administrator users (no API functions yet)
2. `contributors` containing all the contributors.
3. `terms` containing all the terms.  Terms require a valid contributor `id`.
4. `term_resources` this table will allow a link to be associated with a term.  It requires a term `id` and a `linktype` which is either `video` or `web`.

### To Do


