<?php
/**
 * Menu Toggle block - Server-side render.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for this block).
 * @param WP_Block $block      Block instance.
 */

$icon_size = $attributes['iconSize'] ?? 20;
$label     = $attributes['label'] ?? __( 'Menu', 'awesome-navigation' );

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'                       => 'awesome-nav-toggle',
	'type'                        => 'button',
	'aria-label'                  => esc_attr( $label ),
	'aria-expanded'               => 'false',
	'data-wp-on--click'           => 'actions.toggle',
	'data-wp-bind--aria-expanded' => 'state.isOpen',
) );

// FIX #10 (a11y): aria-hidden on decorative SVG.
$svg = sprintf(
	'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%1$d" height="%1$d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>',
	absint( $icon_size )
);

printf( '<button %1$s>%2$s</button>', $wrapper_attributes, $svg );
