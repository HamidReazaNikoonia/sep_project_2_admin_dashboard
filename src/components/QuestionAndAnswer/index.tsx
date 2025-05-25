// @ts-ignore
import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { green, red } from '@mui/material/colors';

const QuizQuestionCard = ({ questionData }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Question Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-right">
        {questionData.curentQuest.question_title}
      </h2>
      
      {/* Options List */}
      <div className="space-y-4">
        {questionData.curentQuest.options.map((option) => (
          <div
            key={option._id}
            className={`p-4 text-right rounded-xl flex items-center justify-between transition-all
              ${option.isCorrect ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-700'}
              ${option._id === questionData.selectedOptionId ? 'border-4 border-blue-500' : 'border border-gray-200'}
            `}
          >
             {/* Correct Indicator */}
             {option.isCorrect ? (
              <CheckCircleIcon 
                style={{ color: green[500] }} 
                className="ml-2"
              />
            ): (
              <DangerousIcon
              style={{color: red[500]}}
              className="ml-2"
                />
            )}

            {/* Option Text */}
            <span className="text-lg text-right">{option.text}</span>
            
           
          </div>
        ))}
      </div>
      
      {/* Points Indicator */}
      <div className="mt-4 text-right text-gray-500">
        امتیاز سوال: {questionData.curentQuest.points}
      </div>
    </div>
  );
};

// Example usage:
const QuizResults = ({ questions }) => {
  return (
    <div className=" w-full p-4 space-y-8">
      {questions.map((question, index) => (
        <QuizQuestionCard 
          key={index} 
          questionData={question} 
        />
      ))}
    </div>
  );
};

export default QuizResults;