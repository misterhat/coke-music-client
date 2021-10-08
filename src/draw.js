// set a polygon of an image to transparent
function cutPolygon(context, points) {
    console.log(points);

    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i += 1) {
        const { x, y } = points[i];
        path.lineTo(x, y);
    }

    path.closePath();

    context.globalCompositeOperation = 'destination-out';

    context.fill(path);

    context.globalCompositeOperation = 'source-over';
}

// apply background shading to an image
function shadeImage(image, backgroundImage, offsetX, offsetY, intensity = 0.75) {
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;

    const imageContext = imageCanvas.getContext('2d');
    imageContext.drawImage(image, 0, 0);

    const imageData = imageContext.getImageData(0, 0, image.width, image.height)
        .data;

    const shaded = document.createElement('canvas');

    shaded.width = image.width;
    shaded.height = image.height;

    const shadedContext = shaded.getContext('2d');

    shadedContext.drawImage(
        backgroundImage,
        offsetX,
        offsetY,
        image.width,
        image.height,
        0,
        0,
        image.width,
        image.height
    );

    const shadedData = shadedContext.getImageData(
        0,
        0,
        image.width,
        image.height
    );

    for (let i = 0; i < image.width * image.height * 4; i += 4) {
        if (imageData[i + 3] === 0) {
            shadedData.data[i + 3] = 0;
        }
    }

    shadedContext.putImageData(shadedData, 0, 0);

    imageContext.globalCompositeOperation = 'overlay';
    imageContext.globalAlpha = intensity;
    imageContext.drawImage(shaded, 0, 0);
    imageContext.globalAlpha = 1;

    return {
        context: imageContext,
        canvas: imageCanvas
    };
}

// use multiplication to colourize greyscale sprites
function colourizeImage(context, colour) {
    const imageData = context.getImageData(
        0,
        0,
        70,
        56
    );

    for (let i = 0; i < 70 * 56 * 4; i += 4) {
        const isGrey =
            imageData.data[i] === imageData.data[i + 1] &&
            imageData.data[i + 1] === imageData.data[i + 2] &&
            imageData.data[i + 2] === imageData.data[i];

        const isBlack = isGrey && imageData.data[i] === 0;
        const isTransparent = imageData.data[i + 3] === 0;

        if (!isBlack && !isTransparent && isGrey) {
            imageData.data[i] *= colour.r / 255;
            imageData.data[i + 1] *= colour.g / 255;
            imageData.data[i + 2] *= colour.b / 255;
        }
    }

    context.putImageData(imageData, 0, 0);
}

module.exports = {
    cutPolygon,
    shadeImage,
    colourizeImage
};
