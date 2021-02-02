var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/"></a></h1>

    ${control}
    ${body}
  </body>
  </html>
  `;
}
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = '안녕하세요';
          var description = 'qr코드 스타트업 입니다. 이용해 주셔서 감사합니다.';
          //var list = templateList(filelist);
          var template = templateHTML(title,
            `<h2>${title}</h2>${description}`,

          );
          response.writeHead(200);
          response.end(template);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            //var list = templateList(filelist);
            var template = templateHTML(title,
              `<h2>${title}</h2>${description}`,
              `
                <a href="/update?id=${title}">정보수정시 여기클릭</a>
              `
            );
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        //var list = templateList(filelist);
        var template = templateHTML(title, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="이름, 전화번호, 주소 등 정보를 입력해주세요."></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(template);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          //var list = templateList(filelist);
          var template = templateHTML(title,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="hidden" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" maxlength="5000" style="width:50%;border:1;overflow:visible;text-overflow:ellipsis;" rows=30 placeholder="이름, 전화번호, 주소 등 다양한 정보를 입력해주세요. 입력완료 후 아래 제출버튼 클릭">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            ` <a href="/update?id=${title}">정보수정</a>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
      });
    }  else {
      response.writeHead(404);
      response.end('먼가 잘못되었습니다!.');
    }
});
app.listen(8001);