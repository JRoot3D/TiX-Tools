// ==UserScript==
// @name         TiX Moder Tools
// @namespace    http://tampermonkey.net/
// @version      1.2
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Moder%20Tools.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Moder%20Tools.user.js
// ==/UserScript==

(function() {
	'use strict';

	function addStyle(name) {
		var style = GM_getResourceText(name);
		GM_addStyle(style);
	}

	addStyle('alertifyCSS');
	addStyle('alertifyDefaultCSS');

	function getCurrentRoom() {
		var path = location.pathname;
		if (path.indexOf('room') != -1) {
			var arr = path.split("/");
			var roomID = arr[arr.length-1];
			return C.rooms[roomID];
		}
		return null;
	}

	function kickUser(userId) {
		var room = getCurrentRoom();

		if (room.users[userId]) {
			room.request('kickUser', {
				uid: userId,
				reason: 'Auto Kick'
			}).grab('access denied', function () {
				C.Alert(T('Access denied'));
			});
		}
	}

	function banUser(userId) {
		var room = getCurrentRoom();

		if (room.users[userId]) {
			room.request('banUser', {
				uid: userId,
				reason: 'Auto Ban',
				till: false
			}).grab('access denied', function () {
				C.Alert(T('Access denied'));
			});
		}
	}

	function updateDisplayName(name) {
		var changes = {};
		changes.name = name;
		C.user.request('editProfile', changes);
	}

	function kickUserMenu() {
		alertify.prompt('Kick User', 'Enter User ID', '', function(evt, value) {
			kickUser(value);
		}, function() {
			alertify.error('Cancel');
		});
	}

	function banUserMenu() {
		alertify.prompt('Ban User', 'Enter User ID', '', function(evt, value) {
			banUser(value);
		}, function() {
			alertify.error('Cancel');
		});
	}

	var updateDisplayNameMenu = function() {
		alertify.prompt('Set new Name', 'Enter name', 'New Name', function(evt, value) {
			updateDisplayName(value);
		});
	};

	GM_registerMenuCommand('[T] Kick User', kickUserMenu);
	GM_registerMenuCommand('[T] Ban User', banUserMenu);
	GM_registerMenuCommand('[T] Set new Name', updateDisplayNameMenu);
})();
