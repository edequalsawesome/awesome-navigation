<?php
/**
 * Plugin Name: Awesome Navigation
 * Description: A floating navigation pill that expands to reveal your menu. Pushes content down at the top, floats over when scrolled. Includes frosted glass overlay patterns for WP 7.0 Navigation Overlays.
 * Version: 0.1.0
 * Requires at least: 7.0
 * Requires PHP: 8.0
 * Author: eD! Thomas
 * Author URL: https://edequalsaweso.me/development
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: awesome-navigation
 */

defined( 'ABSPATH' ) || exit;

define( 'AWESOME_NAV_VERSION', '0.1.0' );
define( 'AWESOME_NAV_DIR', plugin_dir_path( __FILE__ ) );
define( 'AWESOME_NAV_URL', plugin_dir_url( __FILE__ ) );

/**
 * On activation, create a default navigation overlay template part
 * pre-populated with a two-pane menu layout. Users can customize it
 * in the Site Editor.
 */
function awesome_nav_activate() {
	// Check if the template part already exists.
	$existing = get_posts( array(
		'post_type'   => 'wp_template_part',
		'post_status' => 'any',
		'name'        => 'awesome-nav-menu',
		'numberposts' => 1,
	) );

	if ( ! empty( $existing ) ) {
		return;
	}

	// Default two-pane layout: tagline + navigation on left, content on right.
	$default_content = '<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"},"style":{"spacing":{"blockGap":"var:preset|spacing|30","padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|40","left":"var:preset|spacing|30"}}}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--30)">

<!-- wp:site-tagline {"textAlign":"center","style":{"typography":{"fontSize":"0.875rem"},"elements":{"link":{"color":{"text":"var:preset|color|contrast"}}}},"textColor":"contrast-2"} /-->

<!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}}} -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.1em","fontSize":"0.75rem"}},"textColor":"contrast-2"} -->
<h6 class="wp-block-heading has-contrast-2-color has-text-color" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase">Menu</h6>
<!-- /wp:heading -->

<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} /-->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.1em","fontSize":"0.75rem"}},"textColor":"contrast-2"} -->
<h6 class="wp-block-heading has-contrast-2-color has-text-color" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase">Latest</h6>
<!-- /wp:heading -->

<!-- wp:latest-posts {"postsToShow":3,"displayPostDate":true} /-->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->';

	// FIX #5: Use wp_insert_post return value directly instead of re-querying.
	$post_id = wp_insert_post( array(
		'post_type'    => 'wp_template_part',
		'post_name'    => 'awesome-nav-menu',
		'post_title'   => __( 'Navigation Pill Menu', 'awesome-navigation' ),
		'post_content' => $default_content,
		'post_status'  => 'publish',
	), true );

	if ( is_wp_error( $post_id ) ) {
		return;
	}

	// Set taxonomy terms directly — wp_insert_post doesn't handle these reliably.
	wp_set_object_terms( $post_id, WP_TEMPLATE_PART_AREA_NAVIGATION_OVERLAY, 'wp_template_part_area' );
	wp_set_object_terms( $post_id, get_stylesheet(), 'wp_theme' );
}
register_activation_hook( __FILE__, 'awesome_nav_activate' );

/**
 * Register the Menu Toggle block and block styles.
 */
function awesome_nav_register_blocks() {
	register_block_type( AWESOME_NAV_DIR . 'build/menu-toggle' );
	register_block_type( AWESOME_NAV_DIR . 'build/search-toggle' );

	register_block_style( 'core/group', array(
		'name'  => 'frosted-glass',
		'label' => __( 'Frosted Glass', 'awesome-navigation' ),
	) );

	register_block_style( 'core/navigation', array(
		'name'  => 'outlined',
		'label' => __( 'Outlined', 'awesome-navigation' ),
	) );

	// Enqueue pill extension editor script (template part selector on core/group).
	$pill_ext_asset = AWESOME_NAV_DIR . 'build/pill-extension/index.asset.php';
	if ( file_exists( $pill_ext_asset ) ) {
		$asset = require $pill_ext_asset;
		wp_register_script(
			'awesome-navigation-pill-extension',
			AWESOME_NAV_URL . 'build/pill-extension/index.js',
			$asset['dependencies'],
			$asset['version']
		);
	}
}
add_action( 'init', 'awesome_nav_register_blocks' );

/**
 * Enqueue the pill extension script in the block editor.
 */
function awesome_nav_enqueue_pill_extension() {
	wp_enqueue_script( 'awesome-navigation-pill-extension' );
}
add_action( 'enqueue_block_editor_assets', 'awesome_nav_enqueue_pill_extension' );

