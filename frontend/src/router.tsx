import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';

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
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);