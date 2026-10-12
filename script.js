/* ==================================================
   SHADESTUDIO
   Main JavaScript
================================================== */


/* ==================================================
   1. THEME DATA
================================================== */

const themes = {

    blush: {
        background: "#fff8f8",
        surface: "#ffffff",
        text: "#30272a",
        muted: "#766b6f",
        primary: "#d98b9b",
        primaryDark: "#a85d6d",
        soft: "#f4dce2",
        border: "#ead8dd"
    },

    glow: {
        background: "#fffdf3",
        surface: "#ffffff",
        text: "#302d21",
        muted: "#77715d",
        primary: "#e5bd49",
        primaryDark: "#a47d12",
        soft: "#f7edbd",
        border: "#eadca8"
    },

    sage: {
        background: "#f7faf5",
        surface: "#ffffff",
        text: "#293028",
        muted: "#687065",
        primary: "#91a77a",
        primaryDark: "#61774f",
        soft: "#dfe8d7",
        border: "#d2ddc9"
    },

    ocean: {
        background: "#f4fafc",
        surface: "#ffffff",
        text: "#263237",
        muted: "#66777d",
        primary: "#5797ad",
        primaryDark: "#326d82",
        soft: "#d7ebf1",
        border: "#c9e1e8"
    },

    berry: {
        background: "#fff7f9",
        surface: "#ffffff",
        text: "#30252a",
        muted: "#75636a",
        primary: "#a85470",
        primaryDark: "#713348",
        soft: "#efd6df",
        border: "#e5c5d0"
    },

    midnight: {
        background: "#f8f7fc",
        surface: "#ffffff",
        text: "#282631",
        muted: "#6e6b79",
        primary: "#71658f",
        primaryDark: "#40375d",
        soft: "#e4e0ee",
        border: "#d8d2e6"
    }

};


/* ==================================================
   2. CHANGE WEBSITE THEME
================================================== */

function changeTheme(themeName) {

    const theme = themes[themeName];

    if (!theme) {
        return;
    }

    const root = document.documentElement;

    root.style.setProperty(
        "--background",
        theme.background
    );

    root.style.setProperty(
        "--surface",
        theme.surface
    );

    root.style.setProperty(
        "--text",
        theme.text
    );

    root.style.setProperty(
        "--muted",
        theme.muted
    );

    root.style.setProperty(
        "--primary",
        theme.primary
    );

    root.style.setProperty(
        "--primary-dark",
        theme.primaryDark
    );

    root.style.setProperty(
        "--soft",
        theme.soft
    );

    root.style.setProperty(
        "--border",
        theme.border
    );
}


/* ==================================================
   3. SCROLL FUNCTIONS
================================================== */

