const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('npx', ['-y', 'localtunnel', '--port', '3000'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
});

let allOutput = '';

child.stdout.on('data', (data) => {
    const text = data.toString();
    allOutput += text;

    const match = text.match(/(https:\/\/\S+\.loca\.lt)/);
    if (match) {
        const url = match[1];
        fs.writeFileSync('lt_url.txt', url, 'utf8');
        console.log('URL_CHUNK_1:' + url.substring(0, 25));
        console.log('URL_CHUNK_2:' + url.substring(25));
    }
});

child.stderr.on('data', (data) => {
    // ignore
});

child.on('close', (code) => {
    console.log('EXIT:' + code);
});

process.on('SIGINT', () => {
    child.kill();
    process.exit();
});
