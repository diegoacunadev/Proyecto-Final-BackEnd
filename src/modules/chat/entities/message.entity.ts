import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'message' })
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ length: 500 })
  content: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  time: Date;

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: false })
  read: boolean;
}
