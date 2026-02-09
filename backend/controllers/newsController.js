import axios from 'axios';

/**
 * Fetch FX/Forex related news from NewsAPI
 */
export async function fetchNews(req, res) {
    try {
        const API_KEY = process.env.NEWS_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'NewsAPI key not configured'
            });
        }

        // FX/為替関連キーワード（拡張版）
        const query = 'forex OR FX OR 為替 OR ドル OR 円 OR ユーロ OR ポンド OR currency OR "exchange rate" OR "central bank" OR "Federal Reserve" OR ECB OR "Bank of Japan" OR 日銀 OR 介入 OR USD OR JPY OR EUR OR GBP OR CHF OR AUD OR CAD OR "currency pair" OR "forex market" OR "foreign exchange"';

        // Get date range (past 2 days for fresher news)
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);

        const fromDate = twoDaysAgo.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];

        console.log(`📰 Fetching news from ${fromDate} to ${toDate}`);

        // NewsAPI endpoint
        const url = 'https://newsapi.org/v2/everything';
        const params = {
            q: query,
            from: fromDate,
            to: toDate,
            sortBy: 'publishedAt',
            language: 'en,ja',
            pageSize: 20,
            apiKey: API_KEY
        };

        const response = await axios.get(url, { params });

        console.log(`📊 NewsAPI Response: status=${response.data.status}, totalResults=${response.data.totalResults}`);

        if (response.data.status === 'ok') {
            // Filter and format articles
            const articles = response.data.articles
                .filter(article => article.title && article.description)
                .map(article => ({
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    publishedAt: article.publishedAt,
                    source: article.source.name
                }));

            console.log(`✅ Fetched ${articles.length} articles`);

            // If no articles found, use comprehensive mock data
            if (articles.length === 0) {
                console.log('⚠️  No articles from NewsAPI, using comprehensive mock data');
                const mockArticles = generateMockArticles();

                return res.json({
                    success: true,
                    count: mockArticles.length,
                    articles: mockArticles,
                    timestamp: new Date().toISOString(),
                    note: 'Using mock data - NewsAPI returned no results (free plan limitation)'
                });
            }

            res.json({
                success: true,
                count: articles.length,
                articles: articles,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('NewsAPI returned error status');
        }

    } catch (error) {
        console.error('NewsAPI Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: error.response?.data?.message || error.message
        });
    }
}

/**
 * Aggregate news from multiple sources (NewsAPI, Alpha Vantage, Finnhub)
 * Provides comprehensive FX news coverage
 */
