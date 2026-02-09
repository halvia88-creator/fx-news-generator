# Render.com デプロイ チェックリスト

このチェックリストに従って、順番に作業を進めてください。

---

## ✅ 事前準備

- [ ] APIキーを手元に準備
  - [ ] NewsAPI キー
  - [ ] Google Gemini API キー  
  - [ ] Alpha Vantage API キー
  - [ ] Finnhub API キー

---

## 📝 ステップ1: GitHubアカウント作成（5分）

- [ ] https://github.com/ にアクセス
- [ ] 「Sign up」をクリック
- [ ] メールアドレス、パスワード、ユーザー名を入力
- [ ] メール認証を完了
- [ ] GitHubにログイン成功

---

## 📤 ステップ2: GitHubにコードをアップロード（10分）

### 2-1. リポジトリ作成
- [ ] GitHub右上の「+」→「New repository」
- [ ] Repository name: `fx-news-generator`
- [ ] 「Public」を選択
- [ ] 「Create repository」をクリック
- [ ] リポジトリURLをコピー

### 2-2. コードをプッシュ

PowerShellで以下を実行:

```powershell
cd "c:\Users\hmiya\OneDrive\Desktop\トピックス作成"
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin https://github.com/your-username/fx-news-generator.git
git push -u origin main
```

- [ ] コマンド実行完了
- [ ] GitHubでファイルが表示されることを確認

---

## 🌐 ステップ3: Render.comアカウント作成（3分）

- [ ] https://render.com/ にアクセス
- [ ] 「Get Started for Free」をクリック
- [ ] 「Sign up with GitHub」を選択
- [ ] GitHubへのアクセスを許可
- [ ] Renderダッシュボードが表示される

---

## 🔧 ステップ4: バックエンドをデプロイ（5分）

### 4-1. Web Service作成
- [ ] 「New +」→「Web Service」
- [ ] GitHubリポジトリを接続
- [ ] `fx-news-generator`を選択

### 4-2. 設定入力
- [ ] Name: `fx-news-backend`
- [ ] Region: `Singapore`
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Instance Type: `Free`

### 4-3. 環境変数設定

以下を1つずつ追加:
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `NEWS_API_KEY=あなたのキー`
- [ ] `GEMINI_API_KEY=あなたのキー`
- [ ] `ALPHA_VANTAGE_API_KEY=あなたのキー`
- [ ] `FINNHUB_API_KEY=あなたのキー`

### 4-4. デプロイ
- [ ] 「Create Web Service」をクリック
- [ ] ステータスが「Live」になるまで待つ
- [ ] URLをコピー（例: `https://fx-news-backend.onrender.com`）
- [ ] `https://あなたのURL/api/health` にアクセスして動作確認

---

## 🎨 ステップ5: フロントエンドの環境変数更新（3分）

- [ ] `frontend/.env.production`ファイルを開く
- [ ] `VITE_API_URL=`の後に、バックエンドのURLを記入
- [ ] 保存

### GitHubにプッシュ

```powershell
cd "c:\Users\hmiya\OneDrive\Desktop\トピックス作成"
git add .
git commit -m "Update API URL for production"
git push origin main
```

- [ ] プッシュ完了

---

## 🖼️ ステップ6: フロントエンドをデプロイ（5分）

### 6-1. Static Site作成
- [ ] 「New +」→「Static Site」
- [ ] 同じリポジトリ`fx-news-generator`を選択

### 6-2. 設定入力
- [ ] Name: `fx-news-frontend`
- [ ] Branch: `main`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### 6-3. 環境変数設定
- [ ] `VITE_API_URL=https://あなたのバックエンドURL`

### 6-4. デプロイ
- [ ] 「Create Static Site」をクリック
- [ ] ステータスが「Live」になるまで待つ
- [ ] URLをコピー（例: `https://fx-news-frontend.onrender.com`）

---

## 🔗 ステップ7: CORS設定（2分）

- [ ] Renderダッシュボードで「fx-news-backend」を開く
- [ ] 左メニュー「Environment」をクリック
- [ ] 「Add Environment Variable」をクリック
- [ ] `ALLOWED_ORIGINS=https://あなたのフロントエンドURL`
- [ ] 「Save Changes」をクリック
- [ ] 再デプロイ完了を待つ

---

## ✅ ステップ8: 動作確認（5分）

- [ ] フロントエンドURL（`https://fx-news-frontend.onrender.com`）にアクセス
- [ ] 「ニュース取得」ボタンをクリック
- [ ] ニュースが表示される
- [ ] トピックが生成される
- [ ] トピックを選択して「SNS投稿生成」をクリック
- [ ] 投稿文が生成される
- [ ] 「コピー」ボタンが動作する

---

## 🎉 完了！

すべてのチェックが完了したら、デプロイ成功です！

**デプロイされたURL:**
- フロントエンド: `https://fx-news-frontend.onrender.com`
- バックエンド: `https://fx-news-backend.onrender.com`

---

## ⚠️ トラブルシューティング

### ビルドエラーが出る
→ Renderの「Logs」タブでエラーメッセージを確認

### アプリが動かない
→ 環境変数がすべて設定されているか確認

### CORSエラーが出る
→ `ALLOWED_ORIGINS`が正しく設定されているか確認

### 詳細な手順が必要な場合
→ `render_step_by_step.md`を参照
