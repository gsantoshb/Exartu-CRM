Template.lookupFilterTemplate.helpers({
  templateName: function () {
    return this.template || 'buttonGroup';
  },

  templateContext: function () {
    return {
      options: _.map(LookUps.find({lookUpCode: this.lookUpCode}).fetch(), function (lookup) {
        return {
          id: lookup._id,
          text: lookup.displayName
        }
      }),
      onSelected: this.callback,
      multi: this.multi,
      title: this.title,
      value: this.value.val // Use val instead of value to avoid reactivity
    };
  }
});


///////////////  select2 //////////////////////////////

Template.select2.rendered = function(){
  if (this.data && _.isArray(this.data.options)){
    var options = this.data.options;
    this.$('#input').select2({
      data: options,
      multiple: this.data.multi,
      allowClear: true,
      placeholder: this.data.title,
      initSelection: this.data.initSelection
    });
  }
  if (this.data && _.isFunction(this.data.options)){
    Meteor.autorun(_.bind(function(){
      var options = this.data.options();
      if (_.isArray(options)){
        this.$('#input').select2({
          data: options,
          allowClear: true
        });
      }
    }, this));
  }
};

Template.select2.created=function(){
  this.data.selected = this.data.multi ? [] : null;
};

Template.select2.events({
  'change #input': function(e, ctx){
    ctx.data.selected = e.val;
    ctx.data && ctx.data.onSelected && ctx.data.onSelected(ctx.data.selected);
  }
});


///////////// button group //////////////////////////

Template.buttonGroup.created = function() {
  this.data.selected = this.data.multi ? (this.data.value? this.data.value : [] ): this.data.value || null;
  this.data.selectedDep = new Deps.Dependency;
};

Template.buttonGroup.helpers({
  isSelectedClass: function(){
    var templateCtx = UI._parentData(1);
      console.log('tctx',templateCtx);
    if (! templateCtx.selectedDep)
    {
        templateCtx.selected=[];
        templateCtx.selectedDep=new Deps.Dependency;
    } // Avoid error when a reactive call override properties defined on created

    templateCtx.selectedDep.depend();

    if (templateCtx.multi){
      return _.contains(templateCtx.selected, this.id) ? 'btn-primary' : 'btn-default';
    }else{
      return (templateCtx.selected == this.id) ? 'btn-primary' : 'btn-default';
    }
  }
});

Template.buttonGroup.events({
  'click button': function(e, ctx){
    var thisId = this.id;
    if (ctx.data.multi){
      var index = ctx.data.selected.indexOf(thisId);
      if (index < 0){
        ctx.data.selected.push(thisId);
      }else{
        ctx.data.selected.splice(index, 1);
      }
    }else{
      if (ctx.data.selected == thisId){
        ctx.data.selected = null
      }else {
        ctx.data.selected = thisId;
      }
    }
    ctx.data.selectedDep.changed();
    ctx.data && ctx.data.onSelected && ctx.data.onSelected(ctx.data.selected);
  }
});
