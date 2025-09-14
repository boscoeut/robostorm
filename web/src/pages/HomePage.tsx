
export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to RoboStorm
          </h1>
          <p className="text-gray-600 mb-6">
            Your gateway to the world of robotics and automation.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Explore Robots
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