function scrollToMood() {

    document
        .getElementById("mood")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function scrollToUpload() {

    document
        .getElementById("discover")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* ==================================================
   4. IMAGE PREVIEW + ANALYSIS
================================================== */

function previewPhoto(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    // Check whether selected file is an image

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;
    }


    const preview =
        document.getElementById(
            "photoPreview"
        );


    const container =
        document.getElementById(
            "preview-container"
        );


    const reader =
        new FileReader();


    reader.onload = function(e) {

        preview.src =
            e.target.result;


        container.style.display =
            "block";


        /*
           Wait for the image to completely
           load before analyzing pixels.
        */

        preview.onload = function() {

            console.log(
                "Photo loaded successfully."
            );


            // Run our own image analysis

            const result =
                analyzeImage(preview);


            // Display skin analysis

            displayAnalysis(result);


            // Generate personalized palette

            if (result.success) {

                generatePersonalizedPalette(
                    result
                );

            }

        };

    };


    reader.readAsDataURL(file);
}


/* ==================================================
   5. GENERATE PERSONALIZED PALETTE
================================================== */

function generatePersonalizedPalette(
    analysis
) {

    console.log(
        "Generating personalized palette..."
    );


    /*
       Create a new copy of the database.

       We don't directly modify the original
       colorDatabase.
    */

    const colors =
        colorDatabase.map(
            color => {

                return {
                    ...color
                };

            }
        );


    /*
       Calculate compatibility score
       for every color.
    */

    for (
        let i = 0;
        i < colors.length;
        i++
    ) {

        colors[i].score =
            calculateCompatibilityScore(
                colors[i],
                analysis
            );

    }


    /*
       IMPORTANT:

       We are NOT using JavaScript's
       built-in sort().

       We are using our own Merge Sort.
    */

    const sortedColors =
        mergeSort(
            colors
        );


    /*
       Take the top 8 colors.
    */

    const topColors =
        sortedColors.slice(
            0,
            8
        );


    console.log(
        "Sorted Color Results:",
        topColors
    );


    // Display results

    displayColorPalette(
        topColors,
        analysis
    );

}


/* ==================================================
   6. COMPATIBILITY SCORE
================================================== */

function calculateCompatibilityScore(
    color,
    analysis
) {

    let score = 0;


    /* ----------------------------------------------
       PART A — UNDERTONE MATCH
    ---------------------------------------------- */

    if (
        color.undertone ===
        analysis.undertone
    ) {

        score += 55;

    }


    /*
       Neutral colors can work with
       different undertones.
    */

    else if (
        color.undertone ===
        "Neutral"
    ) {

        score += 38;

    }


    else {

        score += 20;

    }


    /* ----------------------------------------------
       PART B — SKIN TONE CONTRAST
    ---------------------------------------------- */


    const colorHsl =
        hexToHsl(
            color.hex
        );


    const skinLightness =
        analysis.hsl.lightness;


    const colorLightness =
        colorHsl.lightness;


    /*
       Calculate difference between
       skin brightness and color brightness.
    */

    const difference =
        Math.abs(
            skinLightness -
            colorLightness
        );


    /*
       Ideal contrast is around 35.

       The closer the difference is
       to 35, the better the score.
    */

    const contrastDifference =
        Math.abs(
            difference - 35
        );


    let contrastScore =
        35 -
        contrastDifference;


    if (
        contrastScore < 0
    ) {

        contrastScore = 0;

    }


    score +=
        contrastScore;


    /* ----------------------------------------------
       PART C — SATURATION
    ---------------------------------------------- */

    if (
        colorHsl.saturation >= 35 &&
        colorHsl.saturation <= 85
    ) {

        score += 10;

    }


    /*
       Maximum theoretical score
       is around 100.
    */

    if (score > 100) {

        score = 100;

    }


    return Math.round(
        score
    );

}


/* ==================================================
   7. HEX → HSL
================================================== */

function hexToHsl(hex) {

    /*
       Remove # from hexadecimal value
    */

    hex =
        hex.replace(
            "#",
            ""
        );


    const red =
        parseInt(
            hex.substring(0, 2),
            16
        );


    const green =
        parseInt(
            hex.substring(2, 4),
            16
        );


    const blue =
        parseInt(
            hex.substring(4, 6),
            16
        );


    return rgbToHsl(
        red,
        green,
        blue
    );

}


/* ==================================================
   8. MERGE SORT
================================================== */

/*
   This is our own Merge Sort implementation.

   Time Complexity:
   O(n log n)

   Space Complexity:
   O(n)
*/


function mergeSort(array) {

    /*
       Base condition
    */

    if (
        array.length <= 1
    ) {

        return array;

    }


    /*
       Find middle element
    */

    const middle =
        Math.floor(
            array.length / 2
        );


    /*
       Divide array into two parts
    */

    const left =
        array.slice(
            0,
            middle
        );


    const right =
        array.slice(
            middle
        );


    /*
       Recursively sort both halves
    */

    const sortedLeft =
        mergeSort(
            left
        );


    const sortedRight =
        mergeSort(
            right
        );


    /*
       Merge both sorted halves
    */

    return merge(
        sortedLeft,
        sortedRight
    );

}


/* ==================================================
   9. MERGE FUNCTION
================================================== */

function merge(
    left,
    right
) {

    const result = [];

    let leftIndex = 0;

    let rightIndex = 0;


    /*
       Compare scores.

       Higher score comes first.
    */

    while (
        leftIndex < left.length &&
        rightIndex < right.length
    ) {

        if (
            left[leftIndex].score >=
            right[rightIndex].score
        ) {

            result.push(
                left[leftIndex]
            );

            leftIndex++;

        }

        else {

            result.push(
                right[rightIndex]
            );

            rightIndex++;

        }

    }


    /*
       Add remaining left elements
    */

    while (
        leftIndex < left.length
    ) {

        result.push(
            left[leftIndex]
        );

        leftIndex++;

    }


    /*
       Add remaining right elements
    */

    while (
        rightIndex < right.length
    ) {

        result.push(
            right[rightIndex]
        );

        rightIndex++;

    }


    return result;

}


/* ==================================================
   10. DISPLAY PERSONALIZED PALETTE
================================================== */

function displayColorPalette(
    colors,
    analysis
) {

    /*
       Find the analysis section.
    */

    const analysisSection =
        document.getElementById(
            "analysis"
        );


    if (!analysisSection) {

        console.error(
            "Analysis section not found."
        );

        return;

    }


    /*
       Remove previous palette
       if user uploads another photo.
    */

    const oldPalette =
        document.getElementById(
            "dynamicPalette"
        );


    if (oldPalette) {

        oldPalette.remove();

    }


    /*
       Create palette container
    */

    const palette =
        document.createElement(
            "div"
        );


    palette.id =
        "dynamicPalette";


    palette.className =
        "dynamic-palette";


    /*
       Create heading
    */

    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        "✨ Your Personalized Colors";


    palette.appendChild(
        heading
    );


    /*
       Description
    */

    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        "Colors ranked according to your skin tone and undertone.";


    palette.appendChild(
        description
    );


    /*
       Create color grid
    */

    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "color-grid";


    /*
       Create card for every
       recommended color.
    */

    colors.forEach(
        function(color, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "color-card";


            /*
               Color preview
            */

            const swatch =
                document.createElement(
                    "div"
                );


            swatch.className =
                "color-swatch";


            swatch.style.backgroundColor =
                color.hex;


            /*
               Rank number
            */

            const rank =
                document.createElement(
                    "span"
                );


            rank.className =
                "color-rank";


            rank.textContent =
                "#" + (index + 1);


            swatch.appendChild(
                rank
            );


            card.appendChild(
                swatch
            );


            /*
               Color name
            */

            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                color.name;


            card.appendChild(
                name
            );


            /*
               Mood
            */

            const mood =
                document.createElement(
                    "p"
                );


            mood.textContent =
                color.mood;


            card.appendChild(
                mood
            );


            /*
               Compatibility score
            */

            const score =
                document.createElement(
                    "strong"
                );


            score.textContent =
                color.score +
                "% match";


            card.appendChild(
                score
            );


            /*
               Hex value
            */

            const hex =
                document.createElement(
                    "small"
                );


            hex.textContent =
                color.hex;


            card.appendChild(
                hex
            );


            grid.appendChild(
                card
            );

        }
    );


    palette.appendChild(
        grid
    );


    /*
       Add algorithm information.
       This is useful for your A.A.D.
       project demonstration.
    */

    const algorithmInfo =
        document.createElement(
            "div"
        );


    algorithmInfo.className =
        "algorithm-info";


    algorithmInfo.innerHTML = `
        <strong>How your palette was created</strong>
        <p>
        ShadeStudio calculated compatibility scores
        and ranked the colors using Merge Sort.
        </p>
    `;


    palette.appendChild(
        algorithmInfo
    );


    /*
       Add everything to the page.
    */

    analysisSection.appendChild(
        palette
    );


    /*
       Scroll toward palette.
    */

    palette.scrollIntoView({
        behavior: "smooth",
        block: "start"
    }
    );

}
/* ==================================================
   11. LINEAR SEARCH
================================================== */

/*
   Our own Linear Search algorithm.

   Time Complexity:
   O(n)

   It checks each color one by one.
*/

function linearSearch(
    database,
    keyword
) {

    const results = [];

    keyword =
        keyword
            .toLowerCase()
            .trim();


    for (
        let i = 0;
        i < database.length;
        i++
    ) {

        const color =
            database[i];


        const name =
            color.name.toLowerCase();


        const category =
            color.category.toLowerCase();


        const mood =
            color.mood.toLowerCase();


        /*
           Check whether keyword exists
           in name, category or mood.
        */

        if (
            name.includes(keyword) ||
            category.includes(keyword) ||
            mood.includes(keyword)
        ) {

            results.push(color);

        }

    }


    return results;

}


/* ==================================================
   12. SEARCH COLORS
================================================== */

function searchColors() {

    const input =
        document.getElementById(
            "colorSearch"
        );


    const keyword =
        input.value;


    if (
        keyword.trim() === ""
    ) {

        showAllColors();

        return;

    }


    const results =
        linearSearch(
            colorDatabase,
            keyword
        );


    displaySearchResults(
        results,
        "Search Results"
    );

}


/* ==================================================
   13. FILTER COLORS
================================================== */

function filterColors(
    undertone
) {

    const results = [];


    /*
       We are deliberately using a loop
       instead of JavaScript's filter().
    */

    for (
        let i = 0;
        i < colorDatabase.length;
        i++
    ) {

        if (
            colorDatabase[i].undertone ===
            undertone
        ) {

            results.push(
                colorDatabase[i]
            );

        }

    }


    displaySearchResults(
        results,
        undertone + " Colors"
    );

}


/* ==================================================
   14. SHOW ALL COLORS
================================================== */

function showAllColors() {

    displaySearchResults(
        colorDatabase,
        "All Colors"
    );

}


/* ==================================================
   15. DISPLAY SEARCH RESULTS
================================================== */

function displaySearchResults(
    results,
    title
) {

    const container =
        document.getElementById(
            "searchResults"
        );


    container.innerHTML = "";


    /*
       Heading
    */

    const heading =
        document.createElement(
            "h4"
        );


    heading.textContent =
        title +
        " (" +
        results.length +
        ")";


    container.appendChild(
        heading
    );


    /*
       No results
    */

    if (
        results.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "No matching colors found.";


        container.appendChild(
            message
        );


        return;

    }


    /*
       Create color cards
    */

    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "search-grid";


    for (
        let i = 0;
        i < results.length;
        i++
    ) {

        const color =
            results[i];


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "search-color-card";


        card.innerHTML = `

            <div
                class="search-swatch"
                style="background:${color.hex}">
            </div>

            <h4>
                ${color.name}
            </h4>

            <p>
                ${color.category}
            </p>

            <small>
                ${color.mood}
            </small>

        `;


        grid.appendChild(
            card
        );

    }


    container.appendChild(
        grid
    );

}