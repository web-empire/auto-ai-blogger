import { useSelector } from 'react-redux';

export const useSettingsSelector = () => {
	return useSelector( ( state ) => ( {
		siteTitle: state.siteTitle,
		siteFor: state.siteFor,
		siteDescription: state.siteDescription,
		license: state.license,
		temperature: state.temperature,
		harassment: state.harassment,
		hate: state.hate,
		sexuallyExplicit: state.sexuallyExplicit,
		dangerousContent: state.dangerousContent,
	} ) );
};
