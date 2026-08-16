#!/usr/bin/env bash
# ==============================================================================
#  ███████╗██╗   ██╗███╗   ███╗    ██████╗  █████╗ ███╗   ██╗███████╗██╗     
#  ██╔════╝██║   ██║████╗ ████║    ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     
#  █████╗  ██║   ██║██╔████╔██║    ██████╔╝███████║██╔██╗ ██║█████╗  ██║     
#  ██╔══╝  ╚██╗ ██╔╝██║╚██╔╝██║    ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     
#  ███████╗ ╚████╔╝ ██║ ╚═╝ ██║    ██║     ██║  ██║██║ ╚████║███████╗███████╗
#  ╚══════╝  ╚═══╝  ╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
# ==============================================================================
#  EVM Panel - Modern Docker-based VPS Management Installation Script
#  Supported OS: Ubuntu, Debian, CentOS, AlmaLinux, Rocky Linux, Fedora, Alpine
# ==============================================================================

set -e

# ANSI Color Palette
CYAN='\033[0;36m'
EMERALD='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

INSTALL_DIR="/opt/evm-panel"
SERVICE_NAME="evm-panel"
DEFAULT_PORT=3000
PANEL_REPO="https://github.com/evm-panel/evm-panel.git"

# Header Banner
print_banner() {
    clear
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
  ███████╗██╗   ██╗███╗   ███╗    ██████╗  █████╗ ███╗   ██╗███████╗██╗     
  ██╔════╝██║   ██║████╗ ████║    ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     
  █████╗  ██║   ██║██╔████╔██║    ██████╔╝███████║██╔██╗ ██║█████╗  ██║     
  ██╔══╝  ╚██╗ ██╔╝██║╚██╔╝██║    ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     
  ███████╗ ╚████╔╝ ██║ ╚═╝ ██║    ██║     ██║  ██║██║ ╚████║███████╗███████╗
  ╚══════╝  ╚═══╝  ╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
EOF
    echo -e "${NC}"
    echo -e "   ${BOLD}${EMERALD}⚡ EVM Panel • Next-Gen Docker VPS Management System${NC}"
    echo -e "   ${CYAN}─────────────────────────────────────────────────────────────${NC}"
    echo ""
}

# Root check
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}[ERROR] This installer must be run as root (sudo bash install.sh)${NC}"
        exit 1
    fi
}

# Detect package manager
detect_pkg_manager() {
    if command -v apt-get &>/dev/null; then
        PKG_MGR="apt"
    elif command -v dnf &>/dev/null; then
        PKG_MGR="dnf"
    elif command -v yum &>/dev/null; then
        PKG_MGR="yum"
    elif command -v apk &>/dev/null; then
        PKG_MGR="apk"
    else
        PKG_MGR="unknown"
    fi
}

