/* eslint-env jest */

import React from 'react';
import ToolCardProgress from '../src/js/components/home/toolsManagement/ToolCardProgress';
import ShallowRenderer from 'react-test-renderer/shallow'; // ES6

// Tests for ToolCardProgress React Component
describe('Test ToolCardProgress component',()=>{
  test('Test progress=.50 to be white text, width of 50% and value of 50%', () => {
    const progress = .50;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.options.text.value).toBe('50%');
    expect(result.props.options.text.style.width).toBe('50%');
    expect(result.props.options.text.style.color).toBe('#fff');
  });

  test('Test progress=.20 to be black text, width of 100% and value of 20%', () => {
    const progress = .20;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.options.text.value).toBe('20%');
    expect(result.props.options.text.style.width).toBe('100%');
    expect(result.props.options.text.style.color).toBe('#000');
  });

  test('Test progress=1.01, which should  not happen, but should keep everything at 100%', () => {
    const progress = 1.01;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.options.text.value).toBe('100%');
    expect(result.props.options.text.style.width).toBe('100%');
    expect(result.props.options.text.style.color).toBe('#fff');
  });

  test('Test progress=-0.01, which should  not happen, but should keep everything at 0%', () => {
    const progress = -0.01;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.options.text.value).toBe('0%');
    expect(result.props.options.text.style.width).toBe('100%');
    expect(result.props.options.text.style.color).toBe('#000');
  });
});
