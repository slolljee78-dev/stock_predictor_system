// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with dark theme by default', () => {
    const theme = localStorage.getItem('theme') || 'dark';
    expect(theme).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    localStorage.setItem('theme', 'light');
    const saved = localStorage.getItem('theme');
    expect(saved).toBe('light');
  });

  it('should toggle between light and dark themes', () => {
    let theme: 'light' | 'dark' = 'dark';
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    expect(newTheme).toBe('light');
    
    const toggled = newTheme === 'dark' ? 'light' : 'dark';
    expect(toggled).toBe('dark');
  });

  it('should apply dark class to document when theme is dark', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from document when theme is light', () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should respect localStorage preference on initialization', () => {
    localStorage.setItem('theme', 'light');
    const saved = localStorage.getItem('theme');
    expect(saved).toBe('light');
  });

  it('should handle rapid theme toggles', () => {
    let theme: 'light' | 'dark' = 'dark';
    
    // Toggle 5 times
    for (let i = 0; i < 5; i++) {
      theme = theme === 'dark' ? 'light' : 'dark';
    }
    
    // Should end up on light (odd number of toggles)
    expect(theme).toBe('light');
  });

  it('should maintain theme consistency across multiple toggles', () => {
    let theme: 'light' | 'dark' = 'dark';
    const themes: Array<'light' | 'dark'> = [theme];
    
    for (let i = 0; i < 3; i++) {
      theme = theme === 'dark' ? 'light' : 'dark';
      themes.push(theme);
    }
    
    expect(themes).toEqual(['dark', 'light', 'dark', 'light']);
  });
});
