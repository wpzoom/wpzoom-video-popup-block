'use strict';

import magnificPopup from 'magnific-popup';

( function ( $ ) {
	$( function () {
		$( '.wpzoom-video-popup-block[href]' ).each(function() {
			const $this = $(this);
			const popupWidth = $this.data('popup-width') || '900px';

			$this.magnificPopup( {
				type: 'iframe',
				mainClass: 'wpzoom-video-popup-block-modal',
				callbacks: {
					open: function() {
						// Set width on mfp-content
						this.contentContainer.css('max-width', popupWidth);
					}
				},
				iframe: {
					patterns: {
						youtube: {
							index: 'youtu', 
							id: function ( url ) {
								const m = url.match( /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/ );
								if ( ! m || ! m[1] ) return null;

								let start = 0;

								if ( url.indexOf( 't=' ) != -1 ) {
									const split = url.split( 't=' );
									const hms = split[1].replace( 'h', ':' ).replace( 'm', ':' ).replace( 's', '' );
									const a = hms.split( ':' );

									if ( a.length == 1 ) {
										start = a[0];
									} else if ( a.length == 2 ) {
										start = (+a[0]) * 60 + (+a[1]);
									} else if ( a.length == 3 ) {
										start = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
									}
								}

								let suffix = '?autoplay=1';

								if ( start > 0 ) {
									suffix = `?start=${start}&autoplay=1`;
								}

								return m[1] + suffix;
							},
							src: '//www.youtube.com/embed/%id%'
						},
						vimeo: {
							index: 'vimeo.com/', 
							id: function ( url ) {
								var m = url.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:[a-z]*\/)*([0-9]{6,11})(?:\/([a-zA-Z0-9]+))?/);
								if (!m || !m[1]) return null;
								var videoId = m[1];
								var hash = m[2] ? 'h=' + m[2] : '';
								var params = hash ? '' : '?autoplay=' + 1;
								return hash ? videoId + '?' + hash + params : videoId + params;
							},
							src: '//player.vimeo.com/video/%id%'
						}
					},
					markup: '<div class="mfp-iframe-scaler" style="max-width: ' + popupWidth + ';">' +
							'<div class="mfp-close"></div>' +
							'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
							'</div>'
				}
			} );
		});
	} );
} ( jQuery ) );
