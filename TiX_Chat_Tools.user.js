// ==UserScript==
// @name         TiX Chat Tools
// @namespace    https://tixchat.com/
// @version      2.0
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
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Alertify_dialogs.user.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @resource     chatTextTemplate https://raw.githubusercontent.com/JRoot3D/TiX-Tools/master/chat_text_template.jst
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Chat_Tools.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Chat_Tools.user.js
// ==/UserScript==

(function() {
    'use strict';

    CF_addStyle('alertifyCSS');
    CF_addStyle('alertifyDefaultCSS');

    var fun = coastline.funMaker({
        add_this: true
    });

    var _chatTextColor = GM_getValue('chatTextColor', '#000080');
    setChatTextColor(_chatTextColor);

    function setChatTextColor(color) {
        _chatTextColor = color;
        var css = '.ChatMessage .text.my { color: ' + color + '; }';
        GM_addStyle(css);
    }

    function setChatTextColorMenu() {
        alertify.prompt('Select new Color', 'Color', _chatTextColor, function(event, value) {
            setChatTextColor(value);
            GM_setValue('chatTextColor', value);
        }, function() {}).set('type', 'color');
    }

    GM_registerMenuCommand('Set Message Color', setChatTextColorMenu);

    var _isHideMessageFromBlacklist = GM_getValue('isHideMessageFromBlacklist', false);

    function saveMenuFlag(value) {
        _isHideMessageFromBlacklist = value;
        GM_setValue('isHideMessageFromBlacklist', value);
    }
    var _hideMessageFromBlacklistMenu = CF_registerCheckBoxMenuCommand('Hide messages from Blacklist', _isHideMessageFromBlacklist, saveMenuFlag);
    GM_registerMenuCommand('Show Blacklist', showBlackListMenu);

	function showBlackListMenu() {
		var users = C.user.data.blacklist;
		if (users.length > 0) {
			var data = [];
			for (var i in users) {
				var id = users[i];
				var name = id;
				if(C.User.objects[id]) {
					name = C.User.objects[id].data.name;
				}
				data[i] = {
					'id': id,
					'name': name
				};
			}

			alertify.showBlacklist('Select User', 'User', data, function (e, id) {
				C.pageManager.openURI('/user/' + id);
			});
		}
	}

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
        }),
        makeChatMessage: fun(function(c, room, user, msg) {
            if (_hideMessageFromBlacklistMenu.getFlag()) {
                var userId = (msg.user && msg.user.id ? msg.user.id : msg.user);
                if (C.user.data.blacklist.indexOf(userId) == -1) {
                    room.makeChatSomething(c, user, msg, {
                        message: true
                    });
                }
            } else {
                room.makeChatSomething(c, user, msg, {
                    message: true
                });
            }
        })
    });

    jsface.extend(C.Room, RoomExtended);
})();
