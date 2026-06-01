import type { Analysis } from '../types/profile';

type AnalysisReportProps = {
  report: Analysis;
};

export function AnalysisReport({ report }: AnalysisReportProps) {
  return (
    <article className="card" id="analysis">
      <div className="section-head">
        <h3>Game Report</h3>
        <p className="subtle">Performance diagnostics with progression advice.</p>
      </div>
      <div className="analysis-grid">
        <div className="analysis-main">
          <p>
            <strong>Character Class:</strong> {report.characterClass}
          </p>
          <p>
            <strong>Power Level:</strong> {report.powerLevel}
          </p>
          <p>
            <strong>Next Recommended Quest:</strong> {report.nextQuest}
          </p>
        </div>
        <div>
          <h4>Strengths</h4>
          <ul>
            {report.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Weaknesses</h4>
          <ul>
            {report.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Missing Skills</h4>
          <ul>
            {report.missingSkills.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
