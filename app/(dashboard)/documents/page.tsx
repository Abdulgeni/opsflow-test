"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UploadDocumentModal } from "@/components/documents/upload-document-modal";
import { MOCK_DOCUMENTS, OpsDocument } from "@/lib/mock-data";

const CATEGORIES = ["Legal", "Property", "Finance", "Compliance"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<OpsDocument[]>(MOCK_DOCUMENTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [linkedTo, setLinkedTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const linkedToOptions = Array.from(new Set(documents.map((d) => d.linkedTo)));

  const filtered = documents.filter((d) => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && d.category !== category) return false;
    if (linkedTo && d.linkedTo !== linkedTo) return false;
    return true;
  });

  function handleUpload(data: { title: string; category: string; linkedTo: string }) {
    const newDoc: OpsDocument = {
      id: String(Date.now()),
      title: data.title,
      category: data.category,
      linkedTo: data.linkedTo,
      uploadedBy: "You",
      version: 1,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setDocuments((prev) => [newDoc, ...prev]);
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

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-on-surface-variant">No documents match your filters.</p>
          </div>
        ) : (
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
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-2">
                    <Link href={`/documents/${d.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                      {d.title}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.category}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.linkedTo}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.uploadedBy}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">v{d.version}</td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">{d.date}</td>
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