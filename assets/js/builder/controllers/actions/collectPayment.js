/**
 * When we init a collect payment action, listen for calc changes
 * 
 * @package Ninja Forms builder
 * @subpackage Main App
 * @copyright (c) 2017 WP Ninjas
 * @since 3.1.7
 */
define( [], function( settingCollection ) {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			/*
			 * When we init a collect payment action model, register a listener for calc changes.
			 */
			this.listenTo( nfRadio.channel( 'actions-collectpayment' ), 'init:actionModel', this.initCollectPayment );
			
			/*
			 * Before we render our total field, we may want to update its value.
			 */
			this.listenTo( nfRadio.channel( 'app' ), 'before:renderSetting', this.maybeClearTotal );
		},

		/**
		 * When a collect payment action is init'd, register a listener for calc changes and update our data appropriately.
		 * @since  3.1.7
		 * @param  {backbone.model} actionModel 
		 * @return {void}
		 */
		initCollectPayment: function( actionModel )  {
			actionModel.listenTo( nfRadio.channel( 'calcs' ), 'update:calcName', this.maybeUpdateTotal );
        },

		//TODO: Add in an error that will not allow drawer to close until total type and total value is selected.
		maybeError: function(){},

		maybeUpdateTotal: function( optionModel, oldName ) {
			/*
			 * We have changed a calculation. Make sure that 'calc' is our payment total type.
			 */
			if ( 'calc' != this.get( 'payment_total_type' ) ) {
				return
			}
			
			/*
			 * Check our payment_total setting for the old merge tag and replace it with the new one.
			 */
			var newVal = this.get( 'payment_total' ).replace( '{calc:' + oldName + '}', '{calc:' + optionModel.get( 'name' ) + '}' );
			this.set( 'payment_total', newVal );
		},

		maybeClearTotal: function( settingModel, dataModel, view ) {
            /*
             * If our payment_total is a merge tag, clear it when we select the "fixed" option.
             */
            if ( 'fixed' == dataModel.get( 'payment_total_type' ) ) {
                if ( -1 != dataModel.get( 'payment_total' ).indexOf( '{field' ) || -1 != dataModel.get( 'payment_total' ).indexOf( '{calc' ) ) {
                    dataModel.set( 'payment_total', '' );
                }
            }
		}

	});

	return controller;
} );