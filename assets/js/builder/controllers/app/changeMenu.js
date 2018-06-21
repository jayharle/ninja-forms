/**
 * Listens to our app channel for the app to start.
 *
 * If the form is a new form, then highlight the Add New submenu item.
 * Otherwise, append an Edit Form submenu for context.
 *
 * @package Ninja Forms builder
 * @subpackage Main App
 * @copyright (c) 2016 WP Ninjas
 * @since 3.0
 */
define( [], function() {
    var controller = Marionette.Object.extend({

        editFormText: '',

        initialize: function () {
            this.editFormText = nfAdmin.editFormText || 'Edit Form';
            this.listenTo(nfRadio.channel('app'), 'after:appStart', this.changeMenu);
            this.listenTo( nfRadio.channel( 'app' ), 'response:updateDB', this.formPublish );
        },

        changeMenu: function () {
            var form = nfRadio.channel( 'app' ).request( 'get:formModel' );

            if ( this.isNewForm( form.id ) ) {
                this.highlightAddNew();
            } else {
                this.appendEditForm();
            }
        },

        isNewForm: function( form_id ) {
            return isNaN( form_id );
        },

        highlightAddNew: function() {
            jQuery( '.wp-submenu li' ).removeClass( 'current' );
            jQuery( 'a[href="admin.php?page=ninja-forms&form_id=new"]' ).parent().addClass( 'current' );
        },

        /**
         * Append 'Edit Form'
         * When editing a form, add an 'Edit Form' submenu item to
         *   the WordPress Admin Dashboard menu, specifically under
         *   the Ninja Forms Menu Item and after the 'Add New' item.
         */
        appendEditForm: function() {
            // Singleton check. Only add this menu item one time.
            if ( jQuery( 'li a:contains("' + this.editFormText + '")' ).length > 0 ) return;

            var editFormLinkText, editFormLink, editFormListItem;

            // Create the 'Edit Form' submenu item.
            editFormLinkText = document.createTextNode(this.editFormText);
            editFormLink = document.createElement("a");
            editFormLink.appendChild(editFormLinkText);

            editFormListItem = document.createElement("li");
            editFormListItem.appendChild(editFormLink);
            editFormListItem.classList.add("current");

            // Remove the `current` class from any existing list items.
            jQuery( '.wp-submenu li' ).removeClass( 'current' );

            // Insert the 'Edit Form' item after the 'Add New' item;
            jQuery( 'a[href="admin.php?page=ninja-forms#new-form"]' ).parent().after( editFormListItem );
        },

        formPublish: function( response ) {
            if ( 'publish' !== response.action ) return false;
            this.changeMenu();
        }
    });

    return controller;
});
