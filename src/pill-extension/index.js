/**
 * Awesome Navigation - Pill Extension
 *
 * Adds a "Menu Content" InspectorControls panel to any core/group block
 * that has the "awesome-nav-pill" class. Lets users pick which navigation
 * overlay template part to render inside the pill's expandable area.
 *
 * Template part selector pattern adapted from Ollie Menu Designer
 * (GPL-3.0-or-later) by OllieWP Team — https://olliewp.com
 */

import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ComboboxControl,
	Button,
	Spinner,
	HStack,
	Spacer,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { useEntityRecords } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { pencil, plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Add menuTemplatePart attribute to core/group blocks.
 * Only used when the group has the awesome-nav-pill class.
 */
const addPillAttributes = ( settings, name ) => {
	if ( name !== 'core/group' ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			menuTemplatePart: {
				type: 'string',
				default: '',
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'awesome-navigation/add-pill-attributes',
	addPillAttributes
);

/**
 * Higher-order component that injects the template part selector
 * into the inspector controls for awesome-nav-pill Group blocks.
 */
const withPillControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes, setAttributes } = props;

		// Only target core/group with our pill class.
		if ( name !== 'core/group' ) {
			return <BlockEdit { ...props } />;
		}

		const className = attributes.className || '';
		if ( ! className.includes( 'awesome-nav-pill' ) ) {
			return <BlockEdit { ...props } />;
		}

		const { menuTemplatePart } = attributes;

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __(
							'Menu Content',
							'awesome-navigation'
						) }
						initialOpen={ true }
					>
						<TemplatePartSelector
							value={ menuTemplatePart }
							onChange={ ( value ) =>
								setAttributes( {
									menuTemplatePart: value,
								} )
							}
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withPillControls' );

addFilter(
	'editor.BlockEdit',
	'awesome-navigation/with-pill-controls',
	withPillControls
);

/**
 * Template Part Selector component.
 * Adapted from Ollie Menu Designer (GPL-3.0-or-later) by OllieWP Team.
 */
function TemplatePartSelector( { value, onChange } ) {
	const [ isCreating, setIsCreating ] = useState( false );

	const { saveEntityRecord } = useDispatch( 'core' );

	const { currentTheme, adminUrl } = useSelect( ( select ) => {
		const theme = select( 'core' ).getCurrentTheme();
		return {
			currentTheme: theme?.stylesheet,
			adminUrl:
				window.awesomeNavData?.adminUrl ||
				window.location.origin + '/wp-admin/',
		};
	}, [] );

	const { hasResolved, records } = useEntityRecords(
		'postType',
		'wp_template_part',
		{ per_page: -1 }
	);

	const templateOptions =
		hasResolved && records
			? records
					.filter(
						( item ) => item.area === 'navigation-overlay'
					)
					.map( ( item ) => ( {
						label: decodeEntities( item.title.rendered ),
						value: item.slug,
					} ) )
			: [];

	const hasTemplates = templateOptions.length > 0;
	const isValidSelection =
		! value ||
		templateOptions.some( ( option ) => option.value === value );

	const createTemplate = async () => {
		if ( isCreating ) {
			return;
		}
		setIsCreating( true );

		try {
			const baseSlug = 'awesome-nav-menu';
			const existingCount =
				records?.filter(
					( t ) =>
						t.area === 'navigation-overlay' &&
						( t.slug === baseSlug ||
							t.slug.startsWith( `${ baseSlug }-` ) )
				).length || 0;

			let slug = baseSlug;
			if ( existingCount > 0 ) {
				let counter = existingCount;
				do {
					counter++;
					slug = `${ baseSlug }-${ counter }`;
				} while (
					records?.find(
						( t ) =>
							t.slug === slug &&
							t.area === 'navigation-overlay'
					)
				);
			}

			const title =
				existingCount > 0
					? `${ __(
							'Navigation Pill Menu',
							'awesome-navigation'
					  ) } ${ existingCount + 1 }`
					: __( 'Navigation Pill Menu', 'awesome-navigation' );

			const newTemplate = await saveEntityRecord(
				'postType',
				'wp_template_part',
				{
					slug,
					theme: currentTheme || 'theme',
					type: 'wp_template_part',
					area: 'navigation-overlay',
					title: { raw: title, rendered: title },
					content: '',
					status: 'publish',
				}
			);

			if ( newTemplate?.id ) {
				onChange( newTemplate.slug );

				setTimeout( () => {
					const editUrl = `${ adminUrl }site-editor.php?p=%2Fwp_template_part%2F${ encodeURIComponent(
						currentTheme || 'theme'
					) }%2F%2F${ encodeURIComponent(
						slug
					) }&canvas=edit`;
					window.open( editUrl, '_blank' );
				}, 500 );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to create template part:', error );
		} finally {
			setIsCreating( false );
		}
	};

	if ( ! hasResolved ) {
		return <Spinner />;
	}

	return (
		<>
			<ComboboxControl
				label={ __( 'Menu template', 'awesome-navigation' ) }
				value={ value }
				options={ templateOptions }
				onChange={ onChange }
				help={
					hasTemplates
						? __(
								'Select a navigation overlay template part to display when the menu opens.',
								'awesome-navigation'
						  )
						: __(
								'No navigation overlay templates found. Create one to get started.',
								'awesome-navigation'
						  )
				}
			/>

			<Spacer marginTop={ 4 } />

			<HStack spacing={ 3 }>
				<Button
					variant="secondary"
					icon={ plus }
					onClick={ createTemplate }
					disabled={ isCreating }
				>
					{ isCreating
						? __( 'Creating...', 'awesome-navigation' )
						: __( 'Create New', 'awesome-navigation' ) }
				</Button>

				{ value && isValidSelection && (
					<Button
						variant="tertiary"
						icon={ pencil }
						href={ `${ adminUrl }site-editor.php?p=%2Fwp_template_part%2F${ encodeURIComponent(
							currentTheme || ''
						) }%2F%2F${ encodeURIComponent(
							value
						) }&canvas=edit` }
						target="_blank"
					>
						{ __( 'Edit', 'awesome-navigation' ) }
					</Button>
				) }
			</HStack>

			<Spacer marginTop={ 4 } />
		</>
	);
}
