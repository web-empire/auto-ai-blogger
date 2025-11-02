# Local Testing Guide - WP AI Blogger Notifications

## Quick Start - Testing on Local Sites (Flywheel/LocalWP)

### ✅ What Works Locally

1. **Email Notifications** - ✅ FULLY TESTABLE
2. **Notification Settings UI** - ✅ FULLY TESTABLE
3. **Database Persistence** - ✅ FULLY TESTABLE
4. **Action Hooks System** - ✅ FULLY TESTABLE
5. **WhatsApp Notifications** - ⚠️ NEEDS PRODUCTION API (mock it locally)

---

## Setup Email Testing on Local Sites

### Option 1: MailHog (Recommended for Local Sites)

**MailHog** catches all outgoing emails and displays them in a web interface.

**Installation on Local Sites (Flywheel/LocalWP):**

1. **MailHog is often pre-installed** in Local by Flywheel
   - Check if accessible at: `http://localhost:8025`
   
2. **If not installed, add it:**
   ```bash
   # In your Local Sites terminal
   brew install mailhog  # Mac
   # OR
   choco install mailhog  # Windows with Chocolatey
   ```

3. **Start MailHog:**
   ```bash
   mailhog
   ```

4. **Configure WordPress:**
   - MailHog runs on `localhost:1025` for SMTP
   - View emails at `http://localhost:8025`
   - No plugin needed - WordPress will auto-detect

### Option 2: WP Mail SMTP Plugin

1. **Install Plugin:**
   ```
   Plugins → Add New → Search "WP Mail SMTP"
   Install & Activate
   ```

2. **Configure for Local Testing:**
   - Go to: `WP Mail SMTP → Settings`
   - Choose: **Other SMTP**
   - Host: `localhost`
   - Port: `1025` (MailHog) or `25` (default)
   - Auto TLS: OFF
   - Authentication: OFF

### Option 3: Log Emails to File (No Setup Required)

Add this to `wp-config.php`:

```php
// Log emails instead of sending
add_filter('wp_mail', function($args) {
    $log_file = WP_CONTENT_DIR . '/email-notifications.log';
    $log_entry = sprintf(
        "\n\n=== Email Logged at %s ===\nTo: %s\nSubject: %s\nMessage:\n%s\n",
        date('Y-m-d H:i:s'),
        $args['to'],
        $args['subject'],
        $args['message']
    );
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    return $args;
});
```

Then check: `wp-content/email-notifications.log`

---

## Testing Steps

### Step 1: Enable Notifications

1. Navigate to: **WP Admin → WP AI Blogger → Settings → Notifications**

2. **Enable Email Notifications:**
   - Toggle ON
   - Enter your local email: `admin@local.test` or any email
   - For multiple: `admin@local.test, team@local.test`

3. **Enable WhatsApp (Optional for now):**
   - Toggle ON
   - Enter test number: `+1234567890`

4. Settings auto-save to database!

### Step 2: Verify Settings Saved

**Check in Database:**
```sql
-- Using phpMyAdmin or Adminer
SELECT * FROM wp_options 
WHERE option_name LIKE '%notification%';
```

You should see:
- `emailNotificationEnabled` = 1
- `emailNotificationValue` = your email
- `whatsappNotificationEnabled` = 1
- `whatsappNotificationValue` = your phone

### Step 3: Test Campaign Started Notification

1. **Create a Test Campaign:**
   - Go to: **Campaigns → Create New**
   - Fill in:
     - Name: "Test Notification Campaign"
     - Keywords: "WordPress, testing"
     - Target Posts: 3
     - Frequency: Every 1 day
     - Start Date: Now or in 1 minute
     - Status: **Publish**

2. **Wait for Start Date or Trigger First Post:**
   - The notification will be sent when the **first post actually starts creating**
   - Not when you click "Publish", but when cron runs for the first time
   
3. **To Test Immediately (Fast):**

Add to `functions.php` temporarily:

```php
// Trigger first post creation manually
add_action('admin_footer', function() {
    if (isset($_GET['test_campaign_start']) && isset($_GET['campaign_id'])) {
        $campaign_id = absint($_GET['campaign_id']);
        do_action('wpaib_create_single_post', $campaign_id);
        echo '<div class="notice notice-success"><p>First post triggered!</p></div>';
    }
});
```

Then visit: `/wp-admin/?test_campaign_start=1&campaign_id=YOUR_CAMPAIGN_ID`

3. **Check Email:**
   - MailHog: `http://localhost:8025`
   - Or check: `wp-content/email-notifications.log`

**Expected Email:**
```
Subject: 🚀 Campaign Started: Test Notification Campaign

Body:
- Campaign Name: Test Notification Campaign
- Target Posts: 3
- Frequency: Every 1 day
- Keywords: WordPress, testing
- [View Campaign] button
```

**Note:** This notification fires **only once** when the first post creation begins, not when you publish the campaign.

### Step 4: Test Post Created Notification

**Option A: Wait for Cron (Slow)**
- Wait for WordPress cron to run
- May take 1+ minutes

**Option B: Trigger Manually (Fast)**

Add this to `functions.php` temporarily:

