/**
 * Awesome Navigation - Nav Pill
 *
 * Interactivity API store for the floating navigation pill.
 * Handles expand/collapse, submenu panel navigation, and focus management.
 *
 * Open/search state lives in per-element context, not global store state: two
 * pills on one page share the store, so a global `isOpen` opened and closed
 * every pill at once.
 */

import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * The pill a directive fired inside. `getElement().ref` is the toggle button
 * for the toggle blocks and the pill itself for pill-level directives, and
 * `closest()` collapses both to the same answer.
 *
 * @param {Element} ref Element the directive is bound to.
 * @return {Element|null} The enclosing pill, if any.
 */
const pillOf = ( ref ) => ref?.closest( '.awesome-nav-pill' );

/**
 * Neither toggle block restricts placement, so one can sit outside a pill with
 * no context provider above it. Falling back to a throwaway object leaves that
 * button dead rather than throwing on every click.
 *
 * @return {Object} The pill's context, or a scratch object.
 */
const pillContext = () => getContext() ?? {};

/**
 * Submenu panels currently open inside a pill, deepest last (a nested panel is
 * a DOM descendant of its parent, so document order sorts them).
 *
 * Derived rather than tracked in a stack: the DOM already holds this truth
 * synchronously and a stack has to be kept honest at five separate sites.
 * Keyed on core's `aria-expanded` rather than our own `.is-submenu-open`,
 * which is applied a frame late and so lags the real state.
 *
 * @param {Element|null} pill The pill to search.
 * @return {Element[]} Open submenu containers.
 */
const openPanels = ( pill ) => [
	...( pill?.querySelectorAll(
		'.open-on-click:has(> [aria-expanded="true"]) > .wp-block-navigation__submenu-container'
	) ?? [] ),
];

/**
 * Core's own toggle for a panel — `open-on-click`, so core/page-list toggles
 * are matched too.
 *
 * @param {Element} panel An open submenu container.
 * @return {Element|null} The expanded toggle that owns it.
 */
const expandedToggle = ( panel ) =>
	panel
		.closest( '.open-on-click' )
		?.querySelector( ':scope > [aria-expanded="true"]' );

const closeTopSubmenu = ( pill ) => {
	const panels = openPanels( pill );
	const current = panels[ panels.length - 1 ];
	if ( ! current ) {
		return;
	}

	current.classList.remove( 'is-submenu-open' );

	const toggle = expandedToggle( current );
	if ( toggle ) {
		toggle.click();
		toggle.focus();
	}
};

const closeAllSubmenus = ( pill ) => {
	// Deepest-first: clearing only the plugin's class left core's toggle
	// still reporting aria-expanded="true", so on reopen the submenu was
	// hidden while its toggle announced "expanded" and the next activation
	// appeared to do nothing.
	openPanels( pill )
		.reverse()
		.forEach( ( el ) => {
			el.classList.remove( 'is-submenu-open' );
			el.scrollTop = 0;
			expandedToggle( el )?.click();
		} );
};

const closePill = ( ctx, pill ) => {
	// FIX #4 (a11y): Close submenus first on Escape, then close pill.
	closeAllSubmenus( pill );
	ctx.isOpen = false;
};

// restoreFocus: return focus to the control that opened the panel. Right for a
// deliberate dismissal (Escape, the toggle, the close button) and wrong for a
// click elsewhere on the page — see handleClickOutside.
const closeSearchPanel = ( ctx, pill, restoreFocus = true ) => {
	ctx.isSearchOpen = false;
	if ( restoreFocus ) {
		pill?.querySelector( '.awesome-nav-search-btn' )?.focus();
	}
};

/**
 * Keep sRGB channels exact; let the browser convert other computed color spaces
 * to sRGB, including their alpha, so every layer participates in blending.
 *
 * @param {string}   value A computed background-color.
 * @param {Document} doc   The pill document.
 * @return {{r: number, g: number, b: number, a: number}|null} sRGB channels.
 */