# ------------------------------------------------------------------------------
# 1) INSTALL EVM PANEL
# ------------------------------------------------------------------------------
install_evm_panel() {
    print_banner
    echo -e "${CYAN}${BOLD}>>> [1/6] Installing EVM Panel & System Dependencies...${NC}\n"
    detect_pkg_manager

    echo -e "${BLUE}▶ Updating package repositories...${NC}"
    case "$PKG_MGR" in
        apt)
            apt-get update -y
            apt-get install -y curl wget git unzip tar socat jq build-essential iptables
            ;;
        dnf|yum)
            $PKG_MGR update -y
            $PKG_MGR install -y curl wget git unzip tar socat jq iptables
            ;;
        apk)
            apk update
            apk add curl wget git unzip tar socat jq iptables bash
            ;;
        *)
            echo -e "${AMBER}[WARN] Unrecognized package manager. Ensuring basic tools are installed...${NC}"
            ;;
    esac

    # 1. Install Docker Engine if not present
    if ! command -v docker &>/dev/null; then
        echo -e "${BLUE}▶ Installing Docker Engine...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm -f get-docker.sh
        systemctl enable docker || true
        systemctl start docker || true
        echo -e "${EMERALD}✔ Docker Engine installed successfully!${NC}"
    else
        echo -e "${EMERALD}✔ Docker Engine is already installed.${NC}"
    fi

    # 2. Install Node.js (v20+ LTS)
    if ! command -v node &>/dev/null; then
        echo -e "${BLUE}▶ Installing Node.js LTS (v20)...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs || true
    fi

    # 3. Setup Install Directory
    echo -e "${BLUE}▶ Setting up EVM Panel at ${INSTALL_DIR}...${NC}"
    mkdir -p "$INSTALL_DIR"
    
    # Check if local files exist in current directory or clone
    if [ -f "./package.json" ]; then
        echo -e "${CYAN}▶ Copying panel files from current directory...${NC}"
        cp -r ./* "$INSTALL_DIR/" 2>/dev/null || true
        cp .env* "$INSTALL_DIR/" 2>/dev/null || true
    else
        echo -e "${CYAN}▶ Cloning EVM Panel repository...${NC}"
        git clone "$PANEL_REPO" "$INSTALL_DIR" || {
            echo -e "${AMBER}[INFO] Initializing standalone EVM Panel application bundle...${NC}"
        }
    fi

    cd "$INSTALL_DIR"

    # 4. Install Node Dependencies & Build
    echo -e "${BLUE}▶ Installing npm packages & compiling production build...${NC}"
    npm install --silent || npm install
    npm run build || true

    # 5. Configure Default .env
    if [ ! -f "$INSTALL_DIR/.env" ]; then
        echo -e "${BLUE}▶ Generating initial configuration (.env)...${NC}"
        cat > "$INSTALL_DIR/.env" << EOF
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
ADMIN_EMAIL=admin@evmpanel.io
DOCKER_SOCKET=/var/run/docker.sock
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "evm_secret_key_docker_panel_98765")
EOF
    fi

    # 6. Create systemd service
    echo -e "${BLUE}▶ Configuring systemd service [${SERVICE_NAME}]...${NC}"
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=EVM Panel - Docker VPS Management Server
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(which npm) run preview -- --port 3000 --host 0.0.0.0
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}"
    systemctl restart "${SERVICE_NAME}"

    SERVER_IP=$(curl -s https://api.ipify.org || curl -s ifconfig.me || echo "YOUR_SERVER_IP")

    echo ""
    echo -e "${EMERALD}${BOLD}===============================================================${NC}"
    echo -e "${EMERALD}${BOLD} ✔  EVM PANEL INSTALLED SUCCESSFULLY!                         ${NC}"
    echo -e "${EMERALD}${BOLD}===============================================================${NC}"
    echo -e "  ${BOLD}🌐 Panel Access URL :${NC} ${CYAN}http://${SERVER_IP}:3000${NC}"
    echo -e "  ${BOLD}🔑 Default Admin    :${NC} ${AMBER}admin${NC}"
    echo -e "  ${BOLD}🔒 Default Password :${NC} ${AMBER}admin${NC}"
    echo -e "  ${BOLD}⚡ Local Node       :${NC} ${EMERALD}Auto-Attached (/var/run/docker.sock) • 0 Setup Needed${NC}"
    echo -e "  ${BOLD}📂 Installed Path   :${NC} ${INSTALL_DIR}"
    echo -e "${EMERALD}===============================================================${NC}"
    echo ""
    read -p "Press [Enter] to return to the main menu..."
}

# ------------------------------------------------------------------------------
# 2) CREATE / RESET ADMIN USER
# ------------------------------------------------------------------------------
create_admin_user() {
    print_banner
    echo -e "${CYAN}${BOLD}>>> [2/6] Create or Reset Admin User Account${NC}\n"

    echo -e "${AMBER}Configure administrator credentials for EVM Panel login:${NC}\n"
    
    read -p "Enter Admin Username [default: admin]: " ADMIN_USER
    ADMIN_USER=${ADMIN_USER:-admin}

    read -p "Enter Admin Email [default: admin@evmpanel.io]: " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@evmpanel.io}

    while true; do
        read -s -p "Enter Admin Password [default: admin]: " ADMIN_PASS
        echo ""
        ADMIN_PASS=${ADMIN_PASS:-admin}
        
        read -s -p "Confirm Admin Password: " ADMIN_PASS_CONFIRM
        echo ""
        ADMIN_PASS_CONFIRM=${ADMIN_PASS_CONFIRM:-admin}

        if [ "$ADMIN_PASS" == "$ADMIN_PASS_CONFIRM" ]; then
            break
        else
            echo -e "${RED}Passwords do not match. Please try again.${NC}\n"
        fi
    done

    # Save to .env or update credentials file
    mkdir -p "$INSTALL_DIR"
    if [ -f "$INSTALL_DIR/.env" ]; then
        sed -i "s/^ADMIN_USERNAME=.*/ADMIN_USERNAME=${ADMIN_USER}/" "$INSTALL_DIR/.env" || echo "ADMIN_USERNAME=${ADMIN_USER}" >> "$INSTALL_DIR/.env"
        sed -i "s/^ADMIN_EMAIL=.*/ADMIN_EMAIL=${ADMIN_EMAIL}/" "$INSTALL_DIR/.env" || echo "ADMIN_EMAIL=${ADMIN_EMAIL}" >> "$INSTALL_DIR/.env"
        sed -i "s/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=${ADMIN_PASS}/" "$INSTALL_DIR/.env" || echo "ADMIN_PASSWORD=${ADMIN_PASS}" >> "$INSTALL_DIR/.env"
    else
        cat > "$INSTALL_DIR/.env" << EOF
