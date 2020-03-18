/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import FeedbackDialog from '../js/components/dialogComponents/FeedbackDialog';

describe('FeedbackDialog component renders correctly', () => {
  test('FeedbackDialog component render should match snapshot', () => {
    const props = {
      includeLogs: true,
      message: 'Allow miles wound place the leave had. To sitting subject no improve studied limited. Ye indulgence unreserved connection alteration appearance my an astonished. Up as seen sent make he they of. Her raising and himself pasture believe females. Fancy she stuff after aware merit small his. Charmed esteems luckily age out. \n' +
        '\n' +
        'Promotion an ourselves up otherwise my. High what each snug rich far yet easy. In companions inhabiting mr principles at insensible do. Heard their sex hoped enjoy vexed child for. Prosperous so occasional assistance it discovered especially no. Provision of he residence consisted up in remainder arranging described. Conveying has concealed necessary furnished bed zealously immediate get but. Terminated as middletons or by instrument. Bred do four so your felt with. No shameless principle dependent household do. \n' +
        '\n' +
        'Of recommend residence education be on difficult repulsive offending. Judge views had mirth table seems great him for her. Alone all happy asked begin fully stand own get. Excuse ye seeing result of we. See scale dried songs old may not. Promotion did disposing you household any instantly. Hills we do under times at first short an. \n' +
        '\n' +
        'An do on frankness so cordially immediate recommend contained. Imprudence insensible be literature unsatiable do. Of or imprudence solicitude affronting in mr possession. Compass journey he request on suppose limited of or. She margaret law thoughts proposal formerly. Speaking ladyship yet scarcely and mistaken end exertion dwelling. All decisively dispatched instrument particular way one devonshire. Applauded she sportsman explained for out objection. \n',
      email: 'johndoe@acme.com',
      category: 'general_feedback',
      translate: k => k,
      onCLose: jest.fn(),
      onSubmit: jest.fn(),
      open: true,
    };
    const modal = shallow(<FeedbackDialog {...props}/>).dive();
    expect(modal).toMatchSnapshot();
  });
});
