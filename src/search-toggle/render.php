<?php
/**
 * Search Toggle block - Server-side render.
 *
 * Renders two parts:
 * 1. A toggle button (in the topbar) that swaps between search icon and X.
 * 2. A search form (rendered after the button) that the pill's CSS will
 *    place inside the expandable content area when search is open.
 *
 * The pill's is-search-open class drives everything — the expandable area
 * opens (same animation as the menu), the icon swaps, and the search input
 * auto-focuses.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for this block).
 * @param WP_Block $block      Block instance.
 */

$icon_size   = absint( $attributes['iconSize'] ?? 24 );
$label       = $attributes['label'] ?? __( 'Search', 'awesome-navigation' );
// TODO: Move search panel rendering here so $placeholder is used.
// Currently the panel is injected by awesome-navigation.php with hardcoded i18n strings.
$placeholder = $attributes['placeholder'] ?? __( 'Search...', 'awesome-navigation' );

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'                          => 'awesome-nav-search-btn',
	'type'                           => 'button',
	'aria-label'                     => esc_attr( $label ),
	'aria-expanded'                  => 'false',
	'aria-controls'                  => 'awesome-nav-search-panel',
	'data-wp-on--click'              => 'actions.toggleSearch',
	'data-wp-bind--aria-expanded'    => 'state.isSearchOpen',
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


printf( '<button %1$s>%2$s%3$s</button>', $wrapper_attributes, $search_svg, $close_svg );
