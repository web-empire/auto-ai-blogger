import { __ } from '@wordpress/i18n';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SwitchControl from '@Components/SwitchControl';
import SettingDescription from '@Components/SettingDescription';
import SettingInput from '@Components/SettingInput';
import SettingsContainer from '@Components/SettingsContainer';

export default function Notifications() {
	return (
		<SettingsContainer
			title={ __( 'Review Notification', 'wp-ai-blogger' ) }
			description={ __( 'Toggle notifications for drafted and auto-scheduled posts that require your final review.', 'wp-ai-blogger' ) }
			element={
				<div className="grid grid-cols-2 gap-6 w-full">
					<SettingField>
						<SettingField direction="row">
							<SettingLabel forId="name-of-the-blog" title={ __( 'Mail Notification', 'wp-ai-blogger' ) } />
							<SwitchControl
								checked={ false }
								onChange={ () => {} }
							/>
						</SettingField>
						<SettingInput id="email-notification" defaultValue={ wpaib_localized_data.admin_email } />
						<SettingDescription description={ __( 'Enter multiple email addresses separated by commas.', 'wp-ai-blogger' ) } />
					</SettingField>

					<SettingField>
						<SettingField direction="row">
							<SettingLabel forId="name-of-the-blog" title={ __( 'WhatsApp Notification', 'wp-ai-blogger' ) } />
							<SwitchControl
								checked={ false }
								onChange={ () => {} }
							/>
						</SettingField>
						<SettingInput id="whatsapp-number" placeholder={ '+919876543210' } />
						<SettingDescription description={ __( 'Enter your WhatsApp number to receive notifications.', 'wp-ai-blogger' ) } />
					</SettingField>
				</div>
			}
		/>
	);
}
