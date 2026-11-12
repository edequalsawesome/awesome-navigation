// No WordPress fixture required: loads the real stylesheet and nav-pill.js
// with a stand-in for @wordpress/interactivity.
// Run with: npx playwright test tests/surface.spec.mjs
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const css = readFileSync( new URL( '../assets/nav-pill.css', import.meta.url ), 'utf8' );
const script = readFileSync( new URL( '../assets/nav-pill.js', import.meta.url ), 'utf8' );

const interactivity = `
export const store = ( namespace, definition ) => ( window.navStore = definition );
export const getElement = () => ( { ref: window.navRef } );
export const getContext = () => window.navContext;
`;

const pill = ( { className = '', style = '' } = {} ) => `
<div class="awesome-nav-pill ${ className }" style="${ style }">
	<div class="awesome-nav-topbar"><p class="wp-block-site-title"><a href="#">Site title</a></p></div>
	<div class="awesome-nav-content"><div class="awesome-nav-content-inner">
		<nav class="wp-block-navigation"><ul class="wp-block-navigation__container wp-block-navigation">
			<li class="wp-block-navigation-item has-child open-on-click wp-block-navigation-submenu">
				<button class="wp-block-navigation-item__content" aria-expanded="true">Explore</button>
				<ul class="wp-block-navigation__submenu-container is-submenu-open">
					<li class="wp-block-navigation-item"><a class="wp-block-navigation-item__content" href="#">Child</a></li>
				</ul>
			</li>
			<li class="wp-block-navigation-item"><a class="wp-block-navigation-item__content" href="#">Root sibling</a></li>
		</ul></nav>
	</div></div>
</div>`;

async function render( page, { theme, body, runScript = true } ) {
	await page.setContent( `<!doctype html>
		<style>${ coreSubmenu }</style>
		<style>${ css }</style>
		<style>${ theme }</style>
		<script type="importmap">{ "imports": { "@wordpress/interactivity": "data:text/javascript,${ encodeURIComponent( interactivity ) }" } }</script>
		<body>${ body }</body>` );
	if ( runScript ) {
		await page.addScriptTag( { type: 'module', content: script } );
		await page.waitForFunction( () => window.navStore );
		await page.evaluate( () => {
			for ( const element of document.querySelectorAll( '.awesome-nav-pill' ) ) {
				window.navRef = element;
				window.navContext = {};
				window.navCleanup = window.navStore.callbacks.init();
			}
		} );
	}
	return page.evaluate( () =>
		[ ...document.querySelectorAll( '.awesome-nav-pill' ) ].map( ( element ) => {
			element.classList.add( 'is-open' );
			const style = ( selector ) => getComputedStyle( element.querySelector( selector ) );
			return {
				pill: getComputedStyle( element ).backgroundColor,
				text: style( '.wp-block-site-title a' ).color,
				takeover: style( '.wp-block-navigation__submenu-container' ).backgroundColor,
				takeoverText: style( '.wp-block-navigation__submenu-container a' ).color,
			};
		} )
	);
}

// Core's own dropdown colors, which the takeover has to override.
const coreSubmenu = '.wp-block-navigation:not(.has-background) .wp-block-navigation__submenu-container { background-color: #fff; color: #000; } .wp-block-navigation-item__content { color: inherit; }';
const darkTheme = 'body { background: #0e0a14; color: #f4ebd9; margin: 0; }';
const lightTheme = ':root { --wp--preset--color--base: #fff; } body { background: var(--wp--preset--color--base); color: #111; margin: 0; }';

test( 'a pill with no background takes on a dark theme without a base preset', async ( { page } ) => {
	const [ result ] = await render( page, { theme: darkTheme, body: pill() } );
	expect( result ).toEqual( {
		pill: 'rgb(14, 10, 20)',
		text: 'rgb(244, 235, 217)',
		takeover: 'rgb(14, 10, 20)',
		takeoverText: 'rgb(244, 235, 217)',
	} );
} );

test( 'a pill with no background matches a light theme', async ( { page } ) => {
	const [ result ] = await render( page, { theme: lightTheme, body: pill() } );
	expect( result ).toEqual( {
		pill: 'rgb(255, 255, 255)',
		text: 'rgb(17, 17, 17)',
		takeover: 'rgb(255, 255, 255)',
		takeoverText: 'rgb(17, 17, 17)',
	} );
} );

test( 'the surface blends a translucent header over the page', async ( { page } ) => {
	const [ result ] = await render( page, {
		theme: darkTheme,
		body: `<header style="background: rgba(255, 255, 255, 0.5)">${ pill() }</header>`,
	} );
	expect( result.pill ).toBe( 'rgb(135, 133, 138)' );
	expect( result.takeover ).toBe( result.pill );
} );

test( 'falls back to the browser canvas when nothing behind the pill paints', async ( { page } ) => {
	const [ result ] = await render( page, { theme: 'body { margin: 0; }', body: pill() } );
	expect( result.pill ).toBe( 'rgb(255, 255, 255)' );
	expect( result.takeover ).toBe( result.pill );
} );

test( 'a background chosen in the editor still wins', async ( { page } ) => {
	const results = await render( page, {
		theme: `${ darkTheme } .has-accent-background-color { background-color: rgb(1, 2, 3); }`,
		body: pill( { className: 'has-background has-accent-background-color' } ) +
			pill( { style: 'background-color: rgb(200, 10, 10)' } ),
	} );
	expect( results.map( ( { pill: color, takeover } ) => [ color, takeover ] ) ).toEqual( [
		[ 'rgb(1, 2, 3)', 'rgb(1, 2, 3)' ],
		[ 'rgb(200, 10, 10)', 'rgb(200, 10, 10)' ],
	] );
} );

