import { __ } from '@wordpress/i18n';
import SettingsContainer from '@Components/SettingsContainer';
import { Persona } from '@Elements/Settings/Group';

export default function General() {
	return (
		<SettingsContainer
			title={ __( 'Persona', 'wp-ai-blogger' ) }
			description={ __( 'Let AI know about your site persona, so it can generate better content for you.', 'wp-ai-blogger' ) }
			element={ <Persona /> }
		/>
	);
}
