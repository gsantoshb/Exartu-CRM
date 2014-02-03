Hierarchies = new Meteor.Collection("hierarchies");

Jobs = new Meteor.Collection("jobs");

Activities = new Meteor.Collection("activities");

Contactables = new Meteor.Collection("contactables");

Messages = new Meteor.Collection("messages");

ObjTypes = new Meteor.Collection("objTypes");

Relations = new Meteor.Collection("relations");

LookUps = new Meteor.Collection("lookUps");

//Test = new Meteor.Collection("test");
//
//Meteor.publish('test', function () {
//    return Test.find({});
//});
//
//Test.before.insert(function (userId, doc) {
//    console.dir(doc);
//    console.dir(this._super.toString());
//    this._super.call(this.context, {
//        type: "echo"
//    });
//    return true;
//});
//Test.before.update(function (userId, doc, fieldNames, modifier, options) {
//    console.dir(arguments);
//})
//Test.allow({
//    insert: function () {
//        return true;
//    },
//    update: function () {
//        return true;
//    }
//})



Collections = {
	Hierarchies: Hierarchies,

	Jobs: Jobs,

	Activities: Activities,

	Contactables: Contactables,

	Messages: Messages,

	ObjTypes: ObjTypes,

	Relations: Relations,

	LookUps: LookUps
}