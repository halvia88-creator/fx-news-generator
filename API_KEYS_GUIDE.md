# APIキー取得ガイド

FX News Generatorを使用するには、以下の4つのAPIキーが必要です。

- **必須**: Gemini API (AI生成)
- **推奨**: NewsAPI, Alpha Vantage, Finnhub (ニュース・為替データ)

> **Note**: ニュースAPIは最低1つあれば動作しますが、複数設定することでより多くの情報を取得できます。

---

## 1. NewsAPI キーの取得

### 概要
NewsAPIは、世界中のニュースを取得できるAPIサービスです。FX・為替関連のニュースを取得するために使用します。

### 無料プランの制限
- **100リクエスト/日**
- **開発環境でのみ使用可能**（本番環境は有料プラン必要）
- **過去1ヶ月のニュースのみ**

### 取得手順

#### ステップ1: 公式サイトにアクセス
https://newsapi.org/ にアクセス

#### ステップ2: アカウント作成
1. 右上の **"Get API Key"** ボタンをクリック
2. 以下の情報を入力：
   - **First Name** (名前)
   - **Email** (メールアドレス)
   - **Password** (パスワード)
3. **"Submit"** をクリック

#### ステップ3: APIキーを取得
1. 登録完了後、ダッシュボードが表示されます
2. **API Key** セクションに文字列が表示されます（例: `a1b2c3d4e5f6g7h8i9j0...`）
3. このキーをコピーして保存してください

#### ステップ4: .envファイルに設定

```bash
# backend/.env
NEWS_API_KEY=ここにコピーしたAPIキーを貼り付け
```

---

## 2. Gemini API キーの取得

### 概要
Gemini APIは、GoogleのAI（Gemini）を利用できるAPIサービスです。トピックス生成とSNS投稿文の生成に使用します。

### 無料プランの制限
- **15リクエスト/分**
- **1,500リクエスト/日**
- **100万トークン/月**

### 取得手順

#### ステップ1: Google AI Studioにアクセス
https://aistudio.google.com/ にアクセス

#### ステップ2: Googleアカウントでサインイン
1. **"Sign in"** をクリック
2. Googleアカウントでログイン

#### ステップ3: APIキーを作成
1. 左メニューの **"Get API key"** をクリック
2. **"Create API key in new project"** をクリック
   - 既存のGoogle Cloud プロジェクトがある場合は、それを選択することも可能
3. APIキーが生成されます（例: `AIzaSyA...`）
4. **"Copy"** ボタンでキーをコピー

#### ステップ4: .envファイルに設定

```bash
# backend/.env
GEMINI_API_KEY=ここにコピーしたAPIキーを貼り付け
```

---

## 3. Alpha Vantage API キーの取得

### 概要
Alpha Vantageは、株式・為替・暗号通貨のデータとニュースセンチメント分析を提供するAPIサービスです。リアルタイムの為替レートとニュースセンチメントを取得します。

### 無料プランの制限
- **25リクエスト/日**
- **5リクエスト/分**
- リアルタイムデータ利用可能

### 取得手順

#### ステップ1: 公式サイトにアクセス
https://www.alphavantage.co/support/#api-key にアクセス

#### ステップ2: APIキーを取得
1. メールアドレスを入力
2. **「GET FREE API KEY」** ボタンをクリック
3. APIキーが即座に表示されます（例: `ABCDEFGH12345678`）
4. メールでも送信されます

#### ステップ3: .envファイルに設定

```bash
# backend/.env
ALPHA_VANTAGE_API_KEY=ここにコピーしたAPIキーを貼り付け
```

---

## 4. Finnhub API キーの取得

### 概要
Finnhubは、株式・為替・暗号通貨のリアルタイムデータとニュースを提供するAPIサービスです。高頻度のリクエストが可能で、最新の金融ニュースを取得します。

### 無料プランの制限
- **60リクエスト/分**
- リアルタイムデータ利用可能
- 制限が緩いため、メインのニュースソースとして推奨

### 取得手順

#### ステップ1: 公式サイトにアクセス
https://finnhub.io/ にアクセス

#### ステップ2: アカウント作成
1. 右上の **「Get free API key」** ボタンをクリック
2. 以下の情報を入力：
   - **Email** (メールアドレス)
   - **Name** (名前)
3. **「Sign up」** をクリック

