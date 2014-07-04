Hierarchies = new Meteor.Collection("hierarchies");

Jobs = new Meteor.Collection("jobs");

Deals = new Meteor.Collection("deals");

Activities = new Meteor.Collection("activities");

Contactables = new Meteor.Collection("contactables");

Conversations = new Meteor.Collection("conversations");

Messages = new Meteor.Collection("messages");

Tasks = new Meteor.Collection("tasks");

ObjTypes = new Meteor.Collection("objTypes");

Relations = new Meteor.Collection("relations");

LookUps = new Meteor.Collection("lookUps");

Roles = new Meteor.Collection("roles");

ContactMethods = new Meteor.Collection("contactMethods");

Assignments = new Meteor.Collection("assignments");
Candidates = new Meteor.Collection("candidates");
JobRateTypes = new Meteor.Collection("jobRateTypes");

Notes = new Meteor.Collection("notes");

Collections = {
  Hierarchies: Hierarchies,
  Jobs: Jobs,
  Deals: Deals,
  Activities: Activities,
  Contactables: Contactables,
  Conversations: Conversations,
  Messages: Messages,
  ObjTypes: ObjTypes,
  Relations: Relations,
  LookUps: LookUps,
  Tasks: Tasks,
    Notes: Notes,
    Assignments: Assignments,
    Candidates: Candidates
}