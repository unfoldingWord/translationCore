jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import migrateToAddTargetLanguageBookName from '../src/js/helpers/ProjectMigration/migrateToAddTargetLanguageBookName.js';

const projectPath = path.join('mock', 'path', 'to', 'project');
const directoryToManifest = path.join(projectPath, 'manifest.json');
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
  
describe('Test ability to translate bookname into target language fom manifest given a project class',()=> {
 
  test('Project has no manifest', async () => {     // this is really no project
    function migrationFailed() {
      const projectPath = "/dummy/path";
      migrateToAddTargetLanguageBookName(projectPath);
    }
    expect(migrationFailed).rejects.toThrow("Manifest not found.");
  });

  test('Project has translated name in manifest', async () => { 
    const manifest = {
      "generator": {
        "name": "ts-desktop",
        "build": "132"
      },
      "target_language": {
        "id": "es-419",
        "name": "Español Latin America",
        "direction": "ltr",
        "book": {
          "name": "Efesios"
        }
      },
      "project": {
        "id": "eph",
        "name": "Ephesians"
      }
    };
    fs.__setMockFS({
      [directoryToManifest]: manifest        
    });

    const  manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');        
  });
     
  test('Project has front matter', async () => {
    const frontPath = path.join('mock', 'path', 'to', 'project', 'front', 'title.txt');
    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [frontPath]: 'Efesios'
    });

    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });
  
  test('Project has chapter 0', async () => {
    const pathTo0 = path.join('mock', 'path', 'to', 'project', '00', 'title.txt');
    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [pathTo0]: 'Efesios'
    });
    
    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });
  
  test('Project has USFM header', async () => {
    const pathToUSFM = path.join(projectPath, '.apps', 'translationCore', 'importedSource', 'eph.usfm');
    const USFM = `
\\id TIT EN_ULB hi_Hindi_ltr Wed Feb 21 2018 12:39:16 GMT-0500 (EST) tc
\\h Efesios
\\c 1`;
    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [pathToUSFM]: USFM
    });
        
    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });
});
