import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from './positions.controller';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { CreatePositionDto, UpdatePositionDto } from '../dtos/positions.dtos';
import { GetAllPositionsQuery } from '../queries/get-all-positions.query';
import { GetSinglePositionQuery } from '../queries/get-single-position.query';
import { GetChildrenPositionsQuery } from '../queries/get-children-positions.query';
import { CreatePositionsCommand } from '../commands/create-positions.command';
import { DeletePositionsCommand } from '../commands/delete-positions.command';
import { UpdatePositionsCommand } from '../commands/update-positions.command';

import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PositionsController', () => {
  let controller: PositionsController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [QueryBus, CommandBus],
    }).compile();

    controller = module.get<PositionsController>(PositionsController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the getAllPositions method
  describe('getAllPositions', () => {
    // Test case to check if the getAllPositions method is defined
    it('should be defined', () => {
      expect(controller.getAllPositions).toBeDefined();
    });
    // Test case to check if the getAllPositions method is called
    it('should be called', async () => {
      const query = new GetAllPositionsQuery();
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);
      await controller.getAllPositions();
      expect(queryBus.execute).toHaveBeenCalledWith(query);
    });
    // Test case to check if the getAllPositions method returns all positions
    it('should retrieve all positions', async () => {
      const query = new GetAllPositionsQuery();
      const positions = [
        {
          id: uuidv4(),
          name: 'Test Position 1',
          description: 'Test Description 1',
        },
        {
          id: uuidv4(),
          name: 'Test Position 2',
          description: 'Test Description 2',
        },
      ];
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(positions);
      const result = await controller.getAllPositions();
      expect(result).toEqual(positions);
    });
  });

  // Test suite for the getPosition method
  describe('getPosition', () => {
    // Test case to check if the getPosition method is defined
    it('getPosition should be defined', () => {
      expect(controller.getPosition).toBeDefined();
    });
    // Test case to check if the getPosition method is called
    it('getPosition should be called', async () => {
      const positionId = uuidv4();
      const query = new GetSinglePositionQuery(positionId);
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(null);
      await controller.getPosition(positionId);
      expect(queryBus.execute).toHaveBeenCalledWith(query);
    });
    // Test case to check if the getPosition method returns the position with the specified id
    it('should return the position with the specified id', async () => {
      const positionId = uuidv4();
      const position = {
        id: positionId,
        name: 'Test Position',
        description: 'Test Description',
      };
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(position);
      const result = await controller.getPosition(positionId);
      expect(result).toEqual(position);
    });
    // Test case to check if the getPosition method returns a NotFoundException if the position with the specified id does not exist
    it('should return a NotFoundException if the position with the specified id does not exist', async () => {
      const positionId = '123';
      const errorMessage = 'Position Not Found!';
      jest
        .spyOn(queryBus, 'execute')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));
      await expect(controller.getPosition(positionId)).rejects.toThrowError(
        new NotFoundException(errorMessage),
      );
    });
  });
});
