# Unruggable Gateways Deployer

A simple web application for deploying Unruggable Gateways instances to Hetzner Cloud servers.

Uses pure Javascript, and no external dependencies. What you see is exactly what you get.

![Unruggable Gateways Deployer](/screenshots/steps.png)

## Prerequisites

### 1. Hetzner API Key

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create a new project or select an existing one
3. Go to "Security" → "API Tokens"
4. Create a new API token with "Read & Write" permissions
5. Copy the token (you'll need it for the application)

### 2. RPC Provider API Key

1. Go to [dRPC](https://drpc.org/), [Infura](https://www.infura.io/), or [Alchemy](https://www.alchemy.com/).
2. Create a project, and grab your API key.

## Usage

- Clone or download this repository.

```
git clone https://github.com/unruggable-labs/unruggable-gateways-deployer.git
```
- Open `index.html` in your web browser.

### Step 1: API Key Validation
1. Enter API keys for your Hetzner account and your selected RPC provider
2. Click "Validate API Keys"

### Step 2: Server Configuration
1. Select a server type from the dropdown
2. Select the Unruggable Gateways release that you want to deploy
3. Select the blockchain that you would like to deploy a gateway for
3. Optionally customize the server name
4. Click "Continue to Review"

### Step 3: Review and Deploy
1. Review the configuration details
2. Click "Deploy Server"

## What Happens During Deployment

The application creates a Hetzner server with the following configuration:

- **Image**: Ubuntu 22.04
- **Location**: Nuremberg (nbg1)

The server is initialized with a user data script that automatically:

  - Clones the [Unruggable Gateways](https://github.com/unruggable-labs/unruggable-gateways) GitHub repository
  - Checks out the specified release tag
  - Installs required tools and dependencies
  - Creates and starts a systemd service operating the gateway in a screen instance


## Security Notes

- The API key is stored in memory and **is not persisted**.
- The application uses HTTPS for all API calls

## License

This project is open source and available under the MIT License.
