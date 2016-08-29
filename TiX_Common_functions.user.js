// ==UserScript==
// @name         TiX Common functions
// @namespace    http://tampermonkey.net/
// @version      0.1
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

function CF_registerCheckBoxMenuCommand(caption, defaultFlag, callback) {
    return CF_registerSwitcherMenuCommand('☑' + caption, '☐' + caption, defaultFlag, callback)
}

function CF_registerSwitcherMenuCommand(trueCaption, falseCaption, defaultFlag, callback) {
    var _flag = defaultFlag || true;
    var _callback = callback;
    var _id;

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
            _callback.call(this);
        }
    }

    if (defaultFlag) {
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
}
