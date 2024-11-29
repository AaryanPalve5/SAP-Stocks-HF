# Use a Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with the legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Command to start the development server
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
