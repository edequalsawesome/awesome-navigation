// CSS-only regression: no WordPress fixture or theme workaround required.
// Run with: npx playwright test tests/scrollbar.spec.mjs
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const css = readFileSync( new URL( '../assets/nav-pill.css', import.meta.url ), 'utf8' );

test( 'opening clips temporary overflow, then restores real scrolling', async ( { page } ) => {
	await page.setViewportSize( { width: 900, height: 900 } );
	await page.setContent( `<style>${ css }</style>
		<div class="awesome-nav-pill"><div class="awesome-nav-topbar">Menu</div>
		<div class="awesome-nav-content"><div class="awesome-nav-content-inner"><div style="height:300px">Content</div></div></div></div>` );
	const pill = page.locator( '.awesome-nav-pill' );
	const scroller = pill.locator( '.awesome-nav-content-inner' );
	// Settle the initial collapsed style before changing the state.
	await page.evaluate( () => new Promise( resolve => requestAnimationFrame( () => requestAnimationFrame( resolve ) ) ) );
	const opening = await scroller.evaluate( async element => {
		element.closest( '.awesome-nav-pill' ).classList.add( 'is-open' );
		const frames = [];
		const start = performance.now();
		while ( performance.now() - start < 350 ) {
			await new Promise( requestAnimationFrame );
			if ( performance.now() - start >= 350 ) break;
			frames.push( { overflow: getComputedStyle( element ).overflowY, transient: element.scrollHeight > element.clientHeight } );
		}
		return frames;
	} );
	expect( opening.some( frame => frame.transient ) ).toBe( true );
	expect( opening.every( frame => frame.overflow === 'hidden' ) ).toBe( true );
	await expect.poll( () => scroller.evaluate( element => getComputedStyle( element ).overflowY ) ).toBe( 'auto' );
	expect( await scroller.evaluate( element => element.scrollHeight <= element.clientHeight ) ).toBe( true );

	// Reopening during a close restarts the clipping, without a stale timer.
	await pill.evaluate( element => element.classList.remove( 'is-open' ) );
	await page.waitForTimeout( 80 );
	await pill.evaluate( element => element.classList.add( 'is-open' ) );
	await expect.poll( () => scroller.evaluate( element => getComputedStyle( element ).overflowY ) ).toBe( 'hidden' );
	await expect.poll( () => scroller.evaluate( element => getComputedStyle( element ).overflowY ) ).toBe( 'auto' );

	// A short viewport must still support keyboard scrolling after the reveal.
	await page.setViewportSize( { width: 390, height: 300 } );
	await scroller.evaluate( element => { element.tabIndex = -1; element.focus(); } );
	await page.keyboard.press( 'PageDown' );
	await expect.poll( () => scroller.evaluate( element => element.scrollTop ) ).toBeGreaterThan( 0 );

	// With reduced motion there is no reveal, so scrolling returns immediately.
	await page.emulateMedia( { reducedMotion: 'reduce' } );
	await pill.evaluate( element => { element.classList.remove( 'is-open' ); getComputedStyle( element ).display; } );
	await pill.evaluate( element => element.classList.add( 'is-open' ) );
	expect( await scroller.evaluate( element => getComputedStyle( element ).animationName ) ).toBe( 'none' );
	expect( await scroller.evaluate( element => getComputedStyle( element ).overflowY ) ).toBe( 'auto' );
} );
