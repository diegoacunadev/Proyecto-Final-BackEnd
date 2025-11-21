import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'https://serviyapp-frontend.vercel.app'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  // ----------------------------------------
  // 🟢 USUARIO CONECTADO
  // ----------------------------------------
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) return client.disconnect();

    client.join(userId);
    this.logger.log(`🟢 Usuario conectado: ${userId}`);

    // Avisar a todos
    // Notificar solo al usuario con el que tiene chat abierto
    client.rooms.forEach((room) => {
      if (room !== client.id) {
        this.server.to(room).emit('userOnline', { userId });
      }
    });
  }

  // ----------------------------------------
  // 🔴 USUARIO DESCONECTADO
  // ----------------------------------------
  handleDisconnect(client: Socket) {
    const rooms = Array.from(client.rooms);
    const userId = rooms[1]; // room 1 es el userId

    if (userId) {
      this.server.emit('userOffline', { userId });
    }

    this.logger.log(`🔴 Usuario desconectado: ${client.id}`);
  }

  // ----------------------------------------
  // 📜 OBTENER HISTORIAL
  // ----------------------------------------
  @SubscribeMessage('getHistory')
  async getHistory(
    @MessageBody() data: { userId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const history = await this.chatService.getMessagesBetween(
      data.userId,
      data.receiverId,
    );

    client.emit('messagesHistory', history);
  }

  // ----------------------------------------
  // ✉️ ENVIAR MENSAJE
  // ----------------------------------------
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      content: string;
    },
  ) {
    // Guardar mensaje
    const msg = await this.chatService.saveMessage(data);
    // 🟣 Notificación de mensaje nuevo
    this.server.to(data.receiverId).emit('messageNotification', {
      from: data.senderId,
      content: data.content,
      time: msg.time,
    });

    // Enviar al receptor
    this.server.to(data.receiverId).emit('receiveMessage', msg);

    // Enviar al remitente
    this.server.to(data.senderId).emit('receiveMessage', msg);

    // Marcar como entregado (al menos para el sender)
    this.server.to(data.senderId).emit('messageDelivered', {
      messageId: msg.id,
      delivered: true,
    });

    return msg;
  }

  // ----------------------------------------
  // 👁️ MARCAR MENSAJES COMO LEÍDOS
  // ----------------------------------------
  @SubscribeMessage('markAsRead')
  async markAsRead(
    @MessageBody() data: { userId: string; receiverId: string },
  ) {
    // userId lee los mensajes de receiverId
    await this.chatService.markAllAsRead(data.receiverId, data.userId);

    // avisar al remitente (receiver)
    this.server.to(data.receiverId).emit('allMessagesRead', {
      from: data.userId,
    });
  }

  // ----------------------------------------
  // ✏️ TYPING
  // ----------------------------------------
  @SubscribeMessage('typing')
  typing(@MessageBody() data: { from: string; to: string }) {
    this.server.to(data.to).emit('typing', { from: data.from });
  }

  @SubscribeMessage('stopTyping')
  stopTyping(@MessageBody() data: { from: string; to: string }) {
    this.server.to(data.to).emit('stopTyping', { from: data.from });
  }
}
