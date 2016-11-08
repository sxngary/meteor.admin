import { Mongo } from 'meteor/mongo';

class QuestionsCollection extends Mongo.Collection {
}

export const Questions = new QuestionsCollection('questions');