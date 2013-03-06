window.Skepto = {
	items : {
		snake : {
			width: 90,
			height: 90,
			frameRate: 1,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['snake_inv.svg']
			}
		},
		beans: {
			width: 90,
			height: 90,
			frameRate: 1,
			defaultAnimation: 'idle',
			vectorAnimations: {idle: ['beans_inv.svg']}
		}
	},
	resources : {
		audio : [
			"blah1.ogg",
			"blah2.ogg",
			"blah3.ogg",
			"snake1.ogg",
			"snake2.ogg",
			"snake3.ogg"
		],
		images : [
		],
		svgs: [
			"skepto_idle.svg",
			"skepto_walkl1.svg",
			"skepto_walkl2.svg",
			"skepto_walkr1.svg",
			"skepto_walkr2.svg",
			"bigsnake.svg",
			"dock.svg",
			"dockBG.svg",
			"snake_inv.svg",
			"beans_inv.svg",
			"beans_big.svg",
			"door.svg"
		]
	},
	startRoom : "dock",
	resourceURL : "resources",
	dynamics : {
		door: {
			width: 239,
			height: 437,
			frameRate: 1,
			scale: 0.6,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['door.svg']
			}
		},
		dock: {
			width: 2048,
			height: 1536,
			frameRate: 1,
			speed: 200,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['dock.svg']
			}
		},
		dockBG: {
			width: 2048,
			height: 1536,
			frameRate: 1,
			speed: 200,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['dockBG.svg']
			}
		},
		beans: {
			width: 200,
			height: 200,
			frameRate: 1,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['beans_big.svg']
			},
			onClick: function(e) {
				if (e.item == null) {
					this.game.giveItem('beans');
					this.dynamic.remove();
				}
			}
		},
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
	    	],
	    	onClick : function(e) {
				if (e.item === null) {
					this.dynamic.playText({text: "Hi, I'm Skepto the ghost. Thanks for helping me on my adventures!"});
				}
				else if (e.item == 'snake') {
					this.dynamic.playText({text: "That's my favorite snake, Dr. Hiss!"});
				}
				else {
					this.dynamic.playText({text: "I'm not sure what to make of that."});
				}
	    	}
		},
		snake : {
			frameRate : 4,
			speed : 200,
			defaultAnimation : 'idle',
			width: 528,
			height: 385,
			vectorAnimations: {
				idle: [
					"bigsnake.svg"
				]
			},
			talkNoises: [
				"snake1.ogg",
				"snake2.ogg",
				"snake3.ogg"
			]
		}
	},
	rooms : {
		"bean_store": {
			bgColor: "grey",
			follow: "player",
			layers: {
				"foreground": {
					zIndex: 10,
					scrollSpeed: 1.0
				},
				"behind": {
					zIndex: 9,
					scrollSpeed: 1.0
				},
				"background": {
					zIndex: 5,
					scrollSpeed: 1.0
				}
			},
			dynamics: {
				player: {
					walkSpeed : 8.0,
					listening: true,
					id : "ghost",
					layer : "foreground",
					x : 388,
					y : 197,
					scale : 0.3
				},
				beans: {
					listening: true,
					id: "beans",
					layer: "behind",
					x: 600,
					y: 400,
					scale: 1.0
				},
				door: {
					listening: true,
					x: 164,
					y: 384,
					id: "door",
					layer: "behind",
					onClick: function(e) {
						if (e.item == null) {
							this.game.transition({room: 'dock'});
						}
					}
				}
			}
		},
		"dock" : {
			bgColor : "black",
			follow: "player",
			layers : {
				"foreground" : {
					zIndex: 10,
					scrollSpeed : 1.0
				},
				"behind": {
					zIndex: 8,
					scrollSpeed: 1.0
				},
				"snakeLayer": {
					zIndex: 9,
					scrollSpeed: 1.0
				},
				"background" : {
					zIndex: 5,
					scrollSpeed : 1.0
				}
			},
			dynamics : {
				player: {
					walkSpeed : 8.0,
					listening: true,
					id : "ghost",
					layer : "foreground",
					x : 466,
					y : 992,
					scale : 0.3
				},
				snake: {
					walkSpeed: 1.0,
					listening: true,
					id: "snake",
					layer : "snakeLayer",
					x: 1026,
					y: 902,
					scale : 0.5,
					onClick: function(e) {
						if (e.item == 'beans') {
							this.game.removeItem('beans');
							this.game.giveItem('snake');
							this.dynamic.remove();
						}
						else {
							this.dynamic.playText({text: "I'm not going anywhere without my beans!"});
						}
					}
				},
				dock: {
					listening: false,
					id: "dock",
					layer: "behind",
					x: 0,
					y: 0,
					scale: 1.0
				},
				dockBG: {
					listening: false,
					x: 0,
					y: 0,
					id: "dockBG",
					layer: "background",
					scale: 1.0
				},
				door: {
					listening: true,
					x: 1854,
					y: 1003,
					id: "door",
					layer: "snakeLayer",
					onClick: function(e) {
						if (e.item == null) {
							this.game.transition({room: 'bean_store'});
						}
					}
				}
			},
			statics : {
			}
		}
	}
}
