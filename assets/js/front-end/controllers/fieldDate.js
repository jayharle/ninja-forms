define([], function() {
    var controller = Marionette.Object.extend({

        initialize: function () {
            this.listenTo( nfRadio.channel( 'date' ), 'render:view', this.initDatepicker );
        },

        initDatepicker: function ( view ) {

            var dateFormat = view.model.get( 'date_format' );

            // For "default" date format, convert PHP format to JS compatible format.
            if( '' == dateFormat || 'default' == dateFormat ){
                dateFormat = this.convertDateFormat( nfi18n.dateFormat );
            }

            var el = jQuery( view.el ).find( '.nf-element' )[0];
            var dateObject = pikadayResponsive( el, {
                format: dateFormat,
                outputFormat: dateFormat,
                classes: jQuery( el ).attr( "class" ),
                placeholder: view.model.get( 'placeholder' ),
                pikadayOptions: {
                    yearRange:  this.getYearRange( view.model ),
                    minDate: this.getMinDate( view.model ),
                    maxDate: this.getMaxDate( view.model ),
                    firstDay: parseInt( nfi18n.startOfWeek )
                }
            } );
            if ( 1 == view.model.get( 'date_default' ) ) {
               dateObject.setDate( moment() );
            }

            nfRadio.channel( 'pikaday' ).trigger( 'init', dateObject, view.model );
        },

        getYearRange: function( fieldModel ) {
            var yearRange      = 10;
            var yearRangeStart = fieldModel.get( 'year_range_start' );
            var yearRangeEnd   = fieldModel.get( 'year_range_end'   );

            if( yearRangeStart && yearRangeEnd ){
                return [ yearRangeStart, yearRangeEnd ];
            } else if( yearRangeStart ) {
                yearRangeEnd = yearRangeStart + yearRange;
                return [ yearRangeStart, yearRangeEnd ];
            } else if( yearRangeEnd ) {
                yearRangeStart = yearRangeEnd - yearRange;
                return [ yearRangeStart, yearRangeEnd ];
            }

            return yearRange;
        },

        getMinDate: function( fieldModel ) {
            var minDate = null;
            var yearRangeStart = fieldModel.get( 'year_range_start' );

            if( yearRangeStart ) {
                return new Date( yearRangeStart, 0, 1 );
            }

            return minDate;
        },

        getMaxDate: function( fieldModel ) {
            var maxDate = null;
            var yearRangeEnd   = fieldModel.get( 'year_range_end' );

            if( yearRangeEnd ) {
                return new Date( yearRangeEnd, 11, 31 );
            }

            return maxDate;
        },
        
        convertDateFormat: function( dateFormat ) {
            // http://php.net/manual/en/function.date.php
            // https://github.com/dbushell/Pikaday/blob/master/README.md#formatting
            // Note: Be careful not to add overriding replacements. Order is important here.

            /** Day */
            dateFormat = dateFormat.replace( 'D', 'ddd' ); // @todo Ordering issue?
            dateFormat = dateFormat.replace( 'd', 'DD' );
            dateFormat = dateFormat.replace( 'l', 'dddd' );
            dateFormat = dateFormat.replace( 'j', 'D' );
            dateFormat = dateFormat.replace( 'N', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'S', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'w', 'd' );
            dateFormat = dateFormat.replace( 'z', '' ); // Not Supported

            /** Week */
            dateFormat = dateFormat.replace( 'W', 'W' );

            /** Month */
            dateFormat = dateFormat.replace( 'M', 'MMM' ); // "M" before "F" or "m" to avoid overriding.
            dateFormat = dateFormat.replace( 'F', 'MMMM' );
            dateFormat = dateFormat.replace( 'm', 'MM' );
            dateFormat = dateFormat.replace( 'n', 'M' );
            dateFormat = dateFormat.replace( 't', '' );  // Not Supported

            // Year
            dateFormat = dateFormat.replace( 'L', '' ); // Not Supported
            dateFormat = dateFormat.replace( 'o', 'YYYY' );
            dateFormat = dateFormat.replace( 'Y', 'YYYY' );
            dateFormat = dateFormat.replace( 'y', 'YY' );

            // Time - Not supported
            dateFormat = dateFormat.replace( 'a', '' );
            dateFormat = dateFormat.replace( 'A', '' );
            dateFormat = dateFormat.replace( 'B', '' );
            dateFormat = dateFormat.replace( 'g', '' );
            dateFormat = dateFormat.replace( 'G', '' );
            dateFormat = dateFormat.replace( 'h', '' );
            dateFormat = dateFormat.replace( 'H', '' );
            dateFormat = dateFormat.replace( 'i', '' );
            dateFormat = dateFormat.replace( 's', '' );
            dateFormat = dateFormat.replace( 'u', '' );
            dateFormat = dateFormat.replace( 'v', '' );

            // Timezone - Not supported
            dateFormat = dateFormat.replace( 'e', '' );
            dateFormat = dateFormat.replace( 'I', '' );
            dateFormat = dateFormat.replace( 'O', '' );
            dateFormat = dateFormat.replace( 'P', '' );
            dateFormat = dateFormat.replace( 'T', '' );
            dateFormat = dateFormat.replace( 'Z', '' );

            // Full Date/Time - Not Supported
            dateFormat = dateFormat.replace( 'c', '' );
            dateFormat = dateFormat.replace( 'r', '' );
            dateFormat = dateFormat.replace( 'u', '' );

            return dateFormat;
        }
    });

    return controller;
});
