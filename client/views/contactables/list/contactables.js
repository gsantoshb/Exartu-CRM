/**
 * Variables
 */
var query = {};

var selected = undefined;

// Page - Variables
var searchDep = new Deps.Dependency;
var isSearching = false;

var info = new Utils.ObjectDefinition({
    reactiveProps: {
        contactablesCount: {},
        objType: {},
        isFiltering: {
            default: false
        },
        isLoading: {
            default: false
        }
    }
});

// List - Variables
var contactableTypes = function() {
    return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};
var locationFields = ['address', 'city', 'state', 'country'];
var getLocationTagValue = function(locationField, locationFields) {
    var regex = new RegExp('(?:'+ locationField + ':)((?!'+ locationFields.filter(function(field) {
        return field != locationField;
    }).map(function(field){
        return field + ':';
    }).join('|') +').)*', 'ig');
    var match = regex.exec(query.location.value);
    var value;
    if (match)
        value = match[0].substring(locationField.length + 1).trim();

    return value;
};
var clickedAllSelected = new ReactiveVar(false);
var listViewDefault=Session.get('contactableListViewMode');
if (!listViewDefault)
{
    listViewDefault=false;
}
var listViewMode = new ReactiveVar(listViewDefault);
var options = {};

// List Sort - Variables
var selectedSort =  new ReactiveVar();
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'displayName', displayName: 'Name'}
];

var listIsLoading = new ReactiveVar();

var setSortField = function(field) {
    var selected = selectedSort.get();
    if (selected && selected.field == field.field) {
        if (selected.value == 1)
            selected = undefined;
        else
            selected.value = 1;
    } else {
        selected = field;
        selected.value = -1;
    }
    selectedSort.set(selected);
};

/**
 * Controller
 */