const parseRgb = ( value, doc ) => {
	const match = value.match( /^rgba?\(([^)]+)\)$/ );
	if ( ! match ) {
		const canvas = doc.createElement( 'canvas' );
		canvas.width = canvas.height = 1;
		const context = canvas.getContext( '2d' );
		if ( ! context ) {
			return null;
		}
		context.fillStyle = value;
		context.fillRect( 0, 0, 1, 1 );
		const [ r, g, b, alpha ] = context.getImageData( 0, 0, 1, 1 ).data;
		return { r, g, b, a: alpha / 255 };
	}
	const [ r, g, b, a = 1 ] = match[ 1 ]
		.split( /[\s,/]+/ )
		.filter( Boolean )
		.map( Number );
	return { r, g, b, a };
};

const canvasColor = ( doc ) => {
	const probe = doc.createElement( 'div' );
	probe.style.backgroundColor = 'Canvas';
	doc.body.append( probe );
	const value = doc.defaultView.getComputedStyle( probe ).backgroundColor;
	probe.remove();
	return value;
};

/**
 * The solid color showing behind the pill: the nearest ancestor background,
 * with any translucent layers above it blended in, ending at the browser
 * canvas when nothing on the way paints. The pill's text inherits from that
 * same context, so painting this keeps the theme's text/background pair intact
 * where a fixed fallback color did not.
 *
 * @param {Element} pill The pill.
 * @return {string} A CSS color.
 */
const surfaceBehind = ( pill ) => {
	const view = pill.ownerDocument.defaultView;
	const layers = [];
	let base = null;
	for ( let el = pill.parentElement; el && ! base; el = el.parentElement ) {
		const value = view.getComputedStyle( el ).backgroundColor;
		const rgb = parseRgb( value, pill.ownerDocument );
		if ( ! rgb ) {
			base = value;
		} else if ( rgb.a >= 1 ) {
			base = rgb;
		} else if ( rgb.a > 0 ) {
			layers.push( rgb );
		}
	}
	base ??= canvasColor( pill.ownerDocument );
	if ( typeof base === 'string' ) {
		const rgb = parseRgb( base, pill.ownerDocument );
		if ( ! rgb || ! layers.length ) {
			return base;
		}
		base = rgb;
	}
	const { r, g, b } = layers.reduceRight(
		( below, layer ) => ( {
			r: layer.r * layer.a + below.r * ( 1 - layer.a ),
			g: layer.g * layer.a + below.g * ( 1 - layer.a ),
			b: layer.b * layer.a + below.b * ( 1 - layer.a ),
		} ),
		base
	);
	return `rgb(${ Math.round( r ) }, ${ Math.round( g ) }, ${ Math.round(
		b
	) })`;
};

const luminance = ( { r, g, b } ) => {
	const channels = [ r, g, b ].map( ( channel ) => {
		const value = channel / 255;
		return value <= 0.04045
			? value / 12.92
			: ( ( value + 0.055 ) / 1.055 ) ** 2.4;
	} );
	return (
		channels[ 0 ] * 0.2126 + channels[ 1 ] * 0.7152 + channels[ 2 ] * 0.0722
	);
};

/**
 * Give a pill with no chosen background the color behind it, so the submenu
 * takeover's `background: inherit` chain has an opaque surface to cover the
 * menu with. Explicit Group text colors get a contrasting fallback when needed.
 * Refresh on open and theme changes.
 *
 * @param {Element|null} pill The pill.
 */
