<?php
/**
 * Search Toggle block - Server-side render.
 *
 * Renders the toggle button. The search panel itself is injected as a direct
 * child of the pill by the render_block filter in the main plugin file
 * (awesome_nav_inject_interactivity), using the attributes stored in the
 * global below — that keeps the panel's DOM position correct (direct child
 * of the pill) regardless of where the button sits in the topbar.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for this block).
 * @param WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

// Clamp to the editor's RangeControl bounds (14-32) — raw post content or
// REST writes bypass the editor constraint.
$icon_size = min( 32, max( 14, absint( $attributes['iconSize'] ?? 24 ) ) );

// block.json defaults are '' so these fallbacks are translatable (block.json
// attribute defaults are never run through i18n).
$label       = ( $attributes['label'] ?? '' ) ?: __( 'Search', 'awesome-navigation' );
$placeholder = ( $attributes['placeholder'] ?? '' ) ?: __( 'Search...', 'awesome-navigation' );

// No manual esc_attr() here — get_block_wrapper_attributes() escapes every
// value internally; pre-escaping double-encodes entities.
// One ID per rendered toggle. A page may hold more than one pill, and every
// toggle used to point aria-controls at the same 'awesome-nav-search-panel',
// so the second pill's button described the first pill's hidden panel.
//
// wp_unique_id() rather than a static counter: block templates are require'd
// into a shared closure, where `static` does not reliably increment per render.
// The same value is handed to the render_block filter below, which stamps it
// on the panel it injects, keeping the pair in sync.
$panel_id = wp_unique_id( 'awesome-nav-search-panel-' );

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'                       => 'awesome-nav-search-btn',
	'type'                        => 'button',
	'aria-label'                  => $label,
	'aria-expanded'               => 'false',
	'aria-controls'               => $panel_id,
	'data-wp-on--click'           => 'actions.toggleSearch',
	'data-wp-bind--aria-expanded' => 'context.isSearchOpen',
) );

// Search icon (magnifying glass).
$search_svg = sprintf(
	'<svg class="awesome-nav-search-icon awesome-nav-search-icon--search" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%1$d" height="%1$d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>',
	$icon_size
);

// Close icon (X).
$close_svg = sprintf(
	'<svg class="awesome-nav-search-icon awesome-nav-search-icon--close" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%1$d" height="%1$d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>',
	$icon_size
);

// Store attributes for the main plugin's render_block filter to pick up.
global $awesome_nav_search_attrs;
$awesome_nav_search_attrs = array(
	'panel_id'     => $panel_id,
	'placeholder'  => $placeholder,
	'label'        => $label,
	'submit_label' => __( 'Submit search', 'awesome-navigation' ),
	'action'       => home_url( '/' ),
);

printf( '<button %1$s>%2$s%3$s</button>', $wrapper_attributes, $search_svg, $close_svg );
