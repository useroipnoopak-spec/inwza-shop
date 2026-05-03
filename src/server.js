const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const config = require('./config/app');
const routes = require('./routes');
const productService = require('./services/productService');
const notificationService = require('./services/notificationService');
const store = require('./database/store');

store.read();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);
notificationService.bindSocket(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

io.on('connection', socket => {
  socket.on('join:user', userId => socket.join(`user:${userId}`));
});

setInterval(() => {
  const closed = productService.closeExpired();
  closed.forEach(p => io.emit('auction:closed', p));
}, 3000);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message || 'เกิดข้อผิดพลาด' });
});

server.listen(config.port, () => console.log(`${config.appName} running at http://localhost:${config.port}`));
