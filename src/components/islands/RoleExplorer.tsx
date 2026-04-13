import { useState } from 'react';
import type { Role } from '../../types/profile.types';

interface RoleExplorerProps {
    roles: Role[];
    primaryRole: string;
}

export default function RoleExplorer({ roles, primaryRole }: RoleExplorerProps) {
    const [activeId, setActiveId] = useState<string>(primaryRole);
    const active = roles.find(r => r.id === activeId) ?? roles[0];

    return (
        <section id="role-explorer" className="px-4 py-20">
            <div className="max-w-4xl mx-auto">
                <h2
                    className="text-4xl font-bold mb-4 text-center"
                    data-index="01"
                >
                    What I Do
                </h2>
                <p
                    className="text-center mb-12 text-lg"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    I work in two worlds. Pick one to explore.
                </p>

                {/* Role cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {roles.map(role => {
                        const isActive = role.id === activeId;
                        return (
                            <button
                                key={role.id}
                                onClick={() => setActiveId(role.id)}
                                aria-pressed={isActive}
                                className="text-left p-6 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2"
                                style={{
                                    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                                    transform: isActive ? 'translateY(-2px)' : undefined,
                                    boxShadow: isActive ? '0 8px 24px var(--shadow)' : '0 2px 8px var(--shadow)',
                                }}
                            >
                                <p
                                    className="text-xs font-mono uppercase tracking-widest mb-2"
                                    style={{ opacity: isActive ? 0.8 : 0.6 }}
                                >
                                    {role.id}
                                </p>
                                <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                                {role.description && (
                                    <p className="text-sm mb-4" style={{ opacity: 0.85 }}>
                                        {role.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {role.specialties.slice(0, 4).map(s => (
                                        <span
                                            key={s}
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--bg-primary)',
                                                border: '1px solid',
                                                borderColor: isActive ? 'rgba(0,0,0,0.2)' : 'var(--border)',
                                            }}
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Role content — about + skills for the active role */}
                {active.about && (
                    <div className="mb-12">
                        <h3
                            className="text-2xl font-semibold mb-6"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            About
                        </h3>
                        <div
                            className="rounded-lg p-6"
                            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                        >
                            {active.about.paragraphs.map((para, i) => (
                                <p
                                    key={i}
                                    className="text-lg mb-4 last:mb-0"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {para}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {active.skills && active.skills.length > 0 && (
                    <div>
                        <h3
                            className="text-2xl font-semibold mb-6"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Skills & Technologies
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            {active.skills.map(category => (
                                <div key={category.name}>
                                    <h4 className="text-base font-semibold mb-3">{category.name}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="text-sm px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border)',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
