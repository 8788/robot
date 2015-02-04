/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var weibo = require('./weibo.js');

weibo.getUserInfo('前端机器人', function (res) {
    console.log('\n', res.id, res.screen_name);
});