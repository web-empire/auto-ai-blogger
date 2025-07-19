import { __ } from '@wordpress/i18n';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SettingInput from '@Components/SettingInput';
import { useDispatch, useSelector } from 'react-redux';
import { RangeControl } from '@wordpress/components';

export default function Persona() {
	const dispatch = useDispatch();

	// Retrieve data from Redux store using selectors.
	const siteTitle = useSelector( ( state ) => state.siteTitle ) || '';
	const siteFor = useSelector( ( state ) => state.siteFor ) || '';
	const siteDescription = useSelector( ( state ) => state.siteDescription ) || '';
	const temperature = parseFloat( useSelector( ( state ) => state.temperature ) );
	const harassment = parseInt( useSelector( ( state ) => state.harassment ) );
	const hate = parseInt( useSelector( ( state ) => state.hate ) );
	const sexuallyExplicit = parseInt( useSelector( ( state ) => state.sexuallyExplicit ) );
	const dangerousContent = parseInt( useSelector( ( state ) => state.dangerousContent ) );

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

	// Helper array for the new 0-4 block levels
	const blockLabels = [
		__( 'Off', 'wp-ai-blogger' ),
		__( 'Block none', 'wp-ai-blogger' ),
		__( 'Block few', 'wp-ai-blogger' ),
		__( 'Block some', 'wp-ai-blogger' ),
		__( 'Block most', 'wp-ai-blogger' ),
	];

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
					<SettingLabel forId="more-about-blog" title={ __( 'Tell us more about your site:', 'wp-ai-blogger' ) } />
					<SettingInput
						id="more-about-blog"
						defaultValue={ siteDescription }
						onChange={ ( e ) => {
							dispatch( { type: 'UPDATE_SITE_DESCRIPTION', payload: e.target.value } );
						} }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="temperature" title={ __( 'Temperature:', 'wp-ai-blogger' ) } />
					<RangeControl
						value={ temperature }
						onChange={ handleTemperatureChange }
						min={ 0 }
						max={ 2 }
						step={ 0.05 }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="harassment" title={ __( 'Harassment:', 'wp-ai-blogger' ) } />
					<RangeControl
						value={ harassment }
						onChange={ handleHarassmentChange }
						min={ 0 }
						max={ 4 }
						step={ 1 }
						withInputField={ false }
						renderTooltipContent={ ( value ) => {
							const label = blockLabels[ value ] || '';
							return (
								<>
									{ label }
								</>
							);
						} }
						marks={ [
							{ value: 0, label: blockLabels[ 0 ] },
							{ value: 1, label: 1 },
							{ value: 2, label: 2 },
							{ value: 3, label: 3 },
							{ value: 4, label: 4 },
						] }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="hate" title={ __( 'Hate:', 'wp-ai-blogger' ) } />
					<RangeControl
						value={ hate }
						onChange={ handleHateChange }
						min={ 0 }
						max={ 4 }
						step={ 1 }
						withInputField={ false }
						renderTooltipContent={ ( value ) => {
							const label = blockLabels[ value ] || '';
							return (
								<>
									{ label }
								</>
							);
						} }
						marks={ [
							{ value: 0, label: blockLabels[ 0 ] },
							{ value: 1, label: 1 },
							{ value: 2, label: 2 },
							{ value: 3, label: 3 },
							{ value: 4, label: 4 },
						] }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="sexually-explicit" title={ __( 'Sexually Explicit:', 'wp-ai-blogger' ) } />
					<RangeControl
						value={ sexuallyExplicit }
						onChange={ handleSexuallyExplicitChange }
						min={ 0 }
						max={ 4 }
						step={ 1 }
						withInputField={ false }
						renderTooltipContent={ ( value ) => {
							const label = blockLabels[ value ] || '';
							return (
								<>
									{ label }
								</>
							);
						} }
						marks={ [
							{ value: 0, label: blockLabels[ 0 ] },
							{ value: 1, label: 1 },
							{ value: 2, label: 2 },
							{ value: 3, label: 3 },
							{ value: 4, label: 4 },
						] }
					/>
				</SettingField>

				<SettingField>
					<SettingLabel forId="dangerous-content" title={ __( 'Dangerous Content:', 'wp-ai-blogger' ) } />
					<RangeControl
						value={ dangerousContent }
						onChange={ handleDangerousContentChange }
						renderTooltipContent={ ( value ) => {
							const label = blockLabels[ value ] || '';
							return (
								<>
									{ label }
								</>
							);
						} }
						min={ 0 }
						max={ 4 }
						withInputField={ false }
						step={ 1 }
						marks={ [
							{ value: 0, label: blockLabels[ 0 ] },
							{ value: 1, label: 1 },
							{ value: 2, label: 2 },
							{ value: 3, label: 3 },
							{ value: 4, label: 4 },
						] }
					/>
				</SettingField>
			</div>
		</>
	);
}