export async function aggregateNews(req, res) {
    try {
        console.log('🔄 Aggregating news from multiple sources...');

        const allArticles = [];
        const sources = [];

        // Fetch from Gemini Real-time Search (NEW - highest priority for freshness)
        try {
            const geminiArticles = await fetchGeminiRealtimeArticles();
            if (geminiArticles.length > 0) {
                allArticles.push(...geminiArticles);
                sources.push('Gemini Real-time');
                console.log(`✅ Gemini Real-time: ${geminiArticles.length} articles`);
            }
        } catch (error) {
            console.log(`⚠️  Gemini Real-time failed: ${error.message}`);
        }

        // Fetch from NewsAPI
        try {
            const newsApiArticles = await fetchNewsAPIArticles();
            if (newsApiArticles.length > 0) {
                allArticles.push(...newsApiArticles);
                sources.push('NewsAPI');
                console.log(`✅ NewsAPI: ${newsApiArticles.length} articles`);
            }
        } catch (error) {
            console.log(`⚠️  NewsAPI failed: ${error.message}`);
        }

        // Fetch from Alpha Vantage
        try {
            const alphaVantageArticles = await fetchAlphaVantageArticles();
            if (alphaVantageArticles.length > 0) {
                allArticles.push(...alphaVantageArticles);
                sources.push('Alpha Vantage');
                console.log(`✅ Alpha Vantage: ${alphaVantageArticles.length} articles`);
            }
        } catch (error) {
            console.log(`⚠️  Alpha Vantage failed: ${error.message}`);
        }

        // Fetch from Finnhub
        try {
            const finnhubArticles = await fetchFinnhubArticles();
            if (finnhubArticles.length > 0) {
                allArticles.push(...finnhubArticles);
                sources.push('Finnhub');
                console.log(`✅ Finnhub: ${finnhubArticles.length} articles`);
            }
        } catch (error) {
            console.log(`⚠️  Finnhub failed: ${error.message}`);
        }

        // If no articles from any source, use mock data
        if (allArticles.length === 0) {
            console.log('⚠️  No articles from any source, using comprehensive mock data');
            const mockArticles = generateMockArticles();
            return res.json({
                success: true,
                count: mockArticles.length,
                articles: mockArticles,
                sources: ['Mock Data'],
                timestamp: new Date().toISOString(),
                note: 'Using mock data - all news sources failed or returned no results'
            });
        }

        // Remove duplicates based on title similarity
        const uniqueArticles = removeDuplicates(allArticles);

        // Sort by published date (newest first)
        uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        console.log(`📊 Total unique articles: ${uniqueArticles.length} from ${sources.length} sources`);

        res.json({
            success: true,
            count: uniqueArticles.length,
            articles: uniqueArticles,
            sources: sources,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Aggregation Error:', error.message);
        res.status(500).json({
            error: 'Failed to aggregate news',
            message: error.message
        });
    }
}

/**
 * Helper function to fetch articles from NewsAPI
 */
async function fetchNewsAPIArticles() {
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) return [];

    const query = 'forex OR FX OR 為替 OR ドル OR 円 OR ユーロ OR ポンド OR currency OR "exchange rate" OR "central bank" OR "Federal Reserve" OR ECB OR "Bank of Japan" OR 日銀 OR 介入 OR USD OR JPY OR EUR OR GBP OR CHF OR AUD OR CAD OR "currency pair" OR "forex market" OR "foreign exchange"';
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const url = 'https://newsapi.org/v2/everything';
    const params = {
        q: query,
        from: twoDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        sortBy: 'publishedAt',
        language: 'en,ja',
        pageSize: 20,
        apiKey: API_KEY
    };

    const response = await axios.get(url, { params });

    if (response.data.status === 'ok') {
        return response.data.articles
            .filter(article => article.title && article.description)
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                source: `${article.source.name} (NewsAPI)`,
                apiSource: 'NewsAPI'
            }));
    }
    return [];
}

/**
 * Helper function to fetch articles from Alpha Vantage
 */
async function fetchAlphaVantageArticles() {
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    if (!API_KEY) return [];

    const url = 'https://www.alphavantage.co/query';
    const params = {
        function: 'NEWS_SENTIMENT',
        topics: 'forex,finance',
        sort: 'LATEST',
        limit: 20,
        apikey: API_KEY
    };

    const response = await axios.get(url, { params });

    if (response.data.feed) {
        return response.data.feed.map(item => ({
            title: item.title,
            description: item.summary,
            url: item.url,
            publishedAt: item.time_published,
            source: `${item.source} (Alpha Vantage)`,
            apiSource: 'Alpha Vantage',
            sentiment: {
                label: item.overall_sentiment_label,
                score: parseFloat(item.overall_sentiment_score)
            }
        }));
    }
    return [];
}

/**
 * Helper function to fetch real-time articles from Gemini grounding
 */
async function fetchGeminiRealtimeArticles() {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return [];

    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(API_KEY);

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
    "publishedAt": "公開日時（ISO 8601形式）",
    "source": "ニュースソース名"
  }
]

【検索条件】
- 過去24時間以内のニュース
- FX、為替、通貨、中央銀行に関連
- 信頼できるニュースソースのみ
- 最大10件

JSON配列のみで回答してください。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const articles = JSON.parse(text);

        return articles
            .filter(article => article.title && article.description)
            .slice(0, 10)
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url || 'https://example.com',
                publishedAt: article.publishedAt || new Date().toISOString(),
                source: `${article.source || 'Web Search'} (Gemini)`,
                apiSource: 'Gemini Grounding'
            }));
    } catch (error) {
        console.error('Gemini grounding error:', error.message);
        return [];
    }
}

/**
 * Helper function to fetch articles from Finnhub
 */
