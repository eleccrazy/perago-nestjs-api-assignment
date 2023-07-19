import { Module } from '@nestjs/common';
import { PositionsController } from './controllers/positions.controller';
import { PositionsEntity } from 'src/entities/positions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllPositionsHandler } from './queries/handlers/get-all-positions-handler';
import { createPositionHandler } from './commands/handlers/create-positions-handler';
import { GetSinglePositionHandler } from './queries/handlers/get-single-position.handler';
import { DeletePositionsHandler } from './commands/handlers/delete-positions.handler';
import { UpdatePositonsHandler } from './commands/handlers/update-positions.handler';
import { GetPositionsTreeHandler } from './queries/handlers/get-positions-tree.handler';
import { GetChildrenPositionsHandler } from './queries/handlers/get-children-positions.handler';

@Module({
  imports: [TypeOrmModule.forFeature([PositionsEntity]), CqrsModule],
  providers: [
    GetAllPositionsHandler,
    GetSinglePositionHandler,
    GetPositionsTreeHandler,
    GetChildrenPositionsHandler,
    createPositionHandler,
    DeletePositionsHandler,
    UpdatePositonsHandler,
  ],
  controllers: [PositionsController],
})
export class PositionsModule {}
