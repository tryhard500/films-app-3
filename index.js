// 2 коллекции, связанные через objectid

let express = require(`express`);
let app = express();
let port = 3002;

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
})

// Раздача статики
app.use(express.static(`public`));

// Настройка handlebars
const hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');

// Настройка POST-запроса
app.use(express.urlencoded({ extended: true }))

let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/film-app-3');

let commentSchema = new mongoose.Schema({
    author: String,
    text: String,
    rating: {
        type: Number,
        max: 10,
        min: 1
    }
});

let actorsSchema = new mongoose.Schema({
    fullName: String,
    country: String,
    age: Number,
    description: String
});
let Actor = mongoose.model('actors', actorsSchema);

let filmsSchema = new mongoose.Schema({
    title: String,
    year: Number,
    genres: [String],
    comments: [commentSchema],
    actors: [{
        type: mongoose.ObjectId,
        ref: 'actors'
    }]
});
let Film = mongoose.model('film', filmsSchema);



app.get('/', async (req, res) => {
    let genre = req.query.genre;
    if (genre) {
        let films = await Film.find({ genres: genre });
        res.render('index', { films: films });
    } else {
        let films = await Film.find();
        res.render('index', { films: films });
    }
});

app.get('/film', async (req, res) => {
    let id = req.query.film_id;
    let film = await Film.findOne({ _id: id }).populate('actors');
    let comments = film.comments;
    res.render('film', {
        film: film,
        comments: comments
    });
});

app.post('/add-comment', async (req, res) => {
    let film_id = req.query.film_id;
    let film = await Film.findOne({ _id: film_id });
    film.comments.push({
        author: req.body.author,
        text: req.body.text,
        rating: Number(req.body.rating)
    });
    await film.save();
    res.redirect('back');
});

app.get('/remove-comment', async (req, res) => {
    let comment_id = req.query.comment_id;
    let index = req.query.index;
    let film = await Film.findOne({ 'comments._id': comment_id });
    film.comments.splice(index, 1);
    await film.save();
    res.redirect('back');
});

app.get('/actor', async (req, res) => {
    let id = req.query.id;
    let actor = await Actor.findOne({ _id: id });
    let films = await Film.find({
        'actors': id
    });
    console.log(films);
    res.render('actor', {
        actor: actor,
        films: films
    });
});