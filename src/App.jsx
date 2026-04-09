import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import BookList from './pages/BookList'
import BookForm from './pages/BookForm'
import BookDetail from './pages/BookDetail'
import Stats from './pages/Stats'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/books" replace />} />
                  <Route path="/books" element={<BookList />} />
                  <Route path="/books/new" element={<BookForm />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/books/:id/edit" element={<BookForm />} />
                  <Route path="/stats" element={<Stats />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
