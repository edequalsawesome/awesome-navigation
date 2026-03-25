/**
 * Awesome Navigation - Submenu Takeover
 *
 * Uses the WordPress Interactivity API to enhance submenu behavior
 * inside navigation overlays that use the overlay-canvas class.
 *
 * When a submenu opens, it slides in from the right and takes over
 * the full canvas. A back button is injected to navigate back.
 */

import { store, getContext, getElement } from '@wordpress/interactivity';

const { state, actions } = store( 'awesome-navigation', {
	state: {
		/**
		 * Stack of open submenu elements for nested navigation.
		 */
		get hasOpenSubmenu() {
			return state.submenuStack.length > 0;
		},
		submenuStack: [],
	},

	actions: {
		/**
		 * Handle submenu open — triggered when a submenu item is clicked.
		 * Finds the submenu container and adds it to our navigation stack.
		 */
		openSubmenu: () => {
			const { ref } = getElement();
			const submenuContainer = ref
				.closest( '.wp-block-navigation-submenu' )
				?.querySelector( ':scope > .wp-block-navigation__submenu-container' );

			if ( ! submenuContainer ) {
				return;
			}

			// Inject back button if not already present
			if ( ! submenuContainer.querySelector( '.overlay-canvas-back' ) ) {
				const backButton = document.createElement( 'button' );
				backButton.className = 'overlay-canvas-back';
				backButton.setAttribute( 'type', 'button' );
				backButton.textContent = 'Back';
				backButton.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					actions.closeCurrentSubmenu();
				} );
				submenuContainer.insertBefore(
					backButton,
					submenuContainer.firstChild
				);
			}

			// Push to stack
			state.submenuStack = [ ...state.submenuStack, submenuContainer ];

			// Trigger the slide-in by adding our open class
			requestAnimationFrame( () => {
				submenuContainer.classList.add( 'is-menu-open' );
			} );
		},

		/**
		 * Close the topmost submenu in the stack.
		 */
		closeCurrentSubmenu: () => {
			if ( state.submenuStack.length === 0 ) {
				return;
			}

			const current = state.submenuStack[ state.submenuStack.length - 1 ];
			current.classList.remove( 'is-menu-open' );

			// Also trigger the core submenu close if available
			const parentSubmenu = current.closest(
				'.wp-block-navigation-submenu'
			);
			if ( parentSubmenu ) {
				const toggle = parentSubmenu.querySelector(
					':scope > [aria-expanded="true"]'
				);
				if ( toggle ) {
					toggle.click();
				}
			}

			// Pop from stack after transition
			state.submenuStack = state.submenuStack.slice( 0, -1 );
		},

		/**
		 * Close all submenus — used when the overlay itself closes.
		 */
		closeAllSubmenus: () => {
			state.submenuStack.forEach( ( el ) => {
				el.classList.remove( 'is-menu-open' );
			} );
			state.submenuStack = [];
		},
	},

	callbacks: {
		/**
		 * Initialize: observe submenu state changes in the overlay.
		 * We use a MutationObserver to detect when core's Interactivity API
		 * opens a submenu (adds aria-expanded="true") and hook into it.
		 */
		init: () => {
			const { ref } = getElement();
			const overlay = ref.closest( '.overlay-canvas' );

			if ( ! overlay ) {
				return;
			}

			const observer = new MutationObserver( ( mutations ) => {
				for ( const mutation of mutations ) {
					if (
						mutation.type === 'attributes' &&
						mutation.attributeName === 'aria-expanded'
					) {
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
							// Inject back button if needed
							if (
								! submenuContainer.querySelector(
									'.overlay-canvas-back'
								)
							) {
								const backButton =
									document.createElement( 'button' );
								backButton.className = 'overlay-canvas-back';
								backButton.setAttribute( 'type', 'button' );
								backButton.textContent = 'Back';
								backButton.addEventListener(
									'click',
									( e ) => {
										e.stopPropagation();
										// Close this specific submenu
										submenuContainer.classList.remove(
											'is-menu-open'
										);
										state.submenuStack =
											state.submenuStack.filter(
												( el ) =>
													el !== submenuContainer
											);
										// Trigger core close
										if (
											target.getAttribute(
												'aria-expanded'
											) === 'true'
										) {
											target.click();
										}
									}
								);
								submenuContainer.insertBefore(
									backButton,
									submenuContainer.firstChild
								);
							}

							// Add to stack and animate in
							if (
								! state.submenuStack.includes(
									submenuContainer
								)
							) {
								state.submenuStack = [
									...state.submenuStack,
									submenuContainer,
								];
							}

							requestAnimationFrame( () => {
								submenuContainer.classList.add(
									'is-menu-open'
								);
							} );
						} else {
							// Submenu closed — remove from stack
							submenuContainer.classList.remove(
								'is-menu-open'
							);
							state.submenuStack = state.submenuStack.filter(
								( el ) => el !== submenuContainer
							);
						}
					}
				}
			} );

			// Observe aria-expanded changes on any button/link in the overlay
			observer.observe( overlay, {
				subtree: true,
				attributes: true,
				attributeFilter: [ 'aria-expanded' ],
			} );

			// Cleanup on unmount
			return () => {
				observer.disconnect();
			};
		},
	},
} );
