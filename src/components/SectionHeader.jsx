import React from 'react';

const SectionHeader = ({ title, isDarkMode = false }) => {
	return (
		<div className="text-center mb-6">
			<h2 className={`text-3xl sm:text-4xl md:text-5xl font-light mb-4 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
				{title}
			</h2>
			<div className={`w-20 h-1 mx-auto ${isDarkMode ? 'bg-ocean-500' : 'bg-ocean-500'}`}></div>
		</div>
	);
};

export default SectionHeader;