import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Search for real-time FX news using Gemini's grounding feature
 * This uses Google Search to find the latest news articles
 */
export async function searchRealtimeNews(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        console.log('🔍 Searching for real-time FX news with Gemini grounding...');

        const genAI = new GoogleGenerativeAI(API_KEY);

        // Use Gemini 1.5 Flash with Google Search grounding
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{
                googleSearch: {}
            }]
        });

        const prompt = `あなたは金融ニュースアナリストです。
Google検索を使用して、**本日（過去24時間以内）**の最新FX・為替市場ニュースを検索し、
以下のJSON形式で返してください：

[
  {
    "title": "ニュースタイトル",
    "description": "要約（100文字程度）",
    "url": "ソースURL",
    "publishedAt": "公開日時（ISO 8601形式、例: 2024-02-09T10:30:00Z）",
    "source": "ニュースソース名"
  }
]

【検索条件】
- 過去24時間以内のニュース
- FX、為替、通貨、中央銀行、ドル円、ユーロドル、ポンドなどに関連
- 信頼できるニュースソース（Bloomberg, Reuters, 日経新聞, ロイター等）
- 日本語と英語の両方
- 最大15件

【重要】
- 必ずGoogle検索を使用して最新情報を取得してください
- 古いニュースは含めないでください
- URLは実在するものを使用してください
- publishedAtは必ず今日または昨日の日時にしてください

JSON配列のみで回答してください。説明文は不要です。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('📝 Gemini response received');

        // Extract JSON from response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let articles;
        try {
            articles = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Response text:', text);
            throw new Error('Failed to parse Gemini response as JSON');
        }

        // Validate and format articles
        const formattedArticles = articles
            .filter(article => article.title && article.description)
            .slice(0, 15)
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url || 'https://example.com',
                publishedAt: article.publishedAt || new Date().toISOString(),
                source: `${article.source || 'Web Search'} (Gemini)`,
                apiSource: 'Gemini Grounding'
            }));

        console.log(`✅ Found ${formattedArticles.length} real-time articles`);

        res.json({
            success: true,
            source: 'Gemini Grounding',
            count: formattedArticles.length,
            articles: formattedArticles,
            timestamp: new Date().toISOString(),
            note: 'Real-time news from Google Search via Gemini grounding'
        });

    } catch (error) {
        console.error('Gemini Grounding Error:', error.message);
        res.status(500).json({
            error: 'Failed to search real-time news',
            message: error.message
        });
    }
}

/**
 * Search for real-time news by category
 */
export async function searchNewsByCategory(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        const { category } = req.params;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        console.log(`🔍 Searching for real-time ${category} news...`);

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{
                googleSearch: {}
            }]
        });

        // Category-specific search queries
        const searchQueries = {
            fx: 'FX 為替 ドル円 ユーロドル 中央銀行 金融政策 latest news today',
            usStocks: '米国株 S&P500 NASDAQ ダウ Apple Tesla Nvidia latest news today',
            jpStocks: '日本株 日経平均 TOPIX トヨタ ソニー latest news today',
            crypto: 'Bitcoin Ethereum 仮想通貨 暗号資産 latest news today'
        };

        const query = searchQueries[category] || searchQueries.fx;

        const prompt = `あなたは金融ニュースアナリストです。
Google検索を使用して、「${query}」に関する**本日（過去24時間以内）**の最新ニュースを検索し、
以下のJSON形式で返してください：

[
  {
    "title": "ニュースタイトル",
    "description": "要約（100文字程度）",
    "url": "ソースURL",
    "publishedAt": "公開日時（ISO 8601形式）",
    "source": "ニュースソース名"
  }
]

【条件】
- 過去24時間以内のニュース
- 信頼できるニュースソースのみ
- 最大10件
- 必ずGoogle検索を使用

JSON配列のみで回答してください。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const articles = JSON.parse(text);

        const formattedArticles = articles
            .filter(article => article.title && article.description)
            .slice(0, 10)
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url || 'https://example.com',
                publishedAt: article.publishedAt || new Date().toISOString(),
                source: `${article.source || 'Web Search'} (Gemini)`,
                apiSource: 'Gemini Grounding',
                category: category
            }));

        console.log(`✅ Found ${formattedArticles.length} ${category} articles`);

        res.json({
            success: true,
            source: 'Gemini Grounding',
            category: category,
            count: formattedArticles.length,
            articles: formattedArticles,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Gemini Category Search Error:', error.message);
        res.status(500).json({
            error: 'Failed to search category news',
            message: error.message
        });
    }
}
