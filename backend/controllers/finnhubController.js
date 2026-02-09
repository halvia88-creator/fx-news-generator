import axios from 'axios';

/**
 * Fetch forex news from Finnhub
 * High rate limit: 60 requests/minute
 */
export async function fetchForexNews(req, res) {
    try {
        const API_KEY = process.env.FINNHUB_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Finnhub API key not configured'
            });
        }

        console.log('📰 Fetching forex news from Finnhub...');

        // Get date range (past 2 days for fresher news)
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);

        const fromDate = twoDaysAgo.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];

        const url = 'https://finnhub.io/api/v1/news';
        const params = {
            category: 'forex',
            from: fromDate,
            to: toDate,
            token: API_KEY
        };

        const response = await axios.get(url, { params });

        if (Array.isArray(response.data)) {
            // Format articles
            const articles = response.data
                .filter(item => item.headline && item.summary)
                .slice(0, 20) // Limit to 20 articles
                .map(item => ({
                    title: item.headline,
                    description: item.summary,
                    url: item.url,
                    publishedAt: new Date(item.datetime * 1000).toISOString(),
                    source: item.source,
                    category: item.category,
                    image: item.image
                }));

            console.log(`✅ Fetched ${articles.length} forex news articles from Finnhub`);

            res.json({
                success: true,
                source: 'Finnhub',
                count: articles.length,
                articles: articles,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('Invalid response from Finnhub');
        }

    } catch (error) {
        console.error('Finnhub News Error:', error.message);

        // Check for rate limit or API errors
        if (error.response?.status === 429) {
            res.status(429).json({
                error: 'Rate limit reached',
                message: 'Finnhub API limit: 60 requests/minute'
            });
        } else {
            res.status(500).json({
                error: 'Failed to fetch forex news',
                message: error.response?.data?.error || error.message
            });
        }
    }
}

/**
 * Fetch forex rates from Finnhub
 * Provides real-time exchange rates
 */
export async function fetchForexRates(req, res) {
    try {
        const API_KEY = process.env.FINNHUB_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Finnhub API key not configured'
            });
        }

        console.log('💱 Fetching forex rates from Finnhub...');

        // Major forex symbols
        const symbols = [
            'OANDA:USD_JPY',
            'OANDA:EUR_USD',
            'OANDA:GBP_USD',
            'OANDA:USD_CHF',
            'OANDA:AUD_USD'
        ];

        // Fetch rates for all symbols
        const ratePromises = symbols.map(async (symbol) => {
            const url = 'https://finnhub.io/api/v1/quote';
            const params = {
                symbol: symbol,
                token: API_KEY
            };

            try {
                const response = await axios.get(url, { params });
                return {
                    symbol: symbol.replace('OANDA:', '').replace('_', '/'),
                    current: response.data.c,
                    high: response.data.h,
                    low: response.data.l,
                    open: response.data.o,
                    previousClose: response.data.pc,
                    timestamp: response.data.t
                };
            } catch (err) {
                console.error(`Error fetching ${symbol}:`, err.message);
                return null;
            }
        });

        const rates = (await Promise.all(ratePromises)).filter(r => r !== null);

        console.log(`✅ Fetched ${rates.length} forex rates from Finnhub`);

        res.json({
            success: true,
            source: 'Finnhub',
            rates: rates,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Finnhub Rates Error:', error.message);

        if (error.response?.status === 429) {
            res.status(429).json({
                error: 'Rate limit reached',
                message: 'Finnhub API limit: 60 requests/minute'
            });
        } else {
            res.status(500).json({
                error: 'Failed to fetch forex rates',
                message: error.response?.data?.error || error.message
            });
        }
    }
}

/**
 * Fetch general market news from Finnhub
 * Provides broader financial news context
 */
export async function fetchGeneralNews(req, res) {
    try {
        const API_KEY = process.env.FINNHUB_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Finnhub API key not configured'
            });
        }

        console.log('📰 Fetching general market news from Finnhub...');

        const url = 'https://finnhub.io/api/v1/news';
        const params = {
            category: 'general',
            token: API_KEY
        };

        const response = await axios.get(url, { params });

        if (Array.isArray(response.data)) {
            const articles = response.data
                .filter(item => item.headline && item.summary)
                .slice(0, 10)
                .map(item => ({
                    title: item.headline,
                    description: item.summary,
                    url: item.url,
                    publishedAt: new Date(item.datetime * 1000).toISOString(),
                    source: item.source,
                    category: item.category,
                    image: item.image
                }));

            console.log(`✅ Fetched ${articles.length} general news articles`);

            res.json({
                success: true,
                source: 'Finnhub',
                count: articles.length,
                articles: articles,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('Invalid response from Finnhub');
        }

    } catch (error) {
        console.error('Finnhub General News Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch general news',
            message: error.response?.data?.error || error.message
        });
    }
}
