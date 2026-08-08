import app from './shared/app.js';
import { startCron } from './shared/cron.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on: ${PORT}`);
    startCron();
});