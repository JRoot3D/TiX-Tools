// ==UserScript==
// @name         TiX Moder Tools
// @namespace    http://tampermonkey.net/
// @version      1.6
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
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

    var _target;

    var refExp_img = new RegExp('jpg|png|gif|jpeg', 'ig');

    var pictureFilterFlag = GM_getValue('pictureFilterFlag', false);
    var longMessageFilter = GM_getValue('longMessageFilter', false);

    function saveFlags() {
        if (_pictureFilter) {
            GM_setValue('pictureFilterFlag', _pictureFilter.getFlag());
        }
        if (_longMessageFilter) {
            GM_setValue('longMessageFilter', _longMessageFilter.getFlag());
        }
    }

    var _pictureFilter = CF_registerCheckBoxMenuCommand('Pictures Filter', pictureFilterFlag, saveFlags);
    var _longMessageFilter = CF_registerCheckBoxMenuCommand('Long Message Filter', longMessageFilter, saveFlags);

    function removeMessage(c, room, user, msg, type) {
        if (room.access.remove_message)
            room.request('removeMessage', {
                uid: user.id,
                time: msg.time
            }, function(data) {
                alertify.error('Removed "' + type + '" message from:' + user.data.name);
            }).grab('access denied', function() {
                C.Alert(T('Access denied'));
            });
    }

    function setFollowTarget(flag) {
        if (flag) {
            alertify.prompt('Follow target', 'User ID', '', function(evt, value) {
                _target = value;
                findTarget(value);
            }, function() {
                _target = undefined;
                _followMenu.setMenuState(false);
            });
        } else {
            _target = undefined;
        }
    }

    function findTarget(userId) {
        var room = CF_getCurrentRoom();
        var targetAvatar = room ? room.avatars[userId] : undefined;
        if (targetAvatar) {
            roomRequestFollow(room, targetAvatar.x, targetAvatar.y);
        }
    }

    var _followMenu = CF_registerCheckBoxMenuCommand('Follow', false, setFollowTarget);

    function roomRequestFollow(room, x, y) {
        room.request('move', {
            'x': x,
            'y': y - 1
        }, function(data) {
            if (!data.moving) {
                room.request('move', {
                    'x': x,
                    'y': y + 1
                }, function(data) {
                    if (!data.moving) {
                        room.request('move', {
                            'x': x - 1,
                            'y': y
                        }, function(data) {
                            if (!data.moving) {
                                room.request('move', {
                                    'x': x + 1,
                                    'y': y
                                }, function(data) {
                                    if (!data.moving) {
                                        room.request('move', {
                                            'x': x - 1,
                                            'y': y - 1
                                        }, function(data) {
                                            if (!data.moving) {
                                                room.request('move', {
                                                    'x': x + 1,
                                                    'y': y - 1
                                                }, function(data) {
                                                    if (!data.moving) {
                                                        room.request('move', {
                                                            'x': x + 1,
                                                            'y': y + 1
                                                        }, function(data) {
                                                            if (!data.moving) {
                                                                room.request('move', {
                                                                    'x': x - 1,
                                                                    'y': y + 1
                                                                }, function(data) {
                                                                    if (!data.moving) {

                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    var fun = coastline.funMaker({
        add_this: true
    });

    var RoomModerator = Class({
        event_move: fun(function(c, room, msg) {
            room.avatars[msg.user.id].startMoving(msg);
            if (_target) {
                if (msg.user.id == _target) {
                    var last = msg.path.length - 1;
                    var x, y;
                    if (last > -1) {
                        x = msg.path[last][0];
                        y = msg.path[last][1];
                    } else {
                        x = msg.x;
                        y = msg.y;
                    }
                    roomRequestFollow(room, x, y);
                }
            }
        }),
        makeChatMessage: fun(function(c, room, user, msg) {
            room.makeChatSomething(c, user, msg, {
                message: true
            });

            var text = msg.text;

            //moderation
            if (room.access && room.access.remove_message) {
                if (_pictureFilter.getFlag() && (text.search(refExp_img) != -1)) {
                    removeMessage(c, room, user, msg, 'img');
                } else if (_longMessageFilter.getFlag() && text.length > 300) {
                    removeMessage(c, room, user, msg, 'long');
                }
            }
        })
    });

    jsface.extend(C.Room, RoomModerator);
})();
