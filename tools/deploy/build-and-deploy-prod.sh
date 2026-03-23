#!/bin/bash

export ENV=prod && export NODE_ENV=production && npm run config-env && npm run build-vite && ./tools/deploy/deploy-prod.sh
