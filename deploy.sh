#!/bin/bash

# FX News Generator デプロイメントスクリプト
# このスクリプトは本番サーバー上で実行してください

set -e  # エラーが発生したら停止

echo "🚀 FX News Generator デプロイメント開始..."

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# プロジェクトディレクトリ
PROJECT_DIR="/var/www/fx-news"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# 1. 依存関係のインストール
echo -e "${YELLOW}📦 依存関係をインストール中...${NC}"

cd "$BACKEND_DIR"
npm ci --production
echo -e "${GREEN}✓ バックエンドの依存関係インストール完了${NC}"

cd "$FRONTEND_DIR"
npm ci
echo -e "${GREEN}✓ フロントエンドの依存関係インストール完了${NC}"

# 2. フロントエンドのビルド
echo -e "${YELLOW}🔨 フロントエンドをビルド中...${NC}"
cd "$FRONTEND_DIR"
npm run build
echo -e "${GREEN}✓ フロントエンドビルド完了${NC}"

# 3. 環境変数の確認
echo -e "${YELLOW}🔍 環境変数を確認中...${NC}"
if [ ! -f "$BACKEND_DIR/.env.production" ]; then
    echo -e "${RED}❌ エラー: .env.production ファイルが見つかりません${NC}"
    echo "backend/.env.production ファイルを作成し、APIキーを設定してください"
    exit 1
fi

# .env.production を .env にコピー
cp "$BACKEND_DIR/.env.production" "$BACKEND_DIR/.env"
echo -e "${GREEN}✓ 環境変数設定完了${NC}"

# 4. ログディレクトリの作成
echo -e "${YELLOW}📁 ログディレクトリを作成中...${NC}"
mkdir -p "$PROJECT_DIR/logs"
echo -e "${GREEN}✓ ログディレクトリ作成完了${NC}"

# 5. PM2でアプリケーションを起動/再起動
echo -e "${YELLOW}🔄 アプリケーションを起動中...${NC}"
cd "$PROJECT_DIR"

# PM2がインストールされているか確認
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2がインストールされていません${NC}"
    echo "以下のコマンドでインストールしてください:"
    echo "npm install -g pm2"
    exit 1
fi

# PM2でアプリケーションを起動
pm2 delete fx-news-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
echo -e "${GREEN}✓ アプリケーション起動完了${NC}"

# 6. Nginxの設定確認と再起動
echo -e "${YELLOW}🌐 Nginxを設定中...${NC}"

if command -v nginx &> /dev/null; then
    # Nginx設定のテスト
    sudo nginx -t
    
    # Nginxを再起動
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx再起動完了${NC}"
else
    echo -e "${YELLOW}⚠ Nginxがインストールされていません。手動で設定してください${NC}"
fi

# 7. デプロイメント完了
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ デプロイメント完了!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 アプリケーション状態を確認:"
pm2 status
echo ""
echo "📝 ログを確認するには:"
echo "  pm2 logs fx-news-backend"
echo ""
echo "🔄 アプリケーションを再起動するには:"
echo "  pm2 restart fx-news-backend"
echo ""
echo "🛑 アプリケーションを停止するには:"
echo "  pm2 stop fx-news-backend"
echo ""
