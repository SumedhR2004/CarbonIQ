// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';
import PromptLab from '../components/PromptLab';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

// Mock canvas-confetti to prevent canvas errors in jsdom
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('CarbonIQ UI Component Tests', () => {
  describe('Header Component', () => {
    it('renders the brand title and version', () => {
      render(<Header user={null} />);
      expect(screen.getByText('CarbonIQ')).toBeInTheDocument();
      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    });

    it('renders Sign In button when no user is logged in', () => {
      render(<Header user={null} />);
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    });

    it('renders user photo and Sign Out button when user is logged in', () => {
      const mockUser = {
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        uid: 'abc123user',
      };
      render(<Header user={mockUser} />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
      const avatar = screen.getByAltText(/test user/i);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });
  });

  describe('PromptLab Component', () => {
    it('renders the simulation engine toggles', () => {
      const setSystemPrompt = vi.fn();
      const setEngineMode = vi.fn();
      const setApiKey = vi.fn();
      const setTemperature = vi.fn();

      render(
        <PromptLab
          systemPrompt="Test Prompt"
          setSystemPrompt={setSystemPrompt}
          engineMode="local"
          setEngineMode={setEngineMode}
          apiKey=""
          setApiKey={setApiKey}
          temperature={0.7}
          setTemperature={setTemperature}
        />
      );

      expect(screen.getByRole('button', { name: /local sim/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /gemini llm/i })).toBeInTheDocument();
    });

    it('triggers engine mode updates on click', () => {
      const setEngineMode = vi.fn();
      render(
        <PromptLab
          systemPrompt="Test Prompt"
          setSystemPrompt={vi.fn()}
          engineMode="local"
          setEngineMode={setEngineMode}
          apiKey=""
          setApiKey={vi.fn()}
          temperature={0.7}
          setTemperature={vi.fn()}
        />
      );

      const geminiBtn = screen.getByRole('button', { name: /gemini llm/i });
      fireEvent.click(geminiBtn);
      expect(setEngineMode).toHaveBeenCalledWith('gemini');
    });
  });

  describe('AnalyticsDashboard Component', () => {
    it('renders empty state when score is 0', () => {
      render(
        <AnalyticsDashboard
          answers={{}}
          score={0}
          actionPlan={[]}
          history={[]}
          onLoadHistoryItem={vi.fn()}
          onClearHistory={vi.fn()}
        />
      );
      expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    });

    it('renders the dial gauge when score is greater than 0', () => {
      const mockAnswers = {
        transport: 'car',
        diet: 'vegetarian',
      };
      const mockActionPlan = [
        { action: 'Save energy', saving: 200, difficulty: 'Easy', category: 'electricity' },
      ];

      render(
        <AnalyticsDashboard
          answers={mockAnswers}
          score={3000}
          actionPlan={mockActionPlan}
          history={[]}
          onLoadHistoryItem={vi.fn()}
          onClearHistory={vi.fn()}
        />
      );

      // Dial SVG representation should render
      expect(screen.getByRole('img', { name: /carbon footprint dial/i })).toBeInTheDocument();
      expect(screen.getByText('3,000')).toBeInTheDocument();
      expect(screen.getByText(/regional benchmarks/i)).toBeInTheDocument();
      expect(screen.getByText('Save energy')).toBeInTheDocument();
    });
  });
});
