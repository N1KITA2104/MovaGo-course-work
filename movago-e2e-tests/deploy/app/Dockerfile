FROM node:18

# Install Angular CLI and concurrently globally
RUN npm install -g concurrently

# Set working directory
WORKDIR /app
COPY . .

# Install backend dependencies
WORKDIR /app/movago-be
RUN npm install
RUN npm run build

# Install frontend dependencies
WORKDIR /app/movago-fe
RUN npm install -g @angular/cli && npm install
RUN npm run build --prefix /app/movago-fe

# Back to root
WORKDIR /app

# Expose both frontend (4200) and backend (3000)
EXPOSE 4200
EXPOSE 3000

# Start backend and frontend in parallel
CMD concurrently \
  "cd /app/movago-be && npm start" \
  "cd /app/movago-fe && ng serve --host 0.0.0.0 --port 4200 --disable-host-check"