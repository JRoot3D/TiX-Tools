// ==UserScript==
// @name         TiX Keyboard Move
// @namespace    https://tixchat.com/
// @version      1.7
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Common_functions.user.js
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Keyboard_Move.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Keyboard_Move.user.js
// ==/UserScript==

(function() {
    'use strict';

    document.onkeydown = checkKey;

    var IGHORE_TARGETS = ['SELECT', 'INPUT', 'TEXTAREA'];
    var LISTEN_KEYS = [37, 38, 39, 40, 65, 68, 83, 87];

    var WASD = {
        name: 'WASD',
        left: 65,
        right: 68,
        up: 87,
        down: 83
    };

    var ARROWS = {
        name: 'ARROWS',
        left: 37,
        right: 39,
        up: 38,
        down: 40
    };

    var _moveSettings = ARROWS;
    var _moveModeMenu;

    function switchMoveMode() {
        if (_moveModeMenu.getFlag()) {
            _moveSettings = WASD;
        } else {
            _moveSettings = ARROWS;
        }

        new C.Notification({
            css_class: 'message',
            view: C.View('notification/system', {
                text: 'Current mode: ' + _moveSettings.name
            })
        }).show(2000);
    }

    var _moveMenu = CF_registerCheckBoxMenuCommand('Keyboard Move', false, createModeMenu);

    function createModeMenu() {
        if (_moveMenu.getFlag()) {
            var flag = false;
            if (_moveModeMenu) {
                flag = _moveModeMenu.getFlag();
                _moveModeMenu.unregister();
            }
            _moveModeMenu = CF_registerSwitcherMenuCommand('Switch to WASD', 'Switch to ARROWS', flag, switchMoveMode);
            switchMoveMode();
        } else {
			if (_moveModeMenu) {
				_moveModeMenu.unregister();
			}
        }
    }

    function getCurrentRoom() {
        var path = location.pathname;
        if (path.indexOf('room') != -1) {
            var arr = path.split("/");
            var roomID = arr[arr.length - 1];
            return C.rooms[roomID];
        }
        return null;
    }

    function roomMove(room, deltaX, deltaY) {
        if (deltaX !== 0 || deltaY !== 0) {
            var me = room.avatars[C.user.data.id];
            room.request('move', {
                'x': me.x + deltaX,
                'y': me.y + deltaY
            });
        }
    }

    function checkKey(e) {
        e = e || window.event;
        if (_moveMenu.getFlag() && LISTEN_KEYS.indexOf(e.keyCode) > -1 && IGHORE_TARGETS.indexOf(e.target.tagName) == -1) {
            var room = getCurrentRoom();

            if (room) {
                var keyCode = e.keyCode;
                var deltaX = keyCode == _moveSettings.left ? -1 : (keyCode == _moveSettings.right ? 1 : 0);
                var deltaY = keyCode == _moveSettings.up ? -1 : (keyCode == _moveSettings.down ? 1 : 0);
                roomMove(room, deltaX, deltaY);
            }
        }
    }
})();