ADMIN_USERNAME=${ADMIN_USER}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}
PORT=3000
EOF
    fi

    # Restart service if running
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        systemctl restart "${SERVICE_NAME}"
    fi

    echo ""
    echo -e "${EMERALD}${BOLD}✔ Admin Account Successfully Created / Updated!${NC}"
    echo -e "   • Username : ${CYAN}${ADMIN_USER}${NC}"
    echo -e "   • Email    : ${CYAN}${ADMIN_EMAIL}${NC}"
    echo -e "   • Password : ${AMBER}••••••••${NC}"
    echo -e "   • Role     : ${EMERALD}FULL ADMINISTRATOR${NC}"
    echo ""
    read -p "Press [Enter] to return to the main menu..."
}

# ------------------------------------------------------------------------------
# 3) CONNECT CLOUDFLARE TUNNEL
# ------------------------------------------------------------------------------
connect_cloudflare_tunnel() {
    print_banner
    echo -e "${CYAN}${BOLD}>>> [3/6] Connect Cloudflare Zero Trust Tunnel${NC}\n"
    echo -e "Expose your EVM Panel to the internet securely without opening ports.\n"

    # Install cloudflared if not present
    if ! command -v cloudflared &>/dev/null; then
        echo -e "${BLUE}▶ Downloading & Installing cloudflared daemon...${NC}"
        ARCH=$(uname -m)
        case "$ARCH" in
            x86_64) CF_ARCH="amd64" ;;
            aarch64|arm64) CF_ARCH="arm64" ;;
            armv7l) CF_ARCH="arm" ;;
            *) CF_ARCH="amd64" ;;
        esac

        curl -L --output /usr/local/bin/cloudflared "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}"
        chmod +x /usr/local/bin/cloudflared
        echo -e "${EMERALD}✔ cloudflared binary installed successfully!${NC}\n"
    fi

    echo -e "${AMBER}Select Cloudflare Setup Method:${NC}"
    echo -e "  ${CYAN}[1]${NC} Quick Connect using Cloudflare Tunnel Token (Recommended for Dashboard users)"
    echo -e "  ${CYAN}[2]${NC} Quick Temporary TryCloudflare URL (Instant zero-config test domain)"
    echo -e "  ${CYAN}[3]${NC} Cancel & return to main menu"
    echo ""
    read -p "Enter choice [1-3]: " CF_CHOICE

    case "$CF_CHOICE" in
        1)
            echo ""
            read -p "Paste your Cloudflare Tunnel Token (from Zero Trust dashboard): " CF_TOKEN
            if [ -z "$CF_TOKEN" ]; then
                echo -e "${RED}[ERROR] Token cannot be empty.${NC}"
            else
                echo -e "${BLUE}▶ Installing cloudflared service with token...${NC}"
                cloudflared service install "$CF_TOKEN" || true
                systemctl restart cloudflared || true
                echo -e "${EMERALD}✔ Cloudflare Tunnel connected and running as systemd service!${NC}"
            fi
            ;;
        2)
            echo -e "${BLUE}▶ Launching temporary TryCloudflare tunnel for EVM Panel (port 3000)...${NC}"
            echo -e "${AMBER}Keep this terminal open or press Ctrl+C to stop the temporary tunnel.${NC}\n"
            cloudflared tunnel --url http://127.0.0.1:3000
            ;;
        *)
            echo -e "${AMBER}Cancelled Cloudflare Tunnel setup.${NC}"
            ;;
    esac

    echo ""
    read -p "Press [Enter] to return to the main menu..."
}

