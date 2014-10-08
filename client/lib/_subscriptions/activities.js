Activities = new Meteor.Collection("activitiesView");
ActivityHandler = Meteor.paginatedSubscribe('activitiesView');