import prisma from '../../prisma.js';
import { encrypt, decrypt } from '../../shared/crypto.js';
import { generateReply } from '../../shared/ai.js';
import { fetchReviewsFromStore } from '../../shared/cron.js';


// ─── helper ──────────────────────────────────────────────────────────────────
function ownsApp(app, userId) {
    if (!app || app.userId !== userId) {
        const err = new Error('App not found'); err.statusCode = 404; throw err;
    }
}

// ─── Apps CRUD ────────────────────────────────────────────────────────────────
export async function listApps(req, res, next) {
    try {
        const apps = await prisma.app.findMany({
            where: { userId: req.user.userId },
            select: { id: true, name: true, platform: true, mode: true, isActive: true, createdAt: true, _count: { select: { reviews: true } } }
        });
        res.json(apps);
    } catch (err) { next(err); }
}

export async function createApp(req, res, next) {
    try {
        const { name, platform, credentials, instructionPrompt, mode } = req.body;
        if (!name || !platform || !credentials) {
            return res.status(400).json({ error: 'name, platform, and credentials are required' });
        }
        const credStr = typeof credentials === 'string' ? credentials : JSON.stringify(credentials);
        const app = await prisma.app.create({
            data: {
                userId: req.user.userId, name, platform,
                credentials: encrypt(credStr),
                instructionPrompt, mode: mode || 'MANUAL'
            },
            select: { id: true, name: true, platform: true, mode: true, isActive: true, createdAt: true }
        });
        res.status(201).json(app);
    } catch (err) { next(err); }
}

export async function updateApp(req, res, next) {
    try {
        const app = await prisma.app.findUnique({ where: { id: Number(req.params.id) } });
        ownsApp(app, req.user.userId);

        const { name, platform, credentials, instructionPrompt, mode, isActive } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (platform !== undefined) data.platform = platform;
        if (credentials !== undefined) {
            const credStr = typeof credentials === 'string' ? credentials : JSON.stringify(credentials);
            data.credentials = encrypt(credStr);
        }
        if (instructionPrompt !== undefined) data.instructionPrompt = instructionPrompt;
        if (mode !== undefined) data.mode = mode;
        if (isActive !== undefined) data.isActive = isActive;

        const updated = await prisma.app.update({
            where: { id: Number(req.params.id) }, data,
            select: { id: true, name: true, platform: true, mode: true, isActive: true, instructionPrompt: true }
        });
        res.json(updated);
    } catch (err) { next(err); }
}

export async function deleteApp(req, res, next) {
    try {
        const app = await prisma.app.findUnique({ where: { id: Number(req.params.id) } });
        ownsApp(app, req.user.userId);
        await prisma.app.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'App deleted' });
    } catch (err) { next(err); }
}