```php
// Temporary: Manual cron trigger for testing
add_action('admin_footer', function() {
    if (isset($_GET['test_cron']) && $_GET['test_cron'] === 'yes') {
        $campaign_id = absint($_GET['campaign_id']);
        do_action('wpaib_create_single_post', $campaign_id);
        echo '<div class="notice notice-success"><p>Cron triggered!</p></div>';
    }
});
```

Then visit:
```
/wp-admin/?test_cron=yes&campaign_id=YOUR_CAMPAIGN_ID
```

**Option C: Use WP-Cron CLI**

```bash
# In your Local Sites terminal
cd path/to/public
wp cron event list
wp cron event run wpaib_create_single_post
```

**Expected Email:**
```
Subject: ✅ New Post Created: [Generated Post Title]

Body:
- Post Title: [Generated Post Title]
- Post Number: #1
- Progress: 1 / 3 posts
- Campaign: Test Notification Campaign
- [View Post] [Edit Post] buttons
```

### Step 5: Test Campaign Completed

**Fast Method:**

1. Create campaign with target: **1 post**
2. Wait for 1 post to be created
3. Campaign completes automatically

**Expected Email:**
```
Subject: 🎉 Campaign Completed: Test Notification Campaign

Body:
- Total Posts: 1 / 1
- Status: Completed
- Completion Time: [timestamp]
- [View Campaign] button
```

### Step 6: Test Campaign Failed

**To trigger failure:**

1. Create campaign with **NO keywords** (or invalid settings)
2. Campaign will fail after max retries
3. Or manually trigger:

```php
// Add to functions.php temporarily
add_action('admin_footer', function() {
    if (isset($_GET['test_fail'])) {
        $campaign_id = absint($_GET['campaign_id']);
        do_action('wpaib_campaign_failed', $campaign_id, 'Test failure', [
            'posts_created' => 2,
            'posts_target' => 10,
            'posts_failed' => 8,
        ]);
        echo '<div class="notice notice-error"><p>Failure notification sent!</p></div>';
    }
});
```

Visit: `/wp-admin/?test_fail=1&campaign_id=YOUR_CAMPAIGN_ID`

**Expected Email:**
```
Subject: ⚠️ Campaign Failed: Test Notification Campaign

Body:
- Posts Created: 2 / 10
- Posts Failed: 8
- Reason: Maximum failures reached
- [Review Campaign] button (red)
```

---

## Testing WhatsApp (Local Workaround)

Since WhatsApp needs production API, **mock it locally**:

### Create Mock WhatsApp Handler

Create: `wp-content/mu-plugins/mock-whatsapp.php`

```php
<?php
/**
 * Mock WhatsApp for local testing
 */

add_filter('pre_http_request', function($response, $args, $url) {
    // Intercept WhatsApp API calls
    if (strpos($url, 'send-whatsapp') !== false) {
        // Log to file instead
        $log_file = WP_CONTENT_DIR . '/whatsapp-notifications.log';
        $body = json_decode($args['body'], true);
        
        $log_entry = sprintf(
            "\n\n=== WhatsApp Message at %s ===\nTo: %s\nMessage:\n%s\n",
            date('Y-m-d H:i:s'),
            $body['phone_number'] ?? 'unknown',
            $body['message'] ?? 'no message'
        );
        
        file_put_contents($log_file, $log_entry, FILE_APPEND);
        
        // Return mock success response
        return [
            'response' => ['code' => 200],
            'body' => json_encode(['success' => true, 'message' => 'Mock sent'])
        ];
    }
    
    return $response;
}, 10, 3);
```

Then check: `wp-content/whatsapp-notifications.log`

---

## Debugging Tips

### Check if Hooks are Firing

Add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Log notification hooks
add_action('wpaib_campaign_started', function($id) {
    error_log('✅ Campaign Started Hook Fired: ' . $id);
}, 5);

add_action('wpaib_post_created_successfully', function($cid, $pid) {
    error_log('✅ Post Created Hook Fired: Campaign=' . $cid . ', Post=' . $pid);
}, 5, 2);

add_action('wpaib_campaign_completed', function($id) {
    error_log('✅ Campaign Completed Hook Fired: ' . $id);
}, 5);

