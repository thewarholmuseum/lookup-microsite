# Photograph Finder Prototype

A lightweight static microsite prototype for finding photographs by a four-digit identifier.

## Run locally

Because the app loads JSON with `fetch()`, use a local web server rather than opening `index.html` directly.

If Python is installed:

    python3 -m http.server 8000

Then visit:

    http://localhost:8000

## Data

Edit `data/photographs.json`.

Each record supports:

- title
- date
- photographer
- description (limited HTML is supported; use `<em>` for italics)
- credit
- alt
- categories (clickable; opens a category page containing all matching records)
- related (an array of four-digit record IDs)
- image

## Images

The prototype contains SVG placeholders so it works immediately. Replace them with your photograph derivatives and update the `image` value in the JSON.

## URL links

A record can be opened directly:

    ?photo=0001

For production, this can later be upgraded to clean URLs such as `/photos/0001`.

## Offline kiosk

The same application can be hosted from a local web server on the kiosk computer, or packaged with Electron later. No external services are required by the application.

## Category pages

Category pages can be opened directly with:

    ?category=The%20Factory

Each category page displays the category title and a grid of every photograph assigned to that category.
