Meteor.methods({
    setCardReaderConfiguration: function (conf) {
        try{
            return CardReaderManager.setCardReaderConfiguration(conf);
        }catch (e){
            if (e.response && e.response.statusCode && e.response.statusCode == 401){
                throw new Meteor.Error('invalid credentials');
            }
        }
    },
    getCardReaderConfiguration: function () {
        try{
            return CardReaderManager.getCardReaderConfiguration();
        }catch (e){
            throw new Meteor.Error(e.message);
        }
    }
});