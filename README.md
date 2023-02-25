[](https://img.shields.io/github/license/dougpowers/LinkLocker)
[![](https://img.shields.io/amo/v/linklocker)](https://addons.mozilla.org/en-US/firefox/addon/linklocker/)
[![](https://img.shields.io/badge/LinkedIn-Douglas%20Powers-blue)](https://www.linkedin.com/in/douglas-powers-537380104/)
<h2 align="center"><img src="https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/Logo.png" height="128"><br>Link Locker</h2>
<p align="center"><strong>Encrypted link management for Firefox</strong></p>

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
LinkLocker is Open Source Software licenced under the MIT Licence. Feel free to modify, build, and redistribute LinkLocker. The build environment is currently configured for Windows. To build this extension on MacOS or Linux, the scripts in `package.json` will need to be modified.

[Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) is required to run and test LinkLocker from local build files. If it's not installed in the default location, change the `WEB_EXT_FIREFOX` environment variables in `package.json` as appropriate.

To permenantly install a local version of LinkLocker in a personal Firefox Developer Edition profile, unsigned xpi installation must be enabled. To do this, go to `about:config` and change `xpinstall.signatures.required` to `false`.

[Node.js](nodejs.org) is required.

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
Changes can be made to LinkLocker without having to re-launch Firefox. Rebuild using `npm run buildprod` or `npm run builddev` and LinkLocker will be automatically reloaded.

To package LinkLocker for a local unsigned installation:
```sh
$ npm run ziptestdev
```
or
```sh
$ npm run ziptestprod
```

The resulting file will be located at `./build/web-ext-artifacts/linklocker-(version).zip` or `./dist/web-ext-artifacts/linklocker-(version).zip`.

To install this, navigate to `about:addons`, click the gear icon, and select `Install Add-on From File...`.

## Using LinkLocker
LinkLocker can be launched at any time from inside Firefox by pressing Ctrl-Alt-c.

### Account Creation
When LinkLocker is first launched, it will prompt to create an account.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/AcctCreate.png)

All accounts are internally referred to via a UUIDv4 so a username is optional.

If an account backup has been made previously, it can be imported here.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/BackupImport.png)

> ❔*FAQ* - Why do I have to paste text into LinkLocker?
Due to the restrictions Firefox places on local file access, you'll have to open your backups or exports in a text editor and paste the content into LinkLocker. A future Chrome version of LinkLocker will likely not have this restriction.

### Logging In
If LinkLocker has accounts registered, it will show the login screen on first launch.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/Login.png)

Further accounts can be added by pressing the `Add Account` button.

### Using the View Links Screen
LinkLocker's main screen is where all the action happens!

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/ViewEmpty.png)

#### Adding Links
Press the `Add Link` button or simply press Space or Enter when LinkLocker first opens to add a new link.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/AddFirstLink.png)

The link name is derived from the title of the tab. This can be changed to whatever name is desired. LinkLocker will attempt to remove trailing references to the site in the title (e.g. " | CNN.com") but this may not always be possible.

Enter space-separated tags for each link.

If this is the first link added from a host, there will also be an option to define host-specific tags. These are automatically added to the tags field for future links added from this host.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/AddSecondLink.png)

#### Editing Links
When hovering over a link, there are options to view additional information, edit it, or delete it.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/LinkInfo.png)

Editing links looks identical to adding them in the first place. 

The host default tags can be edited by clicking the green edit icon in the host entry. Changing the host tags will only affect the default tags on new links. It will not change the tags on any existing links. 
All links from the host can be deleted by clicking the red trash can icon. A prompt will be shown to confirm this operation.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/EditHost.png)

#### Sorting Links
LinkLocker has three sorting modes: Alphabetical by Host, Alphabetical by Link Name, and Temporally by Timestamp. Click the blue sort mode indicator to bring up the sort mode menu.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/SortMenu.png)

The sort direction can be changed by clicking the arrow to the right of the sort mode indicator.

Sort modes are also grouping modes. Sorting by Name places the links in a flat alphabetical list.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/SortByName.png)

Sorting by Date groups links by the day they were created.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/SortByDate.png)

#### Searching and Filtering Links
The search bar can be quickly focused from inside LinkLocker by pressing the `s` key. Type search terms and press `Enter` to search. Clear the search field and press `Enter` again to again display all links.

LinkLocker will search for all space-separated search terms in the link name, url, and tags.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/SearchTerms.png)

Click the question mark icon to bring up information about LinkLocker's search operators.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/SearchHelp.png)

Use `host:<term>`, `tag:<tag>`, `before:<YYYY-MM-DD>`, and `after:<YYYY-MM-DD>` alone or in combination with search terms to narrow down the results.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/FilteredSearch.png)

`host:<term>` will filter out any link whose hostname doesn't *contain* `<term>`. `tag:<tag>` will filter out any link that doesn't have `<tag>` *exactly* (case-insensitive).

`-` can be used to reverse `host:<term>` and `tag:<tag>`.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/NegateFilteredSearch.png)

#### Changing Passwords and Deleting Accounts
Account passwords can be changed by selecting `Change Password...` from the main menu at the bottom-right of the LinkLocker window.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/ChangePassword.png)

Accounts can be deleted by selecting `Delete Account...`. The account password is required to complete this operation.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/DeleteAccount.png)

#### Backups and Exports
Accounts can be backed up for future importing by selecting `Back Up Account...`.

A full link JSON file can be exported by selecting `Export Links...`.

> ⚠ Link Exports are in unencrypted plain text. This is only recommended for moving links to other applications. To make a secure backup of links, use the `Back Up Account` feature and import the account from the `Add User` screen to restore it.

#### Importing Links
Like importing account backups, link lists can be imported from the main menu by selecting `Load Links...`. Paste the contents of a LinkLocker export file to import its links. Duplicate links will be skipped.

![](https://raw.githubusercontent.com/dougpowers/LinkLocker/master/web-assets/screenshots/LoadLinks.png)