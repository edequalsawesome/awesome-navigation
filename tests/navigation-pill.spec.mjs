// Create the disposable page with: wp eval-file tests/fixture.php
// Use the returned URL below; remove the returned post ID after testing.
// Run with: PLAYWRIGHT_TEST_BASE_URL=http://localhost:8887/suite-navigation-qa/ npx playwright test tests/navigation-pill.spec.mjs
import { test, expect } from '@playwright/test';

test( 'click submenu moves focus to Back and closing panel is inert', async ( { page } ) => {
	await page.goto( process.env.PLAYWRIGHT_TEST_BASE_URL );
	const pill = page.locator( '#suite-navigation-fixture .awesome-nav-pill' ).first();
	const toggle = pill.locator( '.wp-block-awesome-navigation-menu-toggle' );
	await toggle.press( 'Enter' );
	const submenuToggle = pill.locator( '.open-on-click [aria-expanded="false"]' ).first();
	await submenuToggle.click();
	const panel = pill.locator( '.wp-block-navigation__submenu-container' ).filter( { has: page.locator( ':scope > .awesome-nav-back' ) } ).first();
	await expect( panel.locator( ':scope > .awesome-nav-back' ) ).toBeFocused();
	const closing = await panel.evaluate( async ( element ) => {
		const link = element.querySelector( 'a' );
		element.querySelector( ':scope > .awesome-nav-back' ).click();
		await new Promise( ( resolve ) => setTimeout( resolve, 20 ) );
		link.focus();
		return { inert: element.inert, blocked: document.activeElement !== link };
	} );
	expect( closing ).toEqual( { inert: true, blocked: true } );
} );

for ( const mode of [ 'pointer', 'programmatic' ] ) {
	test( `${ mode } panel switching focuses the destination`, async ( { page } ) => {
		await page.goto( process.env.PLAYWRIGHT_TEST_BASE_URL );
		const pill = page.locator( '#suite-navigation-fixture .awesome-nav-pill' ).first();
		await pill.getByRole( 'button', { name: 'Menu', exact: true } ).click();
		await pill.getByRole( 'button', { name: 'Explore submenu', exact: true } ).click();
		await expect( pill.getByRole( 'button', { name: 'Back to Explore', exact: true } ) ).toBeFocused();
		const search = pill.getByRole( 'button', { name: 'Search', exact: true } );
		if ( mode === 'pointer' ) {
			await search.click();
		} else {
			await search.evaluate( ( element ) => element.click() );
		}
		await expect( pill.locator( '.awesome-nav-search-input' ) ).toBeFocused();
		await pill.getByRole( 'button', { name: 'Menu', exact: true } ).evaluate( ( element ) => element.click() );
		await expect( pill.locator( '.awesome-nav-content-inner' ) ).toBeFocused();
	} );
}

test( 'deferred menu and search focus respect the next interaction', async ( { page } ) => {
	await page.goto( process.env.PLAYWRIGHT_TEST_BASE_URL );
	const pill = page.locator( '#suite-navigation-fixture .awesome-nav-pill' ).first();
	await pill.getByRole( 'button', { name: 'Menu', exact: true } ).focus();
	await pill.evaluate( async ( element ) => {
		element.querySelector( '.wp-block-awesome-navigation-menu-toggle' ).click();
		await Promise.resolve();
		const submenu = element.querySelector( '.open-on-click > [aria-expanded]' );
		submenu.focus();
		submenu.click();
	} );
	await expect( pill.getByRole( 'button', { name: 'Back to Explore', exact: true } ) ).toBeFocused();
	await pill.evaluate( ( element ) => {
		element.querySelector( '.awesome-nav-search-btn' ).click();
		document.querySelector( '#suite-outside-input' ).focus();
	} );
	// Wait through the scheduled frame, so the check catches delayed focus theft.
	await page.evaluate( () => new Promise( ( resolve ) => requestAnimationFrame( () => requestAnimationFrame( resolve ) ) ) );
	await expect( page.locator( '#suite-outside-input' ) ).toBeFocused();
} );
