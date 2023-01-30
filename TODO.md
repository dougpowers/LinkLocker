## Minor tasks
- [x] Sort hosts by domain name in renderGroupByHost
- [x] Find " | (domain)" or " - (domain)" at end of window titles and snip for Add Link dialog
- [x] Change 'title' references to 'name'
- [x] Change 'keyword' references to 'tag'
- [x] Change JSON export from typography to highlighted multiline input

## Major tasks
- [x] Implement link editing and implement edit icon
- [x] Implement info popover for entries and implement "i" entry icon 
- [ ] Refactor LinkLockerLinkList into hosts and links to save on encrypted favicon data
- [ ] Add search specifiers like 'site:'/'host:', 'tag:', and 'name:'
- [ ] Add sort options 
- [ ] Add JSON text entry for bookmark import
- [ ] Add timeout for non-icognito sessions (this is not a secure method as credentials will persist in storage until LinkLocker is opened after the timeout)
- [ ] Add omnibox functionality

- [ ] Add 'npm run ziptest' for .zip easy loading as an unsigned addon (add browser_specific_settings.gecko.id to ziptest)