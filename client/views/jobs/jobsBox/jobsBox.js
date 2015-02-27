/**
 * Variables
 */
var jobCollection = Jobs;
var searchQuery, options;
var entityId;
var JobHandler;
var query;
var selectedSort = new ReactiveVar();
selectedSort.set({field: 'dateCreated', value: -1});
var searchDep = new Deps.Dependency;
var selectedSortDep = new Deps.Dependency;
var sortFields = [
    {field: 'startDate', displayName: 'Start date'},
    {field: 'dateCreated', displayName: 'Date created'}];

var info = new Utils.ObjectDefinition({
    reactiveProps: {
        jobsCount: {},
        objType: {},
        objTypeDisplayName: {},
        isFiltering: {
            default: false
        }
    }
});

var listViewDefault = Session.get('jobListViewMode');
if (!listViewDefault) {
    listViewDefault = false;
}

var listViewMode = new ReactiveVar(listViewDefault);

var locationFields = ['address', 'city', 'state', 'country'];

var getLocationTagValue = function (locationField, locationFields) {
    var regex = new RegExp('(?:' + locationField + ':)((?!' + locationFields.filter(function (field) {
        return field != locationField;
    }).map(function (field) {
        return field + ':';
    }).join('|') + ').)*', 'ig');
    var match = regex.exec(query.location.value);
    var value;
    if (match)
        value = match[0].substring(locationField.length + 1).trim();

    return value;
};

var jobTypes = function () {
    return dType.ObjTypes.find({parent: Enums.objGroupType.job});
};

var searchFields = ['displayName', 'publicJobTitle'];

var setSortField = function (field) {
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

var loadqueryFromURL = function (params) {
    var objTypeQuery = {};
    var type = params.hash || params.type;
    if (type != undefined && type != 'all') {
        var re = new RegExp("^" + type + "$", "i");
        var objType = dType.ObjTypes.findOne({
            name: re
        });
        objTypeQuery.default = objType.name;
        info.objType.value = objType.name + 's';
    } else {
        objTypeQuery.default = undefined;
        info.objType.value = 'record(s)';
    }

    // Search string
    var searchStringQuery = {};
    if (params.search) {
        searchStringQuery.default = params.search;
    }

    // CreationDate
    var creationDateQuery = {};
    if (params.creationDate) {
        creationDateQuery.default = params.creationDate;
    }

    // Mine only
    var mineQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.mine) {
        mineQuery.default = !!params.mine;
    }

    // Tags
    var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }

    // Location
    var locationQuery = {};
    if (params.address) {
        locationQuery.default = ' address: ' + params.address;
    }
    if (params.city) {
        locationQuery.default = locationQuery.default || '';
        locationQuery.default += ' city: ' + params.city;
    }
    if (params.state) {
        locationQuery.default = locationQuery.default || '';
        locationQuery.default += ' state: ' + params.state;
    }
    if (params.country) {
        locationQuery.default = locationQuery.default || '';
        locationQuery.default += ' country: ' + params.country;
    }

    // Status
    var statusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.status) {
        statusQuery.default = params.status.split(',');
    }


    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.activeStatus) {
        activeStatusQuery.default = params.activeStatus.split(',');
    }
    else {
        activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    }
    ;

    return new Utils.ObjectDefinition({
        reactiveProps: {
            objType: objTypeQuery,
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            activeStatus: activeStatusQuery,
            mineOnly: mineQuery,
            tags: tagsQuery,
            location: locationQuery,
            status: statusQuery
        }
    });
}

Template.jobsBox.created = function () {
    query = query || loadqueryFromURL(Router.current().params.query);
    entityId = Session.get('entityId');
};


