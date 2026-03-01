import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, FileType } from "lucide-react";

export const FilePreview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Since we don't have the full object details loaded in a state from just an ID in this step,
    // we would ideally fetch the file details via an API (e.g. `getFileDetails(id)`).
    // For the UI logic, we'll implement a mock representation. Note: If it's OTHER, it's a directory.
    // Assuming for UI demonstration we just state 'File Preview' or 'Directory Preview'.

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Media Preview</h2>
            </div>

            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                    <FileType className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Previewing Object: <span className="text-blue-600">{id}</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                    This is a preview screen for file and directory objects. In a full implementation, media such as images or videos would render here. Directories (type OTHER) would explicitly show their contents.
                </p>
            </div>
        </div>
    );
};
