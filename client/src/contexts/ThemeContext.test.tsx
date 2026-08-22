// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses useTheme
function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <p data-testid="theme-display">Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")} data-testid="dark-btn">
        Dark
      </button>
      <button onClick={() => setTheme("light")} data-testid="light-btn">
        Light
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("should provide default dark theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId("theme-display");
    expect(themeDisplay.textContent).toBe("Current theme: dark");
  });

  it("should allow theme switching", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const lightBtn = screen.getByTestId("light-btn");
    fireEvent.click(lightBtn);

    const themeDisplay = screen.getByTestId("theme-display");
    expect(themeDisplay.textContent).toBe("Current theme: light");
  });

  it("should persist theme to localStorage", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const lightBtn = screen.getByTestId("light-btn");
    fireEvent.click(lightBtn);

    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("should restore theme from localStorage on mount", () => {
    localStorage.setItem("theme", "light");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId("theme-display");
    expect(themeDisplay.textContent).toBe("Current theme: light");
  });

  it("should apply dark class to document element", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    const lightBtn = screen.getByTestId("light-btn");
    fireEvent.click(lightBtn);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should handle multiple theme switches", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const lightBtn = screen.getByTestId("light-btn");
    const darkBtn = screen.getByTestId("dark-btn");
    const themeDisplay = screen.getByTestId("theme-display");

    fireEvent.click(lightBtn);
    expect(themeDisplay.textContent).toBe("Current theme: light");

    fireEvent.click(darkBtn);
    expect(themeDisplay.textContent).toBe("Current theme: dark");

    fireEvent.click(lightBtn);
    expect(themeDisplay.textContent).toBe("Current theme: light");

    expect(localStorage.getItem("theme")).toBe("light");
  });
});
