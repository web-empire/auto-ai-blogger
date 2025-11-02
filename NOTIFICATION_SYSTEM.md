# WP AI Blogger - Notification System Implementation

## Phase 1 Implementation Complete ✅

This document outlines the notification system implementation for WP AI Blogger Phase 1 (Essential triggers).

---

## Implemented Features

### 1. **Notification Triggers** (Phase 1)

#### ✅ Campaign Started
- **Trigger:** When the first post actually starts creating (start date is met)
- **Location:** `inc/cron-handler.php` → `create_single_post_from_campaign()`
- **Hook:** `do_action('wpaib_campaign_started', $campaign_id, $meta_input)`
- **Condition:** Fires only when `posts_created === 0 && posts_scheduled === 0`
- **Notifications:** Email + WhatsApp

#### ✅ Post Created Successfully
- **Trigger:** When a post is successfully created from campaign
- **Location:** `inc/cron-handler.php` → `create_single_post_from_campaign()`
- **Hook:** `do_action('wpaib_post_created_successfully', $campaign_id, $post_id, $data)`
- **Notifications:** Email + WhatsApp

#### ✅ Campaign Completed
- **Trigger:** When campaign reaches target posts
- **Location:** `inc/cron-handler.php` → `generate_post_from_campaign()`
- **Hook:** `do_action('wpaib_campaign_completed', $campaign_id, 'target_reached', $data)`
- **Notifications:** Email + WhatsApp

#### ✅ Campaign Failed/Terminated
- **Trigger:** When maximum failures exceeded
- **Location:** `inc/cron-handler.php` → `mark_campaign_completed()`
- **Hook:** `do_action('wpaib_campaign_failed', $campaign_id, $reason, $data)`
- **Notifications:** Email + WhatsApp

---

## File Structure

```
wp-ai-blogger/
├── inc/
│   └── notifications/
│       ├── notification-helper.php     # Main notification handler
│       ├── email-templates.php         # HTML email templates
│       └── whatsapp-handler.php        # WhatsApp API integration
├── inc/
│   └── cron-handler.php               # Updated with notification hooks
├── admin/
│   └── ajax.php                       # Updated with campaign started hook
├── src/
│   └── dashboard/
│       ├── App/Elements/Settings/
│       │   └── Notifications.js        # UI for notification settings
│       └── Store/
│           └── globalDataReducer.js    # Redux with notification actions
└── loader.php                         # Initialize Notification_Helper
```

---

## Backend Implementation

### Notification Helper (`inc/notifications/notification-helper.php`)
**Purpose:** Central notification handler that listens to action hooks and dispatches notifications.

**Key Methods:**
- `handle_campaign_started()` - Process campaign started notifications
- `handle_post_created()` - Process post created notifications
- `handle_campaign_completed()` - Process campaign completed notifications
- `handle_campaign_failed()` - Process campaign failed notifications
- `send_notification()` - Dispatch to email and WhatsApp channels
- `are_notifications_enabled()` - Check if any notifications are enabled

### Email Templates (`inc/notifications/email-templates.php`)
**Purpose:** Beautiful HTML email templates for each notification type.

**Features:**
- Responsive design with inline CSS
- Professional gradient headers
- Detailed campaign/post information
- Action buttons (View Campaign, Edit Post, etc.)
- Status indicators and progress tracking

**Templates:**
- `campaign_started_template()` - 🚀 Campaign started
- `post_created_template()` - ✅ Post created successfully
- `campaign_completed_template()` - 🎉 Campaign completed
- `campaign_failed_template()` - ⚠️ Campaign failed/terminated

### WhatsApp Handler (`inc/notifications/whatsapp-handler.php`)
**Purpose:** Handle WhatsApp notifications via API integration.

**Key Methods:**
- `send_notification()` - Send WhatsApp message
- `get_message()` - Format message for notification type
- `send_whatsapp_message()` - API call to WhatsApp service
- `validate_phone_number()` - Validate international phone format

