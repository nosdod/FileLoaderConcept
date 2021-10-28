const express = require('express');
const webpack = require('webpack');
const settings = require('./settings.json');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

// Get entropy status based on configured thresholds
function getEntropyStatus( entropySize ) {
  if ( entropySize < settings.thresholds.low ) {
    return "LOW"
  } else if ( entropySize >= settings.thresholds.medium ) {
    return "MEDIUM"
  } else if ( entropySize >= settings.thresholds.high ) {
    return "HIGH"
  }
};

function getFileSizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

app.use(fileUpload({createParentPath:true}));
app.use(express.urlencoded());
app.use(express.json());

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});

app.get('/express-uploader', function(req,res){
  res.sendFile('views/upload.html', {root:__dirname});
});

// Endpoint to return entropy status
app.get('/entropy-status', function(req,res){
  // Get the size of the entropy file
  const entropySize = getFileSizeInBytes(settings.destination + '/' + settings.entropyFile);
  const entropyStatus = getEntropyStatus( entropySize );
  const response = { 
    entropySize : entropySize,
    entropyStatus : entropyStatus
  }
  res.status(200).send( JSON.stringify(response) );
});

// express-uploader backend
app.post('/upload',function(req,res){
  let newFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field on the form is used to retrieve the uploaded file
  newFile = req.files.newFile;
  if ( settings.destinationFilename ) {
    uploadPath = settings.destination + '/' + settings.destinationFilename;
  } else { 
    // No name change
    uploadPath = settings.destination + '/' + req.files.newFile.name;
  }

  // Use the mv() method to place the file somewhere on your server
  newFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send(uploadPath + ' - Upload complete');
  });
});

// Backend for Initial version (UI code in LoadFileDialog.js)
// The serverside functionality required is done here for now ...
// (Could be a Java Swing app that provides this)
app.post('/loadFile',function (req,res) {
  console.log('User requested load of file : ' + req.body.file);

  // File destination.txt will be created or overwritten by default.
  fs.copyFile(req.body.file, settings.destination, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.body.file + ' was copied to ' + settings.destination);
    }
  });
});