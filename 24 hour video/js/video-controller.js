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

        this.data.config = config;

        this.getVideoList();
    },
    getVideoList: function() {
        var that = this;
        var url = this.data.config.apiBaseUrl + '/videos';
        $.get(url, function(data, status) {
            console.log(data);
            that.updateVideoFrontpage(data);
        });
    },
    updateVideoFrontpage: function(data) {

        var bodyData = JSON.parse(data.body);
        
        console.log(bodyData);
        
        var baseUrl = bodyData.domain;
        var bucket = bodyData.bucket;
        
        for (var i = 0; i < bodyData.files.length; i++) {
            var video = bodyData.files[i];

            var clone = this.uiElements.videoCardTemplate.clone().attr('id', 'video-' + 1);

            clone.find('source').attr('src', video.filename);

            this.uiElements.videoList.prepend(clone);
        }
    }
}