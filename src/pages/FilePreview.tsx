import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, FileQuestion, Image, Video, Music, FileText } from "lucide-react";

const sourceTypeIcon: Record<string, React.ReactNode> = {
    IMAGE: <Image className="h-10 w-10 text-blue-500" />,
    VIDEO: <Video className="h-10 w-10 text-purple-500" />,
    AUDIO: <Music className="h-10 w-10 text-amber-500" />,
};

export const FilePreview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const url = searchParams.get("url") ?? "";
    const name = searchParams.get("name") ?? id ?? "";
    const sourceType = (searchParams.get("sourceType") ?? "").toUpperCase();

    const renderMedia = () => {
        if (!url) return null;

        if (sourceType === "IMAGE") {
            return (
                <img
                    src={url}
                    alt={name}
                    className="max-w-full max-h-[70vh] rounded-lg object-contain shadow"
                />
            );
        }

        if (sourceType === "VIDEO") {
            return (
                <video
                    src={url}
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg shadow"
                >
                    Your browser does not support video playback.
                </video>
            );
        }

        if (sourceType === "AUDIO") {
            return (
                <audio src={url} controls className="w-full mt-4">
                    Your browser does not support audio playback.
                </audio>
            );
        }

        return null;
    };

    const media = renderMedia();

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Media Preview</h2>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
                {/* File name + type header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        {sourceTypeIcon[sourceType] ?? <FileText className="h-6 w-6 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={name}>{name}</p>
                        <p className="text-xs text-slate-500 capitalize">{sourceType.toLowerCase() || "File"} &middot; {id}</p>
                    </div>
                </div>

                {/* Media render area */}
                <div className="flex items-center justify-center min-h-[300px]">
                    {media ?? (
                        <div className="flex flex-col items-center text-slate-400 gap-3">
                            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                <FileQuestion className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">No preview available for this file type.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
