/**
 * RoleExplorer — BDD component render tests
 *
 * Tests that RoleExplorer renders role cards, marks the primary role as active,
 * and updates the active role when a card is clicked.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RoleExplorer from './RoleExplorer';
import type { Role } from '../../types/profile.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeRole(id: string, title: string, override?: Partial<Role>): Role {
    return {
        id,
        title,
        specialties: ['TypeScript', 'React'],
        featured: true,
        description: `${title} description`,
        ...override,
    };
}

const ENGINEER_ROLE = makeRole('engineer', 'Software Engineer', {
    about: {
        paragraphs: [
            'I build scalable systems.',
            'I care about DX.',
            'I love open source.',
        ],
    },
    skills: [{ name: 'Languages', skills: ['TypeScript', 'Rust'] }],
});

const ARTIST_ROLE = makeRole('artist', 'Visual Artist', {
    specialties: ['Illustration', 'Motion Design'],
});

// ─── Scenario 1: Component renders all role cards ─────────────────────────────

describe(
    'Scenario 1: RoleExplorer renders all role cards',
    () => {
        it(
            'Given: two roles, ' +
                'When: component mounts, ' +
                'Then: a button for each role is visible',
            () => {
                render(
                    <RoleExplorer
                        roles={[ENGINEER_ROLE, ARTIST_ROLE]}
                        primaryRole="engineer"
                    />,
                );

                expect(screen.getByRole('button', { name: /Software Engineer/i })).toBeTruthy();
                expect(screen.getByRole('button', { name: /Visual Artist/i })).toBeTruthy();
            },
        );

        it(
            'Given: primaryRole is "engineer", ' +
                'When: component mounts, ' +
                'Then: the engineer button has aria-pressed=true',
            () => {
                render(
                    <RoleExplorer
                        roles={[ENGINEER_ROLE, ARTIST_ROLE]}
                        primaryRole="engineer"
                    />,
                );

                const engineerBtn = screen.getByRole('button', { name: /Software Engineer/i });
                expect(engineerBtn.getAttribute('aria-pressed')).toBe('true');

                const artistBtn = screen.getByRole('button', { name: /Visual Artist/i });
                expect(artistBtn.getAttribute('aria-pressed')).toBe('false');
            },
        );
    },
);

// ─── Scenario 2: Role selection updates active state ──────────────────────────

describe(
    'Scenario 2: clicking a role card switches the active role',
    () => {
        it(
            'Given: engineer is active, ' +
                'When: artist card is clicked, ' +
                'Then: artist button becomes aria-pressed=true',
            () => {
                render(
                    <RoleExplorer
                        roles={[ENGINEER_ROLE, ARTIST_ROLE]}
                        primaryRole="engineer"
                    />,
                );

                const artistBtn = screen.getByRole('button', { name: /Visual Artist/i });
                fireEvent.click(artistBtn);

                expect(artistBtn.getAttribute('aria-pressed')).toBe('true');
                expect(screen.getByRole('button', { name: /Software Engineer/i }).getAttribute('aria-pressed')).toBe('false');
            },
        );

        it(
            'Given: a role with about content, ' +
                'When: it is the active role, ' +
                'Then: the About section is rendered',
            () => {
                render(
                    <RoleExplorer
                        roles={[ENGINEER_ROLE, ARTIST_ROLE]}
                        primaryRole="engineer"
                    />,
                );

                expect(screen.getByText('I build scalable systems.')).toBeTruthy();
            },
        );
    },
);
