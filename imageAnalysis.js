function analyzeImage(imageElement) {

    // Create an invisible canvas
    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    // Use a smaller image for faster processing
    const maxSize = 500;

    let width = imageElement.naturalWidth;
    let height = imageElement.naturalHeight;


    // Resize while maintaining aspect ratio
    if (width > height) {

        if (width > maxSize) {

            height =
                height * (maxSize / width);

            width = maxSize;

        }

    } else {

        if (height > maxSize) {

            width =
                width * (maxSize / height);

            height = maxSize;

        }

    }


    canvas.width = Math.round(width);
    canvas.height = Math.round(height);


    // Draw image on canvas
    ctx.drawImage(
        imageElement,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Get pixel information
    const imageData =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );


    const pixels =
        imageData.data;


    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;

    let skinPixelCount = 0;


    /*
       We don't need every pixel.

       Sampling every 10th pixel makes
       the algorithm faster.
    */

    for (
        let i = 0;
        i < pixels.length;
        i += 40
    ) {

        const red =
            pixels[i];

        const green =
            pixels[i + 1];

        const blue =
            pixels[i + 2];

        const alpha =
            pixels[i + 3];


        // Ignore transparent pixels
        if (alpha < 200) {
            continue;
        }


        /*
           Basic skin-pixel detection.

           These conditions are deliberately
           approximate. They help remove many
           obvious background pixels.
        */

        const isSkin =
            detectSkinPixel(
                red,
                green,
                blue
            );


        if (isSkin) {

            redTotal += red;

            greenTotal += green;

            blueTotal += blue;

            skinPixelCount++;

        }

    }


    /*
       If we couldn't find enough likely
       skin pixels, return an error.
    */

    if (skinPixelCount < 10) {

        return {

            success: false,

            message:
                "Could not detect enough skin-colored pixels. Please use a clear photo in natural daylight."

        };

    }


    // Calculate average RGB
    const averageRed =
        Math.round(
            redTotal / skinPixelCount
        );


    const averageGreen =
        Math.round(
            greenTotal / skinPixelCount
        );


    const averageBlue =
        Math.round(
            blueTotal / skinPixelCount
        );


    // Convert RGB to HSL
    const hsl =
        rgbToHsl(
            averageRed,
            averageGreen,
            averageBlue
        );


    // Estimate skin tone
    const skinTone =
        determineSkinTone(
            hsl.lightness
        );


    // Estimate undertone
    const undertone =
        determineUndertone(
            averageRed,
            averageGreen,
            averageBlue,
            hsl
        );


    // Determine color family
    const colorFamily =
        determineColorFamily(
            undertone,
            hsl.lightness
        );


    return {

        success: true,

        rgb: {

            red: averageRed,

            green: averageGreen,

            blue: averageBlue

        },

        hsl: hsl,

        skinTone: skinTone,

        undertone: undertone,

        colorFamily: colorFamily,

        pixelsAnalyzed:
            skinPixelCount

    };

}



/* =========================================================
   2. SKIN PIXEL DETECTION
========================================================= */

function detectSkinPixel(
    red,
    green,
    blue
) {

    /*
       Basic RGB rules.

       Skin generally has:

       R > G
       G > B

       We also reject extremely dark
       and extremely bright pixels.
    */


    const maximum =
        Math.max(
            red,
            green,
            blue
        );


    const minimum =
        Math.min(
            red,
            green,
            blue
        );


    const difference =
        maximum - minimum;


    // Very dark pixels
    if (maximum < 45) {

        return false;

    }


    // Almost pure white pixels
    if (
        red > 245 &&
        green > 245 &&
        blue > 245
    ) {

        return false;

    }


    // Skin usually has red greater than green
    if (red <= green) {

        return false;

    }


    // Skin usually has green greater than blue
    if (green <= blue) {

        return false;

    }


    /*
       Reject pixels with extreme color
       differences.
    */

    if (difference > 130) {

        return false;

    }


    /*
       Additional relationship between
       RGB channels.
    */

    if (
        red - green < 10 ||
        green - blue < 5
    ) {

        return false;

    }


    return true;

}



