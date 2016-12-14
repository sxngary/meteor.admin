import { FlowRouter } from 'meteor/kadira:flow-router';

Template.questionForm.events({
    'click #openModal': function () {
        $("#questionPopup").modal({
            ready: function() {
                //$('textarea#questionHelper').froalaEditor();
            },
	    dismissible: false
        });
        $('#questionPopup').modal("open", {  });
    },
    'click #questionClose': function (event, data) {
		/*Session.set('questionSession','');
	    Session.set('responseAnswer','');
		Session.set("questionSets","");
	    Session.set("answerData","");
	    Session.set("questionSet","");

		 $("#questionnaireTab").removeClass("resp-tab-active");
		 $('#questionnaireContent').removeClass('resp-tab-content-active');
		 $('#questionnaireContent').hide();
		 $('#qQuestionTab').addClass('resp-tab-active');
		 $('#qQuestionContent').addClass('resp-tab-content-active');*/

        $('#questionPopup').modal("close");
        Meteor.setTimeout(function () {
            FlowRouter.go('/questionnaire');
        }, 200);
    },
    'click #addAnswer': function () {
        var responseAnswer;
        if (Session.get('responseAnswer')) {
            responseAnswer = Session.get('responseAnswer');

        } else {
            responseAnswer = [];
        };

        var elementCount = responseAnswer.length;
        responseAnswer.push({
            answerText: '',
            answerLabel: '',
            index: elementCount + 1,
        });
        Session.set('responseAnswer', responseAnswer);
    },
    'click .deleteAnswer': function (event) {
        if (confirm("Are you sure you want to delete?")) {

            var option = $(event.currentTarget).attr("id");
            var totaloption = Session.get('responseAnswer')
            var deloption = option.replace("delAns_", '');

            if (Session.get('deleteAnswer')) {
                var deleteAnswer = Session.get('deleteAnswer');
            } else {
                var deleteAnswer = [];
            }

            for (var i = 0; i < totaloption.length; i++) {
                if (totaloption[i].index == deloption) {
                    totaloption[i].deleted = true;
                    deleteAnswer.push(totaloption[i]);
                    //var result = totaloption.splice([i],1);
                }
            }

            if (Session.get("responseAnswer")) {
                delete Session.keys.responseAnswer;
            }

            Session.set('responseAnswer', totaloption);
            Session.set('deleteAnswer', deleteAnswer);

            if (Session.get('responseAnswer')) {
                Session.set('deleteSuccessMsg', 'Option Field deleted successfully!');
            }

        }
    },
    'submit #questionUpdate': function (event, data) {

        event.preventDefault();
        Session.set('formSubmitted', true);

        var questionSess = Session.get('questionSession'),
            k = 0,
            t = 0,
            j = 0;

        var lang = "en";

        if (questionSess.question_type == 4 || questionSess.question_type == 5 || questionSess.question_type == 8) {
            var ansArr = [];
            var ansSession = Session.get('responseAnswer');
            //console.log('ansSession:', ansSession);
            //console.log('ansSession.length:', ansSession.length);
            var answerData = [];
            for (var m = 1; m <= ansSession.length; m++) {
                var ansID = ansSession[m - 1].ansId;
                var ansLbl = data.find("#answerText_" + m).value;
                var ansVal = data.find("#answerValue_" + m).value;
                var ansRank = parseInt(data.find("#answerRank_" + m).value);

                let ansObj = {
                    questionId: questionSess._id,
                    ansLbl: ansLbl,
                    ansVal: ansVal,
                    ansRank: ansRank
                };
                if (typeof ansID !== "undefined" && ansID.length) {
                    ansObj["ansID"] = ansID;
                }
                answerData.push(ansObj);
            }
            //console.log("answerData:", answerData);
            Meteor.call('saveAnswers', questionSess._id, answerData, lang, function (error) {
            });

            // delete removed answer
            var deleteAnswer = Session.get('deleteAnswer');
            //console.log('deleteAnswer:', deleteAnswer);
            if (deleteAnswer && deleteAnswer.length) {
                for (var i = 0; i < deleteAnswer.length; i++) {
                    Meteor.call('deleteAnswer', questionSess._id, deleteAnswer[i].ansId);
                }
            }
        }

        var questionData = {};
        var dependencyQuestion = [];

        var dependentQuestion = $('#dependency').val();
        questionSess.dependency = [];
        if (dependentQuestion.length && dependentQuestion !== "null") {
            questionSess.dependency.push({ dependencyQuestion: dependentQuestion });
        }
        if (questionSess.dependency.length > 0) {
            var haArr = [];
            $('#dependencyAns :selected').each(function (i, selected) {
                haArr.push({ answers: $(selected).val() });
            });
            dependencyQuestion.push({ dependencyQuestion: questionSess.dependency[0].dependencyQuestion, dependencyAnswer: haArr });
        }

        questionData = {
            _id: questionSess._id,
            question: data.find("#questionDef").value,
            helper: '',//data.find("#questionHelper").value,
            key_string: questionSess.key_string,
            category: data.find("#questionCategory").value,
            dependency: dependencyQuestion,
            question_type: data.find("#element_type").value,
            gender: data.find("#gender").value,
            answers: ansArr,
            createdBy: Meteor.userId()
        };

        if (questionSess.question_type == 4 || questionSess.question_type == 5 || questionSess.question_type == 8) {
            questionData["answers"] = ansArr;
        }

        if (!questionData['category']) {
            delete questionData['category'];
        }

        if (questionData["question_type"] == 4 || questionData["question_type"] == 8) {
            var resetOptionsIndex = $('input[type="radio"][name="answerResetOthers"]:checked').val();
            if (resetOptionsIndex) {
                questionData["resetOptionsIndex"] = resetOptionsIndex;
            }
        }

		/*console.log('questionSess:', questionSess);
		console.log('questionData:', questionData);*/

        Meteor.call("insertQuestion", questionData, questionSess._id, function (error, questionId) {
            if (questionId) {
                Session.set('questionSession', '');
                Session.set('responseAnswer', '');
                Session.set("questionSets", "");
                Session.set("answerData", "");
                Session.set("questionSet", "");
                $('#questionnaireContent').hide();
                $('#questionPopup').modal("close");
                FlowRouter.go('/questionnaire');
            }
        });
        Meteor.call('questionUpdate', questionSess.category, data.find("#questionCategory").value, questionSess._id, function (error, result) {
        });
    },
    'change #questionCategory': function (event, data) {
        event.preventDefault();
        var id = data.find("#questionCategory").value;

        Meteor.call("fetchQuestions", id, function (error, questionData) {
            if (questionData) {
                Session.set("questionSets", questionData);
                //console.log("questionData", questionData)
            } else {
                Session.set("questionSets", undefined);
            }

        });
    },
    'change #dependency': function (event, data) {
        event.preventDefault();
        var id = data.find("#dependency").value;
        Meteor.call("fetchAnswers", id, function (error, answerData) {
            if (answerData) {
                Session.set("answerData", answerData);
                //console.log("answerData",answerData)
            }

        });
    }
});

Template.questionForm.onDestroyed(function(){
    $('.modal-overlay').css('display','none');
});