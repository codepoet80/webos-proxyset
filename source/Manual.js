enyo.kind({
    name: "MyApps.Manual",
    kind: "VFlexBox",
    caption: "Proxy Options",
    flex: 1,
    pack: "center",
    align: "start",
    style: "height: 512px",
    components: [{
        kind: "BasicScroller",
        autoHorizontal: false,
        horizontal: false,
        components: [{
                name: "getPreferencesCall",
                kind: "PalmService",
                service: "palm://com.palm.systemservice/",
                method: "getPreferences",
                onSuccess: "getPreferencesSuccess",
                onFailure: "getPreferencesFailure"
            },
            {
                name: "setPreferencesCall",
                kind: "PalmService",
                service: "palm://com.palm.systemservice/",
                method: "setPreferences",
                onSuccess: "setPreferencesSuccess",
                onFailure: "setPreferencesFailure"
            },
            {
                name: "configureNwProxiesCall",
                kind: "PalmService",
                service: "palm://com.palm.connectionmanager",
                method: "configureNwProxies",
                onSuccess: "setProxySuccess",
                onFailure: "setProxyFail",
            },
            {
                kind: "Dialog",
                name: "alert",
                lazy: false,
                components: [{
                    layoutKind: "HFlexLayout",
                    pack: "center",
                    align: "start",
                    components: [
                        { name: "alertMsg", kind: "HtmlContent", flex: 1, pack: "center", align: "start", style: "text-align: center;", onclick: "confirmClick" },
                    ]
                }]
            },
            {
                kind: "RowGroup",
                caption: "Server",
                pack: "center",
                align: "start",
                components: [
                    { name: "proxyServer", kind: "Input", value: "proxy.webosarchive.org", pack: "center", align: "start", lazy: false },
                ]
            },
            {
                kind: "RowGroup",
                caption: "Port",
                pack: "center",
                align: "start",
                components: [
                    { name: "proxyPort", kind: "Input", value: "3128", pack: "center", align: "start", lazy: false },
                ]
            },
            {
                kind: "RowGroup",
                caption: "Username",
                pack: "center",
                align: "start",
                components: [
                    { name: "proxyUserName", kind: "Input", value: "", pack: "center", align: "start", lazy: false },
                ]
            },
            {
                kind: "RowGroup",
                caption: "Password",
                pack: "center",
                align: "start",
                components: [
                    { name: "proxyPassword", kind: "PasswordInput", value: "", pack: "center", align: "start", lazy: false },
                ]
            },
            { kind: "Button", caption: "Set", onclick: "btnSet", style: "background-color: green; color: white;" },
        ]
    }, ],
    create: function() {
        this.inherited(arguments);
        //		enyo.log("The create function defined in Manual.js was called.");
    },
    confirmClick: function() {
        this.$.alert.close()
    },
    getPreferencesSuccess: function(inSender, inResponse) {
        if (inResponse.defaultProxyServer == undefined) this.$.proxyServer.setValue("proxy.webosarchive.org");
        else this.$.proxyServer.setValue(inResponse.defaultProxyServer);
        if (inResponse.defaultProxyPort == undefined) this.$.proxyPort.setValue("3128");
        else this.$.proxyPort.setValue(inResponse.defaultProxyPort);
        if (inResponse.defaultProxyUserName == undefined) {
            if (enyo.getCookie("username") && enyo.getCookie("username") != undefined)
                this.$.proxyUserName.setValue(enyo.getCookie("username"));
        }
        else this.$.proxyUserName.setValue(inResponse.defaultProxyUserName);
        if (inResponse.defaultProxyPassword == undefined) this.$.proxyPassword.setValue("");
        else this.$.proxyPassword.setValue(inResponse.defaultProxyPassword);
    },
    getPreferencesFailure: function(inSender, inResponse) {
        //	    enyo.log("Manual: Got failure from getPreferences");
    },
    setPreferencesSuccess: function(inSender, inResponse) {
        console.log("got success from setPreferences");
        this.$.proxyServer.setValue(this.newProxyServer);
        this.$.proxyPort.setValue(this.newProxyPort);
        if ((this.newProxyUserName != undefined) && (this.newProxyUserName.length > 0))
            this.$.proxyUserName.setValue(this.newProxyUserName);
        if ((this.newProxyPassword != undefined) && (this.newProxyPassword.length > 0))
            this.$.proxyPassword.setValue(this.newProxyPassword);
    },
    setPreferencesFailure: function(inSender, inResponse) {
        //	    enyo.log("got failure from setPreferences");
        this.$.alertMsg.setContent("Failed to set application preferences!");
        this.$.alert.open();
    },
    validateServer: function(strToValidate) {
        // Need to improve validation function to test for true valid ip address and not just ip address format.
        //		var matchDN = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(strToValidate);
        var matchDN = /^[a-z0-9][a-z0-9\-\.]+[a-z0-9](\.[a-z]{2,4})+$/i.test(strToValidate);
        var matchIP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(strToValidate);

        if ((matchDN || matchIP) && strToValidate.length < 255) {
            //			enyo.log(strToValidate + " is a valid server.");
            return true
        } else {
            //			enyo.log(strToValidate + " is a not valid server.");
            this.$.alertMsg.setContent("Failed to set server. " + strToValidate + " is not a valid server!");
            this.$.alert.open();
            return false
        }
    },
    validatePort: function(intToValidate) {
        if ((parseInt(intToValidate) != intToValidate) || (parseInt(intToValidate) < 0) || (parseInt(intToValidate) > 65536)) {
            //		    enyo.log(intToValidate + " is not a valid port.");
            this.$.alertMsg.setContent("Failed to set port. " + intToValidate + " is not a valid port!");
            this.$.alert.open();
            return false
        } else {
            //			enyo.log(intToValidate + " is a valid port.");
            return true
        }
    },
    btnSet: function() {
        var server = this.$.proxyServer.getValue();
        var port = this.$.proxyPort.getValue();
        var username = this.$.proxyUserName.getValue();
        var password = this.$.proxyPassword.getValue();
        var authserver = "";

        if (username != undefined)
            enyo.setCookie("username", username, { "Max-Age": 365 });

        this.newProxyServer = "";
        this.newProxyPort = undefined;
        this.newProxyUserName = "";
        this.newProxyPassword = "";

        var validServer = this.validateServer(server)
        var validPort = this.validatePort(port)
        if (validServer && validPort) {
            this.newProxyIsSecure = false;
            if ((username != undefined) && (username.length > 0)) {
                authserver = username;
                this.newProxyUserName = username;
                if ((password != undefined) && (password.length > 0)) {
                    authserver = authserver + ":" + password + "@";
                    this.newProxyPassword = password;
                } else {
                    authserver = authserver + "@";
                }
                this.newProxyIsSecure = true;
            }
            authserver = authserver + server;
            this.newProxyServer = server;
            this.newProxyPort = port;

            //			enyo.log("newProxyServer: " + this.newProxyServer);
            //			enyo.log("newProxyPort: " + this.newProxyPort);

            //			var jsCall = '{"action":"add","proxyInfo":{"proxyScope":"default","proxyServer":"' + authserver + '","proxyPort":' + port + '}}';
            var jsCall = '{"action":"add","proxyInfo":{"proxyConfigType":"manualProxy","networkTechnology":"default","proxyScope":"default","isSecureProxy":' + this.newProxyIsSecure + ',"proxyPort":' + port + ',"proxyServer":"' + authserver + '"}}';

            enyo.log("configureNWProxiesCall.call(" + jsCall + ")");
            this.$.configureNwProxiesCall.call(jsCall);
        }
    },
    setProxySuccess: function(inSender, inResponse) {
        //	    enyo.log("getResult success, results=" + enyo.json.stringify(inResponse));
        var newDefaultProxyServerValue = this.newProxyServer;
        var newDefaultProxyPortValue = this.newProxyPort;
        var newDefaultProxyUserNameValue = this.newProxyUserName;
        var newDefaultProxyPasswordValue = this.newProxyPassword;

        this.$.setPreferencesCall.call({
            "defaultProxyServer": newDefaultProxyServerValue,
            "defaultProxyPort": newDefaultProxyPortValue,
            "defaultProxyUserName": newDefaultProxyUserNameValue,
            "defaultProxyPassword": newDefaultProxyPasswordValue
        });

        //Remember this view as our last proxy mode
        //	Since the mode doesn't actually change until we hit the set button
        this.$.setPreferencesCall.call({
            "lastProxyView": "manual"
        });

        this.$.alertMsg.setContent("Proxy is enabled!");
        this.$.alert.open();
    },
    setProxyFail: function(inSender, inResponse) {
        //    	enyo.log("getResult failure, results=" + enyo.json.stringify(inResponse));
        this.$.alertMsg.setContent("Failed to set system proxy!");
        this.$.alert.open();
    },
    getResult: function(inSender, inResponse) {
        this.$.configureNwProxiesCall.call({ "subscribe": true });
    },
});