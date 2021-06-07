const { MultiKey, GamePad } = require('hud-gamepad');

const url = `ws://${document.location.hostname}:${document.location.port}`;
const socket = new WebSocket(url);

function showMessage(text) {
    document.getElementById('message').innerHTML = text;
}

showMessage(`Connecting to: ${url}`);

socket.addEventListener('close', () => {
    setTimeout(() => document.location.reload());
})

socket.addEventListener('open', event => {
    showMessage(`Connected.`);
});

socket.addEventListener('message', event => {
    showMessage(event.data);
});

GamePad.setup({
    debug: false,
    trace: false,
    start: false,
    joystick: true,
    hint: true,
    buttons: [
        { name: "start", "key": " " },
    ]
});

MultiKey.setup(GamePad.events, "a ", true);

let state = JSON.stringify(GamePad.observe());

function loop() {
    const newState = JSON.stringify(GamePad.observe());
    if (state !== newState) {
        socket.send(newState);
    };
    state = newState;
    window.requestAnimationFrame(loop);
}

loop();
