https://blog.logrocket.com/express-typescript-node/

Creating a server with TypeScript using Node.js and Express is a good alternative to using JavaScript because it makes it easier to manage complex applications. It also helps when you need to collaborate with a distributed team of developers.

set up Node.js with TypeScript and Express
TypeScript offers benefits like:

Improved code strength and clarity when static typing
Enhanced collaboration and project scalability
Advanced tooling
IDE support
Broad compatibility
All of these benefits make TypeScript a great choice for a smoother development experience, especially in evolving projects.

In this article, we’ll explore a beginner-friendly way to configure TypeScript in an Express app, and gain an understanding of the fundamental constraints that accompany it. To follow along, you should have:

Node.js ≥ v18.x installed in your local development environment
Access to a package manager like npm, pnpm, or Yarn
Basic familiarity with Node.js and Express
Check out the GitHub repository for the source code; the main branch has the TypeScript project, and the JavaScript branch has the JavaScript version.

Editor’s note: This article was updated by Muhammed Ali in March 2025 to expand coverage of linting with ESLint + Prettier, add information on watchers (e.g., tsc –watch, nodemon), and provide deeper sample code, including demonstrating a small CRUD API.

What is Express TypeScript?
“Express TypeScript” refers to using the Express framework within a TypeScript project. It involves writing your Express server code in TypeScript, leveraging type definitions (often provided via @types/express) to enable type checking, auto-completion, and better documentation. Essentially, it’s about combining Express’s flexibility with TypeScript’s safety and developer tooling benefits.

Is TypeScript good with Express?
TypeScript is a great companion for Express because it provides static typing, which can catch potential bugs during development. With TypeScript, you can define interfaces for requests, responses, and even middleware, making your Express code more predictable and maintainable. This leads to improved developer productivity and more robust applications.

Creating a minimal server with Express
This article provides a comprehensive guide on setting up a Node.js and Express project with TypeScript, covering essential steps such as initializing the project, configuring TypeScript, structuring the project, and implementing typed environment variables.

It will also detail how to set up a basic CRUD API, including creating controllers, routes, and error handling middleware. Additionally, the guide includes instructions for linting with ESLint and Prettier, automating development with nodemon, and running the project in watch mode.

The goal is to demonstrate best practices for building a robust, type-safe Express application using TypeScript. Let’s get started:

1. Initialize the project
Start with the following:

mkdir ts-node-express && cd ts-node-express
npm init -y
Then install dependencies:

 npm install express dotenv npm install -D typescript ts-node @types/node @types/express nodemon eslint prettier
The DotEnv package is used to read environment variables from a .env file.

The -D, or --dev, flag directs the package manager to install these libraries as development dependencies.

ts-node — Enables running TypeScript files directly without pre-compiling to JavaScript
@types/node — Provides TypeScript type definitions for Node.js core modules
@types/express — Adds TypeScript type definitions for the Express framework
nodemon — Automatically restarts the server when file changes are detected during development
eslint — Lints the code to catch errors and enforce coding standards
prettier — Formats the code to ensure consistent style across the project
Installing these packages will add a new devDependencies object to the package.json file, featuring version details for each package, as shown below:

{
...
   "devDependencies": {
    "@types/express": "^5.0.1",
    "@types/node": "^22.13.11",
    "eslint": "^9.22.0",
    "nodemon": "^3.1.9",
    "prettier": "^3.5.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
}
2. Configure TypeScript
Every TypeScript project utilizes a configuration file to manage various project settings. The tsconfig.json file, which serves as the TypeScript configuration file, outlines these default options and offers the flexibility to modify or customize compiler settings to suit your needs.

The tsconfig.json file is usually placed at the project’s root. To generate this file, use the following tsc command, initiating the TypeScript compiler:

npx tsc --init
Once you execute this command, you’ll notice the tsconfig.json file is created at the root of your project directory. This file contains the default compiler options, as depicted in the image below:

{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
Develop this project structure:

ts-node-express/
├── src/
│   ├── config/
│   │   └── config.ts        // Load and type environment variables
│   ├── controllers/
│   │   └── itemController.ts  // CRUD logic for "items"
│   ├── middlewares/
│   │   └── errorHandler.ts    // Global typed error handling middleware
│   ├── models/
│   │   └── item.ts          // Define item type and in-memory storage
│   ├── routes/
│   │   └── itemRoutes.ts    // Express routes for items
│   ├── app.ts               // Express app configuration (middlewares, routes)
│   └── server.ts            // Start the server
├── .env                     // Environment variables
├── package.json             // Project scripts, dependencies, etc.
├── tsconfig.json            // TypeScript configuration
├── .eslintrc.js             // ESLint configuration
└── .prettierrc              // Prettier configuration
3. Environment configuration (typed environment variables)
File: src/config/config.ts:

import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
This file loads your environment variables from a .env file and provides type checking.

File: .env

PORT=3000
NODE_ENV=development
4. Model (in-memory data)
File: src/models/item.ts:

export interface Item {
  id: number;
  name: string;
}

export let items: Item[] = [];
We define a simple Item type and an in-memory array to store items.

5. Controller (CRUD logic)
File: src/controllers/itemController.ts:

import { Request, Response, NextFunction } from 'express';
import { items, Item } from '../models/item';

// Create an item
export const createItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const newItem: Item = { id: Date.now(), name };
    items.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// Read all items
export const getItems = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Read single item
export const getItemById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = items.find((i) => i.id === id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    items[itemIndex].name = name;
    res.json(items[itemIndex]);
  } catch (error) {
    next(error);
  }
};

// Delete an item
export const deleteItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    const deletedItem = items.splice(itemIndex, 1)[0];
    res.json(deletedItem);
  } catch (error) {
    next(error);
  }
};
Each controller function includes basic error handling using a try/catch block, passing errors to the Next middleware.

