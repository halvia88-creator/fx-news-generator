import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Detect trending FX keywords using Gemini grounding
 */
export async function detectFXTrends(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        console.log('🔥 Detecting FX trending keywords...');

        const genAI = new GoogleGenerativeAI(API_KEY);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{
                googleSearch: {}
            }]
        });

        const prompt = `あなたは金融市場アナリストです。
Google検索を使用して、**本日（過去24時間）**のFX・為替市場で最も話題になっているキーワードやトピックを検出してください。

以下のJSON形式で返してください：

[
  {
    "keyword": "キーワード",
    "relevance": "high",
    "context": "なぜ話題になっているか（50文字程度）"
  }
]

【検索条件】
- FX、為替、通貨、中央銀行に関連するキーワード
- 具体的な通貨ペア（ドル円、ユーロドル等）、政策、イベント名
- 本日話題になっているもの
- 5〜10個のキーワード

【重要】
- 必ずGoogle検索を使用して最新のトレンドを取得してください
- 古い情報は含めないでください

JSON配列のみで回答してください。説明文は不要です。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('📝 Trends response received');

        // Extract JSON from response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let trends;
        try {
            trends = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            throw new Error('Failed to parse trends response as JSON');
        }

        // Validate and format trends
        const formattedTrends = trends
            .filter(trend => trend.keyword)
            .slice(0, 10)
            .map(trend => ({
                keyword: trend.keyword,
                relevance: trend.relevance || 'medium',
                context: trend.context || ''
            }));

        console.log(`✅ Detected ${formattedTrends.length} trending keywords`);

        res.json({
            success: true,
            count: formattedTrends.length,
            keywords: formattedTrends,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Trend Detection Error:', error.message);
        res.status(500).json({
            error: 'Failed to detect trends',
            message: error.message
        });
    }
}

/**
 * Search news related to trending keywords
 */
export async function searchTrendingNews(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        console.log('🔍 Searching trend-related news...');

        // 1. Detect trending keywords
        const trends = await detectTrendsInternal(API_KEY);

        if (trends.length === 0) {
            return res.status(500).json({
                error: 'Failed to detect trends'
            });
        }

        console.log(`📊 Found ${trends.length} trending keywords`);

        // 2. Search news for each keyword
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{
                googleSearch: {}
            }]
        });

        const keywords = trends.map(t => t.keyword).join(', ');

        const prompt = `あなたは金融ニュースアナリストです。
Google検索を使用して、以下のトレンドキーワードに関連する**本日（過去24時間以内）**の最新FX・為替ニュースを検索してください。

【トレンドキーワード】
${keywords}

以下のJSON形式で返してください：

[
  {
    "title": "ニュースタイトル",
    "description": "要約（100文字程度）",
    "url": "ソースURL",
    "publishedAt": "公開日時（ISO 8601形式）",
    "source": "ニュースソース名",
    "matchedKeywords": ["関連するキーワード"]
  }
]

【条件】
- 過去24時間以内のニュース
- トレンドキーワードに関連するニュースのみ
- 信頼できるニュースソースのみ
- 最大15件

JSON配列のみで回答してください。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const articles = JSON.parse(text);

        const formattedArticles = articles
            .filter(article => article.title && article.description)
            .slice(0, 15)
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url || 'https://example.com',
                publishedAt: article.publishedAt || new Date().toISOString(),
                source: `${article.source || 'Web Search'} (Trending)`,
                apiSource: 'Gemini Trending',
                matchedKeywords: article.matchedKeywords || [],
                isTrending: true
            }));

        console.log(`✅ Found ${formattedArticles.length} trend-related articles`);

        res.json({
            success: true,
            trendingKeywords: trends.map(t => t.keyword),
            count: formattedArticles.length,
            articles: formattedArticles,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Trending News Search Error:', error.message);
        res.status(500).json({
            error: 'Failed to search trending news',
            message: error.message
        });
    }
}

/**
 * Internal helper to detect trends (for use in other controllers)
 */
async function detectTrendsInternal(apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{
                googleSearch: {}
            }]
        });

        const prompt = `Google検索を使用して、本日のFX・為替市場で話題のキーワードを5〜10個検出してください。

JSON形式で返してください：
[{"keyword": "キーワード", "relevance": "high", "context": "理由"}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const trends = JSON.parse(text);

        return trends
            .filter(trend => trend.keyword)
            .slice(0, 10)
            .map(trend => ({
                keyword: trend.keyword,
                relevance: trend.relevance || 'medium',
                context: trend.context || ''
            }));
    } catch (error) {
        console.error('Internal trend detection error:', error.message);
        return [];
    }
}

// Export for use in other controllers
export { detectTrendsInternal };
