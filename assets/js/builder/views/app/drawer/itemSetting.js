define( ['views/app/drawer/mergeTagsContent', 'views/app/drawer/settingError'], function( mergeTagsContentView, settingErrorView ) {
	var view = Marionette.LayoutView.extend({
		tagName: 'div',
		template: '#tmpl-nf-edit-setting-wrap',

		regions: {
			error: '.nf-setting-error'
		},

		initialize: function( data ) {
			this.dataModel = data.dataModel;
			/*
			 * Send out a request on the setting-type-{type} channel asking if we should render on dataModel change.
			 * Defaults to false.
			 * This lets specific settings, like RTEs, say that they don't want to be re-rendered when their data model changes.
			 */
			var renderOnChange = ( 'undefined' == typeof nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).request( 'renderOnChange' ) ) ? false : nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).request( 'renderOnChange' );
			
			if ( renderOnChange ) {
				this.dataModel.on( 'change:' + this.model.get( 'name' ), this.render, this );
			}

			this.model.on( 'change:error', this.renderError, this );
			this.model.on( 'change:warning', this.renderWarning, this );

			var deps = this.model.get( 'deps' );
			if ( deps ) {
				for ( var name in deps ) {
				    if ( deps.hasOwnProperty( name ) ) {
				    	this.dataModel.on( 'change:' + name, this.render, this );
				    }
				}
			}

            /**
			 * For settings that require a remote refresh
			 *   add an "update"/refresh icon to the label.
             */
            var remote = this.model.get( 'remote' );
			if( remote ) {
                if( 'undefined' != typeof remote.refresh || remote.refresh ) {
					var labelText, updateIcon, updateLink, labelWrapper;

                    labelText = document.createTextNode( this.model.get('label') );

                    updateIcon = document.createElement( 'span' );
                    updateIcon.classList.add( 'dashicons', 'dashicons-update' );

                    updateLink = document.createElement( 'a' );
                    updateLink.classList.add( 'extra' );
                    updateLink.appendChild( updateIcon );

                    // Wrap the label text and icon/link in a parent element.
                    labelWrapper = document.createElement( 'span' );
                    labelWrapper.appendChild( labelText );
                    labelWrapper.appendChild( updateLink );

                    // The model expects a string value.
                    this.model.set('label', labelWrapper.innerHTML );
                }

				nfRadio.channel( 'setting' ).trigger( 'remote', this.model, this.dataModel, this );
				this.model.on( 'rerender', this.render, this );
			}

			/*
			 * When our drawer opens, send out a radio message on our setting type channel.
			 */
			this.listenTo( nfRadio.channel( 'drawer' ), 'opened', this.drawerOpened );

			/*
			 * When our drawer closes, send out a radio message on our setting type channel.
			 */
			this.listenTo( nfRadio.channel( 'drawer' ), 'closed', this.drawerClosed );
		},

		onBeforeDestroy: function() {
			this.dataModel.off( 'change:' + this.model.get( 'name' ), this.render );
			this.model.off( 'change:error', this.renderError );

			var deps = this.model.get( 'deps' );
			if ( deps ) {
				for (var name in deps) {
				    if ( deps.hasOwnProperty( name ) ) {
				    	this.dataModel.off( 'change:' + name, this.render );
				    }
				}
			}

			if( this.model.get( 'remote' ) ) {
				this.model.off( 'rerender', this.render, this );
			}

			/*
			 * Send out a radio message.
			 */
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'destroy:setting', this.model, this.dataModel, this );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'destroy:setting', this.model, this.dataModel, this );
		
			/*
			 * Unescape any HTML being saved if we are a textbox.
			 */
			if ( 'textbox' == this.model.get( 'type' ) ) {
				var setting = this.model.get( 'name' );
				var value = this.dataModel.get( setting );
				this.dataModel.set( setting, _.unescape( value ), { silent: true } );
			}

		},

		onBeforeRender: function() {
			/*
			 * We want to escape any HTML being output if we are a textbox.
			 */
			if ( 'textbox' == this.model.get( 'type' ) ) {
				var setting = this.model.get( 'name' );
				var value = this.dataModel.get( setting );
				this.dataModel.set( setting, _.escape( value ), { silent: true } );
			}
			
			nfRadio.channel( 'app' ).trigger( 'before:renderSetting', this.model, this.dataModel );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'before:renderSetting', this.model, this.dataModel, this );
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'before:renderSetting', this.model, this.dataModel, this );
		},

		onRender: function() {
			this.mergeTagsContentView = false;
			var that = this;

			/*
			 * Send out a radio message.
			 */
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'render:setting', this.model, this.dataModel, this );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'render:setting', this.model, this.dataModel, this );

			jQuery( this.el ).find( '.nf-help' ).each(function() {
				var content = jQuery(this).next('.nf-help-text');
				jQuery( this ).jBox( 'Tooltip', {
					content: content,
					maxWidth: 200,
					theme: 'TooltipBorder',
					trigger: 'click',
					closeOnClick: true
				})
		    });
			
		    if ( this.model.get( 'use_merge_tags' ) ) {
		    	nfRadio.channel( 'mergeTags' ).request( 'init', this );
		    }

			/*
			 * Apply Setting Field Masks
			 */
			var mask = this.model.get( 'mask' );

			if( typeof mask != "undefined" ){

				var input = jQuery( this.$el ).find( 'input' );

				switch( mask.type ){
					case 'numeric':
						input.autoNumeric({
							aSep: thousandsSeparator,
							aDec: decimalPoint
						});
						break;
					case 'currency':

						var currency = nfRadio.channel( 'settings' ).request( 'get:setting', 'currency' );
						var currencySymbol = nfAdmin.currencySymbols[ currency ] || '';

						input.autoNumeric({
							aSign:  jQuery('<div />').html(currencySymbol).text(),
							aSep: thousandsSeparator,
							aDec: decimalPoint
						});
						break;
					case 'custom':
						if( mask.format ) input.mask( mask.format )
						break;
					default:
						// TODO: Error Logging.
						console.log( 'Notice: Mask type of "' + mask.type + '" is not supported.' );
				}
			}
			
			this.renderError();
		},

		onShow: function() {			
			/*
			 * Send out a radio message.
			 */
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'show:setting', this.model, this.dataModel, this );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'show:setting', this.model, this.dataModel, this );
		},

		onAttach: function() {			
			/*
			 * Send out a radio message.
			 */
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'attach:setting', this.model, this.dataModel, this );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'attach:setting', this.model, this.dataModel, this );
		},

		renderError: function() {
			if ( this.model.get( 'error' ) ) {
				jQuery( this.el ).find( '.nf-setting' ).addClass( 'nf-error' );
				this.error.show( new settingErrorView( { model: this.model } ) );
			} else {
				jQuery( this.el ).find( '.nf-setting' ).removeClass( 'nf-error' );
				this.error.empty();
			}
		},

        renderWarning: function() {
            if ( this.model.get( 'warning' ) ) {
                jQuery( this.el ).find( '.nf-setting' ).addClass( 'nf-warning' );
                this.error.show( new settingErrorView( { model: this.model } ) );
            } else {
                jQuery( this.el ).find( '.nf-setting' ).removeClass( 'nf-warning' );
                this.error.empty();
            }
        },

		templateHelpers: function () {
			var that = this;
	    	return {

	    		renderVisible: function() {
					if ( this.deps ) {
						for (var name in this.deps) {
						    if ( this.deps.hasOwnProperty( name ) ) {
						        if ( that.dataModel.get( name ) != this.deps[ name ] ) {
						        	return 'style="display:none;"';
						        }
						    }
						}
					}
	    			return '';
	    		},

	    		renderSetting: function(){
	    			if ( 'undefined' != typeof that.dataModel.get( this.name ) ) {
	    				this.value = that.dataModel.get( this.name );
	    			} else if ( 'undefined' == typeof this.value ) {
	    				this.value = '';
	    			}
	    			var setting = nfRadio.channel( 'app' ).request( 'get:template',  '#tmpl-nf-edit-setting-' + this.type );
					return setting( this );
				},

				renderLabelClasses: function() {
					var classes = '';
					if ( this.use_merge_tags ) {
						classes += ' has-merge-tags';
					}
					if ( 'rte' == this.type ) {
						classes += ' rte';
					}

					return classes;
				},

				renderClasses: function() {
					var classes = 'nf-setting ';
					if ( 'undefined' != typeof this.width ) {
						classes += 'nf-' + this.width;
					} else {
						classes += ' nf-one-half';
					}

					if ( this.error ) {
						classes += ' nf-error';
					}

					return classes;
				},

				renderTooltip: function() {
					if ( ! this.help ) return '';
					var helpText, helpTextContainer, helpIcon, helpIconLink, helpTextWrapper;

					helpText = document.createTextNode( this.help );
					helpTextContainer = document.createElement( 'div' );
					helpTextContainer.classList.add( 'nf-help-text' );
					helpTextContainer.appendChild( helpText );

					helpIcon = document.createElement( 'span' );
					helpIcon.classList.add( 'dashicons', 'dashicons-admin-comments' );
                    helpIconLink = document.createElement( 'a' );
                    helpIconLink.classList.add( 'nf-help' );
                    helpIconLink.setAttribute( 'href', '#' );
                    helpIconLink.setAttribute( 'tabindex', '-1' );
                    helpIconLink.appendChild( helpIcon );

                    helpTextWrapper = document.createElement( 'span' );
                    helpTextWrapper.appendChild( helpIconLink );
                    helpTextWrapper.appendChild( helpTextContainer );

                    // The template expects a string value.
					return helpTextWrapper.innerHTML;
				},

			    /*
			     * Render a select element with only the email fields on the
			      * form
			     */
			    renderEmailFieldOptions: function() {
				    var fields = nfRadio.channel( 'fields' ).request( 'get:collection' );

				    initialOption = document.createElement( 'option' );
				    initialOption.value = '';
				    initialOption.label = '--';
				    initialOption.innerHTML = '--';

				    var select_value = '';
				    var select = document.createElement( 'select' );
				    select.classList.add( 'setting' );
				    select.setAttribute( 'data-id', 'my_seledt' );
				    select.appendChild( initialOption );

				    var index = 0;
				    var that = this;
				    fields.each( function( field ) {
					    // Check for the field type in our lookup array and...
					    if( 'email' != field.get( 'type' ) ) {
						    // Return if the type is in our lookup array.
						    return '';
					    }

					    var option = document.createElement( 'option' );

					    option.value = field.get( 'key' );
					    option.innerHTML = field.get( 'label' );
					    option.label = field.get( 'label' );
					    
					    if( that.value === field.get( 'key' ) ) {
						    option.setAttribute( 'selected', 'selected' );
					    }
					    select.appendChild( option );
					    index = index + 1;
				    });

				    label = document.createElement( 'label' );
				    label.classList.add( 'nf-select' );

				    label.appendChild( select );

				    // Select Lists need an empty '<div></div>' for styling purposes.
				    emptyContainer = document.createElement( 'div' );
				    label.appendChild( emptyContainer );

				    // The template requires a string.
				    return label.innerHTML;
			    },

				renderMergeTags: function() {
					if ( this.use_merge_tags && ! this.hide_merge_tags ) {
						return '<span class="dashicons dashicons-list-view merge-tags"></span>';
					} else {
						return '';
					}
				}
			}
		},

		events: {
			'change .setting': 'changeSetting',
			'keyup .setting': 'keyUpSetting',
			'click .setting': 'clickSetting',
			'click .extra': 'clickExtra'
		},

		changeSetting: function( e ) {
			nfRadio.channel( 'app' ).trigger( 'change:setting', e, this.model, this.dataModel );
		},

		keyUpSetting: function( e ) {
			nfRadio.channel( 'app' ).trigger( 'keyup:setting', e, this.model, this.dataModel );
			nfRadio.channel( 'setting-' + this.model.get( 'name' ) ).trigger( 'keyup:setting', e, this.model, this.dataModel );
		},

		clickSetting: function( e ) {
			nfRadio.channel( 'app' ).trigger( 'click:setting', e, this.model, this.dataModel );
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'click:setting', e, this.model, this.dataModel, this );
		},

		clickExtra: function( e ) {
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'click:extra', e, this.model, this.dataModel, this );
			nfRadio.channel( 'setting-type-' + this.model.get( 'name' ) ).trigger( 'click:extra', e, this.model, this.dataModel, this );
			nfRadio.channel( 'setting-name-' + this.model.get( 'name' ) ).trigger( 'click:extra', e, this.model, this.dataModel, this );
		},

		drawerOpened: function() {
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'drawer:opened', this.model, this.dataModel, this );
		},

		drawerClosed: function() {
			nfRadio.channel( 'setting-type-' + this.model.get( 'type' ) ).trigger( 'drawer:closed', this.model, this.dataModel, this );
		}
	});

	return view;
} );
