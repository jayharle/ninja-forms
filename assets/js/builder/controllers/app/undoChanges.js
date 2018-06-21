define( [], function() {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			this.listenTo( nfRadio.channel( 'drawer' ), 'click:undoChanges', this.undoChanges, this );
			this.listenTo( nfRadio.channel( 'drawer' ), 'click:undoSingle', this.undoSingle, this );
		},

		undoChanges: function() {
			var changeCollection = nfRadio.channel( 'changes' ).request( 'get:collection' );
			changeCollection.sort();
			var that = this;
			_.each( changeCollection.models, function( change ) {
				that.undoSingle( change, true );
			} );
			changeCollection.reset();
			// Update preview.
			nfRadio.channel( 'app' ).request( 'update:db' );			
			nfRadio.channel( 'app' ).request( 'update:setting', 'clean', true );
			nfRadio.channel( 'app' ).request( 'close:drawer' );
            this.dispatchClick();
		},

		undoSingle: function( change, undoAll ) {
			nfRadio.channel( 'changes' ).request( 'undo:' + change.get( 'action' ), change, undoAll );
            this.dispatchClick();
		},
        
        dispatchClick: function() {
            // If we already have a cookie, exit.
            if ( document.cookie.includes( 'nf_undo' ) ) return;
            // Otherwise, prepare our cookie.
            var cname = "nf_undo";
            var d = new Date();
            // Set expiration at 1 week.
            d.setTime( d.getTime() + ( 7*24*60*60*1000 ) );
            var expires = "expires="+ d.toUTCString();
            // Bake the cookie.
            document.cookie = cname + "=1;" + expires + ";path=/";
            var data = {
                action: 'nf_undo_click',
                security: nfAdmin.ajaxNonce
            }
            // Make our AJAX call.
            jQuery.post( ajaxurl, data );
        }

	});

	return controller;
} );