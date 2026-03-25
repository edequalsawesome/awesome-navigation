<?php
/**
 * Pattern: Frosted Canvas
 *
 * Site title, tagline, and navigation on a frosted glass background.
 */

register_block_pattern(
	'awesome-navigation/frosted-canvas',
	array(
		'title'      => __( 'Frosted Canvas', 'awesome-navigation' ),
		'categories' => array( 'navigation' ),
		'blockTypes' => array( 'core/template-part/navigation-overlay' ),
		'content'    => '<!-- wp:group {"className":"is-style-frosted-glass overlay-canvas","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"},"style":{"dimensions":{"minHeight":"100vh"},"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-group is-style-frosted-glass overlay-canvas" style="min-height:100vh;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"right"}} -->
<div class="wp-block-group">
<!-- wp:navigation-overlay-close /-->
</div>
<!-- /wp:group -->

<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-group">
<!-- wp:site-title {"textAlign":"center","style":{"typography":{"fontSize":"clamp(1.5rem, 4vw, 2.5rem)","fontWeight":"700"}}} /-->
<!-- wp:site-tagline {"textAlign":"center","style":{"typography":{"fontSize":"clamp(0.875rem, 2vw, 1.125rem)"}}} /-->
</div>
<!-- /wp:group -->

<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"typography":{"fontSize":"clamp(1.125rem, 3vw, 1.75rem)"},"spacing":{"blockGap":"var:preset|spacing|30"}},"className":"overlay-canvas-nav"} /-->

</div>
<!-- /wp:group -->',
	)
);
