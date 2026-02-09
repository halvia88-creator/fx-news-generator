import React from 'react';
import './CategoryTabs.css';

const CATEGORIES = [
    { id: 'fx', label: 'FX・為替', icon: '💱' },
    { id: 'usStocks', label: '米国株', icon: '🇺🇸' },
    { id: 'jpStocks', label: '日本株', icon: '🇯🇵' },
    { id: 'crypto', label: '仮想通貨', icon: '₿' }
];

export default function CategoryTabs({ activeCategory, onCategoryChange, topicCounts }) {
    return (
        <div className="category-tabs">
            <div className="tabs-container">
                {CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="tab-icon">{category.icon}</span>
                        <span className="tab-label">{category.label}</span>
                        {topicCounts[category.id] > 0 && (
                            <span className="tab-badge">{topicCounts[category.id]}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
