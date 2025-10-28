# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build

# ✅ Add this line (important for when volume overwrites /app)
ENV PATH=/app/node_modules/.bin:$PATH

# Expose port
EXPOSE 3001

# Run Next.js app
CMD ["npm", "run", "start", "--", "-p", "3001"]
