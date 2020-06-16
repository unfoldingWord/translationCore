---
name: Release Checklist
about: Steps needed to release

---
Release Steps Sign Off

### Features / Specifications
<!-- What are the high level features that need to be completed? -->


### Definition of Done
<!-- This is all the conditions, or acceptance criteria, that a 
software product must satisfy are met and ready to be
accepted by a user, customer, team, or consuming system. -->
- [ ] QA signs off on specific build in regression testing: current for `version_number`, build number: `build_number` 
- [ ] Update changelog 
- [ ] Update Release Notes - add release notes here: https://github.com/unfoldingWord/translationCore/releases
- [ ] Update language database in tCore (Note: this is probably not necessary for a point release) - this is an automatic script run on every build
- [ ] Updated resources (Note: normally N/A for this point release since we chose not to update resources) - we only updated en and hbo resources
- [ ] Create Mac Build on Mac PC (use same commit as QA signed off on, makes a smaller build, is this needed for github actions builds?)
- [ ] QA does quick check of Mac Build on Mac PC (to make sure resources and features not changed from build in regression testing). 
- [ ] Confirm all links to the release download:
  - [ ] translationcore.com
  - [ ] unfoldingword.org
  - [ ] github release page - https://github.com/unfoldingWord/translationCore/releases
  - [ ] door43 forum

<!-- 
## QA
 ### Fails
 - [ ]
 - [ ]
 -->
## Additional Context
### Mockups
