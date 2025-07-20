import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * Memoized selector for settings to prevent unnecessary re-renders
 */
const selectSettings = ( state ) => ( {
	siteTitle: state.siteTitle || '',
	siteFor: state.siteFor || '',
	siteDescription: state.siteDescription || '',
	license: state.license || '',
	temperature: typeof state.temperature === 'number' ? state.temperature : 0.7,
	harassment: Boolean( state.harassment ),
	hate: Boolean( state.hate ),
	sexuallyExplicit: Boolean( state.sexuallyExplicit ),
	dangerousContent: Boolean( state.dangerousContent ),
	// Add loading and error states
	isLoading: state.isLoading || false,
	error: state.error || null,
} );

/**
 * Enhanced settings selector hook with performance optimization
 *
 * @return {Object} Settings object with current values
 */
export const useSettingsSelector = () => {
	const settings = useSelector( selectSettings );

	// Memoize the settings object to prevent unnecessary re-renders
	// Only recalculate if the actual values change
	return useMemo( () => settings, [
		settings.siteTitle,
		settings.siteFor,
		settings.siteDescription,
		settings.license,
		settings.temperature,
		settings.harassment,
		settings.hate,
		settings.sexuallyExplicit,
		settings.dangerousContent,
		settings.isLoading,
		settings.error,
	] );
};

/**
 * Selector hook for specific setting values to minimize re-renders
 *
 * @param {string} settingKey - The specific setting key to select
 * @return {*} The setting value
 */
export const useSettingSelector = ( settingKey ) => {
	return useSelector( ( state ) => {
		switch ( settingKey ) {
			case 'siteTitle':
				return state.siteTitle || '';
			case 'siteFor':
				return state.siteFor || '';
			case 'siteDescription':
				return state.siteDescription || '';
			case 'license':
				return state.license || '';
			case 'temperature':
				return typeof state.temperature === 'number' ? state.temperature : 0.7;
			case 'harassment':
				return Boolean( state.harassment );
			case 'hate':
				return Boolean( state.hate );
			case 'sexuallyExplicit':
				return Boolean( state.sexuallyExplicit );
			case 'dangerousContent':
				return Boolean( state.dangerousContent );
			case 'isLoading':
				return state.isLoading || false;
			case 'error':
				return state.error || null;
			default:
				console.warn( `Unknown setting key: ${ settingKey }` );
				return null;
		}
	} );
};

/**
 * Hook to check if any settings are currently being saved/updated
 *
 * @return {boolean} True if settings are being updated
 */
export const useSettingsLoading = () => {
	return useSelector( ( state ) => state.isLoading || false );
};

/**
 * Hook to get current settings error state
 *
 * @return {string|null} Error message or null
 */
export const useSettingsError = () => {
	return useSelector( ( state ) => state.error || null );
};
