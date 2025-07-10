import { openDb } from '../../../../lib/database';
import { withAuth } from '../../../../lib/middleware';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title, description, brand, model, year, price_per_day, location } = req.body;

    try {
      const db = await openDb();
      
      await db.run(
        `UPDATE listings 
         SET title = ?, description = ?, brand = ?, model = ?, year = ?, price_per_day = ?, location = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, description, brand, model, year, price_per_day, location, id]
      );

      await db.run(
        'INSERT INTO audit_logs (listing_id, admin_id, action) VALUES (?, ?, ?)',
        [id, req.user.userId, 'updated']
      );

      const updatedListing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);
      res.status(200).json(updatedListing);
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);

