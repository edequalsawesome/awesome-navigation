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

$icon_size   = absint( $attributes['iconSize'] ?? 20 );
$label       = $attributes['label'] ?? __( 'Search', 'awesome-navigation' );
$placeholder = $attributes['placeholder'] ?? __( 'Search...', 'awesome-navigation' );

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'awesome-nav-search-wrapper',
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

// Submit icon (arrow right) for the search form button.
$submit_svg = sprintf(
	'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%1$d" height="%1$d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
	$icon_size
);

printf(
	'<div %1$s>
		<button
			class="awesome-nav-search-btn"
			type="button"
			aria-label="%2$s"
			data-wp-on--click="actions.toggleSearch"
		>%3$s%4$s</button>
	</div>',
	$wrapper_attributes,
	esc_attr( $label ),
	$search_svg,
	$close_svg
);
