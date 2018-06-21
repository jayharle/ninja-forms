/**
 * Listens to our app channel for settings views being rendered.
 *
 * If we're rendering a collect payment setting, add our number fields and total fields to the data model.
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
			if ( 'field' != settingModel.get( 'total_type' ) ) return false;

			var fields = this.getFields( settingModel );

			/*
			 * If the field in the payment total isn't in our field list, add it.
			 *
			 * Remove the merge tag stuff to get the field key.
			 */
			
			var field_key = dataModel.get( 'payment_total' );
			field_key = field_key.replace( '{field:', '' );
			field_key = field_key.replace( '}', '' );
			var fieldModel = nfRadio.channel( 'fields' ).request( 'get:field', field_key );

			if ( 'undefined' != typeof fieldModel ) {
				if ( 'undefined' == typeof _.findWhere( fields, { value: dataModel.get( 'payment_total' ) } ) ) {
					fields.push( { label: fieldModel.get( 'label' ), value: '{field:' + fieldModel.get( 'key' ) + '}' } );
				}
			}
			
			/*
			 * Update our fields options.
			 */
			settingModel.set( 'options', fields );
			
		},

		getFields: function( settingModel ) {
			var returnFields = [ settingModel.get( 'default_options' ) ];
			// Update our dataModel with all of our product fields.
			var fields = nfRadio.channel( 'fields' ).request( 'get:collection' );
			_.each( fields.models, function( field ) {
				if ( 'number' == field.get( 'type' ) || 'total' == field.get( 'type' ) || 'checkbox' == field.get( 'type' ) ) {
					returnFields.push( { label: field.get( 'label' ), value: '{field:' + field.get( 'key' ) + '}' } );
				}
			} );

			returnFields = _.sortBy( returnFields, function( field ) { return field.label } );

			return returnFields;
		}

	});

	return controller;
} );