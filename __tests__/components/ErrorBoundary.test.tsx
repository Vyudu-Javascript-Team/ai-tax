import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Create a component that renders normally
const NormalComponent = () => <div>Normal content</div>;

describe('ErrorBoundary', () => {
  // Prevent console.error from cluttering test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    const content = screen.getByText('Normal content');
    expect(content).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorHeading = screen.getByText(/Oops! Something went wrong./);
    const errorMessage = screen.getByText(/We're sorry for the inconvenience/);
    
    expect(errorHeading).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it('catches errors in nested components', () => {
    render(
      <ErrorBoundary>
        <div>
          <div>
            <ThrowError />
          </div>
        </div>
      </ErrorBoundary>
    );

    const errorMessage = screen.getByText(/Oops! Something went wrong./);
    expect(errorMessage).toBeInTheDocument();
  });

  it('isolates errors to specific error boundary instances', () => {
    render(
      <div>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
        <ErrorBoundary>
          <NormalComponent />
        </ErrorBoundary>
      </div>
    );

    const errorMessage = screen.getByText(/Oops! Something went wrong./);
    const normalContent = screen.getByText('Normal content');
    
    expect(errorMessage).toBeInTheDocument();
    expect(normalContent).toBeInTheDocument();
  });
});
