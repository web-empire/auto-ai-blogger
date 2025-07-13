import { __ } from '@wordpress/i18n';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SettingInput from '@Components/SettingInput';
import SettingInputRange from '@Components/SettingInputRange';
import { useDispatch, useSelector } from 'react-redux';
import Container from '@Components/Container';

export default function Persona() {
	const dispatch = useDispatch();

	// Retrieve data from Redux store using selectors.
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
					<SettingInput
						id="name-of-the-blog"
						defaultValue={ siteTitle }
						onChange={ ( e ) => {
							dispatch( { type: 'UPDATE_SITE_TITLE', payload: e.target.value } );
						} }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="blog-for" title={ __( 'Description for your site:', 'wp-ai-blogger' ) } />
					<SettingInput
						id="blog-for"
						defaultValue={ siteFor }
						onChange={ ( e ) => {
							dispatch( { type: 'UPDATE_SITE_FOR', payload: e.target.value } );
						} }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="temperature" title={ __( 'Temperature:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500"> { temperature } </span>
							</>
						}
					/>
					<SettingInputRange
						id="temperature"
						step="0.05"
						defaultValue={ temperature }
						onChange={ ( e ) => handleTemperatureChange( parseFloat( e.target.value ) ) }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="harassment" title={ __( 'Harassment:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500">{ [ 'Block none', 'Block some', 'Block high' ][ harassment ] }</span>
							</>
						}
					/>
					<SettingInputRange
						id="harassment"
						defaultValue={ harassment }
						onChange={ ( e ) => handleHarassmentChange( parseInt( e.target.value ) ) }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="hate" title={ __( 'Hate:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500">{ [ 'Block none', 'Block some', 'Block high' ][ hate ] }</span>
							</>
						}
					/>
					<SettingInputRange
						id="hate"
						defaultValue={ hate }
						onChange={ ( e ) => handleHateChange( parseInt( e.target.value ) ) }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="sexually-explicit" title={ __( 'Sexually Explicit:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500">{ [ 'Block none', 'Block some', 'Block high' ][ sexuallyExplicit ] }</span>
							</>
						}
					/>
					<SettingInputRange
						id="sexually-explicit"
						defaultValue={ sexuallyExplicit }
						onChange={ ( e ) => handleSexuallyExplicitChange( parseInt( e.target.value ) ) }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="dangerous-content" title={ __( 'Dangerous Content:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500">{ [ 'Block none', 'Block some', 'Block high' ][ dangerousContent ] }</span>
							</>
						}
					/>
					<SettingInputRange
						id="dangerous-content"
						defaultValue={ dangerousContent }
						onChange={ ( e ) => handleDangerousContentChange( parseInt( e.target.value ) ) }
					/>
				</SettingField>

				<SettingField>
					<Container
						direction="row"
						element={
							<>
								<SettingLabel forId="civic-integrity" title={ __( 'Civic Integrity:', 'wp-ai-blogger' ) } />
								<span className="text-sm/6 text-gray-500">{ [ 'Block none', 'Block some', 'Block high' ][ civicIntegrity ] }</span>
							</>
						}
					/>
					<SettingInputRange
						id="civic-integrity"
						defaultValue={ civicIntegrity }
						onChange={ ( e ) => handleCivicIntegrityChange( parseInt( e.target.value ) ) }
					/>
				</SettingField>
			</div>

			<SettingField>
				<SettingLabel forId="more-about-blog" title={ __( 'Tell us more about your site:', 'wp-ai-blogger' ) } />
				<textarea
					id="more-about-blog"
					value={ siteDescription }
					className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
					onChange={ ( e ) => {
						dispatch( { type: 'UPDATE_SITE_DESCRIPTION', payload: e.target.value } );
					} }
				/>
			</SettingField>
		</>
	);
}
