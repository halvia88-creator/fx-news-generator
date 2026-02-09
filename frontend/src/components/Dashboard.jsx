import React from 'react';
import './Dashboard.css';

export default function Dashboard({ onFetchNews, loading, lastFetchTime, forexRates, newsSources, trendingKeywords }) {
    return (
        <div className="dashboard card fade-in">
            <div className="dashboard-content">
                <div className="dashboard-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#gradient)" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="gradient" x1="3" y1="2" x2="13" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#667eea" />
                                <stop offset="1" stopColor="#764ba2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h2>FXニュース情報を取得</h2>
                <p className="dashboard-description">
                    最新のFX・為替関連ニュースを複数ソースから取得し、<br />
                    トピックスとSNS投稿文を自動生成します
                </p>

                {/* Forex Rates Display */}
                {forexRates && forexRates.length > 0 && (
                    <div className="forex-rates">
                        <h3>リアルタイム為替レート</h3>
                        <div className="rates-grid">
                            {forexRates.slice(0, 5).map((rate, index) => (
                                <div key={index} className="rate-item">
                                    <span className="rate-pair">{rate.symbol}</span>
                                    <span className="rate-value">{rate.current?.toFixed(4) || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* News Sources Display */}
                {newsSources && newsSources.length > 0 && (
                    <div className="news-sources">
                        <p className="sources-label">
                            📰 ニュースソース: {newsSources.join(', ')}
                        </p>
                    </div>
                )}

                {/* Trending Keywords Display */}
                {trendingKeywords && trendingKeywords.length > 0 && (
                    <div className="trending-keywords">
                        <p className="trending-label">
                            🔥 話題のキーワード:
                        </p>
                        <div className="keywords-container">
                            {trendingKeywords.map((keyword, index) => (
                                <span key={index} className="keyword-tag">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {lastFetchTime && (
                    <div className="last-fetch">
                        <span className="last-fetch-label">最終取得:</span>
                        <span className="last-fetch-time">{new Date(lastFetchTime).toLocaleString('ja-JP')}</span>
                    </div>
                )}

                <button
                    className="btn btn-primary btn-large"
                    onClick={onFetchNews}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="spinner-small"></div>
                            取得中...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            今日のFX情報を取得
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
