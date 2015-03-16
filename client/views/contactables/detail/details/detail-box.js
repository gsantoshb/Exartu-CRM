EditMode = {
    val: false,
    dep: new Deps.Dependency,
    show: function () {
        this.val = true;
        this.dep.changed();
    },
    hide: function () {
        this.val = false;
        this.dep.changed();
    }
};

Object.defineProperty(EditMode, "value", {
    get: function () {
        this.dep.depend();
        return this.val;
    },
    set: function (newValue) {
        this.val = newValue;
        this.dep.changed();
    }
});

var contactable = {};
var hideTaxID = new ReactiveVar(true);
var statusDep=new Deps.Dependency;

Template.contactableDetailBox.helpers({
    created: function () {
        EditMode.hide();
    },
    rendered: function () {
        // Set up masks
        //this.$('#taxid-text').mask('000-00-0000');
    },
    isSelected: function (value1, value2) {
        return value1 == value2
    },
    contactable: function () {
        contactable = new dType.objInstance(this, Contactables);
        return contactable;
    },
    originalContactable: function () {
        return this;
    },
    editMode: function () {
        return EditMode.value;
    },
    editModeColor: function () {
        return EditMode.value ? '#008DFC' : '';
    },
    fetchOptions: function () {
        return Utils.sortFetchOptions(this.options);
    },
    lostClient: function () {
        statusDep.depend();
        if (contactable.status.value) {
            var lkp = LookUps.findOne({_id: contactable.status.value});
            if (lkp) return (_.contains(lkp.lookUpActions, Enums.lookUpAction.Client_Lost));
        }
        return false;
    },
    onSelectedStatus: function () {
        return function (newStatus) {
            var ctx = Template.parentData(2);
            ctx.property._value = newStatus;
            statusDep.changed();
        }
    },
    hideTaxID: function () {
        return hideTaxID.get();
    },
    datePickerOptions: function () {
        return {
            format: "MM dd, yyyy",
            minViewMode: "days",
            startView: "months"
        }
    }
});

Template.contactableDetailBox.events = {
    'click #edit-mode': function () {
        if (EditMode.value) {
            EditMode.hide();
            contactable.reset();
        }
        else
            EditMode.show();
    },
    'click #save-details': function () {
        if (!contactable.validate()) {
            contactable.showErrors();
            return;
        }

        contactable.save(function (err) {
                if (!err) {
                    EditMode.hide();
                }
                else {
                    alert('contactable save error' + err);
                    console.log('contactable', contactable);
                }
        });
    },
    'click #cancel-details': function () {
        EditMode.hide();
        contactable.reset();
    },
    'click .showHideTaxId': function () {
        hideTaxID.set(!hideTaxID.get());
    }
};

Template.showTaxIdText.helpers({
    rendered: function () {
        //this.$('#taxid-text').mask('000-000-000');
    }
});

Template.showTaxIdInput.helpers({
    rendered: function () {
        //this.$('#taxid-input').mask('000-000-000', {
        //  onKeyPress: function (val, e, dom) {
        //    dom.trigger('change');
        //  }
        //});
    }
});