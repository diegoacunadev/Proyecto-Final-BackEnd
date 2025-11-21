import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';

// Importar entidades User y Provider
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  // 🟣 GUARDAR MENSAJE
  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    const msg = this.messageRepo.create({
      ...data,
      delivered: false,
      read: false,
    });

    return await this.messageRepo.save(msg);
  }

  // 🟣 HISTORIAL COMPLETO ENTRE DOS USUARIOS
  // 🟣 HISTORIAL COMPLETO ENTRE DOS USUARIOS + INFO DEL PARTNER
  async getMessagesBetween(userA: string, userB: string) {
    // 1. Obtener mensajes
    const messages = await this.messageRepo.find({
      where: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
      order: { time: 'ASC' },
    });

    // 2. Identificar quién es el "otro"
    const otherId = userA === userB ? userA : userB;

    // 3. Buscar al partner en USERS
    let partner =
      (await this.userRepo.findOne({
        where: { id: otherId },
        select: {
          id: true,
          names: true,
          surnames: true,
          profilePicture: true,
        },
      })) ||
      // 4. Si no está, se busca en PROVIDERS
      (await this.providerRepo.findOne({
        where: { id: otherId },
        select: {
          id: true,
          names: true,
          surnames: true,
          profilePicture: true,
        },
      }));

    return {
      partner: partner || null,
      messages,
    };
  }

  // 🟣 LISTA DE CONVERSACIONES (INBOX)
  async getConversations(userId: string) {
    const messages = await this.messageRepo.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      order: { time: 'DESC' },
    });

    const conv: Record<string, any> = {};

    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conv[other]) {
        // Buscar primero en USERS
        let otherUser =
          (await this.userRepo.findOne({
            where: { id: other },
            select: {
              id: true,
              names: true,
              surnames: true,
              profilePicture: true,
            },
          })) ||
          // Si no existe, buscar en PROVIDERS
          (await this.providerRepo.findOne({
            where: { id: other },
            select: {
              id: true,
              names: true,
              surnames: true,
              profilePicture: true,
            },
          }));

        conv[other] = {
          userId: other,
          lastMessage: msg.content,
          time: msg.time,
          read: msg.read,
          user: otherUser || null, // ← Aquí llega el objeto con nombre + foto
        };
      }
    }

    return Object.values(conv);
  }

  // 🟩 ENTREGADO
  async markAsDelivered(messageId: string) {
    await this.messageRepo.update(messageId, { delivered: true });
  }

  // 🟩 LEÍDO UNO
  async markAsRead(messageId: string) {
    await this.messageRepo.update(messageId, { read: true, delivered: true });
  }

  // 🟩 LEER TODOS
  async markAllAsRead(senderId: string, receiverId: string) {
    await this.messageRepo.update(
      { senderId, receiverId, read: false },
      { read: true, delivered: true },
    );
  }

  async deleteConversation(userId: string, providerId: string) {
    await this.messageRepo.delete({
      senderId: userId,
      receiverId: providerId,
    });

    await this.messageRepo.delete({
      senderId: providerId,
      receiverId: userId,
    });

    return { success: true };
  }
}
