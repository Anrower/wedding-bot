import { createRequire } from "module";
const require = createRequire(import.meta.url);
const TelegramApi = require('node-telegram-bot-api');
import fetch from 'node-fetch';

const token = '5111060876:AAEVrZ9OC9H6chIbTJOoRdY0rB83nxbXR1U';
const baseUrl = 'https://62935bd37aa3e6af1a0a2292.mockapi.io/wedbot/book';
const searchByFree = '?booked=false';
let searchByUser = null;

const bot = new TelegramApi(token, { polling: true });

const upgradeeBooks = (booksData) =>
  fetch(`${baseUrl}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(booksData)
  });

const start = () => {

  const getBooksBy = async (options = null) => {
    return await fetch(baseUrl + options)
      .then(res => res.json())
      .then(data => updateBooks(data));
  }

  //TODO  PUT
  const PUTBooks = async (params) => {
    const [data, bookId] = params;
    console.log(bookId);
    const url = `${baseUrl}/${bookId}`;
    console.log(url);
    await fetch(url, {
      method: "PUT",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => console.log(res))
  }
  //TODO  POST
  const POSTBooks = async (data) => {
    await fetch(baseUrl, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => console.log(res))
  }

  // ? defaultKeyboard for update server data;
  const bookList = [
    [{
      id: '1',
      text: 'Ведьмак: "Последнее желание"',
      callback_data: 'Witcher the last wish',
      booked: false,
      whoBooked: null,
      // url: 'https://oz.by/books/more10912445.html?sbtoken=ab4a4b75fd6a02956822cc7d0f33fe22'
    }],
    [{
      id: '2',
      text: 'Б. Акунин "Инь и Янь"',
      callback_data: 'Akunin Yin and Yang',
      booked: false,
      whoBooked: null,
      // url: 'https://belkniga.by/catalog/khudozhestvennaya/detektivy_i_priklyucheniya/zakh_akunin_in_i_yan_belaya_chernaya_versii/'
    }],
    [{
      id: '3',
      text: 'Cтивен Кинг как писать книги',
      callback_data: 'S.King How to wrie the books',
      booked: false,
      whoBooked: null,
      // url: 'https://oz.by/books/more10627636.html'
    }],
  ];
  const defaultKeyboard = {
    reply_markup: JSON.stringify({
      inline_keyboard: bookList
    })
  }
  const getBookUrlbyId = (id) => {
    const dictionary = {
      1: 'https://oz.by/books/more10912445.html?sbtoken=ab4a4b75fd6a02956822cc7d0f33fe22',
      2: 'https://belkniga.by/catalog/khudozhestvennaya/detektivy_i_priklyucheniya/zakh_akunin_in_i_yan_belaya_chernaya_versii/',
      3: 'https://oz.by/books/more10627636.html',
    }
    return dictionary[id];
  }

  const updateBooks = (data) => {
    const arr = [];
    if (data[0].booked) {
      for (let i = 0; i < data.length; i++) {
        data[i].url = getBookUrlbyId(data[i].id);
        // console.log(getBookUrlbyId(data[i].id));
        // console.log(data[i].url);
        arr.push([data[i]]);
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        arr.push([data[i]]);
      }
    }
    return createTlgKeyboard(arr);
  }

  const createTlgKeyboard = (arr) => {
    const bookList = arr;
    const avaliableBooks = {
      inline_keyboard: bookList
    }
    const bookOptions = {
      reply_markup: JSON.stringify(avaliableBooks)
    }
    return bookOptions;
  }

  const chooseBook = (data, userName) => {
    for (let i = 0; i < bookList.length; i++) {
      if (bookList[i][0].callback_data === data) {
        bookList[i][0].booked = true;
        bookList[i][0].whoBooked = userName;
        const book = bookList[i][0];
        const bookId = bookList[i][0].id;
        return [book, bookId]; //for PUT method
        // return book; //for POST method
      }
    }
    return 'this book is booked';
  }

  bot.on('message', async msg => {
    // console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;
    const userName = msg.chat.username;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/60f/789/60f78991-9f37-4f16-b520-47d971e7e5f1/192/2.webp');
      return bot.sendMessage(chatId, `Привет ${msg.from.first_name}, я помогу тебе выбрать книгу вместо цветов`);
    }

    if (text === '/help') {
      return bot.sendMessage(chatId, `Список доступных комманд: \r\n "/myBookedBook" - Показать мои забронированные книги. \r\n "/pickBook" - Выбрать книгу. \r\n "/pickBookLocal" - Загрузить на сервер книги локальные.`)
    }

    if (text === '/pickBook') {
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/1e9/504/1e9504b7-11d0-4e6e-ac8e-41f16352d6a7/9.webp');
      const keyboard = await getBooksBy(searchByFree);
      await bot.sendMessage(chatId, 'тебе как выбрать книгу', keyboard);
      return;
    }

    if (text === '/pickBookLocal') {
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/1e9/504/1e9504b7-11d0-4e6e-ac8e-41f16352d6a7/9.webp');
      await bot.sendMessage(chatId, 'тебе как выбрать книгу', defaultKeyboard);
      return;
    }

    if (text === '/myBookedBook') {
      await bot.sendMessage(chatId, 'Вот список твоих забронированных книг:');
      const searchQuery = `?whoBooked=${userName}`;
      const keyboard = await getBooksBy(searchQuery);
      await bot.sendMessage(chatId, 'Вот список книг которые ты забронировал:', keyboard);
      return;
    }

    return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз! Список доступных команд "/help"')
  })

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const userName = msg.message.chat.username;
    const chatId = msg.message.chat.id;
    bot.answerCallbackQuery(msg.id)
      .then(() => PUTBooks(chooseBook(data, userName)))
      // .then(() => POSTBooks(chooseBook(data, userName)))
      .then(() => bot.sendMessage(chatId, `Ты выбрал книгу ${data}`));
  });
};

start();