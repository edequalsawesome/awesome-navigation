import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit( { attributes, setAttributes } ) {
	const { iconSize, label } = attributes;
	const blockProps = useBlockProps( {
		className: 'awesome-nav-toggle',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'awesome-navigation' ) }>
					<RangeControl
						label={ __( 'Icon size', 'awesome-navigation' ) }
						value={ iconSize }
						onChange={ ( value ) =>
							setAttributes( { iconSize: value } )
						}
						min={ 14 }
						max={ 32 }
					/>
					<TextControl
						label={ __(
							'Button label (for screen readers)',
							'awesome-navigation'
						) }
						value={ label }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						help={ __(
							'Screen reader text for the button.',
							'awesome-navigation'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<button { ...blockProps } type="button" aria-label={ label }>
				<svg
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width={ iconSize }
					height={ iconSize }
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="4" x2="20" y1="12" y2="12" />
					<line x1="4" x2="20" y1="6" y2="6" />
					<line x1="4" x2="20" y1="18" y2="18" />
				</svg>
			</button>
		</>
	);
}
