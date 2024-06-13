import express, { Request, Response } from 'express';
import cron from 'node-cron';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const port = 3000;

// Route to test the server
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Function to parse website content
const parseWebsite = async () => {
  try {
    const response = await axios.get('https://rezka.ag/films/best/');
    const html = response.data;

    const $ = cheerio.load(html);
    const films: Array<{ title: string; rating: string; image: string }> = [];

    $('.b-content__inline_item').each((index, element) => {
      if (index < 10) {  // Limit to top 10 films
        const title = $(element).find('.b-content__inline_item-link').text().trim();
        const rating = $(element).find('.b-content__inline_item-rating').text().trim();
        const image = $(element).find('.b-content__inline_item-cover img').attr('src') || '';

        films.push({ title, rating, image });
      }
    });

    console.log(films);
    return films;

  } catch (error) {
    console.error('Error fetching the website:', error);
    return [];
  }
};

// Schedule the parser to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running the website parser...');
  const films = await parseWebsite();
  console.log('Top 10 films:', JSON.stringify(films, null, 2));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
