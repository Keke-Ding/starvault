import express from 'express';
import cors from 'cors';
import path from 'path';
import { getAllCards, getCardById, createCard, updateCard, deleteCard, getAllSettings, setSetting, exportAllData, importAllData, } from './db.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const distPath = process.env.STARVAULT_DIST || path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/api/cards', (_req, res) => {
    const cards = getAllCards();
    res.json(cards);
});
app.get('/api/cards/:id', (req, res) => {
    const card = getCardById(req.params.id);
    if (!card) {
        return res.status(404).json({ error: '卡片未找到' });
    }
    res.json(card);
});
app.post('/api/cards', (req, res) => {
    const { id, title, content, tags, category, createdAt, updatedAt } = req.body;
    if (!id || !title) {
        return res.status(400).json({ error: '缺少必要字段' });
    }
    createCard({
        id,
        title,
        content: content || '',
        tags: tags || [],
        category: category || '其他',
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
    });
    res.status(201).json({ success: true });
});
app.put('/api/cards/:id', (req, res) => {
    const success = updateCard(req.params.id, req.body);
    if (!success) {
        return res.status(404).json({ error: '卡片未找到' });
    }
    res.json({ success: true });
});
app.delete('/api/cards/:id', (req, res) => {
    const success = deleteCard(req.params.id);
    if (!success) {
        return res.status(404).json({ error: '卡片未找到' });
    }
    res.json({ success: true });
});
app.get('/api/settings', (_req, res) => {
    res.json(getAllSettings());
});
app.put('/api/settings', (req, res) => {
    for (const [key, value] of Object.entries(req.body)) {
        setSetting(key, String(value));
    }
    res.json({ success: true });
});
app.get('/api/export', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=starvault-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.send(exportAllData());
});
app.post('/api/import', (req, res) => {
    const success = importAllData(JSON.stringify(req.body));
    if (!success) {
        return res.status(400).json({ error: '导入失败，数据格式不正确' });
    }
    res.json({ success: true });
});
app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`StarVault 后端已启动: http://localhost:${PORT}`);
});
export default app;
//# sourceMappingURL=index.js.map