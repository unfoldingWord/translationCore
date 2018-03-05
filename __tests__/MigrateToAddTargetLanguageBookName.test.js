jest.mock('fs-extra');
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
    const directoryToManifest = path.join('mock', 'path', 'to', 'project', 'manifest.json');
    const frontPath = path.join('mock', 'path', 'to', 'project', 'front', 'title.txt');
    const manifest = {
      "generator": {
        "name": "ts-desktop",
        "build": "132"
      },
      "target_language": {
        "id": "es-419",
        "name": "Español Latin America",
        "direction": "ltr"
      },
      "project": {
        "id": "eph",
        "name": "Ephesians"
      }
    };
    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [frontPath]: 'Efesios'
    });

    const projectPath = path.join('mock', 'path', 'to', 'project');
    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });
});
