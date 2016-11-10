import { Mongo } from 'meteor/mongo';

class AnswersCollection extends Mongo.Collection {
}

export const Answers = new AnswersCollection('answers');