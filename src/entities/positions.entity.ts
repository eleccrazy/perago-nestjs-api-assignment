import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('positions')
export class PositionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 1024 })
  name: string;

  @Column({ length: 4096 })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => PositionsEntity, (position) => position.children, {
    onDelete: 'RESTRICT', // Prevent the deletion of the parent if there are child positions in the tree.
    nullable: true,
  })
  parent: PositionsEntity;

  @OneToMany(() => PositionsEntity, (position) => position.parent)
  children: PositionsEntity[];
}
