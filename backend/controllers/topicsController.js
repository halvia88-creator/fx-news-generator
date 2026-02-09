import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Categorize articles into FX, US Stocks, Japanese Stocks, and Crypto
 */
function categorizeArticles(articles) {
    const categories = {
        fx: [],
        usStocks: [],
        jpStocks: [],
        crypto: []
    };

    articles.forEach(article => {
        const text = (article.title + ' ' + article.description).toLowerCase();

        // FX keywords
        if (text.match(/forex|fx|為替|ドル|円|ユーロ|ポンド|currency|usd|jpy|eur|gbp|chf|aud|cad|中央銀行|fed|ecb|boj|日銀|介入/i)) {
            categories.fx.push(article);
        }

        // US Stocks keywords
        if (text.match(/s&p|nasdaq|dow|us stock|米国株|apple|tesla|nvidia|microsoft|amazon|google|meta|fed|フェド|nyse|米株|wall street/i)) {
            categories.usStocks.push(article);
        }

        // Japanese Stocks keywords
        if (text.match(/日経|topix|日本株|tse|東証|トヨタ|ソニー|任天堂|三菱|日銀|boj|nikkei|japanese stock|japan stock/i)) {
            categories.jpStocks.push(article);
        }

        // Crypto keywords
        if (text.match(/bitcoin|ethereum|crypto|cryptocurrency|btc|eth|blockchain|仮想通貨|暗号資産|暗号通貨|binance|coinbase|defi|nft|altcoin/i)) {
            categories.crypto.push(article);
        }
    });

    return categories;
}

/**
 * Generate topics for a specific category
 */
