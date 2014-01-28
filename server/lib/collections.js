Hierarchies = new Meteor.Collection("hierarchies");

Jobs = new Meteor.Collection("jobs");

Activities = new Meteor.Collection("activities");

Contactables = new Meteor.Collection("contactables");

Messages = new Meteor.Collection("messages");

ObjTypes = new Meteor.Collection("objTypes");

Relations = new Meteor.Collection("relations");

LookUps = new Meteor.Collection("lookUps");

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