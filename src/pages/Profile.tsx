import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronLeft, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center h-14 px-4">
            <Link to="/" className="p-2 text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="flex-1 text-center font-bold text-gray-800">Profile</h1>
            <div className="w-9"></div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold mb-2">Sign in to view profile</h2>
          <Link to="/auth" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="p-2 text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-gray-800">Profile</h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="space-y-3">
          <Link
            to="/bookmarks"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="font-medium">My Bookmarks</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