// ─── Connection test ──────────────────────────────────────────────────────────
export async function testConnection(req, res, next) {
    try {
        const app = await prisma.app.findUnique({ where: { id: Number(req.params.id) } });
        ownsApp(app, req.user.userId);
        const creds = JSON.parse(decrypt(app.credentials));
        const reviews = await fetchReviewsFromStore(app.platform, creds, app.name);
        res.json({ success: true, message: 'Connection successful', reviewCount: reviews.length });
    } catch (err) {
        // surface store errors as structured response
        res.status(400).json({ success: false, error: err.message });
    }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function listReviews(req, res, next) {
    try {
        const app = await prisma.app.findUnique({ where: { id: Number(req.params.id) } });
        ownsApp(app, req.user.userId);
        const reviews = await prisma.review.findMany({
            where: { appId: app.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (err) { next(err); }
}

export async function fetchReviews(req, res, next) {
    try {
        const app = await prisma.app.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: { include: { aiConfig: true } } }
        });
        ownsApp(app, req.user.userId);

        const creds = JSON.parse(decrypt(app.credentials));
        const storeReviews = await fetchReviewsFromStore(app.platform, creds, app.name);
        const aiConfig = app.user.aiConfig || {};

        let saved = 0;
        for (const r of storeReviews) {
            const existing = await prisma.review.findUnique({
                where: { appId_reviewId: { appId: app.id, reviewId: r.reviewId } }
            });
            if (existing) continue;

            const decryptedKey = aiConfig.apiKey ? decrypt(aiConfig.apiKey) : null;
            const aiReply = await generateReply(r.content, app.instructionPrompt, {
                provider: aiConfig.provider, apiKey: decryptedKey
            });
            await prisma.review.create({
                data: { appId: app.id, reviewId: r.reviewId, reviewerName: r.reviewerName, rating: r.rating, content: r.content, aiReply }
            });
            saved++;
        }
        res.json({ message: `Fetched ${storeReviews.length} reviews, ${saved} new` });
    } catch (err) { next(err); }
}

export async function generateReviewReply(req, res, next) {
    try {
        const app = await prisma.app.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: { include: { aiConfig: true } } }
        });
        ownsApp(app, req.user.userId);

        const review = await prisma.review.findUnique({ where: { id: Number(req.params.reviewId) } });
        if (!review || review.appId !== app.id) return res.status(404).json({ error: 'Review not found' });

        const aiConfig = app.user.aiConfig || {};
        const decryptedKey = aiConfig.apiKey ? decrypt(aiConfig.apiKey) : null;
        const aiReply = await generateReply(review.content, app.instructionPrompt, {
            provider: aiConfig.provider, apiKey: decryptedKey
        });
        const updated = await prisma.review.update({
            where: { id: review.id }, data: { aiReply }
        });
        res.json(updated);
    } catch (err) { next(err); }
}

export async function publishReply(req, res, next) {
    try {
        const app = await prisma.app.findUnique({ where: { id: Number(req.params.id) } });
        ownsApp(app, req.user.userId);

        const review = await prisma.review.findUnique({ where: { id: Number(req.params.reviewId) } });
        if (!review || review.appId !== app.id) return res.status(404).json({ error: 'Review not found' });
        if (!review.aiReply) return res.status(400).json({ error: 'No AI reply to publish' });

        const creds = JSON.parse(decrypt(app.credentials));
        // ponytail: real publish call goes here (Play Store / App Store APIs)
        console.log(`[publish] Publishing reply to ${app.platform} for review ${review.reviewId}`);

        const updated = await prisma.review.update({
            where: { id: review.id },
            data: { isPublished: true, publishedAt: new Date() }
        });
        res.json(updated);
    } catch (err) { next(err); }
}

// ─── Sandbox ──────────────────────────────────────────────────────────────────
export async function sandbox(req, res, next) {
    try {
        const { reviewText } = req.body;
        if (!reviewText) return res.status(400).json({ error: 'reviewText is required' });

        const app = await prisma.app.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: { include: { aiConfig: true } } }
        });
        ownsApp(app, req.user.userId);

        const aiConfig = app.user.aiConfig || {};
        const decryptedKey = aiConfig.apiKey ? decrypt(aiConfig.apiKey) : null;
        const aiReply = await generateReply(reviewText, app.instructionPrompt, {
            provider: aiConfig.provider, apiKey: decryptedKey
        });
        res.json({ aiReply });
    } catch (err) { next(err); }
}

// ─── AI Config ────────────────────────────────────────────────────────────────
export async function getAiConfig(req, res, next) {
    try {
        const config = await prisma.userAiConfig.findUnique({ where: { userId: req.user.userId } });
        if (!config) return res.json({ provider: 'GEMINI', hasKey: false });
        res.json({ provider: config.provider, hasKey: !!config.apiKey });
    } catch (err) { next(err); }
}

export async function saveAiConfig(req, res, next) {
    try {
        const { provider, apiKey } = req.body;
        const data = { provider: provider || 'GEMINI' };
        if (apiKey) data.apiKey = encrypt(apiKey);

        await prisma.userAiConfig.upsert({
            where: { userId: req.user.userId },
            create: { userId: req.user.userId, ...data },
            update: data
        });
        res.json({ message: 'AI config saved' });
    } catch (err) { next(err); }
}
