/**
 * Created by ramiro on 09/06/15.
 */
Meteor.methods({
  addLastEntry: function(entry){
    lastEntriesManager.addEntry(entry);
  },
  removeEntry: function(id){
    lastEntriesManager.removeEntry(id);
  },
  changePing: function(id){
    lastEntriesManager.changePing(id);
  }
})