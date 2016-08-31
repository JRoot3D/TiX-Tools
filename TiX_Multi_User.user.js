// ==UserScript==
// @name         TiX Multi User
// @namespace    http://tampermonkey.net/
// @version      2.6
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Common_functions.user.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Alertify_dialogs.user.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Multi_User.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Multi_User.user.js
// ==/UserScript==

(function() {
    'use strict';

    CF_addStyle('alertifyCSS');
    CF_addStyle('alertifyDefaultCSS');

    function showUsers() {
        var userList = GM_listValues();

        if (userList.length > 0) {
            var users = [];
            for (var i in userList) {
                var userId = userList[i];
                var user = GM_getValue(userId);
                users[i] = user;
            }

            alertify.selectUser('Select User', 'User', users, loginSelectedUser, removeSelectedUser, addUser);
        } else {
            addUser();
        }
    }

    function loginSelectedUser(event, userId) {
        loginUser(userId);
    }

    function removeSelectedUser(event, userId) {
        GM_deleteValue(userId);
    }

    function getUserId(token) {
        return cutPart(cutPart(token));
    }

    function cutPart(value) {
        var index = value.indexOf('-');
        var result = value.substring(index + 1);
        return result;
    }

    function saveUser(event, data) {
        alertify.loginDialog().set('islogin', false);

        var c = coastline();
        c.q(function(c) {
            C.socket.request('login', {
                'email': data.login,
                'password': data.password
            }, function(responce) {
                if (responce.cookie) {
                    var token = responce.cookie;
                    var id = getUserId(token);
                    var saveData = {
                        'token': token,
                        'id': id
                    };

                    var req = {
                        method: 'get',
                        scope: 'user',
                        user: id
                    };

                    C.socket.sendRequest(req, function(responce) {
                        saveData.name = responce.user.name;
                        GM_setValue(id, saveData);
                        alertify.loginDialog().close().set('islogin', true);
                        alertify.notify('User: ' + saveData.name);
                    });
                }
            }).grab('wrong', function() {
                alertify.error('Wrong Login or Password');
            });
        });
    }

    function loginUser(userId) {
        var user = GM_getValue(userId);
        var token = user.token;
        if (token) {
            var date = new Date();
            date.setTime(date.getTime() + 31557600000);
            document.cookie = 'jauth=' + token + '; path=/; expires=' + date.toGMTString();
            location.reload();
        } else {
            alertify.error('Wrong ID: ' + userId);
        }
    }

    function addUser() {
        alertify.loginDialog("Add User", "Email", "Password", saveUser);
    }

    GM_registerMenuCommand("Select User", showUsers);
    GM_registerMenuCommand("Add User", addUser);

    var initCustomContent = function() {
        var selectUserMenuItem = '<a class="el users"><span class="Square FA FA-users"></span><span class="title">Select User</span></a>';
        var linkSelectUser = $('.Menu .capsule .wardrobe').after(selectUserMenuItem).next();
        linkSelectUser.on('click', function(e) {
            showUsers();
        });

        var addUserMenuItem = '<a class="el"><span class="Square FA FA-plus-circle"></span><span class="title">Add User</span></a>';
        var linkAddUser = $('.Menu .capsule .users').after(addUserMenuItem).next();
        linkAddUser.on('click', function(e) {
            addUser();
        });

        initCustomContent = undefined;
    };

    var PageManagerExtended = Class({
        openURI: function(uri, options) {
            if (initCustomContent) {
                initCustomContent();
            }
            var pm = this;

            C.loadingOverlay.add('pageManager openURI ' + uri);
            uri = uri || location.pathname;
            options = _.defaults(options || {}, {
                pushState: true
            });

            var split = uri.split('/');
            var kind = split[1];
            var id = split[2];


            if (pm.pages[id]) { // this is valid only for users and rooms
                C.loadingOverlay.remove('pageManager room or user found ' + id);
                return pm.open(id, null, {
                    pushState: options.pushState
                });
            } else if (kind == 'room' && C.client) {
                C.loadingOverlay.remove('pageManager joining room ' + id);
                C.Room.join(id)
                    .then(function(room) {
                        if (room) {
                            pm.open(room.id, null, {
                                pushState: options.pushState
                            });
                            ga('send', 'event', 'room action', 'join', room.id);
                        }
                    });
            } else if (kind == 'user' && C.client) {
                C.loadingOverlay.remove('pageManager fetching user ' + id);
                C.User.fetch(id)
                    .then(function(user) {
                        user && user.open(true);
                    });
            } else {
                var obj = null,
                    found = false,
                    path = '/' + kind;

                _.each(pm.routes, function(route, rid) {
                    if (!found && route.uri === path && (!route.access || (route.access && ((route.access == 'auth' && C.client) || (route.access == 'guest' && !C.client))))) {
                        found = true;
                        if (pm.pages[rid]) {
                            C.loadingOverlay.remove('pageManager opening from memory ' + rid);
                            return pm.open(rid, split.slice(2), {
                                pushState: options.pushState
                            });
                        } else {
                            obj = route.obj;
                        }
                    }
                });

                if (obj) {
                    C.loadingOverlay.remove('pageManager creating object ' + obj);
                    return new C[obj](split ? split.slice(2) : []);
                } else if (!found) {
                    C.loadingOverlay.remove('pageManager opening last');
                    return pm.showLast();
                }
            }
        }
    });

    jsface.extend(C.PageManager, PageManagerExtended);
})();
