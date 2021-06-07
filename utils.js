const {
    screenWidth,
    screenBrightness,
    letterOptions,
    scrollOptions
} = require('./settings.js');

const {
    drawScrollingText,
} = require('ws2812draw');

function rgbTobgr(hexColor) {
    hexColor = parseInt(hexColor);
    const red = (hexColor >> 16) & 0xFF;
    const green = (hexColor >> 8) & 0xFF;
    const blue = (hexColor >> 0) & 0xFF;
    const out = (blue << 16) | (green << 8) | (red << 0);
    return out;
}

function writePromise(text, foregroundColor, backgroundColor) {
    const p = new Promise(resolve => {
        const event = write(text, foregroundColor, backgroundColor);
        event.on('done', () => resolve());
    });
    return p;
}

function write(text, foregroundColor = 0xff0000, backgroundColor = 0x000000) {
    foregroundColor = rgbTobgr(foregroundColor);
    backgroundColor = rgbTobgr(backgroundColor);
    return drawScrollingText(
        screenWidth,
        screenBrightness,
        text,
        { ...letterOptions, foregroundColor, backgroundColor },
        { ...scrollOptions, padBackgroundColor: backgroundColor }
    );
}

function clearScreen(screen) {
    return screen.map(row => row.fill(0));
}

function setScreenPixel(screen, x, y, color) {
    screen[y][x] = color; //FIXME screen matrix is yx
    return screen;
}

function getScreenPixel(screen, x, y) {
    return screen[y][x]; //FIXME screen matrix is yx
}

function getEmptyRandomPixel(screen) {
    const emptyPositions = screen.reduce(
        (acc, col, y) =>
            acc.concat(
                col.reduce((acc2, pixel, x) => {
                    if (pixel === 0) acc2.push([x, y]);
                    return acc2;
                }, [])
            ),
        []
    );
    if (emptyPositions.length === 0) {
        return null;
    } else {
        return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    }
}

function getIp() {
    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
}

module.exports = {
    writePromise,
    write,
    rgbTobgr,
    clearScreen,
    getIp,
    setScreenPixel,
    getScreenPixel,
    getEmptyRandomPixel,
}
