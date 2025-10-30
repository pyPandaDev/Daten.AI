# 🤝 Contributing to Daten.AI

Thank you for your interest in contributing to Daten.AI! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 📜 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Focus on what is best for the community

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **Git** for version control
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/daten-ai.git
cd daten-ai
```

3. Add the original repository as an upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/daten-ai.git
```

## 💻 Development Setup

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example ../.env
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Edit the `.env` file and add your configuration:

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=50
EXECUTION_TIMEOUT_SECONDS=300
```

## 📁 Project Structure

```
daten-ai/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   └── utils/             # Utility functions
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Utility functions
│   └── package.json          # Node dependencies
│
├── docs/                      # Documentation
├── tests/                     # Test files
├── .env.example              # Environment template
└── README.md                 # Project documentation
```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

#### Frontend Testing
```bash
cd frontend
npm run test
npm run lint
```

#### Backend Testing
```bash
cd backend
pytest
```

#### Manual Testing
- Test with various file sizes and types
- Test error scenarios
- Test on different browsers
- Check mobile responsiveness

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add data export functionality

- Added CSV export option
- Added PDF export with formatting
- Updated UI to show export buttons
- Added tests for export functions"
```

#### Commit Message Format

Follow the conventional commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## 📏 Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints where possible
- Maximum line length: 120 characters
- Use meaningful variable names
- Document functions with docstrings

```python
async def process_data(
    file_id: str,
    options: Dict[str, Any]
) -> ProcessResult:
    """
    Process uploaded data file.
    
    Args:
        file_id: Unique identifier for the file
        options: Processing configuration options
        
    Returns:
        ProcessResult object containing processed data
        
    Raises:
        FileNotFoundError: If file doesn't exist
        ProcessingError: If processing fails
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

- Use TypeScript for type safety
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Use meaningful component and variable names

```typescript
interface DataCardProps {
  title: string;
  data: DataPoint[];
  onSelect?: (id: string) => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  data,
  onSelect
}) => {
  // Component implementation
  return (
    <div className="data-card">
      {/* JSX */}
    </div>
  );
};
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first design
- Maintain consistent spacing
- Use semantic HTML elements

## 🧪 Testing

### Writing Tests

#### Backend Tests
```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_file():
    """Test file upload endpoint"""
    response = client.post(
        "/api/upload",
        files={"file": ("test.csv", b"col1,col2\n1,2", "text/csv")}
    )
    assert response.status_code == 200
    assert "file_id" in response.json()
```

#### Frontend Tests
```typescript
// tests/DataCard.test.tsx
import { render, screen } from '@testing-library/react';
import { DataCard } from '../components/DataCard';

describe('DataCard', () => {
  it('renders title correctly', () => {
    render(<DataCard title="Test Title" data={[]} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Backend
cd backend
pytest --cov=app

# Frontend
cd frontend
npm run test:coverage
```

## 📤 Submitting Changes

### 1. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
- [ ] No new warnings
```

### 3. Code Review

- Respond to review feedback promptly
- Make requested changes
- Update your branch if needed:

```bash
git fetch upstream
git rebase upstream/main
git push origin feature/your-feature-name --force
```

## 🐛 Reporting Issues

### Before Creating an Issue

1. Check existing issues to avoid duplicates
2. Try to reproduce the issue
3. Collect relevant information

### Creating an Issue

Use the issue templates and provide:

- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details:
  - OS and version
  - Browser and version
  - Python version
  - Node.js version

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `performance`: Performance improvements
- `security`: Security issues

## 🏗️ Architecture Decisions

### State Management

We use Zustand for state management because:
- Simple and lightweight
- TypeScript support
- No boilerplate
- DevTools support

### API Communication

We use Axios with custom interceptors for:
- Request/response logging
- Error handling
- Retry logic
- Request cancellation

### Styling

We use Tailwind CSS for:
- Rapid development
- Consistent design
- Mobile-first approach
- Small bundle size

## 🚀 Performance Guidelines

### Frontend Performance

- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Optimize images (WebP format preferred)
- Minimize bundle size
- Use virtual scrolling for large lists

### Backend Performance

- Use async/await for I/O operations
- Implement caching where appropriate
- Optimize database queries
- Use connection pooling
- Implement rate limiting

## 🔐 Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/)

## 💬 Getting Help

- Join our Discord server: [Link]
- Check the documentation: [docs/](./docs)
- Ask questions in GitHub Discussions
- Contact maintainers: [Email]

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

Thank you for contributing to Daten.AI! 🎉
