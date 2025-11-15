import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-4 mb-4">
          <img 
            src="/logo.jpg" 
            alt="LingoDocs Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-lg"
          />
          <h1 className="text-6xl font-bold text-primary">404</h1>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
