import axios from 'axios';
import Offer from '../models/Offer.js';

/**
 * Fetch offers from external APIs and store new ones in DB.
 * Returns the count of newly inserted offers.
 */
const fetchAndStore = async (keywords, location) => {
  const offers = [];

  // ── Indeed (via RapidAPI) ────────────────────────────────
  if (process.env.RAPIDAPI_KEY) {
    try {
      const { data } = await axios.get('https://indeed12.p.rapidapi.com/jobs/search', {
        params: { query: keywords, location, page_id: '1', locality: 'ma' },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'indeed12.p.rapidapi.com',
        },
        timeout: 8000,
      });
      (data.hits || []).forEach((job) => {
        offers.push({
          title: job.title,
          companyName: job.company_name,
          location: job.location,
          externalId: job.id,
          externalUrl: `https://www.indeed.com/viewjob?jk=${job.id}`,
          source: 'indeed',
          publishedAt: new Date(job.date),
          contractType: 'stage',
        });
      });
    } catch (e) {
      console.warn('[Aggregator] Indeed fetch failed:', e.message);
    }
  }

  // Bulk upsert (skip duplicates)
  let inserted = 0;
  for (const offer of offers) {
    try {
      await Offer.updateOne(
        { externalId: offer.externalId, source: offer.source },
        { $setOnInsert: offer },
        { upsert: true }
      );
      inserted++;
    } catch (_) {}
  }
  return inserted;
};

export { fetchAndStore };
