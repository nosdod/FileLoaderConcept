** File Loader concept apps

Install required Node modules with 'npm install'
Run server.js from within Code

Implements the following endpoints for demo purposes
GET /entropy returns JSON for size and status of entropy file
POST /entropy accepts a new entropy file
POST /credentials accepts a usertype/username/password, models checking them and responds
{ userOK : true } or { userOK : false }

This is the server side for the Concept React UI which is in the 'ReactUIConcept' repository

There is also an uploader built in to this code at the /express-uploader endpoint.
a second application within the code, which is the earlier web based fileuploader.
http://localhost:3000/express-uploader brings up a form where you select a file and then click Upload.
The selected file is uploaded to the server and saved in the same location as above.

settings.json controls various behaviours of the server.