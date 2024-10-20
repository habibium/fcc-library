const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
};

const BookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  commentcount: {
    type: Number,
    default: 0,
  },
  comments: {
    type: [String],
    default: [],
  },
});

const Book = mongoose.model("book", BookSchema);

const createBook = async (book) => await Book.create(book);

const findBooks = async () => await Book.find({});

const findBookById = async (_id) => await Book.findById(_id);

const insertCommentOnBook = async (_id, comment) =>
  await Book.findOneAndUpdate(
    { _id },
    { $inc: { commentcount: 1 }, $push: { comments: comment } },
    { new: true }
  );

const deleteAllBooks = async () => await Book.deleteMany({});

const deleteBookById = async (_id) => await Book.findByIdAndDelete(_id);

module.exports = {
  dbConnect,
  createBook,
  findBooks,
  findBookById,
  insertCommentOnBook,
  deleteAllBooks,
  deleteBookById,
};
