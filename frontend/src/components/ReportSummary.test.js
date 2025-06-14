import React from 'react';
import { render, screen } from '@testing-library/react';
import ReportSummary from './ReportSummary';

test('renders category and key metric cards', () => {
  const data = {
    categories: {
      performance: { score: 0.85, title: 'Performance' },
      seo:         { score: 0.9,  title: 'SEO' }
    },
    audits: {
      'first-contentful-paint': {
        title: 'First Contentful Paint',
        displayValue: '1.2 s',
        numericValue: 1.2,
        score: 0.85
      }
    }
  };

  render(<ReportSummary data={data} />);
  expect(screen.getByText('Performance')).toBeInTheDocument();
  expect(screen.getByText('85%')).toBeInTheDocument();
  expect(screen.getByText('First Contentful Paint')).toBeInTheDocument();
});
