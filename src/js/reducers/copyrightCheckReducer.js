import consts from '../actions/ActionTypes';

const initialState = {
  selectedLicenseId: null,
  licenses: [
    {
      title: 'Creative Commons O / Public Domain',
      description: 'description nanan na h an amsvw,nsdjh kjekj',
      id: 'CC0 1.0 Public Domain',
      imageName: 'publicDomain.png'
    },
    {
      title: 'Creative Commons BY',
      description: 'description nanan na h an amsvw,nsdjh kjekj',
      id: 'CC BY 4.0',
      imageName: 'ccBy.png'
    },
    {
      title: 'Creative Commons BY-SA',
      description: 'description nanan na h an amsvw,nsdjh kjekj',
      id: 'CC BY-SA 4.0',
      imageName: 'ccBySa.png'
    },
    {
      title: 'None of the Above',
      description: 'description nanan na h an amsvw,nsdjh kjekj',
      id: 'none',
      imageName: 'noCircle.png'
    }
  ]
};

const copyrightCheckReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SELECT_PROJECT_LICENSE_ID:
      return {
        ...state,
        selectedLicenseId: action.selectedLicenseId
      }
    default:
      return state;
  }
};

export default copyrightCheckReducer;
