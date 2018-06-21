/*
 * Because our backbone listens to .change() events on elements, changes made using jQuery .val() don't bubble properly.
 * This patch overwrites the default behaviour of jQuery .val() so that IF the item has an nf-element class, we fire a change event.
 */
( function( jQuery ) {
	/*
	 * Store our original .val() function.
	 */
    var originalVal = jQuery.fn.val;
    /*
     * Create our own .val() function.
     */
    jQuery.fn.val = function(){
        var prev;
        /* 
         * Store a copy of the results of the original .val() call.
         * We use this to make sure that we've actually changed something.
         */
        if( arguments.length > 0 ){
            prev = originalVal.apply( this,[] );
        }
        /*
         * Get the results of the original .val() call. 
         */
        var result = originalVal.apply( this, arguments );

        /*
         * If we have arguments, we have actually made a change, AND this has the nf-element class, trigger .change().
         */
        if( arguments.length > 0 && prev != originalVal.apply( this, [] ) && jQuery( this ).hasClass( 'nf-element' ) ) {
			jQuery(this).change();
        }

        return result;
    };
} ) ( jQuery );

jQuery( document ).ready( function( $ ) {
	require( [ 'models/formCollection', 'models/formModel', 'models/fieldCollection', 'controllers/loadControllers', 'views/mainLayout'], function( formCollection, FormModel, FieldCollection, LoadControllers, mainLayout ) {

		if( 'undefined' == typeof nfForms ) {
			/*
			 * nfForms is not defined. This means that something went wrong loading the form data.
			 * Bail form setup and empty the form containers to remove any loading animations.
			 */
			jQuery( '.nf-form-cont' ).empty();
			return;
		}

		var NinjaForms = Marionette.Application.extend({
			forms: {},
			initialize: function( options ) {
				var that = this;
				Marionette.Renderer.render = function(template, data){
					var template = that.template( template );
					return template( data );
				};

				// generate new, unique nonce
				this.getNonce();

				// Underscore one-liner for getting URL Parameters
				this.urlParameters = _.object(_.compact(_.map(location.search.slice(1).split('&'), function(item) {  if (item) return item.split('='); })));

				if( 'undefined' != typeof this.urlParameters.nf_resume ) {
					this.listenTo(nfRadio.channel('form-' + this.urlParameters.nf_resume), 'loaded', this.restart);
				}

				var loadControllers = new LoadControllers();
				nfRadio.channel( 'app' ).trigger( 'after:loadControllers' );

				nfRadio.channel( 'app' ).reply( 'get:template', this.template );
			},
			
			onStart: function() {
				var formCollection = nfRadio.channel( 'app' ).request( 'get:forms' );
				_.each( formCollection.models, function( form, index ) {
					var layoutView = new mainLayout( { model: form, fieldCollection: form.get( 'fields' ) } );			
					nfRadio.channel( 'form' ).trigger( 'render:view', layoutView );
					jQuery( document ).trigger( 'nfFormReady', layoutView );
				} );
			},

			restart: function( formModel ) {
				if( 'undefined' != typeof this.urlParameters.nf_resume ){
					var data = {
						'action': 'nf_ajax_submit',
						'security': nfFrontEnd.ajaxNonce,
						'nf_resume': this.urlParameters
					};

					nfRadio.channel( 'form-' + formModel.get( 'id' ) ).trigger( 'disable:submit' );
					nfRadio.channel( 'form-' + formModel.get( 'id' ) ).trigger( 'processingLabel' );

					this.listenTo( nfRadio.channel( 'form' ), 'render:view', function() {
						/**
						 * TODO: This needs to be re-worked for backbone. It's not dynamic enough.
						 */
						/*
						 * Hide form fields (but not the submit button).
						 */
						jQuery( '#nf-form-' + formModel.get( 'id' ) + '-cont .nf-field-container:not(.submit-container)' ).hide();
					});

					// TODO: Refactor Duplication
					jQuery.ajax({
						url: nfFrontEnd.adminAjax,
						type: 'POST',
						data: data,
						cache: false,
						success: function( data, textStatus, jqXHR ) {
							try {
						   		var response = data;
						        nfRadio.channel( 'forms' ).trigger( 'submit:response', response, textStatus, jqXHR, formModel.get( 'id' ) );
						    	nfRadio.channel( 'form-' + formModel.get( 'id' ) ).trigger( 'submit:response', response, textStatus, jqXHR );
							} catch( e ) {
								console.log( 'Parse Error' );
							}

					    },
					    error: function( jqXHR, textStatus, errorThrown ) {
					        // Handle errors here
					        console.log('ERRORS: ' + textStatus);
					        // STOP LOADING SPINNER
							nfRadio.channel( 'forms' ).trigger( 'submit:response', 'error', textStatus, jqXHR, errorThrown );
					    }
					});
				}
			},

			/**
			 * This function retrieves a new, unique nonce so that we avoid
			 * giving the user a nonce that could possibly expire before
			 * they finish filling out the form.
			 * @since 3.2
			 */
			getNonce: function() {
				var data = {
					'action': 'nf_ajax_get_new_nonce',
				};

				jQuery.ajax({
					url: nfFrontEnd.adminAjax,
					type: 'POST',
					data: data,
					cache: false,
					success: function( data, textStatus, jqXHR ) {
						try {
							data = JSON.parse( data );
							var response = data.data;
							// set the new nonce value
							nfFrontEnd.ajaxNonce = response.new_nonce;
							// set the nonce timestamp so that we can check it
							nfFrontEnd.nonce_ts = response.nonce_ts;

						} catch( e ) {
							console.log( 'Parse Error' );
						}

					},
					error: function( jqXHR, textStatus, errorThrown ) {
						// Handle errors here
						console.log('ERRORS: ' + textStatus);
					}
				});
			},

			template: function( template ) {
				return _.template( $( template ).html(),  {
					evaluate:    /<#([\s\S]+?)#>/g,
					interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
					escape:      /\{\{([^\}]+?)\}\}(?!\})/g,
					variable:    'data'
				} );
			}
		});
	
		var ninjaForms = new NinjaForms();
		ninjaForms.start();		
	} );
} );
