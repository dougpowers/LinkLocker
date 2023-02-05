## Minor tasks
- [x] Sort hosts by domain name in renderGroupByHost
- [x] Find " | (domain)" or " - (domain)" at end of window titles and snip for Add Link dialog
- [x] Change 'title' references to 'name'
- [x] Change 'keyword' references to 'tag'
- [x] Change JSON export from typography to highlighted multiline input
- [x] Add non-incognito warning
- [x] Create appropriate \__DEBUG_LIST__ for debugging and README screenshots. Should showcase use cases.
- [x] Add a debug indicator at the bottom of the App
- [x] Inject __VERSION__ into App and manifest.json

## Major tasks
- [x] Implement link editing and implement edit icon
- [x] Implement info popover for entries and implement "i" entry icon 
- [x] Implement entry scrolling
- [x] Refactor LinkLockerLinkList into hosts and links to save on encrypted favicon data
- [x] Add 'npm run ziptest' for .zip easy loading as an unsigned addon (add browser_specific_settings.gecko.id to ziptest)
- [x] Add host-dependent tags to add as default entries for new links to that host
- [ ] Add edit and delete options for host
- [ ] Add confirmation dialog when deleting a whole host
- [x] Fix unicode bookmarks changing to ASCII
- [ ] Add search operators like 'site:'/'host:', 'tag:', and 'name:'/'title:'
- [ ] Add sort options 
- [ ] Add ability to change account password
- [ ] Add JSON text entry for bookmark import
- [ ] Add timeout for non-icognito sessions (this is not a secure method as credentials will persist in storage until LinkLocker is opened after the timeout)
- [ ] Add omnibox functionality
- [ ] Rewrite README for 0.2. Simplify structure and add screeshots (possibly logo)