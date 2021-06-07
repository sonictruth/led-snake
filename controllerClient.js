const { MultiKey, GamePad } = require('hud-gamepad');

const url = `ws://${document.location.hostname}:${document.location.port}`;
const socket = new WebSocket(url);

function reloadPage() {
    setTimeout(() => document.location.reload(), 1000);
}

function showMessage(text) {
    document.getElementById('message').innerHTML = text;
}

showMessage(`Connecting to: ${url}`);

socket.addEventListener('close', () => {
    setTimeout();
})

socket.addEventListener('open', event => {
    showMessage(`Connected.`);
});

socket.addEventListener('message', event => {
    showMessage(event.data);
});

window.addEventListener("orientationchange", () => reloadPage());

GamePad.setup({
    debug: false,
    trace: false,
    start: true,
    joystick: false,
    hint: true,
    buttons: [

        { name: "right", "key": "d" },
        { name: "down", "key": "s" },

        { name: "up", "key": "w" },
        { name: "left", "key": "a" },

    ]
});


MultiKey.setup(GamePad.events, "wsad ", true);

let state = JSON.stringify(GamePad.observe());

function loop() {
    const newState = JSON.stringify(GamePad.observe());
    if (state !== newState) {
        socket.send(newState);
    };
    state = newState;
    window.requestAnimationFrame(loop);
}

document.addEventListener('keydown', event => {
    if (event.key === ' ') {
        socket.send(JSON.stringify({ start: 1 }));
    }
});

loop();
