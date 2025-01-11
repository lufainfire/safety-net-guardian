import { Star, GitFork, Eye } from "lucide-react";

const RepoHeader = () => {
  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <span className="font-semibold text-blue-600 hover:underline cursor-pointer">YourUsername</span>
        <span>/</span>
        <span className="font-semibold text-blue-600 hover:underline cursor-pointer">safety-net</span>
      </div>
      
      <div className="flex items-center gap-4 mt-2">
        <button className="inline-flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-50">
          <Star size={16} />
          Star
        </button>
        <button className="inline-flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-50">
          <GitFork size={16} />
          Fork
        </button>
        <button className="inline-flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-50">
          <Eye size={16} />
          Watch
        </button>
        
        <div className="flex items-center gap-2 ml-4">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-gray-600" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={16} className="text-gray-600" />
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoHeader;