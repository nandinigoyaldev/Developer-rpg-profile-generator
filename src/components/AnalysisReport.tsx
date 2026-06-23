import type { Analysis } from '../types/profile';

type AnalysisReportProps = {
  report: Analysis;
};

export function AnalysisReport({ report }: AnalysisReportProps) {
  return (
    <article className="card" id="analysis">
      <div className="section-head">
        <h3>Damage Report</h3>
        <p className="subtle">We diagnosed your code, and the results are fatal.</p>
      </div>
      <div className="analysis-grid">
        <div className="analysis-main">
          <p>
            <strong>Disguise (Class):</strong> {report.characterClass}
          </p>
          <p>
            <strong>Threat Level:</strong> {report.powerLevel}
          </p>
          <p>
            <strong>Next Recommended Apology:</strong> {report.nextQuest}
          </p>
        </div>
        <div>
          <h4>Accidental Strengths</h4>
          <ul>
            {report.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Fatal Flaws</h4>
          <ul>
            {report.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Bootcamp Basics You Missed</h4>
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
