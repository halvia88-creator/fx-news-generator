# FX News Generator

FXトレード情報自動取得 & SNS投稿文生成Webアプリケーション

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 概要

このアプリケーションは、FXトレーダーや投資系インフルエンサー向けに、最新のFX・為替情報を自動取得し、SNS投稿文を生成するツールです。

### 主な機能

✅ **ワンクリックでFXニュース取得** - 複数のAPIから最新の為替・FX情報を自動収集  
✅ **リアルタイム為替レート表示** - 主要通貨ペアの最新レート  
✅ **AIトピックス生成** - Gemini AIが注目トピックスを5件自動生成  
✅ **SNS投稿文作成** - X（旧Twitter）用の投稿文を5案自動生成  
✅ **コピー機能** - ワンクリックで投稿文をクリップボードにコピー  
✅ **プレミアムUI** - ダークモード、グラスモーフィズム、アニメーション対応

---

## 🏗 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **Vite** - ビルドツール
- **Vanilla CSS** - カスタムデザインシステム
- **Axios** - HTTPクライアント

### バックエンド
- **Node.js + Express** - APIサーバー
- **NewsAPI** - FX/為替ニュース取得
- **Alpha Vantage** - リアルタイム為替レート、ニュースセンチメント
- **Finnhub** - 金融ニュース、市場データ
- **Gemini AI** - トピックス・投稿文生成
- **CORS** - クロスオリジン対応

---

## 📋 前提条件

- **Node.js** v18以上
- **npm** または **yarn**
- **APIキー** (Gemini API必須、NewsAPI/Alpha Vantage/Finnhubから1つ以上推奨) - 取得方法は `API_KEYS_GUIDE.md` 参照

---

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <your-repository-url>
cd トピックス作成
```

### 2. バックエンドのセットアップ

```bash
cd backend
npm install

# 環境変数ファイルを作成
copy .env.example .env
```

`.env` ファイルを編集し、APIキーを設定：

```bash
NEWS_API_KEY=あなたのNewsAPIキー
GEMINI_API_KEY=あなたのGeminiAPIキー
ALPHA_VANTAGE_API_KEY=あなたのAlphaVantageAPIキー
FINNHUB_API_KEY=あなたのFinnhubAPIキー
PORT=3001
NODE_ENV=development
```

> **Note**: NewsAPI、Alpha Vantage、Finnhubは少なくとも1つ設定すれば動作します。

### 3. フロントエンドのセットアップ

```bash
cd ../frontend
npm install
```

---

## 💻 開発環境での起動

### バックエンド起動

```bash
cd backend
npm start
```

サーバーが `http://localhost:3001` で起動します。

### フロントエンド起動（別ターミナル）

```bash
cd frontend
npm run dev
```

アプリが `http://localhost:5173` で起動します。

---

## 🌐 本番環境へのデプロイ

### フロントエンドのビルド

```bash
cd frontend
npm run build
```

ビルド成果物は `frontend/dist` に生成されます。

### デプロイ手順（自前サーバー）

#### 1. Nginxのインストール

```bash
sudo apt update
sudo apt install nginx
```

#### 2. Nginxの設定

`/etc/nginx/sites-available/fx-news` を作成：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンド
    root /path/to/トピックス作成/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # バックエンドAPIプロキシ
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

シンボリックリンクを作成：

```bash
sudo ln -s /etc/nginx/sites-available/fx-news /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. バックエンドのプロセス管理（PM2）

```bash
# PM2をインストール
npm install -g pm2

# バックエンドを起動
cd backend
pm2 start server.js --name fx-news-backend

# 自動起動設定
pm2 startup
pm2 save
```

#### 4. 環境変数の設定

本番環境の `.env` ファイルを設定：

```bash
NODE_ENV=production
NEWS_API_KEY=本番用NewsAPIキー
GEMINI_API_KEY=本番用GeminiAPIキー
PORT=3001
```

---

## 📂 プロジェクト構造

```
トピックス作成/
├── backend/                    # バックエンドAPI
│   ├── controllers/           # APIコントローラー
│   │   ├── newsController.js      # NewsAPI統合
│   │   ├── topicsController.js    # トピックス生成
│   │   └── postsController.js     # 投稿文生成
│   ├── server.js              # Expressサーバー
│   ├── package.json           # 依存関係
│   ├── .env.example           # 環境変数テンプレート
│   └── .gitignore
│
├── frontend/                   # フロントエンド
│   ├── src/
│   │   ├── components/        # Reactコンポーネント
│   │   │   ├── Dashboard.jsx      # ダッシュボード
│   │   │   ├── TopicList.jsx      # トピックス一覧
│   │   │   └── PostGenerator.jsx  # 投稿文生成
│   │   ├── App.jsx            # メインアプリ
│   │   ├── main.jsx           # エントリーポイント
│   │   └── index.css          # グローバルスタイル
│   ├── index.html             # HTMLテンプレート
│   ├── vite.config.js         # Vite設定
│   └── package.json           # 依存関係
│
├── API_KEYS_GUIDE.md          # APIキー取得ガイド
└── README.md                  # このファイル
```

---

## 🔑 APIキーの取得

詳細は [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) を参照してください。

### NewsAPI
- URL: https://newsapi.org/
- 無料プラン: 100リクエスト/日

### Gemini API
- URL: https://aistudio.google.com/
- 無料プラン: 1,500リクエスト/日

### Alpha Vantage
- URL: https://www.alphavantage.co/
- 無料プラン: 25リクエスト/日

### Finnhub
- URL: https://finnhub.io/
- 無料プラン: 60リクエスト/分

---

## 🎨 デザインハイライト

- **ダークモードテーマ** - 長時間の作業でも目に優しい
- **グラスモーフィズム** - 洗練されたカードデザイン
- **グラデーション** - プレミアム感のある配色
- **マイクロアニメーション** - スムーズなUI/UX
- **レスポンシブ対応** - PC/タブレット対応

---

## 🐛 トラブルシューティング

### ポートが既に使用されている

```bash
# バックエンド（3001）が使用中の場合
lsof -ti:3001 | xargs kill -9

# フロントエンド（5173）が使用中の場合
lsof -ti:5173 | xargs kill -9
```

### APIエラーが発生する

1. `.env` ファイルのAPIキーが正しいか確認
2. NewsAPIの無料プランは開発環境のみ対応
3. Geminiのレート制限を確認（15リクエスト/分）
4. Alpha Vantageは25リクエスト/日の制限あり
5. 複数のAPIを設定することで、1つが失敗しても他のAPIでカバー可能

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 ライセンス

MIT License

---

## 🙏 謝辞

- [NewsAPI](https://newsapi.org/) - ニュースデータ提供
- [Alpha Vantage](https://www.alphavantage.co/) - 為替レート・センチメント分析
- [Finnhub](https://finnhub.io/) - 金融ニュース・市場データ
- [Google Gemini AI](https://ai.google.dev/) - AI生成API
- [React](https://react.dev/) - UIフレームワーク
- [Vite](https://vitejs.dev/) - 高速ビルドツール
