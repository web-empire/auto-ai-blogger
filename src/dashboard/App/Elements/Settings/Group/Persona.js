import { __ } from '@wordpress/i18n';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import { useDispatch, useSelector } from 'react-redux';

export default function Persona() {
	const dispatch = useDispatch();

	// Retrieve data from Redux store using selectors
	const siteTitle = useSelector( ( state ) => state.siteTitle ) || '';
	const siteFor = useSelector( ( state ) => state.siteFor ) || '';
	const siteDescription = useSelector( ( state ) => state.siteDescription ) || '';
	const temperature = useSelector( ( state ) => state.temperature ) || ( ! autoblog_data.temperature ? 1 : autoblog_data.temperature );
	const harassment = useSelector( ( state ) => state.harassment ) || 0;
	const hate = useSelector( ( state ) => state.hate ) || 0;
	const sexuallyExplicit = useSelector( ( state ) => state.sexuallyExplicit ) || 0;
	const dangerousContent = useSelector( ( state ) => state.dangerousContent ) || 0;
	const civicIntegrity = useSelector( ( state ) => state.civicIntegrity ) || 1;

	const handleTemperatureChange = ( value ) => {
		dispatch( { type: 'UPDATE_TEMPERATURE', payload: value } );
	};

	const handleHarassmentChange = ( value ) => {
		dispatch( { type: 'UPDATE_HARASSMENT', payload: value } );
	};

	const handleHateChange = ( value ) => {
		dispatch( { type: 'UPDATE_HATE', payload: value } );
	};

	const handleSexuallyExplicitChange = ( value ) => {
		dispatch( { type: 'UPDATE_SEXUALLY_EXPLICIT', payload: value } );
	};

	const handleDangerousContentChange = ( value ) => {
		dispatch( { type: 'UPDATE_DANGEROUS_CONTENT', payload: value } );
	};

	const handleCivicIntegrityChange = ( value ) => {
		dispatch( { type: 'UPDATE_CIVIC_INTEGRITY', payload: value } );
	};

	return (
		<>
			<div className="grid grid-cols-2 gap-6 w-full">
				<SettingField>
					<SettingLabel forId="name-of-the-blog" title={ __( 'Title for your site:', 'wp-ai-blogger' ) } />
					<input
						id="name-of-the-blog"
						value={ siteTitle }
						onChange={ ( e ) => {
							dispatch( { type: 'UPDATE_SITE_TITLE', payload: e.target.value } );
						} }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="blog-for" title={ __( 'This site is for:', 'wp-ai-blogger' ) } />
					<input
						id="blog-for"
						value={ siteFor }
						onChange={ ( e ) => {
							dispatch( { type: 'UPDATE_SITE_FOR', payload: e.target.value } );
						} }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="temperature" title={ __( 'Temperature:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="temperature"
						min="0"
						max="2"
						step="0.05"
						value={ temperature }
						onChange={ ( e ) => handleTemperatureChange( parseFloat( e.target.value ) ) }
					/>
					<p>{ temperature }</p>
				</SettingField>

				<SettingField>
					<SettingLabel forId="harassment" title={ __( 'Harassment:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="harassment"
						min="0"
						max="2"
						step="1"
						value={ harassment }
						onChange={ ( e ) => handleHarassmentChange( parseInt( e.target.value ) ) }
					/>
					<p>{ [ 'Block none', 'Block some', 'Block high' ][ harassment ] }</p>
				</SettingField>

				<SettingField>
					<SettingLabel forId="hate" title={ __( 'Hate:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="hate"
						min="0"
						max="2"
						step="1"
						value={ hate }
						onChange={ ( e ) => handleHateChange( parseInt( e.target.value ) ) }
					/>
					<p>{ [ 'Block none', 'Block some', 'Block high' ][ hate ] }</p>
				</SettingField>

				<SettingField>
					<SettingLabel forId="sexually-explicit" title={ __( 'Sexually Explicit:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="sexually-explicit"
						min="0"
						max="2"
						step="1"
						value={ sexuallyExplicit }
						onChange={ ( e ) => handleSexuallyExplicitChange( parseInt( e.target.value ) ) }
					/>
					<p>{ [ 'Block none', 'Block some', 'Block high' ][ sexuallyExplicit ] }</p>
				</SettingField>

				<SettingField>
					<SettingLabel forId="dangerous-content" title={ __( 'Dangerous Content:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="dangerous-content"
						min="0"
						max="2"
						step="1"
						value={ dangerousContent }
						onChange={ ( e ) => handleDangerousContentChange( parseInt( e.target.value ) ) }
					/>
					<p>{ [ 'Block none', 'Block some', 'Block high' ][ dangerousContent ] }</p>
				</SettingField>

				<SettingField>
					<SettingLabel forId="civic-integrity" title={ __( 'Civic Integrity:', 'wp-ai-blogger' ) } />
					<input
						type="range"
						id="civic-integrity"
						min="0"
						max="2"
						step="1"
						value={ civicIntegrity }
						onChange={ ( e ) => handleCivicIntegrityChange( parseInt( e.target.value ) ) }
					/>
					<p>{ [ 'Block none', 'Block some', 'Block high' ][ civicIntegrity ] }</p>
				</SettingField>
			</div>

			<SettingField>
				<SettingLabel forId="more-about-blog" title={ __( 'Tell us more about your site:', 'wp-ai-blogger' ) } />
				<textarea
					id="more-about-blog"
					value={ siteDescription }
					onChange={ ( e ) => {
						dispatch( { type: 'UPDATE_SITE_DESCRIPTION', payload: e.target.value } );
					} }
				/>
			</SettingField>
		</>
	);
}
