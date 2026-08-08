/**
 * Demo seed — creates 1 user, 2 apps, and sample reviews.
 * Run: node prisma/seed.js
 */
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { createCipheriv, randomBytes } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ── tiny inline encrypt so we don't import the src util ─────────────────────
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
function encrypt(text) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

// ── demo credentials (fake, for display only) ────────────────────────────────
const playCreds = JSON.stringify({ packageName: 'com.demo.taskflow', type: 'service_account', project_id: 'taskflow-demo' });
const appleCreds = JSON.stringify({ appId: '6445123456', issuerId: 'demo-issuer-id', keyId: 'DEMO123KEY' });

// ── sample reviews ───────────────────────────────────────────────────────────
const playReviews = [
    { reviewId: 'gp-001', reviewerName: 'Alex M.', rating: 5, content: 'Absolutely love this app! The UI is clean and it helps me stay on top of tasks. Been using it for 3 months now.', aiReply: 'Thank you so much, Alex! We\'re thrilled to hear TaskFlow has been helping you stay organized. Your kind words mean the world to our team! 🙌', isPublished: true },
    { reviewId: 'gp-002', reviewerName: 'Priya K.', rating: 2, content: 'The app keeps crashing on my Samsung Galaxy S22 when I try to add a new task. Very frustrating.', aiReply: 'Hi Priya, we\'re so sorry to hear about the crashes on your Galaxy S22! Our team is actively investigating this issue. Please try updating to the latest version, and if the problem persists, email us at support@taskflow.app — we\'ll make it right!', isPublished: true },
    { reviewId: 'gp-003', reviewerName: 'Jordan T.', rating: 4, content: 'Great app overall! Would love a dark mode and widget support. Otherwise it\'s perfect.', aiReply: 'Thanks Jordan! Great news — dark mode is already on our roadmap for the next release! Widgets are planned shortly after. Stay tuned! 🌙', isPublished: false },
    { reviewId: 'gp-004', reviewerName: 'Meena R.', rating: 1, content: 'I paid for premium and lost all my data after reinstalling. No backup option? Unacceptable.', aiReply: 'Meena, we sincerely apologize for this experience — losing your data is completely unacceptable and we understand your frustration. Please contact us immediately at support@taskflow.app with your purchase details and we\'ll restore your data and issue a full refund.', isPublished: false },
    { reviewId: 'gp-005', reviewerName: 'Sam W.', rating: 5, content: 'Best productivity app on the Play Store. Simple, fast, and actually works. 10/10.', aiReply: null, isPublished: false },
    { reviewId: 'gp-006', reviewerName: 'Fatima B.', rating: 3, content: 'Decent app but the sync with Google Calendar is buggy. Half my events don\'t show up.', aiReply: null, isPublished: false },
];

const appleReviews = [
    { reviewId: 'as-001', reviewerName: 'ChrisD99', rating: 5, content: 'This app changed how I manage my day. The reminders are smart and the UI is gorgeous on iPhone.', aiReply: 'Thank you, Chris! We put a lot of love into the iOS experience, so this really makes our day. See you in the app! ✨', isPublished: true },
    { reviewId: 'as-002', reviewerName: 'LilyPad_2024', rating: 4, content: 'Love it! Wish it had Siri Shortcuts support though. Small complaint for an otherwise great app.', aiReply: 'Hi Lily! Siri Shortcuts support is actually coming in our next update — you\'re going to love it! Thanks for the suggestion and for the great rating! 🎉', isPublished: true },
    { reviewId: 'as-003', reviewerName: 'BenF_Dev', rating: 2, content: 'Notifications stopped working after the latest iOS update. I miss my reminders constantly now.', aiReply: 'Hi Ben! We\'re aware of the notification issue following the latest iOS update and a fix is already in review with Apple. It should roll out within 48 hours. Sorry for the inconvenience!', isPublished: false },
    { reviewId: 'as-004', reviewerName: 'YumikoT', rating: 5, content: '毎日使っています。とても便利なアプリです！Thank you for this wonderful app.', aiReply: 'Thank you so much, Yumiko! We\'re so happy to hear you use TaskFlow every day. Your support from Japan means everything to us! 🇯🇵❤️', isPublished: false },
];

async function main() {
    console.log('🌱 Seeding demo data...\n');

    // 1. Demo user
    const hash = await argon2.hash('Demo@1234');
    const user = await prisma.user.upsert({
        where: { email: 'demo@aireviews.app' },
        update: {},
        create: { email: 'demo@aireviews.app', name: 'Demo User', password: hash }
    });
    console.log(`✅ User: ${user.email}  (password: Demo@1234)`);

    // 2. AI config (Gemini default, no personal key)
    await prisma.userAiConfig.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, provider: 'GEMINI' }
    });

    // 3. Play Store app
    const playApp = await prisma.app.upsert({
        where: { id: 1 },
        update: {},
        create: {
            userId: user.id,
            name: 'TaskFlow — To-Do & Planner',
            platform: 'PLAYSTORE',
            credentials: encrypt(playCreds),
            instructionPrompt: 'You are a friendly and professional support agent for TaskFlow, a productivity app. Always thank users for their feedback. If they report a bug, apologize and direct them to support@taskflow.app. Keep replies under 80 words. Use a warm, positive tone.',
            mode: 'MANUAL',
            isActive: true,
        }
    });
    console.log(`✅ App (Play Store): ${playApp.name}`);

    // 4. App Store app
    const appleApp = await prisma.app.upsert({
        where: { id: 2 },
        update: {},
        create: {
            userId: user.id,
            name: 'TaskFlow for iPhone',
            platform: 'APPSTORE',
            credentials: encrypt(appleCreds),
            instructionPrompt: 'You are a warm, concise support agent for TaskFlow iOS. Always acknowledge the user\'s specific point. For bug reports, mention the team is working on it. Keep replies friendly and under 60 words.',
            mode: 'AUTO',
            isActive: true,
        }
    });
    console.log(`✅ App (App Store): ${appleApp.name}`);

    // 5. Reviews for Play Store app
    for (const r of playReviews) {
        await prisma.review.upsert({
            where: { appId_reviewId: { appId: playApp.id, reviewId: r.reviewId } },
            update: {},
            create: { appId: playApp.id, ...r, publishedAt: r.isPublished ? new Date() : null }
        });
    }
    console.log(`✅ ${playReviews.length} Play Store reviews seeded`);

    // 6. Reviews for App Store app
    for (const r of appleReviews) {
        await prisma.review.upsert({
            where: { appId_reviewId: { appId: appleApp.id, reviewId: r.reviewId } },
            update: {},
            create: { appId: appleApp.id, ...r, publishedAt: r.isPublished ? new Date() : null }
        });
    }
    console.log(`✅ ${appleReviews.length} App Store reviews seeded`);

    console.log('\n🎉 Done! Login at http://localhost:5173/auth/login');
    console.log('   Email:    demo@aireviews.app');
    console.log('   Password: Demo@1234');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
