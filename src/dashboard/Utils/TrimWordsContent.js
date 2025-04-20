const TrimWordsContent = ( content ) => {
	return (
		<>
			{ content?.length > 40 ? content?.slice( 0, 40 ) + '...' : content }
		</>
	);
};

export { TrimWordsContent };