6. Routes
File: src/routes/itemRoutes.ts:

import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/itemController';

const router = Router();

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
This file defines the RESTful routes for your CRUD operations.


Over 200k developers use LogRocket to create better digital experiences
Learn more →
7. Global error handling middleware
File: src/middlewares/errorHandler.ts:

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};
This middleware catches errors thrown in your routes/controllers and sends a consistent, type-safe JSON error response.

8. App setup
File: src/app.ts:

import express from 'express';
import itemRoutes from './routes/itemRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
9 . Server entry point
File: src/server.ts:

import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
Linting and code formatting
ESLint and Prettier are essential tools for maintaining code quality and consistency in a TypeScript project. ESLint is a linter that analyzes code for potential errors, stylistic issues, and adherence to best practices, while Prettier is a code formatter that ensures a consistent code style across the entire codebase.

In the .eslintrc.js paste in the following code:

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es6: true,
  },
};
In .prettierrc put the following:

{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
Watchers and development scripts
In your package.json, add scripts for TypeScript compilation and automatic server restart. For example:

{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/server.ts",
    "lint": "eslint 'src/**/*.ts'"
  },
  ...
}
tsc --watch — For continuous compilation in development.
nodemon — To automatically restart your server when files change.
Start the server:

npm run dev
Your Express API is now running with TypeScript:express api running with typescript

Create an item to send a POST request with a JSON payload to the /api/items endpoint:

curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Sample Item"}'
Update an item:

curl -X PUT http://localhost:3000/api/items/1234567890 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item Name"}'
These commands assume your server is running on port 3000 and the routes are defined as described in the project setup. Adjust the item ID and JSON data as needed.

Setting up testing with Jest
Below is an article that explains how to set up testing with Jest in your TypeScript Node.js Express project. This guide builds on the CRUD API project structure we discussed earlier.

Testing is a significant part of the software development lifecycle. It helps ensure that your application behaves as expected and makes your code more maintainable. In this section, we’ll walk through setting up testing using Jest in a TypeScript-based Node.js Express project.

Why use Jest?
Jest is a popular testing framework maintained by Facebook. It offers several benefits:

Jest is known for its simple configuration and zero-config experience
It comes with built-in matchers and assertion libraries
Tests are run in parallel, making them fast
Installing Jest and ts-jest
First, you’ll need to install Jest along with the TypeScript preprocessor ts-jest and type definitions for Jest. Run the following command:

npm install --save-dev jest ts-jest @types/jest
This command adds Jest as a development dependency along with everything needed to run tests written in TypeScript.

Next, configure Jest for your project. Create a jest.config.js file in the root directory of your project:

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.(ts|js)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
This configuration tells Jest to:

Use ts-jest to process TypeScript files
Use a Node environment since our project runs on Node.js
Look for test files under a tests folder with names ending in .test.ts or .test.js
A common approach for organizing your test files is to create a separate folder for tests:

project/
├── src/
│   ├── controllers/
│   │   └── itemController.ts
│   ├── middlewares/
│   │   └── errorHandler.ts
│   └── ... 
├── tests/
│   └── itemController.test.ts
└── ...
This organization keeps your tests separate from your production code.


Writing your first test
Let’s create a simple test for our CRUD API. For demonstration purposes, we’ll write a test for the controller that fetches all items. Assume we have a basic controller function in src/controllers/itemController.ts that looks like this:

import { Request, Response, NextFunction } from 'express';
import { items } from '../models/item';

export const getItems = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(items);
  } catch (error) {
    next(error);
  }
};
Now, create a test file at tests/itemController.test.ts:

import { Request, Response } from 'express';
import { getItems } from '../src/controllers/itemController';
import { items } from '../src/models/item';

describe('Item Controller', () => {
  it('should return an empty array when no items exist', () => {
    // Create mock objects for Request, Response, and NextFunction
    const req = {} as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    // Ensure that our in-memory store is empty
    items.length = 0;

    // Execute our controller function
    getItems(req, res, jest.fn());

    // Expect that res.json was called with an empty array
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
In this test:

We create mock versions of the Express Request and Response objects
We set the in-memory items array to an empty state
We invoke the getItems controller and assert that it responds with an empty array
To run your tests easily, add a script to your package.json:

{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
Now, you can run npm test to execute your tests. The --watch flag is helpful during development as it reruns tests when files change.

For a smoother development experience, use Jest’s --watch mode or integrate it with your existing development watchers like nodemon to run tests automatically as you code.