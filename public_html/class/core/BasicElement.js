/**
 * Handles safe destruction
 * @returns {BasicElement}
 */
var BasicElement = function() {
    this.hooks = {
        "eventListeners": { 
            "action": function(item) {      // this is function called for every item of the list during destruction
                item.target.removeEventListener(item.name, item.function, item.capture);
                delete item.function;
            }, "list": [] },
        "globals": { 
            "action": function(item) {      // this is function called for every item of the list during destruction
                removeGlobal(item.name, item.function);
                delete item.function;
            }, "list": [] },
        "requests": { 
            "action": function(item) {      // this is function called for every item of the list during destruction
                forgetRequest(item.name);
            }, "list": [] }
    };
};

/**
 * Creates and registers new event listener
 * @param {Element} target of the function call
 * @param {string} event name
 * @param {function} callback
 * @param {object|boolean|null} options see {@link addEventListener}
 * @param {boolean|null} capture
 * @returns {function|null} callback or null in case of error
 */
BasicElement.prototype.hookEventListener = function(target, event, callback, options, capture) {
    if(!target || !event || !callback || !(typeof target.addEventListener === "function"))
        return null;
    if(typeof options === "boolean") {
        capture = options;
        options = null;
    }
    target.addEventListener(event, callback, options, capture);
    this.hooks.eventListeners.list.push({
        "name": event, "function": callback, "capture": capture
    });
    return callback;
};

/**
 * Creates and registers new global listener
 * @param {string} name of global tracked
 * @param {function} callback
 * @returns {function|null} callback or null in case of error
 */
BasicElement.prototype.hookGlobal = function(name, callback) {
    if(!name || !callback)
        return null;
    addGlobal(name, callback);
    this.hooks.globals.list.push({
        "name": name, "function": callback
    });
    return callback;
};

/**
 * Creates and registers new global listener
 * @param {string} name of global tracked
 * @param {function} callback
 * @returns {function|null} callback or null in case of error
 */
BasicElement.prototype.hookRequest = function(name, callback) {
    if(!name || !callback)
        return null;
    listen(name, callback);
    this.hooks.requests.list.push({
        "name": name, "function": callback
    });
    return callback;
};

/**
 * Destroys element; goes through hooks and calls their action onto each item in their list
 * @returns {undefined}
 */
BasicElement.destroy = function() {
    for(var i in this.hooks) {
        for(var j in this.hooks[i])
            this.hooks[i].action(this.hooks[i].pop([j]));
        delete this.hooks[i].list;
        delete this.hooks[i].action;
        delete this.hooks[i];
    }
};