const syncSurface = ( pill ) => {
	if ( ! pill || pill.matches( '.has-background, [style*="background"]' ) ) {
		return;
	}
	let surface = surfaceBehind( pill );
	if ( pill.matches( '.has-text-color' ) || pill.style.color ) {
		const doc = pill.ownerDocument;
		const text = parseRgb(
			doc.defaultView.getComputedStyle( pill ).color,
			doc
		);
		const background = parseRgb( surface, doc );
		if ( text && background ) {
			const foreground = luminance( text );
			const behind = luminance( background );
			const contrast =
				( Math.max( foreground, behind ) + 0.05 ) /
				( Math.min( foreground, behind ) + 0.05 );
			if ( contrast < 4.5 ) {
				surface = foreground > 0.179 ? '#000' : '#fff';
			}
		}
	}
	if (
		pill.style.getPropertyValue( '--awesome-nav-pill-surface' ) !== surface
	) {
		pill.style.setProperty( '--awesome-nav-pill-surface', surface );
	}
};

const { actions } = store( 'awesome-navigation', {
	actions: {
		toggle: () => {
			if ( pillContext().isOpen ) {
				actions.close();
			} else {
				actions.open();
			}
		},

		open: () => {
			const ctx = pillContext();

			// Close search if open.
			if ( ctx.isSearchOpen ) {
				ctx.isSearchOpen = false;
			}
			ctx.isOpen = true;

			// FIX #6 (a11y): Move focus into the content area — specifically
			// the grid child, which is the scroll container (keyboard scroll
			// keys walk UP from the focused element, so focusing the
			// non-scrollable outer container would scroll the page instead).
			const { ref } = getElement();
			syncSurface( pillOf( ref ) );
			const content = pillOf( ref )?.querySelector(
				'.awesome-nav-content'
			);
			if ( content ) {
				const scroller = content.firstElementChild || content;
				const active = content.ownerDocument.activeElement;
				// tabindex="-1" allows programmatic focus without adding to tab order.
				scroller.setAttribute( 'tabindex', '-1' );
				window.requestAnimationFrame( () => {
					if (
						scroller.isConnected &&
						ctx.isOpen &&
						! ctx.isSearchOpen &&
						content.ownerDocument.activeElement === active
					) {
						scroller.focus( { preventScroll: true } );
					}
				} );
			}
		},

		close: () => closePill( pillContext(), pillOf( getElement().ref ) ),

		handleKeydown: ( event ) => {
			if ( event.key !== 'Escape' ) {
				return;
			}

			const ctx = pillContext();
			const pill = pillOf( getElement().ref );

			// Close search first if open.
			if ( ctx.isSearchOpen ) {
				closeSearchPanel( ctx, pill );
				return;
			}

			if ( ! ctx.isOpen ) {
				return;
			}

			// If submenus are open, close the topmost one first.
			if ( openPanels( pill ).length > 0 ) {
				event.stopPropagation();
				closeTopSubmenu( pill );
				return;
			}

			// Otherwise close the whole pill and return focus to toggle.
			closePill( ctx, pill );
			pill?.querySelector(
				'.wp-block-awesome-navigation-menu-toggle'
			)?.focus();
		},

		closeSubmenu: () => closeTopSubmenu( pillOf( getElement().ref ) ),

		closeAllSubmenus: () => closeAllSubmenus( pillOf( getElement().ref ) ),

		/**
		 * Toggle the inline search.
		 */
		toggleSearch: () => {
			if ( pillContext().isSearchOpen ) {
				actions.closeSearch();
			} else {
				actions.openSearch();
			}
		},

		openSearch: () => {
			const ctx = pillContext();
			if ( ctx.isOpen ) {
				actions.close();
			}
			ctx.isSearchOpen = true;

			const { ref } = getElement();
			syncSurface( pillOf( ref ) );
			const active = ref.ownerDocument.activeElement;
			window.requestAnimationFrame( () => {
				const input = pillOf( ref )?.querySelector(
					'.awesome-nav-search-input'
				);
				if (
					input?.isConnected &&
					ctx.isSearchOpen &&
					! ctx.isOpen &&
					ref.ownerDocument.activeElement === active
				) {
					input.focus();
				}
			} );
		},

		closeSearch: () =>
			closeSearchPanel( pillContext(), pillOf( getElement().ref ) ),

		handleSearchKeydown: ( event ) => {
			if ( event.key === 'Escape' ) {
				actions.closeSearch();
			}
		},
	},

	callbacks: {
		init: () => {
			const { ref } = getElement();
			// getContext() throws once the synchronous directive scope is
			// popped, and everything below runs after that — from a listener
			// or an observer callback. Capture the proxy here and close over
			// it; its identity is stable for the element's lifetime.
			const ctx = getContext();
			syncSurface( ref );
			const colorScheme = window.matchMedia(
				'(prefers-color-scheme: dark)'
			);
			const handleColorScheme = () => syncSurface( ref );
			colorScheme.addEventListener( 'change', handleColorScheme );
			const surfaceObserver = new window.MutationObserver(
				handleColorScheme
			);
			for (
				let ancestor = ref.parentElement;
				ancestor;
				ancestor = ancestor.parentElement
			) {
				surfaceObserver.observe( ancestor, {
					attributes: true,
					attributeFilter: [
						'class',
						'style',
						'data-theme',
						'data-color-scheme',
					],
				} );
			}
			// Read again after theme backgrounds and explicit text finish transitioning.
			const handleSurfaceTransition = ( event ) => {
				if (
					( event.propertyName === 'background-color' ||
						event.propertyName === 'color' ) &&
					event.target.contains( ref )
				) {
					syncSurface( ref );
				}
			};
			ref.ownerDocument.addEventListener(
				'transitionend',
				handleSurfaceTransition
			);
			ref.querySelectorAll(
				'.open-on-click > .wp-block-navigation__submenu-container'
			).forEach( ( panel ) => {
				panel.inert = ! expandedToggle( panel );
			} );

			// --- Click outside (FIX #8: named handler for proper cleanup) ---
			const handleClickOutside = ( event ) => {
				if ( ! ref || ref.contains( event.target ) ) {
					return;
				}
				// Close, but do NOT pull focus back to the pill. The user just
				// clicked something else on the page — a link, a field — and
				// yanking focus out of it is worse than the open panel was.
				// Escape and the toggle still restore focus, because there the
				// dismissal is deliberate and focus has nowhere else to go.
				if ( ctx.isSearchOpen ) {
					closeSearchPanel( ctx, ref, false );
				}
				if ( ctx.isOpen ) {
					closePill( ctx, ref );
				}
			};
			document.addEventListener( 'click', handleClickOutside );

			// --- Submenu observation ---
			const observer = new window.MutationObserver( ( mutations ) => {
				for ( const mutation of mutations ) {
					if (
						mutation.type !== 'attributes' ||
						mutation.attributeName !== 'aria-expanded'
					) {
						continue;
					}

					const target = mutation.target;
					const isExpanded =
						target.getAttribute( 'aria-expanded' ) === 'true';
					// Key off core's own click-mode class, which is exactly
					// what the takeover CSS is gated on — the two must agree
					// on which submenus qualify or they break each other:
					//
					// - core/page-list items get `open-on-click` but NOT
					//   `wp-block-navigation-submenu`, so matching on the
					//   latter left their panels styled as a takeover that
					//   nothing ever opened — stuck off-canvas.
					// - hover and always modes DO expose `aria-expanded`, on
					//   the submenu indicator button core renders when
					//   showSubmenuIcon is on (its default). Matching those
					//   injected a "Back to X" button into an ordinary
					//   dropdown that the CSS correctly refuses to take over.
					const submenuItem = target.closest( '.open-on-click' );
					if ( ! submenuItem ) {
						continue;
					}

					const submenuContainer = submenuItem.querySelector(
						':scope > .wp-block-navigation__submenu-container'
					);
					if ( ! submenuContainer ) {
						continue;
					}

					if ( isExpanded ) {
						submenuContainer.inert = false;
						if (
							! Array.from( submenuContainer.children ).some(
								( child ) =>
									child.classList.contains(
										'awesome-nav-back'
									)
							)
						) {
							// FIX #7: Include parent item name in back button label.
							const parentLink = submenuItem.querySelector(
								':scope > .wp-block-navigation-item__content'
							);
							const parentName = parentLink
								? parentLink.textContent.trim()
								: '';
							const backLabel = parentName
								? `Back to ${ parentName }`
								: 'Back';

							const backBtn = document.createElement( 'button' );
							backBtn.className = 'awesome-nav-back';
							backBtn.setAttribute( 'type', 'button' );
							backBtn.setAttribute( 'aria-label', backLabel );
							backBtn.textContent = backLabel;
							backBtn.addEventListener( 'click', ( e ) => {
								e.stopPropagation();
								submenuContainer.classList.remove(
									'is-submenu-open'
								);
								if (
									target.getAttribute( 'aria-expanded' ) ===
									'true'
								) {
									target.click();
								}
								target.focus();
							} );
							submenuContainer.insertBefore(
								backBtn,
								submenuContainer.firstChild
							);
						}

						// A takeover is absolutely positioned against its
						// nearest positioned ancestor. For a nested panel
						// that ancestor is the PARENT panel, which is itself
						// a scroller — so if the parent is scrolled, the
						// child opens offset by that scrollTop and can land
						// wholly out of view. Resetting the parent (which the
						// child is about to cover anyway) keeps the two
						// aligned. Resetting the panel's own scroll also
						// means reopening a long submenu starts at the top
						// rather than wherever it was left.
						submenuContainer.scrollTop = 0;
						const parentScroller = submenuItem.closest(
							'.wp-block-navigation__submenu-container'
						);
						if ( parentScroller ) {
							parentScroller.scrollTop = 0;
						}

						window.requestAnimationFrame( () => {
							// Re-check: a same-frame close (rapid toggle)
							// runs its synchronous remove before this rAF
							// lands — don't re-add a stale open class.
							if (
								target.getAttribute( 'aria-expanded' ) !==
								'true'
							) {
								return;
							}

							submenuContainer.classList.add( 'is-submenu-open' );
							window.requestAnimationFrame( () => {
								// Core's afterNextFrame finishes in a task after its frame.
								setTimeout( () => {
									const back = submenuContainer.querySelector(
										':scope > .awesome-nav-back'
									);
									const owner = submenuItem.querySelector(
										':scope > .wp-block-navigation-item__content'
									);
									const active =
										submenuContainer.ownerDocument
											.activeElement;
									if (
										back &&
										submenuContainer.isConnected &&
										ctx.isOpen &&
										target.getAttribute(
											'aria-expanded'
										) === 'true' &&
										ref.contains( target ) &&
										( active === target ||
											active === owner )
									) {
										back.focus( { preventScroll: true } );
									}
								}, 0 );
							} );
						} );
					} else {
						submenuContainer.classList.remove( 'is-submenu-open' );

						// Whatever closed this panel — Back, Escape, core's own
						// handling, or a click on the parent item — focus may
						// still be inside it, and it is about to be hidden.
						// Hand focus back to the control that owns it rather
						// than letting it fall to <body>.
						const active =
							submenuContainer.ownerDocument.activeElement;
						if (
							ctx.isOpen &&
							submenuContainer.contains( active )
						) {
							target.focus( { preventScroll: true } );
						}
						submenuContainer.inert = true;
					}
				}
			} );

			observer.observe( ref, {
				subtree: true,
				attributes: true,
				attributeFilter: [ 'aria-expanded' ],
			} );

			// FIX #8: Include click listener in cleanup.
			return () => {
				document.removeEventListener( 'click', handleClickOutside );
				colorScheme.removeEventListener( 'change', handleColorScheme );
				surfaceObserver.disconnect();
				ref.ownerDocument.removeEventListener(
					'transitionend',
					handleSurfaceTransition
				);
				observer.disconnect();
			};
		},
	},
} );