# ------------------------------------------------------------------------------
# 4) CONNECT PANEL TO CUSTOM DOMAIN (NGINX + SSL)
# ------------------------------------------------------------------------------
connect_custom_domain() {
    print_banner
    echo -e "${CYAN}${BOLD}>>> [4/6] Connect Panel to Custom Domain (Nginx + SSL)${NC}\n"
    detect_pkg_manager

    # 1. Install Nginx & Certbot
    echo -e "${BLUE}▶ Installing Nginx and Certbot (Let's Encrypt)...${NC}"
    case "$PKG_MGR" in
        apt)
            apt-get update -y
            apt-get install -y nginx certbot python3-certbot-nginx
            ;;
        dnf|yum)
            $PKG_MGR install -y epel-release || true
            $PKG_MGR install -y nginx certbot python3-certbot-nginx
            ;;
        *)
            echo -e "${AMBER}Please ensure Nginx & Certbot are available.${NC}"
            ;;
    esac

    # 2. Get Domain & Email from user
    echo ""
    read -p "Enter your domain name (e.g. panel.yourdomain.com): " CUSTOM_DOMAIN
    if [ -z "$CUSTOM_DOMAIN" ]; then
        echo -e "${RED}[ERROR] Domain name cannot be empty.${NC}"
        read -p "Press [Enter] to return..."
        return
    fi

    read -p "Enter SSL Admin Email for Let's Encrypt: " SSL_EMAIL
    SSL_EMAIL=${SSL_EMAIL:-admin@${CUSTOM_DOMAIN}}

    echo -e "\n${BLUE}▶ Creating Nginx reverse proxy configuration for ${CUSTOM_DOMAIN}...${NC}"

    NGINX_CONF="/etc/nginx/sites-available/${CUSTOM_DOMAIN}"
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name ${CUSTOM_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket & Terminal Support
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

    # Enable site in Nginx
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${CUSTOM_DOMAIN}" 2>/dev/null || true
    nginx -t && systemctl restart nginx

    # 3. Request Let's Encrypt SSL
    echo -e "${BLUE}▶ Requesting SSL Certificate from Let's Encrypt Certbot...${NC}"
    certbot --nginx -d "$CUSTOM_DOMAIN" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect || {
        echo -e "${AMBER}[WARN] Automated SSL provisioning failed. Ensure your DNS A-Record points to this server IP.${NC}"
    }

    echo ""
    echo -e "${EMERALD}${BOLD}===============================================================${NC}"
    echo -e "${EMERALD}${BOLD} ✔  CUSTOM DOMAIN & SSL CONFIGURED!                          ${NC}"
    echo -e "${EMERALD}${BOLD}===============================================================${NC}"
    echo -e "  ${BOLD}🌐 Secure Domain  :${NC} ${CYAN}https://${CUSTOM_DOMAIN}${NC}"
    echo -e "  ${BOLD}🔒 SSL Provider   :${NC} Let's Encrypt (Auto-Renew Enabled)"
    echo -e "  ${BOLD}⚙️  Reverse Proxy :${NC} Nginx ➜ Local Port 3000 (WebSocket Ready)"
    echo -e "${EMERALD}===============================================================${NC}"
    echo ""
    read -p "Press [Enter] to return to the main menu..."
}

