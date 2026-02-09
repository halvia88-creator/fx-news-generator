# ConoHa VPS デプロイメントガイド

ConoHa VPSは、GMOインターネットが提供する高速・高性能なVPSサービスです。時間課金も可能で、管理画面が使いやすいのが特徴です。

## 🎯 特徴

- ✅ 高速SSD、高性能CPU
- ✅ 時間課金も可能（最低1時間〜）
- ✅ 管理画面が使いやすい
- ✅ テンプレート機能でNode.js環境を簡単構築
- ✅ 日本語サポート

---

## 📋 前提条件

- ConoHa VPSアカウント
- SSH接続可能な環境
- 基本的なLinuxコマンドの知識

---

## 🚀 デプロイ手順

### ステップ1: ConoHa VPS契約

1. [ConoHa VPS](https://www.conoha.jp/vps/) にアクセス
2. **今すぐお申し込み** をクリック
3. プランを選択（**512MBプラン 678円/月** を推奨）
4. リージョンは **東京** を選択
5. イメージタイプは **Ubuntu 22.04** を選択
6. 契約手続きを完了

---

### ステップ2: サーバーへのSSH接続

#### 2-1. 接続情報の確認

ConoHa管理画面で:
- IPアドレス
- rootパスワード

を確認します。

#### 2-2. SSH接続

Windows PowerShellで:

```bash
ssh root@your-server-ip
```

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

**Git経由:**

```bash
sudo apt install -y git
git clone https://github.com/your-username/fx-news-generator.git .
```

**SCP経由:**

ローカルPCで:

```powershell
scp -r "c:\Users\hmiya\OneDrive\Desktop\トピックス作成\*" fxnews@your-server-ip:/var/www/fx-news/
```

#### 7-3. 環境変数の設定

```bash
cd /var/www/fx-news/backend
cp .env.production .env
nano .env
```

APIキーを設定後、保存します。

#### 7-4. デプロイスクリプトの実行

```bash
cd /var/www/fx-news
chmod +x deploy.sh
./deploy.sh
```

---

### ステップ8: Nginx設定

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
pm2 monit           # モニタリング
```

### ログの確認

```bash
# アプリケーションログ
tail -f /var/www/fx-news/logs/backend-out.log

# Nginxログ
sudo tail -f /var/log/nginx/fx-news-access.log
```

---

## 💰 料金プラン

| プラン | メモリ | CPU | ストレージ | 月額料金 | 時間料金 |
|--------|--------|-----|-----------|---------|---------|
| 512MB | 512MB | 1コア | 30GB SSD | 678円 | 1.3円/時 |
| 1GB | 1GB | 2コア | 100GB SSD | 1,065円 | 2.2円/時 |
| 2GB | 2GB | 3コア | 100GB SSD | 2,033円 | 4.3円/時 |

---

## 🎉 完了!

ConoHa VPSへのデプロイが完了しました!

**次のステップ:**
- SSL証明書の設定
- 定期バックアップの設定
- 監視設定

---

## 📚 参考リンク

- [ConoHa VPS公式サイト](https://www.conoha.jp/vps/)
- [ConoHa VPSサポート](https://support.conoha.jp/)
