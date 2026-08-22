// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { HelpTooltip, HELP_CONTENT } from './HelpTooltip';

describe('HelpTooltip', () => {
  afterEach(cleanup);

  it('renders a help icon button', () => {
    render(<HelpTooltip content="Test content" />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has correct aria-label', () => {
    render(<HelpTooltip content="Test" title="Test Title" />);
    const button = screen.getByRole('button', { name: /Test Title/i });
    expect(button).toBeTruthy();
  });

  it('has correct aria-label when no title provided', () => {
    render(<HelpTooltip content="Test" />);
    const button = screen.getByRole('button', { name: /More information/i });
    expect(button).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { container } = render(<HelpTooltip content="Test" className="custom-class" />);
    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-class');
  });

  it('renders predefined help content', () => {
    render(<HelpTooltip content={HELP_CONTENT.confidence.content} />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });
});
