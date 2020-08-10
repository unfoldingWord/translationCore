/* eslint-env jest */
import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import {
  shallow, mount, configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import VersionCard from '../js/components/projectValidation/MergeConflictsCheck/VersionCard';
import MergeConflictsCard from '../js/components/projectValidation/MergeConflictsCheck/MergeConflictsCard';
import MergeConflicts from '../js/components/projectValidation/MergeConflictsCheck/';

describe('MergeConflictsComponents.index', () => {
  const wrapperOptions = {
    context: { muiTheme: getMuiTheme() },
    childContextTypes: { muiTheme: PropTypes.object },
  };

  beforeAll(() => {
    configure({ adapter: new Adapter() });
  });

  const initialState = {
    updateVersionSelection: jest.fn(),
    translate: key => key,
    reducers: {
      mergeConflictReducer: {
        conflicts: [
          [{
            chapter: '1',
            text: {
              5: 'This verse has been changed by another user',
              6: 'Some other verse',
            },
            verses: '5-6',
            checked: false,
          },
          {
            chapter: '1',
            text: {
              5: 'Some verse',
              6: 'Some other verse',
            },
            verses: '5-6',
            checked: true,
          }],
        ],
      },
    },
  };

  it('should render the default component and match the snapshot', () => {
    const wrapper = renderer.create(
      <MuiThemeProvider>
        <MergeConflicts {...initialState} />
      </MuiThemeProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should match the expeted props given the state', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <MergeConflicts {...initialState} />
      </MuiThemeProvider>
      , wrapperOptions);

    expect(wrapper.find(MergeConflictsCard).props()).toEqual({
      translate: expect.any(Function),
      chapter: '1',
      verses: '5-6',
      mergeConflictIndex: '0',
      versions:
        [{
          index: '0', textData: initialState.reducers.mergeConflictReducer.conflicts[0][0].text, checked: false,
        },
        {
          index: '1', textData: initialState.reducers.mergeConflictReducer.conflicts[0][1].text, checked: true,
        }],
      open: false,
      onCheck: expect.any(Function),
      openCard: expect.any(Function),
    });
  });

  it('should open merge conflict card', () => {
    const wrapper = shallow(
      <MergeConflicts {...initialState} />
      , wrapperOptions);
    expect(wrapper.find(MergeConflictsCard).prop('open')).toBe(false);
    wrapper.setState({ conflictCards: [{ open: true }] });
    expect(wrapper.find(MergeConflictsCard).prop('open')).toBe(true);
  });
});



describe('MergeConflictsComponents.MergeConflictsCard', () => {
  const wrapperOptions = {
    context: { muiTheme: getMuiTheme() },
    childContextTypes: { muiTheme: PropTypes.object },
  };

  beforeAll(() => {
    configure({ adapter: new Adapter() });
  });

  const initialState = {
    translate: key => key,
    chapter: '1',
    verses: '5-6',
    mergeConflictIndex: '0',
    versions:
      [{
        index: '0',
        textData: {
          5: 'This verse has been changed by another user',
          6: 'Some other verse',
        },
        checked: false,
      },
      {
        index: '1',
        textData: {
          5: 'Some verse',
          6: 'Some other verse',
        },
        checked: true,
      }],
    open: true,
    onCheck: () => {},
    openCard: () => {},
  };

  it('should show merge conflicts versions if open', () => {
    const wrapper = shallow(
      <MergeConflictsCard {...initialState} />
      , wrapperOptions);
    expect(wrapper.find(VersionCard).at(0)).toMatchSnapshot();
    expect(wrapper.find(VersionCard).at(1)).toMatchSnapshot();
    expect(wrapper.find(RightArrow)).toHaveLength(1);
    expect(wrapper.find(DownArrow)).toHaveLength(0);
    wrapper.setProps({ open: false });
    expect(wrapper.find(RightArrow)).toHaveLength(0);
    expect(wrapper.find(DownArrow)).toHaveLength(1);
    expect(wrapper.find(VersionCard)).toHaveLength(0);
  });
});
