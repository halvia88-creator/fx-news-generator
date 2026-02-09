import axios from 'axios';

/**
 * Fetch real-time forex rates from Alpha Vantage
 * Endpoint: FX_DAILY for major currency pairs
 */
export async function fetchForexRates(req, res) {
    try {
        const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Alpha Vantage API key not configured'
            });
        }

        // Major currency pairs for FX trading
        const currencyPairs = [
            { from: 'USD', to: 'JPY', name: 'USD/JPY' },
            { from: 'EUR', to: 'USD', name: 'EUR/USD' },
            { from: 'GBP', to: 'USD', name: 'GBP/USD' },
            { from: 'USD', to: 'CHF', name: 'USD/CHF' },
            { from: 'AUD', to: 'USD', name: 'AUD/USD' }
        ];

        console.log('💱 Fetching forex rates from Alpha Vantage...');

        // Fetch exchange rate for the first pair (to avoid rate limits)
        // In production, you might want to cache this or fetch sequentially
        const pair = currencyPairs[0];
        const url = 'https://www.alphavantage.co/query';
        const params = {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: pair.from,
            to_currency: pair.to,
            apikey: API_KEY
        };

        const response = await axios.get(url, { params });

        if (response.data['Realtime Currency Exchange Rate']) {
            const rateData = response.data['Realtime Currency Exchange Rate'];

            const rates = [{
                pair: pair.name,
                rate: parseFloat(rateData['5. Exchange Rate']),
                bidPrice: parseFloat(rateData['8. Bid Price']),
                askPrice: parseFloat(rateData['9. Ask Price']),
                lastRefreshed: rateData['6. Last Refreshed'],
                timezone: rateData['7. Time Zone']
            }];

            console.log(`✅ Fetched forex rate: ${pair.name} = ${rates[0].rate}`);

            res.json({
                success: true,
                source: 'Alpha Vantage',
                rates: rates,
                timestamp: new Date().toISOString()
            });
        } else if (response.data.Note) {
            // API rate limit reached
            console.log('⚠️  Alpha Vantage rate limit reached');
            res.status(429).json({
                error: 'Rate limit reached',
                message: 'Alpha Vantage API limit: 25 requests/day',
                note: response.data.Note
            });
        } else {
            throw new Error('Invalid response from Alpha Vantage');
        }

    } catch (error) {
        console.error('Alpha Vantage Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch forex rates',
            message: error.response?.data?.message || error.message
        });
    }
}

/**
 * Fetch news sentiment from Alpha Vantage
 * Provides news articles with sentiment analysis
 */
export async function fetchNewsSentiment(req, res) {
    try {
        const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Alpha Vantage API key not configured'
            });
        }

        console.log('📰 Fetching news sentiment from Alpha Vantage...');

        const url = 'https://www.alphavantage.co/query';
        const params = {
            function: 'NEWS_SENTIMENT',
            topics: 'forex,finance',
            sort: 'LATEST',
            limit: 50,
            apikey: API_KEY
        };

        const response = await axios.get(url, { params });

        if (response.data.feed) {
            // Format articles with sentiment
            const articles = response.data.feed
                .slice(0, 20) // Limit to 20 articles
                .map(item => ({
                    title: item.title,
                    description: item.summary,
                    url: item.url,
                    publishedAt: item.time_published,
                    source: item.source,
                    sentiment: {
                        label: item.overall_sentiment_label,
                        score: parseFloat(item.overall_sentiment_score)
                    },
                    relevanceScore: item.relevance_score
                }));

            console.log(`✅ Fetched ${articles.length} news articles with sentiment`);

            res.json({
                success: true,
                source: 'Alpha Vantage',
                count: articles.length,
                articles: articles,
                timestamp: new Date().toISOString()
            });
        } else if (response.data.Note) {
            // API rate limit reached
            console.log('⚠️  Alpha Vantage rate limit reached');
            res.status(429).json({
                error: 'Rate limit reached',
                message: 'Alpha Vantage API limit: 25 requests/day',
                note: response.data.Note
            });
        } else {
            throw new Error('Invalid response from Alpha Vantage');
        }

    } catch (error) {
        console.error('Alpha Vantage News Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch news sentiment',
            message: error.response?.data?.message || error.message
        });
    }
}
