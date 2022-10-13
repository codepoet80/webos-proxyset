enyo.kind({
    name: "MyApps.ProxySet",
    kind: enyo.VFlexBox,
    components: [{
            name: "getConnMgrStatus",
            kind: "PalmService",
            service: "palm://com.palm.connectionmanager/",
            method: "getStatus",
            onSuccess: "statusFinished",
            onFailure: "statusFail",
            subscribe: true
        },
        {
            kind: "appMuseum.AppMenu",
            name: "appMenu",
            onItemSelected: 'handleItemSelected'
        },
        {
            name: "serviceRequest",
            kind: "PalmService",
            service: "palm://com.palm.applicationManager",
            method: "open"
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
        { kind: "PageHeader", className: "enyo-bg", pack: "center", components: [{ content: "webOS Archive Proxy" }] },
        {
            kind: "RowGroup",
            pack: "center",
            align: "start",
            caption: "Proxy Settings",
            components: [{
                kind: "RadioGroup",
                pack: "center",
                name: "proxyMode",
                onclick: "proxyModeClick",
                components: [
                    { caption: "Enable", value: "manual" },
                    { caption: "Certificate", value: "certificate" },
                    { caption: "Disable", value: "off" }
                ]
            }, ]
        },
        {
            kind: "Pane",
            name: "pane",
            flex: 1,
            pack: "center",
            align: "start",
            onSelectView: "ViewSelected",
            components: [
                { kind: "MyApps.Manual", className: "enyo-bg", name: "manual", lazy: true, flex: 1, pack: "center", align: "start" },
                { kind: "MyApps.Certificate", className: "enyo-bg", name: "certificate", lazy: true, flex: 1, pack: "center", align: "start" },
                { kind: "MyApps.Off", className: "enyo-bg", name: "off", lazy: true, flex: 1, pack: "center", align: "start" }
            ]
        },
        {
            kind: "Dialog",
            components: [{
                layoutKind: "VFlexLayout",
                pack: "center",
                components: [{
                        kind: "HtmlContent",
                        srcId: "aboutContent",
                        className: "certDescription",
                        onLinkClick: "aboutLinkClick"
                    },
                    { kind: "Button", caption: "OK", onclick: "aboutOKClick" }
                ]
            }]
        },
        {
            kind: "Helpers.Updater",
            name: "myUpdater"
        }
    ],
    create: function() {
        this.inherited(arguments);
        this.$.getConnMgrStatus.call({ "subscribe": true });
        this.$.getPreferencesCall.call({
            "keys": ["lastProxyView"]
        });
        //Check for Updates
        this.$.myUpdater.CheckForUpdate("webOS Archive Proxy");
    },
    ViewSelected: function(inSender, inView, inPreviousView) {
        //enyo.log("The ViewSelected function defined in ProxySet.js was called.");

        inView.$.getPreferencesCall.call({
            "keys": ["defaultProxyServer", "defaultProxyPort", "defaultProxyUserName", "defaultProxyPassword", "defaultProxyPacUrl"]
        });
        //enyo.log("inView name is: " + inView.name);
        if (inView.name == "manual") {}
        if (inView.name == "certificate") {}
        if (inView.name == "off") {}
    },
    proxyModeClick: function(inSender, e) {
        enyo.log("clicked by: " + inSender.getValue());
        var selectedMode = inSender.getValue();

        if (selectedMode == "manual") {
            this.$.pane.selectViewByName("manual");
        } else if (selectedMode == "certificate") {
            this.$.pane.selectViewByName("certificate");
        } else if (selectedMode == "off") {
            this.$.pane.selectViewByName("off");
        }
    },
    getPreferencesSuccess: function(inSender, inResponse) {
        var setView = "off";
        if (inResponse.lastProxyView != undefined) {
            setView = inResponse.lastProxyView;
        }
        this.$.proxyMode.setValue(setView);
        this.$.pane.selectViewByName(setView);
    },
    getPreferencesFailure: function(inSender, inResponse) {
        enyo.log("got failure from getPreferences");
    },
    setPreferencesSuccess: function(inSender, inResponse) {
        console.log("got success from setPreferences");
    },
    setPreferencesFailure: function(inSender, inResponse) {
        //	    enyo.log("got failure from setPreferences");
        this.$.alertMsg.setContent("Failed to set application preferences!");
        this.$.alert.open();
    },
    statusFinished: function(inSender, inResponse) {
        enyo.log("getStatus success, results=" + enyo.json.stringify(inResponse));
    },
    statusFail: function(inSender, inResponse) {
        enyo.log("getStatus failure, results=" + enyo.json.stringify(inResponse));
    },

    aboutOKClick: function() {
        this.$.dialog.close();
    },

    aboutLinkClick: function() {
        this.$.serviceRequest.call({ target: inSender.address });
        this.$.dialog.close();
    },

    /** app menu **/
    handleItemSelected: function(inSender, inEvent) {
        enyo.log("handling menu click for " + inEvent);
        switch (inEvent) {
            case 'About':
                this.$.dialog.open();
                break;
            case 'Reset to Defaults':
                this.$.setPreferencesCall.call({
                    "defaultProxyServer": "proxy.webosarchive.org",
                    "defaultProxyPort": "3128",
                    "defaultProxyUserName": "",
                    "defaultProxyPassword": ""
                });
                this.$.proxyMode.setValue("off");
                this.$.pane.selectViewByName("off");
                break;
        }
    },
});