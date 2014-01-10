Meteor.publish('contactables', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Contactables.find({
        hierId: user.hierId
    });
})

Todos = new Meteor.Collection("todos");

Meteor.publish('todos', function () {
    return Todos.find();
})

Todos.allow({
    insert: function () {
        return true;
    }
});