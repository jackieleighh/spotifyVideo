angular.module('spotifyvideo.controllers', [])

.controller('PlaylistCtrl', function($scope, $rootScope, $stateParams, Spotify, AlertController) {
	
	// make sure we're logged in first
	Spotify.getCurrentUser().then(function(data) {
	}, function(error) {
		window.location = '/';
	}); 
	
	var listid = $stateParams.listid;
	var userid = $stateParams.userid;
	$scope.listname = $stateParams.listname;

	$scope.tracks = [];

	Spotify.getPlaylist(userid, listid).then(function(data) {
		$scope.tracks = data.data.tracks.items;
	});

	var uri_list = [];
 	for(var i = 0; i < $scope.tracks.length; i++) {
 		uri_list[i] = "spotify:track:" + $scope.tracks[i].track.id;
 	}

 	// TRY TO USE PLAYLIST LINK INSTEAD OF URI LIST
	$scope.playPlaylist = function() {
	 	$rootScope.player.play({
	 		uris : uri_list
	 	}).then( function() {
	 		$rootScope.currentTrack = listid;
	 		$rootScope.isPlaylist = true;
	 		$rootScope.currentPlaylist = $scope.listname;
	 	}, function(error) {
	 		AlertController.create({
	 			title: 'ERROR',
	 			text: error;
	 		});
	 	});
	}
	// USE PLAYLIST LINK WITH OFFSET : INDEX
	$scope.playTrack = function(trackinfo) {
	 	$rootScope.player.play({
	 		uris : uri_list // skip to index of song 
	 	}).then( function() {
	 		$rootScope.currentTrack = trackinfo;
	 		$rootScope.isPlaylist = false;
	 	}, function(error) {
	 		AlertController.create({
	 			title: 'ERROR',
	 			text: error;
	 		});
	 	});
	}

	$scope.openSpotify = function(link) {
		window.open(link, '_blank', 'location=yes');
	}

	$scope.pause = function() {
		if($scope.currentTrack != null) {
			$rootScope.player.pause();
		}
	}

	$scope.play = function() { 
		if($scope.currentTrack != null) {
			$rootScope.player.play();
		}
	}

	$scope.prev = function() {
		if($scope.currentTrack != null && $scope.isPlaylist) {
			$rootScope.player.skipToPrevious().then(function() {

			}, function(error) {
				console.log($rootScope.player);
			});
		}
	}

	$scope.next = function() { 
		if($scope.currentTrack != null && $scope.isPlaylist) {
			$rootScope.player.skipToNext();
		}
	}

	// capture callback
	var captureSuccess = function(mediaFiles) {
	    var i, path, len;
	    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
	        path = mediaFiles[i].fullPath;
	        // do something interesting with the file
	        console.log(path);
	    }
	};

	// capture error callback
	var captureError = function(error) {
	    //navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
	    AlertController.create({
 			title: 'ERROR',
 			text: error;
 		});
	};
	
	$scope.captureVideo = function() {
		// start video capture
		navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:2});
	};

})

.controller('ListsCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaOauth, Spotify) {
	$scope.playlists = [];
	$scope.loggedIn = false;

	if($rootScope.player == null) {
		$rootScope.player = new SpotifyWebApi();
		// $rootScope.player.setClientId('572e9a9e80ba47b09b7ec8eca1e8a709');
		// $rootScope.player.setRedirectUri('http://localhost/callback');
		// $rootScope.player.setScope('user-read-private playlist-read-private');
	}

	$scope.spotifyLogin = function() {
		$cordovaOauth.spotify(Spotify.clientId, ['user-read-private', 'playlist-read-private']).then( function(result) {
		  	window.localStorage.setItem('spotify-token', result.access_token);
		  	Spotify.setAuthToken(result.access_token); 
		  	$rootScope.player.setAccessToken(result.access_token);
		  	$scope.loggedIn = true;
		 	$scope.updateInfo();
		}, function(error) {
		 	console.log("ERROR : " + error);
		}); 
	};

	$scope.updateInfo = function() {
		Spotify.getCurrentUser().then(function(data) {
			$scope.getUserPlaylists(data.data.id);
		}, function(error) {
			$scope.spotifyLogin();
		}); 
	};

	$ionicPlatform.ready(function() {
		var storedToken = window.localStorage.getItem('spotify-token');
		if(storedToken !== null) {
			Spotify.setAuthToken(storedToken);
			$rootScope.player.setAccessToken(storedToken);
			$scope.loggedIn = true;
			$scope.updateInfo();
		} else {
			$scope.loggedIn = false;
			$scope.spotifyLogin();
		}
	});

	$scope.getUserPlaylists = function(userid) {
		Spotify.getUserPlaylists(userid).then(function (data) {
			$scope.playlists = data.data.items;
		});
	};

	$scope.pause = function() {
		if($scope.currentTrack != null) {
			$rootScope.player.pause();
		}
	}

	$scope.play = function() { 
		if($scope.currentTrack != null) {
			$rootScope.player.play();
		}
	}

	$scope.prev = function() {
		if($scope.currentTrack != null && $scope.isPlaylist) {
			$rootScope.player.skipToPrevious();
		}
	}

	$scope.next = function() { 
		if($scope.currentTrack != null && $scope.isPlaylist) {
			$rootScope.player.skipToNext();
			console.log($rootScope.player);
		}
	}

});