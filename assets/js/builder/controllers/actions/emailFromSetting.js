/**
 * @package Ninja Forms builder
 * @subpackage Actions - Action Settings Drawer
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( [], function( ) {
    var controller = Marionette.Object.extend( {
        initialize: function() {
            this.listenTo( nfRadio.channel( 'actionSetting-from_address' ), 'update:setting', this.updateFromAddress );
        },

        updateFromAddress: function( dataModel, settingModel ) {
            if( 'undefined' == typeof settingModel ) return;

            var value = dataModel.get( 'from_address' ).trim();

            if( '{wp:admin_email}' == value ) {
                return settingModel.set( 'warning', false );
            }

            if( value && ( ! this.isValidEmail( value ) ) || nfAdmin.home_url_host != value.replace(/.*@/, "") ){
                return settingModel.set( 'warning', nfi18n.errorInvalidEmailFromAddress );
            }

            return settingModel.set( 'warning', false );
        },

        isValidEmail: function(email) {
            return /^.+@.+\..+$/.test(email);
        }
    });
    return controller;
} );