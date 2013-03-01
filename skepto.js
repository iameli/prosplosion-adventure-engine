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
		],
		svgs: [
			"skepto_idle.svg",
			"skepto_walkl1.svg",
			"skepto_walkl2.svg",
			"skepto_walkr1.svg",
			"skepto_walkr2.svg"
		]
	},
	startRoom : "dock",
	resourceURL : "resources",
	dynamics : {
		ghost : {
			width: 315,
			height: 488,
			frameRate : 4,
			speed : 200,
			defaultAnimation : 'idle',
			vectorAnimations: {
				idle: [
					"skepto_idle.svg"
				],
				walkRight: [
					"skepto_walkr1.svg",
					"skepto_walkr2.svg"
				],
				walkLeft: [
					"skepto_walkl1.svg",
					"skepto_walkl2.svg"
				]
			},
	    	talkNoises : [
	    		"blah1.ogg",
	    		"blah2.ogg",
	    		"blah3.ogg"
	    	]
		},
		snake : {
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
					onClick : function(e) {
						if (e.item === null) {
							this.sprite.playText({text: "Hi, I'm Skepto the ghost. Thanks for helping me on my adventures!"});
						}
						else if (e.item == 'snake') {
							this.sprite.playText({text: "That's my favorite snake, Dr. Hiss!"});
						}
						else {
							this.sprite.playText({text: "I'm not sure what to make of that."});
						}
			    		
			    	}
				}
				// snake: {
					// walkSpeed: 1.0,
					// id: "snake",
					// layer : "foreground",
					// x: 400,
					// y: 300,
					// scale : 0.5,
					// onClick: function(e) {
						// this.game.giveItem('snake');
						// this.sprite.remove();
					// }
				// }
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
