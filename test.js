const books = [[{ id: '1', text: 'Withcer', callback_data: 'Witcher' }],
[{ id: '2', text: 'Lord of the ring', callback_data: 'Lord of the ring' }],
[{ id: '3', text: 'Fandorin adventures', callback_data: 'Fandorin adventures' }]];

const chooseBook = (data) => {
  for (let i = 0; i < books.length; i++) {
    if (books[i][0].callback_data === data) {
      return books[i][0];
    }
  }
  return 'this book is booked';
}

const test = 'Fandorin adventures';
chooseBook(test);