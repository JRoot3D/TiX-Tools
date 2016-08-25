// ==UserScript==
// @name         TiX Room Join Notification
// @namespace    https://tixchat.com/
// @version      1.4
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_notification
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Room%20Join%20Notification.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Room%20Join%20Notification.user.js
// ==/UserScript==

(function() {
	'use strict';

	var fun = coastline.funMaker({ add_this: true });

	var RoomExtended = Class({
		event_joined: fun(function (c, room, msg) {
			var user = msg.user;

			room.users[user.id] = user;
			msg.avatar.room = room;
			C.Avatar.make(c, msg.avatar);
			c.q(function (c, avt) {
				room.avatars[user.id] = avt;
			});

			room.updateUserCount(c, room);
			room.$chatLog.find('.ChatMessage').filter('[data-author=' + user.id + ']').removeClass('offline');
			user.update(c, { online: true });

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
				c.q(function (c) {
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
