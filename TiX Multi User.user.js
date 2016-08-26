// ==UserScript==
// @name         TiX Multi User
// @namespace    http://tampermonkey.net/
// @version      1.7
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @require      https://cdn.jsdelivr.net/alertifyjs/1.8.0/alertify.min.js
// @resource     alertifyCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/alertify.min.css
// @resource     alertifyDefaultCSS https://cdn.jsdelivr.net/alertifyjs/1.8.0/css/themes/default.min.css
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Multi%20User.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX%20Multi%20User.user.js
// ==/UserScript==

(function() {
	'use strict';

	var keys = {
		ENTER: 13,
		ESC: 27,
		F1: 112,
		F12: 123,
		LEFT: 37,
		RIGHT: 39
	};

	function addStyle(name) {
		var style = GM_getResourceText(name);
		GM_addStyle(style);
	}

	addStyle('alertifyCSS');
	addStyle('alertifyDefaultCSS');

	function clearContents(element){
		while (element.lastChild) {
			element.removeChild(element.lastChild);
		}
	}

	function showUsers() {
		var userList = GM_listValues();
		var users = [];
		for (var i in userList) {
			var userId = userList[i];
			var user = GM_getValue(userId);
			users[i] = user;
		}
		alertify.selectUser('Select User', 'User', users, loginSelectedUser, removeSelectedUser);
	}

	function loginSelectedUser(event, userId) {
		loginUser(userId);
	}

	function removeSelectedUser(event, userId) {
		GM_deleteValue(userId);
	}

	function getUserId(token) {
		return cutPart(cutPart(token));
	}

	function cutPart(value) {
		var index = value.indexOf('-');
		var result = value.substring(index + 1);
		return result;
	}

	if(!alertify.selectUser){
		alertify.dialog('selectUser', function () {
			var input = document.createElement('SELECT');
			var p = document.createElement('P');
			return {
				main: function (_title, _message, _value, _onok, _onremove, _oncancel) {
					this.set('title', _title);
					this.set('message', _message);
					this.set('value', _value);
					this.set('onok', _onok);
					this.set('oncancel', _oncancel);
					this.set('onremove', _onremove);
					return this;
				},
				setup: function () {
					return {
						buttons: [
							{
								text: "REMOVE",
								className: alertify.defaults.theme.cancel,
							},
							{
								text: alertify.defaults.glossary.cancel,
								key: keys.ESC,
								invokeOnClose: true,
								className: alertify.defaults.theme.cancel,
							},
							{
								text: alertify.defaults.glossary.ok,
								key: keys.ENTER,
								className: alertify.defaults.theme.ok,
							}
						],
						focus: {
							element: input,
							select: true
						},
						options: {
							maximizable: false,
							resizable: false
						}
					};
				},
				build: function () {
					input.className = alertify.defaults.theme.input;
					this.elements.content.appendChild(p);
					this.elements.content.appendChild(input);
				},
				prepare: function () {
					//nothing
				},
				setMessage: function (message) {
					if (typeof message === 'string') {
						clearContents(p);
						p.innerHTML = message;
					} else if (message instanceof window.HTMLElement && p.firstChild !== message) {
						clearContents(p);
						p.appendChild(message);
					}
				},
				settings: {
					message: undefined,
					labels: undefined,
					onok: undefined,
					oncancel: undefined,
					onremove: undefined,
					value: '',
					type:'text',
					reverseButtons: undefined,
				},
				settingUpdated: function (key, oldValue, newValue) {
					switch (key) {
						case 'message':
							this.setMessage(newValue);
							break;
						case 'value':
							clearContents(input);
							for (var i = 0; i < newValue.length; i++) {
								var option = document.createElement("OPTION");
								option.setAttribute("value", newValue[i].id);
								option.text = newValue[i].name;
								input.appendChild(option);
							}
							break;
					}
				},
				callback: function (closeEvent) {
					var returnValue;
					switch (closeEvent.index) {
						case 2:
							if (input.length > 0) {
								this.settings.value = input.item(input.selectedIndex).value;
								if (typeof this.get('onok') === 'function') {
									returnValue = this.get('onok').call(this, closeEvent, this.settings.value);
									if (typeof returnValue !== 'undefined') {
										closeEvent.cancel = !returnValue;
									}
								}
							}
							break;
						case 1:
							if (typeof this.get('oncancel') === 'function') {
								returnValue = this.get('oncancel').call(this, closeEvent);
								if (typeof returnValue !== 'undefined') {
									closeEvent.cancel = !returnValue;
								}
							}
							break;
						case 0:
							if (input.length > 0) {
								var remove = input.item(input.selectedIndex).value;
								if (typeof this.get('onremove') === 'function') {
									returnValue = this.get('onremove').call(this, closeEvent, remove);
									input.remove(input.selectedIndex);
									closeEvent.cancel = true;
								}
							}
							break;
					}
				}
			};
		});
	}

	if(!alertify.loginDialog){
		alertify.dialog('loginDialog', function() {
			var loginMessage = document.createElement('P');
			var loginInput = document.createElement("INPUT");
			var passwordMessage = document.createElement('P');
			var passwordInput = document.createElement("INPUT");
			return {
				main:function(_title,_loginMessage, _passwordMessage, _onok, _oncancel){
					this.set('title', _title);
					this.set('loginMessage', _loginMessage);
					this.set('passwordMessage', _passwordMessage);
					this.set('onok', _onok);
					this.set('oncancel', _oncancel);

					return this;
				},
				setup: function () {
					return {
						buttons: [
							{
								text: alertify.defaults.glossary.confirm,
								key: keys.ENTER,
								className: alertify.defaults.theme.ok,
							},
							{
								text: alertify.defaults.glossary.cancel,
								key: keys.ESC,
								invokeOnClose: true,
								className: alertify.defaults.theme.cancel,
							}
						],
						focus: {
							element: loginInput,
							select: true
						},
						options: {
							maximizable: false,
							resizable: false
						}
					};
				},
				build: function () {
					loginInput.className = alertify.defaults.theme.input;
					loginInput.setAttribute('type', 'text');

					passwordInput.className = alertify.defaults.theme.input;
					passwordInput.setAttribute('type', 'password');

					this.elements.content.appendChild(loginMessage);
					this.elements.content.appendChild(loginInput);
					this.elements.content.appendChild(passwordMessage);
					this.elements.content.appendChild(passwordInput);
				},
				setMessageToField: function (field, message) {
					if (typeof message === 'string') {
						clearContents(field);
						field.innerHTML = message;
					} else if (message instanceof window.HTMLElement && field.firstChild !== message) {
						clearContents(field);
						field.appendChild(message);
					}
				},
				settingUpdated: function (key, oldValue, newValue) {
					switch (key) {
						case 'loginMessage':
							this.setMessageToField(loginMessage, newValue);
							break;
						case 'passwordMessage':
							this.setMessageToField(passwordMessage, newValue);
							break;
						case 'labels':
							if (newValue.ok && this.__internal.buttons[0].element) {
								this.__internal.buttons[0].element.innerHTML = newValue.ok;
							}
							if (newValue.cancel && this.__internal.buttons[1].element) {
								this.__internal.buttons[1].element.innerHTML = newValue.cancel;
							}
							break;
					}
				},
				callback:function(closeEvent){
					var data = {
						login: loginInput.value,
						password: passwordInput.value
					};

					var returnValue;
					switch (closeEvent.index) {
						case 0:
							if (typeof this.get('onok') === 'function') {
								this.get('onok').call(this, closeEvent, data);
								closeEvent.cancel = !this.settings.islogin;
							}
							break;
						case 1:
							if (typeof this.get('oncancel') === 'function') {
								returnValue = this.get('oncancel').call(this, closeEvent);
								if (typeof returnValue !== 'undefined') {
									closeEvent.cancel = !returnValue;
								}
							}
							break;
					}
				},
				settings: {
					labels: undefined,
					loginMessage: '',
					passwordMessage: '',
					onok: undefined,
					oncancel: undefined,
					islogin: false
				}
			};
		});
	}

	function saveUser (event, data) {
		alertify.loginDialog().set('islogin', false);

		var c = coastline();
		c.q(function (c) {
			C.socket.request('login', {
				'email': data.login,
				'password': data.password
			}, function (responce) {
				if(responce.cookie)
				{
					var token = responce.cookie;
					var id = getUserId(token);
					var saveData = {
						'token': token,
						'id': id
					};

					var req = {
						method:'get',
						scope:'user',
						user: id
					};

					C.socket.sendRequest(req, function (responce) {
						saveData.name = responce.user.name;
						GM_setValue(id, saveData);
						alertify.loginDialog().close().set('islogin', true);
						alertify.notify('User: ' + saveData.name);
					});
				}
			}).grab('wrong', function () {
				alertify.error('Wrong Login or Password');
			});
		});
	}

	function loginUser(userId) {
		var user = GM_getValue(userId);
		var token = user.token;
		if (token) {
			var date = new Date();
			date.setTime(date.getTime() + 31557600000);
			document.cookie = 'jauth=' + token + '; path=/; expires=' + date.toGMTString();
			location.reload();
		} else {
			alertify.error('Wrong ID: ' + userId);
		}
	}

	function selectUser(user) {
		alertify.confirm('Login or Remove?', user.data.name, function(){ loginUser(user.id); }, function(){ GM_deleteValue(user.id); }).set('labels', {ok:'LOGIN', cancel:'REMOVE'});
	}

	function addUser() {
		alertify.loginDialog("Add User", "Email", "Password", saveUser);
	}

	GM_registerMenuCommand("[M] Select User", showUsers);
	GM_registerMenuCommand("[M] Add User", addUser);
})();
