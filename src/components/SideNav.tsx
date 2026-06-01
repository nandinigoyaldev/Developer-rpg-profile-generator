type SideNavProps = {
  battleTag: string;
};

const navItems = [
  { href: '#character', label: 'Character' },
  { href: '#stats', label: 'Combat Stats' },
  { href: '#achievements', label: 'Achievements' },
  { href: '#quests', label: 'Quest Log' },
  { href: '#skills', label: 'Skill Tree' },
  { href: '#origins', label: 'README Origin' },
  { href: '#analysis', label: 'Performance Report' },
];

export function SideNav({ battleTag }: SideNavProps) {
  return (
    <aside className="side-nav">
      <div className="brand-block">
        <p className="eyebrow">Developer RPG</p>
        <h1>Character Console</h1>
        <p className="subtle">{battleTag}</p>
      </div>
      <nav>
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
