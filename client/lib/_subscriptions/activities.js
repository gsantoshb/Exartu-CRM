Activities = new Meteor.Collection("activitiesList");
ActivitiesHandler = Meteor.paginatedSubscribe('activitiesList');