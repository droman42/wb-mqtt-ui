#!/bin/bash
set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building Device Testing UI application...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed.${NC}"
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build application
echo -e "${YELLOW}Building production bundle...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Build successful!${NC}"
  echo -e "The production files are available in the ${YELLOW}dist/${NC} directory."
  echo -e "To serve the files, you can use any HTTP server, for example:"
  echo -e "  ${YELLOW}npx serve -s dist${NC}"
else
  echo -e "${RED}Build failed.${NC}"
  exit 1
fi 