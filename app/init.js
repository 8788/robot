/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var weibo = require('./weibo.js');
var config = require('./config.js');
var file = require('./file.js');
var tuling = require('./tuling.js');

var cache = file.readCache();
var robot = config.robot;
var userWhiteList = config.userWhiteList;
var blacklist = config.blacklist;
var timer = null;

/**
 * 处理at me的单条微博
 */
function dealAtMeWeibo(data) {
    var reText = robot.repostText;
    var coText = robot.commentText;
    var userId = data.user.id;
    if (data.id <= cache.last_weibo_id || userId === 5434811734 || blacklist.indexOf(userId) > -1) {
        console.log('跳过微博: ', '---> @' + data.user.screen_name + ': ' + data.text);
    } else {
        // 转发or评论
        cache.last_weibo_id = data.id;
        file.writeCache(cache);
        if (userWhiteList.indexOf(userId) > -1) {
            weibo.repost(data.id, reText[Math.random()*reText.length>>0], function (res) {
                var srcName = res.retweeted_status.user.screen_name;
                var srcText = res.retweeted_status.text.replace(/@[\u4e00-\u9fa5\w\-_]+\s*/g, '').trim();
                console.log('转发微博: ' + res.text, '---> @' + name + ':' + srcText);
                file.appendFile('- ' + srcText + ' @' + srcName);
            });
        } else {
            weibo.comment(data.id, coText[Math.random()*coText.length>>0], function (res) {
                var srcName = res.status.user.screen_name;
                var srcText = res.status.text.replace(/@[\u4e00-\u9fa5\w\-_]+\s*/g, '').trim();
                console.log('发表评论: ' + res.text, '---> @' + srcName + ':' + srcText);
                file.appendFile('- ' + srcText + ' @' + srcName);
            });
        }
    }
}

/**
 * 处理评论
 */
function dealComments(type, data) {
    var len = data.length;
    var now = +new Date();
    var date;
    for (var i = len - 1; i >= 0; i--) {
        date = new Date(data[i].created_at).getTime();
        var item = data[i];
        if(now - date <= 1000 * 60 * robot.interval) {
            if (item.id <= cache['last_' + type + '_id']) {
                console.log('跳过评论: ', '---> @' + item.user.screen_name + ': ' + item.text);
            } else {
                cache['last_' + type + '_id'] = item.id;
                file.writeCache(cache);

                // tuling处理回复
                var text = item.text.replace(/@[\u4e00-\u9fa5\w\-_]+\s*/g, '').trim();
                if (!text) {
                    return;
                }
                tuling.getTulingReply(text, function (json) {
                    json = JSON.parse(json);
                    weibo.commentsReply(item.status.id, item.id, json.text, function (res) {
                        console.log('回复评论：' + res.text, '---> @' + res.reply_comment.user.screen_name + ': ' + res.reply_comment.text);
                    });                      
                });
            }
        }            
    }
}


/**
 * 获取at me的数据并转发
 */
function getAtMe() {
    weibo.getMentions(function (data) {
        var len = data.length;
        var now = +new Date();
        var date;

        for (var i = len - 1; i >= 0; i--) {
            date = new Date(data[i].created_at).getTime();
            if(now - date < 1000 * 60 * robot.interval) {
                dealAtMeWeibo(data[i]);
            }
        }
    });

    weibo.getCommentsMentions(function (data) {
        dealComments('at_me', data);
    });

    weibo.getCommentsToMe(function (data) {
        dealComments('to_me', data);
    });
}

/**
 * 更新间隔时间
 */
function updateInterval() {
    var now = new Date();
    var hour = now.getHours();
    if (hour < 9) {
        robot.interval = 3;
    } else {
        robot.interval = 1.5;
    }
    clearInterval(timer);
    timer = setInterval(getAtMe, 1000 * 60 * robot.interval);
}


function start() {
    console.log('------ start at: ' + new Date() + ' ------');
    getAtMe();
    clearInterval(timer);
    timer = setInterval(getAtMe, 1000 * 60 * robot.interval);
    setInterval(updateInterval, 1000 * 60 * 30);
}

exports.start = start;