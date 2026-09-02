(() => {
	"use strict";

	const state = {
		records: {},
		loaded: false
	};

	const $ = (id) => document.getElementById(id);

	const views = {
		search: $("searchView"),
		category: $("categoryView"),
		record: $("recordView")
	};

	const input = $("photoNumber");
	const searchMessage = $("searchMessage");

	/*
	 * ------------------------------------------------------------
	 * Navigation / routing
	 * ------------------------------------------------------------
	 */

	function hideAllViews() {
		Object.values(views).forEach((view) => {
			view.hidden = true;
		});
	}

	function updateUrl(params, replace = false) {
		const searchParams = new URLSearchParams();

		if (params.photo) {
			searchParams.set("photo", params.photo);
		}

		if (params.category) {
			searchParams.set("category", params.category);
		}

		const queryString = searchParams.toString();

		const url =
			window.location.pathname +
			(queryString ? "?" + queryString : "");

		if (replace) {
			window.history.replaceState({}, "", url);
		} else {
			window.history.pushState({}, "", url);
		}
	}

	function normalizeNumber(value) {
		const digits = String(value || "")
			.replace(/\D/g, "")
			.slice(0, 4);

		if (!digits) {
			return "";
		}

		return digits.padStart(4, "0");
	}

	/*
	 * ------------------------------------------------------------
	 * Search view
	 * ------------------------------------------------------------
	 */

	function showSearch(updateHistory = true) {
		hideAllViews();

		views.search.hidden = false;

		searchMessage.textContent = "";
		input.value = "";
		renderAllRecords();

		if (updateHistory) {
			updateUrl({});
		}
		// Don't force focus on desktop/browser navigation.
		// This also makes touchscreen/browser behavior more predictable.
	}

	/*
	 * ------------------------------------------------------------
	 * Photograph records
	 * ------------------------------------------------------------
	 */

	function showRecord(id, updateHistory = true) {
		const record = state.records[id];

		if (!record) {
			showSearch(updateHistory);
			searchMessage.textContent =
				`No photograph was found for ${id}.`;
			return;
		}

		hideAllViews();

		views.record.hidden = false;

		$("recordNumber").textContent = id;
		$("recordTitle").textContent = `${record.title},` || "";

		$("photoImage").src = record.image || "";
		$("photoImage").alt =
			record.alt ||
			record.title ||
			`Photograph ${id}`;

		/*
		 * Metadata
		 */

		const metadataArtist = $("recordMetadataArtist");

		metadataArtist.innerHTML = "";
		if (record.photographer) {
			const photographer = document.createElement("span");
			photographer.className = "record-artist";

			photographer.innerHTML =
				`${record.photographer}`;

				metadataArtist.appendChild(photographer);
		}

		const metadataDate = $("recordMetadataDate");

		metadataDate.innerHTML = "";

		if (record.date) {
			const date = document.createElement("span");
			date.className = "record-date";

			date.innerHTML =
				` ${record.date}`;

			metadataDate.appendChild(date);
		}

		

		/*
		 * Rich text description
		 *
		 * The JSON file can contain limited HTML such as:
		 *
		 * <em>italic text</em>
		 * <strong>bold text</strong>
		 * <br>
		 */

		$("recordDescription").innerHTML =
			record.description || "";

		/*
		 * Credit
		 */

		$("recordCredit").innerHTML =
			record.credit || "";

		/*
		 * Categories
		 */

		renderCategories(record.categories || []);

		/*
		 * Related photographs
		 */

		renderRelated(record.related || []);

		if (updateHistory) {
			updateUrl({
				photo: id
			});
		}
	}

	/*
	 * ------------------------------------------------------------
	 * Categories
	 * ------------------------------------------------------------
	 */

	function renderCategories(categories) {
		const container = $("categories");

		container.innerHTML = "";

		$("categoriesSection").hidden =
			categories.length === 0;

		categories.forEach((category) => {
			const button = document.createElement("button");

			button.type = "button";
			button.className = "chip";
			button.textContent = category;

			button.addEventListener("click", (event) => {
				event.preventDefault();

				showCategory(category);
				window.scrollTo({
					top: 0,
					// behavior: "smooth" // Smooth scrolling animation
				});
			});

			container.appendChild(button);
		});
	}

	function showCategory(category, updateHistory = true) {
		hideAllViews();

		views.category.hidden = false;

		$("categoryTitle").textContent = category;

		const grid = $("categoryGrid");

		grid.innerHTML = "";

		const matchingIds = Object.keys(state.records)
			.filter((id) => {
				const categories =
					Array.isArray(state.records[id].categories)
						? state.records[id].categories
						: [];

				return categories.includes(category);
			});

		if (matchingIds.length === 0) {
			const empty = document.createElement("div");

			empty.className = "empty-state";
			empty.textContent =
				"No photographs are currently in this category.";

			grid.appendChild(empty);
		} else {
			matchingIds.forEach((id) => {
				grid.appendChild(createRecordCard(id));
			});
		}

		if (updateHistory) {
			updateUrl({
				category: category
			});
		}
	}

	/*
	 * ------------------------------------------------------------
	 * Record cards
	 * ------------------------------------------------------------
	 */

	function createRecordCard(id) {
		const record = state.records[id];

		const button = document.createElement("button");

		button.type = "button";
		button.className = "card related-card";

		const image = document.createElement("img");
		const imageContainer = document.createElement("div");
		imageContainer.className = "card-image";

		image.src = record.image || "";
		image.alt =
			record.alt ||
			record.title ||
			`Photograph ${id}`;

		image.loading = "lazy";

		const body = document.createElement("div");

		body.className = "card-body card-copy";

		const number = document.createElement("p");

		number.className = "card-number";
		number.textContent = id;

		const title = document.createElement("p");

		title.className = "card-title";
		title.textContent = record.title || "";

		body.appendChild(number);
		body.appendChild(title);

		button.appendChild(imageContainer);
		imageContainer.appendChild(image);
		button.appendChild(body);

		button.addEventListener("click", (event) => {
			event.preventDefault();

			showRecord(id);
			window.scrollTo({
				top: 0,
				// behavior: "smooth" // Smooth scrolling animation
			});
		});

		return button;
	}

	/*
	 * ------------------------------------------------------------
	 * Render All - Front Page
	 * ------------------------------------------------------------
	 */
	
	function renderAllRecords() {
		const grid = $("allRecordsGrid");
		grid.innerHTML = "";
	
		const allIds = Object.keys(state.records);
	
		// Optionally hide/show the container if there are no records at all
		const section = $("allRecordsSection");
		if (section) {
			section.hidden = allIds.length === 0;
		}
	
		allIds.forEach((id) => {
			grid.appendChild(createRecordCard(id));
		});
	}
	
	
	/*
	 * ------------------------------------------------------------
	 * Related photographs
	 * ------------------------------------------------------------
	 */

	function renderRelated(relatedIds) {
		const grid = $("relatedGrid");

		grid.innerHTML = "";

		const validIds = relatedIds.filter((id) => {
			return Boolean(state.records[id]);
		});

		$("relatedSection").hidden =
			validIds.length === 0;

		validIds.forEach((id) => {
			grid.appendChild(createRecordCard(id));
		});
	}

	/*
	 * ------------------------------------------------------------
	 * Search
	 * ------------------------------------------------------------
	 */

	function findPhotograph() {
		const id = normalizeNumber(input.value);

		if (id.length !== 4) {
			searchMessage.textContent =
				"Enter a photograph number.";

			return;
		}

		if (!state.records[id]) {
			searchMessage.textContent =
				`No photograph was found for ${id}.`;

			return;
		}

		showRecord(id);
	}

	/*
	 * ------------------------------------------------------------
	 * Keypad
	 * ------------------------------------------------------------
	 */

	function handleKeypad(key) {
		if (key === "clear") {
			input.value = "";
			searchMessage.textContent = "";
			input.focus();

			return;
		}

		if (key === "backspace") {
			input.value =
				input.value.slice(0, -1);

			input.focus();

			return;
		}

		if (
			/^\d$/.test(key) &&
			input.value.length < 4
		) {
			input.value += key;

			input.focus();

			if (input.value.length === 4) {
				findPhotograph();
			}
		}
	}

	/*
	 * ------------------------------------------------------------
	 * Browser URL routing
	 * ------------------------------------------------------------
	 */

	function renderCurrentRoute() {
		if (!state.loaded) {
			return;
		}

		const params =
			new URLSearchParams(window.location.search);

		const photo = params.get("photo");
		const category = params.get("category");

		/*
		 * Photograph URL:
		 *
		 * ?photo=0001
		 */

		if (photo) {
			const id = normalizeNumber(photo);

			if (state.records[id]) {
				showRecord(id, false);
				return;
			}
		}

		/*
		 * Category URL:
		 *
		 * ?category=The%20Factory
		 */

		if (category) {
			showCategory(category, false);
			return;
		}

		/*
		 * No route = search page
		 */

		showSearch(false);
	}

	/*
	 * ------------------------------------------------------------
	 * Event listeners
	 * ------------------------------------------------------------
	 */

	$("searchForm").addEventListener(
		"submit",
		(event) => {
			event.preventDefault();

			findPhotograph();
		}
	);

	document
		.querySelectorAll(".keypad button")
		.forEach((button) => {
			button.addEventListener(
				"click",
				() => {
					handleKeypad(
						button.dataset.key
					);
				}
			);
		});

	$("backButton").addEventListener(
		"click",
		(event) => {
			event.preventDefault();

			showSearch();
		}
	);

	$("categoryBackButton").addEventListener(
		"click",
		(event) => {
			event.preventDefault();

			showSearch();
		}
	);

	window.addEventListener(
		"popstate",
		() => {
			renderCurrentRoute();
		}
	);

	/*
	 * ------------------------------------------------------------
	 * Load photograph data
	 * ------------------------------------------------------------
	 */

	fetch("data/photographs.json", {
		cache: "no-cache"
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(
					`Could not load photograph data (${response.status}).`
				);
			}

			return response.json();
		})
		.then((records) => {
			state.records = records;
			state.loaded = true;

			renderCurrentRoute();
		})
		.catch((error) => {
			console.error(error);

			hideAllViews();

			views.search.hidden = false;

			searchMessage.textContent =
				"The photograph data could not be loaded.";
		});
})();
