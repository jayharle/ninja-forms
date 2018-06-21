/**
 * Button to add an action to the form.
 *
 * TODO: make dynamic
 * 
 * @package Ninja Forms builder
 * @subpackage Actions
 * @copyright (c) 2015 WP Ninjas
 * @since 3.0
 */
define( [], function() {
	var view = Marionette.ItemView.extend({
		tagName: 'div',
		template: '#tmpl-nf-drawer-action-type-button',

		onRender: function() {
			
			jQuery( this.el ).disableSelection();
			
			if ( 'installed' == this.model.get( 'section') ) {
				var that = this;
				jQuery( this.el ).draggable( {
					opacity: 0.9,
					tolerance: 'intersect',
					scroll: false,
					helper: 'clone',

					start: function( e, ui ) {
						that.dragging = true;
						nfRadio.channel( 'drawer-addAction' ).trigger( 'startDrag:type', this, ui );
					},

					stop: function( e, ui ) {
						that.dragging = false;
						nfRadio.channel( 'drawer-addAction' ).trigger( 'stopDrag:type', this, ui );
					}

				} );
			}
			
		},

		events: {
			'click .nf-item': 'clickAddAction'
		},

		clickAddAction: function( e ) {
			if ( ! this.dragging ) {
				if ( 'installed' == this.model.get( 'section' ) ) { // Is this an installed action?
					nfRadio.channel( 'actions' ).trigger( 'click:addAction', this.model );
				} else { // This isn't an installed action
					var modalContent = this.model.get( 'modal_content' );

					var actionModal = new jBox( 'Modal', {
					  content: modalContent,
					  zIndex:99999999,
					  closeButton: 'box',
					  overlay: true,
					  width: 600,
					  repositionOnOpen: true,
					  reposition: true
					});

					actionModal.open();
					// window.open( this.model.get( 'link' ), '_blank' );
				}
			}
		},

		templateHelpers: function() {
			return {
				renderClasses: function() {
					var classes = 'nf-item';
					if ( '' != jQuery.trim( this.image ) ) {
						classes += ' nf-has-img';
					}

					if ( 'installed' == this.section ) {
						classes += ' nf-action-type';
					}
					return classes;
				},

				renderStyle: function() {
					if ( '' != jQuery.trim( this.image ) ) {

						// This is being used in a template, so carefully consider the order of double/single quotes.
						return "background-image: url('" + jQuery.trim( this.image ) + "')";
					} else {
						return '';
					}
				}
			}
		}
	});

	return view;
} );
