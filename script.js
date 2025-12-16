// Global state

// This will hold the Hetzner API key (once verified in step 1)
let hetznerApiKey = '';

// This will hold the server types (once loaded in step 2)
let serverTypes = [];

// This will hold the Unruggable Gateways releases (once loaded in step 2)
let releases = [];

// This will hold the deployed server data (once deployed in step 3)
// And will update it after the server is ready
let deployedServer = null;

// Enumeration for steps
const STEPS = {
    API_KEYS: 1,
    SERVER_CONFIGURATION: 2,
    REVIEW_AND_DEPLOY: 3
};

// DOM elements
const elements = {
    // Step 1 elements
    hetznerApiKeyInput: document.getElementById('apiKey'),
    toggleHetznerApiKeyBtn: document.getElementById('toggleApiKey'),
    validateApiKeysBtn: document.getElementById('validateApiKey'),
    apiKeyStatus: document.getElementById('apiKeyStatus'),
    rpcProviderSelect: document.getElementById('rpcProvider'),
    rpcApiKeyGroup: document.getElementById('rpcApiKeyGroup'),
    rpcApiKeyInput: document.getElementById('rpcApiKey'),
    rpcApiKeyLabel: document.getElementById('rpcApiKeyLabel'),
    rpcApiKeyHelp: document.getElementById('rpcApiKeyHelp'),
    
    // Step 2 elements
    serverTypeSelect: document.getElementById('serverType'),
    releaseTagSelect: document.getElementById('releaseTag'),
    releaseNotesLink: document.getElementById('releaseNotesLink'),
    chainSelect: document.getElementById('chainSelect'),
    testnetToggle: document.getElementById('testnetToggle'),
    toggleRpcApiKeyBtn: document.getElementById('toggleRpcApiKey'),
    serverNameInput: document.getElementById('serverName'),
    continueToReviewBtn: document.getElementById('continueToReview'),
    deployStatus: document.getElementById('deployStatus'),
    
    // Step 3 elements
    reviewState: document.getElementById('reviewState'),
    deploymentCompleteState: document.getElementById('deploymentCompleteState'),
    reviewChain: document.getElementById('reviewChain'),
    reviewServerType: document.getElementById('reviewServerType'),
    reviewReleaseTag: document.getElementById('reviewReleaseTag'),
    reviewServerName: document.getElementById('reviewServerName'),
    userDataPreview: document.getElementById('userDataPreview'),
    backToConfigBtn: document.getElementById('backToConfig'),
    deployServerBtn: document.getElementById('deployServer'),
    serverIP: document.getElementById('serverIP'),
    rootPassword: document.getElementById('rootPassword'),
    deployedServerName: document.getElementById('deployedServerName'),
    deployedServerType: document.getElementById('deployedServerType'),
    deployedReleaseTag: document.getElementById('deployedReleaseTag'),
    copyIPBtn: document.getElementById('copyIP'),
    copyPasswordBtn: document.getElementById('copyPassword'),
    deployAnotherBtn: document.getElementById('deployAnother'),
    sshLink: document.getElementById('sshLink'),
    
    // Steps
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3')
};

// Chain configuration data
const CHAIN_DATA = {
    "arbitrum": {
        name: "Arbitrum",
        gatewayName: "arb1",
        port: 8833,
        args: "--latest --unfinalized=1",
        isTestnet: false
    },
    "arbitrum-sepolia": {
        name: "Arbitrum Sepolia",
        gatewayName: "arb1-sepolia",
        port: 8834,
        args: "--latest --unfinalized=1",
        isTestnet: true
    },
    "base": {
        name: "Base",
        gatewayName: "base",
        port: 8822,
        args: "--latest --unfinalized=1",
        isTestnet: false
    },
    "base-sepolia": {
        name: "Base Sepolia",
        gatewayName: "base-sepolia",
        port: 8826,
        args: "--latest --unfinalized=1",
        isTestnet: true
    },
    "linea": {
        name: "Linea",
        gatewayName: "linea",
        port: 8844,
        args: "--latest",
        isTestnet: false
    },
    "linea-sepolia": {
        name: "Linea Sepolia",
        gatewayName: "linea-sepolia",
        port: 8845,
        args: "--latest",
        isTestnet: true
    },
    "optimism": {
        name: "Optimism",
        gatewayName: "op",
        port: 8811,
        args: "--latest --unfinalized=1",
        isTestnet: false
    },
    "optimism-sepolia": {
        name: "Optimism Sepolia",
        gatewayName: "op-sepolia",
        port: 8812,
        args: "--latest --debug --unfinalized=1",
        isTestnet: true
    },
    "scroll": {
        name: "Scroll",
        gatewayName: "scroll",
        port: 8866,
        args: "--latest",
        isTestnet: false
    },
    "scroll-sepolia": {
        name: "Scroll Sepolia",
        gatewayName: "scroll-sepolia",
        port: 8867,
        args: "--latest",
        isTestnet: true
    }
};

