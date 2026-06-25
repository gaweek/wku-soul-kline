import { createShareRecord, getShareRecord } from './shareStore.js';

export const handleCreateShare = async (req, res) => {
  try {
    const record = await createShareRecord(req.body?.payload);
    res.status(201).json({
      id: record.id,
      href: record.href,
      createdAt: record.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create share link';
    const status = message.includes('too large') ? 413 : 400;
    res.status(status).json({ error: message });
  }
};

export const handleGetShare = async (req, res) => {
  try {
    const record = await getShareRecord(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Share link not found' });
      return;
    }

    res.json({ payload: record.payload, createdAt: record.createdAt });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to read share link',
    });
  }
};
