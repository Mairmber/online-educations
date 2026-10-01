// Codebox — reads the app's synced GitHub repository through the shared GitHub connector.
// Actions: repos (list repos), tree (file list), file (one file's content), zip (whole repo as ZIP).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const API = "https://api.github.com";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");
    if (!accessToken) {
      return Response.json({ error: "GitHub is not connected." }, { status: 500 });
    }
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Eduqasion-Codebox",
    };

    let body = {};
    try { body = await req.json(); } catch {}

    const action = body.action || "repos";

    if (action === "repos") {
      const res = await fetch(`${API}/user/repos?per_page=100&sort=updated`, { headers });
      if (!res.ok) return Response.json({ error: `GitHub error ${res.status}` }, { status: 502 });
      const repos = await res.json();
      return Response.json({
        repos: repos.map(r => ({
          full_name: r.full_name,
          private: r.private,
          html_url: r.html_url,
          default_branch: r.default_branch,
          updated_at: r.updated_at,
        })),
      });
    }

    if (action === "tree") {
      const repo = body.repo;
      if (!repo) return Response.json({ error: "repo required" }, { status: 400 });
      const metaRes = await fetch(`${API}/repos/${repo}`, { headers });
      if (!metaRes.ok) return Response.json({ error: `Repository not reachable (${metaRes.status})` }, { status: 404 });
      const meta = await metaRes.json();
      const branch = body.branch || meta.default_branch;
      const res = await fetch(`${API}/repos/${repo}/git/trees/${branch}?recursive=1`, { headers });
      if (!res.ok) return Response.json({ error: `Could not read file tree (${res.status})` }, { status: 502 });
      const tree = await res.json();
      return Response.json({
        repo: meta.full_name,
        branch,
        default_branch: meta.default_branch,
        html_url: meta.html_url,
        pushed_at: meta.pushed_at,
        files: (tree.tree || []).filter(f => f.type === "blob").map(f => ({ path: f.path, size: f.size })),
        truncated: !!tree.truncated,
      });
    }

    if (action === "file") {
      const { repo, path, ref } = body;
      if (!repo || !path) return Response.json({ error: "repo and path required" }, { status: 400 });
      const url = `${API}/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
      const res = await fetch(url, { headers });
      if (!res.ok) return Response.json({ error: `Could not read file (${res.status})` }, { status: 404 });
      const data = await res.json();
      let content = "";
      if (data.encoding === "base64" && data.content) {
        const bytes = Uint8Array.from(atob(data.content), c => c.charCodeAt(0));
        content = new TextDecoder().decode(bytes);
      }
      return Response.json({ path: data.path, size: data.size, content });
    }

    if (action === "zip") {
      const { repo, ref } = body;
      if (!repo) return Response.json({ error: "repo required" }, { status: 400 });
      const res = await fetch(`${API}/repos/${repo}/zipball/${ref || "main"}`, { headers });
      if (!res.ok) return Response.json({ error: `Could not build the ZIP (${res.status})` }, { status: 502 });
      const bytes = new Uint8Array(await res.arrayBuffer());
      let binary = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      return Response.json({
        zip_base64: btoa(binary),
        filename: `${repo.split("/")[1] || "project"}-${ref || "main"}.zip`,
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}