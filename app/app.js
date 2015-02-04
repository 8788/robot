/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var fs = require('fs');
var init = require('./init.js');
var config = require('./config.js');
var robot = config.robot;
var mdDir = robot.mdDir;

init.start();

var http = require('http').createServer(function(req, resp) {
    var url = req.url.substring(1);
    var reg = new RegExp(mdDir + '\\/\\w', 'gi');
    if (url.search(reg) > -1) {
        fs.readFile(url, 'utf-8', function (err, data) {
            if (err) {
                resp.writeHead(200, {'Content-Type' : 'text/plain'});
                resp.end('not found.');
            } else {
                resp.writeHead(200, {'Content-Type' : 'text/plain'});
                resp.end(data);
            }
        });
    } else if (url === mdDir || url === mdDir + '/') {
        fs.readdir(url, function (err, data) {
            var str = '';
            data.map(function (item) {
                str += '<a href="/' + mdDir + '/' + item +'">' + item + '</a><br>';
            });
            resp.writeHead(200, {'Content-Type' : 'text/html'});
            resp.end(str);
        });
    } else {
        resp.writeHead(200, {'Content-Type' : 'text/plain'});
        resp.end('Hello node.js.\n' + new Date() + '\n' + robot.interval);
    }
});

http.listen(8080, '0.0.0.0');
console.log('Server running at http://0.0.0.0:8080/');


