<?php
/**
 * Search Toggle block - Server-side render.
 *
 * Renders the toggle button AND the search panel. The button goes in the
 * topbar (wherever the block is placed). The search panel is positioned
 * by CSS to appear in the pill's expandable area when is-search-open is active.
 *
 * This keeps the block self-contained — no external PHP injection needed.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for this block).
 * @param WP_Block $block      Block instance.
 */

$icon_size   = absint( $attributes['iconSize'] ?? 24 );
$label       = $attributes['label'] ?? __( 'Search', 'awesome-navigation' );
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

// Search panel — positioned by CSS in the pill's expandable area.
$submit_label = esc_attr__( 'Submit search', 'awesome-navigation' );
$search_panel = sprintf(
	'<div id="awesome-nav-search-panel" class="awesome-nav-search-panel" aria-hidden="true" data-wp-bind--aria-hidden="!state.isSearchOpen">'
	. '<form class="awesome-nav-search-form" role="search" action="%1$s" method="get">'
	. '<input class="awesome-nav-search-input" type="search" name="s" placeholder="%2$s" aria-label="%3$s" data-wp-on--keydown="actions.handleSearchKeydown" />'
	. '<button class="awesome-nav-search-submit" type="submit" aria-label="%4$s">'
	. '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
	. '</button>'
	. '</form>'
	. '</div>',
	esc_url( home_url( '/' ) ),
	esc_attr( $placeholder ),
	esc_attr( $label ),
	$submit_label
);

// Output: button only. The search panel is injected as a sibling of the
// pill's content area by a render_block filter on awesome-navigation/search-toggle
// in the main plugin file. This ensures correct DOM position (direct child of pill)
// while keeping attributes accessible.
//
// Store attributes for the main plugin's render_block filter to pick up.
global $awesome_nav_search_attrs;
$awesome_nav_search_attrs = array(
	'placeholder'  => $placeholder,
	'label'        => $label,
	'submit_label' => __( 'Submit search', 'awesome-navigation' ),
	'action'       => home_url( '/' ),
);

printf( '<button %1$s>%2$s%3$s</button>', $wrapper_attributes, $search_svg, $close_svg );
