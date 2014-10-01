DealController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [DealHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('deal')
    },
    onAfterAction: function() {
        var title = 'Deals / ' + Session.get('dealDisplayName'),
            description = 'Deal information';
        SEO.set({
            title: title,
            meta: {
                'description': description
            },
            og: {
                'title': title,
                'description': description
            }
        });
    }
});

var generateReactiveObject = function(deal) {
    return new dType.objInstance(deal, Deals);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;

Template.deal.created=function(){
    self.editMode=false;
    var originalDeal=Deals.findOne({ _id: Session.get('entityId') });


    var definition={
        reactiveProps:{
            tags:{
                default: originalDeal.tags,
                update: 'tags',
                type: Utils.ReactivePropertyTypes.array
            }
        }
    };
    services= Utils.ObjectDefinition(definition);
}

Template.deal.helpers({
    deal: function(){
        var originalDeal=Deals.findOne({ _id: Session.get('entityId') });
        Session.set('dealDisplayName', originalDeal.displayName);
        deal = generateReactiveObject(originalDeal);
        return deal;
    },
    originalDeal:function(){
        return Deals.findOne({ _id: Session.get('entityId') });
    },
    editMode:function(){
        return self.editMode;
    },
    colorEdit:function(){
        return self.editMode ? '#008DFC' : '#ddd'
    },
    isType:function(typeName){
        return !! Deals.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
    },
    dealCollection: function(){
        return Deals;
    },
    getCustomer:function(){
        var j=Deals.findOne({ _id: Session.get('entityId')});
        return j && j.customer;
    },
    noteCount: function() {
        return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
    },
    isSelected:function(optionValue, currentValue){
        return optionValue == currentValue;
    },
    location: function(){
        var originalDeal=Deals.findOne({ _id: Session.get('entityId') });

        location.value= originalDeal && originalDeal.location;
        return location;
    },
    tags: function(){
        return services.tags;
    }
});

Template.deal.events({
    'click .editDeal':function(){
        self.editMode= ! self.editMode;
    },
    'click .saveButton':function(){
        if (!deal.validate()) {
            deal.showErrors();
            return;
        }
        var update=deal.getUpdate();
        var originalDeal=Deals.findOne({ _id: Session.get('entityId') });
        var oldLocation= originalDeal.location;
        var newLocation= location.value;

        if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
            update.$set= update.$set || {};
            update.$set.location= newLocation;
        }

        if (services.tags.value.length > 0)
            update.$set.tags = services.tags.value;

        Deals.update({_id: deal._id}, update, function(err, result) {
            if (!err) {
                self.editMode=false;
                deal.reset();
            }
        });
    },
    'click .cancelButton':function(){
        self.editMode=false;
    },
    'click .add-tag': function() {
        addTag();
    },
    'keypress #new-tag': function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            addTag();
        }
    },
    'click .remove-tag': function() {
        services.tags.remove(this.value);
    }
});

var addTag = function() {
    var inputTag = $('#new-tag')[0];

    if (!inputTag.value)
        return;

    if (_.indexOf(services.tags.value, inputTag.value) != -1)
        return;
    services.tags.insert(inputTag.value);
    inputTag.value = '';
    inputTag.focus();
};

Template.deal_tabs.helpers({
    getType: function(){
        return Enums.linkTypes.deal;
    }
})

// Deal description
var dealDescriptionEditMode = false;
var dealDescriptionEditModeDep = new Deps.Dependency;
var descriptionSelf={}
Utils.reactiveProp(descriptionSelf, 'previewMode', false);

Template.dealDescription.colorPreviewMode= function(){
    return descriptionSelf.previewMode ? '#008DFC' : '#ddd'
}

Template.dealDescription.previewMode= function(){
    return descriptionSelf.previewMode;
}

Template.dealDescription.editMode = function() {
    dealDescriptionEditModeDep.depend();
    return dealDescriptionEditMode;
};

Template.dealDescription.colorDescriptionEdit = function() {
    dealDescriptionEditModeDep.depend();
    return dealDescriptionEditMode ? '#008DFC' : '#ddd';
};

Template.dealDescription.events = {
    'click .editDealDescription': function(){
        dealDescriptionEditMode = !dealDescriptionEditMode;
        dealDescriptionEditModeDep.changed();
    },
    'click #cancelDealDescriptionEdit':function(){
        dealDescriptionEditMode = false;
        dealDescriptionEditModeDep.changed();
    },
    'click #saveDealDescriptionEdit':function() {
        var update = deal.getUpdate();
        if (!update.$set || !update.$set.dealDescription) {
            dealDescriptionEditMode = false;
            dealDescriptionEditModeDep.changed();
            return; // Nothing to update
        }

        Deals.update({_id: deal._id}, {$set: { dealDescription: update.$set.dealDescription }}, function(err, result) {
            if (!err) {
                dealDescriptionEditMode = false;
                dealDescriptionEditModeDep.changed();
                deal.dealDescription.defaultValue = deal.dealDescription.value; // Reset dealDescription initial value
            }
        });
    },
    'click .previewMode': function(){
        descriptionSelf.previewMode= ! descriptionSelf.previewMode;
    }
};