import { File, Folder } from "lucide-react";

const files = [
  { name: "README.md", type: "file" },
  { name: "src", type: "folder" },
  { name: "package.json", type: "file" },
  { name: "tsconfig.json", type: "file" },
];

const FileExplorer = () => {
  return (
    <div className="border rounded-md">
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="text-sm px-2 py-1 rounded hover:bg-gray-200">main</button>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          <code>{'<>'}</code> Code
        </button>
      </div>
      
      <div className="divide-y">
        {files.map((file) => (
          <div key={file.name} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
            {file.type === "folder" ? (
              <Folder size={16} className="text-blue-600" />
            ) : (
              <File size={16} className="text-gray-600" />
            )}
            <span className="text-sm">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;