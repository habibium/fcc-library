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
  comments: {
    type: [String],
    default: [],
  },
});

const Book = mongoose.model("book", BookSchema);

const createBook = async (book) => await Book.create(book);

const findBooks = async () => await Book.find({});

module.exports = {
  dbConnect,
  createBook,
  findBooks,
};
