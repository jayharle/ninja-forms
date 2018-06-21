
define( [], function() {
    var controller = Marionette.Object.extend({
        initialize: function () {
            // Respond to requests for field setting filtering.

            console.log( nfRadio.channel( 'radio' ) );
            nfRadio.channel('radio').reply( 'before:updateSetting', this.updateSetting, this);
        },


        updateSetting: function( e, fieldModel, name, settingTypeModel ) {
            console.log( 'test' );
        }
    });
    return controller;
} );