//lookUpsHandler;
ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        if (!SubscriptionHandlers.AuxContactablesHandler){
            SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables');
        }
        return [SubscriptionHandlers.AuxContactablesHandler, LookUpsHandler];
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }


        var objTypeQuery = {};
        var type = this.params.hash || this.params.type;
        if (type != undefined && type != 'all') {
            var objType = dType.ObjTypes.findOne({
                name: type
            });
            objTypeQuery.default = objType.name;
            info.objType.value = objType.name + 's';
        } else {
            objTypeQuery.default  = undefined;
            info.objType.value = 'record(s)';
        }

        // Search string
        var searchStringQuery = {};
        if (this.params.search) {
            searchStringQuery.default = this.params.search;
        }

        // CreationDate
        var creationDateQuery = {};
        if (this.params.creationDate) {
            creationDateQuery.default = this.params.creationDate;
        }



        // Mine only
        var mineQuery = { type: Utils.ReactivePropertyTypes.boolean };
        if (this.params.mine) {
            mineQuery.default = !! this.params.mine;
        }

        // Tags
        var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
        if (this.params.tags) {
            tagsQuery.default = this.params.tags.split(',');
        }

        // Location
        var locationQuery =  {};
        if (this.params.address) {
            locationQuery.default = ' address: ' + this.params.address;
        }
        if (this.params.city) {
            locationQuery.default = locationQuery.default || '';
            locationQuery.default += ' city: ' + this.params.city;
        }
        if (this.params.state) {
            locationQuery.default = locationQuery.default || '';
            locationQuery.default += ' state: ' + this.params.state;
        }
        if (this.params.country) {
            locationQuery.default = locationQuery.default || '';
            locationQuery.default += ' country: ' + this.params.country;
        }

        var taxIdQuery={};
        if (this.params.taxId){
            taxId.default= this.params.taxId;
        }

        var employeeProcessStatusQuery = { type: Utils.ReactivePropertyTypes.array };
        if ( this.params.employeeProcessStatus) {
            employeeProcessStatusQuery.default = this.params.employeeProcessStatus.split(',');
        }
        else
        {
            employeeProcessStatusQuery.default = [];
        };
        var customerProcessStatusQuery = { type: Utils.ReactivePropertyTypes.array };
        if ( this.params.customerProcessStatus) {
            customerProcessStatusQuery.default = this.params.customerProcessStatus.split(',');
        }
        else
        {
            customerProcessStatusQuery.default=[];
        };
        var contactProcessStatusQuery = { type: Utils.ReactivePropertyTypes.array };
        if ( this.params.contactProcessStatus) {
            contactProcessStatusQuery.default = this.params.contactProcessStatus.split(',');
        }
        else
        {
            contactProcessStatusQuery.default=[];
        };

        var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
        if (this.params.activeStatus) {
            activeStatusQuery.default = this.params.activeStatus.split(',');
        }
        else
        {
            activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
        };

        query = new Utils.ObjectDefinition({
            reactiveProps: {
                objType: objTypeQuery,
                searchString: searchStringQuery,
                selectedLimit: creationDateQuery,
                mineOnly: mineQuery,
                tags: tagsQuery,
                location: locationQuery,
                employeeProcessStatus: employeeProcessStatusQuery,
                customerProcessStatus: customerProcessStatusQuery,
                contactProcessStatus: contactProcessStatusQuery,
                activeStatus:activeStatusQuery,
                taxId: taxIdQuery
            }
        });

        runESComputation();

        selected = new ReactiveVar([]);

        this.render('contactables');
    },
    onAfterAction: function() {
        var title = 'Network',
            description = 'Your contacts, employees and customers';
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

Template.contactables.isESSearch = function() {
    return !_.isEmpty(query.searchString.value);
};

/**
 * Callbacks
 */
Template.contactablesList.created = function() {
    Meteor.autorun(function(c) {
        var urlQuery = new URLQuery();
        var searchQuery = {
            $and: [] // Push each $or operator here
        };
        var clientParams = {};

        // Search string
        if (query.searchString.value) {
            urlQuery.addParam('search', query.searchString.value);
        }

        // Type
        if (query.objType.value) {
            searchQuery.objNameArray = query.objType.value;
            urlQuery.addParam('type', query.objType.value);
        }
        // Creation date
        if (query.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - query.selectedLimit.value
            };
            urlQuery.addParam('creationDate', query.selectedLimit.value);
        }

        // Created by
        if (query.mineOnly.val) {
            searchQuery.userId = Meteor.userId();
            urlQuery.addParam('mine', true);
        }

        // Location filter
        var locationOperatorMatch = false;
        if (query.location.value) {
            _.forEach(locationFields, function(locationField) {
                var value = getLocationTagValue(locationField, locationFields);

                if (value) {
                    locationOperatorMatch = true;
                    searchQuery['location.' + locationField] = {
                        $regex: value,
                        $options: 'i'
                    };
                    urlQuery.addParam(locationField, value);
                }
            });
        }

        // If not location operator match is used then search on each field
        if (query.location.value && !locationOperatorMatch) {
            var locationOR = {
                $or: []
            };
            _.forEach(locationFields, function(locationField) {
                var aux = {};
                aux['location.' + locationField] = {
                    $regex: query.location.value,
                    $options: 'i'
                };
                locationOR.$or.push(aux);
            });
            if (locationOR.$or.length > 0)
                searchQuery.$and.push(locationOR);
        }

        // Tags filter
        if (query.tags.value.length > 0) {
            searchQuery.tags = {
                $in: query.tags.value
            };
            urlQuery.addParam('tags', query.tags.value);
        }

        if (query.taxId.value){
            var taxIdOR = {
                $or: []
            };
            var aux={};
            aux['taxId']=query.taxId.value;
            taxIdOR.$or.push(aux );
            aux['taxId']={$regex: '([0-9]{5})([' + query.taxId.value + ']{4})' , $options: 'i'};
            taxIdOR.$or.push(aux );
            var aux={};
            aux['contactMethods']={$elemMatch: {value: {$regex:query.taxId.value,$options:'i'}}}
            taxIdOR.$or.push(aux );
            searchQuery.$and.push(taxIdOR);

        }

        if (searchQuery.$and.length == 0)
            delete searchQuery.$and;
        if (!_.isEmpty(query.employeeProcessStatus.value)){
            searchQuery[query.objType.value+'.status']={$in: query.employeeProcessStatus.value};

            urlQuery.addParam('employeeProcessStatus', query.employeeProcessStatus.value);
        }
        if (!_.isEmpty(query.customerProcessStatus.value)){
            searchQuery[query.objType.value+'.status']={$in: query.customerProcessStatus.value};

            urlQuery.addParam('customerProcessStatus', query.customerProcessStatus.value);
        }
        if (!_.isEmpty(query.contactProcessStatus.value)){
            searchQuery[query.objType.value+'.status']={$in: query.contactProcessStatus.value};

            urlQuery.addParam('contactProcessStatus', query.contactProcessStatus.value);
        }
        if (!_.isEmpty(query.activeStatus.value)){
            searchQuery.activeStatus={$in: query.activeStatus.value};

            urlQuery.addParam('activeStatus', query.activeStatus.value);
        }
        // Set url query
        urlQuery.apply();

        // Avoid update handler's filter when an Elasticsearch query will be performed
        if (query.searchString.value) return;
        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        console.log('sq',searchQuery); // keep this console log here until the multiple search call is fixed
        if (SubscriptionHandlers.AuxContactablesHandler) {
            SubscriptionHandlers.AuxContactablesHandler.setFilter(searchQuery, clientParams);
            SubscriptionHandlers.AuxContactablesHandler.setOptions(options);
        }
        else
            SubscriptionHandlers.AuxContactablesHandler =
                Meteor.paginatedSubscribe('auxContactables', {filter: searchQuery, params: clientParams,options:options});
    });

    Meteor.autorun(function () {
        if (!SubscriptionHandlers.AuxContactablesHandler){
            SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables');
        }
        if (query.searchString.value)
            Session.set('contactableCount', esResult.length);
        else {
            if (SubscriptionHandlers && SubscriptionHandlers.AuxContactablesHandler)
                Session.set('contactableCount', SubscriptionHandlers.AuxContactablesHandler.totalCount());
        }
    });
};

