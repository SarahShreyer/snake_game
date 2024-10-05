let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
let mongoose = require('mongoose');

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

mongoose.connect(connectionString)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const highScoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const HighScore = mongoose.model('HighScore', highScoreSchema);

const ITEMS_PER_PAGE = 5;

function startServer(actions) {
    http.createServer((req, res) => {
        let q = url.parse(req.url, true);

        if (q.pathname.startsWith('/api')) {
            let action = q.pathname.substring(5);
            if (!actions[action]) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('no such action');
                return;
            }
            actions[action](req, res, q);
        } else {
            let filePath = path.join(__dirname, 'public', q.pathname === '/' ? 'index.html' : q.pathname);
            let extname = String(path.extname(filePath)).toLowerCase();
            let contentType = 'text/html';
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.wav': 'audio/wav',
                '.mp3': 'audio/mpeg',
            };

            contentType = mimeTypes[extname] || 'application/octet-stream';

            fs.readFile(filePath, (error, content) => {
                if(error){
                    res.writeHead(404);
                    res.end();
                    return;
                }
                res.writeHead(200, {'Content-type': mimeTypes[extname]});
                res.end(content);
            });
        }
    }).listen(8080);
    console.log('Server running at http://localhost:8080/');
}

const actions = {
    highscores: async (req, res, q) => {
        if (req.method === 'GET') {
            try {
                const page = parseInt(q.query.page) || 1;
                const skip = (page - 1) * ITEMS_PER_PAGE;
                
                const highScores = await HighScore.find()
                    .sort({ score: -1 })
                    .skip(skip)
                    .limit(ITEMS_PER_PAGE);
                
                const totalScores = await HighScore.countDocuments();
                const totalPages = Math.ceil(totalScores / ITEMS_PER_PAGE);

                console.log('Sending high scores:', { highScores, currentPage: page, totalPages });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ highScores, currentPage: page, totalPages }));
            } catch (err) {
                console.error('Server error:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const { name, score } = JSON.parse(body);
                    
                    let existingPlayer = await HighScore.findOne({ name });
                    
                    if (existingPlayer) {
                        if (score > existingPlayer.score) {
                            existingPlayer.score = score;
                            await existingPlayer.save();
                        }
                    } else {
                        existingPlayer = new HighScore({ name, score });
                        await existingPlayer.save();
                    }
                    
                    const highScores = await HighScore.find().sort({ score: -1 }).limit(5);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ highScores, updatedScore: existingPlayer }));
                } catch (err) {
                    console.error('Error processing high score:', err);
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Bad request');
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
        }
    }
};

startServer(actions);

exports.startServer = startServer;