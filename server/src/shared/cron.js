import cron from 'node-cron';
import prisma from '../prisma.js';
import { decrypt } from './crypto.js';
import { generateReply } from './ai.js';

// ponytail: runs every 30 min inside the same process — upgrade to a worker when scale demands it
export function startCron() {
    cron.schedule('*/30 * * * *', async () => {
        console.log('[cron] Auto-mode review fetch starting...');
        const autoApps = await prisma.app.findMany({
            where: { mode: 'AUTO', isActive: true },
            include: { user: { include: { aiConfig: true } } }
        });

        for (const app of autoApps) {
            try {
                await processApp(app);
            } catch (err) {
                console.error(`[cron] Error processing app ${app.id}:`, err.message);
            }
        }
    });
    console.log('[cron] Auto-mode cron scheduled (every 30 min)');
}

async function processApp(app) {
    const creds = JSON.parse(decrypt(app.credentials));
    const reviews = await fetchReviewsFromStore(app.platform, creds, app.name);
    const aiConfig = app.user.aiConfig || {};

    for (const r of reviews) {
        const existing = await prisma.review.findUnique({
            where: { appId_reviewId: { appId: app.id, reviewId: r.reviewId } }
        });
        if (existing?.isPublished) continue; // already published, skip

        const decryptedKey = aiConfig.apiKey ? decrypt(aiConfig.apiKey) : null;
        const aiReply = await generateReply(r.content, app.instructionPrompt, {
            provider: aiConfig.provider,
            apiKey: decryptedKey
        });

        const review = await prisma.review.upsert({
            where: { appId_reviewId: { appId: app.id, reviewId: r.reviewId } },
            create: { appId: app.id, reviewId: r.reviewId, reviewerName: r.reviewerName, rating: r.rating, content: r.content, aiReply },
            update: { aiReply }
        });

        // auto-publish
        await publishReplyToStore(app.platform, creds, r.reviewId, aiReply);
        await prisma.review.update({
            where: { id: review.id },
            data: { isPublished: true, publishedAt: new Date() }
        });
    }
}

// ponytail: stub implementations — real Play Store / App Store API calls go here
export async function fetchReviewsFromStore(platform, creds, appName) {
    if (platform === 'PLAYSTORE') return fetchPlayStoreReviews(creds, appName);
    return fetchAppStoreReviews(creds, appName);
}

async function fetchPlayStoreReviews(creds, appName) {
    // Play Store API: requires google-play-scraper or Google Play Developer API
    // ponytail: using google-play-scraper (no OAuth needed for public reviews)
    try {
        const gplay = await import('google-play-scraper');
        const reviews = await gplay.default.reviews({ appId: creds.packageName, lang: 'en', country: 'us', num: 50 });
        return (reviews.data || []).map(r => ({
            reviewId: r.id,
            reviewerName: r.userName,
            rating: r.score,
            content: r.text || ''
        }));
    } catch {
        return [];
    }
}

async function fetchAppStoreReviews(creds, appName) {
    // App Store: use app-store-scraper for public reviews
    try {
        const store = await import('app-store-scraper');
        const reviews = await store.default.reviews({ id: creds.appId, country: 'us', page: 1 });
        return (reviews || []).map(r => ({
            reviewId: String(r.id),
            reviewerName: r.userName,
            rating: r.score,
            content: r.text || ''
        }));
    } catch {
        return [];
    }
}

async function publishReplyToStore(platform, creds, reviewId, reply) {
    // ponytail: publishing requires authenticated API — stub for now
    // Play Store: needs Google Play Developer API with OAuth service account
    // App Store: needs App Store Connect API
    console.log(`[publish] Would publish reply to ${platform} review ${reviewId}`);
}
