enyo.kind({
    name: "MyApps.Certificate",
    kind: enyo.VFlexBox,
    components: [{
            name: "getPreferencesCall",
            kind: "PalmService",
            service: "palm://com.palm.systemservice/",
            method: "getPreferences",
            onSuccess: "getPreferencesSuccess",
            onFailure: "getPreferencesFailure"
        },
        {
            flex: 1,
            kind: "Pane",
            components: [{
                flex: 1,
                kind: "Scroller",
                components: [{
                        kind: "HtmlContent",
                        srcId: "certContent",
                        className: "certDescription",
                    },
                    {
                        kind: "RowGroup",
                        caption: "Certificate URL",
                        pack: "center",
                        align: "start",
                        components: [
                            { name: "certDownloadPath", kind: "Input", value: "http://www.webosarchive.org/proxy/wOSAServiceCert.der", pack: "center", align: "start", lazy: false },
                        ]
                    },
                    {
                        name: "fileDownload",
                        kind: "PalmService",
                        service: "palm://com.palm.downloadmanager/",
                        method: "download",
                        onSuccess: "downloadFinished",
                        onFailure: "downloadFail",
                        subscribe: true
                    },
                    {
                        name: "certAppRequest",
                        kind: "PalmService",
                        service: "palm://com.palm.applicationManager/",
                        method: "open",
                        onSuccess: "certificateAddSuccess",
                        onFailure: "certificateAddFailure"
                    },
                    {
                        //This should work, but does not. Using certAppRequest instead
                        name: "certInstallRequest",
                        kind: "PalmService",
                        service: "palm://com.palm.certificatemanager",
                        method: "addcertificate",
                        onSuccess: "certificateAddSuccess",
                        onFailure: "certificateAddFailure"
                    },
                    {
                        kind: "Button",
                        name: "DownloadButton",
                        caption: "Install",
                        onclick: "downloadFile"
                    }
                ]
            }]
        },
        {
            kind: "Dialog",
            name: "alert",
            lazy: false,
            components: [{
                layoutKind: "HFlexLayout",
                pack: "center",
                components: [
                    { name: "alertMsg", kind: "HtmlContent", flex: 1, pack: "center", align: "start", style: "text-align: center;" },
                ]
            }]
        },
    ],

    downloadFinished: function(inSender, inResponse) {
        enyo.log("Download success, results=" + enyo.json.stringify(inResponse));
        if (inResponse.httpStatus == 200 || (!inResponse.httpStatus && inResponse.completionStatusCode == 200)) {
            this.$.alertMsg.setContent("Certificate downloaded!");
            this.$.alert.open();
            this.$.certAppRequest.call({ id: "com.palm.app.certificate" });
            //this.$.certInstallRequest.call({ certificateFilename: "/media/internal/webOSArchiveProxyCertificate.der" });
        }
    },
    downloadFail: function(inSender, inResponse) {
        enyo.log("Download failure, results=" + enyo.json.stringify(inResponse));
        this.$.alertMsg.setContent("Failed to download certificate!");
        this.$.alert.open();
    },

    downloadFile: function(inSender, inResponse) {
        enyo.log("** downloading: " + this.$.certDownloadPath.value);
        this.$.fileDownload.call({
            //target: "http://www.webosarchive.org/proxy/wOSAServiceCert.der",
            target: this.$.certDownloadPath.value,
            mime: "application/x-x509-ca-cert",
            targetDir: "/media/internal/",
            targetFilename: "wOSAServiceCert.der",
            keepFilenameOnRedirect: false,
            canHandlePause: false,
            subscribe: true
        });
    },

    getPreferencesSuccess: function(inSender, inResponse) {
        //	enyo.log("got success from getPreferences");
    },
    getPreferencesFailure: function(inSender, inResponse) {
        //	enyo.log("got failure from getPreferences");
    },

    certificateAddSuccess: function(inSender, inResponse) {
        enyo.log("got success from add certificate");
        enyo.log(inResponse);
    },
    certificateAddFailure: function(inSender, inResponse) {
        enyo.log("got failure from add certificate");
        enyo.log(inResponse);
    },

});