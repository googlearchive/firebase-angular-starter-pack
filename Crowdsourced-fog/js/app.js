var myapp = angular.module("myapp", ["firebase"]);

function WeatherController($scope, $firebase) {
	$scope.hoods = [{
		value: 'The Richmond',
		id: 'the-richmond'
	}, {
		value: 'The Presidio',
		id: 'the-presidio'
	}, {
		value: 'North Beach',
		id: 'north-beach'
	}, {
		value: 'Golden Gate Park',
		id: 'ggp'
	}, {
		value: 'NOPA',
		id: 'nopa'
	}, {
		value: 'Tenderloin',
		id: 'tenderloin'
	}, {
		value: 'The Sunset',
		id: 'the-sunset'
	}, {
		value: 'The Haight',
		id: 'the-haight'
	}, {
		value: 'SOMA',
		id: 'soma'
	}, {
		value: 'The Mission',
		id: 'the-mission'
	}, {
		value: 'Financial District',
		id: 'fidi'
	}, {
		value: 'Nob Hill',
		id: 'nob-hill',
	}, {
		value: 'Russian Hill',
		id: 'russian-hill'
	}, {
		value: 'Chinatown',
		id: 'chinatown'
	}, {
		value: 'The Marina',
		id: 'marina'
	}, {
		value: 'Hayes Valley',
		id: 'hayes-valley'
	}];

	$scope.init = function(neighborhood) {

		var ref = $firebase(new Firebase("https://angular-experiment.firebaseio.com/" + neighborhood));

		ref.$on('loaded', function(values) {
			$scope.sunny = values['sunny'];
			$scope.foggy = values['foggy'];

			//Check values to display sun or fog image
			if ($scope.sunny >= $scope.foggy) {
				$scope.weather = "sunny";
			} else {
				$scope.weather = "foggy";
			}
		});

		$scope.updateCount = function(forecast) {

			//Increment counters
			if (forecast == "sun") {
				$scope.sunny += 1;
				ref.$child("sunny").$set($scope.sunny);
			} else {
				$scope.foggy += 1;
				ref.$child("foggy").$set($scope.foggy);
			}

			//Check values and update weather image
			if ($scope.sunny >= $scope.foggy) {
				$scope.weather = "sunny";
			} else {
				$scope.weather = "foggy";
			}
		}
	}
}