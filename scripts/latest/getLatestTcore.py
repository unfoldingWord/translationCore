import json
import requests
import re
from packaging import version

###################################################
# taken from SoftwareUpdateDialogContainer.js into getLatestTcore.js and converted with chatGPT

def get_update_asset(response, installed_version, os_arch, os_platform):
  fallback_platform = None
  fallback_update = None
  platform_names = {
    'aix': 'linux',
    'darwin': 'macos',
    'macos': 'macos',
    'freebsd': 'linux',
    'linux': 'linux',
    'openbsd': 'linux',
    'sunos': 'linux',
    'win32': 'win',
    'win': 'win',
  }

  if os_arch == 'ia32':
    os_arch = 'x32'

  platform_name = platform_names[os_platform]

  if os_arch == 'arm64':
    fallback_platform = f"{platform_name}-universal"

  platform = f"{platform_name}-{os_arch}"
  update = None
  tag_name = response['tag_name']
  # print(f"Release tag-name {tag_name}")

  for asset in response['assets']:
    if platform in asset['name']:
      update = {
        **asset,
        'latest_version': tag_name,
        'installed_version': installed_version,
      }
      break
    elif fallback_platform and fallback_platform in asset['name']:
      fallback_update = {
        **asset,
        'latest_version': tag_name,
        'installed_version': installed_version,
      }

  is_lite_release = bool(re.search("-LITE", tag_name.upper()))

  if not update:
    # print(f"using fallback architecture: {fallback_update}")
    update = fallback_update

  up_to_date = False

  if update:
    latest = getVersion(update['latest_version'])
    installed = getVersion(update['installed_version'])

    if latest <= installed:
      # print(f"installed version {update['installed_version']} is up to date with release version {update['latest_version']}")
      up_to_date = True
    # else:
    #   print(f"installed version {update['installed_version']} is older than release version {update['latest_version']}")

  return {
    'update': update,
    'up_to_date': up_to_date,
    'tag_name': tag_name,
    'is_lite_release': is_lite_release,
  }

def remove_leading_v(version_string):
  if version_string.startswith('v'):
    return version_string[1:]
  else:
    return version_string

def remove_after_dash(input_string):
  if '-' in input_string:
    return input_string.split('-')[0]
  else:
    return input_string

def getVersion(version_):
  versionStr = remove_leading_v(version_)
  versionStr = remove_after_dash(versionStr)
  return version.parse(versionStr)

def fetch_url(url):
  response = requests.get(url)
  response.raise_for_status()
  return response.json()

def get_latest_release():
  latest_release_url = 'https://api.github.com/repos/unfoldingWord-dev/translationCore/releases/latest'
  is_lite_install_ = True
  installed_version = 'v0.0.0'

  configs = {
    'macos': {
      'x64': None,
      'universal': None,
    },
    'linux': {
      'x64': None,
      'arm64': None,
    },
    'win': {
      'x64': None,
      'x32': None,
    },
  }

  response = None

  try:
    response = fetch_url(latest_release_url)
  except Exception as e:
    print(f"Error getting latest tCore from {latest_release_url}", e)

  if response and 'assets' in response:
    for os_platform, os_archs in configs.items():
      for os_arch in os_archs:
        browser_download_url = None
        result = get_update_asset(response, installed_version, os_arch, os_platform)
        update = result['update']
        up_to_date = result['up_to_date']
        tag_name = result['tag_name']
        is_lite_release = result['is_lite_release']

        if update:
          browser_download_url = update['browser_download_url']

          if is_lite_install_ != is_lite_release:
            # print(f"found tag name {tag_name} which is a fallback install since isLiteRelease={is_lite_release}", update)
            base_tag_name = tag_name.split('-')[0]
            size_suffix = '-LITE' if is_lite_install_ else ''
            right_tag_name = base_tag_name + size_suffix
            tag_url = f"https://api.github.com/repos/unfoldingWord-dev/translationCore/releases/tags/{right_tag_name}"
            # print(f"getting release {right_tag_name}", update)

            try:
              response = fetch_url(tag_url)
              result = get_update_asset(response, installed_version, os_arch, os_platform)
              update = result['update']
              browser_download_url = update['browser_download_url']
            except Exception as e:
              # print(f"Error getting latest tCore from {tag_url}", e)
              return {}

        os_archs[os_arch] = browser_download_url

    return configs

  return {}

installers = get_latest_release()
json_data = json.dumps(installers, indent=4)
print(json_data)

#####################################################
#  Output is in this format:
# {
#   "macos": {
#     "x64": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-macos-x64-3.6.0-LITE-2bc4476.dmg",
#     "universal": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-macos-universal-3.6.0-LITE-2bc4476.dmg"
#   },
#   "linux": {
#     "x64": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-linux-x64-3.6.0-LITE-2bc4476.deb",
#     "arm64": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-linux-arm64-3.6.0-LITE-2bc4476.deb"
#   },
#   "win": {
#     "x64": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-win-x64-3.6.0-LITE-2bc4476.exe",
#     "x32": "https://github.com/unfoldingWord/translationCore/releases/download/v3.6.0-LITE/tC-win-x32-3.6.0-LITE-2bc4476.exe"
#   }
# }
