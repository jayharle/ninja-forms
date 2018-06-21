/**
 * Listens to our app channel for settings views being rendered.
 *
 * If we haven't set a total_type, then set the total_type to fixed.
 *
 * @package Ninja Forms builder
 * @subpackage Main App
 * @copyright (c) 2017 WP Ninjas
 * @since 3.1.7
 */
define( [], function() {
    var controller = Marionette.Object.extend( {
        initialize: function() {
            // Listen for messages that are fired before a setting view is rendered.
            this.listenTo( nfRadio.channel( 'app' ), 'before:renderSetting', this.beforeRenderSetting );
        },

        beforeRenderSetting: function( settingModel, dataModel, view ) {

            if ( 'payment_total_type' != settingModel.get( 'name' ) || _.isEmpty( dataModel.get( 'payment_total' ) ) ) return false;

            /*
             * If we don't have a payment total type and we have a payment total, set our total type to the appropriate total type.
             */
            if ( ( 'undefined' == dataModel.get( 'payment_total_type' ) || _.isEmpty( dataModel.get( 'payment_total_type' ) ) ) ) {
                /*
                 * If payment_total is a field merge tag, set payment_total_type to "field"
                 */

                if ( -1 != dataModel.get( 'payment_total' ).indexOf( '{field' ) ) {
                    dataModel.set( 'payment_total_type', 'field' );
                } else if ( -1 != dataModel.get( 'payment_total' ).indexOf( '{calc' ) ) {
                    dataModel.set( 'payment_total_type', 'calc' );
                } else {
                    dataModel.set( 'payment_total_type', 'fixed' );
                }   
            }
        },

    });

    return controller;
} );