/**
 * Add background color support to core/navigation-link and core/navigation-submenu.
 */
function awesome_nav_extend_nav_link_supports( $args, $block_type ) {
	$extend_blocks = array( 'core/navigation-link', 'core/navigation-submenu', 'core/page-list-item', 'core/home-link' );

	if ( ! in_array( $block_type, $extend_blocks, true ) ) {
		return $args;
	}

	if ( ! isset( $args['supports']['color'] ) ) {
		$args['supports']['color'] = array();
	}

	$args['supports']['color']['background'] = true;

	return $args;
}
add_filter( 'register_block_type_args', 'awesome_nav_extend_nav_link_supports', 10, 2 );

/**
 * Register all patterns from the patterns/ directory.
 */
function awesome_nav_register_patterns() {
	register_block_pattern_category( 'awesome-navigation', array(
		'label' => __( 'Awesome Navigation', 'awesome-navigation' ),
	) );

	// FIX #6: require_once for idempotency.
	$pattern_files = glob( AWESOME_NAV_DIR . 'patterns/*.php' );
	if ( $pattern_files ) {
		foreach ( $pattern_files as $file ) {
			require_once $file;
		}
	}
}
add_action( 'init', 'awesome_nav_register_patterns' );

/**
 * Conditionally enqueue nav pill frontend styles.
 * Only loads when the pill markup is actually present on the page.
 */
function awesome_nav_maybe_enqueue_styles( $block_content, $block ) {
	if ( 'core/group' !== $block['blockName'] ) {
		return $block_content;
	}

	$class_name = $block['attrs']['className'] ?? '';

	if ( str_contains( $class_name, 'awesome-nav-pill' ) || str_contains( $class_name, 'awesome-nav-header' ) ) {
		wp_enqueue_style(
			'awesome-navigation-pill',
			AWESOME_NAV_URL . 'assets/nav-pill.css',
			array(),
			AWESOME_NAV_VERSION
		);
	}

	if ( str_contains( $class_name, 'overlay-canvas' ) ) {
		wp_enqueue_style(
			'awesome-navigation-overlay',
			AWESOME_NAV_URL . 'assets/awesome-navigation.css',
			array(),
			AWESOME_NAV_VERSION
		);
	}

	return $block_content;
}
add_filter( 'render_block', 'awesome_nav_maybe_enqueue_styles', 10, 2 );

/**
 * Localize editor data for the template part selector.
 * Uses wp_add_inline_script for proper CSP nonce support.
 * Adapted from Ollie Menu Designer (GPL-3.0-or-later) by OllieWP Team.
 */
