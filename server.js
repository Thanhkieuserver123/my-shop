const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Mảng lưu toàn bộ lịch sử đơn hàng
let orderHistory = [];

io.on('connection', (socket) => {
    console.log('Có thiết bị vừa kết nối:', socket.id);

    // Gửi toàn bộ danh sách đơn hàng hiện có cho màn hình quản lý vừa vào
    socket.emit('cap-nhat-lich-su', orderHistory);

    // Nhận đơn hàng mới từ khách
    socket.on('gui-don-hang', (data) => {
        // Gắn thêm trạng thái 'dang-cho' cho đơn mới
        const newOrder = { ...data, status: 'dang-cho' };
        orderHistory.unshift(newOrder); // Đưa lên đầu danh sách
        
        // Phát thông báo đơn mới đến tất cả màn hình quản lý
        io.emit('cap-nhat-lich-su', orderHistory);
    });

    // Chuyển trạng thái đơn hàng thành 'hoan-thanh' khi bấm hoàn thành
    socket.on('hoan-thanh-don', (id) => {
        let order = orderHistory.find(o => o.id == id);
        if (order) {
            order.status = 'hoan-thanh';
            io.emit('cap-nhat-lich-su', orderHistory);
        }
    });

    // Xóa toàn bộ lịch sử đơn hàng
    socket.on('xoa-tat-ca-lich-su', () => {
        orderHistory = [];
        io.emit('cap-nhat-lich-su', orderHistory);
    });

    socket.on('disconnect', () => {
        console.log('Thiết bị ngắt kết nối:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});