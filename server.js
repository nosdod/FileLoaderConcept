const express = require('express');
const settings = require('./settings.json');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

// Get entropy status based on configured thresholds
function getEntropyStatus( entropySize ) {
  if ( entropySize < settings.thresholds.critical ) {
    return "CRITICAL"
  } else if ( entropySize < settings.thresholds.warning ) {
    return "WARNING"
  } else {
    return "NORMAL"
  }
};

function getFileSizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function getEntropy() {
  // Return some entropy data, truncating the entropy file
  const dataFile = 'data/entropy.json';
  const entropyFile = settings.destination + '/' + settings.entropyFile;
  const dataFileSize = getFileSizeInBytes(dataFile);
  const fileSize = getFileSizeInBytes(entropyFile);
  if ( fileSize > dataFileSize ) {
    fs.truncateSync(entropyFile,fileSize-dataFileSize);
    console.log( dataFileSize + " bytes of entropy consumed, " + fileSize + " bytes left" );
    return dataFile;
  } else {
    return "ERROR"
  }
}

app.use(fileUpload({createParentPath:true}));
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

app.listen(settings.port, function () {
  console.log('FileLoaderConcept Server listening on port ' + settings.port);
});

app.get('/express-uploader', function(req,res){
  res.sendFile('views/upload.html', {root:__dirname});
});

app.get('/get-entropy', function(req,res){
  const fileName = getEntropy();
  if ( fileName === "ERROR" ) {
    res.status(400).send("No Entropy left");
  } else {
    res.sendFile(fileName, {root:__dirname});
  }
});

// Simulate Entropy consumption
const entropyConsumer = setInterval( getEntropy,1000 );

app.post('/send-new', function(req,res) {
  console.log( "Client requested new file : " + req.body.newfile );
  const newFile = req.body.newfile;
  if ( newFile ) {
    if ( fs.access(newFile) ) {
      console.log( "About to copy " + newFile + " " + getFileSizeInBytes(newFile) + " Bytes");
      fs.copyFileSync(newFile,settings.destination + '/' + settings.entropyFile);
      console.log( "Completed copy of " + newFile);
      const response = buildEntropyStatusResponse();
      res.status(200).send(JSON.stringify(response));
    } else {
      console.log( "Could not access " + newFile);
      res.status(404); // Return file does not exist
    }
  } else {
    console.log( "Bad request " + req.body);
    res.status(500); // Return server error
  }
});

function buildEntropyStatusResponse() {
  // Get the size of the entropy file
  const entropySize = getFileSizeInBytes(settings.destination + '/' + settings.entropyFile);
  const entropyStatus = getEntropyStatus( entropySize );
  const response = { 
    entropySize : entropySize,
    entropyStatus : entropyStatus
  }
  return response;
}

// Endpoint to return entropy status
app.get('/entropy-status', function(req,res){
  console.log( 'INFO : Client requested status report, response was');
  const response = buildEntropyStatusResponse();
  console.log( response );
  res.status(200).send( JSON.stringify(response) );
});

// Caller posts json object
app.post('/check-credentials', function(req,res) {
  const data = JSON.parse( req.body.credentials );
  if ( data ) {
    let passed = true;
    if ( data.usertype === 'SM') {
      if ( data.username === 'SM User' ) {
        passed = false;
      }
      if ( data.password !== 'sm-password' ) {
        passed = false;
      }
    } else {
      if ( data.username === 'KGM User' ) {
        passed = false;
      }
      if ( data.password !== 'kgm-password' ) {
        passed = false;
      }
    }
    if ( passed ) {
      res.status(200).send("OK")
    } else {
      res.status(200).send("FAILED")
    }
  } else {
    res.status(400).send("NO CREDENTIALS RECEIVED");
  }
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
  if ( settings.entropyFile ) {
    uploadPath = settings.destination + '/' + settings.entropyFile;
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
