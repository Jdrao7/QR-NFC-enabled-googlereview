import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import {LoginPage} from './pages/LoginPage';
import {SignupPage} from './pages/SignupPage';
import {Dashboard} from './pages/Dashboard';
import {ProtectedRoute} from './components/ProtectedRoute';
import {PublicRoute} from './components/PublicRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/:businessRoute',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}