import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import DateHelper from './date-helper.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg'
const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
    connectionString: "postgres://dadawha1202:DoyXY04xpZUz@ep-bitter-bird-699185-pooler.ap-southeast-1.aws.neon.tech/neondb",
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require',
    },
});

const getImgByIdHandler = (req, res) => {
    const { idS, id } = req.params;
    const idStory = parseInt(idS);
    const data = fs.readFileSync('data/DATA-IMG.json', 'utf8');
    const jsonData = JSON.parse(data);
    const imageData = jsonData.picture.find((story) => story.idStory === idStory);
    const image = imageData.fileImg.find((img) => img.id === id);

    if (!image) {
        return res.send('Gambar tidak ditemukan');
    }
    const { fileName } = image;

    const imagePath = path.join(__dirname, 'images', fileName);

    return res.sendFile(imagePath);
};

const getThumbByIdHandler = (request, res) => {
    try {
        const imageId = parseInt(request.params.id);
        const data = fs.readFileSync('data/DATA-IMG.json', 'utf8');
        const jsonData = JSON.parse(data);
        const thumbnailImg = jsonData.thumbnail.find((thumb) => thumb.id === imageId);

        if (thumbnailImg) {
            const { fileName } = thumbnailImg;
            const imagePath = path.join(__dirname, 'images', fileName);

            return res.sendFile(imagePath);
        }
        return res.send('Data not found');
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const getAllBooks = () => {
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'images/data', 'DATA.json'));
        const data = JSON.parse(jsonData);
        return data;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const getBookByIdHandler = (req, res) => {
    try {
        const { id } = req.params;
        const data = fs.readFileSync('data/DATA.json', 'utf8');
        const jsonData = JSON.parse(data);
        const story = jsonData.stories.find((story) => story.id === id);

        if (story) {
            return res.send(story);
        }
        return res.send('Data not found');
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const searchStoryHandler = async (req, res) => {
    const { title } = req.query;
    const data = fs.readFileSync('data/DATA.json', 'utf8');
    const jsonData = JSON.parse(data);
    const result = jsonData.stories.filter((story) => story.title.toLowerCase().replace(/\s/g, '').includes(title.toLowerCase().replace(/\s/g, '')));

    return res.send(result);
};

const addingRev = async (req, res) => {
    const { id, name, review } = req.body || {};
    if (!id || !name || !review) {
        return res.status(400).send('Payload tidak valid');
    }

    const id_review = nanoid(8);
    const DATE = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
    const inDate = new Date(DATE);
    const year = inDate.getFullYear();
    const month = String(DateHelper.monthNameChecker(inDate.getMonth() + 1));
    const day = String(inDate.getDate());
    const date = `${day} ${month} ${year}`;
    const query = `
        INSERT INTO review (id_review, id_story, nama, tanggal, isi_review)
        VALUES ($1, $2, $3, $4, $5) RETURNING id_review, id_story, nama, tanggal, isi_review
    `;
    const values = [id_review, id, name, date, review];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const getReviewById = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT * FROM review WHERE id_story = $1
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}


export { getAllBooks, getBookByIdHandler, getImgByIdHandler, getThumbByIdHandler, searchStoryHandler, addingRev, getReviewById };