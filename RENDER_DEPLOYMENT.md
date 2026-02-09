# Render.com デプロイメントガイド

Render.comは最も簡単にNode.jsアプリケーションをデプロイできるサービスです。GitHubと連携して自動デプロイが可能で、無料プランも利用できます。

## 🎯 特徴

- ✅ **完全無料プランあり**（制限付き）
- ✅ GitHubから自動デプロイ
- ✅ SSL証明書が自動設定
- ✅ サーバー管理不要
- ✅ 5分でデプロイ完了

---

## 📋 前提条件

- GitHubアカウント
- Render.comアカウント（無料で作成可能）
- プロジェクトコードがGitHubにプッシュされていること

---

## 🚀 デプロイ手順

### ステップ1: GitHubにコードをプッシュ

まだGitHubにコードをプッシュしていない場合:

```bash
cd "c:\Users\hmiya\OneDrive\Desktop\トピックス作成"

# Gitリポジトリを初期化（まだの場合）
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit for Render deployment"

# GitHubリポジトリを作成後、リモートを追加
git remote add origin https://github.com/your-username/fx-news-generator.git

# プッシュ
git push -u origin main
```

---

### ステップ2: Render.comアカウント作成

1. [Render.com](https://render.com/) にアクセス
2. **Get Started for Free** をクリック
3. GitHubアカウントで登録（推奨）

---

### ステップ3: バックエンドのデプロイ

#### 3-1. 新しいWeb Serviceを作成

1. Renderダッシュボードで **New +** → **Web Service** をクリック
2. GitHubリポジトリを接続
3. リポジトリを選択

#### 3-2. サービス設定

以下の設定を入力:

| 項目 | 設定値 |
|------|--------|
| **Name** | `fx-news-backend` |
| **Region** | `Singapore` (日本に最も近い) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (または `Starter $7/month`) |

#### 3-3. 環境変数の設定

**Environment** セクションで以下を追加:

```
NODE_ENV=production
PORT=3001
NEWS_API_KEY=あなたのNewsAPIキー
GEMINI_API_KEY=あなたのGeminiAPIキー
ALPHA_VANTAGE_API_KEY=あなたのAlphaVantageAPIキー
FINNHUB_API_KEY=あなたのFinnhubAPIキー
```

#### 3-4. デプロイ実行

1. **Create Web Service** をクリック
2. 自動的にビルドとデプロイが開始されます
3. 数分待つとデプロイ完了

デプロイが完了すると、以下のようなURLが発行されます:
```
https://fx-news-backend.onrender.com
```

このURLをメモしておいてください。

---

### ステップ4: フロントエンドの設定更新

バックエンドのURLを使用するように、フロントエンドを更新します。

#### 4-1. 環境変数ファイルの作成

`frontend/.env.production` を作成:

```env
VITE_API_URL=https://fx-news-backend.onrender.com
```

#### 4-2. APIクライアントの更新

`frontend/src/App.jsx` または API呼び出し部分を更新:

```javascript
// 環境変数からAPIのベースURLを取得
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API呼び出し例
axios.get(`${API_BASE_URL}/api/health`)
```

---

### ステップ5: フロントエンドのデプロイ

#### 5-1. 新しいStatic Siteを作成

1. Renderダッシュボードで **New +** → **Static Site** をクリック
2. 同じGitHubリポジトリを選択

#### 5-2. サービス設定

| 項目 | 設定値 |
|------|--------|
| **Name** | `fx-news-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### 5-3. 環境変数の設定

```
VITE_API_URL=https://fx-news-backend.onrender.com
```

#### 5-4. デプロイ実行

1. **Create Static Site** をクリック
2. ビルドとデプロイが自動実行されます

デプロイが完了すると、以下のようなURLが発行されます:
```
https://fx-news-frontend.onrender.com
```

---

### ステップ6: CORS設定の更新

バックエンドの環境変数に、フロントエンドのURLを追加:

1. Renderダッシュボードでバックエンドサービスを開く
2. **Environment** タブを開く
3. 以下を追加:

```
ALLOWED_ORIGINS=https://fx-news-frontend.onrender.com
```

4. **Save Changes** をクリック
5. 自動的に再デプロイされます

---

## ✅ 動作確認

1. フロントエンドURL (`https://fx-news-frontend.onrender.com`) にアクセス
2. アプリケーションが表示されることを確認
3. ニュース取得、トピック生成などの機能をテスト

---

## 🔄 自動デプロイの設定

Render.comは、GitHubにプッシュすると自動的にデプロイされます。

```bash
# コードを修正後
git add .
git commit -m "Update feature"
git push origin main

# 自動的にRenderでビルド・デプロイが開始されます
```

---

## 💰 無料プランの制限

### 制限事項:
- **スリープ**: 15分間アクセスがないとスリープ状態になる
- **起動時間**: スリープから復帰に数秒〜30秒かかる
- **帯域幅**: 月100GBまで
- **ビルド時間**: 月500分まで

### 有料プラン ($7/月) にアップグレードすると:
- ✅ スリープなし（常時稼働）
- ✅ 専用CPU
- ✅ より高速な応答

---

## 🔧 トラブルシューティング

### ビルドが失敗する

**ログを確認:**
1. Renderダッシュボードでサービスを開く
2. **Logs** タブを確認
3. エラーメッセージを確認

**よくある原因:**
- `package.json` の設定ミス
- 環境変数の設定漏れ
- Node.jsバージョンの不一致

### アプリケーションが起動しない

**環境変数を確認:**
- すべてのAPIキーが設定されているか
- `PORT` が正しく設定されているか

### CORSエラーが発生する

**ALLOWED_ORIGINS を確認:**
```
ALLOWED_ORIGINS=https://fx-news-frontend.onrender.com
```

---

## 📊 監視とログ

### ログの確認

Renderダッシュボードの **Logs** タブで:
- リアルタイムログの確認
- エラーログの確認
- アクセスログの確認

### メトリクスの確認

**Metrics** タブで:
- CPU使用率
- メモリ使用率
- リクエスト数

---

## 🎉 完了!

これでRender.comへのデプロイが完了しました!

**次のステップ:**
- 独自ドメインの設定（オプション）
- 監視アラートの設定
- バックアップ戦略の検討

---

## 💡 ヒント

### 独自ドメインの設定

1. Renderダッシュボードで **Settings** → **Custom Domains**
2. ドメイン名を入力
3. DNSレコードを設定（Renderが指示を表示）

### 環境変数の管理

機密情報は必ず環境変数で管理し、Gitにコミットしないでください。

### コスト最適化

- 開発中は無料プラン
- 本番運用時は有料プラン ($7/月) を検討
