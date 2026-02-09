# デプロイメントチェックリスト

このチェックリストを使用して、デプロイメントの各ステップを確実に実行してください。

## 📦 事前準備

### ローカル環境での準備
- [ ] すべてのコードをGitリポジトリにコミット
- [ ] `backend/.env.production`に本番用APIキーを設定
- [ ] フロントエンドのビルドテスト: `cd frontend && npm run build`
- [ ] バックエンドの起動テスト: `cd backend && npm start`

### サーバーの準備
- [ ] VPS/クラウドサーバーの契約完了
- [ ] SSH接続の確認
- [ ] ドメイン名の取得(オプション)
- [ ] DNSレコードの設定(ドメイン使用時)

## 🔧 サーバーセットアップ

### 基本ソフトウェアのインストール
- [ ] システムの更新: `sudo apt update && sudo apt upgrade -y`
- [ ] Node.js v18以上のインストール
- [ ] PM2のインストール: `sudo npm install -g pm2`
- [ ] Nginxのインストール: `sudo apt install -y nginx`
- [ ] ファイアウォールの設定: `sudo ufw allow 'Nginx Full'`

### プロジェクトディレクトリの作成
- [ ] ディレクトリ作成: `sudo mkdir -p /var/www/fx-news`
- [ ] 権限設定: `sudo chown -R $USER:$USER /var/www/fx-news`

## 📤 ファイル転送

### Git経由(推奨)
- [ ] サーバーでGitリポジトリをクローン
- [ ] または、SCP/SFTPでファイル転送

### 転送後の確認
- [ ] すべてのファイルが転送されたことを確認
- [ ] `backend/.env.production`が存在することを確認
- [ ] `ecosystem.config.cjs`が存在することを確認
- [ ] `nginx.conf`が存在することを確認
- [ ] `deploy.sh`が存在することを確認

## 🔐 環境変数の設定

- [ ] `backend/.env.production`を編集
- [ ] NewsAPI キーを設定
- [ ] Gemini API キーを設定
- [ ] Alpha Vantage API キーを設定
- [ ] Finnhub API キーを設定
- [ ] ALLOWED_ORIGINS を設定(本番ドメイン)

## 🚀 デプロイメント実行

### 自動デプロイスクリプト
- [ ] スクリプトに実行権限を付与: `chmod +x deploy.sh`
- [ ] デプロイスクリプトを実行: `./deploy.sh`
- [ ] エラーがないことを確認

### Nginx設定
- [ ] `nginx.conf`を編集してドメイン名を設定
- [ ] 設定ファイルをコピー: `sudo cp nginx.conf /etc/nginx/sites-available/fx-news`
- [ ] シンボリックリンク作成: `sudo ln -s /etc/nginx/sites-available/fx-news /etc/nginx/sites-enabled/`
- [ ] デフォルト設定を無効化: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] 設定テスト: `sudo nginx -t`
- [ ] Nginx再起動: `sudo systemctl reload nginx`

## ✅ 動作確認

### 基本動作
- [ ] ブラウザで`http://your-server-ip/`にアクセス
- [ ] フロントエンドが表示される
- [ ] `http://your-server-ip/api/health`が応答する
- [ ] PM2でアプリケーションが起動中: `pm2 status`

### 機能テスト
- [ ] ニュース取得機能が動作する
- [ ] トピック生成機能が動作する
- [ ] SNS投稿生成機能が動作する
- [ ] コピー機能が動作する

## 🔒 SSL証明書の設定(推奨)

- [ ] Certbotのインストール: `sudo apt install -y certbot python3-certbot-nginx`
- [ ] SSL証明書の取得: `sudo certbot --nginx -d your-domain.com`
- [ ] HTTPSでアクセスできることを確認
- [ ] 自動更新のテスト: `sudo certbot renew --dry-run`

## 🔄 PM2の自動起動設定

- [ ] PM2スタートアップ設定: `pm2 startup`
- [ ] 表示されたコマンドを実行
- [ ] PM2設定を保存: `pm2 save`
- [ ] サーバー再起動後も自動起動することを確認

## 📊 監視とログ

### ログの確認
- [ ] アプリケーションログ: `pm2 logs fx-news-backend`
- [ ] Nginxアクセスログ: `sudo tail -f /var/log/nginx/fx-news-access.log`
- [ ] Nginxエラーログ: `sudo tail -f /var/log/nginx/fx-news-error.log`

### 監視設定(オプション)
- [ ] PM2モニタリング: `pm2 monit`
- [ ] 外部監視サービスの設定(UptimeRobot等)

## 🎉 デプロイメント完了!

すべてのチェック項目が完了したら、デプロイメントは成功です!

### 次のステップ
- 定期的なバックアップの設定
- セキュリティアップデートの適用
- パフォーマンスモニタリング
- ユーザーフィードバックの収集

---

## 📝 トラブルシューティング

問題が発生した場合は、`DEPLOYMENT.md`のトラブルシューティングセクションを参照してください。

### よくある問題
1. **アプリケーションが起動しない** → PM2ログを確認
2. **APIが応答しない** → ファイアウォール設定を確認
3. **Nginxエラー** → 設定ファイルの構文を確認
4. **SSL証明書エラー** → ドメインのDNS設定を確認
