# Use the official Node.js 19 image as the base image
FROM node:19
# Set the working directory in the container to /app
WORKDIR /app
# Copy the package.json and package-lock.json files to the container
COPY package*.json ./
# Install the application dependencies, omit dev dependencies
RUN npm install --omit=dev
# Install the Nest CLI globally
RUN npm install -g @nestjs/cli
# Copy the rest of the application files to the container
COPY . .
# Build the application
RUN npm run build
# Use the official Node.js 19 image as the base image for the production container
FROM node:19
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=0 /app/dist ./dist
# Expose the container's port to the outside world
EXPOSE 3000
# Start the application
CMD ["npm", "run", "start:prod"]