/**
 * Dynamic definitions definitely define dynamics. Say it ten times fast and I'll buy you coffee.
 */
goog.provide("PAE.DynamicDefinition");
(function() {
    var defStruct = {
        name: { type: 'string'},
        width: { type: 'int' },
        height: { type: 'int' },
        defaultAnimation: { type: 'string'},
        frameRate: { type: 'int' },
        vectorAnimations: { type: 'object' },
        talkNoises: { type: 'array', def: []},
        speed: { type: 'int', def: 100 },
        onClick: { type: 'function', def: function(e){}}
    }
    var DynamicDefinition = PAE.DynamicDefinition = function(params) {
        PAE.Util.setAttrs(this, defStruct, params);
    }
    DynamicDefinition.prototype.getAttrs = function() {
        return PAE.Util.dumpAttrs(defStruct, this.attrs);
    }
    PAE.Util.addGetters(DynamicDefinition, ['name', 'width', 'height', 'defaultAnimation', 'frameRate', 'vectorAnimations', 'speed', 'listening', 'onClick', 'talkNoises']);
    PAE.Util.addSetters(DynamicDefinition, ['name', 'width', 'height', 'defaultAnimation', 'frameRate', 'vectorAnimations', 'speed', 'listening', 'onClick', 'talkNoises']);
})()