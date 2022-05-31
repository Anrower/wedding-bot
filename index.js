import { createRequire } from "module";
const require = createRequire(import.meta.url);
const TelegramApi = require('node-telegram-bot-api');
// const fetch = require("node-fetch");
import fetch from 'node-fetch';

// const Promise = require('bluebird');
// Promise.config({
//   cancellation: true
// });


const token = '5111060876:AAEVrZ9OC9H6chIbTJOoRdY0rB83nxbXR1U';
const baseUrl = 'https://62935bd37aa3e6af1a0a2292.mockapi.io/wedbot/book';
const searchByFree = '?booked=false';

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

  const getBooks = async () => {
    return await fetch(baseUrl + searchByFree)
      .then(res => res.json())
      .then(data => updateBooks(data));
  }

  //TODO change post to put
  const postBooks = async (data) => {
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
    [{ id: '1', text: 'Withcer', callback_data: 'Witcher', booked: 'false' }],
    [{ id: '2', text: 'Lord of the ring', callback_data: 'Lord of the ring', booked: 'false' }],
    [{ id: '3', text: 'Fandorin adventures', callback_data: 'Fandorin adventures', booked: 'false' }]
  ];
  const defaultKeyboard = {
    reply_markup: JSON.stringify({
      inline_keyboard: bookList
    })
  }

  const updateBooks = (data) => {
    const arr = [];
    for (let i = 0; i < data.length; i++) {
      arr.push([data[i]]);
    }
    // console.log(arr);
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

  const chooseBook = (data) => {
    for (let i = 0; i < bookList.length; i++) {
      if (bookList[i][0].callback_data === data) {
        // bookList[i][0].booked = true;
        return bookList[i][0];
      }
    }
    return 'this book is booked';
  }

  bot.on('message', async msg => {
    // console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/60f/789/60f78991-9f37-4f16-b520-47d971e7e5f1/192/2.webp');
      return bot.sendMessage(chatId, 'Привет, я помогу тебе выбрать книгу вместо цветов');
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
    }

    if (text === '/help') {
      return bot.sendMessage(chatId, `Список доступных комманд: \r\n "/start" - Запустить бота. \r\n "/info" Инфо о пользователе. \r\n "/pickBook" Выбрать книгу.`)
    }

    if (text === '/pickBook') {
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/1e9/504/1e9504b7-11d0-4e6e-ac8e-41f16352d6a7/9.webp');
      const keyboard = await getBooks();
      // console.log(keyboard);
      console.log(defaultKeyboard);
      await bot.sendMessage(chatId, 'тебе как выбрать книгу', keyboard);
      return;
    }


    return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз! Список доступных команд "/help"')
  })

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const userName = msg.message.chat.username;
    const chatId = msg.message.chat.id;
    bot.answerCallbackQuery(msg.id)
      // .then(() => updateBooks(avaliableBooks, data))
      .then(() => postBooks(chooseBook(data)))
      .then(() => bot.sendMessage(chatId, `Ты выбрал книгу ${data}`));

    // return bot.sendMessage(chatId, `Ты выбрал книгу ${data}`);
  });
};

start();