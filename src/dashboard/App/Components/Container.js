import { aiClassNames } from '@Utils/aiClassNames';

const Container = ( props ) => {
	const {
		direction = 'column',
		gap = 'gap-2',
		className = '',
		element = null,
	} = props;

	const directionClasses = 'row' === direction ? 'flex-row justify-between' : 'flex-col';

	return (
		<div
			className={ aiClassNames(
				`flex ${ directionClasses } ${ gap } w-full`,
				className
			) }
		>
			{ element }
		</div>
	);
};

export default Container;
