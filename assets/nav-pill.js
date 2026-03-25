/**
 * Awesome Navigation - Nav Pill
 *
 * Interactivity API store for the floating navigation pill.
 * Handles expand/collapse, scroll tracking, submenu panel navigation,
 * and focus management.
 */

import { store, getElement } from '@wordpress/interactivity';

const SCROLL_THRESHOLD = 50;

const { state, actions } = store( 'awesome-navigation', {
	state: {
		isOpen: false,
		isScrolled: false,
		submenuStack: [],

		get hasOpenSubmenu() {
			return state.submenuStack.length > 0;
		},
	},

	actions: {
		toggle: () => {
			if ( state.isOpen ) {
				actions.close();
			} else {
				actions.open();
			}
		},

		open: () => {
			state.isOpen = true;

			// FIX #6 (a11y): Move focus into the content container.
			const { ref } = getElement();
			const content = ref.querySelector( '.awesome-nav-content' );
			if ( content ) {
				// tabindex="-1" allows programmatic focus without adding to tab order.
				content.setAttribute( 'tabindex', '-1' );
				requestAnimationFrame( () => {
					content.focus( { preventScroll: true } );
				} );
			}
		},

		close: () => {
			// FIX #4 (a11y): Close submenus first on Escape, then close pill.
			if ( state.submenuStack.length > 0 ) {
				actions.closeAllSubmenus();
			}
			state.isOpen = false;
		},

		handleKeydown: ( event ) => {
			if ( event.key !== 'Escape' || ! state.isOpen ) {
				return;
			}

			// If submenus are open, close the topmost one first.
			if ( state.submenuStack.length > 0 ) {
				event.stopPropagation();
				actions.closeSubmenu();
				return;
			}

			// Otherwise close the whole pill and return focus to toggle.
			actions.close();
			const { ref } = getElement();
			const toggle = ref.querySelector(
				'.wp-block-awesome-navigation-menu-toggle'
			);
			if ( toggle ) {
				toggle.focus();
			}
		},

		closeSubmenu: () => {
			if ( state.submenuStack.length === 0 ) {
				return;
			}

			const current =
				state.submenuStack[ state.submenuStack.length - 1 ];
			current.classList.remove( 'is-submenu-open' );

			const parentSubmenu = current.closest(
				'.wp-block-navigation-submenu'
			);
			if ( parentSubmenu ) {
				const toggle = parentSubmenu.querySelector(
					':scope > [aria-expanded="true"]'
				);
				if ( toggle ) {
					toggle.click();
					toggle.focus();
				}
			}

			state.submenuStack = state.submenuStack.slice( 0, -1 );
		},

		closeAllSubmenus: () => {
			state.submenuStack.forEach( ( el ) => {
				el.classList.remove( 'is-submenu-open' );
			} );
			state.submenuStack = [];
		},
	},

	callbacks: {
		init: () => {
			const { ref } = getElement();

			// --- Scroll tracking (FIX #12: guard to avoid needless reactive updates) ---
			const checkScroll = () => {
				const scrolled = window.scrollY > SCROLL_THRESHOLD;
				if ( scrolled !== state.isScrolled ) {
					state.isScrolled = scrolled;
				}
			};
			checkScroll();
			window.addEventListener( 'scroll', checkScroll, {
				passive: true,
			} );

			// --- Click outside (FIX #8: named handler for proper cleanup) ---
			const handleClickOutside = ( event ) => {
				if ( state.isOpen && ref && ! ref.contains( event.target ) ) {
					actions.close();

					// Return focus to toggle after outside click closes pill.
					const toggle = ref.querySelector(
						'.wp-block-awesome-navigation-menu-toggle'
					);
					if ( toggle ) {
						toggle.focus();
					}
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
					const submenuItem = target.closest(
						'.wp-block-navigation-submenu'
					);
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

							const backBtn =
								document.createElement( 'button' );
							backBtn.className = 'awesome-nav-back';
							backBtn.setAttribute( 'type', 'button' );
							backBtn.setAttribute( 'aria-label', backLabel );
							backBtn.textContent = backLabel;
							backBtn.addEventListener( 'click', ( e ) => {
								e.stopPropagation();
								submenuContainer.classList.remove(
									'is-submenu-open'
								);
								state.submenuStack =
									state.submenuStack.filter(
										( el ) => el !== submenuContainer
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

						if (
							! state.submenuStack.includes( submenuContainer )
						) {
							state.submenuStack = [
								...state.submenuStack,
								submenuContainer,
							];
						}
						requestAnimationFrame( () => {
							submenuContainer.classList.add(
								'is-submenu-open'
							);
						} );
					} else {
						submenuContainer.classList.remove( 'is-submenu-open' );
						state.submenuStack = state.submenuStack.filter(
							( el ) => el !== submenuContainer
						);
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
				window.removeEventListener( 'scroll', checkScroll );
				document.removeEventListener( 'click', handleClickOutside );
				observer.disconnect();
			};
		},
	},
} );