test( 'never paints white before the script runs', async ( { page } ) => {
	const [ result ] = await render( page, { theme: darkTheme, body: pill(), runScript: false } );
	expect( result.pill ).toBe( 'rgba(0, 0, 0, 0)' );
} );

for ( const color of [ 'color(srgb 1 1 1 / 0.5)', 'oklch(100% 0 0 / 0.5)' ] ) {
	test( `blends a translucent ${ color } header over the page`, async ( { page } ) => {
		const [ result ] = await render( page, {
			theme: darkTheme,
			body: `<header style="background: ${ color }">${ pill() }</header>`,
		} );
		// Canvas color conversion can round a channel by one sRGB step.
		expect( result.pill ).toMatch( /^rgb\(\d+, \d+, \d+\)$/ );
		const channels = result.pill.match( /\d+/g ).map( Number );
		[ 135, 133, 138 ].forEach( ( expected, index ) => {
			expect( Math.abs( channels[ index ] - expected ) ).toBeLessThanOrEqual( 1 );
		} );
		expect( result.takeover ).toBe( result.pill );
	} );
}

for ( const color of [ 'color(srgb 0 0 0)', 'oklch(0% 0 0)' ] ) {
	test( `blends a nearer RGB layer over an opaque ${ color } header`, async ( { page } ) => {
		const [ result ] = await render( page, {
			theme: darkTheme,
			body: `<header style="background: ${ color }"><div style="background: rgba(255, 255, 255, 0.5)">${ pill() }</div></header>`,
		} );
		expect( result.pill ).toBe( 'rgb(128, 128, 128)' );
		expect( result.takeover ).toBe( result.pill );
	} );
}

for ( const selected of [
	{ style: 'color: #111' },
	{ className: 'has-text-color' },
] ) {
	test( `explicit dark Group text keeps a readable fallback: ${ JSON.stringify( selected ) }`, async ( { page } ) => {
		const [ result ] = await render( page, { theme: `${ darkTheme } .has-text-color { color: #111; }`, body: pill( selected ) } );
		expect( result.pill ).toBe( 'rgb(255, 255, 255)' );
		expect( result.text ).toBe( 'rgb(17, 17, 17)' );
		expect( result.takeover ).toBe( result.pill );
	} );
}

test( 'explicit light Group text retains a contrasting dark surface', async ( { page } ) => {
	const [ result ] = await render( page, { theme: darkTheme, body: pill( { style: 'color: white' } ) } );
	expect( result.pill ).toBe( 'rgb(14, 10, 20)' );
} );

const switchingTheme = 'body { background: white; color: black; } body.dark { background: black; color: white; }';

test( 'a class-based theme switch refreshes a closed pill', async ( { page } ) => {
	await render( page, { theme: switchingTheme, body: pill() } );
	await page.evaluate( () => {
		document.querySelector( '.awesome-nav-pill' ).classList.remove( 'is-open' );
		document.body.classList.add( 'dark' );
	} );
	await expect( page.locator( '.awesome-nav-pill' ) ).toHaveCSS( 'background-color', 'rgb(0, 0, 0)' );
} );

test( 'an OS theme transition refreshes the final surface', async ( { page } ) => {
	await page.emulateMedia( { colorScheme: 'light' } );
	await render( page, {
		theme: 'body { background: white; color: black; transition: background-color .2s; } @media (prefers-color-scheme: dark) { body { background: black; color: white; } }',
		body: pill(),
	} );
	await page.emulateMedia( { colorScheme: 'dark' } );
	await expect( page.locator( '.awesome-nav-pill' ) ).toHaveCSS( 'background-color', 'rgb(0, 0, 0)' );
} );

test( 'cleanup stops theme mutations, scheme changes and transition listeners', async ( { page } ) => {
	await page.emulateMedia( { colorScheme: 'light' } );
	await render( page, { theme: switchingTheme, body: pill() } );
	await page.evaluate( () => {
		window.navCleanup();
		document.body.classList.add( 'dark' );
		document.body.dispatchEvent( new TransitionEvent( 'transitionend', { bubbles: true, propertyName: 'background-color' } ) );
	} );
	await page.emulateMedia( { colorScheme: 'dark' } );
	await page.evaluate( () => new Promise( resolve => requestAnimationFrame( () => requestAnimationFrame( resolve ) ) ) );
	expect( await page.locator( '.awesome-nav-pill' ).evaluate( element => element.style.getPropertyValue( '--awesome-nav-pill-surface' ) ) ).toBe( 'rgb(255, 255, 255)' );
} );

test( 'mid-tone explicit text on a light page uses the higher-contrast black fallback', async ( { page } ) => {
	const [ result ] = await render( page, { theme: lightTheme, body: pill( { style: 'color: #777' } ) } );
	expect( result.pill ).toBe( 'rgb(0, 0, 0)' );
} );

test( 'an explicit Group text transition refreshes the final contrasting surface', async ( { page } ) => {
	await render( page, {
		theme: 'body { background: white; --text: black; } body.dark { background: black; --text: white; } .has-text-color { color: var(--text); transition: color .2s; }',
		body: pill( { className: 'has-text-color' } ),
	} );
	await page.evaluate( () => document.body.classList.add( 'dark' ) );
	await expect( page.locator( '.awesome-nav-pill' ) ).toHaveCSS( 'background-color', 'rgb(0, 0, 0)' );
} );
