import { aiClassNames } from '@Utils/aiClassNames';

const SettingField = ( { children, direction = 'column' } ) => {
	if ( ! children ) {
		return null;
	}

	return (
		<div
			className={ aiClassNames(
				'flex justify-start gap-2 w-full',
				direction === 'column' ? 'flex-col' : 'flex-row items-center justify-between'
			) }
		>
			{ children }
		</div>
	);
};

export default SettingField;
