var prevIndex = null;

var AboutControl = can.Control({
    init: function(element, options) {
        initializeAboutPage(this.element);
        $( '#aboutMenu, #contactMenu' ).click( changeBanner );
        $( '#aboutMenu' ).trigger( 'click' );
    }
});

var initializeAboutPage = function(element) {
    element.html(can.view('aboutTemplate', {}));

    $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
}

function changeBanner() {
    var index = Math.floor( Math.random() * 3 );

    if ( index == prevIndex ) {
        index = ( index + 1 ) % 4;
    }

    if (prevIndex) {
        $( '#banner' + prevIndex ).animate( {opacity: 0.0}, 300, function() {
            $( '#banner' + index ).animate( {opacity: 1.0}, 500 );
        });
    } else {
        $( '#banner' + index ).animate( {opacity: 1.0}, 500 );
    }
    prevIndex = index;
}

exports.AboutControl = AboutControl;