/* =========================================================
   3. RGB → HSL
========================================================= */

function rgbToHsl(
    red,
    green,
    blue
) {

    red /= 255;
    green /= 255;
    blue /= 255;


    const max =
        Math.max(
            red,
            green,
            blue
        );


    const min =
        Math.min(
            red,
            green,
            blue
        );


    let hue = 0;

    let saturation = 0;

    const lightness =
        (max + min) / 2;


    const difference =
        max - min;


    if (difference !== 0) {

        saturation =
            lightness > 0.5
                ? difference /
                  (2 - max - min)
                : difference /
                  (max + min);


        if (max === red) {

            hue =
                (green - blue) /
                difference;

            if (green < blue) {

                hue += 6;

            }

        } else if (max === green) {

            hue =
                (blue - red) /
                difference + 2;

        } else {

            hue =
                (red - green) /
                difference + 4;

        }


        hue /= 6;

    }


    return {

        hue:
            Math.round(hue * 360),

        saturation:
            Math.round(saturation * 100),

        lightness:
            Math.round(lightness * 100)

    };

}



/* =========================================================
   4. DETERMINE SKIN TONE
========================================================= */

function determineSkinTone(lightness) {


    if (lightness < 30) {

        return "Deep";

    }


    if (lightness < 45) {

        return "Medium-Deep";

    }


    if (lightness < 60) {

        return "Medium";

    }


    if (lightness < 75) {

        return "Light";

    }


    return "Very Light";

}



/* =========================================================
   5. DETERMINE UNDERTONE
========================================================= */

function determineUndertone(
    red,
    green,
    blue,
    hsl
) {

    /*
       Warm colors tend to have relatively
       stronger red/yellow components.

       Cool colors tend to move more toward
       blue/pink.

       Neutral sits between the two.
    */


    const redGreenDifference =
        red - green;


    const greenBlueDifference =
        green - blue;


    /*
       Warm condition
    */

    if (
        redGreenDifference >= 35 &&
        greenBlueDifference >= 15
    ) {

        return "Warm";

    }


    /*
       Cool condition
    */

    if (
        hsl.hue >= 0 &&
        hsl.hue <= 25 &&
        hsl.saturation >= 15
    ) {

        return "Cool";

    }


    if (
        hsl.hue >= 200 &&
        hsl.hue <= 280
    ) {

        return "Cool";

    }


    /*
       Everything between these
       conditions is treated as neutral.
    */

    return "Neutral";

}



/* =========================================================
   6. DETERMINE COLOR FAMILY
========================================================= */

function determineColorFamily(
    undertone,
    lightness
) {


    if (
        undertone === "Warm"
    ) {

        if (lightness >= 60) {

            return "Warm Soft";

        }

        if (lightness >= 45) {

            return "Warm Earth";

        }

        return "Warm Rich";

    }



    if (
        undertone === "Cool"
    ) {

        if (lightness >= 60) {

            return "Cool Soft";

        }

        if (lightness >= 45) {

            return "Cool Classic";

        }

        return "Cool Deep";

    }



    // Neutral

    if (lightness >= 60) {

        return "Neutral Soft";

    }

    if (lightness >= 45) {

        return "Neutral Balanced";

    }

    return "Neutral Deep";

}



/* =========================================================
   7. DISPLAY ANALYSIS RESULT
========================================================= */

function displayAnalysis(result) {


    if (!result.success) {

        alert(result.message);

        return;

    }


    document.getElementById(
        "skinTone"
    ).textContent =
        result.skinTone;


    document.getElementById(
        "undertone"
    ).textContent =
        result.undertone;


    document.getElementById(
        "colorFamily"
    ).textContent =
        result.colorFamily;


    console.log(
        "ShadeStudio Analysis:",
        result
    );


    /*
       Automatically scroll to analysis
       after successful processing.
    */

    document.getElementById(
        "analysis"
    ).scrollIntoView({

        behavior: "smooth"

    });

}