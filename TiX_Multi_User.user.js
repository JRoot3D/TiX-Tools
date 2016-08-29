// ==UserScript==
// @name         TiX Multi User
// @namespace    http://tampermonkey.net/
// @version      2.1
// @author       JRoot3D
// @match        https://tixchat.com/*
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
})();
