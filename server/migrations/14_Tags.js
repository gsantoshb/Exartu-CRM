//Search for all tags and add them to the collection tags
Migrations.add({
    version: 14,
    up: function() {
        Contactables.find({}).forEach(
            //search tags in contables
            function(contact) {
                if (!contact.tags) return;
                _.forEach(contact.tags,
                    function(t){
                       if(!Tags.findOne({tags:t}))
                          Tags.insert({tags:t});

                    }
                )

            }

        )
        Jobs.find({}).forEach(
            //search tags in Jobs
            function(job) {
                if (!job.tags) return;
                _.forEach(job.tags,
                    function(t){
                        if(!Tags.findOne({tags:t}))
                            Tags.insert({tags:t});

                    }
                )

            }

        )
        Placements.find({}).forEach(
            //search tags in Placements
            function(placement) {
                if (!placement.tags) return;
                _.forEach(placement.tags,
                    function(t){
                        if(!Tags.findOne({tags:t}))
                            Tags.insert({tags:t});

                    }
                )

            }

        )
    }
});