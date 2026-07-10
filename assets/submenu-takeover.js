/**
 * Awesome Navigation - Submenu Takeover
 *
 * Uses the WordPress Interactivity API to enhance submenu behavior
 * inside navigation overlays that use the overlay-canvas class.
 *
 * When a submenu opens, it slides in from the right and takes over
 * the full canvas. A back button is injected to navigate back.
 */

import { store, getElement } from '@wordpress/interactivity';

// Own namespace — nav-pill.js registers 'awesome-navigation'. Sharing a
// namespace deep-merges the stores, and function-valued keys (callbacks.init,
// actions) are clobbered by whichever module loads last, breaking the pill.
const { state } = store( 'awesome-navigation/overlay', {
	state: {
		/**
		 * Stack of open submenu elements for nested navigation.
		 */
		submenuStack: [],
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
										// Restore focus to the submenu
										// trigger (a11y: don't strand focus
										// behind the closing panel).
										target.focus();
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
								// Re-check: a same-frame close runs its
								// synchronous remove before this rAF lands.
								if (
									target.getAttribute( 'aria-expanded' ) ===
									'true'
								) {
									submenuContainer.classList.add(
										'is-menu-open'
									);
								}
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