**API Endpoint:** `https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/send-whatsapp`

**Message Format:**
- Plain text with emojis for better readability
- Campaign/post details
- Action URLs
- Site branding

---

## Frontend Implementation

### Notifications Settings UI (`src/dashboard/App/Elements/Settings/Notifications.js`)

**Features:**
- Toggle switches for Email and WhatsApp notifications
- Input validation (email pattern and phone pattern)
- Real-time validation feedback with icons
- Help text and error messages
- Auto-save to database on change
- Sync with Redux store

**Validation:**
- **Email:** Supports multiple emails separated by commas
- **Phone:** International format validation (+[country code][number])

**Redux Actions:**
- `UPDATE_EMAIL_NOTIFICATION_ENABLED`
- `UPDATE_EMAIL_NOTIFICATION_VALUE`
- `UPDATE_WHATSAPP_NOTIFICATION_ENABLED`
- `UPDATE_WHATSAPP_NOTIFICATION_VALUE`

---

## Database Storage

Settings are stored in WordPress options table:

| Option Key | Type | Default |
|------------|------|---------|
| `emailNotificationEnabled` | boolean | false |
| `emailNotificationValue` | string | admin email |
| `whatsappNotificationEnabled` | boolean | false |
| `whatsappNotificationValue` | string | empty |

**Settings Location:** `inc/utils/settings.php` → `get_settings_dataset()`

---

## Usage & Testing

### 1. Enable Notifications
1. Go to **WP AI Blogger** → **Settings** → **Notifications**
2. Toggle **Email Notifications** ON
3. Enter email address(es) - e.g., `admin@example.com, team@example.com`
4. Toggle **WhatsApp Notifications** ON (optional)
5. Enter WhatsApp number with country code - e.g., `+1234567890`

### 2. Test Triggers

#### Test Campaign Started
```
1. Create a new campaign
2. Set status to "Publish"
3. Click "Save"
→ Should receive notification when campaign is scheduled
```

#### Test Post Created Successfully
```
1. Wait for campaign to create a post (or trigger manually)
2. Check cron execution
→ Should receive notification when post is created
```

#### Test Campaign Completed
```
1. Create campaign with low target (e.g., 3 posts)
2. Wait for all posts to be created
→ Should receive notification when target is reached
```

#### Test Campaign Failed
```
1. Create campaign with invalid settings (e.g., no keywords)
2. Campaign will fail after max retries
→ Should receive notification when terminated
```

---

## Email Template Preview

### Campaign Started Email
```
Subject: 🚀 Campaign Started: [Campaign Name]

Header: Gradient purple banner with site name
Body:
  - Campaign name
  - Target posts
  - Frequency
  - Keywords
Button: "View Campaign" (links to campaigns page)
```

### Post Created Email
```
Subject: ✅ New Post Created: [Post Title]

Body:
  - Post title
  - Post number (#1, #2, etc.)
  - Campaign progress (5 / 10 posts)
Buttons:
  - "View Post" (green)
  - "Edit Post" (gray)
```

### Campaign Completed Email
```
Subject: 🎉 Campaign Completed: [Campaign Name]

Body:
  - Total posts created
  - Completion time
  - Success rate
Button: "View Campaign"
```

### Campaign Failed Email
```
Subject: ⚠️ Campaign Failed: [Campaign Name]

Body:
  - Posts created/failed
  - Failure reason
  - Troubleshooting tips (red alert box)
Button: "Review Campaign" (red)
```

---

## WhatsApp Message Format

```
🚀 *Campaign Started*

*My Blog Campaign*

📊 Target: 10 posts
⏰ Frequency: Every 1 day
🔑 Keywords: AI, technology

View: https://example.com/campaigns

— Site Name
```

---

## API Integration

### WhatsApp API Requirements
- **Endpoint:** `wpaiblogger.com/wp-json/wp-ai-blogger/v1/send-whatsapp`
- **Method:** POST
- **Authentication:** License key (from plugin settings)
- **Payload:**
  ```json
  {
    "license": "xxxx-xxxx-xxxx",
    "phone_number": "+1234567890",
    "message": "Formatted notification message"
  }
  ```

