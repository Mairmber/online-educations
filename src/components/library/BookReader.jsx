import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function BookReader({ book, onClose, onDownload }) {
  return (
    <Dialog open={!!book} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogTitle className="sr-only">{book?.title || "Read book"}</DialogTitle>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{book?.title}</p>
            {book?.author && <p className="text-xs text-gray-500 truncate">{book.author}</p>}
          </div>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => onDownload(book)} disabled={!book?.file_url}>
            <Download className="w-4 h-4 mr-1" /> Download
          </Button>
        </div>
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {book?.file_url ? (
            <iframe src={book.file_url} title={book.title || "Book"} className="w-full h-full border-0" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
              No readable preview for this title. Use Download if a file is available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}