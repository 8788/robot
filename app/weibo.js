/**
 * @fileOverview weibo robot
 * @authors http://weibo.com/u/5434811734
 */

'use strict';

var superagent = require('superagent');
var file = require('./file.js');
var robot = require('./config.js').robot;
var cache = file.readCache();


var api = {
    accessToken: 'https://api.weibo.com/oauth2/access_token',
    mentions: 'https://api.weibo.com/2/statuses/mentions.json',
    mentionsIds: 'https://api.weibo.com/2/statuses/mentions/ids.json',
    showItem: 'https://api.weibo.com/2/statuses/show.json',
    repostUrl: 'https://api.weibo.com/2/statuses/repost.json',
    updateUrl: 'https://api.weibo.com/2/statuses/update.json',
    showUser: 'https://api.weibo.com/2/users/show.json',
    createComments: 'https://api.weibo.com/2/comments/create.json',
    commentsMentions: 'https://api.weibo.com/2/comments/mentions.json',
    commentsReply: 'https://api.weibo.com/2/comments/reply.json',
    commentsToMe: 'https://api.weibo.com/2/comments/to_me.json',
};

/**
 * 获取AccessToken
 */
function getAccessToken(cb) {
    var maps = {
        client_id: robot.client_id,
        client_secret: robot.client_secret,
        username: robot.username,
        password: robot.password,
        grant_type: 'password'       
    };

    superagent
    .post(api.accessToken)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send(maps)
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            var data = JSON.parse(res.text);
            cache.access_token = data.access_token;
            cache.expires_in = data.expires_in;
            file.writeCache(cache);
            cb && cb(data);
        }
    });
}

/**
 * 获取atme的最新微博
 */
function getMentions(cb) {
    superagent
    .get(api.mentions)
    .query({access_token: cache.access_token, count: 5})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body.statuses);
        }
    });
}

/**
 * 获取atme的最新评论
 */
function getCommentsMentions(cb) {
    superagent
    .get(api.commentsMentions)
    .query({access_token: cache.access_token, count: 5})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body.comments);
        }
    });    
}

/**
 * 获取我收到的最新评论
 */
function getCommentsToMe(cb) {
    superagent
    .get(api.commentsToMe)
    .query({access_token: cache.access_token, count: 5})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body.comments);
        }
    });    
}

/**
 * 根据id获取单条微博内容
 */
function getItemById(id, cb) {
    superagent
    .get(api.showItem)
    .query({access_token: cache.access_token, id: id})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });
}

/**
 * 转发微博
 */
function repost(id, text, cb) {
    superagent
    .post(api.repostUrl)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send({access_token: cache.access_token, id: id, status: text})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });
}

/**
 * 发新微博
 */
function update(text, cb) {
    superagent
    .post(api.updateUrl)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send({access_token: cache.access_token, status: text})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });
}

/**
 * 回复评论
 */
function commentsReply(id, cid, text, cb) {
    superagent
    .post(api.commentsReply)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send({access_token: cache.access_token, id: id, cid: cid, comment: text})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });    
}

/**
 * 发表评论
 */
function comment(id, text, cb) {
    superagent
    .post(api.createComments)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send({access_token: cache.access_token, id: id, comment: text})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });
}

/**
 * 根据id或昵称获取用户信息
 */
function getUserInfo(nickName, id, cb) {
    if (arguments.length === 2) {
        cb = id;
    }
    superagent
    .get(api.showUser)
    .query({access_token: cache.access_token, id: id, screen_name: nickName})
    .end(function (res) {
        if (res.error) {
            errorHandler(res.error);
        } else {
            cb && cb(res.body);
        }
    });
}

/**
 * 错误处理
 */
function errorHandler(err) {
    console.log('XXX ' + err, '\n' + err.text);
    var text = JSON.parse(err.text);
    // token过期或无效
    if (text.error_code === 21327 || text.error_code === 21332) {
        getAccessToken(function (res) {
            console.log('\n√√√ get new access_token: ' + res.access_token);
        });
    }
}

module.exports = {
    getAccessToken: getAccessToken,
    getMentions: getMentions,
    getCommentsMentions: getCommentsMentions,
    getCommentsToMe: getCommentsToMe,
    getItemById: getItemById,
    repost: repost,
    update: update,
    comment: comment,
    commentsReply: commentsReply,
    getUserInfo: getUserInfo
};