// GitHub repository configuration
const GITHUB_REPO = {
    owner: 'unruggable-labs',
    repo: 'unruggable-gateways' 
};

// Hetzner API configuration
const HETZNER_API_BASE = 'https://api.hetzner.cloud/v1';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    generateDefaultServerName();
});

function initializeEventListeners() {
    // API key toggle visibility
    elements.toggleHetznerApiKeyBtn.addEventListener('click', toggleHetznerApiKeyVisibility);
    
    // API key validation
    elements.validateApiKeysBtn.addEventListener('click', validateApiKey);

    // RPC provider selection
    elements.rpcProviderSelect.addEventListener('change', handleRpcProviderChange);    

    // API key inputs validation
    elements.hetznerApiKeyInput.addEventListener('input', validateApiKeyInputs);
    elements.rpcApiKeyInput.addEventListener('input', validateApiKeyInputs);
    

    // Chain selection and testnet toggle
    elements.chainSelect.addEventListener('change', handleChainSelection);
    elements.testnetToggle.addEventListener('change', updateChainOptions);
    
    // RPC API key toggle visibility
    elements.toggleRpcApiKeyBtn.addEventListener('click', toggleRpcApiKeyVisibility);
    
    // Release notes link
    elements.releaseTagSelect.addEventListener('change', updateReleaseNotesLink);
    
    // Continue to review
    elements.continueToReviewBtn.addEventListener('click', continueToReview);
    
    // Back to configuration
    elements.backToConfigBtn.addEventListener('click', backToConfig);
    
    // Do Server deployment
    elements.deployServerBtn.addEventListener('click', deployServer);
    
    // Copy IP functionality
    elements.copyIPBtn.addEventListener('click', copyServerIP);
    
    // Copy password functionality
    elements.copyPasswordBtn.addEventListener('click', copyRootPassword);
    
    // Deploy another server
    elements.deployAnotherBtn.addEventListener('click', resetToStep1);
    
    // Server name auto-generation
    elements.serverTypeSelect.addEventListener('change', generateDefaultServerName);
}

