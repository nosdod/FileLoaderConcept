** File Loader concept apps

* Initial Idea

The initial idea was to present a 'Load File' button, which fired up the native file browser dialog. The user then selects a file and the full path of the file is passed over to a server side endpoint.
The server should copy the file to the configured destination and change the name (if required)
Unfortunately this doesn't work - the browser only gets the name of the file, not its location on the server due to browser security constraints.
I tried a few different Node modules that implemented File selection, all had the same issue. 
The final one used the node module select-files, which is implemented in the same code as File Uploader 2
A bit of reading about this lead to the conclusion that the browser is not allowed to know about the local file location because this could be used to attack the server.

Run server.js from within Code.
Open a browser at http://localhost:3000 to see the button.

* File Upload 1

Next approach was to implement a file upload capability. A couple of approaches were taken.

Using a nodjs Form module, Formidable, a simple form is displayed in response to a server get request.
The User fills in the form by selecting a file from the native file open dialog, much the same as above.
The file is then sent to the server, and appears to the server as a temporary file.
The server moves the temporary file to the required destination - destination and name set in settings.json.

Run uploader.js from within Code
Open a browser at http://localhost:8080

* File Upload 2

I was also looking at a more complete Nodejs solution that would be needed for other functionality. So plugging the file upload into that using an appropriate Node module for express was implemented

The Load dialog is again presented as a web page inresponse to a URL. The user selects the required file and it is passed to the server as a temporary file.
Under the covers this is the same operation as in the first Uploader.
The server moves the temporary file to the destination and name in setting.json
Behind the scenes this app is creating the served page with Webpack, building everything into a compressed javascript bundle and creating the index.html page to invoke it.
(This is the way we would need to go to get React and Material UI into the picture in a full version of the functionality)
This takes longer to run up as it is running Webpack in dev mode - which creates the bundled up javascript at each execution of the app.

Run server.js from within Code
Open a browser at http://localhost:3000/express-uploader to see the dialog.
Select a file and click Upload