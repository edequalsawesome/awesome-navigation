=== Awesome Navigation ===
Contributors: edequalsawesome
Tags: navigation, menu, header, overlay, blocks
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 2026.07.001
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A floating navigation pill that expands to reveal your menu. On WP 7.0+ includes frosted glass overlay patterns for Navigation Overlays.

== Description ==

Awesome Navigation adds a floating navigation pill to your site header. The pill pushes content down at the top of the page and floats over content when scrolled. The expandable menu area is a navigation-overlay template part you design in the Site Editor.

Also includes:

* A Menu Toggle block with selectable icon styles.
* Frosted glass overlay patterns for WordPress 7.0 Navigation Overlays.
* An "Outlined" navigation block style with per-item accent colors.

== Changelog ==

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
