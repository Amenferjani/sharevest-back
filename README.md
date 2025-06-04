<!-- @format -->

# ShareVest Holdings Platform - Microservices Backend

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Microservices](https://img.shields.io/badge/Microservices-Architecture-blue)](https://microservices.io/)

A unified investment platform providing asset management, crowdfunding, risk analysis, and premium investment opportunities through a microservices architecture.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)

## 🌟 Features

**Core Functionality:**

- Multi-tier subscription plans (Free, Silver, Gold, Platinum)
- Unified dashboard for portfolio tracking
- Real-time market data integration
- Crowdfunding campaign management
- Risk assessment and simulation tools
- JWT-based authentication & authorization
- Payment gateway integration (Stripe/PayPal)

**Subsidiary Modules:**

1. AssetVest - Portfolio management & AI-driven allocation
2. QuantumVest - High-end investment opportunities
3. PartVest - Crowdfunding marketplace
4. RiskVest - Risk analysis tools
5. HedgeVest - Hedge fund management
6. PrivateVest - Private equity deals
7. RelVest - Investor relations

## 🏗 Architecture

```bash
├── api-gateway            # Entry point for all requests
├── user-service           # Auth & user management
├── portfolio-service      # Asset tracking & analysis
├── part-vest-service   # Campaign management
├── risk-vest-service           # Risk assessment
├── payment-service        # Subscription & transactions
├── hedge-vest-service      # Hedge fund operations
├── private-vest-service # PE deals management
└── rel-vest-service     # Shareholder communication
```

## 🛠 Tech Stack

**Core Technologies:**

- **Framework**: NestJS 11+
- **API Gateway**: NestJS Microservices 
- **Database**:
  - PostgreSQL (Relational data)
  - MongoDB (Unstructured data)
- **Containerization**: Docker + K8s
- **CI/CD**: GitHub Actions
- **Cloud**: AWS ECS/EKS

**Key Libraries:**

- TypeORM/Mongoose for database interactions
- Passport.js for authentication
- Swagger for API documentation
- Jest for testing
- WebSockets for real-time updates

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14
- MongoDB 6

### Installation

1. Clone repository:

```bash
git clone https://github.com/hfidhi/share-vest.git
cd share-vest
```

2. Install dependencies:

```bash
npm run install:all
```

<!--
3. Configure environment variables:
```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/sharevest
JWT_SECRET=your_jwt_secret
STRIPE_API_KEY=your_stripe_key
ALPHA_VANTAGE_API_KEY=your_market_data_key
``` -->

4. Start services in development:

```bash
npm run start:dev:all
```

## 📚 API Documentation

Access Swagger UI for API exploration:

```bash
http://localhost:3000/api-docs
```

Generate OpenAPI spec:

```bash
npm run build:swagger
```

<!--
**Kubernetes Deployment:**
```bash
kubectl apply -f k8s/
```

**CI/CD Pipeline:**
- Automated testing on PR merge
- Docker image build on main branch
- Blue/Green deployment to AWS ECS

## 🧪 Testing
Run test suites:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Load testing
npm run test:load
``` -->
<!-- 
## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request -->
<!-- 
## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> **Note**: For detailed subsidiary-specific documentation, refer to our [Developer Playbook](docs/DEVELOPER_GUIDE.md) and [API Reference](docs/API_REFERENCE.md). -->
