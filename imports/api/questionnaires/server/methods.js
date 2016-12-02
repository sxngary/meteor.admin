import { Meteor } from 'meteor/meteor';
import { Questionnaires } from '/imports/api/questionnaires/questionnaires';
import { Categories } from '/imports/api/questionnaires/categories';
import { Questions } from '/imports/api/questionnaires/questions';
import { Answers } from '/imports/api/questionnaires/answers';
import { Cache } from '/imports/api/questionnaires/cache';

Meteor.methods({
    insertQuestionnaireCategory: function (form, catId) {
        //console.log('form data::',form);
        if (catId) {
            //console.log("Update data:",form)
            return Categories.update({ _id: catId }, { $set: form });
        } else {
            //console.log("Insert data:",form)
            var id = Categories.insert(form);
            if (id) {
                return id;
            }
        }
    },
    getQuestionnaireCategory: function (id) {
        var questionnaireData = Categories.find({ cat_name: id }).fetch();
        return questionnaireData[0]._id;
    },
    fetchCategoryData: function (id) {
        var category = Categories.findOne({ _id: id });
        if (category.parent != "0") {
            var parentCat = Categories.findOne({ _id: category.parent });
            category.parentVal = parentCat.cat_name;
        }
        return category;
    },
    
    //-------insert questionnaire------rpm----//
    insertQuestionnaire: function (form, catId) {
        //console.log('form data::',form);
        var result = {};
        if (catId) {
            var resultUpdate = Questionnaires.update({ _id: catId }, { $set: form });
            if (resultUpdate) {
                result['status'] = true;
                result['msg'] = 'Questionnaire updated successfully!';
            }
        } else {
            if (form.questionnaireKey) {
                var resultExists = Questionnaires.find({questionnaireKey:form.questionnaireKey}).fetch();
                if (resultExists.length>0) {
                    result['status'] = false;
                    result['msg'] = "Questionnaire name already exist.";    
                }else{
                    var id = Questionnaires.insert(form);
                    if (id) {
                        result['status'] = true;
                        result['msg'] = 'Questionnaire added successfully!';
                        result['id'] = id;
                    }else{
                        result['status'] = false;
                        result['msg'] = "Questionnaire not added successfully!";
                    }    
                }
            }
        }
        return result;    
    },
    insertQuestion: function (form, catId) {
        //console.log('form data::',form);

        // exclude category if empty
        if ("category" in form && !form['category']) {
            delete form['category'];
        }

        if (catId) {
            //console.log("Update data:",form)
            return Questions.update({ _id: catId }, { $set: form });
        } else {
            //console.log("Insert data:",form)
            var id = Questions.insert(form);
            if (id) {
                return id;
            }
        }

    },
    insertAnswer: function (form, catId) {
        //console.log('form data::',form);
        if (catId) {
            //console.log("Update data:",form)
            return Answers.update({ _id: catId }, { $set: form });
        } else {
            //console.log("Insert data:",form)
            var id = Answers.insert(form);
            if (id) {
                return id;
            }
        }
    },
    deleteAnswer: function (quesId, ansId) {
        return Answers.remove({ question: quesId, _id: ansId });
    },
    saveAnswers: function (quesId, answerData, lang) {
        if (!answerData || !answerData.length) {
            return true;
        }

        for (var i = 0; i < answerData.length; i++) {
            var ansID = answerData[i]["ansID"] || undefined;
            var ansLbl = answerData[i]["ansLbl"];
            var ansVal = answerData[i]["ansVal"];
            var ansRank = answerData[i]["ansRank"] || 0;

            var formData = {};
            formData = {
                _id: ansID,
                answer_text: ansLbl,
                answer_value: ansVal,
                question: quesId,
                rank: ansRank
            };
            if (typeof formData._id == "undefined" || ! formData._id.length) {
                delete formData._id;
                Meteor.call("insertAnswer", formData);
            } else {
                Meteor.call("insertAnswer", formData, ansID);
            }
        }
    },
    fetchQuestions: function (id) {
        var question = Questions.find({
            category: id,
            dependency: [],
            $or: [{ deleted: '0' }, { deleted: { $exists: false } }],
        }).fetch();
        questionData = [];

        if (question.length > 0) {

            for (var k = 0; k < question.length; k++) {
                var hier = 0;
                questionData.push({ questionId: question[k]._id, Qtitle: question[k].question, keyString: question[k].key_string, gender: question[k].gender, qType: question[k].question_type, level: hier++ });
                recursive(question[k]._id, hier);
            }
            return questionData;
        }
    },
    fetchAnswers: function (id) {
        var answerData = [];
        var answers = Answers.find({ question: id }).fetch();
        answers = _.sortBy(answers, function (o) {
            return o.rank;
        });

        for (var a = 0; a < answers.length; a++) {
            var index = a + 1;
            answerData.push({
                ansId: answers[a]._id,
                ansLbl: answers[a].answer_text,
                ansVal: answers[a].answer_value,
                index: index,
                ansRank: answers[a].rank
            });
        }
        return answerData;
    },
    questionData: function (id) {
        var question = Questions.findOne({ _id: id });
        if (question) {
            var questionDataArr = {};
            questionDataArr['questionSession'] = question;
            if (question.riskRatio != undefined) {
                questionDataArr['responseRR'] = question.riskRatio;
            }
            var questionCat = Categories.findOne({ _id: question.category });
            if (questionCat) {

                questionDataArr['catName'] = questionCat.cat_name;
                questionDataArr['questionDef'] = question.question;
                var questionSet = Meteor.call("fetchQuestions", question.category);
                if (questionSet) {
                    questionDataArr['questionSet'] = questionSet;
                    var responseAnswer = Meteor.call("fetchAnswers", id);
                    if (responseAnswer) {
                        questionDataArr['responseAnswer'] = responseAnswer;
                    }
                }
                if (question.dependency != '') {
                    var qDependency = question.dependency[0].dependencyQuestion;
                    var dependentAnswer = Meteor.call("fetchAnswers", qDependency);
                    if (dependentAnswer) {
                        questionDataArr['answerSet'] = dependentAnswer;
                    }
                }
                return questionDataArr;
            }
        }
    },
    questionnaireQuestionArray: function (id, multilingual) {
        var questionnaire = Questionnaires.find({ 
            _id: id,
            $or: [{deleted: '0'}, {deleted: {$exists: false} }]
        }).fetch();
        //return questionnaire;
        var allQuestionArray = [];
        if (questionnaire.length > 0) {
            if (questionnaire[0].questions) {
                questionnaire[0].questions = _.sortBy(questionnaire[0].questions, function (o) {
                    return o.rank;
                });
                //console.log('questionnaire.questions:', questionnaire[0].questions);
                for (var i = 0; i < questionnaire[0].questions.length; i++) {
                    var mainCategory = Categories.find({ 
                        _id: questionnaire[0].questions[i].category_id,
                        $or: [{deleted: '0'}, {deleted: {$exists: false} }] 
                    }).fetch();
                    if (mainCategory.length > 0) {
                        if (multilingual === true) {
                            var parentCat = mainCategory[0].cat_name;
                        } else {
                            var parentCat = mainCategory[0].cat_name;
                        }
                    }
                    var mainCatQuestion = [];
                    if (questionnaire[0].questions[i].question) {
                        if (questionnaire[0].questions[i].question.length > 0) {
                            for (var j = 0; j < questionnaire[0].questions[i].question.length; j++) {
                                var mainQuestion = Questions.find({ 
                                    _id: questionnaire[0].questions[i].question[j]._id,
                                    $or: [{deleted: '0'}, {deleted: {$exists: false} }] 
                                     
                                }).fetch();
                                if (mainQuestion != '') {
                                    if (mainQuestion.length > 0) {
                                        if (multilingual === true) {
                                            var Qtitle = mainQuestion[0].question;
                                        } else {
                                            var Qtitle = mainQuestion[0].question;
                                        }

                                        if (multilingual === true) {
                                            var Qhelper = mainQuestion[0].helper;
                                        } else {
                                            var Qhelper = mainQuestion[0].helper;
                                        }
                                    }
                                    if (questionnaire[0].questions[i].question[j].parentQsId) {
                                        var parentQsId = questionnaire[0].questions[i].question[j].parentQsId;
                                        mainCatQuestion.push({
                                            Qtitle: Qtitle,
                                            helper: Qhelper,
                                            level: questionnaire[0].questions[i].question[j].level,
                                            questionId: questionnaire[0].questions[i].question[j]._id,
                                            parentQsId: parentQsId,
                                            questionType: mainQuestion[0].question_type,
                                            dependency: mainQuestion[0].dependency,
                                            gender: mainQuestion[0].gender,
                                            resetOptionsIndex: mainQuestion[0].resetOptionsIndex,
                                            rank: questionnaire[0].questions[i].question[j].rank
                                        });
                                    } else {
                                        mainCatQuestion.push({
                                            Qtitle: Qtitle,
                                            helper: Qhelper,
                                            level: questionnaire[0].questions[i].question[j].level,
                                            questionId: questionnaire[0].questions[i].question[j]._id,
                                            questionType: mainQuestion[0].question_type,
                                            dependency: mainQuestion[0].dependency,
                                            gender: mainQuestion[0].gender,
                                            resetOptionsIndex: mainQuestion[0].resetOptionsIndex,
                                            rank: questionnaire[0].questions[i].question[j].rank
                                        });
                                    }
                                    
                                    mainCatQuestion = _.sortBy(mainCatQuestion, function (o) {
                                        return o.rank;
                                    });
                                }
                            }
                        }
                    }
                    var subCategoryArray = [];
                    if (questionnaire[0].questions[i].subCategories) {

                        for (var k = 0; k < questionnaire[0].questions[i].subCategories.length; k++) {
                            var subCategory = Categories.find({ _id: questionnaire[0].questions[i].subCategories[k].subCategory_id }).fetch();
                            if (subCategory.length > 0) {
                                if (multilingual === true) {
                                    var subCatTitle = subCategory[0].cat_name;
                                } else {
                                    var subCatTitle = subCategory[0].cat_name;
                                }
                            }

                            var SubcatQuestions = [];
                            for (var l = 0; l < questionnaire[0].questions[i].subCategories[k].questions.length; l++) {
                                var subQuestion = Questions.find({ 
                                    _id: questionnaire[0].questions[i].subCategories[k].questions[l]._id, 
                                    $or: [{deleted: '0'}, {deleted: {$exists: false} }]
                                }).fetch();
                                if (subQuestion != '') {
                                    if (subQuestion.length > 0) {
                                        if (multilingual === true) {
                                            var Qtitle = subQuestion[0].question;
                                        } else {
                                            var Qtitle = subQuestion[0].question;
                                        }

                                        if (multilingual === true) {
                                            var Qhelper = subQuestion[0].helper;
                                        } else {
                                            var Qhelper = subQuestion[0].helper;
                                        }
                                    }
                                    if (questionnaire[0].questions[i].subCategories[k].questions[l].parentQsId) {
                                        var parentQsId = questionnaire[0].questions[i].subCategories[k].questions[l].parentQsId;
                                        SubcatQuestions.push({
                                            Qtitle: Qtitle,
                                            helper: Qhelper,
                                            level: questionnaire[0].questions[i].subCategories[k].questions[l].level,
                                            questionId: questionnaire[0].questions[i].subCategories[k].questions[l]._id,
                                            parentQsId: parentQsId,
                                            questionType: subQuestion[0].question_type,
                                            dependency: subQuestion[0].dependency,
                                            gender: subQuestion[0].gender,
                                            resetOptionsIndex: subQuestion[0].resetOptionsIndex
                                        });
                                    } else {
                                        SubcatQuestions.push({
                                            Qtitle: Qtitle,
                                            helper: Qhelper,
                                            level: questionnaire[0].questions[i].subCategories[k].questions[l].level,
                                            questionId: questionnaire[0].questions[i].subCategories[k].questions[l]._id,
                                            questionType: subQuestion[0].question_type,
                                            dependency: subQuestion[0].dependency,
                                            gender: subQuestion[0].gender,
                                            resetOptionsIndex: subQuestion[0].resetOptionsIndex
                                        });
                                    }
                                } else {
                                    break;
                                }
                            }
                            subCategoryArray.push({ subCatTitle: subCatTitle, subCatId: subCategory[0]._id, subCatColor: subCategory[0].cat_color, SubcatQuestions: SubcatQuestions });
                        }
                        allQuestionArray.push({ rank: questionnaire[0].questions[i].rank, index: questionnaire[0].questions[i].main_index, mainCatId: questionnaire[0].questions[i].category_id, parentCat: parentCat, parentCatColor: mainCategory[0].cat_color, parentCatId: questionnaire[0].questions[i].category_id, mainCatQuestion: mainCatQuestion, subCategory: subCategoryArray })
                    } else {
                        allQuestionArray.push({ rank: questionnaire[0].questions[i].rank, index: questionnaire[0].questions[i].main_index, mainCatId: questionnaire[0].questions[i].category_id, parentCat: parentCat, parentCatColor: mainCategory[0].cat_color, parentCatId: questionnaire[0].questions[i].category_id, mainCatQuestion: mainCatQuestion })
                    }


                }
                return allQuestionArray;
            }
        }
    },
    questionUpdate: function (categoryId, newCategoryId, questionId) {
        if (categoryId == newCategoryId) {
            return true;
        }

        var questionnaire = Questionnaires.find({ deleted: '0' }).fetch();
        if (questionnaire.length > 0) {
            for (var i = 0; i < questionnaire.length; i++) {
                if (questionnaire[i].questions) {

                    var newArray = questionRemove(questionnaire[i].questions, categoryId, questionId);
                    if (newArray) {
                        var questionSet = questionInsert(questionnaire[i]._id, newArray, newCategoryId, questionId);

                        if (questionSet) {
                            Questionnaires.update({ _id: questionnaire[i]._id }, { $set: { questions: questionSet } });
                        }

                    }
                }
            }
        }
    },
    
    //----------Questionnaire list------rpm-----//
    questionnaireListing: function () {
        var questionnair = Questionnaires.find({
            $or: [{ deleted: '0' }, { deleted: { $exists: false } }]
        }).fetch();
        if (questionnair.length > 0) {
            //var questionnaireData = [];
            //for (var i = 0; i < questionnair.length; i++) {
            //    questionnaireData.push({
            //        questionnaireId: questionnair[i]._id,
            //        title: questionnair[i].title,
            //        img_name: questionnair[i].image_name
            //    });
            //}

            return questionnair;
        } else {
            return [];
        }
    },
    
    questionnaireData: function (questionnaire_id, multilingual) {
        // return from cache, if available
        var cache = Cache.findOne({ questionnaire_id: questionnaire_id });
        if (typeof cache !== 'undefined') {
            var isValidCache = true;
            var quesUpdated = Questions.find({ modified: { "$gte": cache.createdAt } }).fetch();
            if (quesUpdated.length) {
                isValidCache = false;
                Cache.remove({ questionnaire_id: questionnaire_id });
            }

            var categoryUpdated = Categories.find({ modified: { "$gte": cache.createdAt } }).fetch();
            if (categoryUpdated.length) {
                isValidCache = false;
                Cache.remove({ questionnaire_id: questionnaire_id });
            }

            var questionnaireUpdated = Questionnaires.find({ _id: questionnaire_id, modified: { "$gte": cache.createdAt } }).fetch();
            if (quesUpdated.length) {
                isValidCache = false;
                Cache.remove({ questionnaire_id: questionnaire_id });
            }

            if (isValidCache) {
                return cache.data;
            }
        }

        // find result in normal way
        var returnArr = {};
        var result = Meteor.call('questionnaireQuestionArray', questionnaire_id, multilingual);
        var questionnaire = Questionnaires.find({ _id: questionnaire_id }).fetch();
        if (questionnaire.length > 0) {
            returnArr.questionnaireName = questionnaire[0].title;
        }

        var finalArr = [];
        var mulChoiceQues = [];
        var num = 0;
        if (result) {
            for (var k = 0; k < result.length; k++) {

                for (var n = 0; n < result[k].mainCatQuestion.length; n++) {
                    var quesType = result[k].mainCatQuestion[n].questionType;
                    if (quesType == '4' || quesType == '5' || quesType == '8') {
                        //var answerSet = Meteor.call("questionAnswer",result[k].mainCatQuestion[n].questionId,true);
                        var answerSet = [];
                        mulChoiceQues.push(result[k].mainCatQuestion[n].questionId);
                    } else {
                        var answerSet = [];
                    }
                    finalArr.push({
                        qIndex: num++,
                        categoryName: result[k].parentCat,
                        categoryColor: result[k].parentCatColor,
                        questionsId: result[k].mainCatQuestion[n].questionId,
                        questionTitle: result[k].mainCatQuestion[n].Qtitle,
                        questionHelper: result[k].mainCatQuestion[n].helper,
                        questionType: result[k].mainCatQuestion[n].questionType,
                        dependency: result[k].mainCatQuestion[n].dependency,
                        gender: result[k].mainCatQuestion[n].gender,
                        resetOptionsIndex: result[k].mainCatQuestion[n].resetOptionsIndex,
                        answerSet: answerSet
                    });
                }
                if (result[k].subCategory) {
                    for (var m = 0; m < result[k].subCategory.length; m++) {
                        for (var j = 0; j < result[k].subCategory[m].SubcatQuestions.length; j++) {
                            var quesType = result[k].subCategory[m].SubcatQuestions[j].questionType;
                            if (quesType == '4' || quesType == '5' || quesType == '8') {
                                //var answerSet = Meteor.call("questionAnswer",result[k].subCategory[m].SubcatQuestions[j].questionId,true);
                                var answerSet = [];
                                mulChoiceQues.push(result[k].subCategory[m].SubcatQuestions[j].questionId);
                            } else {
                                var answerSet = [];
                            }
                            finalArr.push({
                                qIndex: num++,
                                categoryName: result[k].subCategory[m].subCatTitle,
                                categoryColor: result[k].subCategory[m].subCatColor,
                                questionsId: result[k].subCategory[m].SubcatQuestions[j].questionId,
                                questionTitle: result[k].subCategory[m].SubcatQuestions[j].Qtitle,
                                questionHelper: result[k].subCategory[m].SubcatQuestions[j].helper,
                                questionType: result[k].subCategory[m].SubcatQuestions[j].questionType,
                                dependency: result[k].subCategory[m].SubcatQuestions[j].dependency,
                                gender: result[k].subCategory[m].SubcatQuestions[j].gender,
                                resetOptionsIndex: result[k].subCategory[m].SubcatQuestions[j].resetOptionsIndex,
                                answerSet: answerSet
                            });
                        }

                    }
                }
            }
        }

        var answerSetArr = Meteor.call("questionAnswerNew", mulChoiceQues, multilingual);

        var contentsArr = [];
        for (var i = 0; i < finalArr.length; i++) {
            var answerSet = _.where(answerSetArr, { questionId: finalArr[i].questionsId })
            if (!answerSet.length) {
                continue;
            }

            answerSet = _.sortBy(answerSet, function (o) {
                return o.rank;
            });
            finalArr[i]["answerSet"] = answerSet;

            /*for (var i2 = 0; i2 < answerSet.length; i2++) {
                finalArr[i]["answerSet"][i2]["index"] = (i2 + 1);
                var answer = answerSet[i2];
                contentsArr.push(answer.ansLbl);
                contentsArr.push(answer.ansVal);
            }*/
        }

        /*var contentsVal = Contents.find({ _id: { $in: contentsArr } }).fetch();
        for (var i = 0; i < finalArr.length; i++) {
            var answerSet = finalArr[i]["answerSet"];
            if (answerSet.length) {
                for (var i2 = 0; i2 < answerSet.length; i2++) {
                    var answer = answerSet[i2];
                    var srchContent = _.where(contentsVal, { _id: answer.ansLbl });
                    if (srchContent.length) {
                        if (multilingual) {
                            answerSet[i2]['ansLbl'] = srchContent[0];
                        } else {
                            answerSet[i2]['ansLbl'] = srchContent[0].en;
                        }
                    }
                    var srchContent = _.where(contentsVal, { _id: answer.ansVal });
                    if (srchContent.length) {
                        if (multilingual) {
                            answerSet[i2]['ansVal'] = srchContent[0];
                        } else {
                            answerSet[i2]['ansVal'] = srchContent[0].en;
                        }
                    }
                }
                finalArr[i]["answerSet"] = answerSet;
            }
        }*/

        returnArr.questionnaireDetail = finalArr;

        // save data in cache
        Cache.insert({ questionnaire_id: questionnaire_id, data: returnArr, createdAt: new Date() });
        return returnArr;
    },
    questionAnswerNew: function (questionId, multilingual) {
        questionId = [].concat(questionId);
        var answers = Answers.find({ question: { $in: questionId } }).fetch();
        var ansArray = [];
        for (var i = 0; i < answers.length; i++) {
            var ans = [answers[i]];
            if (ans.length > 0) {
                //var ansLbl = Contents.find({ _id: ans[0].answer_text }).fetch();
                //var ansVal = Contents.find({ _id: ans[0].answer_value }).fetch();
                if (typeof ans[0].rank == 'undefined' || isNaN(ans[0].rank)) {
                    ans[0].rank = 0;
                }

                ansArray.push({
                    questionId: ans[0].question,
                    ansId: ans[0]._id,
                    ansLbl: ans[0].answer_text,
                    ansVal: ans[0].answer_value,
                    index: (i + 1),
                    rank: ans[0].rank
                });
            }
        }
        return ansArray;
    },
    questionAnswer: function (questionId, multilingual) {
        questionId = [].concat(questionId);
        var answers = Answers.find({ question: { $in: questionId } }).fetch();
        var ansArray = [];
        for (var i = 0; i < answers.length; i++) {
            var ans = [answers[i]];
            if (ans.length > 0) {
                if (typeof ans[0].rank == 'undefined' || isNaN(ans[0].rank)) {
                    ans[0].rank = 0;
                }

                if (multilingual) {
                    ansArray.push({
                        questionId: ans[0].question,
                        ansId: ans[0]._id,
                        ansLbl: ans[0].answer_text,
                        ansVal: ans[0].answer_value,
                        index: (i + 1),
                        rank: ans[0].rank
                    });
                } else {
                    ansArray.push({
                        questionId: ans[0].question,
                        ansId: ans[0]._id,
                        ansLbl: ans[0].answer_text,
                        ansVal: ans[0].answer_value,
                        index: (i + 1),
                        rank: ans[0].rank
                    });
                }
            }
        }
        ansArray = _.sortBy(ansArray, function (o) {
            return o.rank;
        });
        return ansArray;
    },
    userQuestionnaire: function (questionnaire) {
        //console.log("questionnaire:",questionnaire);
        var user = Meteor.users.find({ _id: this.userId }).fetch();
        var question = Questions.findOne({ _id: questionnaire[0].questionId });
        //console.log('question:', question);

        // calculate risk ratio
        var riskVal = 0,
            programId = [];
        if (user[0].profile.birthday) {
            user[0].profile.age = getAge(user[0].profile.birthday);
        }
        if (question && typeof question.riskRatio !== 'undefined' && question.riskRatio.length) {
            for (var i in question.riskRatio) {
                // check gender
                if (question.riskRatio[i]['rrGender'] !== '0' && question.riskRatio[i]['rrGender'] !== user[0].profile.gender) {
                    continue;
                }

                // check age
                var rrAge = question.riskRatio[i]['rrAge'];
                if (rrAge && rrAge.toString().indexOf("-") >= 0) {
                    rrAge = rrAge.split("-");
                    if (rrAge.length !== 2) {
                        continue;
                    }

                    rrAge[0] = parseInt(rrAge[0].trim());
                    rrAge[1] = parseInt(rrAge[1].trim());
                    if (isNaN(rrAge[0]) || isNaN(rrAge[1])) {
                        continue;
                    }

                    if (!(rrAge[0] <= user[0].profile.age && rrAge[1] >= user[0].profile.age)) {
                        continue;
                    }
                } else if (rrAge && rrAge.length) {
                    rrAge = parseInt(rrAge);

                    if (rrAge !== user[0].profile.age) {
                        continue;
                    }
                }
                // end checking age

                var rrValue = question.riskRatio[i]['rrValue'];
                if (typeof rrValue == 'undefined' || isNaN(Number(rrValue))) {
                    continue;
                }

                var answerId = [].concat(questionnaire[0].ansId);
                if (answerId.indexOf(question.riskRatio[i]['rrResponse']) >= 0) {
                    riskVal += rrValue;
                    if (typeof question.riskRatio[i]['rrProgram'] !== 'undefined') {
                        programId.push(question.riskRatio[i]['rrProgram']);
                    }
                }
                /*for (var i2=0; i2<answerId.length; i2++) {
                if (question.riskRatio[i]['rrResponse'] === answerId[i2]) {
                    riskVal += question.riskRatio[i]['rrValue'];
                    if (typeof question.riskRatio[i]['rrProgram'] !== 'undefined') {
                        programId.push(question.riskRatio[i]['rrProgram']);
                    }
                }
                }*/
            }
        }
        //console.log('riskVal:', riskVal);
        questionnaire[0]['riskVal'] = riskVal;
        questionnaire[0]['keyString'] = question.key_string;

        if (user[0].profile.answers) {
            var findMatch = _.where(user[0].profile.answers, { questionId: questionnaire[0].questionId });
            if (findMatch.length > 0) {
                for (var k = 0; k < user[0].profile.answers.length; k++) {

                    if (user[0].profile.answers[k].questionId == findMatch[0].questionId) {
                        user[0].profile.answers[k] = {
                            'questionId': questionnaire[0].questionId,
                            'ansId': questionnaire[0].ansId,
                            'riskVal': questionnaire[0].riskVal,
                            'keyString': question.key_string
                        };
                    }
                }
                Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'profile.answers': user[0].profile.answers } });
            } else {
                user[0].profile.answers.push(questionnaire[0]);
                Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'profile.answers': user[0].profile.answers } });
            }
        } else {
            Meteor.users.update({ _id: Meteor.userId() }, { $set: { 'profile.answers': questionnaire } });
        }

        var ansObj = {
            'questionId': questionnaire[0].questionId,
            'ansId': questionnaire[0].ansId,
            'riskVal': questionnaire[0].riskVal,
            'keyString': questionnaire[0].keyString
        };

        historyData.insert({ user_id: this.userId, answers: ansObj, created: new Date() });

        /*if (programId !== null) {
          var userPrograms = _.where(user[0].profile.disease_program, {pep_id: programId});
          if (!userPrograms || !userPrograms.length) {
            user[0].profile.disease_program.push({pep_id: programId, status: true});
            //console.log('update disease_program:', user[0].profile.disease_program);
            Meteor.users.update({_id:Meteor.userId()}, { $set: {'profile.disease_program': user[0].profile.disease_program} });
          }
        }*/
    },
});

function recursive(id, lvl) {
    lvl + 1;

    var question = Questions.find({ 
        "dependency.dependencyQuestion": id, 
        $or: [{ deleted: '0' }, { deleted: { $exists: false } }], 
    }).fetch();
    if (question.length > 0) {

        for (var k = 0; k < question.length; k++) {
            questionData.push({ questionId: question[k]._id, parentQsId: id, Qtitle: question[k].question, keyString: question[k].key_string, gender: question[k].gender, qType: question[k].question_type, level: lvl });
            recursive(question[k]._id, lvl + 1);

        }
    }
}