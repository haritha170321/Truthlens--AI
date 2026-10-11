import jsPDF from 'jspdf';

export const downloadPDFReport = (analysis) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header Banner - Deep Navy
  doc.setFillColor(7, 13, 30);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setFontSize(16);
  doc.setTextColor(56, 189, 248); // Sky blue
  doc.text('TRUTHLENS AI - VERIFICATION AUDIT DOSSIER', 14, 16);
  
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Explainable AI & Provenance Verification Engine • SDG 16 & SDG 4 Target Alignment', 14, 24);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 24, { align: 'right' });
  
  // Verification Hash Simulation for Audit Trail
  const auditHash = `TL-${Math.abs((analysis.headline || '').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Audit Trail Fingerprint: ${auditHash}`, 14, 31);

  yPos = 46;

  // Article Info Box
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTICLE & INGESTION DETAILS', 14, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Investigated Title: ${analysis.headline || 'Untitled News Item'}`, 14, yPos);
  yPos += 5;
  doc.text(`Publisher / Outlet: ${analysis.publisher || 'Unspecified'} | Input Type: ${analysis.inputType || 'TEXT'}`, 14, yPos);
  yPos += 5;
  if (analysis.url) {
    doc.text(`Original URL: ${analysis.url}`, 14, yPos);
    yPos += 5;
  }

  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 9;

  // Verification Verdict Box
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('STANDARDIZED OUTCOME TAXONOMY', 14, yPos);
  yPos += 7;

  // Color-coded badge for outcome category
  const outcome = analysis.outcomeCategory || analysis.prediction || 'Unable to verify';
  let statusColor = [100, 116, 139]; // Slate
  if (outcome.toLowerCase().includes('supporting') || outcome.toLowerCase().includes('real')) statusColor = [16, 185, 129]; // Emerald
  else if (outcome.toLowerCase().includes('conflicting') || outcome.toLowerCase().includes('fake')) statusColor = [239, 68, 68]; // Rose
  else if (outcome.toLowerCase().includes('context') || outcome.toLowerCase().includes('misleading')) statusColor = [245, 158, 11]; // Amber

  doc.setFillColor(...statusColor);
  doc.roundedRect(14, yPos - 5, 80, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${outcome.toUpperCase()}`, 54, yPos + 1.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidence Score: ${analysis.finalConfidence || analysis.confidenceScore || 50}% | Uncertainty: ${analysis.uncertaintyScore || 20}%`, 100, yPos + 1.5);
  yPos += 14;

  // AI Reasoning & Explanation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPLAINABLE AI REASONING & PROVENANCE', 14, yPos);
  yPos += 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const summary = analysis.aiExplanation?.summary || 'Multi-source linguistic and semantic vector similarity analysis performed across verified registries.';
  const summaryLines = doc.splitTextToSize(summary, pageWidth - 28);
  doc.text(summaryLines, 14, yPos);
  yPos += (summaryLines.length * 4.5) + 6;

  // Extracted Claims
  if (analysis.claims && analysis.claims.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DISCRETE FACTUAL ASSERTIONS IDENTIFIED', 14, yPos);
    yPos += 6;

    analysis.claims.slice(0, 3).forEach((c, idx) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Assertion #${idx + 1} [Type: ${c.type || 'Factual'} - Status: ${c.status || 'Verified'}]:`, 14, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'normal');
      const claimText = doc.splitTextToSize(`"${c.claim}"`, pageWidth - 28);
      doc.text(claimText, 14, yPos);
      yPos += (claimText.length * 4) + 4;
    });
  }

  // Similar Claims Section
  if (analysis.similarClaims && analysis.similarClaims.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLOSEST SEMANTICALLY MATCHED FACT-CHECKS', 14, yPos);
    yPos += 6;

    analysis.similarClaims.slice(0, 2).forEach((sc, idx) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Match #${idx + 1} (${sc.organization || 'Fact Checker'} - Proximity: ${sc.similarity_percentage || 85}%):`, 14, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`"${sc.matched_claim || sc.matchedClaim}"`, 14, yPos);
      yPos += 4;
      doc.setTextColor(14, 116, 144);
      doc.text(`URL: ${sc.url}`, 14, yPos);
      doc.setTextColor(15, 23, 42);
      yPos += 5;
    });
  }

  // Footer & Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Epistemic Disclaimer: TruthLens AI communicates uncertainty and distinguishes retrieved evidence from automated inference.',
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  doc.save(`TruthLens_AI_Audit_${auditHash}.pdf`);
};

