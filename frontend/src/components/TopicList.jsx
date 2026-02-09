import React from 'react';
import CategoryTabs from './CategoryTabs';
import './TopicList.css';

export default function TopicList({ topics, activeCategory, onCategoryChange, selectedTopic, onSelectTopic, onGeneratePosts }) {
    // Get current category topics
    const currentTopics = topics[activeCategory] || [];

    // Calculate topic counts for all categories
    const topicCounts = {
        fx: topics.fx?.length || 0,
        usStocks: topics.usStocks?.length || 0,
        jpStocks: topics.jpStocks?.length || 0,
        crypto: topics.crypto?.length || 0
    };

    // Category labels for display
    const categoryLabels = {
        fx: 'FX・為替',
        usStocks: '米国株',
        jpStocks: '日本株',
        crypto: '仮想通貨'
    };

    return (
        <div className="topic-list-container fade-in">
            <div className="section-header">
                <h2>📊 今日の注目トピックス</h2>
                <p>カテゴリーを選択して、投稿文を生成したいトピックを1つ選んでください</p>
            </div>

            {/* Category Tabs */}
            <CategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={(category) => {
                    onCategoryChange(category);
                    onSelectTopic(null); // Reset selection when changing category
                }}
                topicCounts={topicCounts}
            />

            {/* Topics for selected category */}
            {currentTopics.length > 0 ? (
                <>
                    <div className="topic-grid">
                        {currentTopics.map((topic, index) => (
                            <label
                                key={index}
                                className={`topic-card card ${selectedTopic === index ? 'card-highlight selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="topic"
                                    value={index}
                                    checked={selectedTopic === index}
                                    onChange={() => onSelectTopic(index)}
                                    className="topic-radio"
                                />
                                <div className="topic-number">#{index + 1}</div>
                                <h3 className="topic-title">{topic.title}</h3>
                                <p className="topic-summary">{topic.summary}</p>
                                {selectedTopic === index && (
                                    <div className="selected-badge">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        選択中
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>

                    <div className="topic-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={onGeneratePosts}
                            disabled={selectedTopic === null}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            SNS投稿文を生成
                        </button>
                    </div>
                </>
            ) : (
                <div className="no-topics-message">
                    <p>📭 {categoryLabels[activeCategory]}のトピックスはありません</p>
                    <p className="no-topics-hint">他のカテゴリーをお試しください</p>
                </div>
            )}
        </div>
    );
}
