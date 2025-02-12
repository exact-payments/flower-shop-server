# Flower Shop Server (Backend)

## Overview

This repository contains the backend of our E-Commerce Reference Application, designed to support our partner customers in integrating their eCommerce systems with our hosted payment pages. The application is built using **TypeScript**, **NodeJS**, and **Express**.

This backend provides APIs for order processing, payment integration, and other core eCommerce functionalities. It works in conjunction with the frontend application, which is available in a separate repository.

## Prerequisites

Before setting up the project, ensure that you have the following installed on your machine:

### For macOS and Windows:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)
- [Git](https://git-scm.com/)
- TypeScript (installed via npm install, but can be installed globally with npm install -g typescript if needed)



## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/exact-payments/flower-shop-server.git
cd flower-shop-server
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project and configure the necessary environment variables. Check `.env.example` for reference.

#### Required Environment Variables
| Variable Name             | Description |
|---------------------------|-------------|
| `PAYMENT_API_BASE_URL`    | API server base URL with `/PyxisMasterApi` endpoint. |
| `PAYMENT_PAGE_URL`        | Payment page server base URL with `/WebPayPage` endpoint. |
| `PARTNER_ID`              | Partner identifier for integration. |
| `TERMINAL_ID`             | Terminal identifier for transactions. |
| `AUTH_CREDENTIAL_USER`    | Authentication username. |
| `AUTH_CREDENTIAL_PASSWORD`| Authentication password. |
| `PYXIS_ACCESS`            | API key for accessing Pyxis services. |
| `LEGACY_PAYMENT_PAGE`     | Boolean flag (`true` or `false`) to determine if the legacy payment page should be used. |

### 4. Run the Application
```sh
npm run dev
```
This will start the backend server, which will be accessible at `http://localhost:5000` (or the configured port).

## Frontend Application
This backend service supports a frontend eCommerce application. Make sure you also set up the frontend by following the instructions in its respective GitHub repository:

[Frontend Repository](hhttps://github.com/exact-payments/flower-shop.git)

## Additional Notes
- Ensure that your database and any required third-party services are running before starting the backend.
- If you encounter issues with dependencies, try deleting `node_modules` and `package-lock.json`, then reinstall:
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  ```
- Contributions and improvements are welcome! Open a pull request or issue if you find bugs or have feature requests.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

