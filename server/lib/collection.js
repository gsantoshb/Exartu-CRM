Hierarchies = new Mongo.Collection("hierarchies");

Jobs = new Mongo.Collection("jobs");

Deals = new Mongo.Collection("deals");

Activities = new Mongo.Collection("activities");

Contactables = new Mongo.Collection("contactables");

ContactablesFiles = new Mongo.Collection('contactablesFiles');

Conversations = new Mongo.Collection("conversations");

Messages = new Mongo.Collection("messages");

Tasks = new Mongo.Collection("tasks");

Notes = new Mongo.Collection("notes");

ObjTypes = new Mongo.Collection("objTypes");

Relations = new Mongo.Collection("relations");

LookUps = new Mongo.Collection("lookUps");

ContactMethods = new Mongo.Collection("contactMethods");

Placements = new Mongo.Collection("placements");

Candidates = new Mongo.Collection("candidates");

SystemConfigs = new Mongo.Collection("systemConfigs");

UserInvitations = new Mongo.Collection("userInvitations");

EmailTemplates = new Mongo.Collection("emailTemplates");

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
  Placements: Placements,
  Candidates: Candidates,
  SystemConfigs: SystemConfigs
}
