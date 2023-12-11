import { Server } from 'socket.io';

class Chat {
  constructor(server) {
    this.server = server;
  }
  initSocketIo = () => {
    const chatServer = new Server(this.server, {
      cors: {
        origin: '*', // nhớ thêm cái cors này để tránh bị Exception nhé :D  ở đây mình làm nhanh nên cho phép tất cả các trang đều cors được.
      },
    });

    chatServer.on('connection', (socket) => {
      ///Handle khi có connect từ client tới
      console.log('New client connected' + socket.id);

      socket.on('sendDataClient', function (data) {
        // Handle khi có sự kiện tên là sendDataClient từ phía client
        chatServer.emit('sendDataServer', { data }); // phát sự kiện  có tên sendDataServer cùng với dữ liệu tin nhắn từ phía server
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected'); // Khi client disconnect thì log ra terminal.
      });

      socket.on('chat message', (msgPackage) => {
        const { id, msg } = msgPackage;
        chatServer.emit('chat message', { id: id, msg: msg });
      });
    });
  };
}

export default Chat;
