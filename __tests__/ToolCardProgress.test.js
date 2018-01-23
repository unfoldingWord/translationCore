/* eslint-env jest */

import React from 'react';
import ToolCardProgress from '../src/js/components/home/toolsManagement/ToolCardProgress';
import ShallowRenderer from 'react-test-renderer/shallow'; // ES6

// Tests for ToolCardProgress React Component
describe('Test ToolCardProgress component',()=>{
  test('Test progress=.50 to be white text', () => {
    const progress = .50;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.children.props.children[0].props.style.left).toBe('25%');
    expect(result.props.children.props.children[1].props.value).toBe(50);
    expect(result.props.children.props.children[0].props.style.color).toBe('#fff');
  });

  test('Test progress=.20 to be black text', () => {
    const progress = .20;
    const renderer = new ShallowRenderer();
    renderer.render(<ToolCardProgress progress={progress} />);
    const result = renderer.getRenderOutput();
    expect(result.props.children.props.children[1].props.value).toBe(20);
    expect(result.props.children.props.children[0].props.style.left).toBe('50%');
    expect(result.props.children.props.children[0].props.style.color).toBe('#000');
  });
});
