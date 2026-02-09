# AWS Lightsail デプロイメントガイド

AWS Lightsailは、Amazon Web Servicesが提供するシンプルなVPSサービスです。AWSの信頼性とスケーラビリティを手軽に利用できます。

## 🎯 特徴

- ✅ AWSの信頼性とスケーラビリティ
- ✅ 初月無料
- ✅ グローバル展開が容易
- ✅ AWSエコシステムとの統合
- ⚠️ 設定がやや複雑

---

## 📋 前提条件

- AWSアカウント
- クレジットカード
- SSH接続可能な環境

---

## 🚀 デプロイ手順

### ステップ1: AWS Lightsailインスタンス作成

1. [AWS Lightsail](https://lightsail.aws.amazon.com/) にアクセス
2. **Create instance** をクリック
3. リージョンは **Tokyo (ap-northeast-1)** を選択
4. プラットフォームは **Linux/Unix** を選択
5. ブループリントは **OS Only** → **Ubuntu 22.04 LTS** を選択
6. インスタンスプランは **$3.50/月** を選択
7. インスタンス名を入力（例: `fx-news-server`）
8. **Create instance** をクリック

---

### ステップ2: SSH接続の設定

#### 2-1. ブラウザからSSH接続

Lightsail管理画面で:
1. インスタンスをクリック
2. **Connect using SSH** をクリック

#### 2-2. SSHキーをダウンロード（オプション）

ローカルPCから接続する場合:
1. **Account** → **SSH keys** でキーをダウンロード
2. PowerShellで接続:

```bash
ssh -i path/to/LightsailDefaultKey.pem ubuntu@your-server-ip
```

---

### ステップ3: サーバーの初期設定

```bash
# システムの更新
sudo apt update
sudo apt upgrade -y
```

---

### ステップ4: Node.jsのインストール

```bash
# Node.js 18.x をインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# バージョン確認
node --version
npm --version
```

---

### ステップ5: PM2のインストール

```bash
sudo npm install -g pm2

# PM2を自動起動に設定
pm2 startup
# 表示されたコマンドを実行
```

---

### ステップ6: Nginxのインストール

```bash
sudo apt install -y nginx

# Nginxを起動
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### ステップ7: ファイアウォール設定

Lightsail管理画面で:
1. インスタンスの **Networking** タブを開く
2. **Add rule** をクリック
3. 以下のルールを追加:
   - HTTP (ポート 80)
   - HTTPS (ポート 443)

---

### ステップ8: アプリケーションのデプロイ

#### 8-1. プロジェクトディレクトリの作成

```bash
sudo mkdir -p /var/www/fx-news
sudo chown -R ubuntu:ubuntu /var/www/fx-news
cd /var/www/fx-news
```

#### 8-2. ファイルの転送

**Git経由:**

```bash
sudo apt install -y git
git clone https://github.com/your-username/fx-news-generator.git .
```

**SCP経由:**

ローカルPCで:

```powershell
scp -i path/to/LightsailDefaultKey.pem -r "c:\Users\hmiya\OneDrive\Desktop\トピックス作成\*" ubuntu@your-server-ip:/var/www/fx-news/
```

#### 8-3. 環境変数の設定

```bash
cd /var/www/fx-news/backend
cp .env.production .env
nano .env
```

APIキーを設定します。

#### 8-4. デプロイスクリプトの実行

```bash
cd /var/www/fx-news
chmod +x deploy.sh
./deploy.sh
```

---

### ステップ9: Nginx設定

```bash
# 設定ファイルを編集
sudo nano /var/www/fx-news/nginx.conf
# server_name を your-server-ip に変更

# 設定を適用
sudo cp /var/www/fx-news/nginx.conf /etc/nginx/sites-available/fx-news
sudo ln -s /etc/nginx/sites-available/fx-news /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 設定テストと再起動
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ 動作確認

ブラウザで `http://your-server-ip/` にアクセスして動作確認します。

---

## 🔒 SSL証明書の設定

### 静的IPアドレスの割り当て

1. Lightsail管理画面で **Networking** タブを開く
2. **Create static IP** をクリック
3. インスタンスにアタッチ

### SSL証明書の取得

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

---

## 📊 運用管理

### PM2コマンド

```bash
pm2 status          # 状態確認
pm2 logs            # ログ確認
pm2 restart all     # 再起動
```

### スナップショット（バックアップ）

Lightsail管理画面で:
1. **Snapshots** タブを開く
2. **Create snapshot** をクリック

---

## 💰 料金プラン

| プラン | メモリ | CPU | ストレージ | 転送量 | 月額料金 |
|--------|--------|-----|-----------|--------|---------|
| $3.50 | 512MB | 1コア | 20GB SSD | 1TB | $3.50 |
| $5 | 1GB | 1コア | 40GB SSD | 2TB | $5 |
| $10 | 2GB | 1コア | 60GB SSD | 3TB | $10 |

**初月無料**（最初の1ヶ月）

---

## 🎉 完了!

AWS Lightsailへのデプロイが完了しました!

**次のステップ:**
- 静的IPアドレスの割り当て
- SSL証明書の設定
- スナップショット（バックアップ）の設定

---

## 📚 参考リンク

- [AWS Lightsail公式サイト](https://aws.amazon.com/lightsail/)
- [AWS Lightsailドキュメント](https://lightsail.aws.amazon.com/ls/docs/)
