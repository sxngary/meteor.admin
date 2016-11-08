Template.questionForm.onCreated(function(){
    /*Meteor.subscribe('questionCategory');
    Meteor.subscribe('allCategory');
    Meteor.subscribe('allDataElements');
    Meteor.subscribe('getContents');*/
    //Meteor.subscribe('inputFields');
    //Meteor.subscribe('allDataElements');

    var qId = Router.current().params.id;
    Session.set('questionIsLoaded', undefined);
    Session.set('formSubmitted', undefined);

    Meteor.call("questionData",qId,function(error,questionData){
        if(questionData.questionSession != undefined){
            $('textarea#questionHelper').editable({
              key: '1D4B3B3D9A2C4A4G3G3F3J3==',
              inlineMode: false,
              minHeight: 100,
              maxHeight: 100,
             imageUploadURL: '/api/upload',
            }) // Catch image removal from the editor.
            .on('editable.afterRemoveImage', function (e, editor, $img) {
                Meteor.call('removeFroalaImage', $img.attr('src'), function(err, res) {
                    if(err) console.log('image not removed');
                    
                    console.log("image removed!");
                })
            });
            Session.set("questionSession",questionData.questionSession);
            Session.set("responseRR", questionData.questionSession.riskRatio);
            var catName = questionData.catName;
            var questionSet = questionData.questionSet;
            if(questionSet != undefined){
                Session.set("questionSets",questionSet);
                var questionDef = questionData.questionDef;
                var ansValue= questionData.responseAnswer;
                var questionSet = {
                    questionId: qId, 
                    categoryName: catName, 
                    category: questionData.questionSession.category, 
                    key_string: questionData.questionSession.key_string, 
                    questionType: questionData.questionSession.question_type, 
                    gender: questionData.questionSession.gender, 
                    questionDef: questionDef, 
                    resetOptionsIndex: questionData.questionSession.resetOptionsIndex
                };

                if(ansValue != undefined){
                    Session.set("responseAnswer",ansValue);
                    if(questionData.questionSession.dependency.length > 0){
                        var qDependency = questionData.questionSession.dependency[0].dependencyQuestion;
                        var answerSet = questionData.answerSet;
                            if(answerSet.length > 0){
                                Session.set("answerData",answerSet);
                                questionSet['depQuestion'] = qDependency;
                                questionSet['depAnswer'] = questionData.questionSession.dependency[0].dependencyAnswer;
                            }
                    }
                }
                else{
                    Session.set("responseAnswer",'');
                    Session.set("answerData",'');
                }
                Session.set('questionSet', questionSet);
                Session.set('questionIsLoaded', true);
            } 
        }
    });
});

