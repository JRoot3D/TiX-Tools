// ==UserScript==
// @name         TiX Chat Tools
// @namespace    https://tixchat.com/
// @version      3.4
// @author       JRoot3D
// @match        https://tixchat.com/*
// @match        https://names.illemius.xyz/*
// @grant        GM_addValueChangeListener
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_log
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Common_functions.user.js
// @require      https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Alertify_dialogs.user.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @resource     chatTextTemplate https://raw.githubusercontent.com/JRoot3D/TiX-Tools/master/chat_text_template.ejs
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Chat_Tools.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Chat_Tools.user.js
// ==/UserScript==

(function () {
    'use strict';

    if (!CF_checkVersion(0.9)) {
        return;
    }

    unsafeWindow.isChatToolsLoaded = true;
    if (unsafeWindow.isModerToolsLoaded) {
        alertify.error('Chat Tools conflict with Moder Tools');
    }

    var OWN_TEXT_COLOR = {
        name: 'ownTextColor',
        color: '#000080',
        tag: 'my'
    };
    var FRIENDS_TEXT_COLOR = {
        name: 'friendsTextColor',
        color: '#400080',
        tag: 'friend'
    };

    var HIDE_MESSAGE_FROM_BLACK_LIST = 'isHideMessageFromBlacklist';
    var ENABLE_POPUP_NOTIFICATIONS = 'isEnabledPopupNotifications';
    var SHOW_GREED = 'isNeedToShowGreed';
    var SHOW_DEBUG_LOG = 'isNeedToShowDebugLog';

    CF_addStyle('alertifyCSS');
    CF_addStyle('alertifyDefaultCSS');

    var fun = coastline.funMaker({
        add_this: true
    });

    var _ownTextColor = CF_value(OWN_TEXT_COLOR.name, OWN_TEXT_COLOR.color, OWN_TEXT_COLOR.tag);
    _ownTextColor.addListener(valuesListener);
    var _friendsTextColor = CF_value(FRIENDS_TEXT_COLOR.name, FRIENDS_TEXT_COLOR.color, FRIENDS_TEXT_COLOR.tag);
    _friendsTextColor.addListener(valuesListener);

    setStyleColor(_ownTextColor.get(), _ownTextColor.getTag());
    setStyleColor(_friendsTextColor.get(), _friendsTextColor.getTag());

    function valuesListener(name, value, tag) {
        setStyleColor(value, tag);
    }

    function setStyleColor(color, tag) {
        var css = '.ChatMessage .text.' + tag + ' { color: ' + color + '; }';
        GM_addStyle(css);
    }

    function setOwnTextColorMenu() {
        showSetColorDialog(_ownTextColor);
    }

    function setFriendsTextColorMenu() {
        showSetColorDialog(_friendsTextColor);
    }

    function showSetColorDialog(color) {
        alertify.prompt('Select new Color', 'Color', color.get(), function (event, value) {
            color.set(value);
        }, function () {
        }).set('type', 'color');
    }

    GM_registerMenuCommand('Set own Text Color', setOwnTextColorMenu);
    GM_registerMenuCommand('Set friens Text Color', setFriendsTextColorMenu);

    var _isHideMessageFromBlacklist = CF_value(HIDE_MESSAGE_FROM_BLACK_LIST, false);

    function saveMenuFlag(value) {
        _isHideMessageFromBlacklist.set(value);
    }

    var _hideMessageFromBlacklistMenu = CF_registerCheckBoxMenuCommand('Hide messages from Blacklist', _isHideMessageFromBlacklist.get(), saveMenuFlag);
    GM_registerMenuCommand('Show Blacklist', showBlackListMenu);

    var _isEnabledPopupNotifications = CF_value(ENABLE_POPUP_NOTIFICATIONS, false);

    var savePopupFlag = function (value) {
        _isEnabledPopupNotifications.set(value);
    };

    var _enablePopupNotifications = CF_registerCheckBoxMenuCommand('Enable Popup notifications', _isEnabledPopupNotifications.get(), savePopupFlag);

    var _isNeedToShowGreed = CF_value(SHOW_GREED, false);
    var saveGreedFlag = function (value) {
        C.client.drawGrid = value;
        _isNeedToShowGreed.set(value);
    };
    var _showGrid = CF_registerCheckBoxMenuCommand('Show Grid', _isNeedToShowGreed.get(), saveGreedFlag);

    var _isNeedToShowDebugLog = CF_value(SHOW_DEBUG_LOG, false);
    var saveDebugLogFlag = function (value) {
        C.debug = value;
        _isNeedToShowDebugLog.set(value);
    };
    var _showDebugLog = CF_registerCheckBoxMenuCommand('Show Debug Log', _isNeedToShowDebugLog.get(), saveDebugLogFlag);

    var requestNewName = function () {
        var sex = C.user.data.sex;

        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://names.illemius.xyz/getName?sex=' + sex,
            onreadystatechange: function (response) {
                if (response.readyState !== 4)
                    return;

                var nameObject = JSON.parse(response.responseText);
                var name = nameObject.full;

                alertify.success(name).delay(10).callback = function (isClicked) {
                    if (isClicked) {
                        C.user.request('editProfile', {name: name});
                    }
                };
            }
        });
    };

    GM_registerMenuCommand('Random Name', requestNewName);

    var initCustomContent = function () {
        var GenerateNewName = '<a class="el users"><span class="Square FA FA-random"></span><span class="title">Random Name</span></a>';
        var linkSelectUser = $('.Menu .capsule .top').after(GenerateNewName).next();
        linkSelectUser.on('click', function (e) {
            requestNewName();
        });
        initCustomContent = undefined;
    };

    var updateDebugSettings = function () {
        C.client.drawGrid = _isNeedToShowGreed.get();
        C.debug = _isNeedToShowDebugLog.get();

        if (initCustomContent) {
            initCustomContent();
        }
    };

    var _teleportPosition = {
        x: 0,
        y: 0
    };

    var doTeleportation = function () {
        var position = _teleportPosition.x + ' ' + _teleportPosition.y;
        alertify.prompt('Teleport', 'Enter position', position
            , function (evt, value) {
                var v = value.split(' ');

                if (v.length === 2) {
                    var X = parseInt(v[0]);
                    var Y = parseInt(v[1]);

                    var currentRoom = CF_getCurrentRoom();
                    if (currentRoom) {
                        C.localSettings.avatarPosition[currentRoom.id] = {x: X, y: Y};
                        C.saveSettings();
                        location.reload();
                    }
                }
            }
            , function () {
            });
    };

    GM_registerMenuCommand('Teleport', doTeleportation);

    function showBlackListMenu() {
        var users = C.user.data.blacklist;
        if (users.length > 0) {
            var data = [];
            for (var i in users) {
                var id = users[i];
                var name = id;
                if (C.User.objects[id]) {
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

    var NewUserPage = Class(C.User.Page, {
        constructor: function (user, show) {
            var page = this;
            C.loadingOverlay.add();
            page.user = user;
            page.id = user.id;
            page._rebindNavigationObject();
            page.$container = C.View('pm', {
                them: user.data,
                us: C.user.data,
                chat: C.View('chat', {access: {}, room: false}, {$: false})
            }).appendTo(C.client.$container);

            page.$container.find('.us .name').after((new C.BigAvatar(C.user, {width: 256})).$canvas);
            page.$container.find('.them .name').after((new C.BigAvatar(user, {width: 256})).$canvas);

            page.$userStatusBlock = page.$container.find('.contacts');

            page.$userStatusBlock.on('click', function () {
                var method = (C.contacts[user.id] ? 'remove' : 'add');
                user.request(method + 'Contact', {}, function () {
                    method == 'add' ? C.contacts[user.id] = user : delete C.contacts[user.id];
                    C.logAction(method + ' contact');
                    //C.client.QuickProfile.updateContactList();
                });
            });

            page.$container.find('.removeRecent').on('click', function () {
                C.pageManager.remove(user.id);
                C.client.Navigation.toggleColors(user.id, 'user', false);
                //C.user.request('hideUserChat', { uid: user.id }, function () {});
            });

            page.$container.find('.settings').on('click', function (e) {
                page.$container.find('.chatMenu').toggleClass('open');
            });
            page.$container.find('.clear').on('click', function () {
                page.$chatLog.empty();
                page.$container.find('.chatMenu').removeClass('open');
            });

            page.$container.find('.blacklist').on('click', function () {
                user.request('blacklist', {}, function () {
                    page.$container.find('.blacklist').toggleClass('FA-minus FA-plus');
                });
            });

            var userKarma = page.$container.find('.them .karma');
            var ourKarma = page.$container.find('.us .karma');

            userKarma
                .on('click', '.minus', function () {
                    var counter = 0;
                    alertify.prompt('Minus Karma', 'Enter amount', '1'
                        , function (evt, value) {
                            var interval = setInterval(function () {
                                counter++;

                                user.request('karmaTransaction', {'amount': '-1', 'action': 'minusKarma'}, function () {
                                    C.client.minusCookie('1');
                                }).grab('not enough coins', function () {
                                    C.Alert(T('You do not have enough cookies'));
                                });

                                if (counter >= value) {
                                    clearInterval(interval);
                                    alertify.notify('Done');
                                }
                            }, 200);
                        }
                        , function () {
                        });
                })
                .on('click', '.plus', function () {
                    var counter = 0;
                    alertify.prompt('Plus Karma', 'Enter amount', '1'
                        , function (evt, value) {
                            var interval = setInterval(function () {
                                counter++;

                                user.request('karmaTransaction', {'amount': '1', 'action': 'plusKarma'}, function () {
                                    C.client.minusCookie('1');
                                }).grab('not enough coins', function () {
                                    C.Alert(T('You do not have enough cookies'));
                                });

                                if (counter >= value) {
                                    clearInterval(interval);
                                    alertify.notify('Done');
                                }
                            }, 200);
                        }
                        , function () {
                        });

                });

            _.each({us: ourKarma, them: userKarma}, function (data, uid) {
                var u = (uid == 'us' ? C.user : user);
                u.bind('karma', function (karma) {
                    $(data).find('.value').text(karma);
                    $(data).find('.Karma')
                        .removeClass(function (index, css) {
                            return (css.match(/stage-\d/g) || []).join(' ');
                        })
                        .addClass('stage-' + C.karmaStage(karma | 0));
                });
            });

            var setContactStatus = function () {
                var contStatus = $.inArray(user.id, C.user.data.contacts);
                if (contStatus != -1) {
                    page.$userStatusBlock
                        .text(T('Unfollow'))
                        .removeClass('FA FA-plus')
                        .addClass('remove FA FA-minus');
                }
                else {
                    page.$userStatusBlock
                        .text(T('Follow'))
                        .removeClass('remove FA FA-minus')
                        .addClass('FA FA-plus');
                }
            };
            C.user.bind('contacts', setContactStatus);
            setContactStatus();

            page.$onlineStatus = page.$container.find('.online-status');
            var setOnlineStatus = function () {
                page.$onlineStatus.text(T('user ' + (user.data.online ? 'online' : 'offline')));
            };
            user.bind('online', setOnlineStatus);
            setOnlineStatus();

            page.autoScroll = true;

            page.$chatLog = page.$container.find('.log');
            page.$chatContainer = page.$container.find('.Chat');
            page.$chatComposeMessage = page.$container.find('.compose');
            page.chatMessageInput = new C.Input({
                multiline: true
            });
            page.$chatMessageInput = page.chatMessageInput.$input.attr('placeholder', T('Say something'));
            page.$chatMessageInput.prependTo(page.$chatComposeMessage);
            page.$chatMessageInput.on('inputresize', function () {
                var h = page.$chatMessageInput.outerHeight(true);
                var cl = page.$chatLog.get(0);
                var scroll = cl.scrollHeight - page.$chatLog.scrollTop() - page.$chatLog.innerHeight() < 100;
                page.$chatComposeMessage.height(h);
                page.$chatContainer.find('.content').css('bottom', h + 'px');
                if (scroll) { // magic :(
                    cl.scrollTop = cl.scrollHeight;
                }
            });

            page.$chatLog.on('scroll', _.debounce(function () {
                var cl = page.$chatLog[0];
                page.autoScroll = (cl.scrollTop + cl.clientHeight >= cl.scrollHeight);
            }, 5));

            page.$chatContainer.on('click', '.clear', function () {
                page.$chatLog.empty();
            });

            page.$chatComposeMessage.on('submit', function (e) {
                page.privateMessaging = 0;// 0 - enable for all, 1 - only contacts, 2 - disable 4 all
                if (user.data.settings && user.data.settings.privateMessaging) {
                    page.privateMessaging = user.data.settings.privateMessaging;
                }

                if (page.privateMessaging == 2) {
                    page.$chatMessageInput.val('');
                    return false;
                }

                var text = page.chatMessageInput.input.value.trim();
                if (!text.length) {
                    return false;
                }

                if (C.user.data.settings && C.user.data.settings.privateMessaging) {
                    if (C.user.data.settings.privateMessaging == 1 && (!C.contacts[user.id])) {
                        page.$chatLog.append($('<div class="ChatMessage"/>').text(T('can receive messages from contacts only')));
                    }
                    else if (C.user.data.settings.privateMessaging == 2) {
                        page.$chatLog.append($('<div class="ChatMessage"/>').text(T('can\'t receive messages')));
                    }
                }

                var req = page.say(text.replace(/(^[ \t]*\n)/gm, ""));
                page.$chatComposeMessage.find('textarea, button').prop('disabled', true);
                req.then(function () {
                    page.$chatComposeMessage.find('textarea, button').prop('disabled', false);
                    page.$chatMessageInput.val('');
                    page.chatMessageInput.resize();
                    page.$chatMessageInput[0].focus();
                });

                return false;
            });

            user.request('getHistory', {}, function (res) {
                page.$chatLog.html('');
                _.each(res ? res.messages : [], function (msg) {
                    var user = C.User.get(msg.user);
                    page.makeChatMessage(user, msg);
                });
                var cl = page.$chatLog.get(0);
                cl.scrollTop = cl.scrollHeight;
            });

            page.$chatContainer.on('click', '.text img', function (e) {
                var image = $(this);
                var description = false;
                if ($(e.target).closest('.text').text().trim().length > 0) {
                    description = $(e.target).closest('.text').text().trim();
                }
                var view = C.View('popup/image', {
                    orig: image.data('orig'),
                    fullsize: image.data('fullsize'),
                    description: description
                });

                var popup = new C.Popup(view, {
                    popupClass: 'image',
                    backdropClass: 'halfTransparent'
                });

                view.on('click', 'img', popup.close.bind(popup));
            });

            C.loadingOverlay.remove();
            page.uri = '/user/' + user.id;

            C.pageManager.add(page, user.id, {show: show, title: user.data.name});
            C.client.Navigation.toggleColors(page.id, 'user', true);
        }
    });

    var UserExtended = Class({
        open: function (show) {
            var pm = C.pageManager;
            show = !!show;

            if (C.user == this) {
                pm.openURI('/wardrobe');
            }
            else if (pm.pages[this.id]) {
                if (show) {
                    return pm.openURI('/user/' + this.id);
                }
                else {
                    return pm.pages[this.id];
                }
            }
            else {
                return new NewUserPage(this, show);
            }
        }
    });

    var RoomExtended = Class({
        init: fun(function (c, room, data) {
            updateDebugSettings();
            var lastScroll = 0;
            //var closeRoom = function () {
            //	room.request('leave');
            //	room.logAction('leave');
            //};
            C.Persistent.prototype.init.call(room, c, data);

            c.q(function (c) {
                C.loadingOverlay.add('room started');
                C.rooms[room.id] = room;
                room.zoom = room.prevZoom = 3;//Math.ceil(Math.random() * 2);
                room._rebindNavigationObject();
                room.$container = C.View('page/room/default', {
                    rid: room.id,
                    chat: C.View('chat', {
                        room: true,
                        access: {
                            topic: true
                        }
                    }, {$: false})
                });
                room.autoScroll = true;

                room.$foundation = room.$container.find('.foundation');
                room.$canvas = room.$foundation.children('canvas');
                room.$topbar = room.$container.find('.topbar');
                room.$base = room.$container.find('.base');
                room.$resizer = room.$container.find('.resizer');
                room.$chatPlaceHolder = room.$container.find('.chat');

                room.$chat = C.View('chat', {room: true, access: {}});

                room.$chatPlaceHolder.append(room.$chat);

                room.$canvasPlaceholder = room.$container.find('.canvasPlaceholder');

                room.foundationOffset = room.$foundation.offset();

                room.$chatLog = room.$chat.find('.log');
                room.$chatContent = room.$chat.find('.content');
                room.$topic = room.$chat.find('.Topic');

                room.$chatComposeMessage = room.$chat.find('.compose');
                room.chatMessageInput = new C.Input({
                    multiline: true
                });
                room.$chatReplyingTo = room.$chat.find('.replying-to');

                room.$chatMessageInput = room.chatMessageInput.$input.attr('placeholder', T('Say something'));
                room.$chatMessageInput.prependTo(room.$chatComposeMessage);
                room.$chatMessageInput
                    .on('inputresize', function () {
                        var h = room.$chatMessageInput.outerHeight(true);
                        var cl = room.$chatLog.get(0);
                        var scroll = cl.scrollHeight - room.$chatLog.scrollTop() - room.$chatLog.innerHeight() < 100;
                        room.$chatComposeMessage.height(h);
                        room.$chatContent.css('bottom', h + 'px');
                        if (scroll) { // magic :(
                            cl.scrollTop = cl.scrollHeight;
                        }
                    });

                room.$chat
                    .on('click', '.ChatTopic .vote', function (e) {
                        room.request('voteComment', {
                            user: $(e.target).closest('.ChatTopic').data('author'),
                            time: $(e.target).closest('.ChatTopic').data('time'),
                            tid: $(e.target).closest('.ChatTopic').data('tid')
                        }, function () {
                            C.client.minusCookie('1');
                        }).grab('not enough coins', function (data) {
                            C.Alert(T('You do not have enough cookies for voting'));
                        });
                    })
                    .on('click', '.ChatTopic .voteVoting', function (e) {
                        var req = room.request('voteOption', {
                            vIndex: $(e.target).data('index'),
                            vid: $(e.target).closest('.voting').data('voting'),
                            time: $(e.target).closest('.ChatTopic').data('time')
                        });
                        req.grab('only once', function () {
                            C.Alert('Only once');
                        });
                        req.grab('single vote voting', function () {
                            C.Alert('Single option voting');
                        });
                    })
                    .on('click', '.Topic .ChatTopic .collapseTopic', function () {
                        if ($(room.$topic.find('.youtubeMessage')).length > 0) {
                            room.$topic.find('.ChatTopic').addClass('video');
                        }
                        room.$topic.addClass('collapsed');
                    })
                    .on('click', '.Topic.collapsed', function () {
                        room.$topic.removeClass('collapsed');
                        room.$topic.find('.ChatTopic').removeClass('video');
                    })
                    .on('click', '.ChatTopic .editTopic', function () {
                        var topic = $(this).parents('.ChatTopic');
                        var content = topic.find('.text').clone();
                        var vid = topic.find('.voting').data('voting');
                        content.html(content.html()
                            .replace(/<img [^>]*data-orig="([^"]+)"[^>]*>/g, '$1')
                            .replace(/<br>/g, '\n')
                        );
                        var view = C.View('popup/room/topic', {
                            t: {
                                title: T('Edit topic'),
                                action: T('Save')
                            },
                            content: content.text(),
                            voting: {
                                show: false,
                                vid: vid
                            }
                        });
                        var popup = new C.Popup(view, {popupClass: 'topic'});
                        view.on('click', '.go', function (e) {
                            var content = view.find('.content').val();
                            var showAuthor = view.find('.showAuthor').is(':checked');
                            if (content == '') return;
                            popup.lock();

                            var request = room.request('editTopic', {
                                id: topic.data('tid'),
                                content: content,
                                showAuthor: showAuthor
                            }, function () {
                                popup.close();
                            });

                            request.grab('access denied', function () {
                                C.Alert(T('Insufficient access'));
                                popup.unlock();
                            });
                            request.grab('empty topic', function () {
                                C.Alert(T('Invalid topic'));
                                popup.unlock();
                            });
                        });
                    })
                    .on('click', '.ChatTopic .removeTopic', function () {
                        var topic = $(this).parents('.ChatTopic');

                        var popup = C.Confirm(T('Delete topic?'));

                        popup.$container.on('click', '.confirm', function (e) {
                            popup.lock();
                            room.request('deleteTopic', {
                                id: topic.data('tid')
                            }, function () {
                                popup.close();
                            }).grab('access denied', function () {
                                C.Alert(T('Insufficient access'));
                            });
                        });
                    })
                    .on('click', '.text a.youtubeMessage', function (e) {
                        var $link = $(e.target).closest('a');
                        var $previous = room.$container.find('.Popup.preview');
                        $previous.length && C.Popup._close($previous);

                        var match = $link.get(0).href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
                        var popup = new C.Popup(C.View('popup/video/youtube', {
                            id: match[1]
                        }), {
                            popupClass: 'video preview',
                            $parent: $(window).width() > 800 ? room.$foundation : $(document.body),
                            backdropClass: 'halfTransparent'
                        });

                        return false;
                    })
                    .on('click', '.text img:not([nopopup])', function (e) {
                        var image = $(this);
                        var $previous = room.$container.find('.Popup.preview');

                        if ($previous.data('image') == image.data('orig')) {
                            return false;
                        }
                        else {
                            $previous.length && C.Popup._close($previous);
                        }

                        var description = false;
                        if ($(e.target).closest('.text').text().trim().length > 0) {
                            description = $(e.target).closest('.text').text().trim();
                        }

                        var popup = new C.Popup(C.View('popup/image', {
                            orig: image.data('orig'),
                            fullsize: image.data('fullsize'),
                            description: description
                        }), {
                            popupClass: 'image preview',
                            $parent: $(window).width() > 800 ? room.$foundation : $(document.body),
                            backdropClass: 'halfTransparent'
                        });

                        popup.$container
                            .toggleClass('hasDescription', !!description)
                            .data('image', image.data('orig'))
                            .on('transitionend', function () {
                                if (popup.$container.find('img').height() > (C.client.$container.height() - 60)) {
                                    popup.$container.addClass('packed');
                                }
                            })
                            .on('click', '.content', function (e) {
                                if (popup.$container.hasClass('packed')) {
                                    popup.$container.addClass('fullsize').removeClass('packed');
                                }
                                else {
                                    popup.close();
                                }
                            });
                    })
                    .on('click', '.settings', function (e) {
                        room.$container.find('.chatMenu').toggleClass('open');
                    })
                    .on('click', '.clear', function () {
                        room.$chatLog.empty();
                        room.$container.find('.chatMenu').removeClass('open');
                    });

                room.replyingTo = null;

                room.$chatReplyingTo.on('click', function () {
                    room.replyingTo = null;
                    room.$chatReplyingTo.hide();
                });
                room.$chatComposeMessage.on('submit', function (e) {
                    var text = room.chatMessageInput.input.value.trim();
                    if (!text.length) {
                        return false;
                    }
                    var command = text.split(' ');

                    if (command[0] == '/clear') {
                        room.$chatLog.empty();
                        room.$chatMessageInput.val('');
                        room.chatMessageInput.resize();
                        room.scrollChat();
                    }
                    else {
                        var req = room.say(text.replace(/(^[ \t]*\n)/gm, ""));
                        room.$chatComposeMessage.find('textarea, button').prop('disabled', true);
                        req.then(function () {
                            room.$chatComposeMessage.find('textarea, button').prop('disabled', false);
                            room.$chatMessageInput.val('');
                            room.chatMessageInput.resize();
                            room.$chatMessageInput[0].focus();
                        });
                    }

                    return false;
                });

                room.controls.init.apply(room);

                room.$chatLog
                    .on('scroll', _.throttle(function () {
                        var cl = room.$chatLog[0];
                        room.autoScroll = (cl.scrollTop + cl.clientHeight >= cl.scrollHeight);

                        var topics = _.filter(room.$chatLog.find('.ChatTopic'), function (topic) {
                            topic = $(topic);
                            return (topic.position().top + 26) < 0;
                        });
                        var newTopic = $(_.last(topics));
                        if (!room.$topic.find('.ChatTopic') || newTopic.data('tid') != room.$topic.find('.ChatTopic').data('tid')) {
                            room.$topic.html(newTopic.clone());
                        }
                    }, 5, true)) // approx 200hz
                    .on('dblclick', '.Head, .user.author', function (e) {
                        var user = C.User.get($(this).closest('.message, .event').data('author'));
                        user.open(true);

                        if (room.lastAuthorClick && Date.now() - room.lastAuthorClick.time < 1000) {
                            room.replyingTo = room.lastAuthorClick.replyingTo;
                            room.chatMessageInput.highlightedUserNames = room.lastAuthorClick.highlightedUserNames;
                            room.chatMessageInput.$input.val(room.lastAuthorClick.text);
                            if (room.replyingTo) {
                                room.$chatReplyingTo.find('span').text(T('in reply to') + ' ' + room.chatMessageInput.text);
                                room.$chatReplyingTo.show();
                            }
                            else {
                                room.$chatReplyingTo.hide();
                            }
                        }
                    })
                    .on('mouseenter', '.event', function (e) {
                        if ($(e.currentTarget).data('player') &&
                            room.things[$(e.currentTarget).data('player')]) {
                            var thing = room.things[$(e.currentTarget).data('player')];
                            room.hoveredThing = thing;
                            thing.hover = true;
                        }
                    })
                    .on('mouseleave', '.event', function (e) {
                        if ($(e.currentTarget).data('player') &&
                            room.things[$(e.currentTarget).data('player')]) {
                            var thing = room.things[$(e.currentTarget).data('player')];
                            room.hoveredThing = null;
                            thing.hover = false;
                        }
                    })
                    .on('mouseenter', '.Head, .user.author, .text .user', function (e) {
                        var avatar = room.avatars[$(e.currentTarget).data('id')];
                        if (avatar) {
                            room.hoveredAvatar = avatar;
                        }
                    })
                    .on('mouseleave', '.Head, .user.author, .text .user', function (e) {
                        if (room.hoveredAvatar) {
                            room.hoveredAvatar = null;
                        }
                    })
                    .on('click', '.author', function (e) {
                        if (room.lastAuthorClick && Date.now() - room.lastAuthorClick.time < 1000) {
                            return;
                        }
                        if ($(e.target).hasClass('user')) {
                            room.lastAuthorClick = {
                                time: Date.now(),
                                replyingTo: room.replyingTo,
                                highlightedUserNames: _.clone(room.chatMessageInput.highlightedUserNames),
                                text: room.chatMessageInput.$input.val()
                            };
                            var $message = $(e.target).closest('.message, .event, .ChatTopic');
                            var $text = $message.find('.text').first();
                            var user = C.User.get($message.data('author'));
                            room.replyingTo = {
                                user: user.id,
                                time: $text.data('time')
                            };
                            room.$chatReplyingTo.find('span').text(T('in reply to') + ' ' + $text.text());
                            room.$chatReplyingTo.show();
                            room.chatMessageInput.highlightUser(user);
                        }
                    })
                    .on('click', '.Head', function (e) {
                        var $message = $(e.target).closest('.message');
                        var user = C.User.get($message.data('author'));
                        if (user.id != C.user.id) {
                            C.User.Popup(user, room);
                        }
                    })
                    .on('click', '.deleteMessage', function (e) {
                        room.request('removeMessage', {
                            uid: $(e.target).closest('.message').data('author'),
                            time: $(e.target).siblings('.text').data('time')
                        });
                    })
                    .on('click', '.ChatMessage .vote', function (e) {
                        var counter = 0;

                        alertify.prompt('Vote Cookie', 'Enter amount', '1'
                            , function (evt, value) {
                                var interval = setInterval(function () {
                                    counter++;
                                    room.request('voteComment', {
                                        user: $(e.target).closest('.message').data('author'),
                                        time: $(e.target).next('.text').data('time')
                                    }, function () {
                                        C.client.minusCookie('1');
                                    }).grab('not enough coins', function (data) {
                                        C.Alert(T('You do not have enough cookies for voting'));
                                    });

                                    if (counter >= value) {
                                        clearInterval(interval);
                                        alertify.notify('Done');
                                    }
                                }, 200);
                            }
                            , function () {
                            });
                    })
                    .on('click', '.in-reply-to, .reply-to-message', function (e) { // FIXME
                        var $text = $(this).closest('.message');
                        var view = C.View('popup/room/conversation');
                        var $replies = view.find('.replies');
                        var rtt;
                        do {
                            var $cmsg = $text.closest('.message').clone();
                            $cmsg.find('.in-reply-to, .reply-to-message').remove();
                            $cmsg.find('.text').removeClass('highlighted');
                            $replies.prepend($cmsg);
                            if (rtt = $cmsg.data('reply-to')) {
                                $text = room.$chatLog.find('.text[data-time=' + rtt + ']');
                            }
                            else {
                                break;
                            }
                        } while ($text.length);
                        new C.Popup(view, {popupClass: 'conversation'});
                    });

                room.$foundation
                    .on('mousemove mousedown', 'canvas', function (e) {
                        var sizex = room.zoom * 16;
                        var sizey = room.zoom * 12;
                        var cpos = room.$foundation.offset();
                        var dpr = window.devicePixelRatio || 1;
                        var px = Math.round((e.pageX - cpos.left) * dpr + room.scrollX);
                        var py = Math.round((e.pageY - cpos.top) * dpr + room.scrollY);
                        var x = Math.floor(px / sizex);
                        var y = Math.floor(py / sizey);
                        var hcell;

                        var pht = room.hoveredThing;
                        var pha = room.hoveredAvatar;

                        if (room.hoveredCell) {
                            room.hoveredCell.hover = false;
                            room.hoveredCell = null;
                        }
                        if (room.hoveredThing) {
                            room.hoveredThing.hover = false;
                            room.hoveredThing = null;
                        }
                        if (hcell = room.hoveredCell = room.cell(x, y)) {
                            room.hoveredCell.hover = true;
                        }
                        room.$foundation.removeClass('cursor-crosshair cursor-pointer');
                        if (!room.hoveredCell) {
                            return;
                        }

                        var avatar = room.hoveredAvatar = null;
                        var thing = room.hoveredThing = null;

                        var ix, iy;
                        var match = {};
                        for (ix = x - 4; ix <= x + 4; ix++) { // adjust magic numbers to catch all objects
                            for (iy = y - 2; iy <= y + 5; iy++) {
                                var cell;
                                if (cell = room.cell(ix, iy)) {
                                    _.each(cell.things, function (thing) {
                                        if (match[thing.id]) {
                                            return;
                                        }
                                        if (!thing.testHit) {
                                            return;
                                        }
                                        if (thing.testHit(
                                                px - ix * sizex,
                                                py - iy * sizey,
                                                ix,
                                                iy
                                            )) {
                                            match[thing.id] = thing;
                                        }
                                    });
                                }
                            }
                        }
                        match = _.values(match);
                        match.sort(function (b, a) {
                            if (a.y != b.y) {
                                return a.y - b.y;
                            }
                            if (a.z != b.z) {
                                return a.z - b.z;
                            }
                            return a.x - b.x;
                        });
                        if (match[0] && match[0].isAvatar) avatar = room.hoveredAvatar = match[0];
                        else thing = room.hoveredThing = match[0];

                        var interiorContainer = room.$container.find('.panelInterior');
                        if (thing && !avatar) {
                            thing.hover = true;
                            if (interiorContainer.length) {
                                interiorContainer.find('.in-room .list .item[data-tid="' + thing.id + '"]').addClass('hovered');
                            }
                        }

                        room.hoveredAvatar = null;
                        if (avatar) {
                            room.hoveredAvatar = avatar;
                            room.$foundation.addClass('cursor-pointer');
                        }
                        else if (thing) {
                            room.$foundation.addClass('cursor-' + (thing.cursor || 'pointer'));
                        }
                        else {
                            room.$foundation.addClass('cursor-crosshair');
                        }

                        if (room.hoveredThing != pht || room.hoveredAvatar != pha) {
                            if (interiorContainer.length) {
                                interiorContainer.find('.in-room .list .item').removeClass('hovered');
                            }
                            room.forceRedraw();
                        }

                        return false;
                    })
                    .on('mouseout', 'canvas', function (e) {
                        room.$foundation.removeClass('cursor-crosshair cursor-pointer')
                        if (room.hoveredCell) {
                            room.hoveredCell.hover = false;
                            room.hoveredCell = null;
                        }
                    })
                    .on('mousewheel DOMMouseScroll', 'canvas', function (e) {
                        if (room.hoveredCell && Date.now() - lastScroll > 333) {
                            var levels = [1, 3, 5, 10];
                            if ((e.originalEvent.wheelDelta || -e.originalEvent.detail) > 0) {
                                room.zoom = levels[Math.min(levels.length - 1, levels.indexOf(room.zoom) + 1)];
                            }
                            else {
                                if (
                                    room.width * room.zoom * 16 > room.$foundation.width() ||
                                    room.height * room.zoom * 12 + room.wallHeight > room.$foundation.height()
                                ) {
                                    room.zoom = levels[Math.max(0, levels.indexOf(room.zoom) - 1)];
                                }
                            }
                            lastScroll = Date.now();
                            room.forceRedraw(true);
                        }
                    })
                    .on('dblclick', 'canvas', function (e) {
                        if (room.hoveredAvatar) {
                            room.hoveredAvatar.user.open(true);
                        }
                    })
                    .on('contextmenu', 'canvas', function (e) {
                        e.preventDefault();
                    })
                    .on('mouseup', 'canvas', function (e) {
                        if (e.which == 3) {
                            room.selectedThing = null;
                            return false;
                        }
                        if (!room.hoveredCell)
                            return;

                        room.logAction('click canvas');

                        var x = room.hoveredCell.x;
                        var y = room.hoveredCell.y;
                        var avatar = room.hoveredAvatar;
                        var thing = room.hoveredThing;

                        if (room.selectedThing) {
                            if (room.selectedThing.onTable && thing) {
                                x = thing.x;
                                y = thing.y;
                            }
                            else {
                                x = room.hoveredCell.x - Math.floor(room.selectedThing.width / 2);
                                y = y - room.selectedThing.height + 1;
                            }
                            if (room.selectedThing.id && room.selectedThing.room) {
                                room.selectedThing.request('move', {
                                    x: x,
                                    y: y
                                }, function () {
                                    room.selectedThing = null;
                                    //room.displayThings();
                                })
                                    .grab('invalid', function () {
                                        C.Alert(T('Can\'t be placed here'));
                                    })
                                    .grab('non_object_property_call', function () {
                                        C.Alert(T('Can\'t be placed here'));
                                    })
                                    .grab('access denied', function () {
                                        C.Alert(T('Insufficient access'));
                                    })
                                    .grab('blocked', function () {
                                        C.Alert(T('Cell blocked'));
                                    })
                                    .grab('must place on table', function () {
                                        C.Alert(T('must place on table'));
                                    })
                                    .grab('one decoration only', function () {
                                        C.Alert(T('one decoration only'));
                                    });
                            }
                            else if (room.selectedThing.id) {
                                room.request('placeThing', {
                                    thing: room.selectedThing.id,
                                    x: x,
                                    y: y
                                }, function () {
                                    room.selectedThing = null;
                                    room.displayThings();
                                })
                                    .grab('access denied', function () {
                                        C.Alert(T('Insufficient access'));
                                    })
                                    .grab('blocked', function () {
                                        C.Alert(T('Cell blocked'));
                                    })
                                    .grab('one decoration only', function () {
                                        C.Alert(T('one decoration only'));
                                    });
                            }
                            else {
                                room.request('buyThing', {
                                    x: x,
                                    y: y,
                                    thing: room.selectedThing.data.thing,
                                    colors: room.selectedThing.data.colors
                                }, function (thing) {
                                    room.selectedThing = null;
                                    room.displayThings();
                                })
                                    .grab('invalid', function () {
                                        C.Alert(T('Can\'t be placed here'));
                                    })
                                    .grab('non_object_property_call', function () {
                                        C.Alert(T('Can\'t be placed here'));
                                    })
                                    .grab('access denied', function () {
                                        C.Alert(T('Insufficient access'));
                                    })
                                    .grab('not enough coins', function () {
                                        C.Alert(T('You do not have enough cookies for this transaction'));
                                    })
                                    .grab('blocked', function () {
                                        C.Alert(T('Cell blocked'));
                                    })
                                    .grab('must place on table', function () {
                                        C.Alert(T('must place on table'));
                                    })
                                    .grab('one decoration only', function () {
                                        C.Alert(T('one decoration only'));
                                    });
                            }
                        }
                        else if (avatar && (avatar.user.id != C.user.id)) {
                            C.User.Popup(avatar.user, room);
                        }
                        else if (room.$things && thing && $('.panelInterior').length != 0) {
                            room.selectThing(thing);
                        }
                        else if (thing) {
                            thing.click({
                                x: x - thing.x,
                                y: y - thing.y
                            });
                            room.logAction('click thing');
                        }
                        else {
                            _teleportPosition = {
                                x: x,
                                y: y
                            };
                            room.request('move', {
                                x: x,
                                y: y
                            });
                            room.logAction('move');
                        }
                        return false;
                    });

                /**
                 * Room resizing stuff
                 */
                room.$resizer
                    .on('mousedown touchstart', function (e) {
                        var ww = (window.innerWidth || $(window).width()),
                            wh = (window.innerHeight || $(window).height()),
                            rw = room.$container.width(),
                            rh = room.$container.height(),
                            ro = room.$container.offset().left;
                        //rox = ro.x,
                        //roy = ro.y;
                        var vertical = /*ww < wh ||*/ ww <= 800 || room.$container.hasClass('vertical');
                        var pc;
                        var ex, ey;
                        //room.$base.addClass('resizing');
                        //room.$chat.addClass('resizing');

                        room.$container.addClass('disableMouse');

                        $(document)
                            .on('mousemove.resizer mouseup.resizer touchmove.resizer', function (e) {
                                e.preventDefault();
                                if (e.originalEvent.targetTouches) {
                                    ex = Math.round(e.originalEvent.targetTouches[0].pageX);
                                    ey = Math.round(e.originalEvent.targetTouches[0].pageY);
                                }
                                else {
                                    ex = Math.max(ro, e.pageX);
                                    ey = e.pageY;
                                }

                                pc = Math.max(0, ((vertical ? ey : ex - ro) / (vertical ? rh : rw) * 100));
                                room.resizeElements(pc);
                            })
                            .on('mouseup.resizer touchend.resizer', function (e) {
                                $(document).off('mousemove.resizer mouseup.resizer touchmove.resizer');

                                //room.$chat.removeClass('resizing');
                                //room.$base.removeClass('resizing');

                                room.$container.removeClass('disableMouse');
                                C.localSettings['canvasSize'] = pc;
                                C.saveSettings();
                            });
                    });

                if (!C.localSettings["doorHint"]) {
                    room.$doorHint = new C.Hint({
                        view: C.View('hint', {message: 'Ты находишься за этой дверью. Кликни где-нибудь в комнате, чтобы войти!'}),
                        css_class: 'door',
                        insert: function () {
                            room.$container.append(this.view);
                        },
                        remove: function () {
                            C.localSettings['doorHint'] = true;
                            C.Notification.prototype.remove.call(this);
                            delete room.$doorHint;
                            C.saveSettings();
                        }
                    });
                }

                if (true && (room.id == '7a7662fe-a8ff-4e53-a219-74d382c8eae3' || room.id == 'e71590e1-464e-4880-a555-f1438a893549')) {

                    if (!room.data.stream) {
                        room.data.stream = 'vauuBXknAVk';
                    }
                    var src = '<iframe class="live-iframe" src="//www.youtube.com/embed/' + room.data.stream + '" frameborder="0" allowfullscreen></iframe>';
                    room.$liveIframe = $(src).attr({width: 360, height: 235}).appendTo(room.$base);
                    room.liveIframeVisible = true;
                    room.liveIframeFullscreen = false;

                    room.$liveBar = C.View('page/room/broadcast');
                    room.$liveBarShow = room.$liveBar.find('.Button.toggle');
                    room.$liveBarMaximize = room.$liveBar.find('.Button.expand');

                    room.$liveBar.on('submit', '.new_link', function (e) {
                        e.preventDefault();
                        var streamLink = room.$liveBar.find('.link_address').val();
                        var l = room.$liveBar.find('.link_address').val().split('watch?v=')[1];
                        if (!l) {
                            l = streamLink;
                        }

                        room.request('setStream', {
                            link: l
                        });
                    });

                    room.$liveBar.appendTo(room.$base);
                    //room.$liveBar = $('<div class="live-bar"></div>').appendTo(room.$base);

                    //room.$liveBarShow = $('<span><i class="FA FA-play"></i> <span>скрыть трансляцию</span></span>').appendTo(room.$liveBar);

                    room.$liveBarShow.on('click', function () {
                        room.$liveIframe.css('visibility', room.liveIframeVisible ? 'hidden' : 'visible');
                        room.liveIframeVisible = !room.liveIframeVisible;
                        room.$liveBarShow.find('.text').text(T(room.liveIframeVisible ? 'Hide broadcast' : 'Show broadcast'));
                    });

                    room.$liveBarMaximize.on('click', function () {
                        room.$liveIframe.css('visibility', 'visible');
                        room.liveIframeVisible = true;
                        room.liveIframeFullscreen = !room.liveIframeFullscreen;
                        if (room.liveIframeFullscreen) {
                            room.$liveIframe.attr({width: C.client.canvas.width, height: C.client.canvas.height - 120});
                            room.$liveBarMaximize.removeClass('FA-expand').addClass('FA-compress');
                        }
                        else {
                            room.$liveIframe.attr({width: 360, height: 235});
                            room.$liveBarMaximize.removeClass('FA-compress').addClass('FA-expand');
                        }
                    });
                }
            });

            c.q(function (c) {
                room.uri = '/room/' + room.id;
                C.pageManager.add(room, room.id, {show: false, title: room.data.name});
                C.client.Navigation.toggleColors(room.id, 'room', true);
                C.loadingOverlay.remove('room finished');
            });
        }),
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
            user.update(c, {
                online: true
            });

            if (C.contacts[user.id]) {
                if (_isEnabledPopupNotifications.get()) {
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
                        details.onclick = function () {
                            C.pageManager.openURI('/room/' + room.id);
                            room.chatMessageInput.highlightUser(user);
                        };
                        GM_notification(details);
                    });
                }

                if (!user.leftRooms || !user.leftRooms[room.id] || Date.now() - user.leftRooms[room.id] > 5000) {
                    room.makeChatAction(c, msg.user, msg);
                }
            }

            room.forceRedraw(c);

            user.initAvatar();
        }),
        makeChatMessage: fun(function (c, room, user, msg) {
            if (_hideMessageFromBlacklistMenu.getFlag()) {
                var userId = (msg.user && msg.user.id ? msg.user.id : msg.user);
                var isBlacklisted = C.user.data.blacklist && C.user.data.blacklist.indexOf(userId) != -1;
                if (!isBlacklisted) {
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
    jsface.extend(C.User, UserExtended);
})();
