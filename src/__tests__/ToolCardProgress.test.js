/* eslint-env jest */

import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow'; // ES6
import ToolCardProgress from '../js/components/home/toolsManagement/ToolCardProgress';

// Tests for ToolCardProgress React Component
describe('Test ToolCardProgress component',()=>{
  test('Test progress=.50 to be white text', () => {
    // given
    const progress = .50;
    const expectedText = '50%';
    const expectedProgressBar = 50;
    const expectedSytleLeft = expectedProgressBar/2 + '%';
    const expectedStyleColor = '#fff';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=.20 to be black text', () => {
    // given
    const progress = .20;
    const expectedText = '20%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = '50%';
    const expectedStyleColor = '#000';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=.995 to show 99%', () => {
    // given
    const progress = .995;
    const expectedText = '99%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = expectedProgressBar/2 + '%';
    const expectedStyleColor = '#fff';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=.9999 to show 99%', () => {
    // given
    const progress = .9999;
    const expectedText = '99%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = expectedProgressBar/2 + '%';
    const expectedStyleColor = '#fff';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=1 to show 100%', () => {
    // given
    const progress = 1;
    const expectedText = '100%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = expectedProgressBar/2 + '%';
    const expectedStyleColor = '#fff';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=.0099 to show <1%', () => {
    // given
    const progress = .0099;
    const expectedText = '<1%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = '50%';
    const expectedStyleColor = '#000';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });

  test('Test progress=0 to show 0%', () => {
    // given
    const progress = 0;
    const expectedText = '0%';
    const expectedProgressBar = progress*100;
    const expectedSytleLeft = '50%';
    const expectedStyleColor = '#000';
    const renderer = new ShallowRenderer();

    // when
    renderer.render(<ToolCardProgress progress={progress} />);

    // then
    validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText);
  });
});

//
// Helper Functions
//

function validateToolCardProgress(renderer, expectedProgressBar, expectedSytleLeft, expectedStyleColor, expectedText) {
  const result = renderer.getRenderOutput();
  const child0Props = result.props.children.props.children[0].props;
  const child1Props = result.props.children.props.children[1].props;
  expect(child1Props.value).toBe(expectedProgressBar);
  expect(child0Props.style.left).toBe(expectedSytleLeft);
  expect(child0Props.style.color).toBe(expectedStyleColor);
  expect(child0Props.children).toBe(expectedText);
}

