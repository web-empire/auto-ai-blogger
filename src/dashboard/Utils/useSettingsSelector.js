import { useSelector } from 'react-redux';

export const useSettingsSelector = () => {
    return useSelector((state) => ({
        siteTitle: state.siteTitle,
        siteFor: state.siteFor,
        siteDescription: state.siteDescription,
        temperature: state.temperature,
        harassment: state.harassment,
        hate: state.hate,
        sexually_explicit: state.sexually_explicit,
        dangerous_content: state.dangerous_content,
        civic_integrity: state.civic_integrity,
    }));
};