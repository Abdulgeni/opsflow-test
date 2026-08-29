"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UploadDocumentModal } from "@/components/documents/upload-document-modal";
import { fetchDocuments, createDocument, ApiDocument } from "@/lib/api/documents";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = ["Legal", "Property", "Finance", "Compliance"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [linkedTo, setLinkedTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocuments({ search, category, linkedTo });
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, linkedTo]);

  const linkedToOptions = Array.from(new Set(documents.map((d) => d.linkedTo)));

  async function handleUpload(data: { title: string; category: string; linkedTo: string }) {
    await createDocument(data);
    await load();
    show("Document uploaded successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-primary">Documents</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Upload document
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-surface-container-highest px-4 py-2 text-sm focus:border-gold focus:ring-gold"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Category: All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={linkedTo}
            onChange={(e) => setLinkedTo(e.target.value)}
            className="rounded-lg border border-surface-container-highest px-3 py-2 text-sm"
          >
            <option value="">Linked to: All</option>
            {linkedToOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-low rounded" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-sm text-status-negative-text mb-2">{error}</p>
            <button onClick={load} className="text-sm text-gold underline">Retry</button>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">No documents match your filters.</p>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                {["Title", "Category", "Linked to", "Uploaded by", "Version", "Date"].map((h) => (
                  <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2">
                    <Link href={`/documents/${d.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                      {d.title}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.category}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.linkedTo}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.uploadedBy.name}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">v{d.version}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UploadDocumentModal open={modalOpen} onClose={() => setModalOpen(false)} onUpload={handleUpload} />
    </div>
  );
}