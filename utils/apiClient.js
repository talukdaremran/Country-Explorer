import axios from "axios";

const API_URL = "https://api.restcountries.com/countries/v5";

const HEADERS = {
    // 'Authorization': `Bearer ${process.env.REST_COUNTRIES_API_KEY}`
    'Authorization': `Bearer rc_live_50eb65ad8e6d4b968b6efe8ceea99bb7`
};

async function fetchCountriesPage(limit, offset) {
    try {
        const res = await axios.get(
            `${API_URL}?limit=${limit}&offset=${offset}`,
            { headers: HEADERS }
        );
        return res.data?.data?.objects || [];

    } catch (err) {
        console.error("API error:", err);
        throw err;
    }
}

async function fetchAllCountries() {
    const [ res1, res2, res3 ] = await Promise.all([
        fetchCountriesPage(100, 0),
        fetchCountriesPage(100, 100),
        fetchCountriesPage(100, 200)
    ]);

    return [...res1, ...res2, ...res3];
}

export { fetchAllCountries };

        //  line 16: return res.data?.data?.objects || [];
        // ? why weird syntax in line 16 to get hold of countries array data? 
        // REST countries previous API URLs are deprecated 
        // now uses new URL with endpoints changed a little bit. 
        // in new version of 'REST countries' API provides JSON data wraped inside objects
        // the structure is -
        //                   { "data": {
        //                        "objects": [ {country1_data}, {country2_data}... ], 
        //                        "meta": {} 
        //                     } 
        //                   }
        // so to get hold of coutries array using dot notation (that is `.data.objects`).