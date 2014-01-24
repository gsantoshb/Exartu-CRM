Hierarchies = new Meteor.Collection("hierarchies");

Jobs = new Meteor.Collection("jobs");

Activities = new Meteor.Collection("activities");

Contactables = new Meteor.Collection("contactables");

Messages = new Meteor.Collection("messages");

ObjectTypes = new Meteor.Collection("objectTypes");

Relations = new Meteor.Collection("relations");

Collections = {
    Hierarchies: Hierarchies,

    Jobs: Jobs,

    Activities: Activities,

    Contactables: Contactables,

    Messages: Messages,

    ObjectTypes: ObjectTypes,

    Relations: Relations
}