import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
}
