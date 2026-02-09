# FX News Generator - デプロイメントガイド

このガイドでは、FX News Generatorアプリケーションを本番Webサーバーにデプロイする手順を説明します。

## 📋 目次

1. [必要な環境](#必要な環境)
2. [事前準備](#事前準備)
3. [サーバーセットアップ](#サーバーセットアップ)
4. [アプリケーションのデプロイ](#アプリケーションのデプロイ)
5. [SSL証明書の設定](#ssl証明書の設定)
6. [トラブルシューティング](#トラブルシューティング)

---

## 必要な環境

### サーバー要件
- **OS**: Ubuntu 20.04 LTS以上 (または同等のLinuxディストリビューション)
- **CPU**: 1コア以上
- **メモリ**: 1GB以上 (2GB推奨)
- **ストレージ**: 10GB以上の空き容量
- **ネットワーク**: 固定IPアドレスまたはドメイン名

### ソフトウェア要件
- **Node.js**: v18.x以上
- **npm**: v9.x以上
- **PM2**: プロセスマネージャー
- **Nginx**: Webサーバー/リバースプロキシ
- **Git**: バージョン管理 (推奨)

### 必要なAPIキー
以下のAPIキーを事前に取得してください:
- [NewsAPI](https://newsapi.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Alpha Vantage API](https://www.alphavantage.co/)
- [Finnhub API](https://finnhub.io/)

---

## 事前準備

### 1. サーバーの準備

VPSまたはクラウドサーバーを契約します。推奨サービス:
- AWS EC2
- Google Cloud Platform (GCP)
- Microsoft Azure
- さくらのVPS
- ConoHa VPS

### 2. SSH接続の設定

サーバーにSSH接続できることを確認してください:

```bash
ssh username@your-server-ip
```

---

## サーバーセットアップ

### 1. システムの更新

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Node.jsのインストール

```bash
# Node.js 18.x をインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# バージョン確認
node --version  # v18.x以上
npm --version   # v9.x以上
```

### 3. PM2のインストール

```bash
sudo npm install -g pm2

# PM2を自動起動に設定
pm2 startup
# 表示されたコマンドを実行してください
```

### 4. Nginxのインストール

```bash
sudo apt install -y nginx

# Nginxを起動
sudo systemctl start nginx
sudo systemctl enable nginx

# ファイアウォール設定
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## アプリケーションのデプロイ

### 1. プロジェクトディレクトリの作成

```bash
sudo mkdir -p /var/www/fx-news
sudo chown -R $USER:$USER /var/www/fx-news
```

### 2. アプリケーションファイルの転送

#### 方法A: Git経由 (推奨)

```bash
cd /var/www/fx-news
git clone <your-repository-url> .
```

#### 方法B: SCP経由

ローカルPCから:

```bash
scp -r "c:\Users\hmiya\OneDrive\Desktop\トピックス作成\*" username@your-server-ip:/var/www/fx-news/
```

### 3. 環境変数の設定

```bash
cd /var/www/fx-news/backend
cp .env.production .env
nano .env
```

`.env`ファイルを編集し、実際のAPIキーを設定:

```env
PORT=3001
NODE_ENV=production

NEWS_API_KEY=あなたのNewsAPIキー
GEMINI_API_KEY=あなたのGeminiAPIキー
ALPHA_VANTAGE_API_KEY=あなたのAlphaVantageAPIキー
FINNHUB_API_KEY=あなたのFinnhubAPIキー
```

### 4. デプロイスクリプトの実行

```bash
cd /var/www/fx-news
chmod +x deploy.sh
./deploy.sh
```

このスクリプトは以下を自動的に実行します:
- 依存関係のインストール
- フロントエンドのビルド
- PM2でバックエンドを起動
- Nginxの再起動

### 5. Nginx設定

```bash
# 設定ファイルをコピー
sudo cp /var/www/fx-news/nginx.conf /etc/nginx/sites-available/fx-news

# nginx.confを編集してドメイン名を設定
sudo nano /etc/nginx/sites-available/fx-news
# server_name を your-domain.com に変更

# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/fx-news /etc/nginx/sites-enabled/

# デフォルト設定を無効化
sudo rm /etc/nginx/sites-enabled/default

# 設定をテスト
sudo nginx -t

# Nginxを再起動
sudo systemctl reload nginx
```

### 6. 動作確認

ブラウザで以下にアクセス:

```
http://your-server-ip/
http://your-server-ip/api/health
```

正常に動作していれば、アプリケーションが表示されます。

---

## SSL証明書の設定

### Let's Encryptを使用した無料SSL証明書

```bash
# Certbotのインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書の取得と自動設定
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動更新のテスト
sudo certbot renew --dry-run
```

Certbotが自動的にNginx設定を更新し、HTTPSを有効化します。

---

## 運用管理

### PM2コマンド

```bash
# アプリケーション状態確認
pm2 status

# ログ確認
pm2 logs fx-news-backend

# 再起動
pm2 restart fx-news-backend

# 停止
pm2 stop fx-news-backend

# 起動
pm2 start fx-news-backend
```

### ログの確認

```bash
# アプリケーションログ
tail -f /var/www/fx-news/logs/backend-out.log
tail -f /var/www/fx-news/logs/backend-error.log

# Nginxログ
sudo tail -f /var/log/nginx/fx-news-access.log
sudo tail -f /var/log/nginx/fx-news-error.log
```

### アプリケーションの更新

```bash
cd /var/www/fx-news

# 最新コードを取得 (Git使用時)
git pull origin main

# デプロイスクリプトを実行
./deploy.sh
```

---

## トラブルシューティング

### アプリケーションが起動しない

```bash
# PM2ログを確認
pm2 logs fx-news-backend

# 環境変数を確認
cat /var/www/fx-news/backend/.env

# ポートが使用中か確認
sudo netstat -tulpn | grep 3001
```

### Nginxエラー

```bash
# Nginx設定をテスト
sudo nginx -t

# Nginxエラーログを確認
sudo tail -f /var/log/nginx/error.log
```

### APIが動作しない

1. バックエンドが起動しているか確認: `pm2 status`
2. ファイアウォール設定を確認: `sudo ufw status`
3. APIキーが正しく設定されているか確認: `cat /var/www/fx-news/backend/.env`

### メモリ不足

```bash
# メモリ使用状況確認
free -h

# PM2のメモリ制限を調整
# ecosystem.config.cjs の max_memory_restart を変更
```

---

## セキュリティのベストプラクティス

1. **環境変数の保護**
   - `.env`ファイルのパーミッションを制限: `chmod 600 /var/www/fx-news/backend/.env`

2. **定期的なアップデート**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update
   ```

3. **ファイアウォール設定**
   - 必要なポートのみ開放 (80, 443, SSH)

4. **SSH設定の強化**
   - パスワード認証を無効化
   - 公開鍵認証のみ使用

5. **バックアップ**
   - データベース (使用している場合)
   - `.env`ファイル
   - アプリケーションコード

---

## サポート

問題が発生した場合は、以下を確認してください:

1. PM2ログ: `pm2 logs`
2. Nginxログ: `sudo tail -f /var/log/nginx/error.log`
3. システムログ: `sudo journalctl -xe`

---

## まとめ

このガイドに従うことで、FX News Generatorアプリケーションを本番環境にデプロイできます。

**デプロイ後のチェックリスト:**
- ✅ アプリケーションが起動している
- ✅ HTTPSが有効化されている
- ✅ すべてのAPI機能が動作している
- ✅ PM2が自動起動に設定されている
- ✅ ログが正常に記録されている

ご不明な点がございましたら、お気軽にお問い合わせください。
