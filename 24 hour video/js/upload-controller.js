var uploadController = {
    data: {
        config: null
    },
    uiElements: {
        uploadButton: null
    },
    init: function(configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-video-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');
        this.wireEvents();
        this.configureAuthenticatedRequests();

    },
    wireEvents: function() {
        var that = this;

        this.uiElements.uploadButton.on('change', function(result) {
            var file = $('#upload').get(0).files[0];
            var requestDocumentUrl = that.data.config.apiBaseUrl + '/' + 
                's3-policy-document?filename=' + 
                encodeURI(file.name);

            // issue a request to Lambda function to get policy, signature, etc
            console.log('[INFO] Getting Upload Policy from ', requestDocumentUrl);
            $.get(requestDocumentUrl, function(data, status) {
                console.log("[INFO] Getting Upload Policy Received Status: ", status);
                that.upload(file, data, that)
            });
        });
    },
    upload: function(file, data, that) {
        console.log("[INFO] Beginning File Upload...");
        console.log(file);
        console.log(data);
        this.uiElements.uploadButtonContainer.hide();
        this.uiElements.uploadProgressBar.show();
        this.uiElements.uploadProgressBar.find('.progress-bar').css('width', 0);

        // create a FormData object for data to be supplied
        var fd = new FormData();
        fd.append('key', data.key);
        fd.append('acl', 'private');
        fd.append('Content-Type', file.type);
        fd.append('AWSAccessKeyId', data.access_key);
        fd.append('policy', data.encoded_policy);
        fd.append('signature', data.signature);
        fd.append('file', file, file.name);

        // Ajax post to upload file
        // note we don't send Authorization Header
        $.ajax({
            url: data.upload_url,
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            xhr: this.progress,
            beforeSend: function(req) {
                req.setRequestHeader('Authorization', '');
            }
        }).done(function(response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            alert('File Upload Finished');
        }).fail(function(response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            alert('File Upload Failed');
            console.log(response);
        });
    },
    // update progress bar on main page
    progress: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.upload.onprogress = function(evt) {
            var percentage = evt.loaded / evt.total * 100;
            $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
        };
        return xhr;
    },
    configureAuthenticatedRequests: function() {
        console.log('[INFO] Setting Up Ajax Requests...');
        console.log('[INFO] Token: ', localStorage.getItem('userToken'));
        $.ajaxSetup({
            'beforeSend': function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' 
                    + localStorage.getItem('userToken'));
            }
        });
    }
}