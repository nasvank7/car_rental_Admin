import { useApp } from '../context/AppContext';
import { useRouter } from 'next/router';
import { LogOut, Car, Users, Activity } from 'lucide-react';

export default function Layout({ children }) {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
    router.push('/login');
  };

  if (!state.user) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
    
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Car Rental Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {state.user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                router.pathname === '/dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Car className="h-4 w-4 mr-2" />
              Listings
            </button>
            <button
              onClick={() => router.push('/audit-logs')}
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                router.pathname === '/audit-logs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Audit Logs
            </button>
          </div>
        </div>
      </nav>

 
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

 
      <div className="fixed top-4 right-4 z-50">
        {state.notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-2 p-4 rounded-md shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}
