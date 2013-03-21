/**
 * Serializer. JSON doesn't work bc it doesn't accept functions.
 */
goog.provide("PAE.Serializer");
(function() {
    var Serializer = PAE.Serializer = {};
    /**
     * Turn an object into a string, keeping functions intact.
     * @param {Object} input
     */
    Serializer.serialize = function(input) {
        return JSON.stringify(input, function(name, value) {
            if (typeof value == "function") {
                return {__serializedFunction : true, func: value.toString()};
            }
            return value
        })
    }
    /**
     * Turn a string with serialized functions into an object.
     * @param {Object} input
     */
    Serializer.deserialize = function(input) {
        return JSON.parse(input, function(name, value) {
            if (typeof value === 'object' && value !== null) {
                if (value.__serializedFunction === true && value.func) {
                    eval('var f = ' + value.func);
                    return f;
                }
            }
            return value;
        })
    }
})();
