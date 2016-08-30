// ==UserScript==
// @name         TiX Common functions
// @version      0.4
// @author       JRoot3D
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

function CF_addStyle(name) {
    var style = GM_getResourceText(name);
    GM_addStyle(style);
}

var _menuCommand = function(trueCaption, falseCaption, flag, callback) {
    var _flag = flag;
    var _callback = callback;
    var _id = undefined;

    var _trueCaption = trueCaption;
    var _falseCaption = falseCaption;

    function switchCommand() {
        if (_flag) {
            GM_unregisterMenuCommand(_id);
            _id = GM_registerMenuCommand(_trueCaption, switchCommand);
        } else {
            GM_unregisterMenuCommand(_id);
            _id = GM_registerMenuCommand(_falseCaption, switchCommand);
        }

        _flag = !_flag;

        if (_callback) {
            _callback.call(this, _flag);
        }
    }

    if (_flag) {
        _id = GM_registerMenuCommand(_falseCaption, switchCommand);
    } else {
        _id = GM_registerMenuCommand(_trueCaption, switchCommand);
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

function CF_registerCheckBoxMenuCommand(caption, flag, callback) {
    return new _menuCommand('☐ ' + caption, '☑ ' + caption, flag, callback)
}

function CF_registerSwitcherMenuCommand(trueCaption, falseCaption, flag, callback) {
    return new _menuCommand(trueCaption, falseCaption, flag, callback)
}

function CF_getCurrentRoom() {
	var path = location.pathname;
	if (path.indexOf('room') != -1) {
		var arr = path.split("/");
		var roomID = arr[arr.length-1];
		return C.rooms[roomID];
	}
	return null;
}
