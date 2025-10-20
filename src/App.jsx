import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import GiftCertificate from './components/GiftCertificate'
import PDTRMethod from './components/PDTRMethod'
import Cases from './components/Cases'
import Testimonials from './components/Testimonials'
import Services from './components/Services'
import Contacts from './components/Contacts'
import AdminReviews from './pages/AdminReviews'
import NotFound from './pages/NotFound'
import './App.css'

function HomePage() {
	return (
		<>
			<Hero />
			<GiftCertificate />
			<PDTRMethod />
			<Cases />
			<Testimonials />
			<Services />
			<Contacts />
		</>
	)
}

function App() {
	return (
		<div className="min-h-screen font-sans text-slate-800">
			<Navigation />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/admin/reviews" element={<AdminReviews />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	)
}

export default App
