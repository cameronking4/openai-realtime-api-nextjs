.PHONY: dev prod stop restart delete logs logs-backend logs-backend-tail monit status install build help

# Development
dev:
	npm run pm2:delete || true
	node start-pm2.js

# Production
prod:
	npm run pm2:delete || true
	NODE_ENV=production node start-pm2.js

# Stop all processes
stop:
	npm run pm2:stop

# Restart all processes
restart:
	npm run pm2:restart

# Delete all processes
delete:
	npm run pm2:delete

# View all logs
logs:
	npm run pm2:logs

# View backend logs
logs-backend:
	npm run pm2:logs-backend

# View backend logs with tail
logs-backend-tail:
	node logs-backend.js

# Monitor processes
monit:
	npm run pm2:monit

# Check status
status:
	npm run pm2:status

# Install dependencies
install:
	npm install --legacy-peer-deps

# Build for production
build:
	npm run build

# Help
help:
	@echo "Available commands:"
	@echo "  make dev                - Start development server with PM2"
	@echo "  make prod               - Start production server with PM2"
	@echo "  make stop               - Stop all PM2 processes"
	@echo "  make restart            - Restart all PM2 processes"
	@echo "  make delete             - Delete all PM2 processes"
	@echo "  make logs               - View all PM2 logs"
	@echo "  make logs-backend       - View backend logs"
	@echo "  make logs-backend-tail  - View backend logs with tail"
	@echo "  make monit              - Monitor PM2 processes"
	@echo "  make status             - Check PM2 status"
	@echo "  make install            - Install dependencies"
	@echo "  make build              - Build for production" 