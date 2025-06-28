# TO BE RUN FROM DOCKER COMPOSE. DO NOT RUN MANUALLY AS CONTEXT IS NOT SET CORRECTLY

##################### BUILD #####################

FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY src/backend/package.json .
COPY yarn.lock .
RUN yarn install

# Copy the application code and tsconfig
COPY src/backend/src ./src
COPY src/backend/tsconfig.json .

# Build the application
RUN yarn build

##################### PROD #####################

FROM node:20-alpine AS prod

# Install curl for health checks
RUN apk add --no-cache curl

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY src/backend/package.json .
COPY yarn.lock .
RUN yarn install --production

# Copy the built Express app
COPY --from=build /app/dist dist

# Set environment variables
ENV NODE_ENV=production

# Expose the API port
EXPOSE ${PORT}

# Run the Express application
CMD ["yarn", "preview"]
