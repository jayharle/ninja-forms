/**
 * Listens to our app channel for settings views being rendered.
 *
 * If we're rendering a collect payment setting, add our calculations to the data model.
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
            if ( 'calc' == settingModel.get( 'total_type' ) ) {
                var calcModels = nfRadio.channel( 'app' ).request( 'get:formModel' );
                var calcs = this.getCalcs( calcModels, settingModel );

                settingModel.set( 'options', calcs );
            }
        },

        getCalcs: function( calcModels, settingModel ) {
            var returnCalcs = [ settingModel.get( 'default_options' ) ];

            // Update our dataModel with all of our product fields.
            var calcs = calcModels.get( 'settings' ).get( 'calculations' );

            _.each( calcs.models, function( calc ) {
                returnCalcs.push( { label: calc.get( 'name' ), value: '{calc:' + calc.get( 'name' ) + '}' } );
            } );

            returnCalcs = _.sortBy( returnCalcs, function( calc ) { return calc.label } );

            return returnCalcs;
        }

    });

    return controller;
} );