var userController = {
    data: {
        auth0Lock: null,
        config: null
    },
    uiElements: {
        loginButton: null,
        logoutButton: null,
        profileButton: null,
        uploadButton: null,
        profileNameLabel: null,
        profileImage: null
    },
    init: function(config) {
        var that = this;

        this.uiElements.loginButton = $('#auth0-login');
        this.uiElements.logoutButton = $('#auth0-logout');
        this.uiElements.profileButton = $('#user-profile');
        this.uiElements.profileNameLabel = $('#profilename');
        this.uiElements.profileImage = $('#profilepicture');
        this.uiElements.uploadButton = $('#upload-video-button');

        this.data.config = config;
        this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);
        var idToken = localStorage.getItem('userToken');

        if (idToken) {
            this.configureAuthenticatedRequests();
            this.data.auth0Lock.getProfile(idToken, function (err, profile) {
                if (err) {
                    console.error('Error getting the profile:' + err.message);
                }
                that.showUserAuthenticationDetails(profile);
            });
        }
        this.wireEvents();
    },
    configureAuthenticatedRequests: function() {
        console.log('[INFO] Setting Up Ajax Requests...');
        $.ajaxSetup({
            'beforeSend': function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' 
                    + localStorage.getItem('userToken'));
            }
        });
    },
    showUserAuthenticationDetails: function(profile) {
        var showAuthenticationElements = !!profile;
        if (showAuthenticationElements) {
            this.uiElements.profileNameLabel.text(profile.nickname);
            this.uiElements.profileImage.attr('src', profile.picture);
            this.uiElements.uploadButton.css('display', 'inline-block');
        }
        this.uiElements.loginButton.toggle(!showAuthenticationElements);
        this.uiElements.logoutButton.toggle(showAuthenticationElements);
        this.uiElements.profileButton.toggle(showAuthenticationElements);
    },
    wireEvents: function() {
        var that = this;

        this.uiElements.loginButton.click(function(e) {
            var params = {
                authParams: {
                    scope: 'openid email user_metadata picture'
                }
            };

            that.data.auth0Lock.show(params, function(err, profile, token) {
                if (err) {
                    console.error('Auth0 Error: ' + err.message);
                } else {
                    localStorage.setItem('userToken', token);
                    that.configureAuthenticatedRequests();
                    that.showUserAuthenticationDetails(profile);
                }
            });
        });
        this.uiElements.logoutButton.click(function(e) {
            localStorage.removeItem('userToken');
            that.uiElements.logoutButton.hide();
            that.uiElements.profileButton.hide();
            that.uiElements.uploadButton.hide();
            that.uiElements.loginButton.show();
        });
        this.uiElements.profileButton.click(function(e) {
            var url = that.data.config.apiBaseUrl + '/user-profile';
            console.info('Invoking ' + url);
            $.get(url, function (data, status) {
                console.log(data);
                console.log(status);
                alert(JSON.stringify(data));
            });
        });
    }
}