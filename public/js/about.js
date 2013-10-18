var prevIndex = null;

    function init() {
        $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
      
        $(window).resize( windowResize );
        windowResize();

        $( '#aboutMenu, #contactMenu' ).click( changeBanner );
  
        $( '#aboutMenu' ).trigger( 'click' );
    }

    function changeBanner() {
        index = Math.floor( Math.random() * 3 );

        if( index == prevIndex ) {
            index = ( index + 1 ) % 4;
        }

        if( prevIndex) {
            $( '#banner' + prevIndex ).animate( {opacity: 0.0}, 300, function() {
                $( '#banner' + index ).animate( {opacity: 1.0}, 500 );
            });
        } else {
            $( '#banner' + index ).animate( {opacity: 1.0}, 500 );
        }
        prevIndex = index;
    }


    function windowResize() {
        $( '#bannerContainer' ).width( $( window ).width() - 20 );
        $( '#tabs' ).width( $( window ).width() - 20 );
        $( "#tabs" ).height( ($( window ).height() - 370 ) + "px" );
        $( "body" ).height(($(window).height() - 45) + "px");

        var widthToConsider = $( window ).width();
        
        marginLeft = ( widthToConsider - $( '#banner' ).width() ) / 2 + 10;

        $( '#banner' ).css( 'margin-left', marginLeft );
    }
