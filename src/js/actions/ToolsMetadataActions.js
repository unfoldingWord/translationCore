import consts from './ActionTypes';
// helpers
import * as ToolsMetadataHelpers from '../helpers/ToolsMetadataHelpers';

export function getToolsMetadatas() {
  return ((dispatch) => {
    const metadatas = ToolsMetadataHelpers.getToolsMetadatas();
    dispatch({
      type: consts.SET_TOOLS_METADATA,
      val: metadatas
    });
  });
}
