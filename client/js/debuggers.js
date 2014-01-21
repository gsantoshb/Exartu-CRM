
logRenders=function () {
    _.each(Template, function (template, name) {
        var oldRender = template.rendered;
        var counter = 0;

        template.rendered = function () {
            console.log(name, "render count: ", ++counter);
            oldRender && oldRender.apply(this, arguments);
        };
    });
}

var wrappedFind = Meteor.Collection.prototype.find;

Meteor.Collection.prototype.find = function () {
    var cursor = wrappedFind.apply(this, arguments);
//    if (Global.debugger)
    {
        var collectionName = this._name;
        console.log(cursor);
        cursor.observeChanges({
            added: function (id, fields) {
                console.log(collectionName, 'added', id, fields);
            },

            changed: function (id, fields) {
                console.log(collectionName, 'changed', id, fields);
            },

            movedBefore: function (id, before) {
                console.log(collectionName, 'movedBefore', id, before);
            },

            removed: function (id) {
                console.log(collectionName, 'removed', id);
            }
            });
    }

    return cursor;
};