async function generateTopicsForCategory(articles, category, genAI) {
    if (!articles || articles.length === 0) {
        return [];
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare news text (limit to avoid token limits)
    const newsText = articles
        .slice(0, 20)
        .map((article, idx) => `[${idx + 1}] ${article.title}\n${article.description}`)
        .join('\n\n');

    // Category-specific prompts
    const prompts = {
        fx: `あなたはFX・為替市場に詳しい金融メディア編集者です。
投資助言や売買推奨は行わず、事実と背景をわかりやすく要約してください。

以下のFX・為替関連ニュースから、今日の注目トピックスを5〜10件作成してください。

【重点項目】
・主要通貨ペアの動向（USD/JPY、EUR/USD等）
・中央銀行の政策（FRB、ECB、日銀等）
・為替介入の可能性
・経済指標の影響

【条件】
・各トピックは「title」と「summary」で構成
・titleは20〜30文字
・summaryは80〜120文字
・煽り表現、断定表現は禁止
・売買判断に直結する表現は禁止
・JSON形式で出力：[{"title": "...", "summary": "..."}]
・5〜10件のトピックスを生成（ニュースの量に応じて調整）

【ニュース本文】
${newsText}

JSON形式のみで回答してください。`,

        usStocks: `あなたは米国株式市場に詳しい金融メディア編集者です。
投資助言や売買推奨は行わず、事実と背景をわかりやすく要約してください。

以下の米国株関連ニュースから、今日の注目トピックスを5〜10件作成してください。

【重点項目】
・主要指数の動向（S&P500、NASDAQ、Dow）
・注目銘柄の業績・ニュース
・FRBの金融政策
・セクター別の動き

【条件】
・各トピックは「title」と「summary」で構成
・titleは20〜30文字
・summaryは80〜120文字
・煽り表現、断定表現は禁止
・売買判断に直結する表現は禁止
・JSON形式で出力：[{"title": "...", "summary": "..."}]
・5〜10件のトピックスを生成（ニュースの量に応じて調整）

【ニュース本文】
${newsText}

JSON形式のみで回答してください。`,

        jpStocks: `あなたは日本株式市場に詳しい金融メディア編集者です。
投資助言や売買推奨は行わず、事実と背景をわかりやすく要約してください。

以下の日本株関連ニュースから、今日の注目トピックスを5〜10件作成してください。

【重点項目】
・日経平均、TOPIXの動向
・主要銘柄のニュース
・日銀の金融政策
・為替の影響

【条件】
・各トピックは「title」と「summary」で構成
・titleは20〜30文字
・summaryは80〜120文字
・煽り表現、断定表現は禁止
・売買判断に直結する表現は禁止
・JSON形式で出力：[{"title": "...", "summary": "..."}]
・5〜10件のトピックスを生成（ニュースの量に応じて調整）

【ニュース本文】
${newsText}

JSON形式のみで回答してください。`,

        crypto: `あなたは仮想通貨市場に詳しい金融メディア編集者です。
投資助言や売買推奨は行わず、事実と背景をわかりやすく要約してください。

以下の仮想通貨関連ニュースから、今日の注目トピックスを5〜10件作成してください。

【重点項目】
・Bitcoin、Ethereumの価格動向
・規制・法律の変更
・主要取引所のニュース
・DeFi、NFT等のトレンド

【条件】
・各トピックは「title」と「summary」で構成
・titleは20〜30文字
・summaryは80〜120文字
・煽り表現、断定表現は禁止
・売買判断に直結する表現は禁止
・JSON形式で出力：[{"title": "...", "summary": "..."}]
・5〜10件のトピックスを生成（ニュースの量に応じて調整）

【ニュース本文】
${newsText}

JSON形式のみで回答してください。`
    };

    const prompt = prompts[category];
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Extract JSON from response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const topics = JSON.parse(text);
    return topics.slice(0, 10); // Max 10 topics per category
}

/**
 * Generate categorized topics from news articles
 */
export async function generateCategorizedTopics(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        const { articles } = req.body;

        if (!articles || articles.length === 0) {
            return res.status(400).json({
                error: 'No articles provided'
            });
        }

        console.log(`📊 Categorizing ${articles.length} articles...`);

        // Categorize articles
        const categorizedArticles = categorizeArticles(articles);

        console.log(`✅ Categorized: FX=${categorizedArticles.fx.length}, US Stocks=${categorizedArticles.usStocks.length}, JP Stocks=${categorizedArticles.jpStocks.length}, Crypto=${categorizedArticles.crypto.length}`);

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Generate topics for each category in parallel
        const [fxTopics, usStocksTopics, jpStocksTopics, cryptoTopics] = await Promise.all([
            generateTopicsForCategory(categorizedArticles.fx, 'fx', genAI),
            generateTopicsForCategory(categorizedArticles.usStocks, 'usStocks', genAI),
            generateTopicsForCategory(categorizedArticles.jpStocks, 'jpStocks', genAI),
            generateTopicsForCategory(categorizedArticles.crypto, 'crypto', genAI)
        ]);

        console.log(`✅ Generated topics: FX=${fxTopics.length}, US Stocks=${usStocksTopics.length}, JP Stocks=${jpStocksTopics.length}, Crypto=${cryptoTopics.length}`);

        res.json({
            success: true,
            topics: {
                fx: fxTopics,
                usStocks: usStocksTopics,
                jpStocks: jpStocksTopics,
                crypto: cryptoTopics
            },
            counts: {
                fx: fxTopics.length,
                usStocks: usStocksTopics.length,
                jpStocks: jpStocksTopics.length,
                crypto: cryptoTopics.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Gemini API Error (Categorized Topics):', error.message);
        res.status(500).json({
            error: 'Failed to generate categorized topics',
            message: error.message
        });
    }
}

/**
 * Legacy function - kept for backward compatibility
 * Generate FX topics from news articles using Gemini AI
 */
export async function generateTopics(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        const { articles } = req.body;

        if (!articles || articles.length === 0) {
            return res.status(400).json({
                error: 'No articles provided'
            });
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Prepare news text
        const newsText = articles
            .slice(0, 15) // Limit to 15 articles to avoid token limits
            .map((article, idx) =>
                `[${idx + 1}] ${article.title}\n${article.description}`
            )
            .join('\n\n');

        // System + User Prompt (as specified in requirements)
        const prompt = `あなたはFX・為替市場に詳しい金融メディア編集者です。
投資助言や売買推奨は行わず、事実と背景をわかりやすく要約してください。
初心者にも理解できる日本語を使ってください。

以下は本日取得したFX・為替関連ニュースです。
この情報をもとに、今日の注目トピックスを5件作成してください。

【条件】
・各トピックは「タイトル」と「要約」で構成
・タイトルは20〜25文字
・要約は80〜120文字
・煽り表現、断定表現は禁止
・売買判断に直結する表現は禁止
・JSON形式で出力：[{"title": "...", "summary": "..."}]

【ニュース本文】
${newsText}

JSON形式のみで回答してください。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Extract JSON from response (remove markdown code blocks if present)
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const topics = JSON.parse(text);

        res.json({
            success: true,
            topics: topics.slice(0, 5), // Ensure exactly 5 topics
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Gemini API Error (Topics):', error.message);
        res.status(500).json({
            error: 'Failed to generate topics',
            message: error.message
        });
    }
}
