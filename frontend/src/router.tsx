import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Achievements } from './pages/Achievements';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/achievements',
        element: <Achievements />,
      },
      {
        path: '/achievements/new',
        element: <div className="p-8">Add Achievement (Coming Soon)</div>,
      },
      {
        path: '/settings',
        element: <div className="p-8">Settings (Coming Soon)</div>,
      },
    ],
  },
]);