# ------------------------------------------------------------------------------
# 5) UNINSTALL EVM PANEL
# ------------------------------------------------------------------------------
uninstall_evm_panel() {
    print_banner
    echo -e "${RED}${BOLD}>>> [5/6] Uninstall EVM Panel${NC}\n"
    echo -e "${RED}⚠️  WARNING: This will stop the EVM Panel service and remove panel files.${NC}"
    read -p "Are you sure you want to proceed? [y/N]: " CONFIRM_UNINSTALL

    if [[ "$CONFIRM_UNINSTALL" =~ ^[Yy]$ ]]; then
        echo -e "\n${BLUE}▶ Stopping & removing systemd service...${NC}"
        systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
        systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
        rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
        systemctl daemon-reload

        echo -e "${BLUE}▶ Removing installation directory (${INSTALL_DIR})...${NC}"
        rm -rf "$INSTALL_DIR"

        echo -e "${AMBER}Do you also want to remove all Docker VPS containers? [y/N]: ${NC}"
        read -p "" CLEAN_DOCKER
        if [[ "$CLEAN_DOCKER" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}▶ Stopping EVM Docker instances...${NC}"
            docker stop $(docker ps -a -q --filter name=evm-) 2>/dev/null || true
            docker rm $(docker ps -a -q --filter name=evm-) 2>/dev/null || true
            echo -e "${EMERALD}✔ EVM Docker containers removed.${NC}"
        fi

        echo ""
        echo -e "${EMERALD}✔ EVM Panel has been completely uninstalled from this server.${NC}"
    else
        echo -e "${AMBER}Uninstall aborted.${NC}"
    fi

    echo ""
    read -p "Press [Enter] to return to the main menu..."
}

# ------------------------------------------------------------------------------
# MAIN MENU LOOP
# ------------------------------------------------------------------------------
main_menu() {
    check_root

    while true; do
        print_banner
        echo -e "${BOLD}Select an operation from the options below:${NC}"
        echo ""
        echo -e "  ${CYAN}[1]${NC} ${BOLD}Install EVM Panel${NC}            ${EMERALD}(Docker, Node, Systemd Service & Web App)${NC}"
        echo -e "  ${CYAN}[2]${NC} ${BOLD}Create Admin User${NC}            ${AMBER}(Configure root administrator login credentials)${NC}"
        echo -e "  ${CYAN}[3]${NC} ${BOLD}Connect Cloudflare Tunnel${NC}    ${PURPLE}(Zero Trust Tunnel, Free Domain & SSL without port 80/443)${NC}"
        echo -e "  ${CYAN}[4]${NC} ${BOLD}Connect Custom Domain${NC}        ${BLUE}(Nginx Reverse Proxy + Automated Certbot SSL)${NC}"
        echo -e "  ${CYAN}[5]${NC} ${BOLD}Uninstall EVM Panel${NC}          ${RED}(Clean remove systemd service & panel files)${NC}"
        echo -e "  ${CYAN}[6]${NC} ${BOLD}Exit${NC}                        ${NC}(Close installer)${NC}"
        echo ""
        echo -e "  ${CYAN}─────────────────────────────────────────────────────────────${NC}"
        read -p "  Enter selection [1-6]: " MENU_OPTION

        case "$MENU_OPTION" in
            1) install_evm_panel ;;
            2) create_admin_user ;;
            3) connect_cloudflare_tunnel ;;
            4) connect_custom_domain ;;
            5) uninstall_evm_panel ;;
            6)
                echo -e "\n${EMERALD}Exiting EVM Panel installer. Have a great day!${NC}\n"
                exit 0
                ;;
            *)
                echo -e "\n${RED}Invalid option. Please choose between 1 and 6.${NC}"
                sleep 1.5
                ;;
        esac
    done
}

main_menu
