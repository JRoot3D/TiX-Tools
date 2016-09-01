// ==UserScript==
// @name         TiX Chat Tools
// @namespace    https://tixchat.com/
// @version      1.7
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Common_functions.user.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @resource     chatTextTemplate https://raw.githubusercontent.com/JRoot3D/TiX-Tools/master/chat_text_template.jst
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Room_Join_Notification.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Room_Join_Notification.user.js
// ==/UserScript==

(function() {
    'use strict';

    CF_addStyle('alertifyCSS');
    CF_addStyle('alertifyDefaultCSS');

    var fun = coastline.funMaker({
        add_this: true
    });

    var chatTextColor = GM_getValue('chatTextColor', '#000080');
    setChatTextColor(chatTextColor);

    function setChatTextColor(color) {
        var css = '.ChatMessage .text.my { color: ' + color + '; }';
        GM_addStyle(css);
    }

    function setChatTextColorMenu() {
        alertify.prompt('Select new Color', 'Color', '', function(event, value) {
            setChatTextColor(value);
            GM_setValue('chatTextColor', value);
        }, function() {}).set('type', 'color');
    }

    GM_registerMenuCommand('Set Message Color', setChatTextColorMenu);

    var chatTextTemplate = GM_getResourceText('chatTextTemplate');
    C.templates['chat/text'] = chatTextTemplate;
    C.View.populate(C.templates);

    var RoomExtended = Class({
        event_joined: fun(function(c, room, msg) {
            var user = msg.user;

            room.users[user.id] = user;
            msg.avatar.room = room;
            C.Avatar.make(c, msg.avatar);
            c.q(function(c, avt) {
                room.avatars[user.id] = avt;
            });

            room.updateUserCount(c, room);
            room.$chatLog.find('.ChatMessage').filter('[data-author=' + user.id + ']').removeClass('offline');
            user.update(c, {
                online: true
            });

            if (C.contacts[user.id]) {
                var details = {};
                details.text = room.data.name;
                details.title = user.data.name;
                var ba = new C.BigAvatar(user, {
                    height: 64,
                    width: 64,
                    offset: -28,
                    headOnly: true
                });
                c.wait(ba);
                c.q(function(c) {
                    details.image = C.canvasToBlob(ba.canvas);
                    details.onclick = function() {
                        C.pageManager.openURI('/room/' + room.id);
                        room.chatMessageInput.highlightUser(user);
                    };
                    GM_notification(details);
                });

                if (!user.leftRooms || !user.leftRooms[room.id] || Date.now() - user.leftRooms[room.id] > 5000) {
                    room.makeChatAction(c, msg.user, msg);
                }
            }

            room.forceRedraw(c);

            user.initAvatar();
        })
    });

    jsface.extend(C.Room, RoomExtended);
})();
