enyo.kind({
    name: "MyApps.Off",
    kind: "VFlexBox",
    components: [
        //		{kind: "ApplicationEvents", onLoad: "windowLoaded"},
        {
            name: "configureNwProxiesCall",
            kind: "PalmService",
            service: "palm://com.palm.connectionmanager",
            method: "configureNwProxies",
            onSuccess: "setProxySuccess",
            onFailure: "setProxyFail",
        },
        {
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
            kind: "Dialog",
            name: "alert",
            lazy: false,
            components: [{
                layoutKind: "HFlexLayout",
                pack: "center",
                components: [
                    { name: "alertMsg", kind: "HtmlContent", flex: 1, pack: "center", align: "start", style: "text-align: center;", onclick: "confirmClick" },
                ]
            }]
        },
    ],
    create: function() {
        this.inherited(arguments);

        //Remember this view as our last proxy mode
        //	Since the mode changes as soon as this view lodes
        this.$.setPreferencesCall.call({
            "lastProxyView": "off"
        });
    },
    confirmClick: function() {
        this.$.alert.close()
    },
    setProxySuccess: function(inSender, inResponse) {
      
        this.$.alertMsg.setContent("Proxy is disabled!");
        this.$.alert.open();

        this.$.setPreferencesCall.call({
            "defaultProxyServer": "proxy.webosarchive.org",
            "defaultProxyPort": "3128",
            "defaultProxyUserName": "",
            "defaultProxyPassword": "",
            "defaultProxyPacUrl": ""
        });
    },
    setProxyFail: function(inSender, inResponse) {
        enyo.log("getResult failure, results=" + enyo.json.stringify(inResponse));
        if (inResponse.errorCode > -1) {
            this.$.alertMsg.setContent(inResponse.errorText);
            this.$.alert.open();
        }

    },
    getPreferencesSuccess: function(inSender, inResponse) {
        var server = inResponse.defaultProxyServer;
        var port = inResponse.defaultProxyPort;
        var username = inResponse.defaultProxyUserName;
        var password = inResponse.defaultProxyPassword;
        var authserver = "";

        if ((server != undefined) && (port != undefined) && (server.length > 0) && (port.length > 0)) {
            if ((username != undefined) && (username.length > 0)) {
                authserver = username;
                if ((password != undefined) && (password.length > 0)) {
                    authserver = authserver + ":" + password + "@";
                } else {
                    authserver = authserver + "@";
                }
                authserver = authserver + server;
            } else {
                authserver = server;
            }
        } else {
            //this.$.alertMsg.setContent("No proxy to remove!");
            //this.$.alert.open();
            return true;
        }

        var jsCall = '{"action":"rmv","proxyInfo":{"proxyConfigType":"noProxy","proxyScope":"default"}}';
        //		enyo.log("Off: configureNWProxiesCall.call("+ jsCall + ")");

        this.$.configureNwProxiesCall.call(jsCall);
    },
    getPreferencesFailure: function(inSender, inResponse) {
        //	    enyo.log("got failure from getPreferences");
    },
    setPreferencesSuccess: function(inSender, inResponse) {
        console.log("got success from setPreferences");
    },
    setPreferencesFailure: function(inSender, inResponse) {
        //	    enyo.log("got failure from setPreferences");
        this.$.alertMsg.setContent("Failed to set application preferences!");
        this.$.alert.open();
    },
})