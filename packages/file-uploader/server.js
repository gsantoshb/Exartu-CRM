var fs = Npm.require('fs');

FileUploader.createEndpoint = function(route, options) {
  var endpointMethod = {};
  endpointMethod[route] = function (userId, path, metadata) {
    this.setUserId(userId);
    return options && options.onUpload && options.onUpload(fs.createReadStream(path), metadata);
  };
  Meteor.methods(endpointMethod);

  Router.map(function() {
    this.route(route, {
      where: 'server',
      action: function() {
        console.log(route + ' ' + this.request.method);
        this.response.statusCode = 200;

        switch(this.request.method) {
          case 'POST':
            var data = {};

            _.extend(data, this.request.files);
            _.extend(data, this.request.query);

            if (!data.userId)
              throw new Meteor.Error(500, 'User is required');

            var user = Meteor.users.findOne(data.userId);
            if (!user)
              throw new Meteor.Error(500, 'User not found');

            if (! data.loginToken)
              throw new Meteor.Error(500, 'Login token required');

            var loginToken = Meteor.users.findOne({_id: data.userId, 'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(data.loginToken)});
            if (! loginToken)
              throw new Meteor.Error(500, 'Invalid login token');

            if (! data.file)
              throw new Meteor.Error(500, 'File is required');

            try {
              var metadata = _.omit(data, 'userId', 'file');
              var connection = DDP.connect(Meteor.absoluteUrl());
              var result = connection.call(route, data.userId, data.file.path, metadata);
              this.response.end(JSON.stringify(result? result.content : undefined));
            } catch(err) {
              this.response.statusCode = 500;
              this.response.end('Oh no! Something has gone wrong' + err);
            }
            break;
          default:
            this.response.statusCode = 500;
            this.response.end('Method not supported');
        }
      }
    })
  });

  Router.map(function() {
    this.route(route + '/download/:id', {
      where: 'server',
      action: function() {
        console.log(route + '/download ' + this.request.method);
        this.response.statusCode = 200;

        switch(this.request.method) {
          case 'GET':
            if (!options|| !options.onDownload)
              throw new Meteor.Error(500, 'onDownload hook is required');

            var args = [this.params.id];
            args[1] = _.omit(this.params, 'id', 'hash') || {};
            args[2] = this.response;
            var stream = options.onDownload.apply({}, args);
            if (!stream) return;

            // todo: check if its a readable stream
            stream.pipe(this.response);
            break;
          default:
            this.response.statusCode = 500;
            this.response.end('Method not supported');
        }
      }
    })
  });
};