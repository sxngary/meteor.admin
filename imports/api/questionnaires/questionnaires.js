import { Mongo } from 'meteor/mongo';

class QuestionnairesCollection extends Mongo.Collection {
}

export const Questionnaires = new QuestionnairesCollection('questionnaires');