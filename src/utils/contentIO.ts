import { Quest, Location, CEFRLevel, ContentStatus } from "@/types/content";

export interface HealthStats {
  totalLocations: number;
  totalQuests: number;
  totalQuestions: number;
  statusCounts: {
    draft: number;
    in_review: number;
    approved: number;
    published: number;
    archived: number;
  };
  cefrCounts: Record<CEFRLevel, number>;
  factCheckFlagsCount: number;
  missingMediaCount: number;
}

export function computeHealthStats(locations: Location[]): HealthStats {
  const stats: HealthStats = {
    totalLocations: locations.length,
    totalQuests: 0,
    totalQuestions: 0,
    statusCounts: { draft: 0, in_review: 0, approved: 0, published: 0, archived: 0 },
    cefrCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 },
    factCheckFlagsCount: 0,
    missingMediaCount: 0,
  };

  locations.forEach((loc) => {
    (loc.chapters || []).forEach((chap) => {
      chap.lessons.forEach((les) => {
        les.quests.forEach((q) => {
          stats.totalQuests += 1;
          const status = q.status || "draft";
          if (stats.statusCounts[status] !== undefined) {
            stats.statusCounts[status] += 1;
          }

          q.steps.forEach((step) => {
            stats.totalQuestions += 1;
            const qObj = step.question;
            if (qObj.cefrLevel && stats.cefrCounts[qObj.cefrLevel] !== undefined) {
              stats.cefrCounts[qObj.cefrLevel] += 1;
            }
            if (qObj.factCheckNeeded) {
              stats.factCheckFlagsCount += 1;
            }
            if (!qObj.media) {
              stats.missingMediaCount += 1;
            }
          });
        });
      });
    });
  });

  return stats;
}

export function exportLocationsJSON(locations: Location[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locations, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `learntrip_content_export_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportQuestsCSV(locations: Location[]): void {
  const rows: string[][] = [
    ["LocationID", "LocationName", "QuestID", "QuestTitleVi", "QuestTitleEn", "Status", "QuestionsCount", "XpReward"],
  ];

  locations.forEach((loc) => {
    (loc.chapters || []).forEach((chap) => {
      chap.lessons.forEach((les) => {
        les.quests.forEach((q) => {
          rows.push([
            loc.id,
            `"${loc.nameVi.replace(/"/g, '""')}"`,
            q.id,
            `"${q.title.vi.replace(/"/g, '""')}"`,
            `"${q.title.en.replace(/"/g, '""')}"`,
            q.status || "draft",
            String(q.steps.length),
            String(q.reward.xp),
          ]);
        });
      });
    });
  });

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `learntrip_quests_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function parseLocationsJSON(jsonString: string): { data: Location[] | null; errors: string[] } {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      errors.push("Nội dung tệp JSON không phải là danh sách Location (Array).");
      return { data: null, errors };
    }

    parsed.forEach((loc: any, idx: number) => {
      if (!loc.id || !loc.nameVi) {
        errors.push(`Dòng ${idx + 1}: Thiếu thuộc tính bắt buộc 'id' hoặc 'nameVi' trong địa danh.`);
      }
    });

    if (errors.length > 0) {
      return { data: null, errors };
    }

    return { data: parsed as Location[], errors: [] };
  } catch (err: any) {
    errors.push(`Cú pháp JSON không hợp lệ: ${err.message || String(err)}`);
    return { data: null, errors };
  }
}
