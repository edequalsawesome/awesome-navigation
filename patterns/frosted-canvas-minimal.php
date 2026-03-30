<?php
/**
 * Pattern: Frosted Canvas (Minimal)
 *
 * Navigation and close button only, on a frosted glass background.
 * Requires WP 7.0+ Navigation Overlays.
 */

// Navigation Overlay patterns require WP 7.0+.
if ( ! defined( 'WP_TEMPLATE_PART_AREA_NAVIGATION_OVERLAY' ) ) {
	return;
}

register_block_pattern(
	'awesome-navigation/frosted-canvas-minimal',
	array(
		'title'      => __( 'Frosted Canvas (Minimal)', 'awesome-navigation' ),
		'categories' => array( 'navigation' ),
		'blockTypes' => array( 'core/template-part/navigation-overlay' ),
		'content'    => '<!-- wp:group {"className":"is-style-frosted-glass overlay-canvas","layout":{"type":"flex","orientation":"vertical","justifyContent":"center","verticalAlignment":"center"},"style":{"dimensions":{"minHeight":"100vh"},"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|50"}}} -->
<div class="wp-block-group is-style-frosted-glass overlay-canvas" style="min-height:100vh;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"right"},"style":{"position":{"type":"sticky","top":"0px"}}} -->
<div class="wp-block-group">
<!-- wp:navigation-overlay-close /-->
</div>
<!-- /wp:group -->

<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"typography":{"fontSize":"clamp(1.25rem, 4vw, 2rem)"},"spacing":{"blockGap":"var:preset|spacing|30"}},"className":"overlay-canvas-nav"} /-->

</div>
<!-- /wp:group -->',
	)
);
