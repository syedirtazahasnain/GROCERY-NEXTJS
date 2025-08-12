# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build

# Expose the app on port 3001
EXPOSE 3001

# Run Next.js app on port 3001
CMD ["npm", "run", "start", "--", "-p", "3001"]