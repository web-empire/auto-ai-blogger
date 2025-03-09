/**
 * Convert array of classes into a single string.
 *
 * @param {Array} classes Selectors to combine.
 * @return {string}         The single-line selector string.
 *
 * @since 1.0.0
 */
export const wpAiClassNames = ( ...classes ) => classes.filter( Boolean ).join( ' ' );

/**
 * A function to check if an object is not empty.
 *
 * @function
 *
 * @param {Object} obj - The object to check.
 *
 * @return {boolean} Returns true if the object is not empty, otherwise returns false.
 */
export const isObjectNotEmpty = ( obj ) => {
	return obj && Object.keys( obj ).length > 0 && Object.getPrototypeOf( obj ) === Object.prototype;
};

export const multiSelectCustomStyle = {
	control: ( provided ) => ( {
		...provided,
		cursor: 'pointer',
		fontSize: '0.875rem', // Tailwind Text-sm.
		lineHeight: '1.25rem', // Tailwind Text-sm.
		borderRadius: '0.375rem', // Tailwind Rounded-md.
		color: '#64748b', // Tailwind Slate-500.
		borderColor: '#dce0e6', // Tailwind Slate-200.
		boxShadow: 'none',
	} ),
	placeholder: ( provided ) => ( {
		...provided,
		color: '#1e293b', // Tailwind Slate-800.
	} ),
	multiValue: ( provided ) => ( {
		...provided,
		margin: '0',
		fontWeight: '600', // Tailwind Font-semibold.
		borderRadius: '0.25rem', // Tailwind Rounded.
		backgroundColor: '#f1f5f9', // Tailwind Slate-200.
		marginRight: '2px',
	} ),
	multiValueLabel: ( provided ) => ( {
		...provided,
		fontWeight: '600', // Tailwind Font-semibold.
		color: '#0f172a', // Tailwind Slate-900.
	} ),
	multiValueRemove: ( provided ) => ( {
		...provided,
		color: '#0f172a', // Tailwind Slate-900.
		'&:hover': {
			color: '#ef4444', // Tailwind Red-500.
			backgroundColor: '#f1f5f9', // Tailwind Slate-200.
		},
	} ),
};
