=== Bitdefender Antispam ===
Contributors: bitdefender
Tags: comments, spam
Requires at least: 2.7.1
Tested up to: 3.0.1
Stable tag: trunk

The Spam filtering module from Bitdefender ensures your blog stays free of unsolicited comments, using a web service offered by Bitdefender. 

== Description ==

This experimental WordPress Plugin will work with the API on BitDefender's cloud based scanning servers to ensure no spam hits your blog. This version of BitDefender AntiSpam for WordPress was released as PREVIEW and we welcome any form of feedback or suggestions.Please tell us what you think about: detection rate (both undetected spam and false positives), the overall look&feel when installing or working with the plugin and basically any other information (including flames) you feel would help us improve this project. 
BitDefender AntiSpam for WordPress is released by BitDefender's Innovation and Technology team and is Free to use. For feedback, flames and suggestions you can contact us at asblog@labs.bitdefender.com 

== Installation ==

1. from WordPress Dashboard/Plugins select Add New
2. select Upload and browse to the plugin
3. install and activate
4. enter a valid e-mail in the BitDefender Client ID field

If unsuccessful, try uploading the plugin by ftp in the plugin directory(wp-content/plugins) and activate manually.
This section describes how to install the plugin and get it working.


== Changelog ==

= 0.7 =
* Bug regarding "Empty delimiter" warning fixed.
* "Powered by" widget.

= 0.6 =
* Bug regarding site_url() fixed.
* Bug at IP blacklisting fixed.
* Option to blackist IP-s in comments page.
* User action confirmtion (saving options, etc).

= 0.5 =
* New spam related settings: charset filters and aggresivity level.
* Removed buggy message at comment deletion.
* Menus moved on top of pages.

= 0.4 =
* The spam caught by Bitdefender is tagged.
* New page with Bitdefender Stats.

= 0.3 =
* Report blacklisted IP-s
* Option for chooing language
* Rescaning feature: in case of server error, unscanned comments are rescanned latter.
* In case of server error, displays correct error message, and puts the comment in moderation queue.

= 0.2 =
* Fix the log interface for older Wordpress versions(2.2.2)

= 0.1 =
* Initial release

== Upgrade Notice ==

= 0.5 =
* Deactivate and delete the old plugin. Reinstall the 0.5 plugin from Wordpress Dashboard/Plugins.

= 0.4 =
* Deactivate and delete the old plugin. Reinstall the 0.4 plugin from Wordpress Dashboard/Plugins.

= 0.3 =
* In case of server error, comments are moderated.
* You need do deactivate and activate again the plugin after upgrade.

= 0.2 =
* This version fixes the log interface for older Wordpress versions(2.2.2).

 

