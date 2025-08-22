# Technology Stack and Architecture

## Technology Decisions

### Frontend
- **React 18** with TypeScript for type safety and modern development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling and responsive design
- **React Hook Form** for efficient form handling
- **React Query** for data fetching and caching
- **React Router** for client-side routing
- **Lucide React** for consistent iconography

### Backend
- **Node.js 18+** with Express.js framework
- **TypeScript** for full-stack type safety
- **Prisma** as ORM for database management
- **PostgreSQL** for reliable data persistence
- **Multer** for file upload handling
- **Sharp** for image processing and optimization
- **Puppeteer** for PDF generation
- **Express Rate Limit** for API protection

### Development Tools
- **ESLint + Prettier** for code quality and formatting
- **Jest + Testing Library** for unit and integration testing
- **Husky** for git hooks
- **Docker + Docker Compose** for containerization

### Database Schema
```sql
-- Users table (for future multi-user support)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  duration_hours INTEGER,
  category_id INTEGER REFERENCES categories(id),
  impact TEXT,
  skills_used TEXT[], -- Array of skills
  team_size INTEGER,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievement tags junction table
CREATE TABLE achievement_tags (
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (achievement_id, tag_id)
);

-- Images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Project Structure
```
bragger/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── forms/        # Form components
│   │   │   ├── layout/       # Layout components
│   │   │   └── achievements/ # Achievement-specific components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Achievements.tsx
│   │   │   ├── AddAchievement.tsx
│   │   │   └── Reports.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   └── app.ts
│   ├── uploads/              # File storage
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── scripts/
│   ├── setup.sh
│   └── deploy.sh
├── .env.example
├── .gitignore
├── README.md
├── REQUIREMENTS.md
└── docker-compose.yml
```

## API Endpoints Design

### Achievements
- `GET /api/achievements` - List achievements with filtering
- `GET /api/achievements/:id` - Get single achievement
- `POST /api/achievements` - Create new achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag

### Files
- `POST /api/achievements/:id/images` - Upload images
- `DELETE /api/images/:id` - Delete image
- `GET /api/images/:filename` - Serve image

### Reports
- `POST /api/reports/pdf` - Generate PDF report
- `POST /api/reports/svg` - Generate SVG report

## Development Workflow

### Setup
1. Clone repository
2. Run `docker-compose up --build` for full stack
3. Run database migrations
4. Seed with sample data

### Development
- Frontend: `npm run dev` (Vite dev server)
- Backend: `npm run dev` (nodemon with TypeScript)
- Database: PostgreSQL in Docker container

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

### Deployment
- Build: `docker-compose build`
- Deploy: `docker-compose up -d`