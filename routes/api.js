/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { createBook, insertCommentOnBook, findBooks } = require("../db");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await findBooks();
        res.json(books);
      } catch (error) {
        console.log({ error });
        return res.json({ error: "Error fetching books" });
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) return res.send("missing required field title");

      try {
        const newBook = await createBook({ title });
        return res.json(newBook);
      } catch (error) {
        console.log({ error });
        return res.json({ error: "Error creating book" });
      }
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      const bookId = req.params.id;
    })

    .post(async function (req, res) {
      let bookId = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) return res.send("missing required field comment");
      try {
        const book = await insertCommentOnBook(bookId, comment);
        return res.json(book);
      } catch (error) {
        return res.send("no book exists");
      }
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
};
