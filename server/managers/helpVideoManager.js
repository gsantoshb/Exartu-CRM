HelpVideoManager = {
    addUpdate: function (helpVideo) {
        if (!helpVideo.name){
            throw new Error('name required');
        }
        if (!helpVideo.url){
            throw new Error('url required');
        }

        if (helpVideo._id){
            HelpVideos.update(helpVideo._id, helpVideo);
        } else {
            helpVideo.dateCreated = new Date();
            HelpVideos.insert(helpVideo);
        }
    },
    remove: function (id) {
        HelpVideos.remove(id);
    }
};

