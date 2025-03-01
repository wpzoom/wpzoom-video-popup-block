<?php
/**
 * Register the Video Cover block
 */
function wpzoom_register_video_cover_block() {
    register_block_type( __DIR__ );
}
add_action( 'init', 'wpzoom_register_video_cover_block' ); 