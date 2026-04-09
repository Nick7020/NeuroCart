import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Chatbot } from '../components/ai/Chatbot'

export function CustomerLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  )
}
