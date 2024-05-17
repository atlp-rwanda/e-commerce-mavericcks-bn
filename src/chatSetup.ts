import { Socket, Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { decodedToken } from './helpers/token.generator';
import logger from './logs/config';
import Chat from './database/models/chat';
import { getUserNames } from './helpers/defaultRoleGenerator';

interface CustomSocket extends Socket {
  userId?: string;
}
export const findId = (socket: CustomSocket) => {
  try {
    const { token } = socket.handshake.auth;
    const decoded = decodedToken(token);
    const id = typeof decoded === 'string' ? decoded : decoded ? decoded.id : null;
    if (typeof id === 'string') {
      socket.emit('sendUserId', id);
      socket.userId = id;
      return id;
    } else {
      throw new Error('Token is not a string');
    }
  } catch (error) {
    logger.error('Error find Id', error);
  }
};

interface Message {
  socketId: string;
  content: string;
  msgData: string;
}
/**
 *  This function manages the process of receiving a message from the browser,
 * storing it in the database,
 * and then sending a response back to the user interface.
 */
const sentMessage = async (socket: CustomSocket, data: Message, io: Server) => {
  const senderId = socket.userId;
  if (senderId) {
    try {
      const { content, socketId } = data;
      const { firstName } = await getUserNames(socket.userId as string);

      const chat = await Chat.create({ senderId, socketId, content });

      io.emit('returnMessage', {
        senderId: chat.dataValues.senderId,
        socketId: chat.dataValues.socketId,
        content: chat.dataValues.content,
        senderName: firstName,
        readStatus: chat.dataValues.readStatus,
        date: chat.dataValues.updatedAt,
      });
    } catch (error) {
      logger.error('Error saving a message chat to database: ', error);
    }
  }
};
const handleTyping = async (socket: CustomSocket, isTyping: string) => {
  socket.broadcast.emit('typing', isTyping);
};

const disconnected = () => {
  logger.info('User disconnected...');
};

export const socketSetUp = (server: HttpServer) => {
  const io = new Server(server);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  io.use(async (socket: CustomSocket, next) => {
    const id = findId(socket);
    socket.userId = id;
    next();
  });

  io.on('connection', async (socket: CustomSocket) => {
    io.emit('welcome', await getUserNames(socket.userId as string));
    socket.on('sentMessage', data => sentMessage(socket, data, io));
    socket.on('typing', isTyping => handleTyping(socket, isTyping));
    socket.on('disconnect', disconnected);
  });
};
