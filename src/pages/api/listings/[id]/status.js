import { openDb } from '../../../../lib/database';
import { withAuth } from '../../../../lib/middleware';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const db = await openDb();
    
    
    const currentListing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!currentListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await db.run(
      'UPDATE listings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    await db.run(
      'INSERT INTO audit_logs (listing_id, admin_id, action, old_status, new_status) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.userId, status, currentListing.status, status]
    );

    const updatedListing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);

    res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);