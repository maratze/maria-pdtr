import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ className = "" }) => {
	return (
		<Link
			to="/"
			className={`flex items-center gap-3 text-lg font-bold text-ocean-600 ${className}`}
			aria-label="Главная"
		>
			<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
				{/* Outer circle with gradient */}
				<defs>
					<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#0ea5e9" />
						<stop offset="100%" stopColor="#0284c7" />
					</linearGradient>
					<radialGradient id="innerGradient" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
						<stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.6" />
					</radialGradient>
				</defs>

				{/* Main circle */}
				<circle cx="18" cy="18" r="16" fill="url(#innerGradient)" stroke="url(#logoGradient)" strokeWidth="2" />

				{/* Central design - stylized brain/neural network */}
				<g transform="translate(18, 18)">
					{/* Central node */}
					<circle cx="0" cy="0" r="2.5" fill="url(#logoGradient)" />

					{/* Neural connections */}
					<path d="M-8 -6 Q-4 -3 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
					<path d="M8 -6 Q4 -3 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
					<path d="M-8 6 Q-4 3 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
					<path d="M8 6 Q4 3 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
					<path d="M0 -8 Q0 -4 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
					<path d="M0 8 Q0 4 0 0" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeLinecap="round" />

					{/* Outer nodes */}
					<circle cx="-8" cy="-6" r="1.5" fill="#0284c7" />
					<circle cx="8" cy="-6" r="1.5" fill="#0284c7" />
					<circle cx="-8" cy="6" r="1.5" fill="#0284c7" />
					<circle cx="8" cy="6" r="1.5" fill="#0284c7" />
					<circle cx="0" cy="-8" r="1.5" fill="#0284c7" />
					<circle cx="0" cy="8" r="1.5" fill="#0284c7" />
				</g>
			</svg>
			<div className="flex flex-col">
				<span className="text-lg font-bold leading-tight">M.S.</span>
				<span className="text-xs font-medium text-ocean-500 -mt-1">P-DTR</span>
			</div>
		</Link>
	)
}

export default Logo
