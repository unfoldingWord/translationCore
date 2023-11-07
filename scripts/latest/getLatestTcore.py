import requests
import re
import json
from packaging import version

###################################################
# taken from SoftwareUpdateDialogContainer.js and converted with chatGPT

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
  print(f"Release tag-name {tag_name}")

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
    print(f"using fallback architecture: {fallback_update}")
    update = fallback_update

  up_to_date = False

  if update:
    latest = version.parse(update['latest_version'])
    installed = version.parse(update['installed_version'])

    if latest <= installed:
      print(f"installed version {update['installed_version']} is up to date with release version {update['latest_version']}")
      up_to_date = True
    else:
      print(f"installed version {update['installed_version']} is older than release version {update['latest_version']}")

  return {
    'update': update,
    'up_to_date': up_to_date,
    'tag_name': tag_name,
    'is_lite_release': is_lite_release,
  }

def fetch_url(url):
  response = requests.get(url)
  response.raise_for_status()
  return response.json()

latest_release_url = 'https://api.github.com/repos/unfoldingWord-dev/translationCore/releases/latest'
is_lite_install_ = True

response_data = fetch_url(latest_release_url)
result = get_update_asset(response_data, '0.0.0', 'arm64', 'macos')

if result['update'] and not result['up_to_date'] and (is_lite_install_ != result['is_lite_release']):
  print(f"found tag name {result['tag_name']} which is a fallback install since is_lite_release={result['is_lite_release']}", result['update'])
