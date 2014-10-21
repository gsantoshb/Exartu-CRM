var fs = Meteor.npmRequire('fs');

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

            // TODO: Validate user with userId and loginToken
            if (! data.userId)
              throw new Meteor.Error(500, 'User is required');

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
            var data = {};

            if (!options|| !options.onDownload)
              throw new Meteor.Error(500, 'onDownload hook is required');

            var stream = options.onDownload(this.params.id);
            // todo: check if its a readable stream
            stream.pipe(this.response);

            //try {
            //  var metadata = _.omit(data, 'userId', 'file');
            //  var connection = DDP.connect(Meteor.absoluteUrl());
            //  var result = connection.call(route, data.userId, data.file.path, metadata);
            //  this.response.end(JSON.stringify(result? result.content : undefined));
            //} catch(err) {
            //  this.response.statusCode = 500;
            //  this.response.end('Oh no! Something has gone wrong' + err);
            //}
            break;
          default:
            this.response.statusCode = 500;
            this.response.end('Method not supported');
        }
      }
    })
  });
};