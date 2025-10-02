import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { db } from './config/db.js';
import { favouritesTable } from './db/schema.js';
import job from './config/cron.js';

import { eq, and } from 'drizzle-orm';

const app = express();
const PORT = ENV.PORT || 5001;

app.use(express.json());
app.use(cors())

if(ENV.NODE_ENV === 'production') job.start();

app.get('/api/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

app.post('/api/favourites', async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title || !image || !cookTime || !servings) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFavourite = await db.insert(favouritesTable).values({
      userId,
      recipeId,
      title,
      image,
      cookTime,
      servings,
    })
    .returning();

    res.status(201).json(newFavourite[0]);
  } catch (error) {
    console.error('Error adding favourite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/favourites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    const userFavourites = await db.select().from(favouritesTable).where(eq(favouritesTable.userId, userId));
    res.status(200).json(userFavourites);
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/favourites/:userId/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    if (!userId || !recipeId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await db.delete(favouritesTable).where(
      and(eq(favouritesTable.userId, userId), eq(favouritesTable.recipeId, parseInt(recipeId)))
    )

    res.status(200).json({ message: 'Favourite deleted successfully' });
  } catch (error) {
    console.error('Error deleting favourite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}) 

app.listen(5001, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});