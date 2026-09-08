=== Awesome Navigation ===
Contributors: edequalsawesome
Tags: navigation, menu, header, overlay, blocks
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 2026.09.002
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A floating navigation pill that expands to reveal your menu. On WP 7.0+ includes frosted glass overlay patterns for Navigation Overlays.

== Description ==

Awesome Navigation adds a floating navigation pill to your site header. The pill pushes content down at the top of the page and floats over content when scrolled. The expandable menu area is a navigation-overlay template part you design in the Site Editor.

Also includes:

* A Menu Toggle block with selectable icon styles.
* Frosted glass overlay patterns for WordPress 7.0 Navigation Overlays.
* An "Outlined" navigation block style with per-item accent colors.

More than one pill on a page is supported — each keeps its own open state, its
own search panel, and its own toggle states.

Placing a pill *inside another pill* is not supported. The Search Toggle hands
its settings to the pill through a single global, so a nested pill overwrites
and consumes the outer pill's, leaving the outer Search button with no panel;
and one Escape press dismisses both pills rather than just the inner one. There
is no reason to nest pills, so this is documented rather than fixed.

Keep the Navigation block inside the pill's menu content with its overlay menu
set to *Off* (the menu content the plugin creates on activation ships it that
way, and so do the Frosted Canvas patterns). The pill is already the overlay;
WordPress's own mobile menu opens inside the pill's clipped content area and
collides with the submenu panel. For submenus, use *Open on click* — that is
what gets the pill's expand-in-place panel. *Always open* and *Show on hover*
render WordPress's default submenu layout instead.

== Changelog ==

= 2026.09.002 =
* Fix: remove the default pill border and outline shadows so Group border controls define the edge.
* Fix: selected link decorations now apply inside the navigation pill.
* Fix: click-mode submenus move focus to Back and become inert immediately when closing.
* Fix: search-panel padding now animates while closing.
* Fix: submenus no longer appear to hang before opening. The panel stayed hidden for the whole 0.4s slide, so the animation played invisibly and the submenu seemed to pop into place at the end.
* Change: a submenu item now shows its label and a small "›" chevron inside a single field, split by a divider, instead of leaving an oversized chevron outside the item's outline. The chevron points the way the submenu panel slides in. Keyboard focus outlines the whole field, and a long unbroken label wraps instead of running under the divider.
* Fix: the submenu panel covers the whole menu area again when the Navigation block sits inside a Group. It was anchoring to the Group and sitting inset by its padding.
* Fix: the menu-part repair added in 2026.09.001 now also covers parts the Site Editor is still holding as auto-drafts, since those show up in its lists too.

= 2026.09.001 =
* Fix: the pill's menu template part could lose its Navigation Overlay area, which hid it from the Menu Content picker and from the Site Editor's Navigation Overlay list. The plugin now re-tags it on the next admin page load.
* Fix: Create New in the Menu Content picker no longer saves a part under a placeholder theme name if the editor has not finished loading the active theme.

= 2026.08.003 =
* Fix: while a submenu is open over the menu, the menu behind it is no longer reachable by keyboard or screen reader. Previously you could tab onto links you could not see, including those in a second column.
* Fix: clicking a link elsewhere on the page while the menu is open no longer yanks focus back to the menu button.

= 2026.08.002 =
* Fix: two navigation pills on the same page no longer share open/closed state — opening one no longer expands the other, and each pill's menu and search buttons now report their own state to screen readers.
* Fix: each pill's search button now points at its own search panel instead of every button describing the first one.
* Fix: opening the menu now moves focus into it as intended. The focus step had been targeting the wrong element and never ran.
* Removed: an unused scroll-tracking listener that ran on every scroll without affecting anything.

= 2026.08.001 =
* Fix: an open submenu now fills the pill's menu area as intended, instead of collapsing into a thin sliver.
* Fix: an open submenu now paints a solid surface, so the menu behind it no longer shows through it.
* Fix: submenus are no longer pushed off-screen when a Navigation block uses the "Open on hover" or "Always open" submenu setting — those keep WordPress's own submenu behaviour.
* Fix: submenus inside a Page List block now open correctly instead of staying hidden off-screen.
* Fix: a stray "Back" button no longer appears inside ordinary dropdowns when submenu indicator icons are enabled.
* Fix: closing the pill while a submenu is open no longer leaves that submenu's toggle reporting itself as expanded, which made the next click appear to do nothing.
* Fix: a submenu with more items than fit now scrolls inside the pill instead of being cut off, and reopens scrolled to the top.
* Fix: drilling into a nested submenu after scrolling no longer opens it out of view.
* Fix: submenus now slide in from the correct side, with a correctly-pointing Back arrow, in right-to-left languages.
* Fix: editing a menu in the Site Editor no longer pushes an open submenu outside the canvas.
* Fix: closing the menu no longer stutters. The pill's padding was not animated, so it vanished in a single frame at the start of the close while the menu was still fully visible.
* Change: a pill with no background colour set now falls back to the theme's base colour instead of being transparent. Set a background on the pill Group block to override it.

= 2026.07.002 =
* Fix: removed the divider line under the pill topbar when the menu or search panel is open.
* Fix: tall menus now scroll inside the pill on small screens instead of being cut off, without scrolling the page behind.
* Accessibility: focus lands on the menu's scrollable region on open, so keyboard scrolling (Page Down / arrow keys) scrolls the menu, not the page.

= 2026.07.001 =
* New: Search Toggle block with an inline search panel in the pill.
* Compatibility: minimum WordPress requirement lowered to 6.5; WP 7.0 overlay features are gated.
* Accessibility: collapsed pill content and the search panel are now inert (keyboard focus can no longer reach hidden controls).
* Accessibility: injected back buttons restore focus to their submenu trigger and have visible focus outlines.
* Accessibility: reduced-motion support for overlay canvas transitions.
* Fix: menu toggle label and icon attributes are no longer double-escaped.
* Fix: overlay submenu module now uses its own Interactivity API store namespace, so it no longer conflicts with the pill's store.
* Fix: template part slug override is validated with sanitize_title and guarded against recursive rendering.
* Fix: menu toggle icon size is clamped server-side and icon variants are validated against the allowlist.
* Fix: the default menu toggle label is now translatable.
* Hardening: ABSPATH guards on all pattern and render files; template part attribute registered server-side.

= 0.1.0 =
* Initial release.