// Toggle if the Hetzner API key is visible
function toggleHetznerApiKeyVisibility() {
    const input = elements.hetznerApiKeyInput;
    const icon = elements.toggleHetznerApiKeyBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Validates that we have appropriate Step 1 inputs
function validateApiKeyInputs() {
    const hasHetznerApiKey = elements.hetznerApiKeyInput.value.trim().length > 0;
    const hasRpcProvider = elements.rpcProviderSelect.value;
    const hasRpcApiKey = hasRpcProvider && elements.rpcApiKeyInput.value.trim().length > 0;
    
    // Only enable the button if all required fields are filled AND we haven't successfully validated yet
    elements.validateApiKeysBtn.disabled = !(hasHetznerApiKey && hasRpcApiKey);
}

// Update the chain options based on the testnet toggle
function updateChainOptions() {
    const isTestnet = elements.testnetToggle.checked;
    const currentChain = elements.chainSelect.value;
    
    // Clear existing options
    elements.chainSelect.innerHTML = '<option value="">Choose a blockchain</option>';
    
    // Define chain options
    const mainnetChains = Object.values(CHAIN_DATA).filter(chain => !chain.isTestnet).map(chain => ({ value: chain.gatewayName, label: chain.name }));

    const testnetChains = Object.values(CHAIN_DATA).filter(chain => chain.isTestnet).map(chain => ({ value: chain.gatewayName, label: chain.name }));
    
    const chainsToShow = isTestnet ? testnetChains : mainnetChains;
    
    // Add options
    chainsToShow.forEach(chain => {
        const option = document.createElement('option');
        option.value = chain.value;
        option.textContent = chain.label;
        elements.chainSelect.appendChild(option);
    });
    
    // Reset selection if current chain is not available in new mode
    if (currentChain && !chainsToShow.find(chain => chain.value === currentChain)) {
        elements.chainSelect.value = '';
    }
}

// Handler for chain changes
function handleChainSelection() {

    // Update server name generation
    generateDefaultServerName();
    
    // Check if all required fields are filled for deploy button
    if (typeof checkSelections === 'function') {
        checkSelections();
    }
}

// Handler to link to Unruggable Gateways release notes when a release tag is selected
function updateReleaseNotesLink() {
    const selectedRelease = elements.releaseTagSelect.value;
    
    if (selectedRelease) {
        const release = releases.find(r => r.tag_name === selectedRelease);
        if (release && release.html_url) {
            const link = elements.releaseNotesLink.querySelector('a');
            link.href = release.html_url;
            elements.releaseNotesLink.classList.remove('hidden');
        } else {
            elements.releaseNotesLink.classList.add('hidden');
        }
    } else {
        elements.releaseNotesLink.classList.add('hidden');
    }
}

function continueToReview() {
    // Populate review details
    elements.reviewChain.textContent = elements.chainSelect.value;
    elements.reviewServerType.textContent = elements.serverTypeSelect.value;
    elements.reviewReleaseTag.textContent = elements.releaseTagSelect.value;
    elements.reviewServerName.textContent = elements.serverNameInput.value || `gateway-${elements.chainSelect.value}-${elements.serverTypeSelect.value}-${Date.now()}`;
    
    // Generate and display user data script
    const userDataScript = createUserDataScript(elements.releaseTagSelect.value, releases.find(r => r.tag_name === elements.releaseTagSelect.value));
    elements.userDataPreview.textContent = userDataScript;
    
    // Move to step 3
    showStep(STEPS.REVIEW_AND_DEPLOY);
}

// Move back to SERVER_CONFIGURATION step (step 2)
function backToConfig() {
    showStep(STEPS.SERVER_CONFIGURATION);

    // If returning due to deploy error, hide deploy status before return
    elements.deployStatus.classList.add('hidden');
}

// Handler for RPC provider changes
function handleRpcProviderChange() {
    const selectedProvider = elements.rpcProviderSelect.value;
    
    if (selectedProvider) {
        // Show the API key input
        elements.rpcApiKeyGroup.classList.remove('hidden');
        
        // Update label and help text based on provider
        const providerNames = {
            'drpc': 'dRPC',
            'infura': 'Infura',
            'alchemy': 'Alchemy'
        };
        
        const providerName = providerNames[selectedProvider] || 'RPC Provider';

        elements.rpcApiKeyLabel.textContent = `${providerName} API Key`;
        elements.rpcApiKeyInput.placeholder = `Enter your ${providerName} API key`;
        elements.rpcApiKeyHelp.textContent = `Your ${providerName} API key will be used to connect to the blockchain`;
    } else {
        // Hide the API key input
        elements.rpcApiKeyGroup.classList.add('hidden');
        elements.rpcApiKeyInput.value = '';
    }
    
    validateApiKeyInputs();
}

// Toggle if the RPC API key is visible
function toggleRpcApiKeyVisibility() {
    const input = elements.rpcApiKeyInput;
    const icon = elements.toggleRpcApiKeyBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

async function validateApiKey() {

    const hetznerApiKeyValue = elements.hetznerApiKeyInput.value.trim();
    const rpcProvider = elements.rpcProviderSelect.value;
    const rpcApiKey = elements.rpcApiKeyInput.value.trim();
    
    if (!hetznerApiKeyValue) {
        showStatus(elements.apiKeyStatus, 'Please enter your Hetzner API key', 'error');
        return;
    }
    
    if (!rpcProvider) {
        showStatus(elements.apiKeyStatus, 'Please select an RPC provider', 'error');
        return;
    }
    
    if (!rpcApiKey) {
        showStatus(elements.apiKeyStatus, 'Please enter your RPC provider API key', 'error');
        return;
    }
    
    setLoading(elements.validateApiKeysBtn, true);
    showStatus(elements.apiKeyStatus, 'Validating API keys...', 'info');
    
    try {
        // Validate Hetzner API key
        const response = await fetch(`${HETZNER_API_BASE}/servers`, {
            headers: {
                'Authorization': `Bearer ${hetznerApiKeyValue}`,
                'Content-Type': 'application/json'
            }
        });
        
        // TODO: Validate RPC API key format
        if (false) {
            setLoading(elements.validateApiKeysBtn, false);
            showStatus(elements.apiKeyStatus, 'Invalid RPC provider API key format', 'error');
            return;
        }
        
        if (response.ok) {

            hetznerApiKey = hetznerApiKeyValue;
            showStatus(elements.apiKeyStatus, 'API keys validated! Loading server types...', 'success');
            
            // Disable the validate button after successful validation
            elements.validateApiKeysBtn.disabled = true;
            
            // Load server types and releases
            await Promise.all([
                loadServerTypes(),
                loadGitHubReleases()
            ]);
            
            // Move to step 2
            showStep(STEPS.SERVER_CONFIGURATION);

        } else {
            const errorData = await response.json();
            showStatus(elements.apiKeyStatus, `Invalid Hetzner API key: ${errorData.error?.message || 'Authentication failed'}`, 'error');
        }
    } catch (error) {
        showStatus(elements.apiKeyStatus, `Error validating API key: ${error.message}`, 'error');
    } finally {
        setLoading(elements.validateApiKeysBtn, false);
    }
}

// Async function to load server types from the Hetzner API
async function loadServerTypes() {
    try {
        const response = await fetch(`${HETZNER_API_BASE}/server_types`, {
            headers: {
                'Authorization': `Bearer ${hetznerApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            serverTypes = data.server_types.filter(type => type.prices.length > 0);
            
            // Populate server type select
            elements.serverTypeSelect.innerHTML = '<option value="">Select server type</option>';
            serverTypes.forEach(type => {
                // Only show server types that are less than $10/month
                // More advanced operators shouldn't be deploying their infra with this tool
                if (type.prices[0].price_monthly.gross < 10) {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = `${type.name} - ${type.description} (${formatPrice(type.prices[0].price_monthly.gross)}/month)`;
                    elements.serverTypeSelect.appendChild(option);
                }
            });
            
            elements.serverTypeSelect.disabled = false;
        } else {
            throw new Error('Failed to load server types');
        }
    } catch (error) {
        console.error('Error loading server types:', error);
        elements.serverTypeSelect.innerHTML = '<option value="">Error loading server types</option>';
    }
}

// Async function to load Unruggable Gateways releases from GitHub
async function loadGitHubReleases() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}/releases`);
        
        if (response.ok) {
            const data = await response.json();
            releases = data.slice(0, 10); // Get latest 10 releases
            
            // Populate release select
            elements.releaseTagSelect.innerHTML = '<option value="">Select release tag</option>';
            releases.forEach(release => {
                const option = document.createElement('option');
                option.value = release.tag_name;
                option.textContent = `${release.tag_name} - ${release.name || 'No title'}`;
                elements.releaseTagSelect.appendChild(option);
            });
            
            elements.releaseTagSelect.disabled = false;
        } else {
            throw new Error('Failed to load releases');
        }
    } catch (error) {
        console.error('Error loading releases:', error);
        elements.releaseTagSelect.innerHTML = '<option value="">Error loading releases</option>';
    }
}

// GenerateS a default server name based on selected confirguration options
function generateDefaultServerName() {
    const serverType = elements.serverTypeSelect.value;
    const chain = elements.chainSelect.value;
    const timestamp = new Date().toISOString().slice(0, 10);
    
    if (serverType && chain) {
        elements.serverNameInput.value = `gateway-${chain}-${serverType}-${timestamp}`;
    } else if (serverType) {
        elements.serverNameInput.value = `gateway-${serverType}-${timestamp}`;
    }
}

async function deployServer() {

    const chain = elements.chainSelect.value;
    const serverType = elements.serverTypeSelect.value;
    const releaseTag = elements.releaseTagSelect.value;
    const serverName = elements.serverNameInput.value.trim() || `gateway-${chain}-${serverType}-${Date.now()}`;
    
    elements.backToConfigBtn.disabled = true;
    setLoading(elements.deployServerBtn, true);
    
    try {
        // Find the selected server type
        const selectedServerType = serverTypes.find(type => type.name === serverType);
        if (!selectedServerType) {
            throw new Error('Invalid server type selected');
        }
        
        // Find the selected release
        const selectedRelease = releases.find(release => release.tag_name === releaseTag);
        if (!selectedRelease) {
            throw new Error('Invalid release selected');
        }
        
        // Create user data script
        const userData = createUserDataScript(releaseTag, selectedRelease);
        
        // Create server
        const serverData = {
            name: serverName,
            server_type: serverType,
            image: 'ubuntu-22.04',
            location: 'nbg1', // Nuremberg datacenter
            user_data: userData,
            ssh_keys: [], // You might want to add SSH keys here
            networks: [],
            volumes: [],
            labels: {
                'created-by': 'unruggable-gateways-deployer',
                //'github-release': releaseTag,
                //'deployment-time': new Date().toISOString()
            }
        };
        
        const response = await fetch(`${HETZNER_API_BASE}/servers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hetznerApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serverData)
        });
        
        if (response.ok) {
            const responseData = await response.json();
            deployedServer = responseData.server;
            
            // Store the root password from the creation response
            const rootPassword = responseData.root_password;
            
            // Hide button spinner and show status message
            showStatus(elements.deployStatus, 'Server created ! Waiting for server to be ready...', 'success');
            
            // Wait for server to be ready
            await waitForServerReady(deployedServer.id);
            
            // Restore the root password that was lost during the status check
            if (rootPassword) {
                deployedServer.root_password = rootPassword;
            }
            
            // Show deployment complete state and mark all steps as completed
            showDeploymentComplete();
            updateProgressIndicator(3, true); // Mark all steps as completed
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create server');
        }
    } catch (error) {
        showStatus(elements.deployStatus, `Error creating server: ${error.message}`, 'error');
        elements.backToConfigBtn.disabled = false;
    } finally {
        setLoading(elements.deployServerBtn, false);
    }
}

// Create a user data script based on the selected user configuration
function createUserDataScript(releaseTag, release) {

    // Get the selected chain
    const selectedChain = elements.chainSelect.value;
    
    // Get chain configuration
    const chainConfig = CHAIN_DATA[selectedChain] || CHAIN_DATA["arbitrum"];
    const { gatewayName, port, args } = chainConfig;
    
    // Get RPC provider configuration
    const rpcProvider = elements.rpcProviderSelect.value;
    const rpcApiKey = elements.rpcApiKeyInput.value.trim();
    
    // Determine which environment variable to set
    let envVariable = '';
    if (rpcProvider === 'drpc') {
        envVariable = `DRPC_KEY=${rpcApiKey}`;
    } else if (rpcProvider === 'infura') {
        envVariable = `INFURA_KEY=${rpcApiKey}`;
    } else if (rpcProvider === 'alchemy') {
        envVariable = `ALCHEMY_KEY=${rpcApiKey}`;
    }
    
    // Return the user data script
    return `#!/bin/bash

# Update the package manager
apt-get update
# Install unzip
apt-get install -y unzip

# Set HOME for root user (required for bun installer)
export HOME=/root

# Install Bun v1.1.26 using official installer
curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.26"

# Add bun to PATH
export PATH="$HOME/.bun/bin:$PATH"

# E.T. go home
cd /home

# Clone the repository
git clone https://github.com/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}.git

# Move to Unruggable Gateways directory
cd /home/unruggable-gateways

# Checkout the specific release
git checkout ${releaseTag}

# Install dependencies
bun install

# Create .env file with RPC provider configuration
cat > /home/unruggable-gateways/.env << EOF
${envVariable}
EOF

# Create systemd service (example)
cat > /etc/systemd/system/unruggable-gateways.service << EOF
[Unit]
Description=Unruggable Gateways Service
After=network.target

[Service]
Type=forking
User=root
Group=root
StandardOutput=syslog
StandardError=syslog
Restart=always
Environment="PATH=/root/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/usr/bin/screen -dm -S unruggable-gateways /bin/bash -c 'cd /home/unruggable-gateways/ && bun run /home/unruggable-gateways/scripts/serve.ts ${gatewayName} ${port} ${args}'

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable unruggable-gateways
systemctl start unruggable-gateways
`;
}

// Async function to wait for the server to get an IP address
async function waitForServerIP(serverId) {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${HETZNER_API_BASE}/servers/${serverId}`, {
                headers: {
                    'Authorization': `Bearer ${hetznerApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const server = data.server;
                
                if (server.public_net.ipv4 && server.public_net.ipv4.ip) {
                    deployedServer = server;
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking server status:', error);
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    throw new Error('Server IP address not available after 5 minutes');
}

// Async function to verify with the Hetzner API that the server is running and ready
async function waitForServerReady(serverId) {
    const maxAttempts = 60;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${HETZNER_API_BASE}/servers/${serverId}`, {
                headers: {
                    'Authorization': `Bearer ${hetznerApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const server = data.server;
                
                // Check if server is running and ready
                if (server.status === 'running') {
                    // Server is running according to Hetzner API, consider it ready
                    deployedServer = server;
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking server readiness:', error);
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    // If we reach here, server is probably ready even if we couldn't verify
    console.log('Server readiness check timed out, assuming server is ready');
}

// Show the deployment complete state.. duh.
function showDeploymentComplete() {
    // Hide review state and show deployment complete state
    elements.reviewState.classList.add('hidden');
    elements.deploymentCompleteState.classList.remove('hidden');
    
    // Display deployment results
    displayDeploymentResults();
}

// Display the deployment results.. duh.
function displayDeploymentResults() {
    if (!deployedServer) return;
    
    const ip = deployedServer.public_net.ipv4?.ip || 'Not available';
    const serverName = deployedServer.name;
    const serverType = deployedServer.server_type.name;
    const releaseTag = elements.releaseTagSelect.value;
    const rootPassword = deployedServer.root_password || 'Not available';
    
    elements.serverIP.textContent = ip;
    elements.rootPassword.textContent = rootPassword;
    elements.deployedServerName.textContent = serverName;
    elements.deployedServerType.textContent = serverType;
    elements.deployedReleaseTag.textContent = releaseTag;
    
    // Update SSH link
    elements.sshLink.href = `ssh://root@${ip}`;
    
    // Show action buttons now that server is ready
    const actionButtons = document.getElementById('actionButtons');
    if (actionButtons) {
        actionButtons.classList.remove('hidden');
    }
}

// Handler for the copy server IP button
function copyServerIP() {
    const ip = elements.serverIP.textContent;
    if (ip && ip !== 'Loading...') {
        navigator.clipboard.writeText(ip).then(() => {
            const btn = elements.copyIPBtn;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '#1a1a1a';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy IP:', err);
        });
    }
}

// Handler for the copy root password button
function copyRootPassword() {
    const password = elements.rootPassword.textContent;
    if (password && password !== 'Loading...') {
        navigator.clipboard.writeText(password).then(() => {
            const btn = elements.copyPasswordBtn;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '#1a1a1a';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy password:', err);
        });
    }
}

// Handler to reset everything for another deployment
function resetToStep1() {

    // Reset form
    elements.hetznerApiKeyInput.value = '';
    elements.serverTypeSelect.innerHTML = '<option value="">Loading server types...</option>';
    elements.releaseTagSelect.innerHTML = '<option value="">Loading releases...</option>';
    elements.chainSelect.value = '';
    elements.testnetToggle.checked = false;
    elements.rpcProviderSelect.value = '';
    elements.rpcApiKeyInput.value = '';
    elements.rpcApiKeyGroup.classList.add('hidden');
    elements.serverNameInput.value = '';
    
    // Reset chain options to mainnet
    updateChainOptions();
    
    // Reset state
    hetznerApiKey = '';
    serverTypes = [];
    releases = [];
    deployedServer = null;
    
    // Reset UI
    elements.validateApiKeysBtn.disabled = true;
    elements.validateApiKeysBtn.classList.remove('hidden');
    elements.validateApiKeysBtn.style.opacity = '1';
    elements.serverTypeSelect.disabled = true;
    elements.releaseTagSelect.disabled = true;
    elements.continueToReviewBtn.disabled = true;
    elements.backToConfigBtn.disabled = false;
    
    // Clear status messages
    elements.apiKeyStatus.innerHTML = '';
    elements.apiKeyStatus.className = 'status-message';
    elements.deployStatus.innerHTML = '';
    elements.deployStatus.className = 'status-message';
    
    // Clear any loading states
    const loadingSpinners = document.querySelectorAll('.spinner');
    loadingSpinners.forEach(spinner => spinner.classList.add('hidden'));
    
    // Reset button states
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        const spinner = btn.querySelector('.spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    });
    
    // Hide release notes link
    elements.releaseNotesLink.classList.add('hidden');
    
    // Reset step 3 states
    elements.reviewState.classList.remove('hidden');
    elements.deploymentCompleteState.classList.add('hidden');
    
    // Hide action buttons
    const actionButtons = document.getElementById('actionButtons');
    if (actionButtons) {
        actionButtons.classList.add('hidden');
    }
    
    // Reset progress indicator
    updateProgressIndicator(1, false);
    
    // Show step 1
    showStep(STEPS.API_KEYS);
}

// Handler to set display state to a specific step
function showStep(stepNumber) {
    // Hide all steps
    elements.step1.classList.add('hidden');
    elements.step2.classList.add('hidden');
    elements.step3.classList.add('hidden');
    
    // Update progress indicator
    updateProgressIndicator(stepNumber);
    
    // Show selected step
    if (stepNumber === 1) {

        elements.step1.classList.remove('hidden');
        // Enable validate button when all required fields are filled
        const checkStep1Selections = () => {
            const hasApiKey = elements.hetznerApiKeyInput.value.trim();
            const hasRpcProvider = elements.rpcProviderSelect.value;
            const hasRpcApiKey = !hasRpcProvider || elements.rpcApiKeyInput.value.trim();
            
            elements.validateApiKeysBtn.disabled = !(hasApiKey && hasRpcProvider && hasRpcApiKey);
        };
        
        elements.hetznerApiKeyInput.addEventListener('input', checkStep1Selections);
        elements.rpcProviderSelect.addEventListener('change', checkStep1Selections);
        elements.rpcApiKeyInput.addEventListener('input', checkStep1Selections);
        checkStep1Selections();

    } else if (stepNumber === 2) {

        elements.step2.classList.remove('hidden');
        // Enable continue button when all selections are made
        const checkSelections = () => {
            const hasServerType = elements.serverTypeSelect.value;
            const hasReleaseTag = elements.releaseTagSelect.value;
            const hasChain = elements.chainSelect.value;
            
            elements.continueToReviewBtn.disabled = !(hasServerType && hasReleaseTag && hasChain);
        };
        
        elements.serverTypeSelect.addEventListener('change', checkSelections);
        elements.releaseTagSelect.addEventListener('change', checkSelections);
        elements.chainSelect.addEventListener('change', checkSelections);
        checkSelections();

    } else if (stepNumber === 3) {

        elements.step3.classList.remove('hidden');
        // Show review state by default
        elements.reviewState.classList.remove('hidden');
        elements.deploymentCompleteState.classList.add('hidden');
    }
}

// Update the progress indicator at the top of the page dependent on the current step
function updateProgressIndicator(currentStep, allCompleted = false) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (allCompleted) {
            step.classList.add('completed');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// Generic helper to set the loading state of a specific button
function setLoading(button, isLoading, newText = null) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    
    if (newText) {
        btnText.textContent = newText;
    }
    
    if (isLoading) {
        btnText.style.opacity = '0';
        spinner.classList.remove('hidden');
        spinner.classList.add('show');
        button.disabled = true;
    } else {
        btnText.style.opacity = '1';
        spinner.classList.add('hidden');
        spinner.classList.remove('show');
        button.disabled = false;
    }
}

// Generic helper to show a status message in a specific element
function showStatus(element, message, type) {
    element.classList.remove('hidden');
    element.textContent = message;
    element.className = `status-message ${type}`;
}

// Helper for formatting prices
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price);
}
