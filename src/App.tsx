import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Sales from './pages/Sales'
import Rentals from './pages/Rentals'
import PropertyDetail from './pages/PropertyDetail'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venta" element={<Sales />} />
        <Route path="/alquiler" element={<Rentals />} />
        <Route path="/venta/:id" element={<PropertyDetail operation="venta" />} />
        <Route path="/alquiler/:id" element={<PropertyDetail operation="alquiler" />} />
        <Route path="/tasacion" element={<Navigate to="/#tasacion" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
