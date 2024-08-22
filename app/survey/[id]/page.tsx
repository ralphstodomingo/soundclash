"use client";

import logoSrc from "@/app/logo.png";
import { useState } from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Type Definitions
type ConditionalQuestion = {
  question: string;
  options?: string[];
  type?: "slider" | "radio";
};

type ConditionalQuestionsMap = Record<string, ConditionalQuestion[]>;

export default function SurveyPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (question: string, value: any) => {
    console.log("eschaton test2", question, value);
    setFormData((prev) => ({ ...prev, [question]: value }));
  };

  const commonQuestions = [
    {
      question:
        "How do you feel about changing the direction you face when a SOUNDCLASHER is playing?",
      options: ["Bad", "Neutral", "Good"],
    },
    {
      question:
        "How would you feel no longer able to attend any other SOUNDCLASH games in the future?",
      options: [
        "Very disappointed",
        "Somewhat disappointed",
        "Not disappointed",
      ],
    },
    {
      question:
        "What type of person do you think would enjoy attending SOUNDCLASH shows the most?",
    },
    {
      question: "How can we improve SOUNDCLASH to better meet your interests?",
    },
    {
      question:
        "How much would you pay to attend a SOUNDCLASH show like this one?",
    },
    { question: "Are there any DJs you recommend for SOUNDCLASH?" },
    {
      question:
        "Are there any DJs pairs you would recommend SOUNDCLASH to pit against each other?",
    },
    {
      question:
        "Are there any other comments or suggestions you'd like to make?",
    },
  ];

  const conditionalQuestions: ConditionalQuestionsMap = {
    "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d": [
      {
        question: "How did you find using the APP?",
        options: ["Easy", "Neutral", "Hard"],
      },
      {
        question:
          "How did voting on which SOUNDCLASHER receives a Power Up using the APP affect your experience of a SOUNDCLASH?",
        type: "slider",
        options: [
          "It made my experience less enjoyable",
          "It would not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about there being no winner announced?",
        options: [
          "It made my experience less enjoyable",
          "It would not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "Should there be a winner that is announced at the end of the game?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the half-time length?",
        options: [
          "I did not like that there was a Half-Time",
          "Too Short",
          "Just Right",
          "Too Long",
        ],
      },
      {
        question: "How do you feel about the length of each turn?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How would you feel if there were two games during the event?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the presenter's commentating?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"], // Assuming you want the scale as slider labels
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
    ],
    "be937b71-7db6-4b4e-8c86-9e706a307078": [
      {
        question:
          "Did you prefer the SOUNDCLASHER'S entrance when they walked in or when they suddenly appeared?",
        options: ["Walked in", "Suddenly Appeared"],
      },
      {
        question: "How did you find using the APP?",
        options: ["Easy", "Neutral", "Hard"],
      },
      {
        question:
          "How did voting for a winner in the first game using the APP affect your experience of a SOUNDCLASH?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being no winner announced in the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How would voting for a winner with your cheering instead of with an APP affect your experience of a SOUNDCLASH?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "Should a SOUNDCLASH game have a winner?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the transition between the two games?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the overall length of the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the half-time length in the second game?",
        options: [
          "I did not like that there was a Half-Time",
          "Too Short",
          "Just Right",
          "Too Long",
        ],
      },
      {
        question:
          "How do you feel about experiencing two games of different lengths in the same event?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the voiceover's commentating during the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "How do you feel about watching SOUNDCLASHERS being interviewed after the game ends?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
    ],
    "91c1eb0c-1741-47d8-9e5b-f5422a00a34a": [
      {
        question:
          "Did you prefer the SOUNDCLASHER'S entrance when they walked in or when they suddenly appeared?",
        options: ["Walked in", "Suddenly Appeared"],
      },
      {
        question:
          "How did voting for a winner based on yours and the crowd's reaction affect your experience of a SOUNDCLASH?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about voting for a winner at the end of a game using a mobile APP?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
      {
        question: "Should a SOUNDCLASH game have a winner?",
        options: ["Yes", "No"],
      },
      {
        question: "How do you feel about the transition between the two games?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the length of each turn in the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question: "How do you feel about the overall length of the first game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the shortening of the length of turns in the second game, compared to the fixed length turns in the first game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about the overall length of the second game?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about the half-time length in the second game?",
        options: [
          "I did not like that there was a Half-Time",
          "Too Short",
          "Just Right",
          "Too Long",
        ],
      },
      {
        question:
          "How do you feel about experiencing two games of different lengths in the same event?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being a voiceover in the first game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question:
          "How do you feel about there being a presenter in the second game?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "Do you prefer there being a voiceover or a presenter?",
        options: ["Voiceover", "Presenter"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the lighting and visual experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate the sound effects and audio experience of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the first game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "On a scale of 1 (being bad) to 5 (being excellent), how would you rate your overall enjoyment of the second game?",
        type: "slider",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        question:
          "How do you feel about watching SOUNDCLASHERS being interviewed after a game ends?",
        options: [
          "It made my experience less enjoyable",
          "It did not affect my experience",
          "It made my experience more enjoyable",
        ],
      },
      {
        question: "How do you feel about the length of the overall event?",
        options: ["Too Short", "Just Right", "Too Long"],
      },
      {
        question:
          "How do you feel about voting for a winner at the end of a game using a mobile APP?",
        options: [
          "It would make my experience less enjoyable",
          "It would not affect my experience",
          "It would make my experience more enjoyable",
        ],
      },
    ],
  };

  const handleSubmit = () => {
    let combinedQuestions = [...commonQuestions];

    // Combine the question arrays based on the survey ID
    if (
      params.id === "5a827b3c-9d16-49ae-9ce2-bdabaf18b58d" ||
      params.id === "be937b71-7db6-4b4e-8c86-9e706a307078" ||
      params.id === "91c1eb0c-1741-47d8-9e5b-f5422a00a34a"
    ) {
      combinedQuestions = [
        ...combinedQuestions,
        ...conditionalQuestions[params.id],
      ];
    }
    // Add other conditions as needed

    // Transform the question array to include the answers
    const combinedData = combinedQuestions.map((item) => ({
      question: item.question,
      answer: formData[item.question] || "",
    }));

    console.log("eschaton", combinedData); // This is your array with questions and answers

    // Submit combinedData to Supabase or process it further as needed
  };

  return (
    <div className="flex flex-col items-center justify-between bg-gray-100 dark:bg-gray-900 max-w-[600px] mx-auto p-4">
      {/* Logo at the Top */}
      <div className="w-full">
        <Image
          className="w-full max-h-48 object-cover rounded-md mb-4"
          src={logoSrc}
          alt="Soundclash"
        />
      </div>
      <div className="w-full">
        <h1 className="text-2xl text-black dark:text-white font-bold mb-4">
          Survey
        </h1>
        <p className="text-black dark:text-white mb-6 text-md">
          Please fill out this quick survey about your experience at SOUNDCLASH.
        </p>
      </div>

      <div className="space-y-6">
        {/* Common Questions */}
        {commonQuestions.map((item, index) => (
          <div key={index}>
            <p className="text-black dark:text-white mb-2 font-medium">
              {item.question}
            </p>
            {item.options ? (
              <RadioGroup
                name={item.question}
                onChange={(value) => handleChange(item.question, value)}
              >
                {item.options.map((option, optionIndex) => (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={`r${index}-${optionIndex}`}
                      key={`r${index}-${optionIndex}`}
                    />
                    <Label htmlFor={`r${index}-${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <textarea
                className="w-full h-24 p-2 border rounded-md"
                placeholder="Type your answer here..."
                onChange={(e) => handleChange(item.question, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Conditional Questions based on ID */}
        {params.id &&
          conditionalQuestions[params.id]?.map((item, index) => (
            <div key={index}>
              <p className="text-black dark:text-white mb-2 font-medium">
                {item.question}
              </p>
              {item.type === "slider" && (
                <Slider
                  min={1}
                  max={5}
                  onChange={(value) => handleChange(item.question, value)}
                />
              )}

              {item.type !== "slider" && item.options && (
                <RadioGroup
                  name={item.question}
                  onChange={(value) => handleChange(item.question, value)}
                >
                  {item.options.map((option, optionIndex) => (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`r${index}-${optionIndex}`}
                        key={`r${index}-${optionIndex}`}
                      />
                      <Label htmlFor={`r${index}-${optionIndex}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}
        <Button onClick={handleSubmit} disabled={isLoading}>
          Submit
        </Button>
      </div>
    </div>
  );
}
