// Country ordering by popularity
const COUNTRY_PRIORITY = {
    England: 1,
    "Champions League": 2,
    "Europa League": 3,
    Spain: 4,
    Italy: 5,
    Germany: 6,
    France: 7,
    Netherlands: 8,
    Portugal: 9,
    Brazil: 10,
    Argentina: 11,
    "World Cup": 12,
    "European Championship": 13,
};

// Convert country name to flag file name
// Spaces become hyphens, lowercase
function getCountryFlagPath(country) {
    // Handle special cases for competitions
    if (country.toLowerCase().includes("champions league") || country.toLowerCase().includes("uefa champions")) {
        return "/assets/european-union.png"; // Use EU flag for Champions League
    }
    if (country.toLowerCase().includes("europa league") || country.toLowerCase().includes("uefa europa")) {
        return "/assets/european-union.png"; // Use EU flag for Europa League
    }
    if (country.toLowerCase().includes("world cup")) {
        return "/assets/european-union.png"; // Use EU flag for World Cup
    }
    if (country.toLowerCase().includes("european championship") || country.toLowerCase().includes("euro")) {
        return "/assets/european-union.png"; // Use EU flag for European Championship
    }

    // Convert country name to file name format
    // Replace spaces with hyphens, convert to lowercase
    let fileName = country
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""); // Remove special characters

    // Handle special country name mappings
    const countryMappings = {
        "united-kingdom": "england", // UK often shows as England in football
        "united-states": "united-states",
        "usa": "united-states",
        "us": "united-states",
        "south-korea": "south-korea",
        "north-korea": "north-korea",
        "czech-republic": "czech-republic",
        "czech": "czech-republic",
        "south-africa": "south-africa",
        "bosnia-and-herzegovina": "bosnia-and-herzegovina",
        "democratic-republic-of-congo": "democratic-republic-of-congo",
        "republic-of-the-congo": "republic-of-the-congo",
        "costa-rica": "costa-rica",
        "el-salvador": "el-salvador",
        "dominican-republic": "dominican-republic",
        "hong-kong": "hong-kong",
        "ivory-coast": "ivory-coast",
        "puerto-rico": "puerto-rico",
    };

    // Check if we have a mapping
    if (countryMappings[fileName]) {
        fileName = countryMappings[fileName];
    }

    // Handle Brazil with trailing dash issue (file is named "brazil-.png")
    if (fileName === "brazil") {
        fileName = "brazil-";
    }

    // Handle Sweden duplicate file issue (use the one without "(1)")
    if (fileName === "sweden") {
        fileName = "sweden";
    }

    return `/assets/${fileName}.png`;
}

function getCountryFlag(country) {
    return getCountryFlagPath(country);
}

function getCountryPriority(country) {
    // Check exact match
    if (COUNTRY_PRIORITY[country] !== undefined) {
        return COUNTRY_PRIORITY[country];
    }

    // Check for Champions League, Europa League, etc.
    const lowerCountry = country.toLowerCase();
    if (lowerCountry.includes("champions league") || lowerCountry.includes("uefa champions")) {
        return COUNTRY_PRIORITY["Champions League"];
    }
    if (lowerCountry.includes("europa league") || lowerCountry.includes("uefa europa")) {
        return COUNTRY_PRIORITY["Europa League"];
    }
    if (lowerCountry.includes("world cup")) {
        return COUNTRY_PRIORITY["World Cup"];
    }
    if (lowerCountry.includes("european championship") || lowerCountry.includes("euro")) {
        return COUNTRY_PRIORITY["European Championship"];
    }

    // Check partial matches for countries
    for (const [key, priority] of Object.entries(COUNTRY_PRIORITY)) {
        if (lowerCountry.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCountry)) {
            return priority;
        }
    }

    // Default priority (lowest)
    return 999;
}

function sortCountriesByPriority(countries) {
    return [...countries].sort((a, b) => {
        const priorityA = getCountryPriority(a.country);
        const priorityB = getCountryPriority(b.country);
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return a.country.localeCompare(b.country);
    });
}

module.exports = {
    COUNTRY_PRIORITY,
    getCountryFlagPath,
    getCountryFlag,
    getCountryPriority,
    sortCountriesByPriority
};
