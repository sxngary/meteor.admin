import { Mongo } from 'meteor/mongo';

class AgreementsCollection extends Mongo.Collection {}

export const Agreements = new AgreementsCollection('agreements');