// ==UserScript==
// @name         TiX Common functions
// @version      0.7
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
    var _flag, _callback;
    var _id = undefined;
    var _trueCaption, _falseCaption;

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

    this.init = function(trueCaption, falseCaption, flag, callback) {
        _callback = callback;
        _trueCaption = trueCaption;
        _falseCaption = falseCaption;
        this.setMenuState(flag);
    }

    this.setMenuState = function(flag) {
        _flag = flag;
        this.unregister();
        if (flag) {
            _id = GM_registerMenuCommand(_falseCaption, switchCommand);
        } else {
            _id = GM_registerMenuCommand(_trueCaption, switchCommand);
        }
    }

    this.getFlag = function() {
        return _flag;
    };

    this.unregister = function() {
        GM_unregisterMenuCommand(_id);
        _id = undefined;
    };

    this.setCallback = function(value) {
        _callback = value;
    };

    this.init(trueCaption, falseCaption, flag, callback);
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
        var roomID = arr[arr.length - 1];
        return C.rooms[roomID];
    }
    return null;
}

var _valueObject = function(name, defaultValue) {
    var _name, _defaultValue;
    var _valueChangeListener, _valueChangeListenerId;

    this.set = function(value) {
        GM_setValue(_name, value);
    }

    this.get = function() {
        return GM_getValue(_name, _defaultValue);
    }

    this.addListener = function(listener) {
        _valueChangeListener = listener;
        _valueChangeListenerId = GM_addValueChangeListener(_name, function(name, old_value, new_value, remote) {
            _valueChangeListener.call(this, name, old_value, new_value, remote);
        });
    }

    this.removeListener = function() {
        GM_removeValueChangeListener(_valueChangeListenerId);
    }

    this.init = function(name, defaultValue) {
        _name = name;
        _defaultValue = defaultValue;
    }

    this.init(name, defaultValue);
}

function CF_value(name, defaultValue) {
    return new _valueObject(name, defaultValue);
}
