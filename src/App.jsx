import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import PrivateRoute from './components/PrivateRoute'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import Hero from './components/Hero'
import GiftCertificate from './components/GiftCertificate'
import PDTRMethod from './components/PDTRMethod'
import Cases from './components/Cases'
import Testimonials from './components/Testimonials'
import Services from './components/Services'
import Contacts from './components/Contacts'
import AdminReviews from './pages/AdminReviews'
import AdminLogin from './pages/AdminLogin'
import AdminCategories from './pages/AdminCategories'
import AdminServices from './pages/AdminServices'
import AdminSchedule from './pages/AdminSchedule'
import AdminCases from './pages/AdminCases'
import AdminSecurity from './pages/AdminSecurity'
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
		<Routes>
			{/* Public routes with Navigation */}
			<Route
				path="/"
				element={
					<div className="min-h-screen font-sans text-slate-800">
						<Navigation />
						<HomePage />
					</div>
				}
			/>

			{/* Auth routes without Navigation */}
			<Route
				path="/admin/login"
				element={
					<AuthLayout>
						<AdminLogin />
					</AuthLayout>
				}
			/>

			{/* Admin routes with Admin Layout */}
			<Route
				path="/admin/reviews"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminReviews />
						</AdminLayout>
					</PrivateRoute>
				}
			/>
			<Route
				path="/admin/categories"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminCategories />
						</AdminLayout>
					</PrivateRoute>
				}
			/>
			<Route
				path="/admin/services"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminServices />
						</AdminLayout>
					</PrivateRoute>
				}
			/>
			<Route
				path="/admin/cases"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminCases />
						</AdminLayout>
					</PrivateRoute>
				}
			/>
			<Route
				path="/admin/schedule"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminSchedule />
						</AdminLayout>
					</PrivateRoute>
				}
			/>
			<Route
				path="/admin/security"
				element={
					<PrivateRoute>
						<AdminLayout>
							<AdminSecurity />
						</AdminLayout>
					</PrivateRoute>
				}
			/>

			{/* Catch-all route for 404 */}
			<Route
				path="*"
				element={
					<div className="min-h-screen font-sans text-slate-800">
						<NotFound />
					</div>
				}
			/>
		</Routes>
	)
}

export default App
