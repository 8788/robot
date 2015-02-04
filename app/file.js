/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var fs = require('fs');
var robot = require('./config.js').robot;
var mdDir = robot.mdDir;

function readCache() {
    return JSON.parse(fs.readFileSync('cache.json', 'utf-8'));
}

function writeCache(data) {
    fs.writeFileSync('./cache.json', JSON.stringify(data, null, 4));
}

function toDouble(n) {
    return n > 9 ? n : '0' + n;
}

function getFileName() {
    var d = new Date();
    var day = d.getDay();
    var n;
    if (day < 6) {
        n = 5 - day;
    } else {
        n = 6;
    }
    d.setDate(d.getDate() + n);
    return  '' + d.getFullYear() + '-' + toDouble(d.getMonth() + 1) + '-' + toDouble(d.getDate()) + '.md';
}

/**
 * 判断内容是否存在
 */
function isExist(data) {
    var fileName = mdDir + '/' + getFileName();
    if (fs.existsSync(fileName)) {
        var str = fs.readFileSync(fileName, 'utf-8');
        return str.search(data) > -1 ? true : false;
    } else {
        return false;
    }
}

function appendFile(data) {
    if (isExist(data)) {
        console.log('写入内容重复，跳过');
        return;
    }
    fs.appendFile(mdDir + '/' + getFileName(), data + '\n', function (err) {
        if (err) {
            console.log('写入md文件有误');
        } else {
            console.log('已记录：' + data);
        }
    });
}

module.exports = {
    readCache: readCache,
    writeCache: writeCache,
    appendFile: appendFile
};