### Error Handling
- All API errors are logged to `error_log()`
- Silent failures (doesn't block campaign execution)
- Retries handled by WhatsApp service

---

## Security

### Input Validation
- Email addresses validated with regex pattern
- Phone numbers validated (international format)
- All inputs sanitized before storage
- CSRF protection via WordPress nonces

### Data Privacy
- Email/phone stored in WordPress options (encrypted at rest)
- Only sent to authorized notification services
- Users can disable notifications anytime

---

## Future Enhancements (Phase 2 & 3)

### Phase 2 (Important)
- Post Creation Failed
- Post Abandoned (after max retries)
- Campaign Paused/Resumed

### Phase 3 (Nice to Have)
- Milestone Reached (25%, 50%, 75%)
- High Failure Rate Alert
- API Quota Warning
- Daily/Weekly Summary Digest

---

## Troubleshooting

### Notifications Not Sending

1. **Check if notifications are enabled:**
   ```php
   get_option('emailNotificationEnabled'); // Should be true
   ```

2. **Verify email/phone are set:**
   ```php
   get_option('emailNotificationValue'); // Should have email(s)
   get_option('whatsappNotificationValue'); // Should have phone
   ```

3. **Check notification helper is loaded:**
   ```php
   // In loader.php, verify:
   Notification_Helper::get_instance();
   ```

4. **Test hooks are firing:**
   ```php
   // Add to functions.php temporarily:
   add_action('wpaib_campaign_started', function($campaign_id) {
       error_log('Campaign started: ' . $campaign_id);
   });
   ```

5. **Check email sending:**
   - Test with a simple `wp_mail()` call
   - Verify SMTP settings (use plugin like WP Mail SMTP)

### WhatsApp Not Working

1. **Check license key is set:**
   ```php
   get_option('license'); // Should have valid license
   ```

2. **Verify API endpoint is accessible:**
   ```php
   $response = wp_remote_get('https://wpaiblogger.com/wp-json/');
   // Should return 200 status
   ```

3. **Check error logs:**
   ```bash
   tail -f wp-content/debug.log | grep "WhatsApp"
   ```

---

## Code Examples

### Adding Custom Notification
```php
// In your plugin/theme:
add_action('wpaib_campaign_started', function($campaign_id, $campaign_data) {
    // Custom notification logic
    $custom_email = 'custom@example.com';
    wp_mail(
        $custom_email,
        'Custom Campaign Alert',
        'Campaign ' . $campaign_id . ' started!'
    );
}, 20, 2); // Priority 20 to run after main notifications
```

### Filtering Email Content
```php
add_filter('wpaib_email_template_data', function($template_data, $notification_type) {
    if ($notification_type === 'campaign_started') {
        $template_data['subject'] = 'CUSTOM: ' . $template_data['subject'];
    }
    return $template_data;
}, 10, 2);
```

### Modifying WhatsApp Message
```php
add_filter('wpaib_whatsapp_message', function($message, $notification_type, $data) {
    // Add custom footer
    $message .= "\n\nPowered by My Custom System";
    return $message;
}, 10, 3);
```

---

## Changelog

### Version 1.0.0 (Phase 1)
- ✅ Campaign Started notification
- ✅ Post Created Successfully notification
- ✅ Campaign Completed notification
- ✅ Campaign Failed/Terminated notification
- ✅ Email notifications with HTML templates
- ✅ WhatsApp notifications via API
- ✅ Settings UI with validation
- ✅ Redux integration for persistence
- ✅ Database storage for settings

---

## Credits

**Developed for:** WP AI Blogger
**Version:** 1.0.0
**Implementation Date:** October 29, 2025
**Developer:** AI Assistant

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs: `wp-content/debug.log`
3. Contact support at: support@wpaiblogger.com

---

## License

This implementation is part of WP AI Blogger plugin.
All rights reserved.
