import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MOCK_WORKFLOW } from "@/lib/mock-data";

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-primary">Workflows</h1>
      <Card>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
              {["ID", "Title", "Current Stage", "Created"].map((h) => (
                <th key={h} className="py-4 px-2 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            <tr className="hover:bg-surface-bright/50 transition-colors">
              <td className="py-4 px-2 text-sm text-on-surface-variant">{MOCK_WORKFLOW.id}</td>
              <td className="py-4 px-2">
                <Link href={`/workflows/${MOCK_WORKFLOW.id}`} className="text-sm text-primary font-medium hover:text-gold transition-colors">
                  {MOCK_WORKFLOW.title}
                </Link>
              </td>
              <td className="py-4 px-2 text-sm text-on-surface-variant">
                {MOCK_WORKFLOW.stages[MOCK_WORKFLOW.currentStageIndex]}
              </td>
              <td className="py-4 px-2 text-sm text-on-surface-variant">{MOCK_WORKFLOW.createdAt}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}