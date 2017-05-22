( function( $ ) {
	"use strict";

	var $insert     = $( ".eyecatching_insert" );
	var $wrapper    = $( ".grid12.center-block" ); // container to which the chart and subscription-box is aligned
	var poi_desktop = 1920; // x-coordinate of most significant point on desktop chart
	var poi_mobile  = 824; // x-coordinate of most significant point on mobile chart
	var shown       = false;
	var chart_left;

	var $chart  = $insert.find( ".ei_chart_container" );
	var $mask   = $chart.find( ".ei_chart_mask" );
	var $sub    = $insert.find( ".ei_subscription_container" );
	var $marker = $insert.find( ".ei_marker" );
	var $toggle = $insert.find( ".ei_toggle" );

	var duration_show  = 1000;
	var duration_mask  = 3000;
	var duration_delay = 500;

	// ..user has closed an insert within a week before or
	if ( Cookies.set( "eyecatching_insert" ) === "displayed" ) {
		shown = true;
	}

	// ..region chooser is not yet set or
	if ( Cookies.set( "CioPrefSite" ) === undefined ) {
		shown = true;
	}

	// ..user is coming from a link within a newsletter.
	if ( window.location.href.indexOf( "CIONewsletter" ) > -1 ) {
		shown = true;
	}

	//
	// START REMOVE IN PRODUCTION
	//

	// overwrite conditions for testing
	shown = false;

	//
	// END REMOVE IN PRODUCTION
	//

	// set the chart to align correctly with the marker responsively
	function align_chart() {

		var ww = $( window ).width();
		var offset = ( ww - $wrapper.width() ) / 2;

		$sub.css( "right", offset );

		if ( ww > 736 ) {
			var poi = poi_desktop;
		} else {
			var poi = poi_mobile;
		}

		var chart_offset = ( ww - offset ) - poi;

		$( ".ei_chart" ).css( "left", chart_offset );

		// calculate the subscription box's correct offset
		if ( !$insert.hasClass( "active" ) ) {
			$sub.css( "bottom", -$sub.height() + 48 );
		}

	}

	// run on orientation change and window resize (everywhere but iOS)
	jQuery( window ).on( "orientationchange resize", function( event ) {
		align_chart();
	} );

	// run on orientation change and window resize (iOS)
	window.onorientationchange = function() {
		align_chart();

		// since 100% isn't 100% after orientation change on iOS ...
		if ( $insert.hasClass( "active" ) ) {
			$mask.hide();
		}
	}

	// run once on load
	align_chart();

	// open and close Insert

	// open the insert
	function show_insert() {

		if ( shown ) {
			$insert.addClass( "shown" );
		}

		if ( $( window ).width() <= 736 ) {
			$sub.css( "bottom", 0 );

			if ( !shown ) {
				var timeout = duration_mask + duration_show * 1.25;
			} else {
				var timeout = 0;
			}

			setTimeout( function() {
				if ( $insert.hasClass( "active" ) ) {
					$sub.css( "padding-bottom", 120 + $sub.find( ".ei_subscribe" ).outerHeight() );
				}

			}, timeout );

		}

		if ( !Modernizr.csstransitions ) {

			// jQuery Animation fallbacks if transitions are not available (< IE10)
			$chart.animate( { "bottom":"0px" }, duration_show );
			$sub.animate( { "padding-bottom": "280px" }, duration_show );
			$toggle.addClass( "active" );

			if ( !shown ) {
				$marker.delay( duration_mask + duration_show ).animate( { "height":"100%" }, duration_show, "linear" );
				$mask.animate( { "left":"100%" }, duration_mask, "linear" );
			} else {
				$marker.css( "height", "100%" );
				$mask.css( "left", "100%" );
			}

		} else {
			$insert.addClass( "active" );
		}

		shown = true;
	}

	// close the insert
	function hide_insert() {

		if ( $( window ).width() <= 736 ) {
			$sub.css( "bottom", -$sub.height() + 48 );
			$sub.css( "padding-bottom", 0 );
		}

		if ( !Modernizr.csstransitions ) {

			$toggle.removeClass( "active" );

			// jQuery Animation fallbacks if transitions are not available (< IE10)
			$chart.animate( { "bottom":"-280px" }, duration_show );
			$sub.animate( { "padding-bottom": "0px" }, duration_show );
		} else {
			$insert.removeClass( "active" ).find( ".ei_subscription_container" ).css( "transition-delay", "0s" );
		}
	}

	// show the insert after scrolling down > 500px
	$( window ).on( "scroll", function() {
		if ( ( $( "body" ).scrollTop() > 500 || $( document ).scrollTop() > 500 ) && !shown ) {

			show_insert();
		}
	} );

	// user interaction to close the insert
	$toggle.on( "click", function() {

		if ( $insert.hasClass( "active" ) || $toggle.hasClass( "active" ) ) {
			hide_insert();
		} else {
			show_insert();
		}

		// set Cookie expiring in 1 week preventing repeat display
		Cookies.set( 'eyecatching_insert', 'displayed', { expires: 7, path: '/' } );
	} );

} )( jQuery );
