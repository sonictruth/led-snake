const {
	LedColor,
	MatrixPaddingOption,
} = require('ws2812draw');

const screenWidth = 32;
const screenHeight = 8;
const screenBrightness = 50;
const backgroundColor = LedColor.BLUE;
const foregroundColor = LedColor.RED;
const serverPort = 8080;
const fps = 10;

const letterOptions = {
    foregroundColor,
    backgroundColor,
    monospace: false,
};

const scrollOptions = {
    loopCount: -1,
    frameDelayMs: 30,
    loopDelayMs: 0,
    padding: MatrixPaddingOption.LEFT,
    padBackgroundColor: backgroundColor,
    emptyFrameBetweenLoops: true,
    drawAfterLastScroll: true,
    //scrollDirection: 'left',
}

module.exports = {
    letterOptions,
    scrollOptions,
    screenWidth,
    screenHeight,
    screenBrightness,
    serverPort,
    fps,
}
