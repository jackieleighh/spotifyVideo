angular.module('spotifyvideo.controllers', [])

.controller('PlaylistCtrl', function($scope, $rootScope, $stateParams, $state, $cordovaCapture, Spotify) {
	
	var listid = $stateParams.listid;
	var userid = $stateParams.userid;

	// make sure we're logged in first
	Spotify.getCurrentUser().then(function(data) {
	}, function(error) {
		$state.go('login');
	}); 

	$scope.listname = $stateParams.listname;

	$scope.tracks = [];

	Spotify.getPlaylist(userid, listid).then(function(data) {
		$scope.tracks = data.data.tracks.items;
	});

	var uri_list = [];
 	for(var i = 0; i < $scope.tracks.length; i++) {
 		uri_list[i] = "spotify:track:" + $scope.tracks[i].track.id;
 	}

 	// setInterval( function() {
 	// 	$scope.$apply( function() {
	 // 		$rootScope.currentTrack = $rootScope.player.getMyCurrentPlayingTrack();
	 // 	});
 	// }, 5000);

 	// TRY TO USE PLAYLIST LINK INSTEAD OF URI LIST
	$scope.playPlaylist = function() {
		// set repeat on auto
 		//$rootScope.player.setRepeat({ 'context' : 'spotify:user:' + userid + ':playlist:' + listid }, {});
		$rootScope.player.setShuffle(true, {});
	 	$rootScope.player.play({
	 		context_uri: 'spotify:user:' + userid + ':playlist:' + listid
	 	}).then( function() {
	 		$scope.$apply( function() {
		 		$rootScope.currentTrack = listid;
		 		$rootScope.isPlaylist = true;
		 		$rootScope.currentPlaylist = $scope.listname;
		 	});
	 	}, function(error) {
	 	});
	}
	// USE PLAYLIST LINK WITH OFFSET : INDEX
	$scope.playTrack = function(trackinfo, index) {
		// set repeat on auto
		$rootScope.player.setShuffle(false, {});
	 	$rootScope.player.play({
	 		context_uri : 'spotify:user:' + userid + ':playlist:' + listid,
	 		offset : { 'position': index }
	 	}).then( function() {
	 		$scope.$apply( function() {
		 		$rootScope.currentTrack = trackinfo;
		 		$rootScope.isPlaylist = false;
		 	});
	 	}, function(error) {
	 	});
	}
	// BUTTON TO OPEN SPOTIFY APP
	$scope.openSpotify = function() {
		var link = 'https://open.spotify.com/user/' + userid + '/playlist/' + listid;
		window.open(link, '_blank', 'location=yes');
	}
	
	$scope.captureVideo = function() {
		var options = { limit: 3, saveToPhotoAlbum: true };
		// start video capture
		$cordovaCapture.captureVideo(options).then( function() {
			// success
			for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        console.log(path);
		    }
		}, function(error) {
			// fail 
			console.log(error);
		});
	};

	/* PLAYER CONTROLS FOR FOOTER BAR */
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
		if($scope.currentTrack != null) {
			$rootScope.player.skipToPrevious();
		}
	}

	$scope.next = function() { 
		if($scope.currentTrack != null) {
			$rootScope.player.skipToNext();
		}
	}

})

.controller('ListsCtrl', function($scope, $rootScope, $ionicPlatform, $state, $cordovaCapture, Spotify) {
	$scope.playlists = [];

	// make sure we're logged in first
	Spotify.getCurrentUser().then(function(data) {
		$scope.getUserPlaylists(data.data.id);
	}, function(error) {
		$state.go('login');
	}); 

	$scope.updateInfo = function() {
		Spotify.getCurrentUser().then(function(data) {
			$scope.getUserPlaylists(data.data.id);
		}, function(error) {
			$state.go('login');
		}); 
	};

	$scope.getUserPlaylists = function(userid) {
		Spotify.getUserPlaylists(userid).then(function (data) {
			$scope.playlists = data.data.items;
		});
		$scope.$apply();
	};

	$scope.captureVideo = function() {
		var options = { limit: 3, saveToPhotoAlbum: true };
		// start video capture
		$cordovaCapture.captureVideo(options).then( function() {
			// success
			for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        console.log(path);
		    }
		}, function(error) {
			// fail 
			console.log(error);
		});
	};

	/* PLAYER CONTROLS FOR FOOTER BAR */
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
		if($scope.currentTrack != null) {
			$rootScope.player.skipToPrevious();
		}
	}

	$scope.next = function() { 
		if($scope.currentTrack != null) {
			$rootScope.player.skipToNext();
		}
	}

	$ionicPlatform.ready(function() {
		var storedToken = window.localStorage.getItem('spotify-token');
		if(storedToken !== null) {
			Spotify.setAuthToken(storedToken);
			$rootScope.player.setAccessToken(storedToken);
			$scope.updateInfo();
		} else {
			$state.go('login');
		}
	});

})

.controller('LoginCtrl', function($scope, $rootScope, $state, $cordovaOauth, Spotify) {
	if($rootScope.player == null) {
		$rootScope.player = new SpotifyWebApi();
	}
	$scope.spotifyLogin = function() {
		$cordovaOauth.spotify(Spotify.clientId, ['user-read-private', 'playlist-read-private']).then( function(result) {
		  	window.localStorage.setItem('spotify-token', result.access_token);
		  	Spotify.setAuthToken(result.access_token); 
		  	$rootScope.player.setAccessToken(result.access_token);
		 	$state.go('lists');
		}, function(error) {
		 	console.log("ERROR : " + error);
		}); 
	};
});