Template.contactablesList.rendered = function() {
    /**
     * @todo review code, this ia a small hack to make ti work.
     * This particular plugin doesn't seem to behave quite right if you initialize it more than once so we're doing it on each first click event.
     */
    $(document).on('click', 'button[data-toggle="popover"]', function(e) {
        var object = e.currentTarget;
        if( $(object).attr('data-init') == 'off' ){
            $(object).popover('show');
            $(object).attr('data-init', 'on');
        }
    });
};

// hack: because the handler is created on the created hook, the SubscriptionHandlers 'cleaner' can't find it
Template.contactablesList.destroyed = function() {
    if (SubscriptionHandlers.AuxContactablesHandler) {
        SubscriptionHandlers.AuxContactablesHandler.stop();
        delete SubscriptionHandlers.AuxContactablesHandler;
    }

    $('.popover').popover('destroy');
};



/**
 * Helpers
 */
// Page - Helpers
Template.contactables.helpers({
    information: function() {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        var contactableCount = Session.get('contactableCount');
        if (contactableCount)
            info.contactablesCount.value = contactableCount;

        return info;
    },
    isSearching: function() {
        searchDep.depend();
        return isSearching;
    }
});

// List Header - Helpers
Template.contactablesListHeader.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    //selection
    selectedCount: function () {
        return selected.get().length;
    },
    areAllChecked: function () {
        // true if the count of all contactables (in the local collection) that are selected is equal to the count of all contactables (in the local collection)
        return AuxContactables.find({_id: { $in : _.pluck(selected.get(),'id') } }).count() == AuxContactables.find().count();
    },
    areAllSelectedTheSameType: function () {
        if (_.isEmpty(selected.get())) return true;
        //check if there is a common type along all items selected ignoring contactable, person and organization
        return !_.isEmpty(_.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization'));
    },
    showSelectAll: function () {
        return clickedAllSelected.get() && SubscriptionHandlers.AuxContactablesHandler.pageCount() > 1;
    },
    withoutEmail: function () {
        return _.filter(selected.get(), function (item) {
            return ! item.email
        }).length;
    },
    differentTypesSelected: function () {
        var result = {};
        // create a hash that contains for each type the count of elements of this type, ignoring contactable, person, organization
        _.each(selected.get(), function (item) {
            _.each(_.without(item.type,'contactable', 'person', 'organization'), function (type) {
                result[type] = result[type] || 0;
                ++result[type];
            })
        });

        // map the hash to an array of name and count objects
        return _.map(result, function (value, key){
            return {
                name: key,
                count: value
            }
        });
    },
    totalCount: function () {
        return SubscriptionHandlers.AuxContactablesHandler.totalCount();
    }
});

