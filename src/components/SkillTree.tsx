import type { SkillNode } from '../types/profile';

type SkillTreeProps = {
  skills: SkillNode[];
};

export function SkillTree({ skills }: SkillTreeProps) {
  return (
    <article className="card" id="skills">
      <div className="section-head">
        <h3>Skill Tree</h3>
        <p className="subtle">Core abilities, defensive gaps, and growth pathways.</p>
      </div>
      <ul className="skill-list">
        {skills.map((skill) => (
          <li className="skill-node" key={skill.name}>
            <div>
              <h4>{skill.name}</h4>
              <p>{skill.branch}</p>
            </div>
            <div
              className="skill-meter"
              role="progressbar"
              aria-label={`${skill.name} level`}
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${skill.level}%` }}></span>
            </div>
            <strong>{skill.level}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}
