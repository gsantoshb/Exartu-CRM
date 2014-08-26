Hierarchies = new Meteor.Collection("hierarchies");

Jobs = new Meteor.Collection("jobs");

Deals = new Meteor.Collection("deals");

Activities = new Meteor.Collection("activities");

Contactables = new Meteor.Collection("contactables");

Conversations = new Meteor.Collection("conversations");

Messages = new Meteor.Collection("messages");

Tasks = new Meteor.Collection("tasks");
Notes = new Meteor.Collection("notes");
ObjTypes = new Meteor.Collection("objTypes");

Relations = new Meteor.Collection("relations");

LookUps = new Meteor.Collection("lookUps");

Roles = new Meteor.Collection("roles");

ContactMethods = new Meteor.Collection("contactMethods");

Matchups = new Meteor.Collection("matchups");
Candidates = new Meteor.Collection("candidates");
JobRateTypes = new Meteor.Collection("jobRateTypes");

SystemConfigs = new Meteor.Collection("systemConfigs");

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
  Matchups: Matchups,
  Candidates: Candidates,
  SystemConfigs: SystemConfigs
}
