var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var PORT = 9090;
var PUBLIC = './public/';
var server = http.createServer(handleRequest)
var postSuccessful = '{"success":"true"}';
var postUnsuccessful = '{"success":"false"}';

server.listen(PORT,function(){
  console.log('http server listening on port:'+PORT)
  // updateIndexPage();
})

function handleRequest(request, response){

  var responseBody = '';
  switch(request.method){
    case 'GET':
      handleGet(request,response);
      break;
    case 'POST' :
      handlePost(request,response);
      break;
    case 'PUT' :
      handlePut(request,response);
      break;
    case 'DELETE' :
      handleDelete(request,response);
      break;

  }
}


function handleGet(request,response){
  var uri = request.url;
    if(uri === '/'){
      uri = 'index.html';
    }

    fs.exists(PUBLIC + uri, function(exists){
      if(exists){
        fs.readFile(PUBLIC + uri,function(err,data){
          if(err){
            throw err;
          }
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
      // response.end();
  })

  request.on('end', function(){

    var postObject = querystring.parse(postBody);
    var pageContent = generateElementHtmlPage(postObject.elementName,postObject.elementSymbol,postObject.elementAtomicNumber,postObject.elementDescription)
    var fileName = PUBLIC+postObject.elementName.toLowerCase() +'.html';



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
            updateIndexPage(fileName,postObject.elementName)
          }
        })
      }
    })
  })
}

function handlePut(request,response){

  var filePath = request.url;
  var fileName = './public'+filePath

  var postBody = '';

  request.on('data', function(chunk){
    postBody += chunk.toString();
    // response.end();
  })

    request.on('end', function(){
      var postObject = querystring.parse(postBody);
      console.log(postObject)
      var pageContent = generateElementHtmlPage(postObject.elementName,postObject.elementSymbol,postObject.elementAtomicNumber,postObject.elementDescription)
      var fileName = PUBLIC+postObject.elementName.toLowerCase() +'.html';


      fs.exists(fileName,function(fileExists){

        if(fileExists){
          updateHtmlFile(filePath,postObject);
          response.write(postSuccessful);
          response.end();
        } else{
          console.log('couldnt find such file: ',fileName)
          response.write(postUnsuccessful);
          response.end();
        }
      });

    });
}

function handleDelete(request,response){
  var fileName = './public'+request.url;
  fs.exists(fileName,function(fileExists){

    if(fileExists){
      fs.unlink(fileName,function(err){
        if(err){
          response.write(err);
          response.end();
          throw err;
        } else{
          updateIndexPage(request.url,null,true)
          response.write(postSuccessful);
          response.end()
        }
      })
    } else{
      response.statusCode = 500;
      response.write('{"error":"resource '+ request.url+' does not exist" }');
      response.end();

    }
  })
}

function updateHtmlFile(filePath,contentObject){
  var oldFileString = fs.readFileSync(PUBLIC+filePath).toString();
  var updatedFileString = generateElementHtmlPage(contentObject.elementName,contentObject.elementSymbol,contentObject.elementAtomicNumber,contentObject.elementDescription);

   fs.writeFile(PUBLIC+filePath,updatedFileString,function(err){
    if(err){
      response.write(err);
      response.end();
      throw err;
    }
  })
}

function generateElementHtmlPage(elName,elSymbol,elAtomicNr,elDescription){

  return '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>The Elements - '
  +elName
  +'</title> <link rel="stylesheet" href="/css/styles.css"> </head> <body> <h1>'
  +elName
  +'</h1> <h2>'
  +elSymbol
  +'</h2> <h3>Atomic number '
  +elAtomicNr
  +'</h3> <p>'
  +elDescription
  +'</p> <p><a href="/">back</a></p> </body> </html>';
}

function updateIndexPage(fileName,elName,deleteFile){
  var oldIndexString = fs.readFileSync(PUBLIC+'index.html').toString();
  var newLink;

  var regForNumber = /(<h3>These are )(\d+)(<\/h3>)/g;
  var regForLinkList = /(<ol class="elementsLinks">)(.+)(<\/ol>)/g;
  var regForDeleteLink = new RegExp('(<li>)( <a href=\")(' + fileName + ')(">)(\\w)+(<\/a> <\/li>)','g')

  var currentNrOfElements = Number(regForNumber.exec(oldIndexString)[2]);
  var newNrOfElements = currentNrOfElements+1;
  var currentLinkList = regForLinkList.exec(oldIndexString)[2];
  if(deleteFile){
    newNrOfElements = currentNrOfElements-1;
    newLink = '';
    currentLinkList = currentLinkList.replace(regForDeleteLink,"");
  }
  else{
    newLink = '<li> <a href="/' + elName.toLowerCase() + '.html' + '">' + elName + '</a> </li>';
  }

  var newIndexString =
    '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>The Elements</title> <link rel="stylesheet" href="/css/styles.css"> </head> <body> <h1>The Elements</h1> <h2>These are all the known elements.</h2> <h3>These are '
    + newNrOfElements
    +'</h3> <ol class="elementsLinks">'
    + currentLinkList
    + newLink
    +'</ol></body> </html>';


    // replace index file
  fs.writeFile(PUBLIC+'index.html',newIndexString,function(err){
    if(err){
      throw err;
    }
  })
}