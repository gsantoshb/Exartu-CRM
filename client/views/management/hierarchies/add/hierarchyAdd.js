var parentHierId;

Template.hierarchyAdd.created = function(){
  if (!(_.isArray(this.data) && this.data[0])){
    console.warn('Template hierarchyAdd: missing argument parentHierId');
  }else{
    //save the parameter for easy access
    parentHierId = this.data[0];
  }
};

Template.hierarchyAdd.helpers({
  hierarchySchema: function () {
    return hierarchySchema;
  }
});

Template.hierarchyAdd.events({

});


// A simple schema for adding the hierarchy
var hierarchySchema = new SimpleSchema({
  name: {
    type: String,
    regEx: /.+/
  }
});
AutoForm.hooks({
  hierarchyAdd : {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      //add the parent received as a parameter of the template
      insertDoc.parent = parentHierId;
      if (!insertDoc.parent ) return false;

      Meteor.call('createHier', insertDoc , function(err, result){
        if (err)
          console.error(err);
        else{
          console.log(result);
          $('.modal-host').children().modal('toggle');
        }
      });

      return false;
    }
  }
});