import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit( { attributes, setAttributes } ) {
	const { iconSize, label, placeholder } = attributes;
	const blockProps = useBlockProps( {
		className: 'awesome-nav-search-btn',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Search Settings', 'awesome-navigation' ) }
				>
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
							'Placeholder text',
							'awesome-navigation'
						) }
						value={ placeholder }
						onChange={ ( value ) =>
							setAttributes( { placeholder: value } )
						}
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
							'Screen reader text for the search button.',
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
						<circle cx="11" cy="11" r="8" />
						<line x1="21" x2="16.65" y1="21" y2="16.65" />
					</svg>
			</button>
		</>
	);
}
