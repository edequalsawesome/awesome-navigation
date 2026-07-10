<?php
/**
 * Menu Toggle block - Server-side render.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for this block).
 * @param WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

// Clamp to the editor's RangeControl bounds (14-32) — raw post content or
// REST writes bypass the editor constraint.
$icon_size = min( 32, max( 14, absint( $attributes['iconSize'] ?? 20 ) ) );

// block.json default is '' so this fallback is translatable (block.json
// attribute defaults are never run through i18n).
$label = ( $attributes['label'] ?? '' ) ?: __( 'Menu', 'awesome-navigation' );

// Icon SVG paths by variant.
$icon_paths = array(
	'three-lines' => '<line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line>',
	'two-lines'   => '<line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line>',
	'plus'        => '<line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line>',
	'dots'        => '<circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>',
);

// Normalize against the allowlist so unknown values never reach output.
$icon_variant = $attributes['iconVariant'] ?? 'three-lines';
if ( ! isset( $icon_paths[ $icon_variant ] ) ) {
	$icon_variant = 'three-lines';
}

// No manual esc_attr() here — get_block_wrapper_attributes() escapes every
// value internally; pre-escaping double-encodes entities (e.g. "Menu & More").
$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'                       => 'awesome-nav-toggle',
	'type'                        => 'button',
	'aria-label'                  => $label,
	'aria-expanded'               => 'false',
	'data-icon'                   => $icon_variant,
	'data-wp-on--click'           => 'actions.toggle',
	'data-wp-bind--aria-expanded' => 'state.isOpen',
) );

$svg = sprintf(
	'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%1$d" height="%1$d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%2$s</svg>',
	$icon_size,
	$icon_paths[ $icon_variant ]
);

printf( '<button %1$s>%2$s</button>', $wrapper_attributes, $svg );
