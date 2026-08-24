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

const closeSearchPanel = ( ctx, pill ) => {
	ctx.isSearchOpen = false;
	pill?.querySelector( '.awesome-nav-search-btn' )?.focus();
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
			const content = pillOf( ref )?.querySelector(
				'.awesome-nav-content'
			);
			if ( content ) {
				const scroller = content.firstElementChild || content;
				// tabindex="-1" allows programmatic focus without adding to tab order.
				scroller.setAttribute( 'tabindex', '-1' );
				requestAnimationFrame( () => {
					scroller.focus( { preventScroll: true } );
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
			requestAnimationFrame( () => {
				const input = pillOf( ref )?.querySelector(
					'.awesome-nav-search-input'
				);
				if ( input ) {
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

			// --- Click outside (FIX #8: named handler for proper cleanup) ---
			const handleClickOutside = ( event ) => {
				if ( ! ref || ref.contains( event.target ) ) {
					return;
				}
				if ( ctx.isSearchOpen ) {
					closeSearchPanel( ctx, ref );
				}
				if ( ctx.isOpen ) {
					closePill( ctx, ref );
					ref.querySelector(
						'.wp-block-awesome-navigation-menu-toggle'
					)?.focus();
				}
			};
			document.addEventListener( 'click', handleClickOutside );

			// --- Submenu observation ---
			const observer = new MutationObserver( ( mutations ) => {
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
						if (
							! submenuContainer.querySelector(
								'.awesome-nav-back'
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

						requestAnimationFrame( () => {
							// Re-check: a same-frame close (rapid toggle)
							// runs its synchronous remove before this rAF
							// lands — don't re-add a stale open class.
							if (
								target.getAttribute( 'aria-expanded' ) ===
								'true'
							) {
								submenuContainer.classList.add(
									'is-submenu-open'
								);
							}
						} );
					} else {
						submenuContainer.classList.remove( 'is-submenu-open' );
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
				observer.disconnect();
			};
		},
	},
} );
