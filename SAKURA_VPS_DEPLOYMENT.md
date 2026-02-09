# さくらのVPS デプロイメントガイド

さくらのVPSは、日本企業が提供する信頼性の高いVPSサービスです。日本語サポートが充実しており、月額590円から利用できます。

## 🎯 特徴

- ✅ 日本語サポート充実
- ✅ 月額590円〜と低価格
- ✅ 2週間の無料お試し期間
- ✅ 東京・大阪のデータセンター
- ✅ 安定した国内サーバー

---

## 📋 前提条件

- さくらのVPSアカウント
- SSH接続可能な環境
- 基本的なLinuxコマンドの知識

---

## 🚀 デプロイ手順

### ステップ1: さくらのVPS契約

1. [さくらのVPS](https://vps.sakura.ad.jp/) にアクセス
2. **2週間無料お試し** をクリック
3. プランを選択（**512MBプラン 590円/月** を推奨）
4. OSは **Ubuntu 22.04** を選択
5. 契約手続きを完了

---

### ステップ2: サーバーへのSSH接続

#### 2-1. 接続情報の確認

さくらのVPSコントロールパネルで:
- IPアドレス
- rootパスワード

を確認します。

#### 2-2. SSH接続

Windows PowerShellまたはコマンドプロンプトで:

```bash
ssh root@your-server-ip
```

初回接続時は `yes` を入力してフィンガープリントを承認します。

---

### ステップ3: サーバーの初期設定

#### 3-1. システムの更新

```bash
apt update
apt upgrade -y
```

#### 3-2. 作業用ユーザーの作成

```bash
# 新しいユーザーを作成
adduser fxnews

# sudo権限を付与
usermod -aG sudo fxnews

# ユーザーを切り替え
su - fxnews
```

---

### ステップ4: Node.jsのインストール

```bash
# Node.js 18.x をインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# バージョン確認
node --version  # v18.x以上
npm --version   # v9.x以上
```

---

### ステップ5: PM2のインストール

```bash
sudo npm install -g pm2

# PM2を自動起動に設定
pm2 startup
# 表示されたコマンドをコピーして実行
```

---

### ステップ6: Nginxのインストール

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

### ステップ7: アプリケーションのデプロイ

#### 7-1. プロジェクトディレクトリの作成

```bash
sudo mkdir -p /var/www/fx-news
sudo chown -R $USER:$USER /var/www/fx-news
cd /var/www/fx-news
```

#### 7-2. ファイルの転送

**方法A: Git経由（推奨）**

```bash
# Gitをインストール
sudo apt install -y git

# リポジトリをクローン
git clone https://github.com/your-username/fx-news-generator.git .
```

**方法B: SCP経由**

ローカルPCのPowerShellで:

```powershell
scp -r "c:\Users\hmiya\OneDrive\Desktop\トピックス作成\*" fxnews@your-server-ip:/var/www/fx-news/
```

#### 7-3. 環境変数の設定

```bash
cd /var/www/fx-news/backend
cp .env.production .env
nano .env
```

`.env` ファイルを編集:

```env
PORT=3001
NODE_ENV=production

NEWS_API_KEY=あなたのNewsAPIキー
GEMINI_API_KEY=あなたのGeminiAPIキー
ALPHA_VANTAGE_API_KEY=あなたのAlphaVantageAPIキー
FINNHUB_API_KEY=あなたのFinnhubAPIキー

ALLOWED_ORIGINS=http://your-server-ip,https://your-domain.com
```

保存: `Ctrl + O` → `Enter` → `Ctrl + X`

#### 7-4. デプロイスクリプトの実行

```bash
cd /var/www/fx-news
chmod +x deploy.sh
./deploy.sh
```

このスクリプトが自動的に:
- 依存関係のインストール
- フロントエンドのビルド
- PM2でバックエンドを起動

を実行します。

---

### ステップ8: Nginx設定

#### 8-1. 設定ファイルの編集

```bash
sudo nano /var/www/fx-news/nginx.conf
```

`server_name` を編集:

```nginx
server_name your-server-ip;  # または your-domain.com
```

#### 8-2. Nginxに設定を適用

```bash
# 設定ファイルをコピー
sudo cp /var/www/fx-news/nginx.conf /etc/nginx/sites-available/fx-news

# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/fx-news /etc/nginx/sites-enabled/

# デフォルト設定を無効化
sudo rm /etc/nginx/sites-enabled/default

# 設定をテスト
sudo nginx -t

# Nginxを再起動
sudo systemctl reload nginx
```

---

## ✅ 動作確認

ブラウザで以下にアクセス:

```
http://your-server-ip/
http://your-server-ip/api/health
```

アプリケーションが表示されれば成功です!

---

## 🔒 SSL証明書の設定（推奨）

### ドメイン名がある場合

```bash
# Certbotのインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動更新のテスト
sudo certbot renew --dry-run
```

---

## 🔄 アプリケーションの更新

```bash
cd /var/www/fx-news

# 最新コードを取得（Git使用時）
git pull origin main

# デプロイスクリプトを実行
./deploy.sh
```

---

## 📊 運用管理

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

---

## 🔧 トラブルシューティング

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

### ファイアウォールの確認

```bash
# ファイアウォール状態確認
sudo ufw status

# ポート80/443を開放
sudo ufw allow 'Nginx Full'
```

---

## 💰 料金プラン

| プラン | メモリ | CPU | ストレージ | 月額料金 |
|--------|--------|-----|-----------|---------|
| 512MB | 512MB | 1コア | 25GB SSD | 590円 |
| 1GB | 1GB | 2コア | 50GB SSD | 807円 |
| 2GB | 2GB | 3コア | 100GB SSD | 1,594円 |

---

## 🎉 完了!

さくらのVPSへのデプロイが完了しました!

**次のステップ:**
- SSL証明書の設定
- 定期バックアップの設定
- 監視設定

---

## 📚 参考リンク

- [さくらのVPS公式ドキュメント](https://manual.sakura.ad.jp/vps/)
- [さくらのVPSサポート](https://www.sakura.ad.jp/support/)
