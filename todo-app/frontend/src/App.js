import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to todos if already logged in)
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/todos" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/todos" 
                element={
                  <ProtectedRoute>
                    <TodoList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/todos/new" 
                element={
                  <ProtectedRoute>
                    <TodoForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/todos/edit/:id" 
                element={
                  <ProtectedRoute>
                    <TodoForm />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/todos" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;