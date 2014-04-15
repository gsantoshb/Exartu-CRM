if (!dType){
    dType={};
}
dType.util={
    toObject: function(array, selector){
        var sel= _.isFunction(selector) ? selector : _.isArray(selector) ? function(object){ return object[selector];} : null;
        if (!sel) return
        return _.object(_.map(array, sel), array);
    }
};