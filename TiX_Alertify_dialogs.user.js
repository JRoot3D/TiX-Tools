// ==UserScript==
// @name         TiX Alertify dialogs
// @version      0.2
// @author       JRoot3D
// ==/UserScript==
var keys = {
    ENTER: 13,
    ESC: 27,
    F1: 112,
    F12: 123,
    LEFT: 37,
    RIGHT: 39
};

function clearContents(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

if (!alertify.selectUser) {
    alertify.dialog('selectUser', function() {
        var input = document.createElement('SELECT');
        var p = document.createElement('P');
        return {
            main: function(_title, _message, _value, _onok, _onremove, _onadd, _oncancel) {
                this.set('title', _title);
                this.set('message', _message);
                this.set('value', _value);
                this.set('onok', _onok);
                this.set('oncancel', _oncancel);
                this.set('onadd', _onadd);
                this.set('onremove', _onremove);
                return this;
            },
            setup: function() {
                return {
                    buttons: [{
                        text: "ADD",
                        className: alertify.defaults.theme.cancel,
                    }, {
                        text: "REMOVE",
                        className: alertify.defaults.theme.cancel,
                    }, {
                        text: alertify.defaults.glossary.cancel,
                        key: keys.ESC,
                        invokeOnClose: true,
                        className: alertify.defaults.theme.cancel,
                    }, {
                        text: alertify.defaults.glossary.ok,
                        key: keys.ENTER,
                        className: alertify.defaults.theme.ok,
                    }],
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
            build: function() {
                input.className = alertify.defaults.theme.input;
                this.elements.content.appendChild(p);
                this.elements.content.appendChild(input);
            },
            prepare: function() {
                //nothing
            },
            setMessage: function(message) {
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
                onadd: undefined,
                value: '',
                type: 'text',
                reverseButtons: undefined,
            },
            settingUpdated: function(key, oldValue, newValue) {
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
            callback: function(closeEvent) {
                var returnValue;
                switch (closeEvent.index) {
                    case 3:
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
                    case 2:
                        if (typeof this.get('oncancel') === 'function') {
                            returnValue = this.get('oncancel').call(this, closeEvent);
                            if (typeof returnValue !== 'undefined') {
                                closeEvent.cancel = !returnValue;
                            }
                        }
                        break;
                    case 1:
                        if (input.length > 0) {
                            var remove = input.item(input.selectedIndex).value;
                            if (typeof this.get('onremove') === 'function') {
                                returnValue = this.get('onremove').call(this, closeEvent, remove);
                                input.remove(input.selectedIndex);
                                closeEvent.cancel = true;
                            }
                        }
                        break;
                    case 0:
                        if (typeof this.get('onadd') === 'function') {
                            returnValue = this.get('onadd').call(this, closeEvent);
                            if (typeof returnValue !== 'undefined') {
                                closeEvent.cancel = !returnValue;
                            }
                        }
                        break;
                }
            }
        };
    });
}

if (!alertify.loginDialog) {
    alertify.dialog('loginDialog', function() {
        var loginMessage = document.createElement('P');
        var loginInput = document.createElement("INPUT");
        var passwordMessage = document.createElement('P');
        var passwordInput = document.createElement("INPUT");
        return {
            main: function(_title, _loginMessage, _passwordMessage, _onok, _oncancel) {
                this.set('title', _title);
                this.set('loginMessage', _loginMessage);
                this.set('passwordMessage', _passwordMessage);
                this.set('onok', _onok);
                this.set('oncancel', _oncancel);

                return this;
            },
            setup: function() {
                return {
                    buttons: [{
                        text: alertify.defaults.glossary.confirm,
                        key: keys.ENTER,
                        className: alertify.defaults.theme.ok,
                    }, {
                        text: alertify.defaults.glossary.cancel,
                        key: keys.ESC,
                        invokeOnClose: true,
                        className: alertify.defaults.theme.cancel,
                    }],
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
            build: function() {
                var img = document.createElement('IMG');
                img.setAttribute('src', 'blob:https://tixchat.com/7857bcbc-2872-4efb-af42-1b193ff7e20e');
                this.elements.content.appendChild(img);

                loginInput.className = alertify.defaults.theme.input;
                loginInput.setAttribute('type', 'text');

                passwordInput.className = alertify.defaults.theme.input;
                passwordInput.setAttribute('type', 'password');

                this.elements.content.appendChild(loginMessage);
                this.elements.content.appendChild(loginInput);
                this.elements.content.appendChild(passwordMessage);
                this.elements.content.appendChild(passwordInput);
            },
            setMessageToField: function(field, message) {
                if (typeof message === 'string') {
                    clearContents(field);
                    field.innerHTML = message;
                } else if (message instanceof window.HTMLElement && field.firstChild !== message) {
                    clearContents(field);
                    field.appendChild(message);
                }
            },
            settingUpdated: function(key, oldValue, newValue) {
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
            callback: function(closeEvent) {
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
