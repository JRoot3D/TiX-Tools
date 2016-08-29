// ==UserScript==
// @name         TiX Moder Tools
// @namespace    http://tampermonkey.net/
// @version      1.4
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Common_functions.user.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Moder_Tools.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Moder_Tools.user.js
// ==/UserScript==

(function() {
    'use strict';

    CF_addStyle('alertifyCSS');
    CF_addStyle('alertifyDefaultCSS');

    var refExp_img = new RegExp('jpg|png|gif|jpeg', 'ig');

    var _pictureFilter = CF_registerCheckBoxMenuCommand('Pictures Filter', false);

    function removeMessage(c, room, user, msg) {
        if (room.access.remove_message)
            room.request('removeMessage', {
                uid: user.id,
                time: msg.time
            }, function(data) {
                alertify.notify('Removed message from: ' + user.data.name);
            }).grab('access denied', function() {
                C.Alert(T('Access denied'));
            });
    }

    var fun = coastline.funMaker({
        add_this: true
    });

    var RoomModerator = Class({
        makeChatMessage: fun(function(c, room, user, msg) {
            room.makeChatSomething(c, user, msg, {
                message: true
            });

            var text = msg.text;

            //moderation
            if (room.access && room.access.remove_message) {
                if (_pictureFilter.getFlag() && (text.search(refExp_img) != -1 || text.length > 500)) {
                    removeMessage(c, room, user, msg);
                }
            }
        })
    });

    jsface.extend(C.Room, RoomModerator);
})();
