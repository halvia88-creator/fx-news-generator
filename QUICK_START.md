# クイックスタートガイド - VPSサーバーへのデプロイ

このガイドでは、最も簡単な方法でFX News Generatorをデプロイする手順を説明します。

## 🎯 推奨: Render.com（無料・最も簡単）

初めての方には**Render.com**を強く推奨します。完全無料で、5分でデプロイできます。

---

## 📋 必要なもの

1. **GitHubアカウント**（無料）
2. **Render.comアカウント**（無料）
3. **APIキー**（事前に取得）
   - NewsAPI
   - Google Gemini API
   - Alpha Vantage API
   - Finnhub API

---

## 🚀 5ステップでデプロイ

### ステップ1: GitHubにコードをアップロード（5分）

```bash
cd "c:\Users\hmiya\OneDrive\Desktop\トピックス作成"

# Gitリポジトリを初期化
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリを作成後
git remote add origin https://github.com/your-username/fx-news-generator.git
git push -u origin main
```

---

### ステップ2: Render.comアカウント作成（2分）

1. [Render.com](https://render.com/) にアクセス
2. **Get Started for Free** をクリック
3. GitHubアカウントで登録

---

### ステップ3: バックエンドをデプロイ（3分）

1. **New +** → **Web Service**
2. GitHubリポジトリを接続
3. 以下を設定:
   - **Name**: `fx-news-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Environment** で以下を追加:
   ```
   NODE_ENV=production
   PORT=3001
   NEWS_API_KEY=あなたのキー
   GEMINI_API_KEY=あなたのキー
   ALPHA_VANTAGE_API_KEY=あなたのキー
   FINNHUB_API_KEY=あなたのキー
   ```

5. **Create Web Service** をクリック

デプロイ完了後、URLをメモ（例: `https://fx-news-backend.onrender.com`）

---

### ステップ4: フロントエンドをデプロイ（3分）

1. **New +** → **Static Site**
2. 同じGitHubリポジトリを選択
3. 以下を設定:
   - **Name**: `fx-news-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment** で以下を追加:
   ```
   VITE_API_URL=https://fx-news-backend.onrender.com
   ```

5. **Create Static Site** をクリック

---

### ステップ5: CORS設定（1分）

1. バックエンドサービスの **Environment** を開く
2. 以下を追加:
   ```
   ALLOWED_ORIGINS=https://fx-news-frontend.onrender.com
   ```
3. **Save Changes**

---

## ✅ 完了!

フロントエンドのURL（例: `https://fx-news-frontend.onrender.com`）にアクセスして動作確認!

---

## 📚 詳細ガイド

より詳しい手順は以下を参照:

- **Render.com**: [RENDER_DEPLOYMENT.md](file:///c:/Users/hmiya/OneDrive/Desktop/トピックス作成/RENDER_DEPLOYMENT.md)
- **さくらのVPS**: [SAKURA_VPS_DEPLOYMENT.md](file:///c:/Users/hmiya/OneDrive/Desktop/トピックス作成/SAKURA_VPS_DEPLOYMENT.md)
- **ConoHa VPS**: [CONOHA_VPS_DEPLOYMENT.md](file:///c:/Users/hmiya/OneDrive/Desktop/トピックス作成/CONOHA_VPS_DEPLOYMENT.md)
- **AWS Lightsail**: [AWS_LIGHTSAIL_DEPLOYMENT.md](file:///c:/Users/hmiya/OneDrive/Desktop/トピックス作成/AWS_LIGHTSAIL_DEPLOYMENT.md)

---

## 🤔 他のサーバーを選びたい場合

[VPS_SELECTION_GUIDE.md](file:///c:/Users/hmiya/OneDrive/Desktop/トピックス作成/VPS_SELECTION_GUIDE.md) で各サービスの比較を確認できます。

---

## ❓ よくある質問

**Q: 無料プランの制限は?**
A: 15分間アクセスがないとスリープします。起動に数秒かかります。

**Q: スリープを解除したい**
A: 有料プラン($7/月)にアップグレードすると常時稼働します。

**Q: 独自ドメインは使える?**
A: はい、Render.comの設定で独自ドメインを追加できます。

**Q: データベースは必要?**
A: 現在のアプリでは不要です。
