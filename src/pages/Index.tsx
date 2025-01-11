import RepoHeader from "@/components/RepoHeader";
import FileExplorer from "@/components/FileExplorer";
import RepoSidebar from "@/components/RepoSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <RepoHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2 space-y-4">
            <FileExplorer />
          </div>
          <div className="md:col-span-1">
            <RepoSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;