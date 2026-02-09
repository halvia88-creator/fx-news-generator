import React, { useState } from 'react';
import './PostGenerator.css';

export default function PostGenerator({ posts, topic }) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    if (!posts || posts.length === 0) {
        return null;
    }

    const handleCopy = async (post, index) => {
        try {
            await navigator.clipboard.writeText(post);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="post-generator-container fade-in">
            <div className="section-header">
                <h2>✨ SNS投稿文（X用）</h2>
                <p>選択したトピック: <strong>{topic.title}</strong></p>
            </div>

            <div className="posts-grid">
                {posts.map((post, index) => (
                    <div key={index} className="post-card card">
                        <div className="post-header">
                            <span className="post-number">案 {index + 1}</span>
                            <span className="post-length">{post.length}文字</span>
                        </div>

                        <div className="post-content">
                            <p>{post}</p>
                        </div>

                        <button
                            className={`btn ${copiedIndex === index ? 'btn-success' : 'btn-secondary'} btn-copy`}
                            onClick={() => handleCopy(post, index)}
                        >
                            {copiedIndex === index ? (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    コピーしました
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    コピー
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="post-actions">
                <button
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    最初から作成
                </button>
            </div>
        </div>
    );
}
