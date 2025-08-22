# Bragger - Personal Achievement Tracking

A containerized web application for documenting, organizing, and showcasing professional accomplishments.

## Overview

Bragger is a personal "brag sheet" application that helps you track your professional achievements, organize them by categories, and generate professional reports for various purposes such as performance reviews, job applications, or portfolio presentations.

## Features

- **Achievement Management**: Create, edit, and organize your professional accomplishments
- **Rich Media Support**: Upload screenshots and images to document your work
- **Flexible Organization**: Categorize and tag achievements for easy filtering
- **Advanced Search**: Find specific achievements quickly with powerful search and filters
- **Professional Reports**: Export achievements as PDF or SVG documents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Docker Deployment**: Easy containerized deployment for any environment

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **PDF Generation**: Puppeteer
- **Image Processing**: Sharp

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/n7njo/bragger.git
cd bragger

# Start the application
docker-compose up --build

# Access the application
open http://localhost:3000
```

### Local Development
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Run tests
npm test
```

## Documentation

- [Requirements Document](./REQUIREMENTS.md) - Detailed feature specifications
- [Technology Stack](./TECH_STACK.md) - Architecture and implementation details
- [API Documentation](./docs/API.md) - Backend API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## Project Status

🚧 **In Development** - This project is currently being built. Check the [Issues](https://github.com/n7njo/bragger/issues) for current development progress.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

For questions or issues, please create an issue on the GitHub repository.