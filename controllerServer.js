const http = require('http');
const WebSocket = require('ws');
const { EventEmitter } = require('events');
const controllerEventEmitter = new EventEmitter();

const ecstatic = require('ecstatic')({
    root: `${__dirname}/public`,
    showDir: true,
    autoIndex: true,
});

require('esbuild').build({
    entryPoints: ['controllerClient.js'],
    bundle: true,
    outfile: './public/app.min.js',
    watch: {
        onRebuild(error, result) {
            if (error) console.error('Client rebuild failed:', error)
            else console.log('Client rebuild.')
        },
    },
}).catch(() => process.exit(1))


module.exports = (serverPort) => {
    return new Promise((resolve, reject) => {
        const server = http.createServer(ecstatic);
        server.listen(serverPort, '0.0.0.0', () => {
            const wss = new WebSocket.Server({ server });

            controllerEventEmitter.on('message', message => {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            })
            wss.on('connection', ws =>
                ws.on('message', message =>
                    controllerEventEmitter.emit('buttons', JSON.parse(message))
             ));

            resolve(controllerEventEmitter);
        });
    })
}
