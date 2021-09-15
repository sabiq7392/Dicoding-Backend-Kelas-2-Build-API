/* eslint-disable no-restricted-syntax */
const { nanoid } = require('nanoid');
const books = require('./books');
const { isNumber, isString, isBoolean } = require('./lib');

const addBook = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading = false,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = readPage === pageCount;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  const failResponse = (message) => h.response({
    statusCode: 400,
    status: 'fail',
    message,
  }).code(400);

  const fail = 'Gagal menambahkan buku';

  if (!name) {
    return failResponse(`${fail}. Mohon isi nama buku`);
  }

  if (readPage > pageCount) {
    return failResponse(`${fail}. readPage tidak boleh lebih besar dari pageCount`);
  }

  if (!isNumber(year) || !isNumber(pageCount) || !isNumber(readPage)) {
    return failResponse(`${fail}. Nilai year, pageCount dan readPage haruslah bertipe number`);
  }

  if (!isString(name) || !isString(author) || !isString(summary) || !isString(publisher)) {
    return failResponse(`${fail}. name, author, summary, dan publisher haruslah bertipe string`);
  }

  if (!isBoolean(reading)) {
    return failResponse(`${fail}. reading haruslah bertipe boolean`);
  }

  const isSuccess = books.filter((book) => book.id === id).length >= 0;
  if (isSuccess) {
    books.push(newBook);
    return h.response({
      statusCode: 201,
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(201);
  }

  return h.response({
    statusCode: 500,
    status: 'error',
    message: 'Buku gagal ditambahkan',
  }).code(500);
};

const getAllBooks = (request, h) => {
  const { name } = request.query;
  let { reading, finished } = request.query;

  const successResponse = ({ data }) => h.response({
    statusCode: 200,
    status: 'success',
    data: {
      books: data,
    },
  }).code(200);

  const newBooks = [];
  const showInfoBooks = (show) => {
    books.forEach((book) => {
      switch (show) {
        case 'finished': {
          newBooks.push({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
            finished: book.finished,
          });
          break;
        }
        case 'reading': {
          newBooks.push({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
            reading: book.reading,
          });
          break;
        }
        default: {
          newBooks.push({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          });
        }
      }
    });
  };

  if (name) {
    showInfoBooks();
    const searchValue = name.toLowerCase();
    const getByQuery = newBooks.filter((book) => book.name.toLowerCase().indexOf(searchValue) > -1);
    return successResponse({ data: getByQuery });
  }

  if (reading) {
    showInfoBooks('reading');
    reading = reading === '1';
    const getByQuery = newBooks.filter((book) => book.reading === reading);
    return successResponse({ data: getByQuery });
  }

  if (finished) {
    showInfoBooks('finished');
    finished = finished === '1';
    const getByQuery = newBooks.filter((book) => book.finished === finished);
    return successResponse({ data: getByQuery });
  }
  showInfoBooks();
  return successResponse({ data: newBooks });
};

const getBookById = (request, h) => {
  const { id } = request.params;

  const book = books.filter((b) => b.id === id)[0];
  if (book !== undefined) {
    return h.response({
      statusCode: 200,
      status: 'success',
      data: {
        book,
      },
    }).code(200);
  }

  return h.response({
    statusCode: 404,
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBook = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const finished = readPage === pageCount;
  const updatedAt = new Date().toISOString();
  let insertedAt;
  books.forEach((book) => {
    if (book.id === id) {
      insertedAt = book.insertedAt;
    }
  });

  const index = books.findIndex((book) => book.id === id);

  const failResponse = (code, message) => h.response({
    statusCode: code,
    status: 'fail',
    message,
  }).code(code);

  const fail = 'Gagal memperbarui buku';

  if (!name) {
    return failResponse(400, `${fail}. Mohon isi nama buku`);
  }

  if (readPage > pageCount) {
    return failResponse(400, `${fail}. readPage tidak boleh lebih besar dari pageCount`);
  }

  if (!isNumber(year) || !isNumber(pageCount) || !isNumber(readPage)) {
    return failResponse(400, `${fail}. Nilai year, pageCount dan readPage haruslah bertipe number`);
  }

  if (!isString(name) || !isString(author) || !isString(summary) || !isString(publisher)) {
    return failResponse(400, `${fail}. name, author, summary, dan publisher haruslah bertipe string`);
  }

  if (!isBoolean(reading)) {
    return failResponse(400, `${fail}. reading dan finished haruslah bertipe boolean`);
  }

  if (index !== -1) {
    books[index] = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    return h.response({
      statusCode: 200,
      status: 'success',
      message: 'Buku berhasil diperbarui',
      data: {
        bookId: id,
        updateName: name,
        updateYear: year,
        updateAuthor: author,
        updateSummary: summary,
        updateublisher: publisher,
        updatePageCount: pageCount,
        updateReadPage: readPage,
        updateReading: reading,
      },
    }).code(200);
  }

  return failResponse(404, `${fail}. Id tidak ditemukan`);
};

const deleteBook = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return h.response({
      statusCode: 200,
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    statusCode: 404,
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

const pageNotFound = (request, h) => h.response({
  statusCode: 404,
  status: 'Page Not Found',
  message: 'Halaman tidak ditemukan atau method yang anda gunakan tidak bisa dipakai di halaman ini',
}).code(404);

module.exports = {
  addBook, getAllBooks, getBookById, editBook, deleteBook, pageNotFound,
};
