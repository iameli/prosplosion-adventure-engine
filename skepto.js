window.Skepto = {
	flags: {
		SNAKE_GONE: false,
		BEANS_GONE: false
	},
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
			"door.svg",
			"tree1.svg",
			"tree2.svg"
		]
	},
	startRoom : "dock",
	resourceURL : "resources",
	dynamics : {
		tree: {
			width: 352,
			height: 405,
			frameRate: 4,
			scale: 1.0,
			defaultAnimation: 'idle',
			vectorAnimations: {
				idle: ['tree1.svg', 'tree2.svg']
			}
		},
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
					this.game.setFlag("BEANS_GONE");
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
			onEnter: function(e) {
				if (this.game.hasFlag('BEANS_GONE')) {
					this.dynamics.beans.remove();
				}
			},
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
			walkable: "M-55,1172.771L388.146,963.75l352.92,124.059l364.692-86.9l318.863,124.096c0,0,283.17-107.569,289.376-107.569c6.204,0,399.001,103.419,399.001,103.419v172.098l-386.556-85.223l-292.44,85.223l-322.041-85.223l-365.8,74.465l-356.171-93.079L-55,1325.631V1172.771z",
			onEnter: function(e) {
				if (this.game.hasFlag('SNAKE_GONE')) {
					this.dynamics.snake.remove();
				}
			},
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
				"trees": {
					zIndex: 6,
					scrollSpeed: 0.4
				},
				"frontTrees": {
					zIndex: 15,
					scrollSpeed: 10.0
				},
				"background" : {
					zIndex: 5,
					scrollSpeed : 0.2
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
							this.game.setFlag("SNAKE_GONE");
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
				},
				tree1: {
					listening: false,
					x: 0,
					y: 800,
					scale: 0.5,
					id: "tree",
					layer: "trees"
				},
				tree2: {
					listening: false,
					x: 200,
					y: 800,
					scale: 0.5,
					id: "tree",
					layer: "trees"
				},
				tree3: {
					listening: false,
					x: 400,
					y: 800,
					scale: 0.5,
					id: "tree",
					layer: "trees"
				},
				tree4: {
					listening: false,
					x: 600,
					y: 800,
					scale: 0.5,
					id: "tree",
					layer: "trees"
				},
				frontTree: {
					listening: false,
					x: 1100,
					y: 300,
					scale: 3.0,
					id: "tree",
					layer: "frontTrees"
				}
			},
			statics : {
			}
		}
	}
}