Template.jobList.created = function () {

    Meteor.autorun(function () {
        searchQuery = {
            $and: [] // Push each $or operator here
        };
        options = {};
        var urlQuery = new URLQuery();
        if (Session.get('entityId')) {
            searchQuery.client = Session.get('entityId');
        }
        ;


        // Type
        if (query.objType.value) {
            searchQuery.$and.push({objNameArray: query.objType.value});
            urlQuery.addParam('type', query.objType.value);
        }

        // Creation date
        if (query.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.$and.push({
                dateCreated: {
                    $gte: dateLimit.getTime() - query.selectedLimit.value
                }
            });
            urlQuery.addParam('creationDate', query.selectedLimit.value);
        }


        //Created by
        if (query.mineOnly.value) {
            searchQuery.$and.push({userId: Meteor.userId()});
            urlQuery.addParam('mine', true);
        }

        // Tags
        if (query.tags.value.length > 0) {
            searchQuery.$and.push({
                tags: {
                    $in: query.tags.value
                }
            });
            urlQuery.addParam('tags', query.tags.value);
        }

        // Location filter
        var locationOperatorMatch = false;
        if (query.location.value) {
            _.forEach(locationFields, function (locationField) {
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
            _.forEach(locationFields, function (locationField) {
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

        if (!_.isEmpty(query.activeStatus.value)) {
            searchQuery.activeStatus = {$in: query.activeStatus.value};
            urlQuery.addParam('activeStatus', query.activeStatus.value);
        }

        if (!_.isEmpty(query.status.value)) {
            searchQuery.status = {$in: query.status.value};
            urlQuery.addParam('status', query.status.value);
        }

        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        // String search
        if (query.searchString.value) {
            var stringSearches = [];
            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });
            searchQuery.$and.push({
                $or: stringSearches
            });
            urlQuery.addParam('search', query.searchString.value);
        }

        //if (SubscriptionHandlers.JobHandler && SubscriptionHandlers.JobHandler._isLoading)
            //SubscriptionHandlers.JobHandler._isLoading.value = false;
        if (searchQuery.$and.length == 0)
            delete searchQuery.$and;
        setSubscription(searchQuery, options);
        searchDep.changed();
        urlQuery.apply();

    })
};
var setSubscription = function (searchQuery, options) {

    if (SubscriptionHandlers.JobHandler) {
        SubscriptionHandlers.JobHandler.setFilter(searchQuery);
        SubscriptionHandlers.JobHandler.setOptions(options);
        JobHandler = SubscriptionHandlers.JobHandler;
    }
    else {
        SubscriptionHandlers.JobHandler =
            Meteor.paginatedSubscribe('jobs', {
                filter: searchQuery,
                options: options
            });
        JobHandler = SubscriptionHandlers.JobHandler;
    }
}

// List - Helpers
Template.jobList.helpers({
    info: function () {
        info.isFiltering.value = jobCollection.find().count() != 0;
        return info;
    },
    listViewMode: function () {
        return listViewMode.get();
    },
    jobs: function () {
        searchDep.depend();
        selectedSortDep.depend();
        return jobCollection.find(searchQuery, options);
    },
    isLoading: function () {
        return SubscriptionHandlers.JobHandler.isLoading();
    },
    jobTypes: function () {
        return dType.ObjTypes.find({parent: Enums.objGroupType.job});
    }
});

Template.jobList.rendered = function () {
    /**
     * @todo review code, this ia a small hack to make ti work.
     * This particular plugin doesn't seem to behave quite right if you initialize it more than once so we're doing it on each first click event.
     */
    $(document).on('click', 'button[data-toggle="popover"]', function (e) {
        var object = e.currentTarget;
        if ($(object).attr('data-init') == 'off') {
            $(object).popover('show');
            $(object).attr('data-init', 'on');
        }
    });
};
/**
 * Helpers
 */
// Page - Helpers
Template.jobs.helpers({
    isLoading: function () {
        return SubscriptionHandlers.JobHandler.isLoading();
    }
});

// List Header - Helpers
Template.jobListHeader.helpers({
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Search - Helpers
Template.jobListSearch.helpers({
    showAddButton: function () {
        return (entityId) ? true : false;
    },
    jobTypes: jobTypes,
    listViewMode: function () {
        return listViewMode.get();
    },
    searchString: function () {
        return query.searchString;
    }
});

// List Sort - Helpers
Template.jobListSort.helpers({
    sortFields: function () {
        return sortFields;
    },

    selectedSort: function () {
        selectedSortDep.depend();
        return selectedSort;
    },

    isFieldSelected: function (field) {
        selectedSortDep.depend();
        return selectedSort && selectedSort.field == field.field;
    },

    isAscSort: function (field) {
        selectedSortDep.depend();
        return field.value == 1;
    }
});

// List Filters - Helpers
Template.jobFilters.helpers({
    information: function () {
        var searchQuery = {};
        searchDep.depend();

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;
        if (JobHandler)
            info.jobsCount.value = JobHandler.totalCount();

        return info;
    },
    query: function () {
        return query;
    },
    jobTypes: jobTypes
});


// List Items - Helpers
Template.jobListItem.events({
    'click .show-placements': function (e) {
        alert(e);
    }
});
Template.jobListItem.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    pictureUrl: function (pictureFileId) {
        var picture = JobsFS.findOne({_id: pictureFileId});
        return picture ? picture.url('JobsFSThumbs') : undefined;
    },
    jobIcon: function () {
        return helper.getEntityIcon(this);
    },
    displayObjType: function () {
        return Utils.getJobType(this);
    },
    placements: function () {
        return Placements.find({job: this._id}, {limit: 3, transform: null});
    },
    getEmployeeDisplayName: function () {
        var employee = Contactables.findOne(this.employee);
        return employee ? employee.displayName : 'Employee information not found!';
    },
    clientName: function () {
        var client = Contactables.findOne(this.client);
        return client && client.displayName;
    },
    countPlacements: function () {
        return Placements.find({job: this._id}).count();
    },
    countRequired: function () {
        return this.numberRequired;
    },
    morePlacements: function () {
        return Placements.find({job: this._id}).count() > 3;
    }
});

// Job Information - Helpers
Template.jobInformation.helpers({
    clientName: function () {
        var client = Contactables.findOne(this.client);
        return client && client.displayName;
    },

    departmentName: function () {
        var client = Contactables.findOne(this.client);
        if (client && client.Client) return client.Client.department;
    }
});

/**
 * Events
 */
// List Search - Events
Template.jobListSearch.events = {
    'keyup #searchString': _.debounce(function (e) {
        query.searchString.value = e.target.value;
    }, 200),
    'click .addJob': function (e) {
        Session.set('addOptions', {client: entityId});
        Router.go('/jobAdd/Temporary');
        e.preventDefault();
    },
    'click #toggle-filters': function (e) {
        if ($(e.currentTarget).attr('data-view') == 'normal') {
            $('body .network-content #column-filters').addClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
            $(e.currentTarget).attr('data-view', 'wide');
        }
        else {
            $('body .network-content #column-filters').removeClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
            $(e.currentTarget).attr('data-view', 'normal');
        }
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('jobListViewMode', true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('jobListViewMode', false);
    }
};

// List Sort - Events
Template.jobListSort.events = {
    'click .sort-field': function () {
        setSortField(this);
    }
};