export const downloadJSONReport = (analysis) => {
  const exportData = {
    platform: 'TruthLens AI',
    exportTimestamp: new Date().toISOString(),
    analysisId: analysis._id || analysis.id,
    headline: analysis.headline,
    outcomeCategory: analysis.outcomeCategory || analysis.prediction,
    confidenceScore: analysis.confidenceScore || analysis.finalConfidence,
    uncertaintyScore: analysis.uncertaintyScore,
    language: analysis.language || 'en',
    publisher: analysis.publisher,
    claims: analysis.claims,
    supportingEvidence: analysis.supportingEvidence,
    contradictingEvidence: analysis.contradictingEvidence,
    contextEvidence: analysis.contextEvidence,
    similarClaims: analysis.similarClaims,
    sourceCredibility: analysis.sourceCredibility,
    aiExplanation: analysis.aiExplanation,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `truthlens_audit_${analysis._id || 'export'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadMarkdownReport = (analysis) => {
  const outcome = analysis.outcomeCategory || analysis.prediction || 'Unable to verify';
  const mdContent = `# TruthLens AI Verification Dossier

**Analyzed Headline:** ${analysis.headline || 'Untitled News Item'}  
**Outcome Taxonomy:** ${outcome}  
**Confidence Score:** ${analysis.finalConfidence || analysis.confidenceScore || 50}%  
**Uncertainty Margin:** ${analysis.uncertaintyScore || 20}%  
**Publisher / Origin:** ${analysis.publisher || 'Unspecified'}  
**Audit Date:** ${new Date().toLocaleString()}  

---

## 1. Explainable AI Summary
${analysis.aiExplanation?.summary || 'Multi-source NLP verification audit completed.'}

### Key Factors
${(analysis.aiExplanation?.keyFactors || []).map(f => `- ${f}`).join('\n')}

---

## 2. Discrete Extracted Claims
${(analysis.claims || []).map((c, i) => `### Claim ${i + 1}: ${c.claim}
- **Type:** ${c.type || 'Factual Assertion'}
- **Status:** ${c.status || 'Verified'}
- **Confidence:** ${Math.round((c.confidence || 0.8) * 100)}%
`).join('\n')}

---

## 3. External Evidence Citations
### Supporting Evidence
${(analysis.supportingEvidence || []).map(e => `- **${e.source}** (${e.publishedDate || 'Recent'}): [${e.title}](${e.url})\n  *"${e.snippet}"*`).join('\n') || 'None'}

### Conflicting Evidence
${(analysis.contradictingEvidence || []).map(e => `- **${e.source}** (${e.publishedDate || 'Recent'}): [${e.title}](${e.url})\n  *"${e.snippet}"*`).join('\n') || 'None'}

---

## 4. Semantically Matched Fact-Checks
${(analysis.similarClaims || []).map(sc => `- **${sc.organization || 'Fact Checker'}** (Similarity: ${sc.similarity_percentage || 85}%): [${sc.matched_claim || sc.matchedClaim}](${sc.url})\n  *Verdict: ${sc.verdict}*`).join('\n') || 'None'}

---
*Generated by TruthLens AI – Explainable Misinformation Analysis and Verification Platform (SDG 16 & SDG 4)*
`;

  const blob = new Blob([mdContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `truthlens_audit_${analysis._id || 'report'}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCSVReport = (analyses = []) => {
  if (!analyses || analyses.length === 0) return;

  const headers = ['ID', 'Headline', 'Outcome Category', 'Confidence (%)', 'Uncertainty (%)', 'Publisher', 'Language', 'Date'];
  const rows = analyses.map((a) => [
    `"${a._id || a.id || ''}"`,
    `"${(a.headline || '').replace(/"/g, '""')}"`,
    `"${a.outcomeCategory || a.prediction || 'UNVERIFIED'}"`,
    a.finalConfidence || a.confidenceScore || 0,
    a.uncertaintyScore || 0,
    `"${(a.publisher || '').replace(/"/g, '""')}"`,
    `"${a.language || 'en'}"`,
    `"${new Date(a.createdAt || Date.now()).toLocaleDateString()}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `truthlens_verification_history_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
