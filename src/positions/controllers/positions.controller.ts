import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { CreatePositionDto, UpdatePositionDto } from '../dtos/positions.dtos';
import { GetAllPositionsQuery } from '../queries/get-all-positions.query';
import { GetSinglePositionQuery } from '../queries/get-single-position.query';
import { GetPositionsTreeQuery } from '../queries/get-positions-tree.query';
import { GetChildrenPositionsQuery } from '../queries/get-children-positions.query';
import { CreatePositionsCommand } from '../commands/create-positions.command';
import { DeletePositionsCommand } from '../commands/delete-positions.command';
import { UpdatePositionsCommand } from '../commands/update-positions.command';

import { validateIdParam } from '../../common/pipes/validations.pipe';

@ApiTags('positions')
@Controller('positions')
export class PositionsController {
  constructor(private queryBus: QueryBus, private commandBus: CommandBus) {}

  // Handle request for creating a new position
  @ApiOperation({
    summary:
      'Create a new position. parentId is not required if the position is the first or the root position in the database, otherwise it is required. Returns the newely created position Id',
  })
  @Post()
  @HttpCode(201)
  @UsePipes(ValidationPipe)
  async createPosition(@Body() createPostionDto: CreatePositionDto) {
    const [name, description, parentId] = [
      createPostionDto.name,
      createPostionDto.description,
      createPostionDto.parentId,
    ];
    const command = new CreatePositionsCommand(name, description, parentId);
    return await this.commandBus.execute(command);
  }

  // Handle request for retrieving all positions
  @ApiOperation({
    summary:
      'Get all positions. Returns an array of all registered position Returns an array of all registered positions',
  })
  @Get()
  @HttpCode(200)
  async getAllPositions() {
    return await this.queryBus.execute(new GetAllPositionsQuery());
  }

  // Handle request for retrieving the entire tree structure of the position.
  @ApiOperation({
    summary:
      'Get the positions in a tree like structure. This response shows parent child relationships of all positions.',
  })
  @Get('tree')
  @HttpCode(200)
  async getPositionsTree() {
    return await this.queryBus.execute(new GetPositionsTreeQuery());
  }

  // Handle request for retrieving a single position (Position detail)
  @ApiOperation({ summary: 'Get a single position detail based on its id.' })
  @Get(':id')
  @HttpCode(200)
  async getPosition(
    @Param('id', validateIdParam)
    id: string,
  ) {
    return await this.queryBus.execute(new GetSinglePositionQuery(id));
  }

  // Handle request for updating a position
  @ApiOperation({
    summary:
      'Update a single position based on its id. You can update name, description, and parentId of a position. Returns the updated position id.',
  })
  @Patch(':id')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  async updatePosition(
    @Param('id', validateIdParam) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    const [name, description, parentId] = [
      updatePositionDto.name,
      updatePositionDto.description,
      updatePositionDto.parentId,
    ];
    const command = new UpdatePositionsCommand(id, name, description, parentId);
    return this.commandBus.execute(command);
  }

  // Handle request for deleting an exsisting position
  @ApiOperation({
    summary:
      'Delete a single position based on its id. Returns a success message if the position is deleted successfully.',
  })
  @Delete(':id')
  @HttpCode(200)
  async deletePosition(@Param('id', validateIdParam) id: string) {
    return await this.commandBus.execute(new DeletePositionsCommand(id));
  }

  // Handle request for retrieving all childrens of an exisisting position
  @ApiOperation({
    summary:
      'Get all childrens of a specific position. Returns an array of child positions of a specific position.',
  })
  @Get(':id/childrens')
  @HttpCode(200)
  async getChildrensOfPositon(@Param('id') id: string) {
    return await this.queryBus.execute(new GetChildrenPositionsQuery(id));
  }
}
