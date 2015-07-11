var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var PORT = 9090;
var PUBLIC = './public/';
var server = http.createServer(handleRequest)


server.listen(PORT,function(){
  console.log('http server listening on port:'+PORT)
})

function handleRequest(request, response){
  console.log('in handleRequest')
  console.log('response method:',response.method)
  // console.log('request',request)
  // console.log('response',response)
  //console.log(request);
  var responseBody = '';
  switch(request.method){
    case 'GET':
      handleGet(request,response);
      break;
    case 'POST' :
     handlePost(request,response);
      break;
  }
}


function handleGet(request,response){
  console.log('inhandle get')
  var uri = request.url;
    if(uri == '/'){
      uri = 'index.html';
    }

    fs.exists(PUBLIC + uri, function(exists){
      if(exists){
        fs.readFile(PUBLIC + uri,function(err,data){
          if(err){
            throw err;
          }
          console.log('data',data)
          response.write(data);
          response.end();
        })
      } else{
        response.statusCode = 404;
        response.write('<h1>File does not exist!</h1>');
        response.end();
      }
    });
}

function handlePost(request,response){

  var postBody = '';

  request.on('data', function(chunk){
      postBody += chunk.toString();
  })

  request.on('end', function(){
    console.log('postBody', postBody);

    var postData = querystring.parse(postBody);

    //create a new file, in public
    fs.writeFile(PUBLIC+postData.filename,postData.content,function(err){
      if(err){
        response.write(err);
        response.end();
        throw err;
      } else{
        response.write('success');
        response.end();

      }
    })
  })
}

function generateElementHtmlPage(elName,elSymbol,elAtomicNr,elDescription){

  return '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>The Elements - '
  +elName
  '</title> <link rel="stylesheet" href="/css/styles.css"> </head> <body> <h1>'
  +elName
  +'</h1> <h2>H</h2> <h3>Atomic number '
  +elAtomicNr
  +'</h3> <p>'
  +elDescription
  +'</p> <p><a href="/">back</a></p> </body> </html>';
}