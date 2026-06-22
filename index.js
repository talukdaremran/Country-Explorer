import { error } from 'console';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from "axios";
import fs from 'node:fs/promises';

import { loadCacheFromFile, saveCacheToFile } from './utils/local_file_cache.js';
import { fetchAllCountries as fetchFromAPI } from './utils/apiClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set view engine to EJS
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// all global variables
const PORT = 3001;

let cache = null;

async function getCountries() {     // fetch all countries data & store as cache

    // 1. if memory already has data, use it
    if (cache && cache.length > 0) return cache;

    // 2. if files exists, load from file (No API call)
    try {
        console.log("\nLoading from file cache...");
        const fileData = await loadCacheFromFile();

        if (fileData && fileData.length > 0) {
            cache = fileData;
            
            console.log("Loading successful!\n");
            return cache;
        }
        console.log("file cache loading Failed!");
    } catch (err) {
        console.error("file cache loading Failed!:", err.message);
    }

    // 3. API CALL (only if both caches fail)
    try {
        console.log("\nInitiating fetch from API call...");
        const allCountries = await fetchFromAPI();
        cache = allCountries;

        console.log("fetch from API call successfull!");

        await saveCacheToFile(cache);
        console.log("Saved as cache file.\n");

        return cache;

    } catch (err) {
        console.error("API fetch failed, using cache if available:", err.message);

        // fallback: return stale cache instead of crashing
        return cache || [];
    }
};

function fetchCountryByName(source, name) {     // takes cache as source and name to filter
    return source.filter(c => c.names.common.toLowerCase().startsWith(name.toLowerCase()));
}
function fetchCountryByRegion(source, region) {
    return source.filter(c => c.region.toLowerCase() === region.toLowerCase());
}

// Home route with all countries loaded
app.get('/', async (req, res) => {

    const { name, region } = req.query;

    let countries = await getCountries();

    if (region) {
        // fetch countries by region data from cache
        countries = fetchCountryByRegion(cache, region);
    }
    if (name) {
        // fetch country by name from cache
        countries = fetchCountryByName(cache, name);
    }

    res.render('index.ejs', { allCountries: countries });
});


// auto search with keystroke
app.get('/search', async (req, res) => {
    const { name, region } = req.query;

    let results = cache || await getCountries();

    if (region) {
        results = fetchCountryByRegion(results, region);
    }

    if (name) {
        results = fetchCountryByName(results, name);
    } else if (!region && !name) {
        results = cache;
    };

    res.json(results);
});

// Country route
app.get('/country', async (req, res) => {
    const { name } = req.query;

    try {
        // fetch main country data from cache
        const countryData = fetchCountryByName(cache, name);
        const country = countryData[0];

        let neighbors = [];
        // fetch neighboring countries from cache
        if (country.borders && country.borders.length > 0) {
            const borderCountries = cache.filter(c => country.borders.includes(c.codes.alpha_3));

            neighbors = borderCountries.map(c => ({
                name: c.names.common,
                flag: c.flag.url_svg
            }));
        };
        res.render('country.ejs', { country, neighbors });
    } catch (error) {
        console.log("error: country not found");
        res.status(404).render("error.ejs", {
            message: "Country not found. Please check the spelling and try again.",
        });
    }
});

// refresh cache
app.post("/refresh-cache", async (req, res) => {
    try {
        const newCache = await fetchFromAPI();

        cache = newCache;

        await saveCacheToFile(cache);

        res.redirect("/");
    } catch (err) {
        console.error("Cache refresh failed:", err.message);
        res.status(500).send("Failed to refresh cache");
    }
});

// Catch-all route for errors
app.get('/*splat', (req, res) => {
    res.status(404).render('error.ejs', { message: '404 Page not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
