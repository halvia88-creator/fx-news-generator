import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import TopicList from './components/TopicList';
import PostGenerator from './components/PostGenerator';

// API Base URL - 本番環境では環境変数から取得、開発環境では空文字（プロキシ使用）
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [articles, setArticles] = useState([]);
    const [topics, setTopics] = useState({
        fx: [],
        usStocks: [],
        jpStocks: [],
        crypto: []
    });
    const [activeCategory, setActiveCategory] = useState('fx');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [currentStep, setCurrentStep] = useState('dashboard'); // dashboard, topics, posts
    const [forexRates, setForexRates] = useState([]);
    const [newsSources, setNewsSources] = useState([]);
    const [trendingKeywords, setTrendingKeywords] = useState([]);

    // Step 1: Fetch News
    const handleFetchNews = async () => {
        setLoading(true);
        setError(null);
        setCurrentStep('dashboard');
        setTopics({
            fx: [],
            usStocks: [],
            jpStocks: [],
            crypto: []
        });
        setActiveCategory('fx');
        setPosts([]);
        setSelectedTopic(null);

        try {
            // Fetch aggregated news from multiple sources
            const newsResponse = await axios.get(`${API_BASE_URL}/api/news/aggregated`);
            const fetchedArticles = newsResponse.data.articles;
            const sources = newsResponse.data.sources || [];
            const keywords = newsResponse.data.trendingKeywords || [];
            setArticles(fetchedArticles);
            setNewsSources(sources);
            setTrendingKeywords(keywords);
            setLastFetchTime(new Date().toISOString());

            // Fetch forex rates
            try {
                const ratesResponse = await axios.get(`${API_BASE_URL}/api/forex-rates`);
                setForexRates(ratesResponse.data.rates || []);
            } catch (ratesError) {
                console.warn('Failed to fetch forex rates:', ratesError.message);
            }

            // Generate categorized topics immediately
            const topicsResponse = await axios.post(`${API_BASE_URL}/api/topics/categorized`, {
                articles: fetchedArticles
            });

            setTopics(topicsResponse.data.topics);
            setCurrentStep('topics');
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Select Topic
    const handleSelectTopic = (index) => {
        setSelectedTopic(index);
    };

    // Step 3: Generate Posts
    const handleGeneratePosts = async () => {
        if (selectedTopic === null) return;

        setLoading(true);
        setError(null);

        try {
            const topic = topics[activeCategory][selectedTopic];
            const response = await axios.post(`${API_BASE_URL}/api/posts`, { topic });

            setPosts(response.data.posts);
            setCurrentStep('posts');
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || '投稿文生成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>FX News Generator</h1>
                <p>FXトレード情報自動取得 & SNS投稿文生成</p>
            </header>

            <div className="container">
                {/* Error Display */}
                {error && (
                    <div className="error-message card fade-in">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f5576c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <strong>エラー:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && currentStep === 'dashboard' && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p className="loading-text">FXニュースを取得中...</p>
                    </div>
                )}

                {/* Dashboard */}
                {!loading && currentStep === 'dashboard' && (
                    <Dashboard
                        onFetchNews={handleFetchNews}
                        loading={loading}
                        lastFetchTime={lastFetchTime}
                        forexRates={forexRates}
                        newsSources={newsSources}
                        trendingKeywords={trendingKeywords}
                    />
                )}

                {/* Topic List */}
                {currentStep === 'topics' && (
                    <>
                        {loading ? (
                            <div className="loading">
                                <div className="spinner"></div>
                                <p className="loading-text">投稿文を生成中...</p>
                            </div>
                        ) : (
                            <TopicList
                                topics={topics}
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                selectedTopic={selectedTopic}
                                onSelectTopic={handleSelectTopic}
                                onGeneratePosts={handleGeneratePosts}
                            />
                        )}
                    </>
                )}

                {/* Post Generator */}
                {currentStep === 'posts' && posts.length > 0 && (
                    <PostGenerator
                        posts={posts}
                        topic={topics[activeCategory][selectedTopic]}
                    />
                )}
            </div>

            <footer className="app-footer">
                <p>© 2026 FX News Generator | Powered by Gemini AI, NewsAPI, Alpha Vantage & Finnhub</p>
            </footer>
        </div>
    );
}

export default App;
