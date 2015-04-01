
var iconv = Meteor.npmRequire('iconv-lite');
console.log('iconv', iconv);

CardReaderManager = {
    setCardReaderConfiguration: Meteor.wrapAsync(function (conf, cb) {

        try {

            if (! conf){
                throw new Error('missing configuration');
            }
            if (! conf.appId){
                throw new Error('missing appId');
            }
            if (! conf.password){
                throw new Error('missing password');
            }


            var string = conf.appId + ':' + conf.password;
            console.log('string', string);
            var stringIso = iconv.encode(string, "iso-8859-1");
            var encoded = stringIso.toString('base64');
            console.log('encoded', encoded);

            HTTP.get('http://cloud.ocrsdk.com/listTasks', {
                headers: {
                    'authorization': 'Basic: ' + encoded
                }
            }, function (err, respond) {

                if (err){
                    console.log('get task EROR', err);
                    cb(err);
                } else {
                    console.log('get task OK');
                    var user = Meteor.user();

                    conf.encoded = encoded;

                    Hierarchies.update({ _id: user.currentHierId }, { $set: { cardReader: conf } });

                    cb(null, null);
                }
            })
        } catch (e){
            cb(e)
        }

    }),
    getCardReaderConfiguration: function () {
        var hier =  Hierarchies.findOne({ _id: Meteor.user().currentHierId });
        console.log('hier', hier);

        if (! hier || ! hier.cardReader) return null;

        return hier.cardReader;
    }
};

