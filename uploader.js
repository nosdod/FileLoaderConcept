var http = require('http');
var fs = require('fs-extra');
var formidable = require('formidable');
var settings = require('./settings.json');

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = settings.destination + '/' + settings.destinationFilename;
        fs.move(oldpath, newpath, function (err) {
          if (err) {
            res.write(err.message);
            res.write(err.stack);
            res.end();
          } else {
            res.write('File ' + files.filetoupload.name + ' uploaded to ' + newpath);
            res.write( '<BR>Temporary file was ' + oldpath);
            res.end();
          }
        });
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);