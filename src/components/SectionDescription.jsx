import React from 'react';

const SectionDescription = ({ text, isDarkMode = false }) => {
	return (
		<p className={`text-md md:text-lg max-w-3xl mx-auto px-2 sm:px-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
			{text}
		</p>
	);
};

export default SectionDescription;