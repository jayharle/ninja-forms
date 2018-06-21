/**
 * When we init a save action, listen for form changes
 *
 * @package Ninja Forms builder
 * @subpackage Main App
 * @copyright (c) 2017 WP Ninjas
 * @since 3.1.7
 */
define( [], function( settingCollection ) {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			this.listenTo( nfRadio.channel( 'actions-save' ), 'init:actionModel', this.initSave );
		},

		/**
		 * Set listeners up to listen for add/delete fields for Save action
		 */
		initSave: function( actionModel ) {

			this.model = actionModel;

			/*
			 * When we init a save action model, register a listener for new
			  * fields
			 */
			this.listenTo( Backbone.Radio.channel( 'fields' ), 'add:field',
				this.checkFieldAdded );

			/*
			 * When we init a save action model, register a listener for deleted
			  * fields
			 */
			this.listenTo( Backbone.Radio.channel( 'fields' ), 'delete:field',
				this.checkFieldDeleted );
		},

		/**
		 * When a save action is init'd, check to see if a new field added
		 * is an email and decide if it needs to be the 'submitter_email'
		 * for privacy regulation functionality
		 *
		 * @param  {backbone.model} actionModel
		 * @return {void}
		 */
		checkFieldAdded: function( newFieldModel ) {
			if( 'email' == newFieldModel.get( 'type' ) ) {
				var submitter_email = this.model.get('submitter_email');

				if( '' === submitter_email ) {
					this.model.set( 'submitter_email', newFieldModel.get( 'key' ) );
				}
			}
		},

		/**
		 * When a save action is init'd, check to see if a field that has been
		 * deleted is an email and rearrance the submitter email setting
		 * for privacy regulation functionality
		 *
		 * @param  {backbone.model} actionModel
		 * @return {void}
		 */
		checkFieldDeleted: function( fieldModel ) {
			var submitter_email = this.model.get( 'submitter_email' );
			
			if( submitter_email == fieldModel.get( 'key' ) ) {
				this.model.set( 'submitter_email', '' );
			}
		},

	});

	return controller;
} );