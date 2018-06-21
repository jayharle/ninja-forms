/**
 * Listens to field deletion, removing any merge tags that reference the field.
 * 
 * @package Ninja Forms builder
 * @subpackage Main App
 * @copyright (c) 2017 WP Ninjas
 * @since 3.1.7
 */
define( [], function() {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			/*
			 * When we init an action model, register a listener for field deletion.
			 */
			this.listenTo( nfRadio.channel( 'actions' ), 'init:actionModel', this.registerListener );
		},

		registerListener: function( actionModel ) {
			actionModel.listenTo( nfRadio.channel( 'fields' ), 'delete:field', this.maybeUpdateSettings );
		},

		maybeUpdateSettings: function( fieldModel ) {
			var newObject, filteredCollection,
				fieldMergeTag = '{field:' + fieldModel.get( 'key' ) + '}';
			
			/*
			 * Loop through our action attributes to see if the field mergetag exists in our action.
			 *
			 * If it does:
			 * 	- Replace the field mergetag in strings with ''.
			 * 	- Remove any items with the field merge tag if they are in an array.
			 */
			_.each( this.attributes, function( attr, key ) {
				if ( _.isString( attr ) ) {
					// If our attribute is a string, replace any instances of the field merge tag with an empty string.
					this.set( key, attr.replace( fieldMergeTag, '' ) );
				} else if ( _.isArray( attr ) ) {
					// If our attribute is an array, search the contents for field merge tag and remove items that match.
					_.each( attr, function( val, index ) {
						if ( _.isString( val ) ) {
							// If val is a string, search it for the field mergetag.
							console.log( 'string replace' );
						} else if ( _.isArray( val ) ) {
							// If val is an array, search it for the field mergetag.
							console.log( 'array search' );
						} else if ( _.isObject( val ) ) {
							// If val is a object, search it for the field mergetag.
							newObject = _.mapObject( val, function( value, key ) {
								if ( _.isString( value ) ) {
									if ( -1 != value.indexOf( fieldMergeTag ) ) {
										attr.splice( index, 1 );
									}
								};

								return value;
							} );

							this.set( key, attr );
						}
					}, this );
				} else if ( attr instanceof Backbone.Collection ) {
					// This is a Backbone Collection, so we need to loop through the models and remove any that have an attribute containing the field merge tag.
					var filteredCollection = attr.filter( function ( model ) {
						// Make sure that EVERY model attribute does NOT reference the field merge tag.
					    return _.every( model.attributes, function( val ) {
					    	/*
					    	 * Currently only handles items that are one-level deep.
					    	 * TODO: Add support for further nesting of values.
					    	 */
					    	if ( _.isString( val ) ) {
					    		if ( -1 != val.indexOf( fieldMergeTag ) ) {
					    			return false;
					    		}
					    	}
					    	return true;
					    });;
					});
					// Update our key with the filtered collection value.
					this.set( key, filteredCollection );
				}
			}, this );
		}

	});

	return controller;
} );