<h2 align="center"><img src="https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/Logo.png" height="128"><br>Link Locker</h2>
<p align="center"><strong>Encrypted link management for Firefox</strong></p>

[](https://img.shields.io/github/license/dougpowers/LinkLocker)
[![](https://img.shields.io/amo/v/linklocker)](https://addons.mozilla.org/en-US/firefox/addon/linklocker/)
[![](https://img.shields.io/badge/LinkedIn-Douglas%20Powers-blue)](https://www.linkedin.com/in/douglas-powers-537380104/)

LinkLocker is an encypted link manager addon for Firefox.

- ❓ Report missing features/bugs on [GitHub](https://github.com/dougpowers/LinkLocker/issues).
- 📃 Refer to [TODO.md](TODO.md) for finished and upcoming features.

## 💾 Installation
LinkLocker can be installed via the [Firefox Addon Marketplace](https://addons.mozilla.org/en-US/firefox/addon/linklocker/).

## ☑ Features
- AES256 encryption with argon2id key-derivation and authentication
- Ctrl-Alt-c shortcut for quick opening
- Easy adding, editing, and tagging of links
- Fuzzy searching with Fuse.js allows you to search the link url, name, and tags at the same time
- Sorting by host, link name, or creation date in either ascending or descending order
- Filtering by host, tag, and creation date
- Full, encrypted, account backup to disk
- Unencrypted link export to disk
- Sessions are purged on browser close, securing your data

## 👩‍💻 Building LinkLocker for Yourself
You can modify and build LinkLocker for yourself. The build environment is currently configured for Windows. If you wish to build this extension on MacOS or Linux, you'll have to modify the npm scripts in `package.json`;

[Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) is required to run and test LinkLocker from local build files. If you don't have it, download and install it. If you don't install it to the default location, you'll have to change the `WEB_EXT_FIREFOX` environment variable in `package.json`.

If you want to permenantly install a local version of LinkLocker in your Firefox Developer Edition profile, you'll need to enable unsigned xpi installation. To do this, go to `about:config` and change `xpinstall.signatures.required` to `false`.

[Node.js](nodejs.org) is required. If you don't have it, download and install it.

Clone the repository:
```sh
$ git clone https://github.com/dougpowers/LinkLocker
$ cd LinkLocker
```

Install the required npm libraries:
```sh
$ npm install
```

To build the unoptimized debug version (which includes options to load a default link list):
```sh
$ npm run builddev
```

Otherwise:
```sh
$ npm run buildprod
```

To run the build in a fresh instance of Firefox:
```sh
$ npm run rundev
```
or
```sh
$ npm run runprod
```
You can make changes and rebuild the addon and it will automatically be updated without having to close Firefox.

To package LinkLocker for a local unsigned installation:
```sh
$ npm run ziptestdev
```
or
```sh
$ npm run ziptestprod
```

The resulting file will be located at `./build/web-ext-artifacts/linklocker-(version).zip` or `./dist/web-ext-artifacts/linklocker-(version).zip`.

To install this, go to `about:addons`, click the gear icon, and select `Install Add-on From File...`.

## Using LinkLocker
LinkLocker can be launched at any time from inside Firefox by pressing Ctrl-Alt-c.

### Account Creation
When LinkLocker is first launched, it will prompt you to create an account.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/AcctCreate.png)

All accounts are internally referred to via a UUIDv4 so a username is optional.

If you've previously made an account backup, you can import it here.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/BackupImport.png)

> **FAQ - Why do I have to paste text into LinkLocker?
Due to the restrictions Firefox places on local file access, you'll have to open your backups or exports in a text editor and paste the content into LinkLocker. A future Chrome version of LinkLocker will likely not have this restriction.

### Logging In
If LinkLocker has accounts registered, it will show the login screen on first launch.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/Login.png)

You can add further accounts by pressing the `Add Account` button.

### Using the View Links Ccreen
LinkLocker's main screen is where all the action happens!

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/ViewEmpty.png)

#### Adding Links
Press the `Add Link` button or simply press Space or Enter when LinkLocker first opens to add a new link.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/AddFirstLink.png)

The link name is derived from the title of the tab. You can change this to whatever you wish.

Enter space-separated tags for each link.

If this is the first link you've added from this host, you'll also have the option of defining host-specific tags. These are automatically added to the tags field for future links from this host.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/AddSecondLink.png)

#### Editing Links
When hovering over a link, there are options to view additional information, edit it, or delete it.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/LinkInfo.png)

Editing links looks identical to adding it in the first place. 

You can edit the host default tags by clicking the green edit icon in the host entry. You can also delete all links from the host by clicking the red trash can icon. You'll be prompted to confirm this operation.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/EditHost.png)

#### Sorting Links
LinkLocker has three sorting modes: Alphabetical by Host, Alphabetical by Link Name, and Temporally by Timestamp. Click the blue sort mode indicator to bring up the sort mode menu.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/SortMenu.png)

You can change the sort direction by clicking the arrow to the right of the sort mode indicator.