import api from './api.js';

export const appsService = {
    // Apps
    list: () => api.get('/apps'),
    create: (data) => api.post('/apps', data),
    update: (id, data) => api.put(`/apps/${id}`, data),
    remove: (id) => api.delete(`/apps/${id}`),
    testConnection: (id) => api.post(`/apps/${id}/test-connection`),

    // Reviews
    listReviews: (id) => api.get(`/apps/${id}/reviews`),
    fetchReviews: (id) => api.post(`/apps/${id}/fetch-reviews`),
    generateReply: (appId, reviewId) => api.post(`/apps/${appId}/reviews/${reviewId}/generate`),
    publishReply: (appId, reviewId) => api.post(`/apps/${appId}/reviews/${reviewId}/publish`),

    // Sandbox
    sandbox: (id, reviewText) => api.post(`/apps/${id}/sandbox`, { reviewText }),

    // AI config
    getAiConfig: () => api.get('/apps/ai-config'),
    saveAiConfig: (data) => api.post('/apps/ai-config', data),
};
