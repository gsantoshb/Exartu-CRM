/*** wraper for ko.applyBindings
*    vm -> viewModel(obj) to bind
*    viewName -> string that identifies the DOM that holds view (must exist an element with name="viewName")
*    collectionHandler(optional) -> Meteor collection handler extended with our wait function. The binding will apply when the collection is ready
        todo: support multiple collections
***/
var errorElement = function (oldElement, msg) {
    return '<div style="border: solid 1px red;color: red; width:' + $(oldElement).width() + 'px;height:' + $(oldElement).height() + 'px;"> ' + msg + ' </div';
}
helper = {};
_.extend(helper, {
    applyBindings: function (vm, viewName, collectionHandler) {
        var vm = typeof (vm) == "function" ? new vm() : vm;

        if (!collectionHandler || !collectionHandler.wait) {
            try {
                ko.applyBindings(vm, document.getElementsByName(viewName)[0]);
            } catch (err) {
                var element = document.getElementsByName(viewName)[0];
                if (!element) {
                    console.log(viewName + ' does not exist');
                    return;
                }
                element.innerHTML = errorElement(element, err.message);
                console.log('binding error');
                console.dir(err)
            }
        } else {
            collectionHandler.wait(function () {
                try {
                    ko.applyBindings(vm, document.getElementsByName(viewName)[0]);
                } catch (err) {
                    var element = document.getElementsByName(viewName)[0];
                    if (!element) {
                        console.log(viewName + ' does not exist');
                        return;
                    }
                    element.innerHTML = errorElement(element, err.message);
                    console.log('binding error');
                    console.dir(err)
                }
            });
        }
    },
    fieldVM: function (field) {
        switch (field.fieldType) {
        case 0:
            return 'inStringField';
        case 2:
            return 'inDateField';
        }
    },
    relationVM: function (rel) {
        if (rel.cardinality.max == 1)
            return 'inSingle';

        if (rel.cardinality.max == Infinity)
            return 'inMultiple'
    },
    /*
     * Generate the functions and elements necessary for perform full text search and filter
     * over a list with entities which have dynamic obj types.
     * Params:
     *  - fieldsToSearch: names of the entity fields where the search will be performed.
     *  - objTypes: list of types that are used by entities in collection.
     *  - callback: function called after each search
     * Return:
     *  - searchString: observable item used to search
     *  - filter: ..
     */
    createObjTypefilter: function (fieldsToSearch, objTypes, callback) {
        var self = {};

        var search = function () {
            var q = {};
            var search;
            var filter;
            if (self.searchString()) {
                q.$and = [];
                q.$and.push({
                    $or: []
                });
                search = q.$and[0].$or;

                q.$and.push({
                    $or: []
                });
                filter = q.$and[1].$or;

                _.each(fieldsToSearch, function (prop) {
                    var aux = {};
                    aux[prop + ''] = {
                        $regex: self.searchString()
                    };
                    search.push(aux);
                });
            } else {
                q = {
                    $or: []
                };
                filter = q.$or;
            }

            _.each(self.filter(), function (elem) {
                if (elem.check()) {
                    var aux = {}
                    aux[elem.label] = {
                        $exists: true
                    };
                    filter.push(aux);
                }
            })

            if (filter.length == 0) {
                if (search)
                    q = {
                        $or: search
                    };
                else
                    q = {};
            }

            callback.call({
                query: q
            });
        };

        self.filter = ko.observableArray(
            _.map(objTypes, function (type) {
                var filter = {
                    check: ko.observable(true),
                    label: type.objName,
                    typeId: type._id
                };
                filter.check.subscribe(search);
                return filter;
            })
        );
        console.log('selffilter',self.filter());

        self.searchString = ko.observable('');
        self.searchString.subscribe(search);

        return self;
    },
    getObjType: function (id) {
        return ObjTypes.findOne({
            _id: id
        });
    },
    getContactableTypes: function () {
        console.log('objt',ObjTypes,Enums.objGroupType.contactable)
        return ObjTypes.find({
            objGroupType: Enums.objGroupType.contactable
        }).fetch();
    },
    getPersonTypes: function () {
        var persontypes=[];
        _.each(Enums.personType,function(err,v)
            {
                persontypes.push(v);
            }
        );
        return persontypes;
    },
    getJobTypes: function () {
        return ObjTypes.find({
            objGroupType: Enums.objGroupType.job
        }).fetch();
    },
    getIconForObjName : function (objname) {
        var objtype=ObjTypes.findOne({objName: objname});
        if (objtype || objtype.glyphicon !='') return objtype.glyphicon;
        return 'glyphicon-question-sign';
    },
        getIconForObjType : function (objtype) {
            if (objtype.glyphicon=='') return 'glyphicon-question-sign';
            return objtype.glyphicon;
    }
});

_.extend(helper, {
    showModal: function (templateName, view, parameter) {
        var modal = $('#' + view),
            originalHTML = modal[0].innerHTML;

        modal.modal('show');
        helper.applyBindings(new Template[templateName].viewmodel(parameter), view);

        modal.on('hidden.bs.modal', function (e) {
            ko.cleanNode(this);
            $(this)[0].innerHTML = originalHTML;
        });
    }
})