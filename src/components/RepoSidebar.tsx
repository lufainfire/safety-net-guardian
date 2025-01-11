const RepoSidebar = () => {
  return (
    <div className="w-full space-y-4">
      <div className="border rounded-md p-4">
        <h2 className="text-base font-semibold mb-2">About</h2>
        <p className="text-sm text-gray-600 mb-4">
          No description, website, or topics provided.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">License</span>
            <span>MIT</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Activity</span>
            <span>Created today</span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <h2 className="text-base font-semibold mb-2">Languages</h2>
        <div className="text-sm text-gray-600">
          No languages detected yet
        </div>
      </div>
    </div>
  );
};

export default RepoSidebar;