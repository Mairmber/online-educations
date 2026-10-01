import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function CertificateModal({ open, onClose, studentName, courseName, instructorName, completionDate }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const iframeRef = useRef(null);

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a beautiful, professional HTML certificate of completion.
Student Name: ${studentName}
Course Name: ${courseName}
Instructor: ${instructorName || "Eduqasion Instructor"}
Date: ${completionDate}
Platform: Eduqasion

Requirements:
- Self-contained HTML with inline CSS only (no external links)
- Elegant design with a decorative border, seal/ribbon element using CSS/unicode
- Color scheme: deep navy (#1e3a6e), gold (#c9a84c), white background
- Include: certificate title, student name (large, prominent), course name, completion date, instructor signature line, Eduqasion platform branding
- Add a decorative star/medal unicode symbol
- Use Google Fonts via @import url in a <style> tag for a serif font (Playfair Display)
- Fixed size: 800px x 560px, centered content
- Output ONLY the raw HTML, no markdown, no explanation`,
    });
    setHtml(result);
    setGenerated(true);
    setLoading(false);
  };

  const handleOpen = (isOpen) => {
    if (isOpen && !generated) generate();
    if (!isOpen) onClose();
  };

  const downloadCertificate = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${courseName?.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700">
            <Award className="w-5 h-5 text-yellow-500" /> Completion Certificate
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-gray-500 text-sm">Generating your certificate…</p>
          </div>
        )}

        {generated && html && (
          <div className="space-y-4">
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="w-full"
                style={{ height: "400px", border: "none" }}
                title="Certificate Preview"
                sandbox="allow-same-origin"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
              <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={downloadCertificate}>
                <Download className="w-4 h-4 mr-2" /> Download Certificate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}