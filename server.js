const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cho phép server đọc tất cả file nằm chung thư mục gốc
app.use(express.static(__dirname));

let orderHistory = [];

io.on('connection', (socket) => {
    socket.emit('cap-nhat-lich-su', orderHistory);

    socket.on('gui-don-hang', (data) => {
        const newOrder = { ...data, status: 'dang-cho' };
        orderHistory.unshift(newOrder);
        io.emit('cap-nhat-lich-su', orderHistory);
    });

    socket.on('hoan-thanh-don', (id) => {
        let order = orderHistory.find(o => o.id == id);
        if (order) {
            order.status = 'hoan-thanh';
            io.emit('cap-nhat-lich-su', orderHistory);
        }
    });

    socket.on('xoa-tat-ca-lich-su', () => {
        orderHistory = [];
        io.emit('cap-nhat-lich-su', orderHistory);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
