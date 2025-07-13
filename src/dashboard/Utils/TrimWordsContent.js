const TrimWordsContent = ( content, count ) => {
	const wordCount = count ? count : 40;
	return (
		<>
			{ content.length > wordCount ? content.slice( 0, wordCount ) + '...' : content }
		</>
	);
};

export { TrimWordsContent };
