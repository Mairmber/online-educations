import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Copy, Check, Download, ExternalLink, RefreshCw, Loader2,
  Folder, FolderOpen, FileCode, Code2 as CodeboxIcon, Lock,
} from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "codebox_repo";

function buildInvoke() {
  return (payload) => base44.functions.invoke("codebox", payload).then(r => r.data);
}

function Tree({ node, base, openSet, toggle, onSelect, selectedPath }) {
  const dirs = Object.keys(node.dirs || {}).sort();
  const files = (node.files || []).slice().sort((a, b) => a.path.localeCompare(b.path));
  const depth = base ? base.split("/").length : 0;
  return (
    <div>
      {dirs.map(d => {
        const p = base ? `${base}/${d}` : d;
        const open = openSet.has(p);
        return (
          <div key={p}>
            <button
              onClick={() => toggle(p)}
              className="flex items-center gap-2 w-full text-left py-1.5 pr-2 rounded-lg text-xs font-semibold text-[#1e2d55] hover:bg-[#eef3ff]"
              style={{ paddingLeft: 8 + depth * 14 }}
            >
              {open ? <FolderOpen className="w-3.5 h-3.5 text-[#2458e8] shrink-0" /> : <Folder className="w-3.5 h-3.5 text-[#2458e8] shrink-0" />}
              <span className="truncate">{d}</span>
            </button>
            {open && (
              <Tree node={node.dirs[d]} base={p} openSet={openSet} toggle={toggle} onSelect={onSelect} selectedPath={selectedPath} />
            )}
          </div>
        );
      })}
      {files.map(f => {
        const name = f.path.split("/").pop();
        const sel = selectedPath === f.path;
        return (
          <button
            key={f.path}
            onClick={() => onSelect(f)}
            className={`flex items-center gap-2 w-full text-left py-1.5 pr-2 rounded-lg text-xs truncate transition-colors ${sel ? "bg-[#2458e8] text-white font-semibold" : "text-[#53617e] hover:bg-[#eef3ff]"}`}
            style={{ paddingLeft: 8 + depth * 14 + 18 }}
          >
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${sel ? "text-[#ffe27a]" : "text-[#7180a0]"}`} />
            <span className="truncate">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function CodeboxPage() {
  const { user, isAuthenticated } = useAuth();
  const invoke = buildInvoke();
  const [repos, setRepos] = useState([]);
  const [repo, setRepo] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTree, setLoadingTree] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [openSet, setOpenSet] = useState(new Set(["src", "src/pages", "src/components", "base44"]));

  const isAdmin = isAuthenticated && user?.role === "admin";

  const loadRepos = async () => {
    setLoading(true);
    try {
      const res = await invoke({ action: "repos" });
      const list = res.repos || [];
      setRepos(list);
      const saved = localStorage.getItem(STORAGE_KEY);
      const found = list.find(r => r.full_name === saved);
      if (found) { selectRepo(found, false); return; }
      const guess = list.find(r => r.full_name.toLowerCase().includes("online-educations") || r.full_name.toLowerCase().includes("base44"));
      if (guess) selectRepo(guess, true);
    } catch (e) {
      toast.error(e?.message || "Could not reach GitHub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) loadRepos(); }, [isAdmin]);

  const selectRepo = async (r, save) => {
    setRepo(r);
    setTree(null);
    setSelected(null);
    setFileData(null);
    if (save) localStorage.setItem(STORAGE_KEY, r.full_name);
    setLoadingTree(true);
    try {
      const res = await invoke({ action: "tree", repo: r.full_name, branch: r.default_branch });
      setTree(res);
    } catch (e) {
      toast.error(e?.message || "Could not load the project files.");
    } finally {
      setLoadingTree(false);
    }
  };

  const openFile = async (f) => {
    setSelected(f);
    setLoadingFile(true);
    try {
      const res = await invoke({ action: "file", repo: repo.full_name, path: f.path, branch: tree?.branch });
      setFileData(res);
    } catch (e) {
      toast.error(e?.message || "Could not read the file.");
    } finally {
      setLoadingFile(false);
    }
  };

  const copyFile = async () => {
    if (!fileData?.content) return;
    await navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    toast.success("File copied to clipboard.");
    setTimeout(() => setCopied(false), 1600);
  };

  const share = async () => {
    if (!tree?.html_url) return;
    await navigator.clipboard.writeText(tree.html_url);
    toast.success("Share link copied — paste it anywhere.");
  };

  const downloadZip = async () => {
    if (!repo || !tree) return;
    setZipping(true);
    try {
      const res = await invoke({ action: "zip", repo: repo.full_name, ref: tree.branch });
      const bytes = Uint8Array.from(atob(res.zip_base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/zip" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("ZIP downloaded — the whole project folder in one file.");
    } catch (e) {
      toast.error(e?.message || "Could not build the ZIP.");
    } finally {
      setZipping(false);
    }
  };

  const toggle = (p) => setOpenSet(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  const treeRoot = tree?.files?.length
    ? (tree.files || []).reduce((acc, f) => {
        const parts = f.path.split("/");
        let node = acc;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!node.dirs[parts[i]]) node.dirs[parts[i]] = { dirs: {}, files: [] };
          node = node.dirs[parts[i]];
        }
        node.files.push(f);
        return acc;
      }, { dirs: {}, files: [] })
    : null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f9ff]">
        <SiteNav />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <CodeboxIcon className="w-12 h-12 mx-auto text-[#2458e8] mb-4" />
          <h1 className="text-2xl font-extrabold text-[#16234a] mb-2">Codebox</h1>
          <p className="text-sm text-[#62708c] mb-6">Sign in as an admin to browse, copy and download the project's code.</p>
          <Link to="/login"><Button className="bg-[#2458e8] hover:bg-[#173ca9] text-white">Portal Login</Button></Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f9ff]">
        <SiteNav />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Lock className="w-12 h-12 mx-auto text-[#7180a0] mb-4" />
          <h1 className="text-2xl font-extrabold text-[#16234a] mb-2">Admins only</h1>
          <p className="text-sm text-[#62708c]">The Codebox is restricted to platform administrators.</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] flex flex-col">
      <SiteNav />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="bg-[#2458e8] text-white rounded-[25px] p-5 mb-5 shadow-[0_14px_30px_rgba(36,88,232,0.2)]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/15 grid place-items-center"><CodeboxIcon className="w-5 h-5" /></span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Codebox</h1>
              <p className="text-[#dce5ff] text-xs mt-0.5">The whole project's code in one place — always in sync with the app.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={repo?.full_name || ""} onValueChange={(v) => { const r = repos.find(x => x.full_name === v); if (r) selectRepo(r, true); }}>
              <SelectTrigger className="bg-white/10 border-white/30 text-white text-xs w-full sm:w-64 [&>svg]:text-white">
                <SelectValue placeholder={loading ? "Loading repositories…" : "Choose repository"} />
              </SelectTrigger>
              <SelectContent>
                {repos.map(r => <SelectItem key={r.full_name} value={r.full_name}>{r.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={loadRepos}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {tree && (
              <>
                <Button size="sm" className="bg-[#ffe27a] text-[#173ca9] hover:bg-[#fff0b3]" onClick={downloadZip} disabled={zipping}>
                  {zipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download ZIP
                </Button>
                <Button size="sm" className="bg-white text-[#173ca9] hover:bg-[#e9f0ff]" onClick={share}>
                  <Copy className="w-4 h-4" /> Share Link
                </Button>
                <a href={tree.html_url} target="_blank" rel="noopener" className="inline-flex">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                    <ExternalLink className="w-4 h-4" /> GitHub
                  </Button>
                </a>
              </>
            )}
          </div>
          {tree && (
            <p className="text-[10px] text-[#dce5ff] mt-3">
              {tree.repo} · branch {tree.branch} · {tree.files.length} files · last update {tree.pushed_at ? new Date(tree.pushed_at).toLocaleString() : "—"}
            </p>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#2458e8] animate-spin" /></div>
        ) : repos.length === 0 ? (
          <div className="bg-white border border-[#dce4ff] rounded-[20px] p-8 text-center">
            <CodeboxIcon className="w-10 h-10 mx-auto text-[#7180a0] mb-3" />
            <h2 className="font-extrabold text-[#16234a] mb-1">No repositories yet</h2>
            <p className="text-sm text-[#62708c] max-w-md mx-auto">
              Connect the app's code to GitHub from the Dashboard (GitHub icon → Connect to GitHub and create the repository).
              Once synced, the Codebox will pick it up automatically — and update itself with every new feature.
            </p>
          </div>
        ) : !repo ? (
          <div className="bg-white border border-[#dce4ff] rounded-[20px] p-6 text-center text-sm text-[#62708c]">
            Choose a repository above to load its code.
          </div>
        ) : loadingTree ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#2458e8] animate-spin" /></div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-4">
            {/* File tree */}
            <div className="bg-white border border-[#dce4ff] rounded-[20px] p-3 max-h-[70vh] overflow-y-auto">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#7180a0] px-2 pb-2">Project Folder</p>
              {tree?.truncated && <p className="text-[10px] text-amber-700 px-2 pb-2">File list was truncated by GitHub — very large repo.</p>}
              {treeRoot ? <Tree node={treeRoot} base="" openSet={openSet} toggle={toggle} onSelect={openFile} selectedPath={selected?.path} /> : (
                <p className="text-xs text-[#7180a0] px-2">No files found in this repository.</p>
              )}
            </div>
            {/* Viewer */}
            <div className="bg-white border border-[#dce4ff] rounded-[20px] overflow-hidden flex flex-col min-h-[420px]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eef1fb] bg-[#f7f9ff]">
                <FileCode className="w-4 h-4 text-[#2458e8] shrink-0" />
                <span className="text-xs font-bold text-[#1e2d55] truncate flex-1">{selected ? selected.path : "Select a file to view"}</span>
                {selected && fileData?.content && (
                  <Button size="sm" className="bg-[#2458e8] hover:bg-[#173ca9] text-white h-7 text-xs" onClick={copyFile}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
              {loadingFile ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-[#2458e8] animate-spin" /></div>
              ) : selected && fileData?.content !== undefined ? (
                <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed text-[#2a3650] bg-white whitespace-pre-wrap break-words font-mono">{fileData.content || "(empty file)"}</pre>
              ) : (
                <div className="flex-1 grid place-items-center text-center text-sm text-[#7180a0] p-8">
                  <div>
                    <CodeboxIcon className="w-10 h-10 mx-auto mb-3 text-[#c4cfec]" />
                    Pick any file from the folder tree — read it here, copy it, or download the whole project as a ZIP.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}