; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

;You must define Version by adding the command line argument /DVersion=x.x
;#define Version

; You must define the GitVersion by adding the command line argument /DGitVersion=version
;#define GitVersion

; You must define DestFile by adding the command line argument /DDestFile=destinationfile (without the .exe)
;#define DestFile

; You must define DestDir by adding the command line argument /DDestDir=dir/to/dest/file/
;#define DestDir

; You must define BuildDir by adding the command line argument /DBuildDir=dir/to/builds/
;#define BuildDir

; Specify a custom rooth path by adding the command line argument /DRootPath=path/to/root/dir
#ifndef RootPath
  #define RootPath "./"
#endif

; Specify the Architecture by adding the command line argument /DArch=
#ifndef Arch
  #define Arch "x64"
#endif
#if Arch == "x86"
  #define GitExecutable "Git-" + GitVersion + "-32-bit.exe"
  #define BuildPath RootPath + BuildDir + "translationCore-win32-ia32\*.*"
  #define GitInstaller "win32_git_installer.iss"
#else
  #define GitExecutable "Git-" + GitVersion + "-64-bit.exe"
  #define BuildPath RootPath + BuildDir + "translationCore-win32-x64\*.*"
  #define GitInstaller "win64_git_installer.iss"
#endif

#define MyAppName "translationCore"
#define MyAppPublisher "Unfolding Word"
#define MyAppURL "https://unfoldingword.org"
#define MyAppExeName "translationCore.exe"
#define MyLicenseFile RootPath + "LICENSE"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{66B9ACCC-DEB3-44FB-A4D1-C01F2AF6EF30}
AppName={#MyAppName}
AppVersion={#Version}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DisableDirPage=yes
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir={#RootPath}{#DestDir}
OutputBaseFilename={#DestFile}
SetupIconFile={#RootPath}src\images\icon.ico
Compression=lzma
SolidCompression=yes
LicenseFile={#MyLicenseFile}
#if Arch == "x86"
ArchitecturesAllowed=x86 arm64
  #define   OSBITS 32
#else
ArchitecturesAllowed=x64 arm64
  #define OSBITS 64
#endif

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "{#RootPath}vendor\{#GitExecutable}"; DestDir: "{app}\vendor"; Components: git; Flags: ignoreversion recursesubdirs deleteafterinstall
Source: "{#RootPath}scripts\git\{#GitInstaller}"; DestDir: "{app}\vendor"; Components: git; Flags: ignoreversion recursesubdirs deleteafterinstall
Source: "{#BuildPath}"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\vendor\{#GitExecutable}"; Parameters: "/SILENT /LOADINF=""{app}\vendor\{#GitInstaller}"""; Components: git;
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: postinstall skipifsilent nowait shellexec

[Components]
Name: "git"; Description: "Install Git"; Types: full

[Code]
function IsGitInstalled: boolean;
begin
  result := False;
  if RegKeyExists(HKLM, 'SOFTWARE\GitForWindows') then
  begin
    result := True;
  end
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = wpSelectComponents then
  begin
    WizardForm.ComponentsList.Checked[0] := not IsGitInstalled;
  end;
end;
{
function InitializeSetup(): Boolean;
var
  ErrorMsg :String;
  ErrorCode :Integer;
  MS, LS :Cardinal;
  MajorVerNo, MinorVerNo :Word;
  NetSPVer :DWord;
  InstallMSI :Boolean;
  WindowsVersion :TWindowsVersion;
// if we want to simplify this some more we should look into inno tools downloader.
// it's a dll and iss file that can be included to add download capabilities.
// then we can install the downloaded file.
  begin
  // TODO: check if git is installed
    if MsgBox('This application requires Git. ' +
              'You must download and install Git before running this application. ' +
              'Would you like to download Git now?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      if not ShellExec('open', 'https://github.com/git-for-windows/git/releases/download/v{#GitVersion}.windows.1/Git-{#GitVersion}-{#OSBITS}-bit.exe', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode) then
        MsgBox(ErrorMsg + SysErrorMessage(ErrorCode), mbError, MB_OK);
    end else
        MsgBox('You have chosen not to install Git. ' +
               'Installation aborted.', mbInformation, MB_OK);
  end;
}
