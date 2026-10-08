"use client";

import { useEffect, useState } from "react";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("opsflow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface PortalDocument {
  id: string;
  title: string;
  category: string;
  version: number;
  createdAt: string;
  linkedEntityName?: string | null;
  uploadedBy: { name: string };
}

export default function PortalDocumentsPage() {
  const [docs, setDocs] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/mine`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load documents");
        return r.json();
      })
      .then(setDocs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load documents"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/mine/${id}/download-url`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Download unavailable");
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
    } catch {
      alert("Unable to download this document right now.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="w-10 h-1 bg-gold rounded-full mb-3" />
        <h1 className="font-serif text-3xl text-primary">My Documents</h1>
      </div>

      {loading && <div className="h-32 bg-surface-container-low rounded animate-pulse" />}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-surface-container-highest p-8 text-center">
          <p className="text-sm text-status-negative-text">{error}</p>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="bg-white rounded-lg border border-surface-container-highest p-8 text-center">
          <p className="text-sm text-on-surface-variant">
            No documents have been shared with you yet.
          </p>
        </div>
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="bg-white rounded-lg border border-surface-container-highest shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Title", "Category", "Version", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-xs font-medium text-on-surface-variant uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-primary">{d.title}</td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">{d.category}</td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">v{d.version}</td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDownload(d.id)}
                      disabled={downloadingId === d.id}
                      className="text-sm text-gold hover:underline disabled:opacity-50"
                    >
                      {downloadingId === d.id ? "Opening…" : "Download"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}