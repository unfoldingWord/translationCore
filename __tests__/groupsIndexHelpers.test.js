import * as groupsIndexHelpers from '../src/js/helpers/groupsIndexHelpers';

describe('', () => {
  test('', () => {
    const groupsIndex = [
      {
        id: "good",
        name: "अच्छा, भलाई"
      },
      {
        id: "iniquity",
        name: "अधर्म, अधर्मों"
      },
      {
        id: "unrighteous",
        name: "अधर्मी, अधर्म"
      },
      {
        id: "unjust",
        name: "अधर्मी, अन्याय से, अन्याय"
      },
      {
        id: "authority",
        name: "अधिकारी, अधिकारियों"
      }
    ];
    const groupIdToFind = 'unjust';
    const foundGroupObject = groupsIndexHelpers.getGroupFromGroupsIndex(groupsIndex, groupIdToFind);
    const expectedGroupObject = {
      id: "unjust",
      name: "अधर्मी, अन्याय से, अन्याय"
    };
    expect(foundGroupObject).toMatchObject(expectedGroupObject);
  });
});