function awesome_nav_localize_editor_data() {
	$data = wp_json_encode( array(
		'adminUrl' => admin_url(),
		'siteUrl'  => home_url(),
	) );
	wp_add_inline_script(
		'awesome-navigation-pill-extension',
		"window.awesomeNavData = {$data};",
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'awesome_nav_localize_editor_data' );

/**
 * Enqueue editor styles via enqueue_block_assets so they load inside
 * the iframed editor (WP 6.9+). Only loads in admin context.
 */
function awesome_nav_enqueue_editor_assets() {
	if ( ! is_admin() ) {
		return;
	}

	wp_enqueue_style(
		'awesome-navigation-pill-editor',
		AWESOME_NAV_URL . 'assets/nav-pill.css',
		array(),
		AWESOME_NAV_VERSION
	);

	wp_enqueue_style(
		'awesome-navigation-overlay-editor',
		AWESOME_NAV_URL . 'assets/awesome-navigation.css',
		array(),
		AWESOME_NAV_VERSION
	);
}
add_action( 'enqueue_block_assets', 'awesome_nav_enqueue_editor_assets' );

/**
 * Inject Interactivity API directives onto the nav pill markup.
 * Also adds aria-hidden on the content area for a11y.
 */
function awesome_nav_inject_interactivity( $block_content, $block ) {
	if ( 'core/group' !== $block['blockName'] ) {
		return $block_content;
	}

	$class_name = $block['attrs']['className'] ?? '';

	if ( str_contains( $class_name, 'awesome-nav-pill' ) ) {
		wp_enqueue_script_module(
			'awesome-navigation-nav-pill',
			AWESOME_NAV_URL . 'assets/nav-pill.js',
			array( '@wordpress/interactivity' ),
			AWESOME_NAV_VERSION
		);

		$processor = new WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag( array( 'class_name' => 'awesome-nav-pill' ) ) ) {
			$processor->set_attribute( 'data-wp-interactive', 'awesome-navigation' );
			$processor->set_attribute( 'data-wp-context', '{"isOpen":false}' );
			$processor->set_attribute( 'data-wp-init', 'callbacks.init' );
			$processor->set_attribute( 'data-wp-on--keydown', 'actions.handleKeydown' );
			$processor->set_attribute( 'data-wp-class--is-open', 'state.isOpen' );
			$processor->set_attribute( 'data-wp-class--is-search-open', 'state.isSearchOpen' );
			$block_content = $processor->get_updated_html();
		}

		// FIX #3 (a11y): Add aria-hidden to the content area when closed.
		$processor2 = new WP_HTML_Tag_Processor( $block_content );
		if ( $processor2->next_tag( array( 'class_name' => 'awesome-nav-content' ) ) ) {
			$processor2->set_attribute( 'aria-hidden', 'true' );
			$processor2->set_attribute( 'data-wp-bind--aria-hidden', '!state.isOpen' );
			$block_content = $processor2->get_updated_html();
		}

		// Inject search form panel into the pill (after the content area).
		// Only shows when is-search-open is active — uses same grid expand animation.
		if ( str_contains( $block_content, 'awesome-nav-search-btn' ) ) {
			$search_placeholder = esc_attr__( 'Search...', 'awesome-navigation' );
			$search_label       = esc_attr__( 'Search', 'awesome-navigation' );
			$search_action      = esc_url( home_url( '/' ) );

			$search_submit_label = esc_attr__( 'Submit search', 'awesome-navigation' );

			$search_panel = '<div id="awesome-nav-search-panel" class="awesome-nav-search-panel" aria-hidden="true" data-wp-bind--aria-hidden="!state.isSearchOpen">'
				. '<form class="awesome-nav-search-form" role="search" action="' . $search_action . '" method="get">'
				. '<input class="awesome-nav-search-input" type="search" name="s" placeholder="' . $search_placeholder . '" aria-label="' . $search_label . '" data-wp-on--keydown="actions.handleSearchKeydown" />'
				. '<button class="awesome-nav-search-submit" type="submit" aria-label="' . $search_submit_label . '">'
				. '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
				. '</button>'
				. '</form>'
				. '</div>';

			// Insert the panel before the pill's closing </div>.
			// Uses strrpos instead of regex — O(n) scan, no backtracking.
			$last_div_pos = strrpos( $block_content, '</div>' );
			if ( false !== $last_div_pos ) {
				$block_content = substr_replace(
					$block_content,
					$search_panel . '</div>',
					$last_div_pos,
					strlen( '</div>' )
				);
			}
		}
	}

	return $block_content;
}
add_filter( 'render_block', 'awesome_nav_inject_interactivity', 10, 2 );

/**
 * Stack-based template part slug override.
 *
 * Uses a stack instead of a single global so that multiple pills on the
 * same page each get their own template part. The pill's render_block
 * filter (priority 10) fires AFTER inner blocks have rendered, so we
 * use pre_render_block (which fires BEFORE inner blocks) to push the
 * slug onto the stack, and render_block to pop it after the pill is done.
 */
function &awesome_nav_template_slug_stack() {
	static $stack = array();
	return $stack;
}

/**
 * Before a pill renders its inner blocks, push its template slug onto the stack.
 */
function awesome_nav_push_template_slug( $pre_render, $parsed_block ) {
	if ( 'core/group' !== $parsed_block['blockName'] ) {
		return $pre_render;
	}

	$class_name = $parsed_block['attrs']['className'] ?? '';
	if ( ! str_contains( $class_name, 'awesome-nav-pill' ) ) {
		return $pre_render;
	}

	$slug  = $parsed_block['attrs']['menuTemplatePart'] ?? '';
	$stack = &awesome_nav_template_slug_stack();
	$stack[] = $slug;

	return $pre_render; // Don't short-circuit — let WordPress render normally.
}
add_filter( 'pre_render_block', 'awesome_nav_push_template_slug', 10, 2 );

/**
 * After a pill finishes rendering, pop its slug off the stack.
 */
function awesome_nav_pop_template_slug( $block_content, $block ) {
	if ( 'core/group' !== $block['blockName'] ) {
		return $block_content;
	}

	$class_name = $block['attrs']['className'] ?? '';
	if ( ! str_contains( $class_name, 'awesome-nav-pill' ) ) {
		return $block_content;
	}

	$stack = &awesome_nav_template_slug_stack();
	array_pop( $stack );

	return $block_content;
}
add_filter( 'render_block', 'awesome_nav_pop_template_slug', 20, 2 );

