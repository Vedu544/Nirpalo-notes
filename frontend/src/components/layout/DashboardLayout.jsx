import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Search,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Activity,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../common/Button';
import Card from '../common/Card';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected, activeUsers } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'My Notes', href: '/dashboard', icon: FileText },
    { name: 'Search', href: '/dashboard/search', icon: Search },
    { name: 'Shared', href: '/dashboard/shared', icon: Users },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-25" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
          <h1 className="text-xl font-bold text-primary-600">Nirpalo Notes</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* User info */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`} />
              <span className="text-xs text-secondary-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* New Note Button */}
            <Button
              onClick={() => {
                navigate('/dashboard/new');
                setSidebarOpen(false);
              }}
              className="w-full justify-start mb-4"
              icon={Plus}
              iconPosition="left"
            >
              New Note
            </Button>

            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Active users */}
          {activeUsers.length > 0 && (
            <div className="px-4 py-4 border-t border-secondary-200">
              <p className="text-xs font-medium text-secondary-500 mb-2">Active Users</p>
              <div className="space-y-1">
                {activeUsers.map((activeUser, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="avatar avatar-sm">
                      {activeUser.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-xs text-secondary-700 truncate">
                      {activeUser.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-secondary-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start"
              icon={LogOut}
              iconPosition="left"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden h-16 bg-white border-b border-secondary-200 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-secondary-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;