import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from './positions.controller';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { CreatePositionDto, UpdatePositionDto } from '../dtos/positions.dtos';
import { GetAllPositionsQuery } from '../queries/get-all-positions.query';
import { GetSinglePositionQuery } from '../queries/get-single-position.query';
import { GetChildrenPositionsQuery } from '../queries/get-children-positions.query';
import { GetPositionsTreeQuery } from '../queries/get-positions-tree.query';
import { CreatePositionsCommand } from '../commands/create-positions.command';
import { UpdatePositionsCommand } from '../commands/update-positions.command';
import { DeletePositionsCommand } from '../commands/delete-positions.command';

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

  // Test suite for the createPosition method
  describe('createPosition', () => {
    // Test case to check if the createPosition method is defined
    it('should be defined', () => {
      expect(controller.createPosition).toBeDefined();
    });

    // Test case to check if the createPosition method is called
    it('should be called', async () => {
      const positionDto: CreatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const command = new CreatePositionsCommand(
        positionDto.name,
        positionDto.description,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(null);
      await controller.createPosition(positionDto);
      expect(commandBus.execute).toHaveBeenCalledWith(command);
    });

    // Test case to check if the createPosition method returns the created positionId
    it('should return the created positionId', async () => {
      const positionDto: CreatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const positionId = uuidv4();
      const command = new CreatePositionsCommand(
        positionDto.name,
        positionDto.description,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(positionId);
      const result = await controller.createPosition(positionDto);
      expect(result).toEqual(positionId);
    });

    // Test case to check if the createPosition method returns a BadRequestException if the position name is not provided
    it('should return a BadRequestException if the position name is not provided', async () => {
      const positionDto: CreatePositionDto = {
        name: '',
        description: 'Test Description',
      };
      const errorMessage = 'Position name is required!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(controller.createPosition(positionDto)).rejects.toThrowError(
        new BadRequestException(errorMessage),
      );
    });
    // Test case to check if the createPosition method returns a BadRequestException if the position description is not provided
    it('should return a BadRequestException if the position description is not provided', async () => {
      const positionDto: CreatePositionDto = {
        name: 'Test Position',
        description: '',
      };
      const errorMessage = 'Position description is required!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(controller.createPosition(positionDto)).rejects.toThrowError(
        new BadRequestException(errorMessage),
      );
    });
    // Test case to check if the createPosition method returns a BadRequestException if the position name is already taken
    it('should return a BadRequestException if the position name is already taken', async () => {
      const positionDto: CreatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const errorMessage = 'Position name already taken!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(controller.createPosition(positionDto)).rejects.toThrowError(
        new BadRequestException(errorMessage),
      );
    });
    // Test case to check if the createPosition method returns a BadRequestException if the length of the name is less than 2 characters
    it('should return a BadRequestException if the length of the name is less than 2 characters', async () => {
      const positionDto: CreatePositionDto = {
        name: 'T',
        description: 'Test Description',
      };
      const errorMessage = 'Position name must be at least 2 characters!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(controller.createPosition(positionDto)).rejects.toThrowError(
        new BadRequestException(errorMessage),
      );
    });
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
          createdAt: '2023-07-20T12:02:14.727Z',
        },
        {
          id: uuidv4(),
          name: 'Test Position 2',
          description: 'Test Description 2',
          createdAt: '2023-07-20T12:02:14.727Z',
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

  // Test suite for the getChildrenPositions method
  describe('getChildrenPositions', () => {
    // Test if the getChildrensOfPosition method is defined
    it('should be defined', () => {
      expect(controller.getChildrensOfPositon).toBeDefined();
    });

    // Test if the getChildrensOfPosition method is called
    it('should be called', async () => {
      const positionId = uuidv4();
      const query = new GetChildrenPositionsQuery(positionId);
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);
      await controller.getChildrensOfPositon(positionId);
      expect(queryBus.execute).toHaveBeenCalledWith(query);
    });
    // Test if the getChildrensOfPosition method returns the children positions of the specified position
    it('should return the children positions of the specified position', async () => {
      const positionId = uuidv4();
      const positions = [
        {
          id: uuidv4(),
          name: 'Test Position 1',
          description: 'Test Description 1',
          createdAt: '2023-07-20T12:02:14.727Z',
        },
        {
          id: uuidv4(),
          name: 'Test Position 2',
          description: 'Test Description 2',
          createdAt: '2023-07-20T12:02:14.727Z',
        },
      ];
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(positions);
      const result = await controller.getChildrensOfPositon(positionId);
      expect(result).toEqual(positions);
    });

    // Test if the getChildrensOfPosition method returns a NotFoundException if the position with the specified id does not exist
    it('should return a NotFoundException if the position with the specified id does not exist', async () => {
      const positionId = '123';
      const errorMessage = 'Position Not Found!';
      jest
        .spyOn(queryBus, 'execute')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));
      await expect(
        controller.getChildrensOfPositon(positionId),
      ).rejects.toThrowError(new NotFoundException(errorMessage));
    });

    // Test if the getChildrensOfPosition method returns an empty array if the position with the specified id does not have children positions
    it('should return an empty array if the position with the specified id does not have children positions', async () => {
      const positionId = uuidv4();
      const positions = [];
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(positions);
      const result = await controller.getChildrensOfPositon(positionId);
      expect(result).toEqual(positions);
    });
  });

  // Test suite for getPositionsTree method
  describe('getPositionsTree', () => {
    // Test if the getPositionsTree method is defined
    it('should be defined', () => {
      expect(controller.getPositionsTree).toBeDefined();
    });

    // Test if the getPositionsTree method is called
    it('should be called', async () => {
      const query = new GetPositionsTreeQuery();
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);
      await controller.getPositionsTree();
      expect(queryBus.execute).toHaveBeenCalledWith(query);
    });

    // Test if the getPositionsTree method returns the positions tree
    it('should return the positions tree', async () => {
      const positionsTree = {
        id: uuidv4(),
        name: 'Test Position 1',
        description: 'Test Description 1',
        createdAt: '2023-07-20T12:02:14.727Z',
        children: [
          {
            id: uuidv4(),
            name: 'Test Position 2',
            description: 'Test Description 2',
            createdAt: '2023-07-20T12:02:14.727Z',
            children: [
              {
                id: uuidv4(),
                name: 'Test Position 3',
                description: 'Test Description 3',
                createdAt: '2023-07-20T12:02:14.727Z',
                children: [],
              },
              {
                id: uuidv4(),
                name: 'Test Position 4',
                description: 'Test Description 4',
                createdAt: '2023-07-20T12:02:14.727Z',
                children: [
                  {
                    id: uuidv4(),
                    name: 'Test Position 5',
                    description: 'Test Description 5',
                    createdAt: '2023-07-20T12:02:14.727Z',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      };
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(positionsTree);
      const result = await controller.getPositionsTree();
      expect(result).toEqual(positionsTree);
    });
  });

  // Test suite for the updatePosition method
  describe('updatePosition', () => {
    // Test if the updatePosition method is defined
    it('should be defined', () => {
      expect(controller.updatePosition).toBeDefined();
    });
    // Test if the updatePosition method is called
    it('should be called', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const command = new UpdatePositionsCommand(
        positionId,
        positionDto.name,
        positionDto.description,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(null);
      await controller.updatePosition(positionId, positionDto);
      expect(commandBus.execute).toHaveBeenCalledWith(command);
    });
    // Test if the updatePosition method returns the updated position id
    it('should return the updated position id', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const command = new UpdatePositionsCommand(
        positionId,
        positionDto.name,
        positionDto.description,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(positionId);
      const result = await controller.updatePosition(positionId, positionDto);
      expect(result).toEqual(positionId);
    });
    // Test if the updatePosition method returns a NotFoundException if the position with the specified id does not exist
    it('should return a NotFoundException if the position with the specified id does not exist', async () => {
      const positionId = '123';
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const errorMessage = 'Position Not Found!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new NotFoundException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the length of the name is less than 2 characters
    it('should return a BadRequestException if the length of the name is less than 2 characters', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'T',
        description: 'Test Description',
      };
      const errorMessage = 'Position name must be at least 2 characters!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the position name is already taken
    it('should return a BadRequestException if the position name is already taken', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
      };
      const errorMessage = 'Position name already taken!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the parentId is the same as the positionId
    it('should return a BadRequestException if the parentId is the same as the positionId', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
        parentId: positionId,
      };
      const errorMessage = 'Position cannot be its own parent!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the parentId is not a valid position
    it('should return a BadRequestException if the parentId is not a valid position', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
        parentId: '123',
      };
      const errorMessage = 'Parent Position Not Found!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the parentId is a child of the position
    it('should return a BadRequestException if the parentId is a child of the position', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
        parentId: uuidv4(),
      };
      const errorMessage = 'Parent Position cannot be a child of the position!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
    // Test if the updatePosition method returns a BadRequestException if the parentId is a grandchild of the position
    it('should return a BadRequestException if the parentId is a grandchild of the position', async () => {
      const positionId = uuidv4();
      const positionDto: UpdatePositionDto = {
        name: 'Test Position',
        description: 'Test Description',
        parentId: uuidv4(),
      };
      const errorMessage =
        'Parent Position cannot be a grandchild of the position!';
      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValueOnce(new BadRequestException(errorMessage));
      await expect(
        controller.updatePosition(positionId, positionDto),
      ).rejects.toThrowError(new BadRequestException(errorMessage));
    });
  });

  // Test suite for the deletePosition method
  describe('deletePosition', () => {
    // Test if the deletePosition method is defined
  });
});
