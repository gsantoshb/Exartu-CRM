Template.addQuote.viewModel = function (id, addcallname) {
    var self = this;

    self.newQuote = ko.observable("");

    self.adding = ko.observable(false);
    self.addQuote = function () {
        self.adding(true);
        Meteor.call(addcallname, id, {
            content: self.newQuote()
        }, function (err, result) {
            if (!err) {
                self.adding(false);
                self.newQuote("");
                $('#addQuoteModal').modal('hide');
            }
        });
    }

    return self;
}