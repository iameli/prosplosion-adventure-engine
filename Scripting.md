===============================================
Scripting with the Prosplosion Adventure Engine
===============================================

PAE doesn't have a scripting engine per se. All of the code of PAE games is 
Javascript, and the APIs aren't insulated if you're determined to get at the 
underlying engine.That said, the Script API provided by the script class is 
more than sufficent for most use cases.

Design Philosophy
------------------

The actions within the script API can be thought of as a queue that will be run
in sequence, vaugely analogous to a node fiber. This obviates the need for 
complicated chains of callbacks which woud only *slow you down*.

Local scripts are anonymous. In a particular room, foo.onClick has a Script 
attached that the local player can utilize. They can only be called by their 
particular action being triggered.
 
Global scripts are named and scoped to their particular object, up to and 
including the Game object. They are for behavior that stretches across multiple
rooms or contexts. Presumably the player character reacts to the same object 
the same way no matter what room you examine it in--but not necessarily! 

Example
-------

    var clock = this.dynamics.clock
    this.player.walkTo(clock)
    this.audio.play('clock1.ogg')
      .async(true)
    this.dialogue('PLAYER_CLOCK_CONVERSATION')

Global Parameters
=================

    .async(boolean) (defaults false)
    
Disable queuing for this event. Fire the next event in the chain immediately. 
Combining this with a call to another script can be useful to get multiple 
queues running concurrently. 

Has no effect if called on an instant-running event.

Objects
=======

`this`
------

Your humble home. Truly, we could populate the running script with all of the 
`this` variables and do away with the constant self-reference, but then we
might run into naming conflicts! We wouldn't want that.

`this.dynamics`
---------------

A map of all the dynamics in the room. If you have one named `player`,
`this.dynamic.player` will get 'em.

    dynamic.walkTo(x, y)
    
Walk to another location, using pathfinding data.

*Options*  
    .useWalkAnim(boolean) (defaults true)  
By default the dynamic will use its "walkL" and "walkR" animation. If they don't
exist, it will use its "walk" animation. If it doesn't exist, it will give up.

    dynamic.walkTo(Dynamic destination)
    
Tell this dynamic to walk to another dynamic. If the other dynamic has a 
destination point defined we'll go there, otherwise the engine will try and
figure out a good destination as best as it can. 
*Options*
    .useWalkAnim(boolean) (defaults true)
    
    dynamic.setAnimation
    
`this.player`
--------

Shortcut object to get the current player Dynamic.