import { __ } from '@wordpress/i18n';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SettingInput from '@Components/SettingInput';
import SettingTextArea from '@Components/SettingTextArea';

export default function Persona() {
	return (
		<>
			<div className="grid grid-cols-2 gap-6 w-full">
				<SettingField>
					<SettingLabel forId="name-of-the-blog" title={ __( 'Name of the Blog:', 'wp-ai-blogger' ) } />
					<SettingInput id="name-of-the-blog" defaultValue={ autoblog_data.blog_name } />
				</SettingField>

				<SettingField>
					<SettingLabel forId="blog-for" title={ __( 'This blog is for:', 'wp-ai-blogger' ) } />
					<SettingInput id="blog-for" />
				</SettingField>
			</div>

			<SettingField>
				<SettingLabel forId="more-about-blog" title={ __( 'Tell us more about your blog:', 'wp-ai-blogger' ) } />
				<SettingTextArea id="more-about-blog" />
			</SettingField>
		</>
	);
}
