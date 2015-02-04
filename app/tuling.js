/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var superagent = require('superagent');
var robot = require('./config.js').robot;

var tulingApi = 'http://www.tuling123.com/openapi/api';

function getTulingReply(text, cb) {
    superagent.get(tulingApi)
    .query({key: robot.tulingKey, info: text})
    .end(function (res) {
        cb && cb(res.text);
    });
}

module.exports = {
    getTulingReply: getTulingReply
};