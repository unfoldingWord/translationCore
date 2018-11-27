import Repo from "../Repo";

describe("parse remote url", () => {
  it("should return the project name of a git.door43.org link", () => {
    let url = "https://git.door43.org/richmahn/en_tit_ulb.git";
    let projectName = Repo.parseRemoteUrl(url);
    expect(projectName).toEqual({
      "full_name": "richmahn/en_tit_ulb",
      "host": "https://git.door43.org/",
      "name": "en_tit_ulb",
      "owner": "richmahn"
    });
  });
});

describe('sanitize remote url', () => {
  it('should return the git.door43.org for a live.door43.org link', () => {
    let url = 'https://live.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a www.door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return the git.door43.org for a git.door43.org link', () => {
    let url = '   https://git.door43.org/richmahn/en_tit_ulb   ';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = 'https://git.door43.org/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return an empty string for a bad link', () => {
    let url = 'https://bad.door43.org/u/richmahn/en_tit_ulb';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return an empty string for an invalid project link', () => {
    let url = 'https://git.door43.org/richmahn/en_tit_ulb/stuff';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });
});
