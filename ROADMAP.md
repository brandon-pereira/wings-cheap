# v1.0 - LIVE
- Initial Launch!

#v1.0.1 - LIVE
- Fix bug with flexbox shrinking
- Fix bug where error doesn't display when in invalid city
- Better handling of results 0-10.

#v1.1 
- Get place details server side
- Get current city server side

#v1.1.1
- Update map before current location done loading (improved perceived performance)
- Brought back loading indicator to home screen.

#v1.2
- Add map to add deal screen

# Backlog
- Remove dependency on lodash (or at least only load required modules)
	- `_.keys`
	- `_.pickBy `
	- `_.identity `
	- `_.sortBy `
	- `_.isEqual`
	- `_.find`
	- `_.indexOf`
- Add ability to show if a restaurant requires drink purchase
- Modify restaurants 
- Restaurant sharing tool
	- https://www.facebook.com/sharer/sharer.php?u=url
	- https://twitter.com/intent/tweet?text=TEXT OR URL&source=webclient
- Add filter by quadrant 
- Local storage
- Remove google place frontend requirement? could use https://github.com/michalsanger/globe-geometry/tree/master/globe-geometry for distances

# Future Release
- Make app feel as much like a PWA as possible (app shell) https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/