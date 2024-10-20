/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { findBooks } = require("../db");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          const title = "test";
          chai
            .request(server)
            .post("/api/books")
            .type("form")
            .send({ title })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, "title");
              assert.property(res.body, "_id");
              assert.equal(res.body.title, title);
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .type("form")
            .send({ title: "" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if (res.body.length > 0) {
              assert.property(res.body[0], "title");
              assert.property(res.body[0], "_id");
              assert.property(res.body[0], "commentcount");
              assert.isNumber(res.body[0].commentcount);
            }
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        const newId = crypto.randomUUID().toString();
        chai
          .request(server)
          .get(`/api/books/${newId}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        findBooks()
          .then((books) => {
            if (books.length > 0) {
              const book = books[0].toObject();
              book._id = book._id.toString();
              chai
                .request(server)
                .get(`/api/books/${book._id}`)
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.property(res.body, "title");
                  assert.property(res.body, "_id");
                  assert.property(res.body, "comments");
                  assert.isArray(res.body.comments);
                  assert.strictEqual(res.body._id, book._id);
                  assert.strictEqual(res.body.title, book.title);
                  done();
                });
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          findBooks()
            .then((books) => {
              const comment = "test comment";
              if (books.length > 0) {
                const book = books[0].toObject();
                book._id = book._id.toString();
                chai
                  .request(server)
                  .post(`/api/books/${book._id}`)
                  .type("form")
                  .send({
                    comment,
                  })
                  .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, "title");
                    assert.property(res.body, "_id");
                    assert.property(res.body, "comments");
                    assert.isArray(res.body.comments);
                    assert.strictEqual(res.body._id, book._id);
                    assert.strictEqual(res.body.title, book.title);
                    assert.include(res.body.comments, comment);
                    assert.strictEqual(
                      res.body.commentcount,
                      book.commentcount + 1
                    );
                    done();
                  });
              }
            })
            .catch((e) => done(e));
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          findBooks()
            .then((books) => {
              if (books.length > 0) {
                const book = books[0].toObject();
                book._id = book._id.toString();
                chai
                  .request(server)
                  .post(`/api/books/${book._id}`)
                  .type("form")
                  .send({})
                  .end((err, res) => {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(
                      res.text,
                      "missing required field comment"
                    );
                    done();
                  });
              }
            })
            .catch((e) => done(e));
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          const comment =
            "Test POST /api/books/[id] with comment, id not in db";
          chai
            .request(server)
            .post(`/api/books/${crypto.randomUUID().toString()}`)
            .type("form")
            .send({
              comment,
            })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        findBooks().then((books) => {
          if (books.length > 0) {
            const book = books[0].toObject();
            book._id = book._id.toString();
            chai
              .request(server)
              .delete(`/api/books/${book._id}`)
              .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.text, "delete successful");
                done();
              });
          }
        });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        const newId = crypto.randomUUID().toString();
        chai
          .request(server)
          .delete(`/api/books/${newId}`)
          .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
