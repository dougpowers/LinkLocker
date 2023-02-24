## Current Changes
### Minor tasks
- [x] Sort hosts by domain name in renderGroupByHost
- [x] Find " | (domain)" or " - (domain)" at end of window titles and snip for Add Link dialog
- [x] Change 'title' references to 'name'
- [x] Change 'keyword' references to 'tag'
- [x] Change JSON export from typography to highlighted multiline input
- [x] Add non-incognito warning
- [x] Create appropriate \__DEBUG_LIST__ for debugging and README screenshots. Should showcase use cases.
- [x] Add a debug indicator at the bottom of the App
- [x] Inject \__VERSION__ into App and manifest.json
- [x] Change entry dynamic buttons from opacity to display to allow for more width for link display when not hovering
- [x] Add json download option
- [x] Change \__DEBUG_LIST__ to make timestamps randomized across several weeks
- [x] Open all links button at bottom of screen (warning if over MAX_NUM_TAB_OPENS)
- [x] Clean up import modal borders and padding
- [x] Add cancel button to AcctCreate when appropriate
- [ ] Add popover info to search, informing of search and filter operators

### Major tasks
- [x] Implement link editing and implement edit icon
- [x] Implement info popover for entries and implement "i" entry icon 
- [x] Implement entry scrolling
- [x] Refactor LinkLockerLinkList into hosts and links to save on encrypted favicon data
- [x] Add 'npm run ziptest' for .zip easy loading as an unsigned addon (add browser_specific_settings.gecko.id to ziptest)
- [x] Add host-dependent tags to add as default entries for new links to that host
- [x] Add edit and delete options for host
- [x] Add confirmation dialog when deleting a whole host
- [x] Fix unicode bookmarks changing to ASCII
- [x] Change popup window.localStorage to background script window.sessionStorage to make all sessions ephemeral
- [x] Change LinkLockerLink.href from string to URL (added LinkLockerLink.url instead)
- [x] Add search operators like 'site:'/'host:', 'tag:', and 'name:'/'title:' (excluded 'name:')
- [x] Add sort options 
- [x] Add ability to change account password
- [x] Add persistent sort to accounts
- [x] Add JSON text entry for bookmark import
- [x] Process favicons for compression
- [x] Add password entry requirement for account delete
- [x] Add option download full, encrypted, account backup. 
- [x] Add login and account create screen menu modal with option to import encrypted account backups
- [x] Add dialog for link export warning that the exported links will be unencrypted
- [ ] Add 'from:' and 'to:' operators to clamp dates
- [ ] Rewrite README for 0.2. Simplify structure and add screeshots (possibly logo)

## Delayed Changes
### Minor tasks
- [ ] Crash webpack if NODE_ENV and BROWSER_ENV are not set
- [ ] Add ./build/firefox/, ./build/chromium, ./dist/firefox, ./dist/chromium
- [ ] Eliminate extraneous whitespace in modals and dialogs

### Major tasks
- [ ] Add omnibox functionality
- [ ] Add memoization