module.exports = {
    apps: [
        {
            name: 'fx-news-backend',
            script: './backend/server.js',
            instances: 1,
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
