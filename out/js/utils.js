/**
 * Utility functions
 */
const spaceRegex = new RegExp('\\s', 'g');

module.exports = {

    // Returns a deep clone of an object
    cloneObject: function (obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        // give temp the original obj's constructor
        var temp = obj.constructor();
        for (var key in obj) {
            temp[key] = this.cloneObject(obj[key]);
        }
        return temp;
    },

    /**
     * @description - Returns a string stripped of its spaces
     * @param {string} str - string to have its spaces stripped
     */
    stripSpaces: function (str) {
        return str.replace(spaceRegex, '');
    }
};