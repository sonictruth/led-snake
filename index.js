const {
	init,
	LedColor,
	drawFrame,
	cleanUp,
} = require('ws2812draw');

const {
	screenHeight,
	screenWidth,
	screenBrightness,
	serverPort,
	fps,
} = require('./settings.js');

const {
	write,
	clearScreen,
	getIp,
	setScreenPixel,
	getScreenPixel,
	getEmptyRandomPixel,
} = require('./utils.js');

const controllerServer = require('./controllerServer.js');

(async () => {

	init(screenHeight, screenWidth, screenBrightness);

	const hostname = `http://${getIp()}:${serverPort}/`;

	const controllerEventEmitter = await controllerServer(serverPort);

	controllerEventEmitter.on('buttons', buttons => buttonsStates = buttons);

	function sendMessageToController(message) {
		controllerEventEmitter.emit('message', message);
	}

	const screens = {
		MAIN: "main",
		PLAYING: "play",
		END: "end",
	};

	const colors = {
		GRASS: 0x000000,
		SNAKE: 0xffffff,
		SNAKE_HEAD: 0xffff00,
		FOOD: 0x0000ff,
	};

	let screen = new Array(screenHeight).fill(0).map(() =>
		new Array(screenWidth).fill(0));

	let buttonsStates = {};

	let currrentScreen = screens.MAIN;
	let writingEventEmitter = null;

	let lastTime = Date.now();
	const fpsInterval = 1000 / fps;

	let score, foodPosition, snakeSegments, snakeHead, snakeLength, field;

	function initGame() {
		clearScreen(screen);
		score = 0;
		snakeLength = 3
		foodPosition = null;
		snakeSegments = [];
		snakeHead = [
			screenWidth / 2,
			screenHeight / 2,
		];
		snakeDirection = [1, 0];
		sendMessageToController('Game started');
	}

	function handleGameInput() {
		if (buttonsStates['left'] === 1 && snakeDirection[0] === 0) {
			snakeDirection = [-1, 0];
		} else if (buttonsStates['right'] === 1 && snakeDirection[0] === 0) {
			snakeDirection = [1, 0];
		} else if (buttonsStates['up'] === 1 && snakeDirection[1] === 0) {
			snakeDirection = [0, -1];
		} else if (buttonsStates['down'] === 1 && snakeDirection[1] === 0) {
			snakeDirection = [0, 1];
		}
	}

	function updateGame() {

		snakeHead[0] += snakeDirection[0];
		snakeHead[1] += snakeDirection[1];

		if (snakeHead[0] > screenWidth - 1) {
			snakeHead[0] = 0;
		}

		if (snakeHead[1] > screenHeight - 1) {
			snakeHead[1] = 0;
		}

		if (snakeHead[0] < 0) {
			snakeHead[0] = screenWidth - 1;
		}

		if (snakeHead[1] < 0) {
			snakeHead[1] = screenHeight - 1;
		}

		snakeSegments.push([...snakeHead]);

		while (snakeSegments.length > snakeLength) {
			snakeSegments.shift();
		}

		// Check collision
		const nextScreenHeadPos = getScreenPixel(screen, snakeHead[0], snakeHead[1]);

		if (foodPosition === null) {
			foodPosition = getEmptyRandomPixel(screen);
		}

		if (nextScreenHeadPos === colors.FOOD) {
			snakeLength++;
			score++;
			foodPosition = getEmptyRandomPixel(screen);
			sendMessageToController('Score: ' + score);
		}

		if (nextScreenHeadPos === colors.SNAKE || nextScreenHeadPos === colors.SNAKE_HEAD) {
			currrentScreen = screens.END;
			return;
		}

		// Draw
		clearScreen(screen);
		for (let i = 0; i < snakeSegments.length; i++) {
			const segment = snakeSegments[i];
			const x = segment[0];
			const y = segment[1];
			let headColor = colors.SNAKE_HEAD;
			if (i === snakeSegments.length - 1) {
				headColor = colors.SNAKE;
			}
			setScreenPixel(screen, x, y, headColor);
		}
		if (foodPosition !== null) {
			setScreenPixel(screen, foodPosition[0], foodPosition[1], colors.FOOD);
		}
		drawFrame(screen);
	}


	clearScreen(screen);

	function gameLoop() {
		var currentTime = Date.now();
		var elapsedTime = currentTime - lastTime;

		switch (currrentScreen) {
			case screens.MAIN:
				if (writingEventEmitter === null) {
					writingEventEmitter =
						write(`Use your phone to connect to ${hostname}`, 0xfc0011, 0x07240d);
				}
				if (buttonsStates.start === 1) {
					writingEventEmitter.emit('stop');
					writingEventEmitter = null;
					currrentScreen = screens.PLAY;
					initGame();
				}
				break;
			case screens.PLAY:
				handleGameInput();
				if (elapsedTime > fpsInterval) {
					updateGame();
					lastTime = currentTime;
				}
				break;
			case screens.END:
				if (writingEventEmitter === null) {
					writingEventEmitter =
						write(`GAME OVER Your score is ${score}. Press start to continue. `,
							0x0000ff,
							0x505416);
					sendMessageToController(`Game Over! Your score is ${score}.`);
				}
				if (buttonsStates.start === 1) {
					writingEventEmitter.emit('stop');
					writingEventEmitter = null;
					currrentScreen = screens.MAIN;
				}
				break;
		}
		setTimeout(gameLoop);
	}
	gameLoop();

})()
