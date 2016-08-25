// ==UserScript==
// @name         TiX Keyboard Move
// @namespace    https://tixchat.com/
// @version      1.6
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Keyboard%20Move.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Keyboard%20Move.user.js
// ==/UserScript==

(function() {
    'use strict';

    document.onkeydown = checkKey;

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

    var myCommand = function(trueCaption, falseCaption, defaultFlag, callback) {
        var _flag = defaultFlag;
        var _callback = callback;
        var _id;

        function switchCommand() {
            if (_flag) {
                GM_unregisterMenuCommand(_id);
                _id = GM_registerMenuCommand(trueCaption, switchCommand);
            } else {
                GM_unregisterMenuCommand(_id);
                _id = GM_registerMenuCommand(falseCaption, switchCommand);
            }

            _flag = !_flag;

            if (_callback) {
                _callback.call(this);
            }
        }

        if (defaultFlag) {
            _id = GM_registerMenuCommand(falseCaption, switchCommand);
        } else {
            _id = GM_registerMenuCommand(trueCaption, switchCommand);
        }

        this.getFlag = function() {
            return _flag;
        };

        this.unregister = function() {
            GM_unregisterMenuCommand(_id);
        };

        this.setCallback = function(value) {
            _callback = value;
        };
    };

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

    var _moveMenu = new myCommand('Enable keyboard Move', 'Disable keyboard Move', false, createModeMenu);

    function createModeMenu() {
        if (_moveMenu.getFlag()) {
            var flag = false;
            if (_moveModeMenu) {
                flag = _moveModeMenu.getFlag();
                _moveModeMenu.unregister();
            }
            _moveModeMenu = new myCommand('Switch to WASD', 'Switch to ARROWS', flag, switchMoveMode);
            switchMoveMode();
        } else {
            _moveModeMenu.unregister();
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
        if (_moveMenu.getFlag() && ['SELECT', 'INPUT', 'TEXTAREA'].indexOf(e.target.tagName) == -1) {
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
