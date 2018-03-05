jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import migrateToAddTargetLanguageBookName from '../src/js/helpers/ProjectMigration/migrateToAddTargetLanguageBookName.js';

describe('Test ability to translate bookname into target language fom manifest given a project class',()=> {
  test('Project has manifest', async () => {
    function migrationFailed() {
      const projectPath = "/dummy/path";
      migrateToAddTargetLanguageBookName(projectPath);
    }
    expect(migrationFailed).rejects.toThrow("Manifest not found.");
  });
  test('Project has front matter', async () => {
    const projectPath = path.join('__test__', 'fixtures', 'project', 'migrationToTargetLanguageBookName', 'withFrontMatter');  
    const manifest = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifest.target_language.book.name).toEqual('Efesios');
  });
});
