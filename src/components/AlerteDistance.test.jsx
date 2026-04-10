import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AlerteDistance from './AlerteDistance.jsx';

describe('Alerte distance > 40 km', () => {
  it('affiche le texte fiscal de plafonnement attendu', () => {
    const html = renderToStaticMarkup(<AlerteDistance visible />);
    expect(html).toContain('La déduction est limitée à 40 km (80 km AR) sauf justification');
  });

  it('est masquée quand visible=false', () => {
    const html = renderToStaticMarkup(<AlerteDistance visible={false} />);
    expect(html).toBe('');
  });
});
