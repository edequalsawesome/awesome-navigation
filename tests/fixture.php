<?php
/** Create a navigation test page on a disposable site: wp eval-file tests/fixture.php */
$registered = WP_Block_Patterns_Registry::get_instance()->get_registered('awesome-navigation/nav-pill');
if (!$registered) { throw new RuntimeException('Activate Awesome Navigation before creating the fixture.'); }
$pattern = $registered['content'];
$nav='<!-- wp:navigation {"overlayMenu":"never","openSubmenusOnClick":true,"className":"is-style-squiggle-links","layout":{"type":"flex","orientation":"vertical"}} --><!-- wp:navigation-submenu {"label":"Explore","url":"#explore"} --><!-- wp:navigation-link {"label":"Rocket link","url":"#rocket"} /--><!-- wp:navigation-submenu {"label":"Nested places","url":"#nested"} --><!-- wp:navigation-link {"label":"Nested Rocket","url":"#nested-rocket"} /--><!-- /wp:navigation-submenu -->';
for($i=1;$i<=22;$i++){ $nav.='<!-- wp:navigation-link {"label":"Long child '.$i.'","url":"#child-'.$i.'"} /-->'; }
$nav.='<!-- /wp:navigation-submenu --><!-- wp:navigation-link {"label":"Root sibling","url":"#sibling"} /--><!-- /wp:navigation -->';
$pattern=preg_replace('/<!-- wp:template-part .*?\/-->/s',$nav,$pattern);
$pattern=str_replace('awesome-nav-site-title','awesome-nav-site-title is-style-squiggle-links',$pattern);
$content='<!-- wp:html --><div id="suite-navigation-fixture"><!-- /wp:html -->'.$pattern.$pattern.'<!-- wp:html --><p><a id="suite-outside" href="#outside">Outside link</a></p><input id="suite-outside-input" aria-label="Outside input"></div><!-- /wp:html -->';
$id=wp_insert_post(array('post_type'=>'page','post_title'=>'Suite Navigation QA','post_content'=>wp_slash($content),'post_status'=>'publish'),true);
if(is_wp_error($id)){throw new RuntimeException($id->get_error_message());}
echo json_encode(array('id'=>$id,'url'=>get_permalink($id))), "\n";