// List Search - Helpers
Template.contactablesListSearch.helpers({
    listIsLoading: function () {
        return SubscriptionHandlers.AuxContactablesHandler? SubscriptionHandlers.AuxContactablesHandler.isLoading() : false;
    },
    contactableTypes: contactableTypes,
    info: function() {
        info.isFiltering.value = AuxContactables.find().count() != 0;
        return info;
    },
    contactables: function() {
        // Dependencies

        // ElasticSearch
        if (!_.isEmpty(query.searchString.value)) {
            //urlQuery.push('type=' + query.objType.value);
            return esResult;
        }
        return AuxContactables.find();
    },
    contactableTypes: function() {
        return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
    },
    searchString: function () {
        return query.searchString;
    },
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Sort - Helpers
Template.contactableListSort.helpers({
    sortFields: function() {
        return sortFields;
    },
    selectedSort: function() {
        return selectedSort.get();
    },
    isFieldSelected: function(field) {
        return selectedSort.get() && selectedSort.get().field == field.field;
    },
    isAscSort: function() {
        return selectedSort.get() ? selectedSort.get().value == 1: false;
    }
});

// List Filters - Helpers
Template.contactablesFilters.helpers({
    information: function() {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        var contactableCount = Session.get('contactableCount');
        if (contactableCount)
            info.contactablesCount.value = contactableCount;

        return info;
    },
    query: function () {
        return query;
    },
    isSelectedType: function(typeName){
        return query.objType.value == typeName;
    },
    selectedType: function(typeName){
        if (query.objType.value =='Employee') return Enums.lookUpTypes.employee.status.lookUpCode;
        if (query.objType.value =='Contact') return Enums.lookUpTypes.contact.status.lookUpCode;
        if (query.objType.value =='Customer') return Enums.lookUpTypes.customer.status.lookUpCode;
        return null;
    },
    contactableTypes: contactableTypes
});

// List - Helpers
Template.contactablesList.helpers({
    isLoading: function () {
        return SubscriptionHandlers.AuxContactablesHandler? SubscriptionHandlers.AuxContactablesHandler.isLoading() : false;
    },
    info: function() {
        info.isFiltering.value = AuxContactables.find().count() != 0;
        return info;
    },
    contactables: function() {
        // Dependencies

        // ElasticSearch
        if (!_.isEmpty(query.searchString.value)) {
            //urlQuery.push('type=' + query.objType.value);
            return esResult;
        }
        return AuxContactables.find();
    },
    contactableTypes: function() {
        return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
    },
    listViewMode: function () {
        return listViewMode.get();
    },
});

// List Item - Helpers
Template.contactablesListItem.helpers({
    pictureUrl: function(pictureFileId) {
        var picture = ContactablesFS.findOne({_id: pictureFileId});
        return picture ? picture.url('ContactablesFSThumbs') : undefined;
    },
    contactableIcon: function () {
        return helper.getEntityIcon(this);
    },
    displayObjType: function () {
        return Utils.getContactableType(this);
    },
    isESSearch: function () {
        return !_.isEmpty(query.searchString.value);
    },
    getLastNote: function () {
        var note = Notes.findOne({'links.id': this._id}, {sort: {dateCreated: -1}});
        if (note && note.msg.length > 50) {
            note.msg = note.msg.slice(0, 50) + '..';
        }
        return note;
    },
    isSelected: function () {
        return !! _.findWhere(selected.get(), { id: this._id });
    },
    listViewMode: function () {
        return listViewMode.get();
    },
    getStatus: function () {
        return this.activeStatus;
    },
    getProcessStatus: function () {
        if (this.Customer) return this.Customer.status;
        if (this.Employee) return this.Employee.status;
        if (this.Contact) return this.Contact.status;
        return null;
    },
    getDepartment: function (){
        if (this.Customer && this.Customer.department)
        {
            var dept=this.Customer.department;
            if (dept=='Primary') return null;
            //dept=" - " + dept
        }
        return dept;
    }
});

// Employee Information - Helpers
Template.employeeInformation.helpers({
    placementInfo: function () {
        if (!this.placement)
            return undefined;

        var placementInfo = {};
        var placement = Placements.findOne({_id: this.placement});
        if (!placement) return;
        var job = Jobs.findOne({
            _id: placement.job
        }, {
            transform: null
        });
        if (!job) return placementInfo; // should only happen on hierarchy problem
        var customer = Contactables.findOne({_id: job.customer}, {transform: null});

        placementInfo.job = job._id;
        placementInfo.jobTitle = job.publicJobTitle;
        if (customer) {
            placementInfo.customerName = customer.organization.organizationName;
            placementInfo.customer = customer._id;
        }

        return placementInfo;
    }
});

// Filters - Helpers
Template.contactablesFilters.helpers({
    information: function() {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        var contactableCount = Session.get('contactableCount');
        if (contactableCount)
            info.contactablesCount.value = contactableCount;

        return info;
    },
    query: function () {
        return query;
    },
    isSelectedType: function(typeName){
        return query.objType.value == typeName;
    },
    selectedType: function(typeName){
        //query.processStatus.value=[];
        if (query.objType.value =='Employee') return Enums.lookUpTypes.employee.status.lookUpCode;
        if (query.objType.value =='Contact') return Enums.lookUpTypes.contact.status.lookUpCode;
        if (query.objType.value =='Customer') return Enums.lookUpTypes.customer.status.lookUpCode;
        return null;
    },
    contactableTypes: contactableTypes
});

// Employee Item - Helpers

// register list view mode helper
Template.registerHelper('listViewMode', function () {
    return listViewMode.get();
});

/**
 * Events
 */
// Page - Events
Template.contactables.events({
    'click .parseText': function () {
        Utils.showModal('textParser');
    }
});

// List Header - Events
Template.contactablesListHeader.events({
    'change #selectAll': function (e) {
        if (e.target.checked){
            //add all local items (not already selected) to the selection
            clickedAllSelected.set(true);
            AuxContactables.find().forEach(function (contactable) {
                if (!_.findWhere(selected.curValue, {id: contactable._id})){
                    selected.curValue.push({id: contactable._id, type: contactable.objNameArray, email: Utils.getContactableEmail(contactable) });
                }
            });
            selected.dep.changed();
        }else{
            //clear selection
            selected.set([]);
        }
    },
    'click #sendTemplate': function () {
        // get the common type that all selected entities have, ignoring contactable, person and organization
        var commonType = _.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization');

        if (! commonType || ! commonType.length) return;
        commonType = commonType[0];

        //filter from the selection the ones that don't have email
        var filtered = _.filter(selected.get(), function (item) {
            return item.email;
        });

        var context = {
            category: [Enums.emailTemplatesCategories[commonType.toLowerCase()]],
            recipient: _.map(filtered, function (item) {
                return {
                    id: item.id,
                    email: item.email
                };
            })
        };
        context[commonType] = _.pluck(filtered, 'id');

        Utils.showModal('sendTemplateModal', context);
    },

    'click #selectAllRemotes': function () {
        Meteor.call('getAllContactablesForSelection', SubscriptionHandlers.AuxContactablesHandler.getFilter(), function(err, result){
            if (err){
                console.log('get all contactables error',err);
            }else{
                selected.set(_.map(result, function (contactable) {
                    return {id: contactable._id, type: contactable.objNameArray, email: Utils.getContactableEmail(contactable) };
                }));
            }
        })
    },
    'click .selectOneType': function () {
        //remove all items that are not of this type
        var self = this;
        selected.set(_.filter(selected.get(), function (item) {
            return _.contains(item.type, self.name);
        }));
    }
});

// List Search - Events
Template.contactablesListSearch.events({
    'click #toggle-filters': function(e){
        if( $(e.currentTarget).attr('data-view') == 'normal' ){
            $('body .network-content #column-filters').addClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
            $(e.currentTarget).attr('data-view', 'wide');
        }
        else{
            $('body .network-content #column-filters').removeClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
            $(e.currentTarget).attr('data-view', 'normal');
        }
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('contactableListViewMode',true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('contactableListViewMode',false);
    }
});

// List Sort - Events
Template.contactableListSort.events({
    'click .sort-field': function() {
        setSortField(this);
    }
});

// List - Events
Template.contactablesList.events({
});

// List Item - Events
Template.contactablesListItem.events({
    'click .select': function (e) {
        if (e.target.checked){
            selected.curValue.push({
                id: this._id,
                type: this.objNameArray,
                email: Utils.getContactableEmail(this)
            })
        }else{
            var item = _.findWhere(selected.curValue, {id: this._id});
            selected.curValue.splice(selected.curValue.indexOf(item), 1 );
        }
        selected.dep.changed();
        clickedAllSelected.set(false);
    }
});

/**
 * Elastic Search integration
 * @type {Tracker.Dependency}
 */
// Elasticsearch
var esDep = new Deps.Dependency;
var esResult = [];

var runESComputation = function () {
    Meteor.autorun(function() {
        if (_.isEmpty(query.searchString.value))
            return;

        query.searchString.dep.depend();

        // Process filters
        var filters = {
            bool: {
                must: [],
                should: []
            }
        };

        // Contactable type
        if (query.objType.value)
            filters.bool.must.push({term: {objNameArray: [query.objType.value.toLowerCase()]}});

        // Tags
        if (query.tags.value.length > 0) {
            var tags = {or: []};
            _.forEach(query.tags.value, function(tag) {
                tags.or.push({term: {tags: tag}});
            });
            filters.bool.must.push(tags);
        }

        // Only recent filters
        if (query.selectedLimit.value) {
            var now = new Date();
            filters.bool.must.push({range: {dateCreated: {gte: moment(new Date(now.getTime() - query.selectedLimit.value)).format("YYYY-MM-DDThh:mm:ss")}}});
        }

        // Created by
        if (query.mineOnly.value) {
            filters.bool.must.push({term: {userId: Meteor.userId()}});
        }

        // Location filter
        var locationOperatorMatch = false;
        if (query.location.value) {
            _.forEach(locationFields, function(locationField) {
                var value = getLocationTagValue(locationField, locationFields);

                if (value) {
                    locationOperatorMatch = true;
                    var aux = { regexp: {}};
                    aux.regexp['location.' + locationField] = '.*' + value + '.*';
                    filters.bool.must.push(aux);
                }
            });
        }

        // If not location operator match is used then search on each field
        if (query.location.value && !locationOperatorMatch) {
            _.forEach(locationFields, function(locationField) {
                var aux = { regexp: {}};
                aux.regexp['location.' + locationField] = '.*' + query.location.value + '.*';
                filters.bool.should.push(aux);
            });
        }

        isSearching = true;
        searchDep.changed();
        Contactables.esSearch('.*' + query.searchString.value + '.*', filters,function(err, result) {
            if (!err) {
                esResult = _.map(result.hits, function(hit) {
                    var contactable = Contactables._transform(hit._source);
                    contactable._match = {
                        score: (hit._score / result.max_score) * 100,
                        properties: _.map(hit.highlight, function(matchedProperty, propertyName) {
                            return propertyName;
                        }),
                        contexts: _.flatten(_.map(hit.highlight, function(matchedProperty, propertyName) {
                            return matchedProperty;
                        }))
                    };
                    return contactable;
                });
                esDep.changed();
                isSearching = false;
                searchDep.changed();
            } else
                console.log(err)
        });
    });
};

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
    var text = this.$('.contextText');
    text[0].innerHTML = this.data;
};