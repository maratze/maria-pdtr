import React, { useState } from 'react';

const AccordionItem = ({ title, children, isOpen, onToggle, isFirst, isLast }) => {
	return (
		<div className={`group relative bg-white border-b border-gray-200 last:border-b-0 overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
			}`}>
			{/* Левый акцентный бар */}
			<div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isOpen ? 'bg-ocean-500' : 'bg-transparent'
				}`}></div>

			<button
				onClick={onToggle}
				className="w-full px-4 sm:px-6 py-5 text-left flex justify-between items-center transition-colors duration-200"
			>
				<h3 className={`text-md sm:text-lg font-medium transition-colors duration-200 ${isOpen ? 'text-ocean-600' : 'text-gray-800 group-hover:text-ocean-600'
					}`}>
					{title}
				</h3>

				<div className={`w-6 h-6 flex items-center justify-center transition-all duration-300 ${isOpen ? 'transform rotate-180 text-ocean-500' : 'text-gray-400'
					}`}>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</button>
			<div
				className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
					}`}
			>
				<div className="min-h-0">
					<div className="px-6 pb-5">
						<div className="text-gray-700 leading-relaxed text-sm">
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const Accordion = ({ items, allowMultiple = false }) => {
	const [openItems, setOpenItems] = useState(new Set([0]));

	const toggleItem = (index) => {
		const newOpenItems = new Set(openItems);

		if (allowMultiple) {
			if (newOpenItems.has(index)) {
				newOpenItems.delete(index);
			} else {
				newOpenItems.add(index);
			}
		} else {
			// Single item mode - close all others
			if (newOpenItems.has(index)) {
				newOpenItems.clear();
			} else {
				newOpenItems.clear();
				newOpenItems.add(index);
			}
		}

		setOpenItems(newOpenItems);
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
			{items.map((item, index) => (
				<AccordionItem
					key={index}
					title={item.title}
					isOpen={openItems.has(index)}
					onToggle={() => toggleItem(index)}
					isFirst={index === 0}
					isLast={index === items.length - 1}
				>
					{item.content}
				</AccordionItem>
			))}
		</div>
	);
};

export default Accordion;