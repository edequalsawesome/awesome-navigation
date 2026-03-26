<?php
/**
 * Pattern: Awesome Navigation Pill
 *
 * A floating navigation pill with expand/collapse behavior.
 * Pushes content down at the top of the page, floats over when scrolled.
 *
 * The expandable area uses a navigation-overlay template part, so
 * users can design its content (mega menu, two-pane layout, etc.)
 * in the Site Editor. Any of the Frosted Canvas overlay patterns
 * can be used as the content design.
 */

register_block_pattern(
	'awesome-navigation/nav-pill',
	array(
		'title'       => __( 'Navigation Pill', 'awesome-navigation' ),
		'description' => __( 'A floating navigation bar that expands to reveal a customizable menu canvas. Design the expandable content as a navigation overlay in the Site Editor.', 'awesome-navigation' ),
		'categories'  => array( 'header' ),
		'blockTypes'  => array( 'core/template-part/header' ),
		'content'     => '<!-- wp:group {"className":"awesome-nav-header","layout":{"type":"default"},"metadata":{"name":"Navigation Pill Header"}} -->
<div class="wp-block-group awesome-nav-header">

<!-- wp:group {"className":"awesome-nav-pill","layout":{"type":"default"},"metadata":{"name":"Navigation Pill"}} -->
<div class="wp-block-group awesome-nav-pill">

<!-- wp:group {"className":"awesome-nav-topbar","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group awesome-nav-topbar">

<!-- wp:site-logo {"width":32,"className":"awesome-nav-logo"} /-->

<!-- wp:site-title {"style":{"typography":{"fontSize":"1rem","fontWeight":"600"}},"className":"awesome-nav-site-title"} /-->

<!-- wp:awesome-navigation/search-toggle /-->

<!-- wp:awesome-navigation/menu-toggle /-->

</div>
<!-- /wp:group -->

<!-- wp:group {"className":"awesome-nav-content","layout":{"type":"default"},"metadata":{"name":"Expandable Menu Content"},"templateLock":"contentOnly"} -->
<div class="wp-block-group awesome-nav-content">

<!-- wp:group {"className":"awesome-nav-content-inner","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"},"style":{"spacing":{"blockGap":"0"}}} -->
<div class="wp-block-group awesome-nav-content-inner">

<!-- wp:template-part {"slug":"awesome-nav-menu","area":"navigation-overlay","tagName":"div"} /-->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->',
	)
);
