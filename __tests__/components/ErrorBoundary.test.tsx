import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
  return null;
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

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Something went wrong./)).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry for the inconvenience/)
    ).toBeInTheDocument();
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

    expect(screen.getByText(/Oops! Something went wrong./)).toBeInTheDocument();
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

    expect(screen.getByText(/Oops! Something went wrong./)).toBeInTheDocument();
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });
});
