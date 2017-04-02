var videoController = {
    data: {
        config: null
    },
    uiElements: {
        videoCardTemplate: null,
        videoList: null,
        loadingIndicator: null
    },
    init: function(config) {
        this.uiElements.videoCardTemplate = $('#video-template');
        this.uiElements.videoList = $('#video-list');
        this.uiElements.loadingIndicator = $('#loading-indicator');

        this.data.config = config;

        this.connectToFirebase();
    },
    addVideoToScreen: function(videoId, videoObj) {
        var newVideoElement = this.uiElements.videoCardTemplate.clone().attr('id', videoId);

        // if video clicked on, pause or play
        newVideoElement.click(function() {
            var video = newVideoElement.find('video').get(0);
            if (newVideoElement.is('video-playing')) {
                video.pause();
                $(video).removeAttr('controls');
            } else {
                $(video).attr('controls', '');
                video.play();
            }
            newVideoElement.toggleClass('video-playing');
        });

        this.updateVideoOnScreen(newVideoElement, videoObj);
        this.uiElements.videoList.prepend(newVideoElement);
        newVideoElement.show();
        this.uiElements.videoCardTemplate.hide();
        
    },
    updateVideoOnScreen: function(videoElement, videoObj) {
        if (!videoObj) {
            return;
        }

        // if video transcoding, hide it and show placeholder image
        if (videoObj.transcoding) {
            videoElement.find('video').hide();
            videoElement.find('.transcoding-indicator').show();
        } else {
            videoElement.find('video').show();
            videoElement.find('.transcoding-indicator').hide();
        }

        var getSignedUrl = this.data.config.apiBaseUrl + 
            '/signed-url?key=' + encodeURI(videoObj.key);

        console.log('[INFO] Signed Url: ', getSignedUrl);

        $.get(getSignedUrl, function(data, result) {
            if (result === 'success' && data.url) {
                // set video URL on video HTML5 element
                console.log('Setting Video URL: ', data.url);
                console.log(data.url);
                videoElement.find('video').attr('src', data.url);
            }
        })
    },
    getElementForVideo: function(videoId) {
        return $('#' + videoId);
    },
    connectToFirebase: function() {
        var that = this;
        // initialize connection to Firebase
        firebase.initializeApp(this.data.config.firebase);
        // special location to tell us if we are connected to Firebase
        var isConnectedRef = firebase.database().ref('.info/connected');
        // get reference to video's node in our database
        var nodeRef = firebase.database().ref('videos');
        
        // hide spinner once we are connected to Firebase
        isConnectedRef.on('value', function(snap) {
            if (snap.val() === true) {
                that.uiElements.loadingIndicator.hide();
            }
        });

        // runs each time a video is added to database
        nodeRef.on('child_added', function(childSnapshot) {
            that.uiElements.loadingIndicator.hide();
            that.addVideoToScreen(childSnapshot.key, childSnapshot.val());
        });

        // runs when change is made to an existing record
        nodeRef.on('child_changed', function(childSnapshot) {
            // update video object on screen with new details
            that.updateVideoOnScreen(
                that.getElementForVideo(childSnapshot.key), childSnapshot.val()
            );
        });

    }
};