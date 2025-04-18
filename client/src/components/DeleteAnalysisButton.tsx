import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteAnalysis } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAnalysisButtonProps {
  id: number;
  courseName: string;
  onDelete: () => void;
}

export default function DeleteAnalysisButton({ id, courseName, onDelete }: DeleteAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAnalysis(id);
      toast({
        title: "Analysis deleted",
        description: `"${courseName}" has been removed from the database.`,
      });
      onDelete();
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete the analysis.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="text-neutral-400 hover:text-error hover:bg-error/10"
      >
        <Trash2 size={16} />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="rounded-lg border-0 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium flex items-center gap-2 text-neutral-900">
              <span className="material-icons text-red-500">warning</span>
              Delete Analysis
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 mt-2">
              You are about to delete the analysis for <strong className="text-neutral-800 font-medium">{courseName}</strong>. 
              <div className="mt-2 bg-amber-50 border border-amber-100 rounded-md p-3 text-amber-800 text-sm">
                <div className="flex items-start">
                  <span className="material-icons text-amber-500 mr-2 text-base">info</span>
                  <span>This action cannot be undone. All analysis results for this syllabus will be permanently removed from the database.</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={isDeleting} className="border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-0 font-medium shadow-sm"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="material-icons mr-1 text-base">delete</span>
                  Delete
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}