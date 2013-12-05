var prevIndex = null;

var AboutControl = can.Control({
    init: function(element, options) {
        initializeAboutPage(this.element);
        $( '.aboutMenu' ).trigger( 'click' );
    },
    ".aboutMenu click": function(el, ev) {
        var index = Math.floor( Math.random() * 3 ) + 1;

        if ( index === prevIndex ) {
            index = ( index + 1 ) % 4 + 1;
        }
        console.log('#banner' + prevIndex + ' ' + '#banner' + index);


        if(prevIndex) {
            $('#banner' + prevIndex).css('z-index', 9).animate( {opacity: 0.0}, 300, function() {
                $('#banner' + index).css('z-index', 10).animate( {opacity: 1.0}, 500 );
            });
        } else {
            $('#banner' + index).css('z-index', 10).animate( {opacity: 1.0}, 500 );
        }

        prevIndex = index;
    }
});
exports.AboutControl = AboutControl;

var initializeAboutPage = function(element) {
    element.html(can.view('aboutTemplate', {}));

    $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
}
