const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const mysql = require('mysql');
const server = express();
server.use(bodyParser.urlencoded({extended: false}));

//解决跨域
server.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
    // make the require of options turn back quickly
  } else {
    next();
  }
});

//暴漏静态资源文件 暴漏之后可以通过域名访问该文件下的资源
server.use(express.static('upload'))

server.listen(3344,() => {
  console.log("Server running at port 3344");
});

//deal (cookie,session)
(() => {
  server.use(cookieParser());
  let keyArr = [];
  for (let i = 0; i < 100000; i++) {
    keyArr[i] = "xsa_" + Math.random() * 100 + i;
  }
  server.use(cookieSession({
    name: "hc",
    keys: keyArr,
    maxAge: 30 * 60 * 1000
  }))
})();


//deal router
server.use('/', require('./route/index.js')());