async function fetchFinnhubArticles() {
    const API_KEY = process.env.FINNHUB_API_KEY;
    if (!API_KEY) return [];

    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const allArticles = [];

    // Fetch forex news
    try {
        const forexUrl = 'https://finnhub.io/api/v1/news';
        const forexParams = {
            category: 'forex',
            from: twoDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
            token: API_KEY
        };

        const forexResponse = await axios.get(forexUrl, { params: forexParams });

        if (Array.isArray(forexResponse.data)) {
            const forexArticles = forexResponse.data
                .filter(item => item.headline && item.summary)
                .map(item => ({
                    title: item.headline,
                    description: item.summary,
                    url: item.url,
                    publishedAt: new Date(item.datetime * 1000).toISOString(),
                    source: `${item.source} (Finnhub)`,
                    apiSource: 'Finnhub',
                    image: item.image
                }));
            allArticles.push(...forexArticles);
        }
    } catch (error) {
        console.log(`⚠️  Finnhub forex news failed: ${error.message}`);
    }

    // Fetch general market news
    try {
        const generalUrl = 'https://finnhub.io/api/v1/news';
        const generalParams = {
            category: 'general',
            from: twoDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
            token: API_KEY
        };

        const generalResponse = await axios.get(generalUrl, { params: generalParams });

        if (Array.isArray(generalResponse.data)) {
            const generalArticles = generalResponse.data
                .filter(item => item.headline && item.summary)
                .slice(0, 15) // Limit general news to avoid overwhelming
                .map(item => ({
                    title: item.headline,
                    description: item.summary,
                    url: item.url,
                    publishedAt: new Date(item.datetime * 1000).toISOString(),
                    source: `${item.source} (Finnhub)`,
                    apiSource: 'Finnhub',
                    image: item.image
                }));
            allArticles.push(...generalArticles);
        }
    } catch (error) {
        console.log(`⚠️  Finnhub general news failed: ${error.message}`);
    }

    return allArticles;
}

/**
 * Remove duplicate articles based on title similarity
 */
