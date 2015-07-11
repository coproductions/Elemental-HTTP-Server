var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var PORT = 9090;
var PUBLIC = './public/';
var server = http.createServer(handleRequest)

server.listen(PORT,function(){
  console.log('http server listening on port:'+PORT)
  updateIndexPage();
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

    var postObject = querystring.parse(postBody);
    var pageContent = generateElementHtmlPage(postObject.elementName,postObject.elementSymbol,postObject.elementAtomicNumber,postObject.elementDescription)
    var fileName = PUBLIC+postObject.elementName+'.html';
    var postSuccessful = '{"success":"true"}';
    var postUnsuccessful = '{"success":"false"}';


    //check if file exists
    fs.exists(fileName,function(fileAlreadyExists){

      if (fileAlreadyExists){

      //if file exists do return error
        response.write(postUnsuccessful);
        response.end();
      } else{

        // otherwise create a new file, in public
        fs.writeFile(fileName,pageContent,function(err){
          if(err){
            response.write(err);
            response.end();
            throw err;
          } else{
            // console.log('response:', response)
            response.write(postSuccessful);
            response.end();
          }
        })
        updateIndexPage(fileName,postObject.elementName)
      }
    })
  })
}


function generateElementHtmlPage(elName,elSymbol,elAtomicNr,elDescription){

  return '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>The Elements - '
  +elName
  +'</title> <link rel="stylesheet" href="/css/styles.css"> </head> <body> <h1>'
  +elName
  +'</h1> <h2>H</h2> <h3>Atomic number '
  +elAtomicNr
  +'</h3> <p>'
  +elDescription
  +'</p> <p><a href="/">back</a></p> </body> </html>';
}

function updateIndexPage(fileName,elName){
  var oldIndexString = fs.readFileSync(PUBLIC+'index.html').toString();

  var regForNumber = /(<h3>These are )(\d+)(<\/h3>)/g;
  var regForLinkList = /(<ol class="elementsLinks">)(.+)(<\/ol>)/g;

  var currentNrOfElements = Number(regForNumber.exec(oldIndexString)[2]);
  var currentLinkList = regForLinkList.exec(oldIndexString)[2];

  var newLink = '<li> <a href="/' + fileName + '">' + elName + '</a> </li>';


  var newIndexString =
    '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>The Elements</title> <link rel="stylesheet" href="/css/styles.css"> </head> <body> <h1>The Elements</h1> <h2>These are all the known elements.</h2> <h3>These are '
    + currentNrOfElements+1
    +'</h3> <ol class="elementsLinks">'
    + currentLinkList
    + newLink
    +'</ol><</body> </html>';


    // replace index file
  fs.writeFile(PUBLIC+'index.html',newIndexString,function(err){
    if(err){
      throw err;
    }
  })
}