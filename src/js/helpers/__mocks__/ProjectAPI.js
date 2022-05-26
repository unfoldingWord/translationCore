export const mockGetCategoriesDir = jest.fn();
export const mockGetBookDataDir = jest.fn();
export const mockIsCategoryLoaded = jest.fn();
export const mockSetCategoryLoaded = jest.fn();
export const mockSetCurrentCategories = jest.fn();
export const mockImportCategoryGroupData = jest.fn();
export const mockGetBookId = jest.fn();
export const mockGetSelectedCategories = jest.fn();
export const mockSetSelectedCategories = jest.fn();
export const mockSetCategoryGroupIds = jest.fn();
export const mockResetCategoryGroupIds = jest.fn();
export const mockHasNewGroupsData = jest.fn();
export const mockResetLoadedCategories = jest.fn();
export const mockRemoveStaleCategoriesFromCurrent = jest.fn();
export const mockGetLoadedCategories = jest.fn(() => ('mockCategories'));

const mock = jest.fn().mockImplementation(() => ({
  setCategoryGroupIds: mockSetCategoryGroupIds,
  getCategoriesDir: mockGetCategoriesDir,
  getBookDataDir: mockGetBookDataDir,
  isCategoryLoaded: mockIsCategoryLoaded,
  setCategoryLoaded: mockSetCategoryLoaded,
  setCurrentCategories: mockSetCurrentCategories,
  importCategoryGroupData: mockImportCategoryGroupData,
  getBookId: mockGetBookId,
  getSelectedCategories: mockGetSelectedCategories,
  setSelectedCategories: mockSetSelectedCategories,
  resetCategoryGroupIds: mockResetCategoryGroupIds,
  hasNewGroupsData: mockHasNewGroupsData,
  resetLoadedCategories: mockResetLoadedCategories,
  removeStaleCategoriesFromCurrent: mockRemoveStaleCategoriesFromCurrent,
  getLoadedCategories: mockGetLoadedCategories,
}));

export default mock;