function removeDuplicates(articles) {
    const unique = [];
    const seenTitles = new Set();

    for (const article of articles) {
        // Normalize title for comparison
        const normalizedTitle = article.title.toLowerCase().trim();

        // Check if we've seen a similar title
        let isDuplicate = false;
        for (const seenTitle of seenTitles) {
            if (normalizedTitle === seenTitle ||
                normalizedTitle.includes(seenTitle) ||
                seenTitle.includes(normalizedTitle)) {
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            unique.push(article);
            seenTitles.add(normalizedTitle);
        }
    }

    return unique;
}

/**
 * Generate comprehensive mock articles for all categories
 */
function generateMockArticles() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return [
        // FX Articles
        {
            title: 'ドル円、150円台で推移 日銀の金融政策に注目',
            description: '東京外国為替市場でドル円相場は1ドル=150円台で推移。日本銀行の金融政策決定会合を控え、市場参加者は慎重な姿勢を維持している。',
            url: 'https://example.com/fx1',
            publishedAt: now.toISOString(),
            source: '日本経済新聞 (Mock)'
        },
        {
            title: 'Fed Officials Signal Cautious Approach on Rate Cuts',
            description: 'Federal Reserve officials indicated a measured approach to potential interest rate reductions, citing persistent inflation concerns and robust labor market conditions.',
            url: 'https://example.com/fx2',
            publishedAt: yesterday.toISOString(),
            source: 'Reuters (Mock)'
        },
        {
            title: 'EUR/USD Holds Above 1.09 as ECB Minutes Show Divided Views',
            description: 'The euro maintained gains against the dollar after European Central Bank meeting minutes revealed divergent opinions among policymakers regarding the pace of monetary easing.',
            url: 'https://example.com/fx3',
            publishedAt: yesterday.toISOString(),
            source: 'Bloomberg (Mock)'
        },
        {
            title: 'ポンド急伸、英中銀の利下げ慎重姿勢を好感',
            description: 'ロンドン外為市場でポンドが対ドルで急伸。イングランド銀行が利下げに慎重な姿勢を示したことを好感した買いが優勢となった。',
            url: 'https://example.com/fx4',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'ロイター (Mock)'
        },
        {
            title: 'Swiss Franc Strengthens on Safe-Haven Demand',
            description: 'The Swiss franc gained against major currencies as investors sought safe-haven assets amid geopolitical uncertainties in the Middle East.',
            url: 'https://example.com/fx5',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'Financial Times (Mock)'
        },
        // US Stocks Articles
        {
            title: 'S&P 500 Hits New Record High on Tech Rally',
            description: 'The S&P 500 index reached a new all-time high, driven by strong gains in technology stocks including Nvidia, Microsoft, and Apple.',
            url: 'https://example.com/us1',
            publishedAt: now.toISOString(),
            source: 'CNBC (Mock)'
        },
        {
            title: 'Nvidia Surges 5% on AI Chip Demand Outlook',
            description: 'Nvidia shares jumped after the company provided an optimistic outlook for AI chip demand, citing strong interest from cloud computing providers.',
            url: 'https://example.com/us2',
            publishedAt: yesterday.toISOString(),
            source: 'MarketWatch (Mock)'
        },
        {
            title: 'Tesla Stock Rallies on China Sales Data',
            description: 'Tesla shares rose following better-than-expected vehicle delivery numbers from China, the companys second-largest market.',
            url: 'https://example.com/us3',
            publishedAt: yesterday.toISOString(),
            source: 'Bloomberg (Mock)'
        },
        {
            title: 'Amazon Announces Major Cloud Infrastructure Investment',
            description: 'Amazon Web Services unveiled plans for a $10 billion investment in cloud infrastructure expansion across North America over the next three years.',
            url: 'https://example.com/us4',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'Reuters (Mock)'
        },
        // Japanese Stocks Articles
        {
            title: '日経平均、3万9000円台を回復 半導体関連が牽引',
            description: '東京株式市場で日経平均株価は3営業日ぶりに反発し、3万9000円台を回復。半導体関連株の上昇が相場を牽引した。',
            url: 'https://example.com/jp1',
            publishedAt: now.toISOString(),
            source: '日本経済新聞 (Mock)'
        },
        {
            title: 'トヨタ、EV戦略見直しで株価上昇',
            description: 'トヨタ自動車が電気自動車戦略の見直しを発表し、株価が上昇。新型バッテリー技術への投資拡大が評価された。',
            url: 'https://example.com/jp2',
            publishedAt: yesterday.toISOString(),
            source: 'ロイター (Mock)'
        },
        {
            title: 'ソニーグループ、ゲーム事業好調で最高益更新へ',
            description: 'ソニーグループがゲーム事業の好調を背景に、今期の営業利益が過去最高を更新する見通しを発表。株価は年初来高値を更新した。',
            url: 'https://example.com/jp3',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'Bloomberg (Mock)'
        },
        // Crypto Articles
        {
            title: 'Bitcoin Surges Past $65,000 on ETF Inflows',
            description: 'Bitcoin price jumped above $65,000 as spot Bitcoin ETFs saw record inflows, signaling strong institutional demand for cryptocurrency exposure.',
            url: 'https://example.com/crypto1',
            publishedAt: now.toISOString(),
            source: 'CoinDesk (Mock)'
        },
        {
            title: 'Ethereum Upgrade Successfully Deployed',
            description: 'The Ethereum network successfully implemented its latest upgrade, improving transaction speeds and reducing gas fees for users.',
            url: 'https://example.com/crypto2',
            publishedAt: yesterday.toISOString(),
            source: 'CoinTelegraph (Mock)'
        },
        {
            title: 'ビットコイン、機関投資家の買いで上昇基調',
            description: '暗号資産市場でビットコインが上昇基調を維持。機関投資家による大口購入が相場を下支えしている。',
            url: 'https://example.com/crypto3',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'Crypto Times (Mock)'
        },
        {
            title: 'DeFi Protocol Launches New Yield Farming Program',
            description: 'A major decentralized finance protocol announced a new yield farming initiative, offering competitive returns for liquidity providers.',
            url: 'https://example.com/crypto4',
            publishedAt: twoDaysAgo.toISOString(),
            source: 'DeFi Pulse (Mock)'
        }
    ];
}