/**
 * Override the template part slug when rendering inside a pill.
 *
 * Reads the current slug from the top of the stack. If set, swaps the
 * default "awesome-nav-menu" template part with the user-selected one.
 * The slug is escaped via esc_attr() before being passed to do_blocks().
 */
function awesome_nav_swap_template_part( $block_content, $block ) {
	if ( 'core/template-part' !== $block['blockName'] ) {
		return $block_content;
	}

	$current_slug = $block['attrs']['slug'] ?? '';
	if ( 'awesome-nav-menu' !== $current_slug ) {
		return $block_content;
	}

	$stack = &awesome_nav_template_slug_stack();
	if ( empty( $stack ) ) {
		return $block_content;
	}

	$override = end( $stack );
	if ( ! $override || $override === $current_slug ) {
		return $block_content;
	}

	// Render the overridden template part (slug is escaped for the block comment).
	$override_block = '<!-- wp:template-part {"slug":"' . esc_attr( $override ) . '","area":"navigation-overlay","tagName":"div"} /-->';
	return do_blocks( $override_block );
}
add_filter( 'render_block', 'awesome_nav_swap_template_part', 5, 2 );

/**
 * Enqueue the overlay submenu takeover script when a Navigation block
 * is inside an overlay canvas pattern.
 */
function awesome_nav_enqueue_overlay_script( $block_content, $block ) {
	if ( 'core/navigation' !== $block['blockName'] ) {
		return $block_content;
	}

	$class_name = $block['attrs']['className'] ?? '';
	if ( ! str_contains( $class_name, 'overlay-canvas-nav' ) ) {
		return $block_content;
	}

	// wp_enqueue_script_module is idempotent — no static guard needed.
	wp_enqueue_script_module(
		'awesome-navigation-submenu-nav',
		AWESOME_NAV_URL . 'assets/submenu-takeover.js',
		array( '@wordpress/interactivity' ),
		AWESOME_NAV_VERSION
	);

	return $block_content;
}
add_filter( 'render_block', 'awesome_nav_enqueue_overlay_script', 10, 2 );

/**
 * Validate a CSS color value.
 * Accepts: hex (#rgb, #rrggbb, #rrggbbaa), rgb(), rgba(), hsl(), hsla().
 */
function awesome_nav_sanitize_css_color( $color ) {
	$color = trim( $color );

	// Hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa (exact valid lengths only).
	if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $color ) ) {
		return $color;
	}

	// rgb/rgba/hsl/hsla functional notation — allow digits, commas, spaces,
	// dots, percentages, slashes (for modern syntax), and specific keywords
	// (from, none, deg, turn, grad, rad). Blocks dangerous CSS keywords.
	if ( preg_match( '/^(rgba?|hsla?)\([0-9\s,.\/%\-]+(from|none|deg|turn|grad|rad|[0-9\s,.\/%\-])*\)$/i', $color ) ) {
		return $color;
	}

	return '';
}

/**
 * Convert nav link background colors into a CSS custom property.
 */
function awesome_nav_convert_link_bg_to_variable( $block_content, $block ) {
	$target_blocks = array( 'core/navigation-link', 'core/navigation-submenu', 'core/page-list-item', 'core/home-link' );

	if ( ! in_array( $block['blockName'], $target_blocks, true ) ) {
		return $block_content;
	}

	$bg_color = $block['attrs']['style']['color']['background'] ?? '';
	$preset   = $block['attrs']['backgroundColor'] ?? '';

	if ( ! $bg_color && ! $preset ) {
		return $block_content;
	}

	// FIX #1/#2: Sanitize color values before injecting into CSS.
	if ( $preset ) {
		$color_value = 'var(--wp--preset--color--' . sanitize_key( $preset ) . ')';
	} else {
		$color_value = awesome_nav_sanitize_css_color( $bg_color );
		if ( ! $color_value ) {
			return $block_content;
		}
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( $processor->next_tag( 'li' ) ) {
		$style = $processor->get_attribute( 'style' ) ?? '';

		// FIX #11: Remove both background-color AND background shorthand (case-insensitive).
		$style = preg_replace( '/background(-color)?:\s*[^;]+;?\s*/i', '', $style );

		$style = "--awesome-nav-item-color: {$color_value}; background: transparent !important; " . trim( $style );

		$processor->set_attribute( 'style', trim( $style ) );
		$block_content = $processor->get_updated_html();
	}

	return $block_content;
}
add_filter( 'render_block', 'awesome_nav_convert_link_bg_to_variable', 10, 2 );