add_action('wpaib_campaign_failed', function($id) {
    error_log('✅ Campaign Failed Hook Fired: ' . $id);
}, 5);
```

Check: `wp-content/debug.log`

### Check Notification Helper is Loaded

```php
// Add to functions.php
add_action('init', function() {
    if (class_exists('WPAIBlogger\Inc\Notifications\Notification_Helper')) {
        error_log('✅ Notification Helper is loaded');
    } else {
        error_log('❌ Notification Helper NOT loaded');
    }
});
```

### Verify Email/WhatsApp Settings

```php
// Add to functions.php
add_action('admin_notices', function() {
    $email_enabled = get_option('emailNotificationEnabled');
    $email_value = get_option('emailNotificationValue');
    $whatsapp_enabled = get_option('whatsappNotificationEnabled');
    $whatsapp_value = get_option('whatsappNotificationValue');
    
    echo '<div class="notice notice-info">';
    echo '<p><strong>Notification Settings:</strong></p>';
    echo '<ul>';
    echo '<li>Email Enabled: ' . ($email_enabled ? '✅ Yes' : '❌ No') . '</li>';
    echo '<li>Email: ' . esc_html($email_value) . '</li>';
    echo '<li>WhatsApp Enabled: ' . ($whatsapp_enabled ? '✅ Yes' : '❌ No') . '</li>';
    echo '<li>WhatsApp: ' . esc_html($whatsapp_value) . '</li>';
    echo '</ul>';
    echo '</div>';
});
```

### Force Trigger All Notifications

Create admin page for testing:

```php
// Add to functions.php
add_action('admin_menu', function() {
    add_submenu_page(
        'wp-ai-blogger',
        'Test Notifications',
        'Test Notifications',
        'manage_options',
        'test-notifications',
        function() {
            if (isset($_POST['trigger'])) {
                $type = $_POST['trigger'];
                $campaign_id = 1; // Use real campaign ID
                
                switch($type) {
                    case 'started':
                        do_action('wpaib_campaign_started', $campaign_id, [
                            'postsTarget' => 10,
                            'repeatInterval' => 1,
                            'repeatUnit' => 'day',
                            'keywords' => ['test', 'keywords']
                        ]);
                        break;
                    case 'created':
                        do_action('wpaib_post_created_successfully', $campaign_id, 1, [
                            'post_number' => 1,
                            'posts_created' => 1,
                            'posts_target' => 10
                        ]);
                        break;
                    case 'completed':
                        do_action('wpaib_campaign_completed', $campaign_id, 'target_reached', [
                            'posts_created' => 10,
                            'posts_target' => 10
                        ]);
                        break;
                    case 'failed':
                        do_action('wpaib_campaign_failed', $campaign_id, 'Maximum failures', [
                            'posts_created' => 3,
                            'posts_target' => 10,
                            'posts_failed' => 7
                        ]);
                        break;
                }
                
                echo '<div class="notice notice-success"><p>Notification triggered!</p></div>';
            }
            ?>
            <div class="wrap">
                <h1>Test Notifications</h1>
                <form method="post">
                    <p><button type="submit" name="trigger" value="started" class="button">Test Campaign Started</button></p>
                    <p><button type="submit" name="trigger" value="created" class="button">Test Post Created</button></p>
                    <p><button type="submit" name="trigger" value="completed" class="button">Test Campaign Completed</button></p>
                    <p><button type="submit" name="trigger" value="failed" class="button">Test Campaign Failed</button></p>
                </form>
            </div>
            <?php
        }
    );
});
```

Access at: **WP Admin → WP AI Blogger → Test Notifications**

---

## Common Issues

### Issue: Emails Not Sending

**Solution 1:** Check WordPress mail function
```php
// Add to functions.php
add_action('admin_init', function() {
    $test = wp_mail('test@example.com', 'Test', 'Testing mail');
    error_log('wp_mail test: ' . ($test ? 'SUCCESS' : 'FAILED'));
});
```

**Solution 2:** Check error logs
```bash
tail -f wp-content/debug.log
```

**Solution 3:** Use email logger (see Option 3 above)

### Issue: Settings Not Saving

**Check:** Browser console for errors
**Check:** `wp-content/debug.log` for PHP errors
**Check:** Network tab in DevTools to see AJAX response

**Manual Save via WP-CLI:**
```bash
wp option update emailNotificationEnabled 1
wp option update emailNotificationValue "admin@local.test"
```

### Issue: Cron Not Running

**Check scheduled events:**
```bash
wp cron event list
```

**Trigger manually:**
```bash
wp cron event run wpaib_create_single_post
```

**Enable alternate cron:**
Add to `wp-config.php`:
```php
define('ALTERNATE_WP_CRON', true);
```

---

## Production vs Local Differences

| Feature | Local | Production |
|---------|-------|------------|
| Email Notifications | ✅ Works (via MailHog/SMTP) | ✅ Works (real email) |
| WhatsApp Notifications | ⚠️ Mock/Log only | ✅ Works (real API) |
| Campaign Started | ✅ Full test | ✅ Full test |
| Post Created | ✅ Full test | ✅ Full test |
| Campaign Completed | ✅ Full test | ✅ Full test |
| Campaign Failed | ✅ Full test | ✅ Full test |
| Settings UI | ✅ Full test | ✅ Full test |

---

## Quick Test Checklist

- [ ] Install MailHog or email logger
- [ ] Enable email notifications in settings
- [ ] Create test campaign with low target (1-3 posts)
- [ ] Publish campaign → Check email for "Campaign Started"
- [ ] Wait for post creation → Check email for "Post Created"
- [ ] Wait for completion → Check email for "Campaign Completed"
- [ ] Test failure scenario → Check email for "Campaign Failed"
- [ ] Check `wp-content/debug.log` for hook logs
- [ ] Verify settings persist in database

---

## Next: Production Testing

Once local testing is complete:

1. Deploy to staging/production
2. WhatsApp will work automatically (uses wpaiblogger.com API)
3. Real emails will be sent
4. Monitor error logs

That's it! Everything else is the same. 🚀
