const SettingInputRange = ( {
	id,
	onChange = () => {},
	defaultValue = '',
	type = 'range',
	placeholder = '',
	min = '0',
	max = '2',
	step = '1',
} ) => {
	const handleChange = ( event ) => {
		onChange( event );
	};

	return (
		<input
			id={ id }
			name={ id }
			placeholder={ placeholder }
			onChange={ handleChange }
			type={ type }
			min={ min }
			max={ max }
			step={ step }
			value={ defaultValue }
			className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:bg-indigo-600 slider-thumb:rounded-full slider-thumb:cursor-pointer focus:outline-none"
		/>
	);
};

export default SettingInputRange;
