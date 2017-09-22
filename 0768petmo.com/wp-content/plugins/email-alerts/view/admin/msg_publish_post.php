<?php echo $subscriber_name; ?>,<br /><br />

<?php echo sprintf( __('A new post, <a href="%1$s">%2$s</a>, by %3$s (%4$s), has been published.'), $post_permalink, $post->post_title, $post_author_name, $post_author_email ); ?><br /><br />

<?php echo sprintf( __('Approved by: %1$s (%2$s)'), $acting_admin_name, $acting_admin_email ); ?>

<p><small>(Email Alerts plugin)</small></p>