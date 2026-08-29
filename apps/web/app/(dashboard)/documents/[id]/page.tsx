"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchDocument, ApiDocument, ApiDocumentVersion } from "@/lib/api/documents";
import { trackRecentView } from "@/lib/recent";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<(ApiDocument & { versions: ApiDocumentVersion[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument(id)
      .then((data) => {
        setDoc(data);
        trackRecentView(data.title, `/documents/${id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load document"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-40 bg-surface-container-low rounded animate-pulse" />;
  if (error || !doc) return <div className="text-sm text-status-negative-text">{error ?? "Document not found."}</div>;

  return (
    <div className="space-y-6">
      <Link href="/documents" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
        ← Back to Documents
      </Link>

      {/* Fixed header to stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary">{doc.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-surface-container-low px-2.5 py-1 rounded-full text-on-surface-variant">{doc.category}</span>
            <span className="text-xs bg-surface-container-low px-2.5 py-1 rounded-full text-on-surface-variant">{doc.linkedTo}</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">Uploaded by: {doc.uploadedBy.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">Edit</button>
          <button className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">Download</button>
        </div>
      </div>

      {/* Fixed grid to stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Version History">
          <div className="space-y-4">
            {doc.versions.map((v) => (
              <div key={v.id} className="pb-3 border-b border-surface-container-highest last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-on-surface">Version {v.versionNumber}.0</span>
                  {v.versionNumber === doc.version && (
                    <span className="text-xs bg-status-positive-bg text-status-positive-text px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{new Date(v.createdAt).toLocaleString()}</p>
                {v.note && <p className="text-sm text-on-surface-variant mt-1">{v.note}</p>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Activity">
          <p className="text-sm text-on-surface-variant">No recent activity.</p>
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Add a comment" className="flex-1 rounded-lg border border-surface-container-highest px-3 py-2 text-sm" />
            <button className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-medium">Post</button>
          </div>
        </Card>
      </div>
    </div>
  );
}