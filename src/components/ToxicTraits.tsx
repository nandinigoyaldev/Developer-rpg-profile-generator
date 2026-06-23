type ToxicTraitsProps = {
  traits: string[];
};

export function ToxicTraits({ traits }: ToxicTraitsProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '16px', color: 'var(--text-main)' }}>
        Toxic Traits
      </h3>
      <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-muted)' }}>
        {traits.map((trait, index) => (
          <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
            {trait}
          </li>
        ))}
      </ul>
    </div>
  );
}
