# Serverless Translator Service

Aplicación serverless de traducción de texto desplegada en AWS. Permite traducir texto entre idiomas usando AWS Translate, guarda el historial de traducciones en DynamoDB y expone una interfaz web estática.

---

## Arquitectura

```text
┌─────────────────────────────────────────────────────────────────┐
│                          Usuario                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              CloudFront + S3 (Frontend estático)                │
│                    Next.js / React                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ API calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               API Gateway (REST) — dominio custom               │
│                     POST /   │   GET /                          │
└──────────────┬──────────────┴──────────────┬────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────┐       ┌─────────────────────────┐
│   Lambda: handler    │       │ Lambda: getTranslations  │
│  (POST — traducir)   │       │  (GET — listar historial)│
└──────────┬───────────┘       └────────────┬────────────┘
           │                                │
           │  Lambda Layer: util-lambda-layer
           │  (Translate client, DynamoDB wrapper, excepciones)
           │                                │
           ▼                                ▼
┌─────────────────┐             ┌───────────────────────┐
│  AWS Translate  │             │  DynamoDB              │
│  (traducción)   │             │  tabla: translation    │
└─────────────────┘             └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Cognito UserPool  │  ACM (certificado SSL)  │  Route53 (DNS)   │
└─────────────────────────────────────────────────────────────────┘
```

### Servicios AWS utilizados

| Servicio | Rol |
| --- | --- |
| **API Gateway (REST)** | Expone `POST /` y `GET /` con dominio custom |
| **AWS Lambda** | Handlers para traducir texto y recuperar historial |
| **AWS Translate** | Motor de traducción entre idiomas |
| **DynamoDB** | Almacena el historial de traducciones |
| **Cognito** | UserPool para autenticación de usuarios |
| **S3** | Almacena el build estático del frontend |
| **CloudFront** | CDN y HTTPS para el frontend |
| **ACM** | Certificado SSL para dominio custom |
| **Route53** | DNS para dominio y subdominios |

---

## Estructura del monorepo

```text
serverless01/
├── apps/
│   └── frontend/                  # Aplicación Next.js (React)
├── infra/                         # Infraestructura AWS CDK (TypeScript)
│   └── src/
│       ├── stacks/
│       │   └── TranslatorServiceStack.ts
│       └── constructs/
│           ├── RestApiService.ts
│           ├── TranslationService.ts
│           ├── StaticWebsiteDeployment.ts
│           ├── UserAuthSupportService.ts
│           └── CertificateWrapper.ts
└── packages/
    ├── lambdas/
    │   └── translate/             # Lambda handlers (POST y GET)
    ├── lambda-layers/
    │   └── util-lambda-layer/     # Layer compartida (SDK clients, utilidades)
    └── share-types/               # Tipos TypeScript compartidos
```

---

## Requisitos previos

- Node.js 20+
- AWS CLI configurado
- AWS CDK instalado (`npm install -g aws-cdk`)
- Dominio registrado en Route53

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
DOMAIN=ejemplo.com
API_SUBDOMAIN=api
WEB_SUBDOMAIN=www
```

---

## Scripts

```bash
# Desarrollo local del frontend
npm run frontend:dev

# Build del frontend para producción
npm run frontend:build

# Compilar la Lambda Layer
npm run lambda-layer:build-util

# Desplegar toda la infraestructura en AWS
npm run cdk:deploy
```

## Flujo de despliegue

1. Compilar la Lambda Layer: `npm run lambda-layer:build-util`
2. Compilar el frontend: `npm run frontend:build`
3. Desplegar con CDK: `npm run cdk:deploy`
