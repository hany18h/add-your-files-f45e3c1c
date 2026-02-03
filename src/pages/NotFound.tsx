import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
        <p className="mb-4 text-xl text-gray-500">Page not found</p>
        <Link to="/" className="text-purple-600 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
