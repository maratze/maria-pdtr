import React from 'react'
import { Link } from 'react-router-dom';
import Logo from './components/Logo';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import PDTRMethod from './components/PDTRMethod';
import Cases from './components/Cases';
import Testimonials from './components/Testimonials';
import './App.css'

function App() {
	return (
		<div className="min-h-screen font-sans text-slate-800">
			<Navigation />
			<Hero />
			<PDTRMethod />
			<Cases />
			<Testimonials />
		</div>
	)
}

export default App
