"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MOCK_DOCUMENTS, MOCK_DOCUMENT_VERSIONS } from "@/lib/mock-data";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const doc = MOCK_DOCUMENTS.find((d) => d.id === id);

  if (!doc) return <div className="text-sm text-status-negative-text">Document not found.</div>;

  return (
    <div className="space-y-6">
        <Link href="/documents" className="text-sm text-on-surface-variant hover:text-gold transition-colors">
  ← Back to Documents
</Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">{doc.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-surface-container-low px-2.5 py-1 rounded-full text-on-surface-variant">
              {doc.category}
            </span>
            <span className="text-xs bg-surface-container-low px-2.5 py-1 rounded-full text-on-surface-variant">
              {doc.linkedTo}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">Uploaded by: {doc.uploadedBy}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-outline text-on-surface px-4 py-2 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
            Edit
          </button>
          <button className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Version History">
          <div className="space-y-4">
            {MOCK_DOCUMENT_VERSIONS.map((v) => (
              <div key={v.version} className="pb-3 border-b border-surface-container-highest last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-on-surface">Version {v.version}.0</span>
                  {v.current && (
                    <span className="text-xs bg-status-positive-bg text-status-positive-text px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{v.date} · {v.uploader}</p>
                <p className="text-sm text-on-surface-variant mt-1">{v.note}</p>
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