#### ステップ3: APIキーを取得
1. ダッシュボードにログイン
2. APIキーが表示されます（例: `c123456789abcdef`）
3. このキーをコピーして保存

#### ステップ4: .envファイルに設定

```bash
# backend/.env
FINNHUB_API_KEY=ここにコピーしたAPIキーを貼り付け
```

---

## 5. 環境変数ファイルの完成形

`backend/.env` ファイルを以下のように設定します：

```bash
# NewsAPI Configuration
NEWS_API_KEY=あなたのNewsAPIキー

# Gemini API Configuration  
GEMINI_API_KEY=あなたのGeminiAPIキー

# Alpha Vantage API Configuration
ALPHA_VANTAGE_API_KEY=あなたのAlphaVantageAPIキー

# Finnhub API Configuration
FINNHUB_API_KEY=あなたのFinnhubAPIキー

# Server Configuration
PORT=3001
NODE_ENV=development
```

> **Note**: NewsAPI、Alpha Vantage、Finnhubは少なくとも1つ設定すれば動作します。複数設定することで、より多くのニュースを取得できます。

---

## 6. 動作確認

### バックエンドを起動

```bash
cd backend
npm start
```

以下のようなメッセージが表示されればOKです：

```
🚀 Server running on http://localhost:3001
📊 Environment: development
```

### ヘルスチェック

ブラウザまたはcurlで確認：

```bash
curl http://localhost:3001/api/health
```

レスポンス例：
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T05:00:00.000Z"
}
```

---

## 7. トラブルシューティング

### NewsAPIのエラー

#### エラー: `apiKeyInvalid`
→ APIキーが間違っています。ダッシュボードで確認してください。

#### エラー: `rateLimited`
→ 1日100リクエストの制限を超えました。翌日まで待つか、有料プランにアップグレードしてください。

#### エラー: `You cannot use the Free plan in production`
→ 無料プランは開発環境のみです。`NODE_ENV=development` に設定してください。

### Gemini APIのエラー

#### エラー: `API_KEY_INVALID`
→ APIキーが間違っているか、有効化されていません。Google AI Studioで確認してください。

#### エラー: `RESOURCE_EXHAUSTED`
→ レート制限（15リクエスト/分）を超えました。少し待ってから再試行してください。

#### エラー: `PERMISSION_DENIED`
→ APIキーのプロジェクトでGemini APIが有効化されていない可能性があります。

### Alpha Vantage APIのエラー

#### エラー: Rate limit reached
→ 25リクエスト/日の制限を超えました。翌日まで待つか、他のAPIを使用してください。

### Finnhub APIのエラー

#### エラー: 429 Too Many Requests
→ 60リクエスト/分の制限を超えました。少し待ってから再試行してください。

---

## 8. 料金について

### NewsAPI

| プラン | 料金 | リクエスト数 | 使用環境 |
|--------|------|--------------|----------|
| 無料 | $0 | 100/日 | 開発のみ |
| Developer | $449/月 | 50,000/日 | 本番可能 |

公式: https://newsapi.org/pricing

### Gemini API

| プラン | 料金 | 制限 |
|--------|------|------|
| 無料 | $0 | 15req/分、1,500req/日 |
| 従量課金 | $0.00025/1,000文字 | 制限なし |

公式: https://ai.google.dev/pricing

### Alpha Vantage

| プラン | 料金 | 制限 |
|--------|------|------|
| 無料 | $0 | 25req/日、5req/分 |
| Premium | $49.99/月 | 無制限 |

公式: https://www.alphavantage.co/premium/

### Finnhub

| プラン | 料金 | 制限 |
|--------|------|------|
| 無料 | $0 | 60req/分 |
| Starter | $19.99/月 | 300req/分 |

公式: https://finnhub.io/pricing

---

## 9. セキュリティ注意事項

⚠️ **APIキーは絶対に公開しないでください**

- Gitにコミットしない（`.gitignore` に `.env` を追加済み）
- GitHubやSNSに貼り付けない
- スクリーンショットに写さない
- 他人と共有しない

万が一漏洩した場合：
1. すぐにAPIキーを無効化
2. 新しいキーを発行
3. `.env` ファイルを更新

---

以上でAPIキーの取得は完了です！  
アプリケーションを起動して、FXニュース取得を試してみましょう 🚀
