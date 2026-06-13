import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';
import PromptLab from '../components/PromptLab';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ChatSandbox from '../components/ChatSandbox';

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

  describe('ChatSandbox Component', () => {
    it('renders the welcome screen by default', () => {
      const setAnswers = vi.fn();
      const setScore = vi.fn();
      const setActionPlan = vi.fn();
      const onSaveResult = vi.fn();

      render(
        <ChatSandbox
          systemPrompt="Test Prompt"
          engineMode="local"
          apiKey=""
          temperature={0.7}
          answers={{}}
          setAnswers={setAnswers}
          setScore={setScore}
          setActionPlan={setActionPlan}
          onSaveResult={onSaveResult}
        />
      );

      expect(screen.getByText(/Calculate Your Carbon Footprint/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Calculator/i })).toBeInTheDocument();
    });

    it('starts conversation and displays first question on click', () => {
      const setAnswers = vi.fn();
      const setScore = vi.fn();
      const setActionPlan = vi.fn();
      const onSaveResult = vi.fn();

      render(
        <ChatSandbox
          systemPrompt="Test Prompt"
          engineMode="local"
          apiKey=""
          temperature={0.7}
          answers={{}}
          setAnswers={setAnswers}
          setScore={setScore}
          setActionPlan={setActionPlan}
          onSaveResult={onSaveResult}
        />
      );

      const startBtn = screen.getByRole('button', { name: /Start Calculator/i });
      fireEvent.click(startBtn);

      expect(screen.getByText(/How do you mainly commute/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Car/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Public Transport/i })).toBeInTheDocument();
    });

    it('runs through the full 8-question local simulation and calls onSaveResult', () => {
      vi.useFakeTimers();
      
      const onSaveResultMock = vi.fn();

      function TestWrapper() {
        const [answers, setAnswers] = useState({
          transport: null, commuteDistance: null, diet: null, foodWaste: null,
          electricity: null, digital: null, shopping: null, flights: null
        });
        const [score, setScore] = useState(0);
        const [actionPlan, setActionPlan] = useState([]);

        return (
          <ChatSandbox
            systemPrompt="Test Prompt"
            engineMode="local"
            apiKey=""
            temperature={0.7}
            answers={answers}
            setAnswers={setAnswers}
            setScore={setScore}
            setActionPlan={setActionPlan}
            onSaveResult={onSaveResultMock}
          />
        );
      }

      render(<TestWrapper />);

      // Start the calculator
      fireEvent.click(screen.getByRole('button', { name: /Start Calculator/i }));
      
      // Question 1: Commute
      expect(screen.getByText(/How do you mainly commute/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Car/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 2: Distance
      expect(screen.getByText(/How far is your daily commute/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Under 5 km/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 3: Diet
      expect(screen.getByText(/What best describes your diet/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Meat daily/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 4: Food Waste
      expect(screen.getByText(/How much food do you typically waste/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /A lot/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 5: Electricity
      expect(screen.getByText(/How many hours daily do you use AC/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /2 hours/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 6: Shopping
      expect(screen.getByText(/How often do you buy new clothes/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Weekly/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 7: Digital
      expect(screen.getByText(/How many hours per day do you spend streaming/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /3 hours/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Question 8: Flights
      expect(screen.getByText(/How many flights did you take last year/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /0 flights/i }));
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Completed
      expect(screen.getByText(/YOUR CARBON FOOTPRINT REPORT/i)).toBeInTheDocument();
      expect(onSaveResultMock).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
