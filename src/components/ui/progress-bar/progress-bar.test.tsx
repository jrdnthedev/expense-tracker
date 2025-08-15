import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import ProgressBar from './progress-bar';

describe('ProgressBar', () => {
    test('renders with correct structure and accessibility attributes', () => {
        render(<ProgressBar percentageUsed={50} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    test('applies correct width style for normal percentage', () => {
        render(<ProgressBar percentageUsed={75} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveStyle({ width: '75%' });
    });

    test('caps width at 100% when percentage exceeds 100', () => {
        render(<ProgressBar percentageUsed={150} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveStyle({ width: '100%' });
        expect(progressBar).toHaveAttribute('aria-valuenow', '150');
    });

    test('shows blue color for percentage at or below 100', () => {
        render(<ProgressBar percentageUsed={100} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveClass('bg-blue-600');
        expect(progressBar).not.toHaveClass('bg-red-600');
    });

    test('shows red color for percentage above 100', () => {
        render(<ProgressBar percentageUsed={101} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveClass('bg-red-600');
        expect(progressBar).not.toHaveClass('bg-blue-600');
    });

    test('handles 0% correctly', () => {
        render(<ProgressBar percentageUsed={0} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveStyle({ width: '0%' });
        expect(progressBar).toHaveClass('bg-blue-600');
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    test('handles decimal percentages correctly', () => {
        render(<ProgressBar percentageUsed={33.33} />);
        
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveStyle({ width: '33.33%' });
        expect(progressBar).toHaveAttribute('aria-valuenow', '33.33');
    });
});