Template.questionForm.onRendered(function(){
    handleResize();
     tabbing();
     $('INPUT.minicolors').minicolors();

     // add custom validators
     window.ParsleyValidator.addValidator('keystring', 
        function (value, requirement) {
            var pattern = /^[a-zA-Z0-9\_]+$/;
            if (! pattern.test(value) ) {
                return false;
            } else {
                return true;
            }
        }, 2
     )
     .addMessage('en', 'keystring', 'Please type alphabets, numbers and underscore only.');

     window.ParsleyValidator.addValidator('keystring_uniq', 
        function (value, requirement) {
            if (Session.get('questionSet')) {
                var questionSet = Session.get('questionSession');
                var questionId = questionSet._id;
            } else {
                var questionId = null;
            }
            //console.log('questionid:', questionId);
            var questions = Questions.find({key_string: value, deleted: '0'}).fetch();
            //console.log('questions:', questions);

            if (questions.length) {
                if (questions[0]._id === questionId) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }, 1
    )
    .addMessage('en', 'keystring_uniq', 'Already in use. Please enter unique variable name only.');

     Tracker.autorun(function(){
        var questionIsLoaded = Session.get('questionIsLoaded');

        if (questionIsLoaded) {
            $('#questionPopup').openModal({dismissible: false});

            $('#questionAdd').parsley({
                 trigger: 'keyup'
            });
            $('#questionUpdate').parsley({
                 trigger: 'keyup'
            });

            Meteor.setTimeout(function() {
                $('textarea#helper').editable({
                     key: '1D4B3B3D9A2C4A4G3G3F3J3==',
                     inlineMode: false,
                     minHeight: 150,
                     maxHeight: 300,
                     imageUploadURL: '/api/upload',
                 }) // Catch image removal from the editor.
                    .on('editable.afterRemoveImage', function (e, editor, $img) {
                        Meteor.call('removeFroalaImage', $img.attr('src'), function(err, res) {
                            if(err) console.log('image not removed');
                            
                            console.log("image removed!");
                        })
                    });
                $('textarea#questionHelper').editable({
                     key: '1D4B3B3D9A2C4A4G3G3F3J3==',
                     inlineMode: false,
                     minHeight: 150,
                     maxHeight: 300,
                     imageUploadURL: '/api/upload',
                }) // Catch image removal from the editor.
                .on('editable.afterRemoveImage', function (e, editor, $img) {
                    Meteor.call('removeFroalaImage', $img.attr('src'), function(err, res) {
                        if(err) console.log('image not removed');
                        
                        console.log("image removed!");
                    })
                });

            }, 500);
        }
     });
});

Template.questionForm.onDestroyed(function() {
    Session.set('questionIsLoaded', undefined);
    Session.set('formSubmitted', undefined);
    Session.set('deleteAnswer', undefined);
    Session.set('viaQuesForm', true);

    Session.set('questionValue','');
    Session.set('questionSession','');
    Session.set('responseAnswer','');
    Session.set("questionSets","");
    Session.set("answerData","");
    Session.set("questionSet","");
});

quesformTitleDeps = new Tracker.Dependency();
var questionFormHelpers = {
    dataLoaded: function() {
        return Session.get('questionIsLoaded');
    },
    formSubmitted: function() {
        return Session.get('formSubmitted');
    },
    intializeselect:function(elem){
        //initializeSelectBox();
        /*console.log('materialize select');
        console.log('element:', elem);*/
        if (! elem) { return;}
        // materialize select
        Meteor.setTimeout(function(){
            $(elem).material_select();
        }, 500);
    },
    quesHaveOpts: function(quesType) {
        //console.log('quesType:', quesType);
        if (quesType == 4 || quesType == 5 || quesType == 8) {
            return true;
        } else {
            return false;
        }
    },
    dataElementType: function() {
        var questionSess = Session.get("questionSession");
        var dataElem = DataElements.findOne({_id: questionSess.question_type, type: {$in: ['cholesterol', 'alcohol', 'blood_pressure', 'blood_glucose'] } });
        if (dataElem) {
            return dataElem.type;
        }
     },
     equalOrVal: function(val, arg1, arg2) {
        if (val === arg1 || val === arg2) {
            return true;
        } else {
            return false;
        }
     },
     programList: function() {
        var programList = Programs.find({'deleted': '0'}).fetch();
        return programList;
     },

     contentText: function(id) {
        var content = Contents.find({_id: id}).fetch();
        if (content && content.length) {
            return content[0].en;
        }
     },
     displayCategory: function() {
         var category = Category.find({
             parent: '0',
             deleted: '0'
         }).fetch();
         if (category.length > 0) {
             var categoryData = [];
             for (var i = 0; i < category.length; i++) {
                 var subcategoryData = [];
                 var subCategory = Category.find({
                     parent: category[i]._id,
                     deleted: '0'
                 }).fetch();
                 if (subCategory.length > 0) {
                     for (var k = 0; k < subCategory.length; k++) {
                         var subcatName = Contents.find({
                             _id: subCategory[k].cat_name
                         }).fetch();

                         if (! subcatName || ! subcatName.length) {
                            continue;
                         }
                         subcategoryData.push({
                             subCatId: subCategory[k]._id,
                             subcolor: subCategory[k].cat_color,
                             subtitle: subcatName[0].en
                         });
                     }
                 }
                 var catName = Contents.find({
                     _id: category[i].cat_name
                 }).fetch();

                 if (! catName || ! catName.length) {
                    continue;
                 }
                 categoryData.push({
                     catId: category[i]._id,
                     color: category[i].cat_color,
                     title: catName[0].en,
                     subcat: subcategoryData
                 });
             }

             // materialize select
             /*Meteor.setTimeout(function(){
                $("#questionCategory").material_select();
             }, 500);*/
             return categoryData;
         }
     },
     isSelect: function(val1, val2) {
         if (val1 == val2) {
             //initializeSelectBox();
             return 'selected';
         }
     },
     questionSession: function() {
         if (Session.get("questionSession")) {
             return true;
         }
     },
     responseAnswer: function() {
         if (Session.get('responseAnswer')) {
             //initializeSelectBox();
             return Session.get('responseAnswer');
         }
     },
     questionVal: function() {
         if (Session.get('questionValue')) {
            return Session.get('questionValue');
         }
         if (Session.get("questionSession")) {
             var questionSess = Session.get("questionSession");
             var questionDef = Contents.find({
                 _id: questionSess.question
             }).fetch();
             var questionHelper = Contents.find({
                 _id: questionSess.helper
             }).fetch();
             Meteor.subscribe('categoryData', questionSess.category);
             var categoryContId = Category.find({
                 _id: questionSess.category,
                 deleted: '0'
             }).fetch();
             if (categoryContId.length > 0) {
                 var questionCat = Contents.find({
                     _id: categoryContId[0].cat_name
                 }).fetch();
             }
             if(questionDef && questionDef.length > 0 && questionCat && questionCat.length > 0) {
                 questionVal = {
                     questionDef: questionDef[0],
                     questionCat: questionCat[0],
                     type: questionSess.question_type,
                     helper: questionHelper[0]
                 };
                 Session.set("questionValue", questionVal);
                 /*console.log('set questionValue');
                 console.log('questionVal:', questionVal);*/
             }
             return Session.get("questionValue");
         }
     },
     questionType: function() {
        var ret = InputFields.find({ value: { $nin: [0] } }).fetch();
        return ret;
     },
     dataElement: function(){
        var dataElements = DataElements.find({ type: { $nin: [ 'user_input', 'start_recording' ] } }).fetch();
        return dataElements;
     },
     equalVal: function(v1, v2) {
         return v1 == v2;
     },
     questionSet: function() {
         return Session.get("questionSets");
     },
     answerSet: function() {
         if (Session.get("answerData")) {
            return Session.get("answerData");
         }
     },
     checkGender: function(v1) {
         if (v1 == 1) {
             var sex = 'male';
         } else if (v1 == 2) {
             var sex = 'female';
         }
         return sex;
     },
     dotted: function(v1) {
         var dot = '';
         for (var i = 0; i < v1; i++) {
             dot = dot + '-- ';
         }
         return dot;
     },
     questionUpdation: function() {
         if (Session.get("questionSet")) {
             return Session.get("questionSet");
         }
     },
     checkedDependentAnswer: function(val) {
         var sessArr = Session.get('questionSet');
         if (sessArr) {
             var tmpArr = sessArr.depAnswer;
             for (var i = 0; i < tmpArr.length; i++) {
                 if (tmpArr[i].answers == val) {
                     return 'selected';
                 }
             }
         }
     },
     questionBreakdown: function() {
         var allVariable = [];
         if (Session.get('questionSet')) {
             var questionArr = Session.get('questionSet');
             var ansSet = Questions.find({
                 _id: questionArr.questionId
             }).fetch();
             var mainAns = [];

             //console.log("ansSet:", ansSet);
             if (ansSet.length > 0) {
                if(ansSet[0].answers){
                   for (var k = 0; k < ansSet[0].answers.length; k++) {
                     Meteor.subscribe("getAnswer", ansSet[0].answers[k]._id);
                     var ans = Answers.find({
                         _id: ansSet[0].answers[k]._id
                     }).fetch();
                     if (ans.length > 0) {
                         var mainAnswer = Contents.find({
                             _id: ans[0].answer_text
                         }).fetch();
                         mainAns.push({
                             mainAns: mainAnswer[0].en
                         });
                     }
                 } 
                }
                 
             }
             if (questionArr.depQuestion != '') {
                 var questionId = Questions.find({
                     _id: questionArr.depQuestion
                 }).fetch();
                 if (questionId.length > 0) {
                     var dependencyQuestion = Contents.find({
                         _id: questionId[0].question
                     }).fetch();
                     var depQuestion = dependencyQuestion[0].en;
                     var ansArr = [];
                     for (var i = 0; i < questionArr.depAnswer.length; i++) {
                         Meteor.subscribe("getAnswer", questionArr.depAnswer[i].answers);
                         var ans = Answers.find({
                             _id: questionArr.depAnswer[i].answers
                         }).fetch();
                         if (ans.length > 0) {
                             var depAns = Contents.find({
                                 _id: ans[0].answer_text
                             }).fetch();
                             ansArr.push({
                                 depAns: depAns[0].en
                             });
                         }
                     }
                     allVariable.push({
                         questionArr: questionArr,
                         ansArr: mainAns,
                         depQuestion: depQuestion,
                         dependencyAnswer: ansArr
                     });
                 }
             } else {
                 allVariable.push({
                     questionArr: questionArr,
                     ansArr: mainAns
                 });
             }
             return allVariable[0];
         }
     },
     responseRR: function() {
         if (Session.get('responseRR')) {
             //initializeSelectBox();
             return Session.get('responseRR');
         }
     },
     editQuesType: function() {
        if (Session.get("questionSet")) {
            var questionSet = Session.get("questionSet");
            if (questionSet.questionType === "4" || questionSet.questionType === "5") {
                return InputFields.find({ value: { $in: [ 4, 5 ] } }).fetch();
            }
        }
     },
     canEditQuesType: function() {
        if (Session.get("questionSet")) {
            var questionSet = Session.get("questionSet");
            if (questionSet.questionType === "4" || questionSet.questionType === "5") {
                return true;
            }
        } else {
            return true;
        }
     },
    languages: function(){
        return Language.find({}).fetch();
    },
    getText: function(text, elem, rrIndex) {
        if (! text) {
            return;
        }

        if (typeof text === "string") {
            return text;
        }

        var lang = Router.current().params['hash'];
        if (! lang) {
            lang = 'en';
        }
        //console.log('getText.lang:', lang);

        var ret = "";
        if (lang === "en") {
            ret = text["en"];
        } else {
            var checkLang = _.where(text["translation"], {lang: lang});
            if(checkLang.length){
                var index = _.indexOf(_.pluck(text["translation"], "lang"), lang);
                ret = text["translation"] [index] ["text"];
            }
        }

        if (typeof ret === "undefined") {
            ret = "";
        }
        switch(elem) {
            case "quesHelper":
                //console.log("ret:", ret)
                $('#questionHelper').editable("setHTML", ret);
            break;
            case "rrResponse":
                Meteor.setTimeout(function(){
                    $('#rrResponse_' + rrIndex).material_select();
                }, 500);
            break;
        }

        quesformTitleDeps.depend();
        return ret;
    },
    selLang: function() {
        var lang = Router.current().params['hash'];
        if (! lang) {
            lang = 'en';
        }
        return lang;
    }
};

Template.questionForm.helpers(questionFormHelpers);

//resize the screen
function handleResize() {
    var headerHeight = $('.navbar-fixed').outerHeight();
    var footerHeight = $('.page-footer').outerHeight();
    var difference = headerHeight + footerHeight;
    var h = $(window).height() - headerHeight;
    var ch = $(window).height() - difference;
    $('.sidebar').css({
     'height': h + 'px'
    });
    $('.content-right').css({
     'min-height': ch + 'px'
    });
    $('.active-section').css({
     'min-height': ch + 'px'
    });
    $('.content-right.fixed-sidebarbody').css({
     'height': ch + 'px',
     'min-height': 'inherit'
    });
}

//tab related functionality
function tabbing() {   
 $('.horizontalTab').easyResponsiveTabs({
     type: 'default', //Types: default, vertical, accordion
     width: 'auto', //auto or any width like 600px
     fit: true, // 100% fit in a container
     closed: 'accordion', // Start closed if in accordion view
    activate: function(event) { // Callback function if tab is switched
         var $tab = $(this);
         var $info = $('#tabInfo');
         var $name = $('span', $info);
         $name.text($tab.text());
         $info.show();
     }
 });
}