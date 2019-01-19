const questionSchema = require('../schemas/question');
const getMongoDbConnection = require('../utils/mongo');


async function create(props) {
  try {
    const db = await getMongoDbConnection();
    const Question = db.model('Question', questionSchema);
    const question = new Question(props);
    question.save();
  } catch (e) {
    console.log(e.message);
  }
}

create();

module.exports = {
  create,
};
