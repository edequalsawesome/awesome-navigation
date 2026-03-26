import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ButtonGroup,
	Button,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Icon definitions — each has a key, label, and SVG children.
 * The "open transform" is applied via CSS when the pill is open.
 */
const ICON_VARIANTS = {
	'three-lines': {
		label: __( 'Three lines', 'awesome-navigation' ),
		paths: (
			<>
				<line x1="4" x2="20" y1="6" y2="6" />
				<line x1="4" x2="20" y1="12" y2="12" />
				<line x1="4" x2="20" y1="18" y2="18" />
			</>
		),
	},
	'two-lines': {
		label: __( 'Two lines', 'awesome-navigation' ),
		paths: (
			<>
				<line x1="4" x2="20" y1="9" y2="9" />
				<line x1="4" x2="20" y1="15" y2="15" />
			</>
		),
	},
	plus: {
		label: __( 'Plus', 'awesome-navigation' ),
		paths: (
			<>
				<line x1="12" x2="12" y1="5" y2="19" />
				<line x1="5" x2="19" y1="12" y2="12" />
			</>
		),
	},
	dots: {
		label: __( 'Dots', 'awesome-navigation' ),
		paths: (
			<>
				<circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
				<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
				<circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
			</>
		),
	},
};

export default function Edit( { attributes, setAttributes } ) {
	const { iconSize, label, iconVariant = 'three-lines' } = attributes;
	const blockProps = useBlockProps( {
		className: 'awesome-nav-toggle',
	} );

	const currentIcon = ICON_VARIANTS[ iconVariant ] || ICON_VARIANTS[ 'three-lines' ];

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Button Settings', 'awesome-navigation' ) }
				>
					<div style={ { marginBottom: '16px' } }>
						<div
							style={ {
								marginBottom: '8px',
								fontSize: '11px',
								fontWeight: 500,
								textTransform: 'uppercase',
							} }
						>
							{ __( 'Icon style', 'awesome-navigation' ) }
						</div>
						<HStack spacing={ 2 } wrap>
							{ Object.entries( ICON_VARIANTS ).map(
								( [ key, variant ] ) => (
									<Button
										key={ key }
										variant={
											iconVariant === key
												? 'primary'
												: 'secondary'
										}
										onClick={ () =>
											setAttributes( {
												iconVariant: key,
											} )
										}
										label={ variant.label }
										showTooltip
										style={ {
											padding: '6px',
											minWidth: '40px',
											height: '40px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										} }
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width={ 20 }
											height={ 20 }
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											{ variant.paths }
										</svg>
									</Button>
								)
							) }
						</HStack>
					</div>
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
					{ currentIcon.paths }
				</svg>
			</button>
		</>
	);
}
