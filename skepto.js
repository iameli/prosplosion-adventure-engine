window.Skepto = {
	items : {
		snake : {
			image : "snake_inv.png"
		}
	},
	resources : {
		audio : [
			"blah1.ogg",
			"blah2.ogg",
			"blah3.ogg"
		],
		images : [
			"dock.jpg",
			"snake_inv.png"
		]
	},
	startRoom : "dock",
	resourceURL : "resources",
	dynamics : {
		ghost : {
			image : 'skepticalghost.png',
			frameRate : 4,
			speed : 200,
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
	    	},
	    	talkNoises : [
	    		"blah1.ogg",
	    		"blah2.ogg",
	    		"blah3.ogg"
	    	]
		},
		snake : {
			image : 'bigsnake.png',
			frameRate : 4,
			speed : 200,
			defaultAnimation : 'idle',
			animations : {
				idle: [{
					x : 0,
					y : 0,
					width: 528,
					height: 385
				}]
			}
		}
	},
	statics : {
		dockBG : {
			image : 'dock.jpg'
		}
	},
	rooms : {
		"dock" : {
			bgColor : "black",
			follow: "player",
			layers : {
				"foreground" : {
					zIndex: 10,
					scrollSpeed : 100
				},
				"background" : {
					zIndex: 9,
					scrollSpeed : 100
				}
			},
			dynamics : {
				player: {
					walkSpeed : 8.0,
					id : "ghost",
					layer : "foreground",
					x : 200,
					y : 200,
					scale : 0.3,
					onClick : function(self) {
			    		self.playText({text: "Hi, I'm Skepto the ghost. Thanks for helping me on my adventures!"});
			    		
			    	}
				},
				snake: {
					walkSpeed: 1.0,
					id: "snake",
					layer : "foreground",
					x: 400,
					y: 300,
					scale : 0.5,
					onClick: function(self) {
						this.game.giveItem('snake');
						self.remove();
					}
				}
			},
			statics : {
				bg : {
					id : "dockBG",
					layer: "background"
				}
			}
		}
	}
}
