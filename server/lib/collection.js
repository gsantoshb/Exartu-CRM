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

NotesView = new Mongo.Collection("notesView");

ObjTypes = new Mongo.Collection("objTypes");

Relations = new Mongo.Collection("relations");

LookUps = new Mongo.Collection("lookUps");

Placements = new Mongo.Collection("placements");

Candidates = new Mongo.Collection("candidates");

SystemConfigs = new Mongo.Collection("systemConfigs");

UserInvitations = new Mongo.Collection("userInvitations");

EmailTemplates = new Mongo.Collection("emailTemplates");

Roles = new Mongo.Collection("roles");

SystemAdmins = new Mongo.Collection("systemAdmins");

Tenants = Hierarchies;

HotLists = new Mongo.Collection("hotLists");

Addresses = new Mongo.Collection("addresses");

ApplicantCenterInvitations = new Mongo.Collection('applicantCenterInvitations');

Tags = new Mongo.Collection("tags");

PastJobLeads = new Mongo.Collection("pastJobLeads");

Timecards = new Mongo.Collection('timecards');

//CardReaderTasks = new Mongo.Collection('cardReaderTasks');

HelpVideos = new Mongo.Collection('helpVideos');

LastEntries = new Mongo.Collection('lastEntries');

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
    SystemConfigs: SystemConfigs,
    Roles: Roles,
    SystemAdmins: SystemAdmins,
    Tenants: Hierarchies,
    HotLists: HotLists,
    UserInvitations: UserInvitations,
    Addresses: Addresses,
    EmailTemplates: EmailTemplates,
    PastJobLeads: PastJobLeads,
    LastEntries: LastEntries
};

