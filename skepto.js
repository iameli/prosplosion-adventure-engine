window.Skepto = {
	startRoom : "office",
	resourceURL : "resources",
	sprites : {
		ghost : {
			image : 'skepticalghost.png',
			defaultAnimation : 'idle',
			animations : {
		        idle: [{
		            x: 0,
		            y: 0,
		            width: 283,
		            height: 478
		        }],
		        walkRight: [{
		            x: 285,
		            y: 0,
		            width: 284,
		            height: 478
		        }, {
		            x: 570,
		            y: 0,
		            width: 283,
		            height: 478
		        }],
		        walkLeft: [{
		            x: 261,
		            y: 516,
		            width: 311,
		            height: 482
		        }, {
		            x: 572,
		            y: 512,
		            width: 281,
		            height: 487
		        }]
	    	}
		}
	},
	rooms : {
		"office" : {
			bgColor : "black",
			control : "player",
			layers : {
				"foreground" : {
					scrollSpeed : 100
				}
			},
			sprites : {
				player: {
					walkSpeed : 8.0,
					id : "ghost",
					layer : "foreground",
					x : 200,
					y : 200
				}
			}
		}
	}
}
