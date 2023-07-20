# # perago-nestjs-api

## Description

A simple CRUD API for organization position structure. This API is built for managing organization position structure with different level of positions/roles hierarchy. At the top of the hierarchy there is root position e.g. CEO, and every position below a given hierarchy will answer/report to the position above it except the root position. The API is built with NestJS framework, PostgreSQL, and TypeOrm with the CQRS pattern.

## Installation

##### 1. Clone this repository

```bash
$ git clone https://github.com/eleccrazy/perago-nestjs-api-assignment.git
```

##### 2. Install the dependencies

```bash
$ npm install
```

##### 3. Create a docker container for the database and start it. If you want to run the database on your local machine, make sure to change the environment variables in the `.env` file.

```bash
$ docker compose up -d
```

## Running the app

```bash
# development
$ npm run start # or yarn start

# watch mode
$ npm run start:dev # or yarn start:dev

# production mode
$ npm run build   # or yarn build
$ npm run start:prod # or yarn start:prod
```

## Test

```bash
# unit tests
$ npm run test # or yarn test
```

## Accessing the API

#### 1. The API is deployed as a container on a VPS and can be accessed via the following URL:

[https://perago.gizachew-bayness.tech/api](https://perago.gizachew-bayness.tech/api)

#### 1. The API can also be accessed locally via the following URL:

```
http://localhost:3000/api
```

## Deploying the API (Infrastructure setup)

- Server: Ubuntu 20.04
- Database: PostgreSQL
- Containerization: Docker
- Container Orchestration: Docker Compose
- Reverse Proxy: Nginx
- Encryption: Let's Encrypt

## API Documentation

#### The swagger documentation for the API can be accessed via the following URL:

[https://perago.gizachew-bayness.tech/api/docs](https://perago.gizachew-bayness.tech/api/docs)

#### The swagger documentation for the API can also be accessed locally via the following URL:

```
http://localhost:3000/api/docs
```

#### Implemented Status Codes

- `200 - OK (GET), (PATCH), (DELETE) => Incase of successful request`
- `201 - Created (POST) => Incase of successful creation of a new position`
- `400 - Bad Request (POST), Bad Request (PATCH) => Incase of invalid request body`
- `404 - Not Found (GET), (PATCH), (DELETE) => Incase of invalid id`
- `500 - Internal Server Error (GET), (POST), (PATCH), (DELETE) => Incase of any unhandled error`

#### Rules for creating a new position /api/positions

- The `name` field is required and must be a string
- The `description` field is required and must be a string
- The `name` field must be unique, i.e, no two positions can have the same name
- The `name` field must be atleast 2 characters long
- The `description` field must be atleast 6 characters long
- The `parentId` field is required and must be a valid position id (uuid)
- The `parentId` is not required if the position is the root position (i.e, the first position to be created)
- If you set the `parentId` field while creating the first position, you will get a bad request error telling you that the `Parent Position Not Found`, which is logical because there is no position in the database yet.

#### Rules for updating a position /api/positions/:id

- The `id` parameter is required and must be a valid position id (uuid)
- The `name`, `description`, and `parentId` can be updated, and they must follow the same rules as creating a new position
- The `name` field must be unique, i.e, no two positions can have the same name
- While upating the `parentId`, the new `parentId` must not be the same as the `id` of the position being updated. The position cannot be its own parent.
- While upating the `parentId`, the new `parentId` must not be the same as the `id` of any of its child positions and their descendants. If the descendant of the position being updated is the new `parentId`, the tree structure will be broken, and the hierarchy may become circular.

#### Rules for deleting a position /api/positions/:id

- The `id` parameter is required and must be a valid position id (uuid)
- A position can only be deleted if it has no child positions

#### Rules for getting a position /api/positions/:id

- The `id` parameter is required and must be a valid position id (uuid)
- The response will not include its child positions

#### Rules for getting childrens of a position /api/positions/:id/childrens

- The `id` parameter is required and must be a valid position id (uuid)
- The response will include all of its child positions

#### Rules for getting all positions /api/positions

- No rules just make a GET request to the endpoint
- The response will include all positions in the database

#### Rules for getting the tree structure of all positions /api/positions/tree

- No rules just make a GET request to the endpoint
- The response will include all positions in the database in a tree structure

## Example Request to get the tree structure of all positions

### Request

```bash
curl --location --request GET 'https://perago.gizachew-bayness.tech/api/positions/tree'
```

### Sample Response

```
{
  "id": "d66034d5-b408-43ab-a4ce-cd26f196e455",
  "name": "CEO",
  "description": "Chief Executive Officer",
  "createdAt": "2023-07-20T08:22:05.773Z",
  "children": [
    {
      "id": "f86e14bc-7d76-40b0-af35-13e85459b506",
      "name": "CTO",
      "description": "Chief Technological Officer",
      "createdAt": "2023-07-20T12:02:14.727Z",
      "children": [
        {
          "id": "9b1b8af0-bffe-4d83-a4d7-f8c011c1add5",
          "name": "Project Manager",
          "description": "Project Manager",
          "createdAt": "2023-07-20T12:05:42.550Z",
          "children": [
            {
              "id": "027fd88c-4f87-4db4-a9aa-d6daca301316",
              "name": "Product Owner",
              "description": "Product Owner",
              "createdAt": "2023-07-20T12:06:19.312Z",
              "children": [
                {
                  "id": "e8804965-3ed0-4e9d-8d81-47a31529fc03",
                  "name": "Tech Lead",
                  "description": "Tech Lead",
                  "createdAt": "2023-07-20T12:06:51.554Z",
                  "children": [
                    {
                      "id": "2dadb38f-3790-4c3b-a026-9e13f555886a",
                      "name": "Backend Developer",
                      "description": "Backend Software Engineer",
                      "createdAt": "2023-07-20T12:10:24.197Z",
                      "children": []
                    },
                    {
                      "id": "7953b4b2-aaf7-4858-b0e4-a365789806cb",
                      "name": "Frontend Developer",
                      "description": "Frontend Software Engineer",
                      "createdAt": "2023-07-20T12:10:10.860Z",
                      "children": []
                    },
                    {
                      "id": "3ad43a9e-703f-4f57-94bf-de9e50937dfb",
                      "name": "DevOps Engineer",
                      "description": "DevOps Engineer",
                      "createdAt": "2023-07-20T12:10:47.624Z",
                      "children": []
                    }
                  ]
                },
                {
                  "id": "1868ee9b-96cb-4b34-8cd1-dfe0c0f83c1f",
                  "name": "QA Engineer",
                  "description": "QA Engineer",
                  "createdAt": "2023-07-20T12:07:15.322Z",
                  "children": []
                },
                {
                  "id": "eb15de18-ebe8-4428-9ff2-e57e95fc4c22",
                  "name": "Scrum Master",
                  "description": "Scrum Master",
                  "createdAt": "2023-07-20T12:07:31.810Z",
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "cf6e1494-842b-472e-be33-0cd828f01b9c",
      "name": "CFO",
      "description": "Chief Financial Officer",
      "createdAt": "2023-07-20T12:03:31.221Z",
      "children": [
        {
          "id": "27ad6147-5a64-497d-a56a-c6cc6fa275a7",
          "name": "Chef Accountant",
          "description": "Chef Accountant",
          "createdAt": "2023-07-20T12:15:59.038Z",
          "children": [
            {
              "id": "25591af8-db52-4a31-90f8-771cc0cae654",
              "name": "Financial Analyst",
              "description": "Financial Analyst under Chief Accountant",
              "createdAt": "2023-07-20T12:21:18.432Z",
              "children": []
            },
            {
              "id": "a1e9ab76-7b7e-4b91-83af-375e7a1d6962",
              "name": "Account and Payable",
              "description": "Account and Payable under Chief Accountant",
              "createdAt": "2023-07-20T12:21:48.662Z",
              "children": []
            }
          ]
        },
        {
          "id": "871abc05-8aff-48cc-ad9e-2b635b9e774a",
          "name": "Internal Audit",
          "description": "Internal Audit",
          "createdAt": "2023-07-20T12:17:13.097Z",
          "children": []
        }
      ]
    },
    {
      "id": "04ff93c9-6acc-401b-87c3-ec9dfcc8ce57",
      "name": "COO",
      "description": "Chief Operations Officer",
      "createdAt": "2023-07-20T12:04:07.845Z",
      "children": [
        {
          "id": "e4a507d7-e2b9-41ce-b15b-b53670dbe27b",
          "name": "Operation Manager",
          "description": "Operation Manager under COO",
          "createdAt": "2023-07-20T12:24:42.197Z",
          "children": []
        },
        {
          "id": "b4ec8d15-86fe-40c4-a10f-0bd7e235c69d",
          "name": "Product Manager",
          "description": "Product Manager under COO",
          "createdAt": "2023-07-20T12:24:23.457Z",
          "children": []
        },
        {
          "id": "2c3d3a48-d5ce-48ac-8ed4-2e8305ed1c0c",
          "name": "Customer Relation",
          "description": "Customer Relation under COO",
          "createdAt": "2023-07-20T12:25:05.578Z",
          "children": []
        }
      ]
    },
    {
      "id": "51213592-7521-476a-a792-45496f7e2bb9",
      "name": "HR",
      "description": "Hiring Manager",
      "createdAt": "2023-07-20T12:04:39.753Z",
      "children": []
    }
  ]
}
```
